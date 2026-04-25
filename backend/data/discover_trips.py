"""
Statically ported discover trips data from lib/discoverTrips.ts.
Do not edit manually — re-run convert_discover_trips.py to regenerate.
"""
from __future__ import annotations
from typing import Optional

DISCOVER_TRIPS: list[dict] = [
  {
    "slug": "tokyo-japan-7-days",
    "title": "Tokyo, Japan",
    "location": "Tokyo, Japan",
    "duration": "7 Days",
    "vibe": "Neon & Noodles",
    "persona": "Concrete Jungle Explorer",
    "badgeClass": "bg-sky-100 text-sky-800",
    "image": "https://picsum.photos/seed/tokyo-japan-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Into the Neon",
        "description": "Arrive and dive straight into Shinjuku. Walk through the glowing streets of Kabukicho and eat dinner in the tiny, smoke-filled alleys of Omoide Yokocho (Memory Lane)."
      },
      {
        "day": 2,
        "title": "The Youth Culture Hub",
        "description": "Cross the world-famous Shibuya Scramble. Spend the afternoon exploring the extreme teenage fashion of Takeshita Street in Harajuku and grab world-class tonkotsu ramen at Ichiran."
      },
      {
        "day": 3,
        "title": "Old Tokyo",
        "description": "Step back in time in Asakusa. Visit the ancient Senso-ji Temple, shop for traditional crafts on Nakamise Street, and eat fresh melon pan."
      },
      {
        "day": 4,
        "title": "The Tech & Anime Capital",
        "description": "Explore Akihabara. Play in massive multi-story arcades, shop for vintage electronics, and visit a quirky themed cafe."
      },
      {
        "day": 5,
        "title": "Sushi & Luxury",
        "description": "Start early at the Tsukiji Outer Market for the freshest street-food sushi in the world, then spend the afternoon walking the high-end, pristine streets of Ginza."
      },
      {
        "day": 6,
        "title": "The Digital Future",
        "description": "Head to the man-made island of Odaiba. Walk through the mind-bending digital art installations at teamLab Planets and see the life-sized Gundam statue."
      },
      {
        "day": 7,
        "title": "Final Bowls & Departure",
        "description": "Pick up last-minute snacks at a massive Don Quijote department store, grab one last bowl of tsukemen (dipping noodles), and head to the airport."
      }
    ]
  },
  {
    "slug": "new-york-city-usa-5-days",
    "title": "New York City, USA",
    "location": "New York City, USA",
    "duration": "5 Days",
    "vibe": "Non-Stop Energy",
    "persona": "Concrete Jungle Explorer",
    "badgeClass": "bg-sky-100 text-sky-800",
    "image": "https://picsum.photos/seed/new-york-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Classic Manhattan",
        "description": "Grab an everything bagel and walk through Central Park. In the afternoon, head down to Midtown to see Times Square and get a classic $1 NY pizza slice."
      },
      {
        "day": 2,
        "title": "Art & Elevated Parks",
        "description": "Spend the morning at the MoMA or the Met. Later, walk the High Line (an elevated park built on old train tracks) down to the Chelsea Market for incredible tacos."
      },
      {
        "day": 3,
        "title": "Villages & Jazz",
        "description": "Wander the tree-lined streets and brownstones of Greenwich Village and Soho. Catch an intimate, late-night jazz set at the Village Vanguard."
      },
      {
        "day": 4,
        "title": "The Brooklyn Crossing",
        "description": "Walk across the iconic Brooklyn Bridge at sunrise. Spend the day exploring the cobblestone streets of DUMBO, eating at Time Out Market, and exploring Williamsburg's vintage shops."
      },
      {
        "day": 5,
        "title": "Skyline Views",
        "description": "Take the elevator up to the Top of the Rock or the Edge for a massive panoramic view of the skyline before heading out."
      }
    ]
  },
  {
    "slug": "mexico-city-mexico-6-days",
    "title": "Mexico City, Mexico",
    "location": "Mexico City, Mexico",
    "duration": "6 Days",
    "vibe": "Culture & Cuisine",
    "persona": "Concrete Jungle Explorer",
    "badgeClass": "bg-sky-100 text-sky-800",
    "image": "https://picsum.photos/seed/mexico-city-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Historic Center",
        "description": "Stand in the massive Zocalo square. Visit the Metropolitan Cathedral and the stunning Palacio de Bellas Artes. Eat legendary Tacos al Pastor at El Huequito."
      },
      {
        "day": 2,
        "title": "Castles & Parks",
        "description": "Walk through the massive Chapultepec Park and visit the only royal castle in the Americas. Spend the evening in the upscale Polanco neighborhood."
      },
      {
        "day": 3,
        "title": "The Blue House",
        "description": "Head south to the bohemian neighborhood of Coyoacan. Visit the Frida Kahlo Museum and drink traditional cafe de olla in the vibrant town squares."
      },
      {
        "day": 4,
        "title": "The City of the Gods",
        "description": "Take a half-day trip just outside the city to climb the massive, ancient Pyramids of the Sun and Moon at Teotihuacan."
      },
      {
        "day": 5,
        "title": "Modern Flavors",
        "description": "Spend the day walking the lush, tree-lined streets of Roma Norte and Condesa. Do a self-guided food tour, stopping at Mercado Roma and Churreria El Moro."
      },
      {
        "day": 6,
        "title": "High-Flying Culture",
        "description": "Finish the trip with the wild, high-energy spectacle of a Lucha Libre wrestling match at Arena Mexico before grabbing late-night mezcal."
      }
    ]
  },
  {
    "slug": "seoul-south-korea-6-days",
    "title": "Seoul, South Korea",
    "location": "Seoul, South Korea",
    "duration": "6 Days",
    "vibe": "K-Culture & Tech",
    "persona": "Concrete Jungle Explorer",
    "badgeClass": "bg-sky-100 text-sky-800",
    "image": "https://picsum.photos/seed/seoul-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Palaces & Pancakes",
        "description": "Rent a traditional Hanbok and walk through the massive Gyeongbokgung Palace. Head to Gwangjang Market for crispy mung bean pancakes and street food."
      },
      {
        "day": 2,
        "title": "Viewpoints & Skincare",
        "description": "Take the cable car up to N Seoul Tower for city views. Spend the afternoon in Myeongdong, the global capital of skincare and cosmetics shopping."
      },
      {
        "day": 3,
        "title": "Indie Youth Culture",
        "description": "Head to Hongdae, the university district. Shop for indie fashion, watch street performers and K-pop dance covers, and hit the late-night karaoke (Noraebang) rooms."
      },
      {
        "day": 4,
        "title": "Gangnam Style",
        "description": "Cross the river to Gangnam. Visit the massive Starfield Library, shop at high-end boutiques, and explore the sleek, modern side of the city."
      },
      {
        "day": 5,
        "title": "The DMZ",
        "description": "Take a guided day trip to the Demilitarized Zone (DMZ) to look into North Korea and learn about the intense modern history of the peninsula."
      },
      {
        "day": 6,
        "title": "Futuristic Design",
        "description": "Walk through the spaceship-like Dongdaemun Design Plaza. Shop at the wholesale night markets that stay open until 4 AM, then head to the airport."
      }
    ]
  },
  {
    "slug": "taipei-taiwan-5-days",
    "title": "Taipei, Taiwan",
    "location": "Taipei, Taiwan",
    "duration": "5 Days",
    "vibe": "Night Market King",
    "persona": "Concrete Jungle Explorer",
    "badgeClass": "bg-sky-100 text-sky-800",
    "image": "https://picsum.photos/seed/taipei-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "High Altitudes & Soup Dumplings",
        "description": "Go to the top of the Taipei 101 skyscraper. Afterward, eat at the original, Michelin-starred Din Tai Fung for their legendary Xiao Long Bao (soup dumplings)."
      },
      {
        "day": 2,
        "title": "Temples & Trails",
        "description": "Visit the incense-filled Longshan Temple. In the late afternoon, do the short, steep hike up Elephant Mountain for the absolute best sunset view of the Taipei skyline."
      },
      {
        "day": 3,
        "title": "The Lantern Village",
        "description": "Take a day trip to the mountain village of Jiufen (which inspired the movie Spirited Away) and release a paper lantern into the sky at the Shifen waterfall."
      },
      {
        "day": 4,
        "title": "Volcanic Hot Springs",
        "description": "Take the subway to Beitou. Soak in the public thermal hot springs, visit the bubbling Hell Valley, and relax in the mountainous nature just outside the city center."
      },
      {
        "day": 5,
        "title": "The Ultimate Food Crawl",
        "description": "Dedicate the last day to the Raohe and Shilin Night Markets. Eat black pepper buns, giant fried chicken, and stinky tofu until you can't walk anymore."
      }
    ]
  },
  {
    "slug": "singapore-4-days",
    "title": "Singapore",
    "location": "Singapore",
    "duration": "4 Days",
    "vibe": "Future & Flavor",
    "persona": "Concrete Jungle Explorer",
    "badgeClass": "bg-sky-100 text-sky-800",
    "image": "https://picsum.photos/seed/singapore-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Supertrees",
        "description": "Marvel at the futuristic Gardens by the Bay. Walk the skyway between the glowing Supertrees and explore the indoor Cloud Forest waterfall."
      },
      {
        "day": 2,
        "title": "Hawker Centre Heaven",
        "description": "Dive into Singapore's food culture. Eat Hainanese Chicken Rice at Maxwell Food Centre and incredible Biryani in the vibrant, colorful streets of Little India."
      },
      {
        "day": 3,
        "title": "Heights & Heritage",
        "description": "Shop the indie boutiques in Haji Lane and Kampong Glam. In the evening, head up to the Marina Bay Sands Skypark for an infinity-pool view of the city skyline at sunset."
      },
      {
        "day": 4,
        "title": "The Greatest Airport on Earth",
        "description": "Head to Changi Airport early. Spend your last hours exploring the Jewel, a massive indoor jungle with the world's tallest indoor waterfall, before flying home."
      }
    ]
  },
  {
    "slug": "ubud-bali-indonesia-8-days",
    "title": "Ubud, Bali, Indonesia",
    "location": "Ubud, Bali, Indonesia",
    "duration": "8 Days",
    "vibe": "Jungle Retreat",
    "persona": "Zen Seeker",
    "badgeClass": "bg-emerald-100 text-emerald-800",
    "image": "https://picsum.photos/seed/ubud-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Into the Jungle",
        "description": "Arrive and settle into your private jungle villa. Spend the evening listening to the sounds of nature with a quiet, plant-based welcome dinner."
      },
      {
        "day": 2,
        "title": "The Morning Flow",
        "description": "Start with a sunrise class at the famous Yoga Barn. In the afternoon, take a slow, mindful walk along the lush Campuhan Ridge Walk."
      },
      {
        "day": 3,
        "title": "Terraces & Temples",
        "description": "Wake up early to walk the Tegalalang Rice Terraces before the crowds arrive. Eat a farm-to-table lunch overlooking the valleys."
      },
      {
        "day": 4,
        "title": "Spiritual Cleansing",
        "description": "Visit the Tirta Empul water temple. Participate in a traditional Balinese water purification ceremony in the sacred springs."
      },
      {
        "day": 5,
        "title": "Monkeys & Massages",
        "description": "Walk through the Sacred Monkey Forest Sanctuary. Spend the entire afternoon at a luxury spa experiencing a traditional Balinese massage and floral bath."
      },
      {
        "day": 6,
        "title": "The Artisan Villages",
        "description": "Take a slow day exploring the nearby artisan villages of Celuk and Mas. Take a quiet, meditative silver-jewelry making class."
      },
      {
        "day": 7,
        "title": "The Sunrise Volcano",
        "description": "Take a gentle, guided morning trek up Mount Batur for sunrise, followed by a long soak in the natural volcanic hot springs at the base."
      },
      {
        "day": 8,
        "title": "Final Bowls & Departure",
        "description": "Enjoy one last smoothie bowl by your infinity pool, do a final self-guided meditation, and head to the airport feeling completely reset."
      }
    ]
  },
  {
    "slug": "maldives-7-days",
    "title": "The Maldives",
    "location": "The Maldives",
    "duration": "7 Days",
    "vibe": "Island Isolation",
    "persona": "Zen Seeker",
    "badgeClass": "bg-emerald-100 text-emerald-800",
    "image": "https://picsum.photos/seed/maldives-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Seaplane Arrival",
        "description": "Fly over the stunning atolls and land directly at your resort. Check into your overwater bungalow and immediately jump off your private deck into the ocean."
      },
      {
        "day": 2,
        "title": "The House Reef",
        "description": "Spend the morning snorkeling the coral reef right outside your door. Swim slowly alongside sea turtles and harmless reef sharks."
      },
      {
        "day": 3,
        "title": "Overwater Wellness",
        "description": "Book a signature treatment at the resort's overwater spa, where glass floors allow you to watch the marine life while getting a massage."
      },
      {
        "day": 4,
        "title": "The Sandbank Picnic",
        "description": "Take a boat out to a completely isolated, private sandbank in the middle of the ocean for a quiet, catered picnic lunch with zero distractions."
      },
      {
        "day": 5,
        "title": "Sunset Sails",
        "description": "Spend the day reading on your deck. In the evening, board a traditional wooden dhoni boat for a quiet sunset cruise alongside pods of dolphins."
      },
      {
        "day": 6,
        "title": "Beachfront Yoga",
        "description": "Join a guided sunrise yoga session on the soft white sand. Spend your final evening stargazing from your deck with zero light pollution."
      },
      {
        "day": 7,
        "title": "Final Dip & Departure",
        "description": "Take one last morning swim in the crystal-clear turquoise water, eat a fresh tropical breakfast, and board the seaplane home."
      }
    ]
  },
  {
    "slug": "amalfi-coast-italy-6-days",
    "title": "Amalfi Coast, Italy",
    "location": "Amalfi Coast, Italy",
    "duration": "6 Days",
    "vibe": "Mediterranean Slow",
    "persona": "Zen Seeker",
    "badgeClass": "bg-emerald-100 text-emerald-800",
    "image": "https://picsum.photos/seed/amalfi-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Positano Views",
        "description": "Arrive and settle into your cliffside boutique hotel. Order a glass of local wine to your balcony and simply watch the sun set over the Tyrrhenian Sea."
      },
      {
        "day": 2,
        "title": "Path of the Gods",
        "description": "Hike the breathtaking Sentiero degli Dei high above the coastline. Stop in the quiet hamlet of Nocelle for a slow, rustic pasta lunch."
      },
      {
        "day": 3,
        "title": "A Day on the Water",
        "description": "Charter a private, classic wooden boat to the island of Capri. Swim in quiet, hidden coves and float through the mesmerizing Blue Grotto."
      },
      {
        "day": 4,
        "title": "The Gardens of Ravello",
        "description": "Head high up the cliffs to the peaceful town of Ravello. Wander slowly through the stunning, flower-filled gardens of Villa Rufolo overlooking the ocean."
      },
      {
        "day": 5,
        "title": "Lemons & Limoncello",
        "description": "Walk down to the town of Amalfi. Take a private walking tour through the terraced lemon groves and end the day with a limoncello tasting."
      },
      {
        "day": 6,
        "title": "Final Espresso",
        "description": "Drink a slow espresso on the piazza, listen to the church bells ring, and take one last look at the pastel houses before heading to Naples."
      }
    ]
  },
  {
    "slug": "sedona-arizona-usa-4-days",
    "title": "Sedona, Arizona, USA",
    "location": "Sedona, Arizona, USA",
    "duration": "4 Days",
    "vibe": "Desert Healing",
    "persona": "Zen Seeker",
    "badgeClass": "bg-emerald-100 text-emerald-800",
    "image": "https://picsum.photos/seed/sedona-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Red Rock Sunsets",
        "description": "Arrive and check into a desert wellness resort. Drive up to Airport Mesa simply to sit and watch the red rocks glow deeply during sunset."
      },
      {
        "day": 2,
        "title": "Vortex Energy",
        "description": "Hike the Boynton Canyon trail. Stop to meditate at the natural energy vortexes, feeling the deep spiritual grounding the area is famous for."
      },
      {
        "day": 3,
        "title": "Sound Baths & Spas",
        "description": "Dedicate the day to wellness. Experience a Native American-inspired spa treatment followed by a deeply restorative crystal singing bowl sound bath."
      },
      {
        "day": 4,
        "title": "Cathedral Rock",
        "description": "Wake up before dawn for a quiet sunrise meditation near Cathedral Rock, soaking in the desert silence one last time before heading home."
      }
    ]
  },
  {
    "slug": "hakone-japan-5-days",
    "title": "Hakone, Japan",
    "location": "Hakone, Japan",
    "duration": "5 Days",
    "vibe": "Hot Springs & Views",
    "persona": "Zen Seeker",
    "badgeClass": "bg-emerald-100 text-emerald-800",
    "image": "https://picsum.photos/seed/hakone-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Ryokan Retreat",
        "description": "Take the Romancecar train from Tokyo into the mountains. Check into a traditional ryokan (inn), wear a cotton yukata, and eat a multi-course seasonal kaiseki dinner in your room."
      },
      {
        "day": 2,
        "title": "Forest Bathing",
        "description": "Take the Hakone Ropeway over the volcanic Owakudani valley. Take a slow, scenic pirate ship cruise across the pristine waters of Lake Ashi."
      },
      {
        "day": 3,
        "title": "Art & Matcha",
        "description": "Wander the sprawling, peaceful grounds of the Hakone Open-Air Museum. Stop at a traditional tea house in the gardens for a quiet matcha tea ceremony."
      },
      {
        "day": 4,
        "title": "Deep Onsen Immersion",
        "description": "Dedicate the day to onsen (hot spring) culture. Soak in multiple outdoor thermal baths surrounded by quiet bamboo forests and misty mountain air."
      },
      {
        "day": 5,
        "title": "Fuji Views",
        "description": "Enjoy a final, early-morning soak in the hot springs, hopefully catching a clear view of Mount Fuji, before taking the train back to reality."
      }
    ]
  },
  {
    "slug": "kerala-india-7-days",
    "title": "Kerala, India",
    "location": "Kerala, India",
    "duration": "7 Days",
    "vibe": "Backwater Bliss",
    "persona": "Zen Seeker",
    "badgeClass": "bg-emerald-100 text-emerald-800",
    "image": "https://picsum.photos/seed/kerala-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Fort Kochi",
        "description": "Arrive in the historic coastal town. Take a slow evening walk along the water to watch the iconic Chinese Fishing Nets silhouetted against the sunset."
      },
      {
        "day": 2,
        "title": "Spices & Culture",
        "description": "Wander through the quiet, spice-scented streets of Mattancherry. In the evening, watch a hypnotic, traditional Kathakali dance performance."
      },
      {
        "day": 3,
        "title": "Board the Houseboat",
        "description": "Travel to Alleppey and board your private kettuvallam (traditional thatched-roof houseboat). Begin floating silently through the endless emerald backwaters."
      },
      {
        "day": 4,
        "title": "Life on the Water",
        "description": "Wake up on the boat. Spend the entire day reading, watching local village life drift by on the riverbanks, and eating incredible fresh fish curries prepared by your private chef."
      },
      {
        "day": 5,
        "title": "The Ayurvedic Resort",
        "description": "Disembark and transfer to a luxury wellness resort on the shores of Lake Vembanad in Kumarakom."
      },
      {
        "day": 6,
        "title": "Ancient Wellness",
        "description": "Experience authentic Ayurveda. Receive a deeply relaxing Shirodhara treatment (warm herbal oil poured gently over the forehead) followed by lakeside meditation."
      },
      {
        "day": 7,
        "title": "Birdsong & Departure",
        "description": "Wake up early for a quiet bird-watching walk through the Kumarakom Bird Sanctuary, enjoy a final cup of South Indian filter coffee, and depart."
      }
    ]
  },
  {
    "slug": "rome-italy-6-days",
    "title": "Rome, Italy",
    "location": "Rome, Italy",
    "duration": "6 Days",
    "vibe": "The Eternal City",
    "persona": "Time Traveler",
    "badgeClass": "bg-amber-100 text-amber-800",
    "image": "https://picsum.photos/seed/rome-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Historic Center",
        "description": "Arrive and step immediately into the Renaissance. Walk the cobblestone streets to the Pantheon, throw a coin into the Trevi Fountain, and eat cacio e pepe in a traditional trattoria."
      },
      {
        "day": 2,
        "title": "The Heart of the Empire",
        "description": "Spend the entire day in Ancient Rome. Walk the floor of the Colosseum, explore the ruins of the Roman Forum, and climb the Palatine Hill where emperors once lived."
      },
      {
        "day": 3,
        "title": "The Vatican City",
        "description": "Cross the Tiber River to the smallest country in the world. Marvel at the Vatican Museums, stand in awe under the Sistine Chapel, and explore the massive St. Peter's Basilica."
      },
      {
        "day": 4,
        "title": "Art & Aristocracy",
        "description": "Wander the lush, historic gardens of the Villa Borghese. In the afternoon, sit on the Spanish Steps and explore the historic artist neighborhoods of Rome."
      },
      {
        "day": 5,
        "title": "The Catacombs & Appian Way",
        "description": "Rent a bicycle and ride down the Via Appia Antica, one of the oldest and most important roads of the Roman Republic, stopping to explore the ancient underground Christian catacombs."
      },
      {
        "day": 6,
        "title": "Trastevere Farewells",
        "description": "Spend your final day getting lost in the medieval, ivy-draped alleys of Trastevere. Enjoy a final artisan gelato before heading to the airport."
      }
    ]
  },
  {
    "slug": "kyoto-japan-6-days",
    "title": "Kyoto, Japan",
    "location": "Kyoto, Japan",
    "duration": "6 Days",
    "vibe": "Temples & Tradition",
    "persona": "Time Traveler",
    "badgeClass": "bg-amber-100 text-amber-800",
    "image": "https://picsum.photos/seed/kyoto-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Geisha District",
        "description": "Arrive and settle in. Take an evening stroll through the preserved wooden streets of Gion, keeping an eye out for geiko and maiko on their way to evening appointments."
      },
      {
        "day": 2,
        "title": "The Eastern Mountains",
        "description": "Walk the historic, sloping streets of Sannen-zaka and Ninenzaka. Spend the afternoon exploring the massive wooden stage of the Kiyomizu-dera temple overlooking the city."
      },
      {
        "day": 3,
        "title": "Shoguns & Zen",
        "description": "Walk the nightingale floors of Nijo Castle, the former Kyoto residence of the Tokugawa shogun. Later, find perfect stillness at the Ryoan-ji Zen rock garden."
      },
      {
        "day": 4,
        "title": "Gold & Bamboo",
        "description": "Start early at the Kinkaku-ji (The Golden Pavilion) as it reflects on the pond. Take the train to Arashiyama to walk through the towering, ancient Sagano Bamboo Forest."
      },
      {
        "day": 5,
        "title": "The Thousand Gates",
        "description": "Wake up before dawn to hike the winding mountain trails of Fushimi Inari Taisha, walking under thousands of bright orange torii gates."
      },
      {
        "day": 6,
        "title": "Nara's Ancient Capital",
        "description": "Take a short train ride to Nara, Japan's first permanent capital. Marvel at the giant Buddha at Todai-ji Temple, bow to the sacred roaming deer, and depart."
      }
    ]
  },
  {
    "slug": "cusco-peru-7-days",
    "title": "Cusco, Peru",
    "location": "Cusco, Peru",
    "duration": "7 Days",
    "vibe": "Incan Empire",
    "persona": "Time Traveler",
    "badgeClass": "bg-amber-100 text-amber-800",
    "image": "https://picsum.photos/seed/cusco-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "High Altitude History",
        "description": "Acclimatize to the Andes. Walk the Plaza de Armas and visit Qorikancha, the Incan Temple of the Sun that the Spanish built a colonial church directly on top of."
      },
      {
        "day": 2,
        "title": "The Giant Stones",
        "description": "Hike up to the massive, zig-zagging stone walls of the Sacsayhuaman ruins overlooking Cusco. Spend the afternoon bargaining for alpaca wool in the historic San Pedro Market."
      },
      {
        "day": 3,
        "title": "The Sacred Valley",
        "description": "Take a guided tour into the Sacred Valley. Visit the ancient agricultural terraces and the vibrant indigenous market in the town of Pisac."
      },
      {
        "day": 4,
        "title": "The Living Inca Town",
        "description": "Travel deeper into the valley to Ollantaytambo, a town still utilizing original Incan street planning and water channels. Board the scenic train to Aguas Calientes in the evening."
      },
      {
        "day": 5,
        "title": "Machu Picchu",
        "description": "Wake up at 4:00 AM to catch the first bus up the mountain. Witness the sunrise over the breathtaking lost citadel of the Incas. Take the evening train back to Cusco."
      },
      {
        "day": 6,
        "title": "Salt & Soil",
        "description": "Visit the stunning Maras Salt Mines, which have been harvested since pre-Incan times, and the mysterious circular agricultural terraces of Moray."
      },
      {
        "day": 7,
        "title": "Museum Memories",
        "description": "Spend your final morning at the Inka Museum to piece together the history you've witnessed, enjoy a traditional Peruvian lunch, and fly home."
      }
    ]
  },
  {
    "slug": "istanbul-turkey-5-days",
    "title": "Istanbul, Turkey",
    "location": "Istanbul, Turkey",
    "duration": "5 Days",
    "vibe": "Crossroads of the World",
    "persona": "Time Traveler",
    "badgeClass": "bg-amber-100 text-amber-800",
    "image": "https://picsum.photos/seed/istanbul-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Two Empires",
        "description": "Stand in Sultanahmet Square. Visit the awe-inspiring Hagia Sophia (which served as a church, then a mosque, then a museum, and a mosque again) and the stunning Blue Mosque."
      },
      {
        "day": 2,
        "title": "Sultans & Shadows",
        "description": "Spend the morning exploring the opulent courtyards of the Topkapi Palace, home to Ottoman Sultans for 400 years. Descend into the eerie, ancient Basilica Cistern."
      },
      {
        "day": 3,
        "title": "The Ancient Markets",
        "description": "Lose yourself in the labyrinth of the Grand Bazaar, one of the oldest and largest covered markets in the world. Smell the rich history at the 17th-century Spice Bazaar."
      },
      {
        "day": 4,
        "title": "Sailing History",
        "description": "Take a ferry cruise up the Bosphorus Strait, physically sailing between the continents of Europe and Asia, passing ancient fortresses and Ottoman palaces."
      },
      {
        "day": 5,
        "title": "The Galata Tower",
        "description": "Cross the Golden Horn to climb the medieval Genoese Galata Tower for panoramic views of the city's minarets. Drink a final cup of thick Turkish coffee and depart."
      }
    ]
  },
  {
    "slug": "cairo-egypt-6-days",
    "title": "Cairo, Egypt",
    "location": "Cairo, Egypt",
    "duration": "6 Days",
    "vibe": "Deep Antiquity",
    "persona": "Time Traveler",
    "badgeClass": "bg-amber-100 text-amber-800",
    "image": "https://picsum.photos/seed/cairo-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Arrival in Antiquity",
        "description": "Settle into your hotel. In the evening, watch the millennia fade away during the dramatic Sound and Light show illuminating the Pyramids and the Sphinx."
      },
      {
        "day": 2,
        "title": "The Giza Plateau",
        "description": "Spend the day up close with the last remaining Wonder of the Ancient World. Go inside the Great Pyramid, marvel at the Sphinx, and visit the Solar Boat Museum."
      },
      {
        "day": 3,
        "title": "The Golden Pharaohs",
        "description": "Dedicate the day to the Grand Egyptian Museum. Stand face-to-face with the golden death mask of King Tutankhamun and thousands of perfectly preserved ancient artifacts."
      },
      {
        "day": 4,
        "title": "Islamic Cairo",
        "description": "Step forward in time to the Middle Ages. Visit the massive Citadel of Saladin and the stunning alabaster Mosque of Muhammad Ali with panoramic views over the dusty city."
      },
      {
        "day": 5,
        "title": "The Great Bazaar",
        "description": "Navigate the narrow, winding alleys of the Khan el-Khalili bazaar, trading since the 14th century. Drink traditional mint tea at the historic Cafe El Fishawy."
      },
      {
        "day": 6,
        "title": "The First Pyramids",
        "description": "Take a day trip to Saqqara to see the Step Pyramid of Djoser, the oldest stone building complex in the world, and the ancient capital of Memphis, before flying home."
      }
    ]
  },
  {
    "slug": "petra-jordan-5-days",
    "title": "Petra, Jordan",
    "location": "Petra, Jordan",
    "duration": "5 Days",
    "vibe": "The Rose City",
    "persona": "Time Traveler",
    "badgeClass": "bg-amber-100 text-amber-800",
    "image": "https://picsum.photos/seed/petra-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Entering the Canyon",
        "description": "Arrive in Wadi Musa. Begin your journey with Petra By Night, walking silently through the narrow, candlelit canyon (the Siq) to see the Treasury glowing in the dark."
      },
      {
        "day": 2,
        "title": "The Rose City Revealed",
        "description": "Walk the Siq by daylight. Emerge to see the jaw-dropping facade of The Treasury, then spend the day exploring the Street of Facades and the massive Royal Tombs carved directly into the red rock."
      },
      {
        "day": 3,
        "title": "The High Places",
        "description": "Hike the 800 ancient, rock-cut steps up the mountain to reach The Monastery (Ad Deir), an monument even larger than the Treasury, offering sweeping views of the surrounding valleys."
      },
      {
        "day": 4,
        "title": "Little Petra",
        "description": "Take a short drive to Siq al-Barid (Little Petra), a quieter, more intimate ancient Nabataean site. Continue to the nearby 9,000-year-old Neolithic village ruins of Beidha."
      },
      {
        "day": 5,
        "title": "Bedouin Tea",
        "description": "Spend your final morning enjoying sweet Bedouin tea at a cliffside camp, taking one last look at the ancient empire carved into the desert before heading to the airport."
      }
    ]
  },
  {
    "slug": "queenstown-new-zealand-8-days",
    "title": "Queenstown, New Zealand",
    "location": "Queenstown, New Zealand",
    "duration": "8 Days",
    "vibe": "Adrenaline Capital",
    "persona": "Thrill Chaser",
    "badgeClass": "bg-orange-100 text-orange-800",
    "image": "https://picsum.photos/seed/queenstown-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Warm-Up",
        "description": "Arrive in the adventure capital of the world. Take the Skyline Gondola up Bob's Peak for panoramic views and race down the mountain on the high-speed Luge tracks."
      },
      {
        "day": 2,
        "title": "The Original Jump",
        "description": "Face your fears at the Kawarau Bridge, the birthplace of commercial bungee jumping. In the afternoon, hold on tight as a V8-powered Shotover Jet boat does 360-degree spins through narrow river canyons."
      },
      {
        "day": 3,
        "title": "The Canyon Swing",
        "description": "Head to the Nevis Valley. Skip the bungee and strap into the Nevis Swing, launching yourself across a massive 300-meter canyon arc at 120 km/h."
      },
      {
        "day": 4,
        "title": "Heli-Hiking",
        "description": "Board a helicopter to fly over the Southern Alps. Land directly on a glacier and spend the afternoon ice-trekking with crampons and ice axes."
      },
      {
        "day": 5,
        "title": "Skydiving the Remarkables",
        "description": "Jump out of a plane at 15,000 feet, free-falling for 60 seconds over the jagged Remarkables mountain range and the deep blue Lake Wakatipu."
      },
      {
        "day": 6,
        "title": "Downhill Domination",
        "description": "Rent full suspension gear and hit the Queenstown Bike Park. Spend the day navigating extreme, tree-rooted downhill mountain biking trails."
      },
      {
        "day": 7,
        "title": "Whitewater Rapids",
        "description": "Navigate the treacherous, Grade 5 rapids of the turbulent Skippers Canyon in a whitewater raft."
      },
      {
        "day": 8,
        "title": "The Survivor's Feast",
        "description": "Grab a legendary, massive burger at Fergburger, take one last look at the mountains, and head to the airport with a racing heart."
      }
    ]
  },
  {
    "slug": "patagonia-chile-10-days",
    "title": "Patagonia, Chile",
    "location": "Patagonia, Chile",
    "duration": "10 Days",
    "vibe": "Wild Frontier",
    "persona": "Thrill Chaser",
    "badgeClass": "bg-orange-100 text-orange-800",
    "image": "https://picsum.photos/seed/patagonia-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Basecamp Natales",
        "description": "Arrive in Puerto Natales. Rent your heavy-duty trekking gear, buy trail rations, and prepare your pack for the deep wilderness."
      },
      {
        "day": 2,
        "title": "Into the Wild (W Trek Day 1)",
        "description": "Enter Torres del Paine National Park. Begin the famous W Trek with a grueling, steep hike up to the base of the iconic, jagged granite Towers."
      },
      {
        "day": 3,
        "title": "The French Valley (W Trek Day 2)",
        "description": "Trek deep into the French Valley. Listen to the thunderous cracks of avalanches falling from the massive hanging glacier above you."
      },
      {
        "day": 4,
        "title": "The Ice Wall (W Trek Day 3)",
        "description": "Hike along the edge of Lake Grey, fighting intense Patagonian winds, until you reach the towering, blue face of Glacier Grey."
      },
      {
        "day": 5,
        "title": "Ice Trekking",
        "description": "Strap on crampons and spend the morning physically hiking across the crevasses and ice caves of Glacier Grey. Take a Zodiac boat out of the park through floating icebergs."
      },
      {
        "day": 6,
        "title": "Kayaking the Fjords",
        "description": "Spend the day doing a rigorous sea kayaking expedition through the Eberhard Fjord, paddling against strong currents."
      },
      {
        "day": 7,
        "title": "Puma Tracking",
        "description": "Wake up hours before dawn for a specialized wildlife tracking safari, hiking silently to spot wild Patagonian pumas on the hunt."
      },
      {
        "day": 8,
        "title": "Gaucho Riding",
        "description": "Saddle up for a full-day, fast-paced horseback ride across the rugged Patagonian steppe alongside local cowboys (gauchos)."
      },
      {
        "day": 9,
        "title": "Off-Grid Glaciers",
        "description": "Take a high-speed boat up the Serrano River to hike to the remote Balmaceda and Serrano glaciers, areas only accessible by water."
      },
      {
        "day": 10,
        "title": "Return to Civilization",
        "description": "Nurse your sore legs, eat a massive celebratory Patagonian lamb barbecue (asado), and fly out of Punta Arenas."
      }
    ]
  },
  {
    "slug": "reykjavik-iceland-7-days",
    "title": "Reykjavik, Iceland",
    "location": "Reykjavik, Iceland",
    "duration": "7 Days",
    "vibe": "Fire and Ice",
    "persona": "Thrill Chaser",
    "badgeClass": "bg-orange-100 text-orange-800",
    "image": "https://picsum.photos/seed/reykjavik-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "ATV Lava Fields",
        "description": "Arrive and immediately jump on a quad bike. Spend the afternoon tearing through volcanic black sand beaches and rugged lava fields just outside the city."
      },
      {
        "day": 2,
        "title": "Tectonic Snorkeling",
        "description": "Head to Thingvellir National Park. Don a drysuit and snorkel through the freezing, crystal-clear glacial waters of the Silfra Fissure, floating directly between the North American and Eurasian tectonic plates."
      },
      {
        "day": 3,
        "title": "Super Jeep River Crossings",
        "description": "Board a massive, modified 4x4 Super Jeep. Drive off-road into the wild highlands of Thorsmork, crossing deep, rushing glacial rivers."
      },
      {
        "day": 4,
        "title": "Ice Caves & Glaciers",
        "description": "Travel the South Coast to the Solheimajokull glacier. Strap on ice climbing gear to scale a vertical ice wall, then explore naturally formed blue ice caves."
      },
      {
        "day": 5,
        "title": "Inside the Volcano",
        "description": "Hike across a lava field to the dormant Thrihnukagigur volcano. Step into an open cable lift and descend 400 feet straight down into the massive, empty magma chamber."
      },
      {
        "day": 6,
        "title": "Arctic Whitewater",
        "description": "Brave the freezing temperatures for a whitewater rafting trip down the Hvita glacial river, navigating tight canyons and churning rapids."
      },
      {
        "day": 7,
        "title": "Geothermal Recovery",
        "description": "Give your bruised muscles a break. Soak in the mineral-rich waters of the Blue Lagoon before heading to Keflavik Airport."
      }
    ]
  },
  {
    "slug": "banff-canada-6-days",
    "title": "Banff, Canada",
    "location": "Banff, Canada",
    "duration": "6 Days",
    "vibe": "Alpine Extreme",
    "persona": "Thrill Chaser",
    "badgeClass": "bg-orange-100 text-orange-800",
    "image": "https://picsum.photos/seed/banff-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Acclimation Scramble",
        "description": "Arrive in the Rockies. Start with a steep, aggressive scramble up Tunnel Mountain to get your lungs used to the alpine altitude."
      },
      {
        "day": 2,
        "title": "The Iron Path",
        "description": "Head to Mt. Norquay for the Via Ferrata. Clip your harness to steel cables and climb a sheer vertical cliff face, crossing a suspension bridge thousands of feet in the air."
      },
      {
        "day": 3,
        "title": "The Plain of Six Glaciers",
        "description": "Skip the tourist paths at Lake Louise. Do the grueling, high-elevation hike to the Plain of Six Glaciers, and continue to the sheer drop-off at the Devil's Thumb."
      },
      {
        "day": 4,
        "title": "The Icefields Parkway",
        "description": "Drive one of the world's wildest roads. Stop at the Athabasca Glacier, lace up your boots, and do a guided crevasse-hopping walk across the active ice field."
      },
      {
        "day": 5,
        "title": "The Kicking Horse",
        "description": "Cross the border into British Columbia for Class 4 whitewater rafting down the Kicking Horse River, famous for its continuous, aggressive drops."
      },
      {
        "day": 6,
        "title": "Summit Views",
        "description": "Ride the Banff Gondola to the summit of Sulphur Mountain for one last sweeping view of the jagged Rockies before your flight home."
      }
    ]
  },
  {
    "slug": "interlaken-switzerland-5-days",
    "title": "Interlaken, Switzerland",
    "location": "Interlaken, Switzerland",
    "duration": "5 Days",
    "vibe": "Sky High",
    "persona": "Thrill Chaser",
    "badgeClass": "bg-orange-100 text-orange-800",
    "image": "https://picsum.photos/seed/interlaken-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Flight Over the Alps",
        "description": "Arrive in the adventure hub of Europe. Immediately run off the side of Beatenberg mountain for a tandem paragliding flight, soaring over the twin lakes of Interlaken."
      },
      {
        "day": 2,
        "title": "Extreme Canyoning",
        "description": "Put on a thick wetsuit and helmet for the Grimsel Canyon. Spend the day rappelling down 50-meter waterfalls, jumping off cliffs, and sliding down natural rock flumes into glacial pools."
      },
      {
        "day": 3,
        "title": "The Eiger Jump",
        "description": "Board a helicopter to 14,000 feet. Skydive directly in front of the legendary, towering North Face of the Eiger mountain."
      },
      {
        "day": 4,
        "title": "The Top of Europe",
        "description": "Take the train to Jungfraujoch, the highest railway station in Europe. Step out into the freezing alpine air and do a guided, roped-up hike across the massive Aletsch Glacier."
      },
      {
        "day": 5,
        "title": "The Cable Car Bungee",
        "description": "Take a cable car out over the alpine lake at Stockhorn. Open the door of the gondola and bungee jump 134 meters straight down toward the water before departing."
      }
    ]
  },
  {
    "slug": "moab-utah-usa-4-days",
    "title": "Moab, Utah, USA",
    "location": "Moab, Utah, USA",
    "duration": "4 Days",
    "vibe": "Desert Playground",
    "persona": "Thrill Chaser",
    "badgeClass": "bg-orange-100 text-orange-800",
    "image": "https://picsum.photos/seed/moab-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Slot Canyoneering",
        "description": "Arrive in the red rock desert. Hike into the backcountry and spend the day canyoneering, rappelling down steep, incredibly narrow sandstone slot canyons."
      },
      {
        "day": 2,
        "title": "The Slickrock Trail",
        "description": "Rent a premium full-suspension mountain bike and tackle the world-famous Slickrock Trail. Navigate the intensely steep, sandpaper-like rock domes that test your balance and brakes."
      },
      {
        "day": 3,
        "title": "Hell's Revenge",
        "description": "Strap into a customized, high-clearance UTV (Utility Terrain Vehicle). Drive the extreme Hell's Revenge 4x4 trail, climbing near-vertical rock fins and balancing on sheer cliff edges."
      },
      {
        "day": 4,
        "title": "The Final Arch",
        "description": "Wake up at 4:00 AM. Do a fast, dark scramble up the sandstone bowls to witness the sunrise at Delicate Arch, then hit the road home."
      }
    ]
  },
  {
    "slug": "dubai-uae-5-days",
    "title": "Dubai, UAE",
    "location": "Dubai, UAE",
    "duration": "5 Days",
    "vibe": "Ultra-Modern Luxury",
    "persona": "High-Roller",
    "badgeClass": "bg-fuchsia-100 text-fuchsia-800",
    "image": "https://picsum.photos/seed/dubai-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Sky-High Arrivals",
        "description": "Check into your suite at the 7-star Burj Al Arab. Spend the evening dining in the clouds at At.mosphere, located on the 122nd floor of the Burj Khalifa."
      },
      {
        "day": 2,
        "title": "The Private Yacht",
        "description": "Charter a private, crewed super-yacht from the Dubai Marina. Spend the day cruising the Arabian Gulf, and end the night with a VIP table at WHITE Dubai, the city's premier open-air superclub."
      },
      {
        "day": 3,
        "title": "Platinum Retail Therapy",
        "description": "Utilize a personal shopper at the massive Dubai Mall. In the afternoon, secure a VIP cabana at the exclusive Nammos beach club for champagne and Mediterranean cuisine."
      },
      {
        "day": 4,
        "title": "The Platinum Desert",
        "description": "Skip the crowded tourist safaris. Take a private, vintage Land Rover into the royal desert retreat. Enjoy a private falconry show and a six-course dinner under the stars."
      },
      {
        "day": 5,
        "title": "Helicopter Views",
        "description": "Take a private helicopter tour over the Palm Jumeirah and The World Islands. Pick up some final luxury items at the Gold Souk before heading to the airport."
      }
    ]
  },
  {
    "slug": "ibiza-spain-6-days",
    "title": "Ibiza, Spain",
    "location": "Ibiza, Spain",
    "duration": "6 Days",
    "vibe": "Global Nightlife",
    "persona": "High-Roller",
    "badgeClass": "bg-fuchsia-100 text-fuchsia-800",
    "image": "https://picsum.photos/seed/ibiza-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Sunset Strip",
        "description": "Arrive and check into your private cliffside villa. Head to Cafe del Mar or Mambo for exclusive sunset cocktails to kick off the trip."
      },
      {
        "day": 2,
        "title": "Daybeds & DJs",
        "description": "Secure a VIP daybed at Blue Marlin Ibiza. Enjoy champagne sprays and afternoon dancing before moving to a VIP table at the legendary Pacha for a late-night set."
      },
      {
        "day": 3,
        "title": "The Formentera Charter",
        "description": "Charter a luxury catamaran to the neighboring island of Formentera. Swim in the crystal-clear, yacht-filled waters and eat a late, exclusive seafood lunch at Juan y Andrea."
      },
      {
        "day": 4,
        "title": "Recovery & Rhythms",
        "description": "Spend the morning recovering with an in-villa private massage. In the evening, dress to impress for table service and massive production at Ushuaia or Hi Ibiza."
      },
      {
        "day": 5,
        "title": "Cabaret & Haute Cuisine",
        "description": "Explore the high-end boutiques of Dalt Vila (Old Town). In the evening, secure a highly coveted reservation at Lio for a world-class dinner paired with an immersive cabaret show."
      },
      {
        "day": 6,
        "title": "Final Toast",
        "description": "Enjoy a final, lavish recovery brunch prepared by your private villa chef before taking a black-car transfer to the airport."
      }
    ]
  },
  {
    "slug": "miami-usa-4-days",
    "title": "Miami, USA",
    "location": "Miami, USA",
    "duration": "4 Days",
    "vibe": "Art Deco Energy",
    "persona": "High-Roller",
    "badgeClass": "bg-fuchsia-100 text-fuchsia-800",
    "image": "https://picsum.photos/seed/miami-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "South Beach Scene",
        "description": "Arrive and check into an oceanfront suite at The Setai or Faena. Eat a high-end Italian dinner at Carbone before securing a VIP table at LIV to dance until 5 AM."
      },
      {
        "day": 2,
        "title": "Biscayne Bay Cruising",
        "description": "Rent a luxury yacht for the day. Cruise around Star Island to see the celebrity mansions, drop anchor at the sandbar, and end with an exclusive dinner at Nikki Beach."
      },
      {
        "day": 3,
        "title": "Design & Day Clubs",
        "description": "Shop the ultra-luxury boutiques in the Miami Design District. In the afternoon, pop champagne in a private poolside cabana at Hyde Beach."
      },
      {
        "day": 4,
        "title": "Soho House Send-Off",
        "description": "Enjoy a chic, members-only vibe for brunch at Cecconi's (in the Soho Beach House), take one last dip in the ocean, and head to MIA."
      }
    ]
  },
  {
    "slug": "mykonos-greece-6-days",
    "title": "Mykonos, Greece",
    "location": "Mykonos, Greece",
    "duration": "6 Days",
    "vibe": "Mediterranean Chic",
    "persona": "High-Roller",
    "badgeClass": "bg-fuchsia-100 text-fuchsia-800",
    "image": "https://picsum.photos/seed/mykonos-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Cliffside Elegance",
        "description": "Arrive and settle into an infinity-pool suite overlooking the Aegean Sea. Head to Scorpios for their world-renowned, bohemian sunset ritual and cocktails."
      },
      {
        "day": 2,
        "title": "The Beach Club Capital",
        "description": "Reserve front-row VIP loungers at Principote or Nammos. Expect the music to turn up and the champagne to start flowing by 4 PM as the beach turns into a massive party."
      },
      {
        "day": 3,
        "title": "Shopping in the Chora",
        "description": "Spend the afternoon wandering the whitewashed streets of Mykonos Town, shopping at high-end designer pop-ups. Eat sunset sushi at Nobu Matsuhisa."
      },
      {
        "day": 4,
        "title": "The Sacred Charter",
        "description": "Charter a private yacht to the nearby uninhabited island of Delos to see ancient ruins, then anchor in a secluded cove for a private lunch prepared by your crew."
      },
      {
        "day": 5,
        "title": "Windmills & Superclubs",
        "description": "Eat dinner on the water's edge in Little Venice. At 2 AM, head to Cavo Paradiso, an open-air superclub built into a cliff, and dance until the sun comes up."
      },
      {
        "day": 6,
        "title": "Recovery Views",
        "description": "Order a massive room-service breakfast to your private terrace, soak in your plunge pool, and catch your flight out of the Cyclades."
      }
    ]
  },
  {
    "slug": "las-vegas-usa-4-days",
    "title": "Las Vegas, USA",
    "location": "Las Vegas, USA",
    "duration": "4 Days",
    "vibe": "VIP Playground",
    "persona": "High-Roller",
    "badgeClass": "bg-fuchsia-100 text-fuchsia-800",
    "image": "https://picsum.photos/seed/vegas-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "The Penthouse",
        "description": "Arrive via private limo and check into a Skyloft at the MGM or a Penthouse at the Cosmopolitan. Enjoy a 3-Michelin-star dinner at Joel Robuchon before hitting the high-limits tables."
      },
      {
        "day": 2,
        "title": "The Cabana Life",
        "description": "Reserve a prime, multi-level VIP cabana at Encore Beach Club. In the evening, skip the lines with an exclusive VIP table and bottle service at Omnia."
      },
      {
        "day": 3,
        "title": "The Grand Canyon Copter",
        "description": "Board a private helicopter from the Las Vegas Strip. Fly over the Hoover Dam and land at the bottom of the Grand Canyon for a private champagne picnic."
      },
      {
        "day": 4,
        "title": "Spa & Shopping",
        "description": "Recover in the Arctic Ice Room at the Qua Baths & Spa. Do some final luxury damage at The Shops at Crystals before flying home."
      }
    ]
  },
  {
    "slug": "monaco-monte-carlo-5-days",
    "title": "Monaco (Monte Carlo)",
    "location": "Monaco (Monte Carlo)",
    "duration": "5 Days",
    "vibe": "Billionaire Riviera",
    "persona": "High-Roller",
    "badgeClass": "bg-fuchsia-100 text-fuchsia-800",
    "image": "https://picsum.photos/seed/monaco-discover/1200/800",
    "days": [
      {
        "day": 1,
        "title": "Helicopter Arrivals",
        "description": "Fly into Monaco via a 7-minute helicopter transfer from Nice. Check into the iconic Hotel de Paris. Eat dinner at the legendary, 3-Michelin-star Le Louis XV."
      },
      {
        "day": 2,
        "title": "The Riviera Charter",
        "description": "Charter a sleek Riva yacht for the day. Cruise the glamorous French Riviera coast, dropping anchor at Cap Ferrat and the beaches of Eze."
      },
      {
        "day": 3,
        "title": "Supercars & Sunsets",
        "description": "Rent a Ferrari or Lamborghini for the afternoon. Drive the iconic Formula 1 street circuit and the winding Grande Corniche. Enjoy sunset drinks at Nikki Beach Monte-Carlo."
      },
      {
        "day": 4,
        "title": "The Casino Royale",
        "description": "Shop for diamonds and haute couture in the Carre d'Or. In the evening, put on a tuxedo or evening gown and play high-stakes table games in the private rooms of the Casino de Monte-Carlo."
      },
      {
        "day": 5,
        "title": "Mega-Yacht Watching",
        "description": "Have a final, lavish brunch overlooking Port Hercules, watching the world's most expensive mega-yachts pull in and out of the harbor, before your heli-transfer out."
      }
    ]
  }
]


def get_discover_trip_by_slug(slug: str) -> Optional[dict]:
    """Return the discover trip dict for a given slug, or None if not found."""
    return next((t for t in DISCOVER_TRIPS if t["slug"] == slug), None)


def get_all_discover_trips() -> list[dict]:
    return DISCOVER_TRIPS
