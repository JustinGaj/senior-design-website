import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gimbaled Drone System",
  description: "A lightweight stabilized optical tracker for multi-rotor drones, designed by the Stevens engineering team.",
  openGraph: { title: "Gimbaled Drone System", description: "A stabilized optical tracker for multi-rotor drones.", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
