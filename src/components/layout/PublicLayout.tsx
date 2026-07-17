import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import type { IWebsiteSettings } from '@/types';

interface PublicLayoutProps {
  children: React.ReactNode;
  settings?: Partial<IWebsiteSettings> | null;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, settings }) => {
  return (
    <div className="public-theme min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar
        siteName={settings?.siteName}
        logo={settings?.siteLogo}
        navItems={settings?.navigation}
      />

      <main className="flex-1">{children}</main>

      <Footer
        siteName={settings?.siteName}
        logo={settings?.siteLogo}
        description={settings?.siteDescription}
        contact={settings?.contact}
        socialMedia={settings?.socialMedia}
      />
    </div>
  );
};
