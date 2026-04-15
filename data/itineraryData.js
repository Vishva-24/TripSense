export const itineraryData = {
  tripTitle: "Kyoto Discovery",
  tripDates: "May 11 - May 13, 2026",
  weatherAlert:
    "Light rain expected on Day 2 evening. Pack a compact rain jacket.",
  packingList: [
    { id: "pack-1", label: "Light rain jacket", checked: true },
    { id: "pack-2", label: "Universal power adapter", checked: false },
    { id: "pack-3", label: "Comfortable walking shoes", checked: false }
  ],
  days: [
    {
      dayNumber: 1,
      title: "Historic Core",
      date: "May 11, 2026",
      activities: [
        {
          id: "day1-act1",
          time: "8:00 AM",
          type: "food",
          title: "Breakfast at Nishiki Market",
          description: "Start with Kyoto-style tamagoyaki and fresh matcha."
        },
        {
          id: "day1-act2",
          time: "10:00 AM",
          type: "landmark",
          title: "Fushimi Inari Shrine Walk",
          description: "Walk through the red torii gates and photo points."
        },
        {
          id: "day1-act3",
          time: "1:30 PM",
          type: "transit",
          title: "Train to Gion District",
          description: "Use local rail pass for a quick transfer to Gion."
        }
      ]
    },
    {
      dayNumber: 2,
      title: "Culture and Tea",
      date: "May 12, 2026",
      activities: [
        {
          id: "day2-act1",
          time: "9:00 AM",
          type: "landmark",
          title: "Kinkaku-ji Temple Visit",
          description: "Visit the Golden Pavilion and nearby gardens."
        },
        {
          id: "day2-act2",
          time: "12:30 PM",
          type: "food",
          title: "Tofu Set Lunch",
          description: "Try a vegetarian-friendly set meal in Arashiyama."
        },
        {
          id: "day2-act3",
          time: "4:00 PM",
          type: "transit",
          title: "Bus to Tea Ceremony Studio",
          description: "Short bus ride to a beginner-friendly tea session."
        }
      ]
    },
    {
      dayNumber: 3,
      title: "Relaxed Finale",
      date: "May 13, 2026",
      activities: [
        {
          id: "day3-act1",
          time: "8:30 AM",
          type: "food",
          title: "Riverside Coffee Stop",
          description: "Slow morning with pastries near Kamo River."
        },
        {
          id: "day3-act2",
          time: "11:00 AM",
          type: "landmark",
          title: "Philosopher's Path Stroll",
          description: "Gentle walk with local craft and snack stops."
        },
        {
          id: "day3-act3",
          time: "3:00 PM",
          type: "transit",
          title: "Transfer to Kyoto Station",
          description: "Head to station and prepare for departure."
        }
      ]
    }
  ]
};
