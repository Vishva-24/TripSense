"use client";

import { TrailCard } from "@/components/ui/trail-card";

export default function TrailCardDemo() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <TrailCard
        title="Embercrest Ridge"
        location="Silverpine Mountains"
        difficulty="Hard"
        creators="1886 by Helen Rowe & Elias Mendez"
        distance="12.4km"
        elevation="870m"
        duration="4h 45m"
        imageUrl="https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop"
        mapImageUrl="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-3JYNLpogg5zknunPABpdOpEjJmZN5R.png&w=320&q=75"
        onDirectionsClick={() => alert("Directions clicked!")}
      />
    </div>
  );
}
