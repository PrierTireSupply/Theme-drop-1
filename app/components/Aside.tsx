/**
 * A side bar component with Overlay that works without JavaScript.
 * @example
 * ```jsx
 * <Aside id="search-aside" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  id = 'aside',
}: {
  children?: React.ReactNode;
  heading: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="dialog" aria-modal aria-label={heading} role="dialog">
      <button
        className="dialog-close-area"
        aria-label="close dialog"
        onClick={() => {
          history.go(-1);
          window.location.hash = '';
        }}
      />
      <div className="dialog-content">
        <h3 className="dialog-heading">{heading}</h3>
        <CloseDialog />
        {children}
      </div>
    </div>
  );
}

function CloseDialog() {
  return (
    /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
    <a className="btn-tertiary dialog-close"
      button-type="icon"
      aria-label="close dialog"
      href="#" onChange={() => history.go(-1)}
      role="button"
    >
      <span className="icon">&times;</span>
    </a>
  );
}
