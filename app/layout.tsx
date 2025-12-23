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
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark:bg-slate-950 light:bg-white transition-colors duration-200`}
      >
        <ThemeProvider>
          <AuthProvider>
            <ValueVisibilityProvider>
              <NotificationHandler>
                <MobileNav />
                <div className="flex min-h-screen dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:bg-gradient-to-br light:from-white light:via-gray-50 light:to-gray-100 flex-col md:flex-row">
                  <Sidebar />
                  <main className="flex-1 md:ml-20 mt-16 md:mt-0">
                    <div className="min-h-screen p-4 md:p-8 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 light:bg-gradient-to-br light:from-white light:via-gray-50/50 light:to-gray-100 transition-colors duration-200">
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
