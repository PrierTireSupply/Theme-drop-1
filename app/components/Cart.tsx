import { Link } from '@remix-run/react';
import { CartForm, Image, Money } from '@shopify/hydrogen';
import type { CartLineUpdateInput } from '@shopify/hydrogen/storefront-api-types';
import type { CartApiQueryFragment } from 'storefrontapi.generated';
import { useVariantUrl } from '~/utils';

type CartLine = CartApiQueryFragment['lines']['nodes'][0];

type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: 'page' | 'aside';
};

export function CartMain({layout, cart}: CartMainProps) {
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount = cart && Boolean(cart.discountCodes.filter((code) => code.applicable).length);
  const className = `cart ${withDiscount ? 'discount' : ''}`;

  return (
    <>
      <CartEmpty hidden={linesCount} layout={layout} />
      <CartDetails cart={cart} layout={layout} />
    </>
  );
}

function CartDetails({layout, cart}: CartMainProps) {
  const cartHasItems = !!cart && cart.totalQuantity > 0;

  return (
    <div className="cart-details">

      <CartLines lines={cart?.lines} layout={layout} />

      {cartHasItems && (
        <CartSummary cost={cart.cost} layout={layout}>
          <CartDiscounts discountCodes={cart.discountCodes} />
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}

    </div>
  );
}

function CartLines({lines, layout}: {
  layout: CartMainProps['layout'];
  lines: CartApiQueryFragment['lines'] | undefined;
}) {

  if (!lines) return null;

  return (
    <ul className="cart-products">
      {lines.nodes.map((line) => (
        <CartLineItem key={line.id} line={line} layout={layout} />
      ))}
    </ul>
  );
}

function CartLineItem({layout, line}: {
  layout: CartMainProps['layout'];
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);

  return (
    <li key={id} className="cart-product">

      <div className="product-card" product-card-type={layout}>

        <div className="product-card-asset">
          {image && (
            <Image
              data={image}
              aspectRatio="1/1"
              height={128}
              width={128}
              alt={title}
              loading="lazy"
            />
          )}
        </div>

        <div className="product-card-content">

          <Link
            className="product-card-title"
            to={lineItemUrl}
            prefetch="intent"
            onClick={() => {if (layout === 'aside') {
              window.location.href = lineItemUrl;
           }}}
          >
            {product.title}
          </Link>

          <CartLinePrice line={line} as="div" />

          {/*
          <ul className="product-card-options">
            {selectedOptions.map((option) => (
              <li key={option.name} className="product-card-option">
                {option.name}: {option.value}
              </li>
            ))}
          </ul>
          */}

          <CartLineQuantity line={line} />

        </div>

      </div>

    </li>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  return (
    <a className="btn-primary" button-type="full" href={checkoutUrl} target="_self">
      Continue to Checkout
    </a>
  );
}

export function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartApiQueryFragment['cost'];
  layout: CartMainProps['layout'];
}) {
  // const className = layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  return (
    <section className="cart-summary" aria-label="Cart Summary">
      <h3 className="cart-summary-title">Total</h3>
      <h3 className="cart-summary-subtitle">Subtotal</h3>
      {cost?.subtotalAmount?.amount ? (
        <Money className="cart-summary-subtotal" data={cost?.subtotalAmount} />
      ): ('-')}
      {children}
    </section>
  );
}

function CartLineRemoveButton({lineIds}: {lineIds: string[]}) {
  return (
    <CartForm route="/cart" action={CartForm.ACTIONS.LinesRemove} inputs={{lineIds}}>
      <button className="btn-secondary" button-type="small" type="submit">Remove</button>
    </CartForm>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <>

      <div className="product-card-qty">
        {quantity}
      </div>

      <div className="product-card-update">

        <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
          <button
            className="btn-secondary"
            button-type="icon-small"
            aria-label="Increase quantity"
            name="increase-quantity"
            value={nextQuantity}
          >
            &#43;
          </button>
        </CartLineUpdateButton>

        <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
          <button
            className="btn-secondary"
            button-type="icon-small"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            name="decrease-quantity"
            value={prevQuantity}
          >
            &#8722;
          </button>
        </CartLineUpdateButton>

        <CartLineRemoveButton lineIds={[lineId]} />

      </div>

    </>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;}) {
    if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

    const moneyV2 =
      priceType === 'regular'
        ? line.cost.totalAmount
        : line.cost.compareAtAmountPerQuantity;

    if (moneyV2 == null) {
      return null;
    }

    return (
      <Money className="product-card-price" withoutTrailingZeros {...passthroughProps} data={moneyV2} />
    );
}

export function CartEmpty({
  hidden = false,
  layout = 'aside',
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  return (
    <div className="cart-empty" hidden={hidden}>

      <br />
      <p>Looks like you haven't added anything yet, let's get you started!</p>
      <br />

      <Link
        className="btn-primary"
        button-type="full"
        to="/collections"
        onClick={() => {
          if (layout === 'aside') {
            window.location.href = '/collections';
         }
       }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}

function CartDiscounts({discountCodes}: {
  discountCodes: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <>

      <div className="cart-summary-discount" hidden={!codes.length}>
        <h3 className="cart-summary-subtitle">Discount(s)</h3>
        <UpdateDiscountForm>
          <div className="cart-summary-discount-codes">
            <code>{codes?.join(', ')}</code>
            <button className="btn-secondary" button-type="small">Remove</button>
          </div>
        </UpdateDiscountForm>
      </div>

      <UpdateDiscountForm discountCodes={codes}>
        <div className="cart-summary-discount-add">
          <input input-type="full flat" type="text" name="discountCode" aria-label="Discount code" placeholder="Discount code" />
          <button className="btn-secondary" button-type="full flat" type="submit">Apply</button>
        </div>
      </UpdateDiscountForm>

    </>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
     }}
    >
      {children}
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}
