import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";

const minecraftia = localFont({
  src: "./_fonts/Minecraftia-Regular.ttf"
});

export const metadata: Metadata = {
  title: "Blok-LAB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${minecraftia.className} antialiased`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
