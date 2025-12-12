import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationHandler } from "@/components/NotificationHandler";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950`}
      >
        <AuthProvider>
          <NotificationHandler>
            <MobileNav />
            <div className="flex min-h-screen bg-white dark:bg-gray-950 flex-col md:flex-row">
              <Sidebar />
              <main className="flex-1 md:ml-20 mt-16 md:mt-0">
                <div className="min-h-screen p-4 md:p-8 bg-white dark:bg-gray-950">
                  <div className="max-w-7xl mx-auto">
                    {children}
                  </div>
                </div>
              </main>
            </div>
          </NotificationHandler>
        </AuthProvider>
      </body>
    </html>
  );
}
