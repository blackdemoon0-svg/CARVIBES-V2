// ============================================================
// CARVIBES — compact car authoring helpers + image pool
// ============================================================
import { px } from "./cars";
import type { Car, Category, Fuel, Transmission, Drivetrain } from "./cars";

// Brand → relevant real, legally-licensed Pexels photo id(s).
// Every brand is mapped to real automotive photography so that
// no vehicle ever renders a broken / gray / generic placeholder.
// Iconic models retain their own exact photos where known.
export const BRAND_IMAGES: Record<string, number> = {
  Ferrari: 12506011,
  Lamborghini: 17632049,
  Porsche: 38234790,
  McLaren: 29115178,
  Bugatti: 32364051,
  Koenigsegg: 18366087,
  Pagani: 31417515,
  "Aston Martin": 94272,
  Bentley: 16124126,
  "Rolls-Royce": 11770448,
  Maserati: 19382415,
  Lotus: 38412217,
  Rimac: 30306584,
  "Mercedes-Benz": 13324313,
  "Mercedes-AMG": 16511358,
  Maybach: 11770448,
  BMW: 29580174,
  Audi: 30687976,
  Volkswagen: 7412624,
  "Alfa Romeo": 11205815,
  Jaguar: 9411653,
  "Land Rover": 31574920,
  Volvo: 31574925,
  Lexus: 10029873,
  Toyota: 13627441,
  Nissan: 20131555,
  Honda: 20043434,
  Mazda: 33229798,
  Subaru: 35831596,
  Mitsubishi: 9702328,
  Suzuki: 16896042,
  Infiniti: 29580161,
  Acura: 30570357,
  Ford: 37508222,
  Chevrolet: 30090368,
  Dodge: 34071036,
  Cadillac: 18435540,
  Chrysler: 33616781,
  Jeep: 9993526,
  GMC: 29566897,
  RAM: 29566905,
  Tesla: 35736779,
  Lucid: 29566904,
  Polestar: 30306584,
  Hyundai: 29807888,
  Kia: 29807888,
  Genesis: 20430089,
  BYD: 33229798,
  NIO: 35736771,
  Peugeot: 16896057,
  Renault: 7412619,
  "Citroën": 16896042,
  Alpine: 11205815,
  Cupra: 33808591,
  SEAT: 9702328,
  Skoda: 20270367,
  Fiat: 15953025,
  Mini: 9545383,
  Opel: 20270367,
  Saab: 12954631,
  "Shelby": 33787717,
  "AC": 33787717,
  "Lancia": 11931440,
  "Datsun": 3966847,
};

// A deterministic fallback so no car can ever have a missing image.
const GENERIC_AUTO = [
  29566902, 18108314, 17632052, 29566880, 30687977, 29566892, 30735110,
  17632051, 37822524, 26890026, 3966847, 23952863, 10921166, 38136077,
  37768141, 18435526, 12954631, 5505846, 38419226, 38203106,
];

export function brandImage(brand: string): string {
  const id = BRAND_IMAGES[brand];
  if (id) return px(id, 1200, 800);
  const hash = Array.from(brand).reduce((s, c) => s + c.charCodeAt(0), 0);
  return px(GENERIC_AUTO[hash % GENERIC_AUTO.length], 1200, 800);
}

interface CarSeed {
  brand: string;
  model: string;
  year: number;
  cats: Category[];
  body: string;
  price: number;
  engine: string;
  fuel: Fuel;
  hp: number;
  trans: Transmission;
  zto100?: number;
  top?: number;
  torque?: number;
  drive?: Drivetrain;
  weight?: number;
  gen?: string;
  img?: number;
}

/** Build a full Car object from a compact seed. */
export function c(seed: CarSeed): Car {
  return {
    id: `${seed.brand}-${seed.model}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    brand: seed.brand,
    model: seed.model,
    generation: seed.gen,
    year: seed.year,
    categories: seed.cats,
    body: seed.body,
    price: seed.price,
    engine: seed.engine,
    fuel: seed.fuel,
    hp: seed.hp,
    torque: seed.torque ?? 0,
    transmission: seed.trans,
    drivetrain: seed.drive,
    zeroToHundred: seed.zto100 ?? 0,
    topSpeed: seed.top ?? 0,
    weight: seed.weight ?? 0,
    image: seed.img ? px(seed.img, 1200, 800) : brandImage(seed.brand),
    gallery: seed.img ? [px(seed.img, 1400, 900)] : [brandImage(seed.brand)],
  };
}
