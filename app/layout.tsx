import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeepSeek",
  description: "AI Clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ClerkProvider>
          <AppContextProvider>
            <Toaster
              toastOptions={{
                success: { style: { backgroundColor: "black", color: "white" } },
                error: { style: { backgroundColor: "black", color: "white" } },
              }}
            />
            {children}
          </AppContextProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
