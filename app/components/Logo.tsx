export function Logo({ size, mode, animate }) {

  return (
    <h1 className="logo" logo-size={size} logo-mode={mode} logo-animate={animate}>
      <span className="logo-line-1">Prier</span>
      <span className="logo-line-2">Tire Supply</span>
      <span className="logo-tire">
        <span className="logo-wheel"></span>
      </span>
    </h1>
  );

}
