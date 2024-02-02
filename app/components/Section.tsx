export function Section({ children, theme, title, copy }) {

  return (

    <section className="section" section-theme={theme}>

      <div wrapper-type="structure">

        <header className="section-header">

          {title && (
            <h2 className="section-title">{title}</h2>
          )}

          {copy && (
            <p className="section-copy">{copy}</p>
          )}

        </header>

        {children}

      </div>

    </section>

  );

}
