import {Suspense} from 'react';
import {defer, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {
  Await,
  Link,
  useLoaderData,
  type MetaFunction,
  type FetcherWithComponents,
} from '@remix-run/react';
import type {
  ProductFragment,
  ProductVariantsQuery,
  ProductVariantFragment,
  RecommendedProductsQuery,
} from 'storefrontapi.generated';
import {
  Image,
  Money,
  VariantSelector,
  type VariantOption,
  getSelectedProductOptions,
  CartForm,
} from '@shopify/hydrogen';
import type {
  CartLineInput,
  SelectedOption,
} from '@shopify/hydrogen/storefront-api-types';
import {getVariantUrl} from '~/utils';

import { Section } from '~/components/Section';
import { Grid } from '~/components/Grid';
import { ProductCard } from '~/components/ProductCard';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.product.title ?? ''}`}];
};

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  const selectedOptions = getSelectedProductOptions(request).filter(
    (option) =>
      // Filter out Shopify predictive search query params
      !option.name.startsWith('_sid') &&
      !option.name.startsWith('_pos') &&
      !option.name.startsWith('_psq') &&
      !option.name.startsWith('_ss') &&
      !option.name.startsWith('_v') &&
      // Filter out third party tracking params
      !option.name.startsWith('fbclid'),
  );

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  // await the query for the critical product data
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions},
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option: SelectedOption) =>
        option.name === 'Title' && option.value === 'Default Title',
    ),
  );

  if (firstVariantIsDefault) {
    product.selectedVariant = firstVariant;
  }
  else {
    // if no selected variant was returned from the selected options,
    // we redirect to the first variant's url with it's selected options applied
    if (!product.selectedVariant) {
      throw redirectToFirstVariant({product, request});
    }
  }

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deffered query resolves, the UI will update.
  const variants = storefront.query(VARIANTS_QUERY, {
    variables: {handle},
  });

  // testing
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);

  return defer({product, variants, recommendedProducts});
}

function redirectToFirstVariant({product,request}: {
  product: ProductFragment;
  request: Request;
}) {
  const url = new URL(request.url);
  const firstVariant = product.variants.nodes[0];

  return redirect(
    getVariantUrl({
      pathname: url.pathname,
      handle: product.handle,
      selectedOptions: firstVariant.selectedOptions,
      searchParams: new URLSearchParams(url.search),
    }),
    {
      status: 302,
    },
  );
}

export default function Product() {
  const {product, variants} = useLoaderData<typeof loader>();
  const {selectedVariant} = product;
  const data = useLoaderData<typeof loader>();
  return (

    <>

    <Section theme="pdp">

      <Grid gap="pdp" desktop="pdp" tablet="pdp" mobile="1">

        <ProductImage image={selectedVariant?.image} />

        <ProductMain
          selectedVariant={selectedVariant}
          product={product}
          variants={variants}
        />

      </Grid>

    </Section>

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
                  imgAlt={product.title}
                  title={product.title}
                  price={product.priceRange.minVariantPrice}
                />
              ))}
            </Grid>
          )}

        </Await>
      </Suspense>

    </Section>

    </>

  );
}

function ProductImage({image}: {image: ProductVariantFragment['image']}) {

  if (!image) {
    return <div className="product-details-image" />;
  }

  return (
    <div className="product-details-image">
      <Image
        alt={image.altText || 'Product Image'}
        aspectRatio="1/1"
        data={image}
        key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
    </div>
  );

}

function ProductMain({selectedVariant,product,variants}: {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedVariant'];
  variants: Promise<ProductVariantsQuery>;
}) {

  const {title, descriptionHtml} = product;

  return (

    <div className="product-details">

      <h2 className="product-details-title">{title}</h2>

      <ProductPrice selectedVariant={selectedVariant} />

      <Suspense fallback={
        <ProductForm
          product={product}
          selectedVariant={selectedVariant}
          variants={[]}
        />
      }>
        <Await
          errorElement="There was a problem loading product variants"
          resolve={variants}
        >
          {(data) => (
            <ProductForm
              product={product}
              selectedVariant={selectedVariant}
              variants={data.product?.variants.nodes || []}
            />
          )}
        </Await>
      </Suspense>

      <h3 className="product-details-subtitle">
        Description
      </h3>

      <div className="product-details-description"
        dangerouslySetInnerHTML={{__html: descriptionHtml}}
      />

    </div>

  );
}

function ProductPrice({selectedVariant}: {
  selectedVariant: ProductFragment['selectedVariant'];
}) {
  return (
    <div className="product-details-price">
      {selectedVariant?.compareAtPrice ? (
        <>
          <h3>Sale</h3>
          <div className="product-details-sale">
            {selectedVariant ? <Money className="sale" data={selectedVariant.price} /> : null}
            <s>
              <Money className="strike" data={selectedVariant.compareAtPrice} />
            </s>
          </div>
        </>
      ) : (
        selectedVariant?.price && <Money className="normal" data={selectedVariant?.price} />
      )}
    </div>
  );
}

function ProductForm({product,selectedVariant,variants}: {
  product: ProductFragment;
  selectedVariant: ProductFragment['selectedVariant'];
  variants: Array<ProductVariantFragment>;
}) {
  return (
    <div className="product-details-form">
      <VariantSelector
        handle={product.handle}
        options={product.options}
        variants={variants}
      >
        {({option}) => <ProductOptions key={option.name} option={option} />}
      </VariantSelector>

      <AddToCartButton
        disabled={!selectedVariant || !selectedVariant.availableForSale}
        onClick={() => {
          window.location.href = window.location.href + '#cart-aside';
        }}
        lines={
          selectedVariant? [{
            merchandiseId: selectedVariant.id,
            quantity: 1,
          },]: []
        }
      >
        {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
      </AddToCartButton>
    </div>
  );
}

function ProductOptions({option}: {option: VariantOption}) {
  return (

    <div className="product-details-options" key={option.name}>

      <h3 className="product-details-options-title">
        {option.name}
      </h3>

      <ul className="product-details-options-list">
        {option.values.map(({value, isAvailable, isActive, to}) => {
          return (
            <li className="product-details-option" key={option.name + value}>
              <Link
                className={
                  (isActive ? 'btn-secondary' : 'btn-tertiary') +
                  (isAvailable ? '' : ' disabled')
                }
                button-type="small"
                prefetch="intent"
                preventScrollReset
                replace
                to={to}
              >
                {value}
              </Link>
            </li>
          );
        })}
      </ul>

    </div>

  );
}

function AddToCartButton({analytics,children,disabled,lines,onClick}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: CartLineInput[];
  onClick?: () => void;
}) {
  return (
    <CartForm route="/cart" inputs={{lines}} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          <button
            className="btn-primary"
            button-type="full"
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      values
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 1) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
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
    products(first: 4, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
