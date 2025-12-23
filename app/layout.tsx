import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationHandler } from "@/components/NotificationHandler";
import { ValueVisibilityProvider } from "@/lib/ValueVisibilityContext";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poupen - Controle de Finanças",
  description: "Aplicação completa de controle de finanças pessoais",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-200`}
      >
        <ThemeProvider>
          <AuthProvider>
            <ValueVisibilityProvider>
              <NotificationHandler>
                <MobileNav />
                <div className="flex min-h-screen flex-col md:flex-row" style={{background: 'var(--bg-primary)'}}>
                  <Sidebar />
                  <main className="flex-1 md:ml-20 mt-16 md:mt-0">
                    <div className="min-h-screen p-4 md:p-8 transition-colors duration-200" style={{background: 'var(--bg-primary)'}}>
                      <div className="max-w-7xl mx-auto">
                        {children}
                      </div>
                    </div>
                  </main>
                </div>
              </NotificationHandler>
            </ValueVisibilityProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
