import './globals.css';

export const metadata = {
  title: 'Smart SIP Allocation Dashboard',
  description: 'Professional rule-based mutual fund NAV analytics and SIP allocation dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
