import { Link } from '@remix-run/react';
import { Image } from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
} from 'storefrontapi.generated';

export function Hero({
  theme,
  img,
  height,
  position,
  title,
  copy,
  cta,
  ctaType,
  ctaURL
}) {

  return (

    <section className="hero" hero-theme={theme}>

      {img && (
        <div className="hero-asset">
          <Image
            data={img}
            height={height || 1080}
            width={1920}
          />
          <div className="hero-overlay"></div>
        </div>
      )}

      <div className="hero-grid" wrapper-type="structure" hero-position={position || "bottom-left"}>

        <div className="hero-content">

          {title && (
            <h2 className="hero-title">{title}</h2>
          )}

          {copy && (
            <p className="hero-copy">{copy}</p>
          )}

          <div className="hero-cta">

            <Link className={`btn-${ctaType || "primary"}`} button-type="default" to={ctaURL}>
              {cta}
            </Link>

          </div>

        </div>

      </div>

    </section>

  );

}
