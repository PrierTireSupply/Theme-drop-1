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
  id = 'aside',
  classes = 'dialog',
  dialog = 'default',
  heading,
  children
}: {
  id?: string;
  classes?: string;
  dialog?: string;
  heading: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div id={ id } className={ classes } dialog-type={ dialog }
      aria-modal
      aria-label={ heading }
      role="dialog"
    >
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
