import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Murafiq | مُرافِق",
  description: "Case Resolution Platform for Education in Egypt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased min-h-screen bg-civic-canvas text-slate-900">
        {children}
      </body>
    </html>
  );
}
