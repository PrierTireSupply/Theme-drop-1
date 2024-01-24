import { NavLink } from '@remix-run/react';

export function Logo({ size, mode, animate }: HeaderProps) {

  return (
    <div className="logo" logo-size={ size } logo-mode={ mode } logo-animate={ animate }>
      <div className="logo-line-1">Prier</div>
      <div className="logo-line-2">Tire Supply</div>
      <div className="logo-tire">
        <div className="logo-wheel"></div>
      </div>
    </div>
  );
}
