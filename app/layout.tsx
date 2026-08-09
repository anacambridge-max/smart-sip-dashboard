import './globals.css';

export const metadata = {
  title: 'Smart SIP Allocation Dashboard',
  description: 'Professional rule-based mutual fund NAV analytics and SIP allocation dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <style>{`.global-portfolio-link{position:fixed;right:16px;bottom:16px;z-index:50}.global-portfolio-link a{display:inline-block;background:#18212f;color:#fff;text-decoration:none;padding:9px 13px;border-radius:9px;font:700 12px system-ui;box-shadow:0 4px 14px rgba(16,24,40,.16)}.cap-card:nth-child(4) .state.bad{font-size:0}.cap-card:nth-child(4) .state.bad:after{content:'INDEX NOT TRACKED';font-size:9px}.fund-click{display:block;width:100%;padding:0;border:0;background:transparent;text-align:left;color:inherit}`}</style>
        <div className="global-portfolio-link"><a href="/portfolio">Portfolio Tracker</a></div>
        {children}
      </body>
    </html>
  );
}
