import { Analytics } from "@vercel/analytics/react"
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="w-screen h-screen">
                <Providers>{children}</Providers>
                <Analytics />
            </body>
        </html>
    );
}
