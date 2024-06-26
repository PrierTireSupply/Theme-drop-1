import { Await } from '@remix-run/react';
import { Suspense } from 'react';

import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';

import { Header, HeaderMenu } from '~/components/Header';

import { Aside } from '~/components/Aside';
import { Footer } from '~/components/Footer';
import { CartMain } from '~/components/Cart';

import {
  PredictiveSearchForm,
  PredictiveSearchResults,
} from '~/components/Search';

export type LayoutProps = {
  cart: Promise<CartApiQueryFragment | null>;
  children?: React.ReactNode;
  footer: Promise<FooterQuery>;
  header: HeaderQuery;
  isLoggedIn: boolean;
};

export function Layout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
}: LayoutProps) {
  return (
    <>
      <Header header={header} cart={cart} isLoggedIn={isLoggedIn} />
      <MobileMenuAside menu={header.menu} shop={header.shop} />
      <CartAside cart={cart} />
      <SearchAside />
      <main>{children}</main>
      <Suspense>
        <Await resolve={footer}>
          {(footer) => <Footer menu={footer.menu} shop={header.shop} />}
        </Await>
      </Suspense>
    </>
  );
}

function CartAside({cart}: {cart: LayoutProps['cart']}) {
  return (
    <Aside id="cart-aside" heading="Cart">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
         }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function SearchAside() {
  return (
    <Aside id="search-aside" heading="Search">
      <div className="predictive-search">
        <PredictiveSearchForm>
          {({fetchResults, inputRef}) => (
            <>
              <input
                ref={inputRef}
                onChange={fetchResults}
                onFocus={fetchResults}
                input-type="full flat"
                name="q"
                aria-label="Search…"
                placeholder="Search…"
                type="search"
              />
              <button className="btn-secondary" button-type="full flat" type="submit">Search</button>
            </>
          )}
        </PredictiveSearchForm>
        <PredictiveSearchResults />
      </div>
    </Aside>
  );
}

function MobileMenuAside({menu, shop}: {
  menu: HeaderQuery['menu'];
  shop: HeaderQuery['shop'];
}) {
  return (
    <Aside id="mobile-menu-aside" classes="dialog" dialog="primary" heading="Categories">

      <HeaderMenu
        menu={menu}
        primaryDomainUrl={shop.primaryDomain.url}
      />

    </Aside>
  );
}
