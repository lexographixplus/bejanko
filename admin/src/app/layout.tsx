import { ClerkProvider, SignedIn, UserButton } from '@clerk/nextjs';
import './globals.css';

export const metadata = { title: 'Mind Substances Admin', description: 'Editorial CMS for Mind Substances' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClerkProvider><html lang="en"><body><header className="topbar"><div><strong>Mind Substances</strong><span>Editorial Admin</span></div><SignedIn><UserButton /></SignedIn></header>{children}</body></html></ClerkProvider>;
}
