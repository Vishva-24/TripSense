import { Manrope, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { TripPlannerProvider } from "@/context/TripPlannerContext";
import Navbar from "@/components/Navbar";

const headingFont = Manrope({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["600", "700", "800"]
});

const bodyFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

export const metadata = {
  title: "TripSense",
  description: "AI-powered travel itinerary generator MVP"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>
        <TripPlannerProvider>
          <Navbar />
          <div className="pt-16">{children}</div>
        </TripPlannerProvider>
      </body>
    </html>
  );
}
