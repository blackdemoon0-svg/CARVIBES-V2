import { c } from "../carBuilder";
import type { Car } from "../cars";

export const tesla: Car[] = [
  c({ brand: "Tesla", model: "Model 3", year: 2024, cats: ["electric", "daily"], body: "Sedan", price: 48000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 450, trans: "Automatic", zto100: 4.2, top: 201, torque: 520, drive: "AWD", weight: 1830, img: 35736779 }),
  c({ brand: "Tesla", model: "Model X", year: 2023, cats: ["electric", "suv"], body: "SUV", price: 80000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 670, trans: "Automatic", zto100: 3.8, top: 250, torque: 1020, drive: "AWD", weight: 2650 }),
  c({ brand: "Tesla", model: "Model Y", year: 2023, cats: ["electric", "suv", "daily"], body: "SUV", price: 45000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 384, trans: "Automatic", zto100: 5.0, top: 217, torque: 510, drive: "AWD", weight: 1900 }),
  c({ brand: "Tesla", model: "Cybertruck", year: 2024, cats: ["electric", "offroad"], body: "Pickup", price: 61000, engine: "Tri-Motor Electric", fuel: "Electric", hp: 845, trans: "Automatic", zto100: 2.9, top: 180, torque: 1400, drive: "AWD", weight: 3100 }),
  c({ brand: "Tesla", model: "Roadster", year: 2020, cats: ["electric", "supercar"], body: "Roadster", price: 200000, engine: "Tri-Motor Electric", fuel: "Electric", hp: 1020, trans: "Automatic", zto100: 1.9, top: 402, torque: 1400, drive: "AWD", weight: 1400 }),
];

export const lucidPolestar: Car[] = [
  c({ brand: "Lucid", model: "Air Grand Touring", year: 2023, cats: ["electric", "luxury"], body: "Sedan", price: 125000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 819, trans: "Automatic", zto100: 3.0, top: 270, torque: 1199, drive: "AWD", weight: 2360, img: 29566904 }),
  c({ brand: "Lucid", model: "Air Sapphire", year: 2023, cats: ["electric", "supercar"], body: "Sedan", price: 249000, engine: "Tri-Motor Electric", fuel: "Electric", hp: 1234, trans: "Automatic", zto100: 1.89, top: 330, torque: 1940, drive: "AWD", weight: 2365 }),
  c({ brand: "Polestar", model: "2", year: 2023, cats: ["electric", "daily"], body: "Sedan", price: 49000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 408, trans: "Automatic", zto100: 4.5, top: 205, torque: 660, drive: "AWD", weight: 2100, img: 30306584 }),
  c({ brand: "Polestar", model: "3", year: 2024, cats: ["electric", "suv"], body: "SUV", price: 83000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 517, trans: "Automatic", zto100: 4.7, top: 210, torque: 910, drive: "AWD", weight: 2600 }),
];

export const hyundaiKiaGenesis: Car[] = [
  c({ brand: "Hyundai", model: "Ioniq 6", year: 2023, cats: ["electric", "daily"], body: "Sedan", price: 42000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 320, trans: "Automatic", zto100: 5.1, top: 185, torque: 605, drive: "AWD", weight: 2050, img: 29807888 }),
  c({ brand: "Hyundai", model: "Elantra N", year: 2023, cats: ["sports", "daily"], body: "Sedan", price: 32000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 276, trans: "Manual", zto100: 5.3, top: 250, torque: 392, drive: "FWD", weight: 1450 }),
  c({ brand: "Hyundai", model: "Sonata N Line", year: 2023, cats: ["sports", "daily"], body: "Sedan", price: 34000, engine: "2.5L Turbo I4", fuel: "Petrol", hp: 290, trans: "Dual-clutch", zto100: 5.5, top: 250, torque: 422, drive: "FWD", weight: 1600 }),
  c({ brand: "Hyundai", model: "Tucson", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 27000, engine: "2.5L NA I4", fuel: "Petrol", hp: 187, trans: "Automatic", zto100: 8.8, top: 180, torque: 241, drive: "FWD", weight: 1500 }),
  c({ brand: "Hyundai", model: "Santa Fe", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 31000, engine: "2.5L Turbo I4", fuel: "Petrol", hp: 277, trans: "Dual-clutch", zto100: 6.8, top: 190, torque: 422, drive: "AWD", weight: 1700 }),
  c({ brand: "Hyundai", model: "Kona", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 24000, engine: "2.0L NA I4", fuel: "Petrol", hp: 147, trans: "CVT", zto100: 9.8, top: 180, torque: 179, drive: "FWD", weight: 1400 }),
  c({ brand: "Kia", model: "EV6 GT", year: 2023, cats: ["electric", "sports"], body: "SUV", price: 60000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 576, trans: "Automatic", zto100: 3.5, top: 260, torque: 740, drive: "AWD", weight: 2110, img: 29807888 }),
  c({ brand: "Kia", model: "EV9", year: 2024, cats: ["electric", "suv"], body: "SUV", price: 55000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 379, trans: "Automatic", zto100: 5.3, top: 200, torque: 700, drive: "AWD", weight: 2500 }),
  c({ brand: "Kia", model: "Stinger GT", year: 2023, cats: ["sports", "luxury"], body: "Sedan", price: 53000, engine: "3.3L Twin-Turbo V6", fuel: "Petrol", hp: 368, trans: "Automatic", zto100: 4.7, top: 274, torque: 510, drive: "AWD", weight: 1800 }),
  c({ brand: "Kia", model: "Sorento", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 30000, engine: "2.5L Turbo I4", fuel: "Petrol", hp: 281, trans: "Dual-clutch", zto100: 6.8, top: 190, torque: 422, drive: "AWD", weight: 1800 }),
  c({ brand: "Kia", model: "Sportage", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 27000, engine: "2.5L NA I4", fuel: "Petrol", hp: 187, trans: "Automatic", zto100: 8.8, top: 180, torque: 241, drive: "AWD", weight: 1600 }),
  c({ brand: "Kia", model: "Soul", year: 2023, cats: ["daily"], body: "Hatchback", price: 20000, engine: "2.0L NA I4", fuel: "Petrol", hp: 147, trans: "CVT", zto100: 9.5, top: 180, torque: 179, drive: "FWD", weight: 1300 }),
  c({ brand: "Genesis", model: "G90", year: 2023, cats: ["luxury"], body: "Sedan", price: 89000, engine: "3.5L Twin-Turbo V6", fuel: "Petrol", hp: 409, trans: "Automatic", zto100: 4.7, top: 250, torque: 549, drive: "AWD", weight: 2200, img: 20430089 }),
  c({ brand: "Genesis", model: "G80", year: 2023, cats: ["luxury", "daily"], body: "Sedan", price: 55000, engine: "2.5L Turbo I4", fuel: "Petrol", hp: 300, trans: "Automatic", zto100: 5.9, top: 250, torque: 422, drive: "AWD", weight: 1850 }),
  c({ brand: "Genesis", model: "G70", year: 2023, cats: ["sports", "luxury"], body: "Sedan", price: 40000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 252, trans: "Automatic", zto100: 5.9, top: 250, torque: 353, drive: "RWD", weight: 1650 }),
  c({ brand: "Genesis", model: "GV70", year: 2023, cats: ["suv", "luxury"], body: "SUV", price: 44000, engine: "2.5L Turbo I4", fuel: "Petrol", hp: 300, trans: "Automatic", zto100: 6.2, top: 220, torque: 422, drive: "AWD", weight: 1900 }),
  c({ brand: "Genesis", model: "GV90", year: 2024, cats: ["electric", "suv", "luxury"], body: "SUV", price: 78000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 480, trans: "Automatic", zto100: 4.5, top: 210, torque: 900, drive: "AWD", weight: 2600 }),
];

export const bydNio: Car[] = [
  c({ brand: "BYD", model: "Atto 3", year: 2023, cats: ["electric", "suv"], body: "SUV", price: 40000, engine: "Single-Motor Electric", fuel: "Electric", hp: 201, trans: "Automatic", zto100: 7.3, top: 160, torque: 310, drive: "FWD", weight: 1750, img: 33229798 }),
  c({ brand: "BYD", model: "Han", year: 2023, cats: ["electric", "luxury"], body: "Sedan", price: 45000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 510, trans: "Automatic", zto100: 3.9, top: 180, torque: 700, drive: "AWD", weight: 2250 }),
  c({ brand: "NIO", model: "ES6", year: 2023, cats: ["electric", "suv"], body: "SUV", price: 55000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 489, trans: "Automatic", zto100: 4.5, top: 200, torque: 675, drive: "AWD", weight: 2350, img: 35736771 }),
  c({ brand: "NIO", model: "EP9", year: 2017, cats: ["electric", "supercar"], body: "Coupe", price: 1480000, engine: "Quad-Motor Electric", fuel: "Electric", hp: 1341, trans: "Automatic", zto100: 2.7, top: 313, torque: 1480, drive: "AWD", weight: 1735 }),
];

export const asianEv = [...tesla, ...lucidPolestar, ...hyundaiKiaGenesis, ...bydNio];
