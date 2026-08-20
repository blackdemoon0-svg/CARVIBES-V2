import { c } from "../carBuilder";
import type { Car } from "../cars";

export const french: Car[] = [
  c({ brand: "Peugeot", model: "208 GTi", year: 2018, cats: ["daily", "sports"], body: "Hatchback", price: 25000, engine: "1.6L Turbo I4", fuel: "Petrol", hp: 208, trans: "Manual", zto100: 6.5, top: 230, torque: 300, drive: "FWD", weight: 1160, img: 16896057 }),
  c({ brand: "Peugeot", model: "508 GT", year: 2023, cats: ["daily", "luxury"], body: "Sedan", price: 45000, engine: "1.6L Turbo I4 Hybrid", fuel: "Hybrid", hp: 225, trans: "Automatic", zto100: 7.9, top: 240, torque: 360, drive: "FWD", weight: 1650 }),
  c({ brand: "Peugeot", model: "3008", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 35000, engine: "1.2L Turbo I3", fuel: "Petrol", hp: 130, trans: "Automatic", zto100: 9.0, top: 190, torque: 230, drive: "FWD", weight: 1420 }),
  c({ brand: "Renault", model: "Clio", year: 2023, cats: ["daily"], body: "Hatchback", price: 20000, engine: "1.0L Turbo I3", fuel: "Petrol", hp: 90, trans: "Manual", zto100: 11.0, top: 175, torque: 160, drive: "FWD", weight: 1150, img: 7412619 }),
  c({ brand: "Renault", model: "Megane RS", year: 2023, cats: ["daily", "sports"], body: "Hatchback", price: 42000, engine: "1.8L Turbo I4", fuel: "Petrol", hp: 300, trans: "Dual-clutch", zto100: 5.7, top: 250, torque: 420, drive: "FWD", weight: 1470 }),
  c({ brand: "Renault", model: "5 Turbo", year: 1983, cats: ["classic", "sports"], body: "Hatchback", price: 80000, engine: "1.4L Turbo I4", fuel: "Petrol", hp: 160, trans: "Manual", zto100: 6.5, top: 205, torque: 220, drive: "RWD", weight: 970 }),
  c({ brand: "Citroën", model: "C3", year: 2023, cats: ["daily"], body: "Hatchback", price: 18000, engine: "1.2L Turbo I3", fuel: "Petrol", hp: 110, trans: "Manual", zto100: 10.0, top: 185, torque: 205, drive: "FWD", weight: 1100, img: 16896042 }),
  c({ brand: "Citroën", model: "2CV", year: 1975, cats: ["classic"], body: "Hatchback", price: 20000, engine: "0.6L NA Flat-2", fuel: "Petrol", hp: 29, trans: "Manual", zto100: 0, top: 105, torque: 46, drive: "FWD", weight: 560 }),
  c({ brand: "Citroën", model: "DS", year: 1970, cats: ["classic", "luxury"], body: "Sedan", price: 40000, engine: "2.2L NA I4", fuel: "Petrol", hp: 115, trans: "Manual", zto100: 12.0, top: 165, torque: 160, drive: "FWD", weight: 1370 }),
  c({ brand: "Alpine", model: "A110", year: 2023, cats: ["sports"], body: "Coupe", price: 72000, engine: "1.8L Turbo I4", fuel: "Petrol", hp: 300, trans: "Dual-clutch", zto100: 4.2, top: 250, torque: 340, drive: "RWD", weight: 1100, img: 11205815 }),
  c({ brand: "Alpine", model: "A110 R", year: 2023, cats: ["sports"], body: "Coupe", price: 95000, engine: "1.8L Turbo I4", fuel: "Petrol", hp: 300, trans: "Dual-clutch", zto100: 3.9, top: 250, torque: 340, drive: "RWD", weight: 1080 }),
];

export const seatSkodaCupra: Car[] = [
  c({ brand: "SEAT", model: "Leon", year: 2023, cats: ["daily", "sports"], body: "Hatchback", price: 28000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 190, trans: "Dual-clutch", zto100: 7.2, top: 231, torque: 320, drive: "FWD", weight: 1350, img: 9702328 }),
  c({ brand: "SEAT", model: "Ibiza", year: 2023, cats: ["daily"], body: "Hatchback", price: 20000, engine: "1.0L Turbo I3", fuel: "Petrol", hp: 110, trans: "Manual", zto100: 9.9, top: 195, torque: 200, drive: "FWD", weight: 1130 }),
  c({ brand: "Cupra", model: "Formentor", year: 2023, cats: ["suv", "sports"], body: "SUV", price: 40000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 310, trans: "Dual-clutch", zto100: 4.9, top: 250, torque: 400, drive: "AWD", weight: 1570, img: 33808591 }),
  c({ brand: "Cupra", model: "Born", year: 2023, cats: ["electric", "daily"], body: "Hatchback", price: 40000, engine: "Single-Motor Electric", fuel: "Electric", hp: 228, trans: "Automatic", zto100: 6.6, top: 160, torque: 310, drive: "RWD", weight: 1800 }),
  c({ brand: "Cupra", model: "Leon VZ", year: 2023, cats: ["daily", "sports"], body: "Hatchback", price: 42000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 300, trans: "Dual-clutch", zto100: 4.9, top: 250, torque: 400, drive: "FWD", weight: 1450 }),
  c({ brand: "Skoda", model: "Octavia RS", year: 2023, cats: ["daily", "sports"], body: "Sedan", price: 40000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 245, trans: "Dual-clutch", zto100: 6.6, top: 250, torque: 370, drive: "FWD", weight: 1450, img: 20270367 }),
  c({ brand: "Skoda", model: "Superb", year: 2023, cats: ["daily"], body: "Sedan", price: 35000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 190, trans: "Dual-clutch", zto100: 7.5, top: 240, torque: 320, drive: "FWD", weight: 1600 }),
  c({ brand: "Skoda", model: "Kodiaq", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 37000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 190, trans: "Dual-clutch", zto100: 7.7, top: 210, torque: 320, drive: "AWD", weight: 1700 }),
];

export const fiatMiniOpel: Car[] = [
  c({ brand: "Fiat", model: "500", year: 2023, cats: ["daily"], body: "Hatchback", price: 19000, engine: "1.0L NA I3 Hybrid", fuel: "Hybrid", hp: 70, trans: "Manual", zto100: 13.8, top: 167, torque: 92, drive: "FWD", weight: 980, img: 15953025 }),
  c({ brand: "Fiat", model: "500 Abarth", year: 2023, cats: ["daily", "sports"], body: "Hatchback", price: 25000, engine: "1.4L Turbo I4", fuel: "Petrol", hp: 160, trans: "Manual", zto100: 7.3, top: 210, torque: 230, drive: "FWD", weight: 1070 }),
  c({ brand: "Fiat", model: "124 Spider", year: 1972, cats: ["classic"], body: "Convertible", price: 20000, engine: "1.6L NA I4", fuel: "Petrol", hp: 110, trans: "Manual", zto100: 10.5, top: 175, torque: 132, drive: "RWD", weight: 950 }),
  c({ brand: "Mini", model: "Cooper S", year: 2023, cats: ["daily", "sports"], body: "Hatchback", price: 31000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 189, trans: "Manual", zto100: 6.7, top: 235, torque: 280, drive: "FWD", weight: 1250, img: 9545383 }),
  c({ brand: "Mini", model: "John Cooper Works GP", year: 2020, cats: ["sports", "daily"], body: "Hatchback", price: 45000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 306, trans: "Automatic", zto100: 5.2, top: 265, torque: 450, drive: "FWD", weight: 1255 }),
  c({ brand: "Mini", model: "Cooper", year: 1965, cats: ["classic"], body: "Hatchback", price: 22000, engine: "1.3L NA I4", fuel: "Petrol", hp: 62, trans: "Manual", zto100: 13.5, top: 145, torque: 98, drive: "FWD", weight: 630 }),
  c({ brand: "Opel", model: "Corsa", year: 2023, cats: ["daily"], body: "Hatchback", price: 21000, engine: "1.2L Turbo I3", fuel: "Petrol", hp: 100, trans: "Manual", zto100: 10.2, top: 190, torque: 205, drive: "FWD", weight: 1200, img: 20270367 }),
  c({ brand: "Opel", model: "Astra", year: 2023, cats: ["daily"], body: "Hatchback", price: 25000, engine: "1.2L Turbo I3", fuel: "Petrol", hp: 130, trans: "Automatic", zto100: 9.5, top: 200, torque: 230, drive: "FWD", weight: 1300 }),
  c({ brand: "Opel", model: "Manta GSe", year: 2023, cats: ["electric", "classic"], body: "Coupe", price: 75000, engine: "Single-Motor Electric", fuel: "Electric", hp: 147, trans: "Manual", zto100: 9.0, top: 150, torque: 255, drive: "RWD", weight: 1050 }),
];

export const saabLanciaVolvo: Car[] = [
  c({ brand: "Saab", model: "9-3 Turbo X", year: 2008, cats: ["daily", "sports"], body: "Sedan", price: 15000, engine: "2.8L Turbo V6", fuel: "Petrol", hp: 280, trans: "Manual", zto100: 5.9, top: 250, torque: 400, drive: "AWD", weight: 1600, img: 12954631 }),
  c({ brand: "Saab", model: "9-5 Aero", year: 2011, cats: ["daily", "luxury"], body: "Sedan", price: 12000, engine: "2.8L Turbo V6", fuel: "Petrol", hp: 300, trans: "Automatic", zto100: 6.1, top: 250, torque: 400, drive: "AWD", weight: 1800 }),
  c({ brand: "Saab", model: "900 Turbo", year: 1993, cats: ["classic"], body: "Hatchback", price: 15000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 185, trans: "Manual", zto100: 7.0, top: 220, torque: 265, drive: "FWD", weight: 1350 }),
  c({ brand: "Lancia", model: "Delta Integrale", year: 1993, cats: ["classic", "sports"], body: "Hatchback", price: 70000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 215, trans: "Manual", zto100: 5.7, top: 220, torque: 314, drive: "AWD", weight: 1300, img: 11931440 }),
  c({ brand: "Lancia", model: "Stratos", year: 1974, cats: ["classic", "sports"], body: "Coupe", price: 900000, engine: "2.4L NA V6", fuel: "Petrol", hp: 190, trans: "Manual", zto100: 5.8, top: 220, torque: 225, drive: "RWD", weight: 980 }),
  c({ brand: "Lancia", model: "037", year: 1984, cats: ["classic", "sports"], body: "Coupe", price: 500000, engine: "2.0L Supercharged I4", fuel: "Petrol", hp: 205, trans: "Manual", zto100: 5.9, top: 220, torque: 226, drive: "RWD", weight: 1170 }),
  c({ brand: "Volvo", model: "S60 Recharge", year: 2023, cats: ["luxury", "daily"], body: "Sedan", price: 52000, engine: "2.0L Turbo I4 Hybrid", fuel: "Hybrid", hp: 455, trans: "Automatic", zto100: 4.3, top: 180, torque: 709, drive: "AWD", weight: 2040, img: 31574925 }),
  c({ brand: "Volvo", model: "V60", year: 2023, cats: ["daily", "luxury"], body: "Wagon", price: 48000, engine: "2.0L Turbo I4 Hybrid", fuel: "Hybrid", hp: 455, trans: "Automatic", zto100: 4.4, top: 180, torque: 709, drive: "AWD", weight: 2100 }),
  c({ brand: "Volvo", model: "P1800", year: 1966, cats: ["classic"], body: "Coupe", price: 60000, engine: "1.8L NA I4", fuel: "Petrol", hp: 108, trans: "Manual", zto100: 12.0, top: 180, torque: 145, drive: "RWD", weight: 1090 }),
];

export const europeanMass = [...french, ...seatSkodaCupra, ...fiatMiniOpel, ...saabLanciaVolvo];
