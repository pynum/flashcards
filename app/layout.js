import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Flashcards | Boost Your Learning with AI-Generated Study Materials",
  description: "Revolutionize your study routine with AI Flashcards. Create custom flashcards on any topic using advanced AI technology. Enhance retention, track progress, and learn smarter.",
  keywords: "AI flashcards, study tool, learning assistant, custom flashcards, educational technology, AI-powered learning",
  author: "Ayush Dongardive",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
