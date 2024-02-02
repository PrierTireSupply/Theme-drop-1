import { defer, type LoaderFunctionArgs } from '@shopify/remix-oxygen';
import { Await, useLoaderData, Link, type MetaFunction } from '@remix-run/react';
import { Suspense } from 'react';
import { Image, Money } from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';

import { Hero } from '~/components/Hero';
import { Grid } from '~/components/Grid';
import { ProductCard } from '~/components/ProductCard';
import { Section } from '~/components/Section';

export const meta: MetaFunction = () => {
  return [{ title: 'Hydrogen | Home' }];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const {collections} = await storefront.query(FEATURED_COLLECTION_QUERY);
  const featuredCollection = collections.nodes[0];
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);
  return defer({featuredCollection, recommendedProducts});
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();
  return (
    <>

      <Hero
        theme="light overlay"
        img={data.featuredCollection?.image}
        title={data.featuredCollection.title}
        copy={data.featuredCollection.copy || "Hello world, this is copy!"}
        cta={data.featuredCollection.cta || "This is a CTA"}
        ctaURL={`/collections/${data.featuredCollection.handle}`}
      />

      <Section
        title="Recommended Products"
        copy="Hello world, this is copy!"
      >

        <Suspense fallback={<div>Loading...</div>}>
          <Await resolve={data.recommendedProducts}>

            {({products}) => (
              <Grid gap="8/16" desktop="4" tablet="4" mobile="2">
                {products.nodes.map((product) => (
                  <ProductCard
                    key={product.id}
                    layout="grid"
                    url={`/products/${product.handle}`}
                    img={product.images.nodes[0]}
                    imgSize="(min-width: 45em) 20vw, 50vw"
                    imgAlt={product.alt}
                    title={product.title}
                    price={product.priceRange.minVariantPrice}
                  />
                ))}
              </Grid>
            )}

          </Await>
        </Suspense>

      </Section>

      <Hero
        theme="dark overlay"
        height="540"
        img={data.featuredCollection?.image}
        position="bottom-left"
        title={data.featuredCollection.title}
        copy={data.featuredCollection.copy || "Hello world, this is copy!"}
        cta={data.featuredCollection.cta || "This is a CTA"}
        ctaURL={`/collections/${data.featuredCollection.handle}`}
      />

    </>
  );
}

const FEATURED_COLLECTION_QUERY = `#graphql
  fragment FeaturedCollection on Collection {
    id
    title
    image {
      id
      url
      altText
      width
      height
    }
    handle
  }
  query FeaturedCollection($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...FeaturedCollection
      }
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    title
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 1) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
  }
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
