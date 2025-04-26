import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SidebarProvider } from '@/context/sidebar-context';
import { SettingsProvider } from '@/context/settings-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Accounting Dashboard',
  description: 'Modern accounting dashboard for financial management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </SidebarProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}