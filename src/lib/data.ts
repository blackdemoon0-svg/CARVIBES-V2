// Easily replaceable sample content for the homepage.
// Future phases will wire these into the real database.

export interface Category {
  id: string;
  image: string;
  alt: string;
  number: string;
}

export const categories: Category[] = [
  {
    id: "sport",
    image:
      "https://images.pexels.com/photos/29115178/pexels-photo-29115178.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1000",
    alt: "Yellow supercar in an industrial garage",
    number: "01",
  },
  {
    id: "luxury",
    image:
      "https://images.pexels.com/photos/19382415/pexels-photo-19382415.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1000",
    alt: "Maserati MC20 in a dimly lit garage",
    number: "02",
  },
  {
    id: "everyday",
    image:
      "https://images.pexels.com/photos/7412624/pexels-photo-7412624.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1400&w=1000",
    alt: "Compact hatchback in an urban setting",
    number: "03",
  },
];

export interface DailyCard {
  tag: string;
  title: string;
  meta: string;
  image: string;
  alt: string;
  kind: "cotd" | "story" | "trending";
}

export const dailyCards: DailyCard[] = [
  {
    kind: "cotd",
    tag: "car_of_the_day",
    title: "McLaren Artura",
    meta: "680 hp · Hybrid · 2024",
    image:
      "https://images.pexels.com/photos/8359715/pexels-photo-8359715.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    alt: "Red classic sports car with open gullwing doors",
  },
  {
    kind: "story",
    tag: "car_story",
    title: "The E30 Legend",
    meta: "How a boxy coupe became an icon",
    image:
      "https://images.pexels.com/photos/27993136/pexels-photo-27993136.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    alt: "Classic car headlight with chrome finish",
  },
  {
    kind: "trending",
    tag: "trending_car",
    title: "Maserati MC20",
    meta: "620 hp · 0–100 in 2.9s",
    image:
      "https://images.pexels.com/photos/9411653/pexels-photo-9411653.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200",
    alt: "Shiny black car with illuminated headlight",
  },
];

// Language screen welcome copy (not in i18n dict since it's shown before selection)
export const welcome = {
  title: "WELCOME TO CARVIBES",
  subtitle: "Choose your language",
};
