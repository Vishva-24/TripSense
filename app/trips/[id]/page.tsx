import ItineraryExperience from "@/components/ItineraryExperience";

type TripPageProps = {
  params: {
    id: string;
  };
};

export default function TripItineraryPage({ params }: TripPageProps) {
  return <ItineraryExperience tripId={decodeURIComponent(params.id)} />;
}
