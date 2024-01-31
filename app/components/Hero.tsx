import {Link} from '@remix-run/react';
import {Image} from '@shopify/hydrogen';
import type {
  FeaturedCollectionFragment,
} from 'storefrontapi.generated';

export function Hero({collection, theme, height, position}: {
  collection: FeaturedCollectionFragment;
}) {

  if (!collection) return null;

  const image = collection?.image;

  return (

    <section className="hero" hero-theme={theme}>

      {image && (
        <div className="hero-asset">
          <Image
            data={image}
            height={height || 1080}
            width={1920}
          />
        </div>
      )}

      <div className="hero-grid" wrapper-type="structure" hero-position={position || "bottom-left"}>

        <div className="hero-content">

          <h2 className="hero-title">{collection.title}</h2>

          <p className="hero-copy">This is about {collection.title}, the greatest thing ever!</p>

          <div className="hero-cta">

            <Link className="btn-tertiary" button-type="" to={`/collections/${collection.handle}`}>
              CTA of {collection.title}
            </Link>

          </div>

        </div>

      </div>

    </section>

  );

}
