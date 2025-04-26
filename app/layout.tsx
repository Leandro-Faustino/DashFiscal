import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SidebarProvider } from '@/context/sidebar-context';
import { SettingsProvider } from '@/context/settings-context';
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DashFiscal | Conciliação Fiscal Simplificada',
  description: 'Sistema para conciliação fiscal automatizada entre sistemas SAT e Questor. Simplifique validações, identifique divergências e otimize seu tempo.',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon-dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  authors: [
    { name: 'DashFiscal' }
  ],
  keywords: ['conciliação fiscal', 'notas fiscais', 'dashboard contábil', 'SAT', 'Questor'],
  creator: 'DashFiscal'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
          <SidebarProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </SidebarProvider>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}