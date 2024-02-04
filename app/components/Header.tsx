import { Await, NavLink } from '@remix-run/react';
import { Suspense } from 'react';
import type { HeaderQuery } from 'storefrontapi.generated';
import type { LayoutProps } from './Layout';
import { useRootLoaderData } from '~/root';
import { Logo } from '~/components/Logo';

type HeaderProps = Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>;
type Viewport = 'desktop' | 'mobile';

export function Header({header, isLoggedIn, cart}: HeaderProps) {
  const {shop, menu} = header;
  return (
    <header className="header">

      <nav className="header-menu" role="navigation">

        <NavLink className="header-logo" prefetch="intent" to="/" end>
          <Logo size="small" mode="light" animate="false" />
        </NavLink>

        <HeaderMenuToggle />

        <div className="header-spacer"></div>

        <NavLink className="header-menu-item" prefetch="intent" to="/account">
          {isLoggedIn ? 'Account' : 'Sign in'}
        </NavLink>

        <SearchToggle />

        <CartToggle cart={cart} />

      </nav>

    </header>
  );
}

export function HeaderMenu({children, menu, primaryDomainUrl}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
}) {
  const {publicStoreDomain} = useRootLoaderData();
  const className = `primary-menu`;

  function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.location.href = event.currentTarget.href;
  }

  return (
    <nav className={className} role="navigation">

      {/*<NavLink
        className="primary-menu-item"
        end
        onClick={closeAside}
        prefetch="intent"
        to="/"
      >
        Home
      </NavLink>*/}

      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <NavLink
            className="primary-menu-item"
            end
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            to={url}
          >
            {item.title}
          </NavLink>
        );
     })}
      {children}
    </nav>
  );
}

function HeaderMenuToggle() {
  return (
    <a href="#mobile-menu-aside" className="header-menu-item" role="button">
      Categories
    </a>
  );
}

function SearchToggle() {
  return <a href="#search-aside" className="header-menu-item" role="button">Search</a>;
}

function CartBadge({count}: {count: number}) {
  return (
    <a href="#cart-aside" className="header-menu-item cart" role="button">
      Cart {count > 0 ? <span className="cart-count">{count}</span> : null}
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
       }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
   },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
   },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
   },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
   },
  ],
};
