export function Grid({
  children,
  gap,
  desktop,
  tablet,
  mobile
}) {

  return (
    <div className="grid"
      grid-gap={gap}
      grid-desktop={desktop}
      grid-tablet={tablet}
      grid-mobile={mobile}
    >
      {children}
    </div>
  );

}
