import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "EdTech LMS",
  description: "Modern, responsive frontend for an EdTech Learning Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-gray-50 text-slate-800`}>
        {children}
      </body>
    </html>
  );
}
