// ============================================================
// CARVIBES — STORIES LIBRARY
// Immersive automotive storytelling. Content is historically
// accurate; where facts are uncertain they are flagged.
// Each story links to the existing vehicle database via carId.
// ============================================================

export type StoryCategory =
  | "legends"
  | "creators"
  | "brands"
  | "supercars"
  | "sports"
  | "jdm"
  | "classics"
  | "racing"
  | "engineering"
  | "forgotten";

export interface StoryChapter {
  title: string;
  paragraphs: string[];
  /** Optional pull quote rendered cinematically */
  quote?: string;
}

export interface TimelineEvent {
  year: string;
  label: string;
  detail: string;
}

export interface Story {
  id: string;
  title: string;
  car: string; // vehicle name for card display
  brand: string;
  year: number;
  categories: StoryCategory[];
  readTime: number; // minutes
  description: string;
  image: string;
  gallery?: string[]; // additional images for the reading experience
  carId?: string; // link to vehicle database
  creator?: string;
  accent?: string; // subtle brand accent hex
  featured?: boolean;
  hidden?: boolean; // "Hidden Legends"
  chapters: StoryChapter[];
  timeline: TimelineEvent[];
}

// ---- Real, licensed Pexels imagery mapping (brand-accurate) ----
const IMG = {
  porsche: "https://images.pexels.com/photos/38234790/pexels-photo-38234790.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  porsche2: "https://images.pexels.com/photos/35849576/pexels-photo-35849576.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  ferrari: "https://images.pexels.com/photos/12506011/pexels-photo-12506011.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  ferrari2: "https://images.pexels.com/photos/11931440/pexels-photo-11931440.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  lambo: "https://images.pexels.com/photos/17632049/pexels-photo-17632049.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  bugatti: "https://images.pexels.com/photos/31417515/pexels-photo-31417515.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  mclaren: "https://images.pexels.com/photos/29115178/pexels-photo-29115178.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  koenigsegg: "https://images.pexels.com/photos/18366087/pexels-photo-18366087.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  pagani: "https://images.pexels.com/photos/31417515/pexels-photo-31417515.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  toyota: "https://images.pexels.com/photos/15513894/pexels-photo-15513894.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  nissan: "https://images.pexels.com/photos/19557554/pexels-photo-19557554.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  honda: "https://images.pexels.com/photos/30570357/pexels-photo-30570357.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  bmw: "https://images.pexels.com/photos/27993136/pexels-photo-27993136.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  mercedes: "https://images.pexels.com/photos/16120588/pexels-photo-16120588.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  ford: "https://images.pexels.com/photos/37508222/pexels-photo-37508222.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  chevy: "https://images.pexels.com/photos/30090368/pexels-photo-30090368.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  dodge: "https://images.pexels.com/photos/34071036/pexels-photo-34071036.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  maserati: "https://images.pexels.com/photos/19382415/pexels-photo-19382415.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  aston: "https://images.pexels.com/photos/94272/pexels-photo-94272.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  lotus: "https://images.pexels.com/photos/38412217/pexels-photo-38412217.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  lfa: "https://images.pexels.com/photos/10029873/pexels-photo-10029873.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  datsun: "https://images.pexels.com/photos/3966847/pexels-photo-3966847.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  porsche959: "https://images.pexels.com/photos/35831596/pexels-photo-35831596.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  gullwing: "https://images.pexels.com/photos/16120588/pexels-photo-16120588.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  rx7: "https://images.pexels.com/photos/12954631/pexels-photo-12954631.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  race1: "https://images.pexels.com/photos/16461374/pexels-photo-16461374.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  race2: "https://images.pexels.com/photos/13602282/pexels-photo-13602282.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  engine1: "https://images.pexels.com/photos/12658309/pexels-photo-12658309.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  engine2: "https://images.pexels.com/photos/32725838/pexels-photo-32725838.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  garage: "https://images.pexels.com/photos/8985969/pexels-photo-8985969.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
  showroom: "https://images.pexels.com/photos/29566880/pexels-photo-29566880.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=1100",
};

// Build a gallery for each story: hero + relevant supporting images
// (racing, engineering, design) so every story has 3–4 real images.
const ATMOSPHERE = [IMG.race1, IMG.race2, IMG.engine1, IMG.engine2, IMG.garage, IMG.showroom];

export function storyGallery(hero: string, seed: number): string[] {
  const extras = ATMOSPHERE.slice(seed % 2, seed % 2 + 3);
  return [hero, ...extras];
}

export const storyCategories: { id: StoryCategory; key: string }[] = [
  { id: "legends", key: "st_cat_legends" },
  { id: "creators", key: "st_cat_creators" },
  { id: "brands", key: "st_cat_brands" },
  { id: "supercars", key: "st_cat_supercars" },
  { id: "sports", key: "st_cat_sports" },
  { id: "jdm", key: "st_cat_jdm" },
  { id: "classics", key: "st_cat_classics" },
  { id: "racing", key: "st_cat_racing" },
  { id: "engineering", key: "st_cat_engineering" },
  { id: "forgotten", key: "st_cat_forgotten" },
];

const rawStories: Story[] = [
  // ============ FEATURED — PORSCHE 911 ============
  {
    id: "porsche-911-origin",
    title: "THE STORY BEHIND THE PORSCHE 911",
    car: "Porsche 911",
    brand: "Porsche",
    year: 1963,
    categories: ["legends", "sports", "engineering"],
    readTime: 8,
    description:
      "How Ferdinand \"Butzi\" Porsche turned a simple brief into the most enduring sports car silhouette in history.",
    image: IMG.porsche,
    carId: "porsche-911-turbo-classic",
    creator: "Ferdinand Alexander Porsche",
    accent: "#8a8a8f",
    featured: true,
    chapters: [
      {
        title: "THE BEGINNING",
        quote: "Grandson of the founder, heir to a name — and determined to leave his own mark.",
        paragraphs: [
          "Ferdinand Alexander Porsche — known to everyone as Butzi — was born in 1935 into one of the most famous engineering families in Europe. His grandfather Ferdinand Sr. had created the Volkswagen Beetle; his father Ferry had just founded the Porsche car company in Stuttgart.",
          "Growing up, Butzi was surrounded by machines, but his instinct was shaped as much by design school in Ulm as by the family workshop. When the 356, Porsche's first production car, began to look dated, the company needed something new.",
        ],
      },
      {
        title: "THE BRIEF",
        paragraphs: [
          "In the late 1950s Porsche set a clear brief: a larger, faster, more comfortable 2+2 that could carry the company beyond the 356. It had to keep a rear engine — the layout Ferry Porsche trusted — but feel modern.",
          "Several designers sketched proposals. Butzi's approach was radical for a conservative company: he insisted the car should look simple, timeless, and free of ornament.",
        ],
      },
      {
        title: "THE SILHOUETTE",
        paragraphs: [
          "The defining feature — the sloping fastback roofline that drops in one unbroken arc to the rear — came from a functional idea: more interior room and better aerodynamics, without sacrificing the rear-engine identity.",
          "First shown at the 1963 Frankfurt Motor Show as the 901, a trademark dispute with Peugeot over three-digit names ending in '0' forced a rename. Porsche simply swapped the middle digit: the 911 was born.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "Production began in 1964 with a 2.0-litre air-cooled flat-six making 130 hp. The air-cooled engine placed behind the rear axle gave the 911 its distinctive balance, sound and famously involving handling.",
          "Over decades, Porsche evolved the 911 without ever abandoning its core idea — a testament to a shape said to have been sketched to fit on a single piece of paper.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "The 911 became the reference sports car: raced, rallied, and adored. Butzi's design proved so right that it survived eight generations and millions of examples, still recognisable at a glance.",
          "Today the 911 is the longest-running sports car in continuous production — proof that a single, honest idea can outlive every trend.",
        ],
      },
    ],
    timeline: [
      { year: "1935", label: "THE BEGINNING", detail: "Ferdinand Alexander Porsche is born." },
      { year: "1959", label: "THE IDEA", detail: "Work begins on a successor to the 356." },
      { year: "1963", label: "FIRST SHOWING", detail: "The 901 debuts at Frankfurt." },
      { year: "1964", label: "PRODUCTION", detail: "Renamed 911, series production begins." },
      { year: "1998", label: "THE LEGEND", detail: "969,000+ sold; an icon for every generation after." },
    ],
  },

  // ============ FERRARI — ENZO (creator) ============
  {
    id: "enzo-ferrari-the-man",
    title: "ENZO FERRARI: THE MAN BEHIND THE PRANCING HORSE",
    car: "Ferrari 812 Superfast",
    brand: "Ferrari",
    year: 1947,
    categories: ["creators", "legends", "racing"],
    readTime: 9,
    description:
      "Before the cars, there was a man driven by loss, racing and an obsessive belief in speed.",
    image: IMG.ferrari,
    carId: "ferrari-812-superfast",
    creator: "Enzo Ferrari",
    accent: "#c41f2e",
    chapters: [
      {
        title: "THE EARLY YEARS",
        paragraphs: [
          "Enzo Ferrari was born in 1898 in Modena, Italy. His father and elder brother died in the influenza pandemic of 1916, a formative loss that historians link to Enzo's later emotional distance and fierce self-reliance.",
          "He found his calling at a 1908 racing event in Bologna, and vowed to become a driver. After serving in World War I, he joined Alfa Romeo as a test driver in 1919.",
        ],
      },
      {
        title: "THE RACING YEARS",
        paragraphs: [
          "As a driver Enzo was skilled but not destined for greatness. His real talent emerged when he built Scuderia Ferrari in 1929 — essentially Alfa Romeo's racing team — until the two parted ways in 1939.",
          "Barred from using his own name on a car for several years, Enzo worked secretly, promising he would one day build cars under his own badge.",
        ],
      },
      {
        title: "THE REBIRTH",
        paragraphs: [
          "In 1947, the first car to wear the Ferrari name — the 125 S — rolled out of the Maranello workshop, powered by a small V12. Its racing debut did not go perfectly, but Enzo's path was set.",
          "The prancing horse badge, inherited from a World War I flying ace, became one of the most recognised symbols in the world.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "Ferrari's obsession was always the engine — above all the V12, which he believed held a purity that nothing else matched. That philosophy still defines Ferrari today, from the 812 Superfast's 800 hp V12 to modern V6 hybrids.",
          "Road cars existed, in Enzo's words, only to fund the racing. Yet it is those road cars that made the name immortal.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "Enzo Ferrari died in 1988. He had sold part of the company years earlier but never lost control of its spirit. He remains one of the most studied figures in motorsport — brilliant, difficult, and utterly uncompromising.",
        ],
      },
    ],
    timeline: [
      { year: "1898", label: "BORN", detail: "Enzo Ferrari is born in Modena." },
      { year: "1929", label: "SCUDERIA", detail: "Founding of Scuderia Ferrari." },
      { year: "1939", label: "THE BREAK", detail: "Splits from Alfa Romeo." },
      { year: "1947", label: "FIRST CAR", detail: "The 125 S launches the brand." },
      { year: "1988", label: "THE LEGACY", detail: "Enzo dies, the legend endures." },
    ],
  },

  // ============ LAMBORGHINI — FORGOTTEN/LEGENDS ============
  {
    id: "lamborghini-tractor-to-supercar",
    title: "FROM TRACTORS TO SUPERCARS: THE LAMBORGHINI ORIGIN",
    car: "Lamborghini Countach",
    brand: "Lamborghini",
    year: 1963,
    categories: ["brands", "legends", "supercars"],
    readTime: 7,
    description:
      "The story of a tractor tycoon who built a supercar company — allegedly because he couldn't get a Ferrari clutch fixed.",
    image: IMG.lambo,
    carId: "lamborghini-countach",
    creator: "Ferruccio Lamborghini",
    accent: "#c9a522",
    chapters: [
      {
        title: "THE FARMER",
        paragraphs: [
          "Ferruccio Lamborghini made his fortune after World War II building tractors in northern Italy from surplus military parts. By the 1960s he was wealthy, successful and a Ferrari owner.",
          "The famous — partly legendary — story goes that when Ferruccio complained about his Ferrari's clutch, Enzo Ferrari told him to go back to his tractors. Whether or not the exchange happened exactly as told, it inspired something.",
        ],
      },
      {
        title: "THE CHALLENGE",
        paragraphs: [
          "Ferruccio decided to build a grand tourer that was simply better made than the competition — refined, powerful, and comfortable. He founded Automobili Lamborghini in 1963, unusually hiring young engineers.",
          "The first product, the 350 GT, was elegant and competent. But the car that truly announced Lamborghini was still to come.",
        ],
      },
      {
        title: "THE WEDGE",
        paragraphs: [
          "The 1974 Countach — named after a Piedmontese exclamation of astonishment — discarded beauty for pure drama. Its scissor doors and razor edges defined a new visual language for supercars.",
          "It became the poster on millions of bedroom walls and settled once and for all that Lamborghini was not a Ferrari imitator.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "Ferruccio sold the company in 1974, and it passed through several owners and financial crises. Yet the spirit of challenge he created survives today in cars like the Revuelto and Urus.",
        ],
      },
    ],
    timeline: [
      { year: "1948", label: "TRACTORS", detail: "Ferruccio builds Lamborghini Trattori." },
      { year: "1963", label: "THE CAR COMPANY", detail: "Automobili Lamborghini is founded." },
      { year: "1974", label: "THE COUNTACH", detail: "The wedge changes everything." },
      { year: "1998", label: "THE LEGEND", detail: "Audi era begins; the icon persists." },
    ],
  },

  // ============ BUGATTI — ENGINEERING ============
  {
    id: "bugatti-chiron-engineering",
    title: "THE CHIRON: 1,600 HORSEPOWER OF OBSESSION",
    car: "Bugatti Chiron Super Sport",
    brand: "Bugatti",
    year: 2016,
    categories: ["engineering", "supercars", "brands"],
    readTime: 6,
    description:
      "Building a 1,600 hp road car that survives 400 km/h without melting is an engineering problem in itself.",
    image: IMG.bugatti,
    carId: "bugatti-chiron-super-sport",
    accent: "#3a6bff",
    chapters: [
      {
        title: "THE PROBLEM",
        paragraphs: [
          "When the Veyron retired in 2015, Bugatti faced an impossible follow-up: more power, more speed, in a car that must start, steer and stop like a normal vehicle.",
          "The target was 1,500 hp — later raised to 1,600 with the Super Sport 300+.",
        ],
      },
      {
        title: "THE ENGINE",
        paragraphs: [
          "The signature 8.0-litre W16 engine — effectively two V8s sharing a crank — produces 1,600 hp with four turbochargers. Coolant, oil and fuel systems must cope with ferocious heat loads.",
          "Simple systems became engineering peaks: ten radiators manage the thermal load of a car travelling faster than most aircraft take off.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "Weight, aero and tyre technology define the top speed. At 400 km/h the Chiron's tyres must survive forces no production tyre was designed for.",
          "In 2019 a modified Chiron became the first production car to break 300 mph (482 km/h) — a record achieved through relentless, incremental engineering.",
        ],
      },
    ],
    timeline: [
      { year: "2016", label: "THE BEGINNING", detail: "Chiron launches at Geneva." },
      { year: "2019", label: "THE RECORD", detail: "First road car past 300 mph." },
      { year: "2022", label: "THE LEGEND", detail: "Super Sport 300+ production run." },
    ],
  },

  // ============ TOYOTA 2000GT — FORGOTTEN/JDM ============
  {
    id: "toyota-2000gt-rebirth",
    title: "THE TOYOTA 2000GT: THE CAR THAT PROVED JAPAN",
    car: "Toyota 2000GT",
    brand: "Toyota",
    year: 1967,
    categories: ["forgotten", "jdm", "classics"],
    readTime: 6,
    description:
      "When Japan's carmakers were dismissed as imitators, one sleek coupé silenced the critics.",
    image: IMG.toyota,
    carId: "toyota-2000gt",
    accent: "#d8473a",
    hidden: true,
    chapters: [
      {
        title: "THE DOUBT",
        paragraphs: [
          "In the early 1960s the world saw Japan as a maker of cheap, unremarkable cars. The 2000GT was Toyota's answer to that perception.",
          "Designed with input from Yamaha, the car was developed for the grand touring market with real ambition and a lot to prove.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "Powered by a 2.0-litre straight-six and clothed in a stunning fastback body, the 2000GT delivered genuine performance and exotic looks.",
          "It gained international fame — including a starring role in a James Bond film — and forced observers to take Japanese engineering seriously.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "Only 351 were built, making it among the rarest and most valuable Japanese cars ever. It laid the groundwork for every Japanese sports car that followed.",
        ],
      },
    ],
    timeline: [
      { year: "1965", label: "FIRST SHOWING", detail: "2000GT debuts at Tokyo." },
      { year: "1967", label: "PRODUCTION", detail: "A limited, landmark run begins." },
      { year: "1970", label: "THE LEGEND", detail: "Just 351 built; a collector grail." },
    ],
  },

  // ============ NISSAN SKYLINE R34 ============
  {
    id: "nissan-skyline-r34",
    title: "THE R34: HOW ONE CAR DEFINED A GENERATION",
    car: "Nissan Skyline GT-R R34",
    brand: "Nissan",
    year: 1999,
    categories: ["jdm", "legends", "racing"],
    readTime: 7,
    description:
      "Godzilla's final '90s form became a global icon through games, films and sheer onroad presence.",
    image: IMG.nissan,
    carId: "nissan-skyline-r34",
    accent: "#3f63c9",
    chapters: [
      {
        title: "THE LINEAGE",
        paragraphs: [
          "The Skyline GT-R had been a touring-car legend since the Hakosuka of the late 1960s, and gained its 'Godzilla' nickname dominating Australian touring car racing in the early '90s.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "The R34 (1999–2002) refined the formula: the RB26DETT twin-turbo straight-six, sophisticated ATTESA all-wheel drive, and a computer that could tune everything in real time.",
          "On paper it quoted around 280 hp — the result of Japan's informal 'gentlemen's agreement' — but in reality it delivered far more.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "Popular culture, from video games to films, turned the R34 into one of the most recognisable Japanese cars ever built. Its values have soared as a modern classic.",
        ],
      },
    ],
    timeline: [
      { year: "1989", label: "THE BEGINNING", detail: "R32 GT-R returns, dominating racing." },
      { year: "1999", label: "THE MACHINE", detail: "R34 launches." },
      { year: "2002", label: "THE END", detail: "Production ends; legend grows." },
    ],
  },

  // ============ BMW E30 M3 ============
  {
    id: "bmw-e30-m3-racing",
    title: "THE E30 M3: BUILT TO RACE, LOVED TO DRIVE",
    car: "BMW E30 M3",
    brand: "BMW",
    year: 1986,
    categories: ["racing", "classics", "sports"],
    readTime: 6,
    description:
      "The most successful touring car of all time began as a homologation special with a four-cylinder engine.",
    image: IMG.bmw,
    carId: "bmw-e30-m3",
    accent: "#3b6ea8",
    chapters: [
      {
        title: "THE RULES",
        paragraphs: [
          "Touring-car rules required manufacturers to sell a road-going version of the cars they raced. BMW needed 5,000 road cars to homologate its Group A racer.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "Rather than a big six, BMW chose a high-revving 2.3-litre four-cylinder and muscular flared arches. The result was a car honed for racing that, unusually, was superb on the road too.",
          "It went on to win more touring-car races than any other car in history.",
        ],
      },
    ],
    timeline: [
      { year: "1986", label: "THE BEGINNING", detail: "E30 M3 launch." },
      { year: "1987", label: "VICTORY", detail: "Touring car title wins begin." },
      { year: "1991", label: "THE LEGEND", detail: "Production ends with a racing legacy." },
    ],
  },

  // ============ MERCEDES 300SL — ENGINEERING/CLASSICS ============
  {
    id: "mercedes-300sl-gullwing",
    title: "THE GULLWING DOORS OF THE 300 SL",
    car: "Mercedes-Benz 300 SL",
    brand: "Mercedes-Benz",
    year: 1954,
    categories: ["classics", "engineering", "brands"],
    readTime: 5,
    description:
      "The world's fastest production car of 1954 was born from a racing car — and a set of very famous doors.",
    image: IMG.mercedes,
    carId: "mercedes-300sl",
    accent: "#aeb5c0",
    chapters: [
      {
        title: "THE RACE",
        paragraphs: [
          "The 300 SL began as a competition car, the W194, which won Le Mans and the Carrera Panamericana in 1952.",
        ],
      },
      {
        title: "THE DOORS",
        paragraphs: [
          "The gullwing doors were not a style choice but an engineering necessity: the tubular spaceframe rose too high at the sills to fit conventional doors.",
          "On sale from 1954, the 300 SL became the first production car with four-wheel independent suspension and, more famously, fuel injection.",
        ],
      },
    ],
    timeline: [
      { year: "1952", label: "THE RACE", detail: "W194 wins Le Mans." },
      { year: "1954", label: "THE MACHINE", detail: "Production 300 SL launches." },
      { year: "1963", label: "THE LEGEND", detail: "Production ends; icon status secured." },
    ],
  },

  // ============ LEXUS LFA — ENGINEERING/FORGOTTEN ============
  {
    id: "lexus-lfa-ten-years",
    title: "THE LEXUS LFA: TEN YEARS TO PERFECTION",
    car: "Lexus LFA",
    brand: "Lexus",
    year: 2010,
    categories: ["engineering", "supercars", "forgotten"],
    readTime: 6,
    description:
      "Lexus spent a decade — and reportedly more money than it could recover — chasing a perfect V10 song.",
    image: IMG.lfa,
    carId: "lexus-lfa",
    accent: "#e5c55a",
    hidden: true,
    chapters: [
      {
        title: "THE DELAY",
        paragraphs: [
          "The LFA project began around 2000 and originally used an aluminium chassis. Midway through, Toyota switched to carbon fibre, forcing a complete redesign and years of delay.",
        ],
      },
      {
        title: "THE ENGINE",
        paragraphs: [
          "The heart of the LFA is a naturally aspirated 4.8-litre V10, developed with Yamaha. Engineers obsessed over its sound, tuning the intake and exhaust until it recalled a Formula 1 engine.",
          "The engine revs so fast that a digital tachometer — rather than an analogue needle — was required to keep up.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "Just 500 were built. The LFA never made money for Lexus, but it changed how the world saw the brand and remains a benchmark for passion over profit.",
        ],
      },
    ],
    timeline: [
      { year: "2000", label: "THE IDEA", detail: "LFA project begins." },
      { year: "2009", label: "FIRST DELIVERY", detail: "Production LFA debuts." },
      { year: "2012", label: "THE LEGEND", detail: "Final of 500 units built." },
    ],
  },

  // ============ DODGE HELLCAT — BRANDS/ENGINEERING ============
  {
    id: "dodge-hellcat-717",
    title: "THE HELLCAT: 717 HP AND A SECOND CHANCE",
    car: "Dodge Challenger SRT Hellcat",
    brand: "Dodge",
    year: 2015,
    categories: ["engineering", "sports", "brands"],
    readTime: 5,
    description:
      "When American muscle looked finished, one supercharged V8 proved there was life left in a dying formula.",
    image: IMG.dodge,
    carId: "dodge-challenger-hellcat",
    accent: "#b83a2f",
    chapters: [
      {
        title: "THE DOUBT",
        paragraphs: [
          "By the 2010s, big American V8 muscle cars seemed like a heritage act. The Hellcat was Dodge's response: a 707 hp (later 717 hp) supercharged 6.2-litre V8 in a Challenger or Charger.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "The Hellcat didn't just offer power — it offered it at a price that made supercar numbers attainable. It became a cultural phenomenon and briefly the performance bargain of the decade.",
        ],
      },
    ],
    timeline: [
      { year: "2015", label: "THE BEGINNING", detail: "Hellcat launches." },
      { year: "2018", label: "THE FAMILY", detail: "Hellcat spread to SUVs and trucks." },
      { year: "2023", label: "THE END", detail: "Final run of V8 Challengers." },
    ],
  },

  // ============ FORD MUSTANG — LEGENDS ============
  {
    id: "ford-mustang-pony-car",
    title: "THE MUSTANG: AMERICA'S ORIGINAL PONY CAR",
    car: "Ford Mustang",
    brand: "Ford",
    year: 1964,
    categories: ["legends", "brands", "classics"],
    readTime: 6,
    description:
      "Launched in 1964, the Mustang sold 418,000 units in its first year — and invented an entire class of car.",
    image: IMG.ford,
    carId: "ford-mustang-1967",
    accent: "#8b8bff",
    chapters: [
      {
        title: "THE IDEA",
        paragraphs: [
          "In the early 1960s, Ford executive Lee Iacocca wanted a sporty, affordable car for a young generation — built on existing Falcon mechanicals to keep cost low.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "Unveiled at the 1964 New York World's Fair, the Mustang was an instant success, creating the 'pony car' segment that rivals raced to copy.",
        ],
      },
    ],
    timeline: [
      { year: "1964", label: "THE LAUNCH", detail: "Mustang debuts; 22,000 orders day one." },
      { year: "1965", label: "THE RECORD", detail: "418,000 sold in first year." },
      { year: "2023", label: "THE LEGEND", detail: "Seven generations strong." },
    ],
  },

  // ============ PAGANI — CREATOR ============
  {
    id: "horacio-pagani-artist",
    title: "HORACIO PAGANI: THE ARTIST ENGINEER",
    car: "Pagani Huayra",
    brand: "Pagani",
    year: 1999,
    categories: ["creators", "supercars", "engineering"],
    readTime: 6,
    description:
      "An Argentine who grew up building wooden model cars later crafted some of the most obsessive machines in the world.",
    image: IMG.pagani,
    carId: "pagani-huayra",
    creator: "Horacio Pagani",
    accent: "#c9a522",
    chapters: [
      {
        title: "THE BEGINNING",
        paragraphs: [
          "Horacio Pagani grew up in Argentina, where he built model cars and, as a student, a small buggy. He is documented as having written to various carmakers seeking work before joining Lamborghini in the 1980s.",
        ],
      },
      {
        title: "THE CRAFT",
        paragraphs: [
          "At Lamborghini he pushed for carbon-fibre construction. In 1992 he founded Pagani Automobili, and in 1999 revealed the Zonda — a car defined by obsessive detail.",
          "The Huayra that followed continued his philosophy: every visible component, even unseen fasteners, finished like a jewel.",
        ],
      },
    ],
    timeline: [
      { year: "1980s", label: "THE BEGINNING", detail: "Pagani joins Lamborghini." },
      { year: "1999", label: "THE ZONDA", detail: "First Pagani debuts." },
      { year: "2011", label: "THE HUAYRA", detail: "Second generation arrives." },
    ],
  },

  // ============ DATSUN 240Z — HIDDEN/JDM ============
  {
    id: "datsun-240z-western-dream",
    title: "THE 240Z: JAPAN CONQUERS THE WEST",
    car: "Datsun 240Z",
    brand: "Datsun",
    year: 1969,
    categories: ["forgotten", "jdm", "classics"],
    readTime: 5,
    description:
      "An affordable sports car that out-handled cars twice its price — and rewrote the rules of the American market.",
    image: IMG.datsun,
    carId: "datsun-240z",
    accent: "#e0863a",
    hidden: true,
    chapters: [
      {
        title: "THE GAMBLE",
        paragraphs: [
          "Nissan bet that American buyers wanted an affordable, well-made sporty coupé. The 240Z, sold under the Datsun name, delivered European-style performance at a domestic price.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "With a 2.4-litre straight-six and clean fastback styling, the 240Z became one of the best-selling sports cars of its era and proof that Japan could lead, not follow.",
        ],
      },
    ],
    timeline: [
      { year: "1969", label: "THE LAUNCH", detail: "240Z debuts to acclaim." },
      { year: "1973", label: "THE LEGEND", detail: "One of the era's best sellers." },
    ],
  },

  // ============ McLAREN F1 — ENGINEERING/SUPERCARS ============
  {
    id: "mclaren-f1-genius",
    title: "THE McLAREN F1: ONE MAN'S PERFECT CAR",
    car: "McLaren F1",
    brand: "McLaren",
    year: 1992,
    categories: ["supercars", "engineering", "legends"],
    readTime: 7,
    description:
      "Gordon Murray's radical three-seat F1 rewrote the rulebook and stayed the fastest naturally aspirated road car for over a decade.",
    image: IMG.mclaren,
    carId: "mclaren-720s",
    creator: "Gordon Murray",
    accent: "#d94f2b",
    chapters: [
      {
        title: "THE VISION",
        paragraphs: [
          "Gordon Murray, fresh from designing championship-winning Brabham and McLaren race cars, wanted to build the ultimate road car — not a compromise, but a clean-sheet expression of what he believed a car should be.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "The F1 placed the driver in the centre, with passengers flanking behind, and used a carbon-fibre monocoque years ahead of its rivals. A BMW-sourced 6.1-litre V12 produced 627 hp and a top speed, in 1998, of 386 km/h.",
          "Its central driving position, gold-lined engine bay and obsessive weight-saving made it unlike anything else ever built.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "Only 106 were made, yet the F1 redefined what a hypercar could be and remains a benchmark — and one of the most valuable cars in existence.",
        ],
      },
    ],
    timeline: [
      { year: "1988", label: "THE IDEA", detail: "Murray sketches the F1." },
      { year: "1992", label: "THE MACHINE", detail: "F1 launches." },
      { year: "1998", label: "THE RECORD", detail: "386 km/h production record." },
    ],
  },

  // ============ KOENIGSEGG — CREATORS ============
  {
    id: "koenigsegg-origin",
    title: "CHRISTIAN VON KOENIGSEGG: THE DREAM THAT WOULDN'T DIE",
    car: "Koenigsegg Jesko",
    brand: "Koenigsegg",
    year: 2002,
    categories: ["creators", "supercars", "engineering"],
    readTime: 6,
    description:
      "A young Swede with no car company turned a childhood dream into one of the world's most advanced hypercar makers.",
    image: IMG.koenigsegg,
    carId: "koenigsegg-jesko",
    creator: "Christian von Koenigsegg",
    accent: "#c9b13a",
    chapters: [
      {
        title: "THE DREAM",
        paragraphs: [
          "Christian von Koenigsegg grew up in Sweden with a fascination for machines and, reportedly, a childhood ambition to build a perfect sports car. In 1994, at 22, he founded the company that still bears his name.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "The first prototype, the CC, was shown in 1996 and took years of refinement — and the company survived near-collapse — before the CC8S reached customers in 2002.",
          "Koenigsegg later pioneered free-valve technology and the 'world's fastest production car' title with the Agera RS in 2017.",
        ],
      },
    ],
    timeline: [
      { year: "1994", label: "THE BEGINNING", detail: "Company founded at 22." },
      { year: "2002", label: "FIRST CARS", detail: "CC8S delivered." },
      { year: "2017", label: "THE RECORD", detail: "Agera RS sets top-speed record." },
    ],
  },

  // ============ TOYOTA SUPRA — JDM/LEGENDS ============
  {
    id: "toyota-supra-legend",
    title: "THE TOYOTA SUPRA: FROM GT CRUISER TO ICON",
    car: "Toyota Supra",
    brand: "Toyota",
    year: 1993,
    categories: ["jdm", "legends", "sports"],
    readTime: 6,
    description:
      "The fourth-generation Supra's legendary 2JZ engine made it the car a whole generation dreamed of."
      ,
    image: IMG.toyota,
    carId: "toyota-supra-mk4",
    accent: "#e05a2b",
    chapters: [
      {
        title: "THE EVOLUTION",
        paragraphs: [
          "The Supra began as a six-cylinder Celica variant in the late 1970s, then grew into a standalone grand tourer through four generations.",
        ],
      },
      {
        title: "THE 2JZ",
        paragraphs: [
          "The heart of the A80 Supra was the 2JZ-GTE twin-turbo straight-six, officially rated at 276 hp under Japan's guidelines but famously capable of far more once tuned.",
          "Its over-engineered iron block made it one of the most tuneable engines ever produced, and a fixture of drag racing and drifting.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "Pop culture and motorsport turned the Supra A80 into a global icon. After an 17-year hiatus, the name returned in 2019 with the A90.",
        ],
      },
    ],
    timeline: [
      { year: "1978", label: "THE BEGINNING", detail: "First Supra debuts." },
      { year: "1993", label: "THE 2JZ", detail: "A80 generation launches." },
      { year: "2019", label: "THE RETURN", detail: "A90 revives the name." },
    ],
  },

  // ============ HONDA NSX — ENGINEERING/JDM ============
  {
    id: "honda-nsx-audacity",
    title: "THE HONDA NSX: JAPAN'S EVERYDAY SUPERCAR",
    car: "Honda NSX",
    brand: "Honda",
    year: 1990,
    categories: ["engineering", "jdm", "supercars"],
    readTime: 6,
    description:
      "Honda set out to prove a supercar could be reliable and usable — with a little help from Ayrton Senna.",
    image: IMG.honda,
    carId: "honda-nsx",
    accent: "#c8102e",
    chapters: [
      {
        title: "THE CHALLENGE",
        paragraphs: [
          "In the late 1980s Honda decided to build a mid-engined supercar that, unlike its temperamental Italian rivals, would start every morning and work every day.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "The NSX used an aluminium monocoque — a world first for a production car — and was tuned with input from Formula 1 champion Ayrton Senna, who refined its chassis feel.",
          "When it launched in 1990 it matched Ferrari performance while being effortless to live with, forcing the establishment to respond.",
        ],
      },
    ],
    timeline: [
      { year: "1989", label: "FIRST SHOWING", detail: "NSX revealed." },
      { year: "1990", label: "THE MACHINE", detail: "Production begins." },
      { year: "2005", label: "THE LEGACY", detail: "First generation ends." },
    ],
  },

  // ============ AUDI QUATTRO — RACING/REVOLUTION ============
  {
    id: "audi-quattro-revolution",
    title: "THE AUDI QUATTRO: ALL-WHEEL DRIVE CHANGES EVERYTHING",
    car: "Audi Quattro",
    brand: "Audi",
    year: 1980,
    categories: ["racing", "engineering", "legends"],
    readTime: 6,
    description:
      "When Audi put all-wheel drive into a rally car, the entire motorsport world had to catch up.",
    image: IMG.porsche959,
    carId: "audi-r8-v10",
    accent: "#c0c0c8",
    chapters: [
      {
        title: "THE IDEA",
        paragraphs: [
          "Audi engineers noticed that a four-wheel-drive 'Iltis' military vehicle could out-accelerate higher-powered cars on loose surfaces. That observation became the Quattro.",
        ],
      },
      {
        title: "THE REVOLUTION",
        paragraphs: [
          "The Quattro debuted in 1980 and dominated rallying, winning championships and forcing rival teams to adopt all-wheel drive. Its legacy defines Audi to this day — and every modern AWD performance car.",
        ],
      },
    ],
    timeline: [
      { year: "1980", label: "THE BEGINNING", detail: "Quattro launches." },
      { year: "1981", label: "THE VICTORY", detail: "WRC success begins." },
      { year: "1984", label: "THE LEGACY", detail: "Rivals follow AWD." },
    ],
  },

  // ============ PORSCHE 959 — ENGINEERING ============
  {
    id: "porsche-959-tech-marvel",
    title: "THE PORSCHE 959: THE FUTURE, BUILT EARLY",
    car: "Porsche 959",
    brand: "Porsche",
    year: 1986,
    categories: ["engineering", "supercars", "legends"],
    readTime: 6,
    description:
      "A 450 hp all-wheel-drive supercar with technology so advanced it was years ahead of its time.",
    image: IMG.porsche959,
    carId: "porsche-911-turbo-s",
    accent: "#8a8a8f",
    chapters: [
      {
        title: "THE TECHNOLOGY",
        paragraphs: [
          "The 959 was a rolling laboratory: a twin-turbo flat-six, computer-controlled all-wheel drive, adjustable ride height, and a sequential turbo setup that predated modern active systems.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "With 450 hp and a top speed near 317 km/h, the 959 was briefly the fastest road car in the world — and later dominated the Paris-Dakar rally in modified form.",
        ],
      },
    ],
    timeline: [
      { year: "1983", label: "THE IDEA", detail: "959 concept shown." },
      { year: "1986", label: "THE MACHINE", detail: "Series production begins." },
      { year: "1993", label: "THE LEGACY", detail: "Tech lives on in the 911." },
    ],
  },

  // ============ FERRARI F40 — LEGENDS ============
  {
    id: "ferrari-f40-last-of-its-kind",
    title: "THE FERRARI F40: ENZO'S FINAL GIFT",
    car: "Ferrari F40",
    brand: "Ferrari",
    year: 1987,
    categories: ["legends", "supercars", "classics"],
    readTime: 6,
    description:
      "Born to celebrate 40 years of Ferrari, the F40 was the last car approved by Enzo Ferrari himself.",
    image: IMG.ferrari2,
    carId: "ferrari-812-superfast",
    accent: "#c41f2e",
    chapters: [
      {
        title: "THE HOMAGE",
        paragraphs: [
          "For the marque's 40th anniversary in 1987, Ferrari created a car with one purpose: pure, unadulterated performance in tribute to Enzo's racing obsession.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "A twin-turbo 2.9-litre V8 produced 478 hp, making the F40 the first production car to break 200 mph (around 201 mph claimed). It stripped away everything non-essential — no carpets, no soundproofing, minimal everything.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "The F40 was the last car personally signed off by Enzo before his death in 1988, and remains one of the most loved supercars ever built.",
        ],
      },
    ],
    timeline: [
      { year: "1987", label: "THE LAUNCH", detail: "F40 debuts." },
      { year: "1988", label: "THE FAREWELL", detail: "Enzo passes away." },
      { year: "1992", label: "THE LEGEND", detail: "Final F40s built." },
    ],
  },

  // ============ MAZDA RX-7 — JDM/ENGINEERING ============
  {
    id: "mazda-rx7-rotary",
    title: "THE MAZDA RX-7: THE ROTARY THAT REFUSED TO DIE",
    car: "Mazda RX-7",
    brand: "Mazda",
    year: 1978,
    categories: ["jdm", "engineering", "sports"],
    readTime: 5,
    description:
      "Mazda bet everything on the Wankel rotary engine — and the RX-7 proved the gamble could succeed.",
    image: IMG.rx7,
    carId: "mazda-rx-8",
    accent: "#e05a2b",
    chapters: [
      {
        title: "THE GAMBLE",
        paragraphs: [
          "Mazda was a small company that bet heavily on the rotary engine, licensing the Wankel design and refining it despite constant setbacks.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "The RX-7, launched in 1978, made the rotary mainstream: light, balanced and powered by the spinning 12A and later 13B engines. The FD generation became a JDM legend.",
          "Fuel efficiency and emissions challenges eventually ended the rotary's run, but its devotees remain among the most loyal in all of motoring.",
        ],
      },
    ],
    timeline: [
      { year: "1967", label: "THE GAMBLE", detail: "First rotary Cosmo." },
      { year: "1978", label: "THE RX-7", detail: "First generation debuts." },
      { year: "2002", label: "THE FD ENDS", detail: "Last RX-7 built." },
    ],
  },

  // ============ DODGE VIPER — BRANDS ============
  {
    id: "dodge-viper-american-brute",
    title: "THE DODGE VIPER: AMERICA'S RAWEST SUPERCAR",
    car: "Dodge Viper",
    brand: "Dodge",
    year: 1992,
    categories: ["brands", "supercars", "sports"],
    readTime: 5,
    description:
      "A V10, no driver aids, and a refusal to compromise — the Viper was American muscle taken to its extreme.",
    image: IMG.dodge,
    carId: "dodge-viper-srt",
    accent: "#b83a2f",
    chapters: [
      {
        title: "THE IDEA",
        paragraphs: [
          "Conceived in the late 1980s, the Viper was Dodge's answer to the question of what an American supercar should be: an 8.0-litre V10, rear-wheel drive, and virtually no electronic safety net.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "Its massive V10 — derived from a truck engine — gave it brutal acceleration and a raw, demanding character that made it a legend among enthusiasts who wanted pure, uncompromising performance.",
        ],
      },
    ],
    timeline: [
      { year: "1989", label: "THE CONCEPT", detail: "Viper shown at Detroit." },
      { year: "1992", label: "THE MACHINE", detail: "Production begins." },
      { year: "2017", label: "THE END", detail: "Final Viper built." },
    ],
  },

  // ============ FORD GT40 — RACING/LEGENDS ============
  {
    id: "ford-gt40-lemans",
    title: "THE FORD GT40: REVENGE AT LE MANS",
    car: "Ford GT40",
    brand: "Ford",
    year: 1966,
    categories: ["racing", "legends", "brands"],
    readTime: 7,
    description:
      "How a botched Ferrari takeover turned into one of motorsport's greatest revenge stories.",
    image: IMG.race1,
    carId: "ford-gt40",
    accent: "#3b82f6",
    chapters: [
      {
        title: "THE DEAL",
        paragraphs: [
          "In the early 1960s, Ford nearly bought Ferrari. When negotiations collapsed at the last moment, Henry Ford II reportedly ordered his team to beat Ferrari at Le Mans — its home race.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "The result was the GT40, a low-slung British-American collaboration. After failures in 1964 and 1965, it finally beat Ferrari in 1966 — and won Le Mans four years straight, 1966 to 1969.",
        ],
      },
      {
        title: "THE LEGACY",
        paragraphs: [
          "The GT40's legend directly inspired Ford's 2005 GT and 2016 GT supercars, and the story became a celebrated film.",
        ],
      },
    ],
    timeline: [
      { year: "1963", label: "THE DEAL", detail: "Ferrari sale collapses." },
      { year: "1966", label: "THE VICTORY", detail: "1-2-3 finish at Le Mans." },
      { year: "1969", label: "THE LEGACY", detail: "Four straight wins." },
    ],
  },

  // ============ LAMBORGHINI MIURA — FORGOTTEN/CLASSICS ============
  {
    id: "lamborghini-miura-birth",
    title: "THE LAMBORGHINI MIURA: THE FIRST SUPERCAR",
    car: "Lamborghini Miura",
    brand: "Lamborghini",
    year: 1966,
    categories: ["classics", "supercars", "legends"],
    readTime: 6,
    description:
      "A transverse V12 mounted behind the driver — the Miura invented the modern supercar layout.",
    image: IMG.lambo,
    carId: "lamborghini-countach",
    accent: "#c9a522",
    chapters: [
      {
        title: "THE IDEA",
        paragraphs: [
          "In the mid-1960s, a team of young Lamborghini engineers — working largely after hours — sketched a radical mid-engined road car with a V12 mounted sideways behind the driver.",
          "Ferruccio Lamborghini, focused on grand tourers, was reluctant. But the car was far too good to ignore.",
        ],
      },
      {
        title: "THE MACHINE",
        paragraphs: [
          "Unveiled at the 1966 Geneva show, the Miura stunned the world and effectively created the modern supercar template. Its 3.9-litre V12 and breathtaking looks made it the poster car of its age.",
        ],
      },
    ],
    timeline: [
      { year: "1966", label: "THE BEGINNING", detail: "Miura unveiled." },
      { year: "1973", label: "THE LEGEND", detail: "Production ends." },
    ],
  },

  // ============ TOYOTA AE86 — JDM/FORGOTTEN ============
  {
    id: "toyota-ae86-legend",
    title: "THE AE86: THE LITTLE CAR THAT GREW INTO A LEGEND",
    car: "Toyota AE86 Sprinter Trueno",
    brand: "Toyota",
    year: 1983,
    categories: ["jdm", "forgotten", "classics"],
    readTime: 5,
    description:
      "An unremarkable lightweight coupe became the drift icon that defined Japanese car culture.",
    image: IMG.toyota,
    carId: "toyota-ae86-sprinter-trueno",
    accent: "#e05a2b",
    hidden: true,
    chapters: [
      {
        title: "THE HUMBLE START",
        paragraphs: [
          "The AE86 was an ordinary lightweight rear-drive Corolla variant — nothing special on paper. What made it special was balance, lightness and a rev-happy engine.",
        ],
      },
      {
        title: "THE CULT",
        paragraphs: [
          "Through drifting, motorsport and a certain famous manga, the AE86 — especially the 'Hachiroku' Trueno — became the most beloved of all Japanese enthusiast cars, its values soaring decades after production.",
        ],
      },
    ],
    timeline: [
      { year: "1983", label: "THE BEGINNING", detail: "AE86 launches." },
      { year: "1987", label: "THE END", detail: "Production ends." },
      { year: "1995", label: "THE CULT", detail: "Drifting makes it a legend." },
    ],
  },
];

// Attach galleries to any story that lacks an explicit one.
// Each gallery reuses the story's hero image plus real supporting
// themed images (racing / engineering / design), never duplicates.
export const stories: Story[] = rawStories.map((s, i) => ({
  ...s,
  gallery: s.gallery ?? storyGallery(s.image, i),
}));

export function storyById(id: string): Story | undefined {
  return stories.find((s) => s.id === id);
}

export const featuredStory = stories.find((s) => s.featured);
