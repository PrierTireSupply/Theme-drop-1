import { Link } from '@remix-run/react';
import { Image, Money } from '@shopify/hydrogen';

export function ProductCard({
  layout,
  url,
  img,
  imgSize,
  imgAlt,
  title,
  price
}) {

  return (

    <div className="product-card" product-card-type={layout}>

      {img && (
        <Link className="product-card-asset" to={url}>
          <Image
            data={img}
            aspectRatio="1/1"
            sizes={imgSize}
            alt={imgAlt}
          />
        </Link>
      )}

      <div className="product-card-content">

        <Link className="product-card-title" to={url}>
          {title}
        </Link>

        <Money className="product-card-price" data={price} />

      </div>

    </div>

  );

}
