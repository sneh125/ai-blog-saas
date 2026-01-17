import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BlogAI - AI-Powered SEO Blog Generator',
  description: 'Generate high-ranking, SEO-optimized blog posts in seconds using advanced AI technology.',
  keywords: 'AI blog generator, SEO content, blog writing, content marketing, GPT-4',
  authors: [{ name: 'BlogAI Team' }],
  openGraph: {
    title: 'BlogAI - AI-Powered SEO Blog Generator',
    description: 'Generate high-ranking, SEO-optimized blog posts in seconds using advanced AI technology.',
    type: 'website',
    url: 'https://blogai.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlogAI - AI-Powered SEO Blog Generator',
    description: 'Generate high-ranking, SEO-optimized blog posts in seconds using advanced AI technology.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}