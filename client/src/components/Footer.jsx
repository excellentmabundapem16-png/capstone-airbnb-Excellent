/**
 * Footer.jsx – static footer (4 link columns) + copyright footer with social
 * links, language selector and currency selector.
 */
const COLUMNS = [
  {
    title: 'Support',
    links: ['Help Centre', 'AirCover', 'Anti-discrimination', 'Disability support', 'Cancellation options', 'Report neighbourhood concern'],
  },
  {
    title: 'Hosting',
    links: ['Airbnb your home', 'AirCover for Hosts', 'Hosting resources', 'Community forum', 'Hosting responsibly', 'Airbnb-friendly apartments'],
  },
  {
    title: 'Airbnb',
    links: ['Newsroom', 'New features', 'Careers', 'Investors', 'Gift cards', 'Airbnb.org emergency stays'],
  },
  {
    title: 'Inspiration',
    links: ['Featured stays', 'Travel collections', 'Wishlists', 'Experiences', 'Adventure travel', 'Last-minute deals'],
  },
];

export default function Footer() {
  return (
    <>
      <footer className="site-footer">
        <div className="footer-cols">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" onClick={(e) => e.preventDefault()}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
      <div className="copyright-footer">
        <div className="copyright-left">
          <span>© 2026 Airbnb Clone, Inc.</span>
          <span className="dot">·</span>
          <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
          <span className="dot">·</span>
          <a href="#" onClick={(e) => e.preventDefault()}>Sitemap</a>
          <span className="dot">·</span>
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
        </div>
        <div className="copyright-right">
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="X">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.2l7.3-8.3L1.6 2H8l4.4 5.9L18.9 2zm-1.1 18h1.7L7.1 3.9H5.3L17.8 20z"/></svg>
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
          </a>
          <span className="dot">|</span>
          <label className="select-wrap">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3 3.6 3 16.4 0 20M12 2c-3 3.6-3 16.4 0 20"/></svg>
            <select aria-label="Language" defaultValue="English (US)">
              {['English (US)', 'Français', 'Afrikaans', 'isiZulu', 'Deutsch'].map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label className="select-wrap">
            <span className="currency-symbol">R</span>
            <select aria-label="Currency" defaultValue="ZAR">
              {['ZAR', 'USD', 'EUR', 'JPY', 'GBP'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </div>
    </>
  );
}
