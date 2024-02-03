import {json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {
  Pagination,
  getPaginationVariables,
  Image,
  Money,
} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/utils';

import { Section } from '~/components/Section';
import { Grid } from '~/components/Grid';
import { ProductCard } from '~/components/ProductCard';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

export async function loader({request, params, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  if (!handle) {
    return redirect('/collections');
  }

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle, ...paginationVariables},
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }
  return json({collection});
}

export default function Collection() {

  const {collection} = useLoaderData<typeof loader>();

  return (

    <Section theme="plp" title={collection.title} copy={collection.description}>

      <Pagination connection={collection.products}>
        {({nodes, isLoading, PreviousLink, NextLink}) => (
          <>

            <PreviousLink>
              {isLoading ? 'Loading...' : <span>Load previous</span>}
            </PreviousLink>

            <ProductsGrid products={nodes} />

            <NextLink>
              {isLoading ? 'Loading...' : <span>Load more</span>}
            </NextLink>

          </>
        )}
      </Pagination>

    </Section>

  );
}

function ProductsGrid({products}: {products: ProductItemFragment[]}) {

  return (

    <Grid gap="8/16" desktop="4" tablet="4" mobile="2">

      {products.map((product, index) => {
        return (
          <ProductCard
            key={product.id}
            layout="grid"
            url={useVariantUrl(product.handle, product.variants.nodes[0].selectedOptions)}
            img={product.featuredImage}
            imgSize="(min-width: 45em) 20vw, 50vw"
            imgAlt={product.title}
            title={product.title}
            price={product.priceRange.minVariantPrice}
          />
        );
      })}

    </Grid>

  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 1) {
      nodes {
        selectedOptions {
          name
          value
        }
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
