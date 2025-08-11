import "./globals.css";

export const metadata = { title: "KandleBoard", description: "Financial Dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-b from-bg to-bg-soft">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}
