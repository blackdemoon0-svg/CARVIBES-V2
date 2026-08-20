import { c } from "../carBuilder";
import type { Car } from "../cars";

// FERRARI -------------------------------------------------------
export const ferrari: Car[] = [
  c({ brand: "Ferrari", model: "488 GTB", year: 2019, cats: ["supercar", "sports"], body: "Coupe", price: 262000, engine: "3.9L Twin-Turbo V8", fuel: "Petrol", hp: 670, trans: "Dual-clutch", zto100: 3.0, top: 330, torque: 760, drive: "RWD", weight: 1475, img: 12506011 }),
  c({ brand: "Ferrari", model: "458 Italia", year: 2013, cats: ["supercar", "sports"], body: "Coupe", price: 230000, engine: "4.5L NA V8", fuel: "Petrol", hp: 570, trans: "Dual-clutch", zto100: 3.4, top: 325, torque: 540, drive: "RWD", weight: 1485, img: 11931440 }),
  c({ brand: "Ferrari", model: "F8 Tributo", year: 2022, cats: ["supercar", "sports"], body: "Coupe", price: 280000, engine: "3.9L Twin-Turbo V8", fuel: "Petrol", hp: 720, trans: "Dual-clutch", zto100: 2.9, top: 340, torque: 770, drive: "RWD", weight: 1435, img: 30735110 }),
  c({ brand: "Ferrari", model: "Roma", year: 2022, cats: ["sports", "luxury"], body: "Coupe", price: 220000, engine: "3.9L Twin-Turbo V8", fuel: "Petrol", hp: 612, trans: "Dual-clutch", zto100: 3.4, top: 320, torque: 760, drive: "RWD", weight: 1570 }),
  c({ brand: "Ferrari", model: "SF90 Stradale", year: 2022, cats: ["supercar", "electric"], body: "Coupe", price: 520000, engine: "4.0L Twin-Turbo V8 Hybrid", fuel: "Hybrid", hp: 986, trans: "Dual-clutch", zto100: 2.5, top: 340, torque: 800, drive: "AWD", weight: 1570 }),
  c({ brand: "Ferrari", model: "296 GTB", year: 2023, cats: ["supercar", "electric"], body: "Coupe", price: 340000, engine: "3.0L Twin-Turbo V6 Hybrid", fuel: "Hybrid", hp: 830, trans: "Dual-clutch", zto100: 2.9, top: 330, torque: 740, drive: "RWD", weight: 1470 }),
  c({ brand: "Ferrari", model: "Purosangue", year: 2023, cats: ["suv", "supercar"], body: "SUV", price: 398000, engine: "6.5L NA V12", fuel: "Petrol", hp: 725, trans: "Dual-clutch", zto100: 3.3, top: 310, torque: 716, drive: "AWD", weight: 2033 }),
  c({ brand: "Ferrari", model: "Portofino M", year: 2021, cats: ["sports", "luxury"], body: "Convertible", price: 250000, engine: "3.9L Twin-Turbo V8", fuel: "Petrol", hp: 612, trans: "Dual-clutch", zto100: 3.5, top: 320, torque: 760, drive: "RWD", weight: 1664 }),
  c({ brand: "Ferrari", model: "LaFerrari", year: 2015, cats: ["supercar", "electric"], body: "Coupe", price: 1500000, engine: "6.3L NA V12 Hybrid", fuel: "Hybrid", hp: 950, trans: "Dual-clutch", zto100: 2.6, top: 350, torque: 900, drive: "RWD", weight: 1270 }),
  c({ brand: "Ferrari", model: "F40", year: 1992, cats: ["classic", "supercar"], body: "Coupe", price: 1450000, engine: "2.9L Twin-Turbo V8", fuel: "Petrol", hp: 478, trans: "Manual", zto100: 4.1, top: 324, torque: 577, drive: "RWD", weight: 1100 }),
  c({ brand: "Ferrari", model: "Testarossa", year: 1991, cats: ["classic", "supercar"], body: "Coupe", price: 180000, engine: "4.9L NA Flat-12", fuel: "Petrol", hp: 390, trans: "Manual", zto100: 5.8, top: 290, torque: 490, drive: "RWD", weight: 1506 }),
];

// LAMBORGHINI ---------------------------------------------------
export const lamborghini: Car[] = [
  c({ brand: "Lamborghini", model: "Aventador SVJ", year: 2021, cats: ["supercar"], body: "Coupe", price: 517000, engine: "6.5L NA V12", fuel: "Petrol", hp: 770, trans: "Dual-clutch", zto100: 2.8, top: 350, torque: 720, drive: "AWD", weight: 1525, img: 17632049 }),
  c({ brand: "Lamborghini", model: "Revuelto", year: 2024, cats: ["supercar", "electric"], body: "Coupe", price: 610000, engine: "6.5L NA V12 Hybrid", fuel: "Hybrid", hp: 1001, trans: "Dual-clutch", zto100: 2.5, top: 350, torque: 807, drive: "AWD", weight: 1772 }),
  c({ brand: "Lamborghini", model: "Urus", year: 2023, cats: ["suv", "supercar"], body: "SUV", price: 235000, engine: "4.0L Twin-Turbo V8", fuel: "Petrol", hp: 657, trans: "Automatic", zto100: 3.6, top: 305, torque: 850, drive: "AWD", weight: 2200 }),
  c({ brand: "Lamborghini", model: "Gallardo LP560-4", year: 2010, cats: ["supercar", "sports"], body: "Coupe", price: 120000, engine: "5.2L NA V10", fuel: "Petrol", hp: 560, trans: "Dual-clutch", zto100: 3.7, top: 325, torque: 540, drive: "AWD", weight: 1410 }),
  c({ brand: "Lamborghini", model: "Murciélago LP640", year: 2008, cats: ["classic", "supercar"], body: "Coupe", price: 250000, engine: "6.5L NA V12", fuel: "Petrol", hp: 640, trans: "Manual", zto100: 3.4, top: 340, torque: 660, drive: "AWD", weight: 1665 }),
  c({ brand: "Lamborghini", model: "Diablo VT", year: 1999, cats: ["classic", "supercar"], body: "Coupe", price: 200000, engine: "5.7L NA V12", fuel: "Petrol", hp: 530, trans: "Manual", zto100: 4.0, top: 328, torque: 580, drive: "AWD", weight: 1625 }),
  c({ brand: "Lamborghini", model: "Huracán Sterrato", year: 2024, cats: ["supercar", "offroad"], body: "Coupe", price: 270000, engine: "5.2L NA V10", fuel: "Petrol", hp: 610, trans: "Dual-clutch", zto100: 3.4, top: 260, torque: 560, drive: "AWD", weight: 1470 }),
];

// PORSCHE -------------------------------------------------------
export const porsche: Car[] = [
  c({ brand: "Porsche", model: "911 Carrera", year: 2023, cats: ["sports", "daily"], body: "Coupe", price: 107000, engine: "3.0L Twin-Turbo Flat-6", fuel: "Petrol", hp: 385, trans: "Dual-clutch", zto100: 4.2, top: 293, torque: 450, drive: "RWD", weight: 1500, img: 38234790 }),
  c({ brand: "Porsche", model: "718 Cayman", year: 2023, cats: ["sports"], body: "Coupe", price: 63000, engine: "2.0L Turbo Flat-4", fuel: "Petrol", hp: 300, trans: "Manual", zto100: 5.1, top: 275, torque: 380, drive: "RWD", weight: 1350, img: 35849576 }),
  c({ brand: "Porsche", model: "Cayenne", year: 2023, cats: ["suv", "luxury"], body: "SUV", price: 72000, engine: "3.0L Turbo V6", fuel: "Petrol", hp: 348, trans: "Automatic", zto100: 6.0, top: 248, torque: 500, drive: "AWD", weight: 2070 }),
  c({ brand: "Porsche", model: "Macan", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 61000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 265, trans: "Dual-clutch", zto100: 6.4, top: 232, torque: 400, drive: "AWD", weight: 1845 }),
  c({ brand: "Porsche", model: "Panamera", year: 2023, cats: ["luxury", "sports"], body: "Sedan", price: 92000, engine: "2.9L Twin-Turbo V6", fuel: "Petrol", hp: 325, trans: "Dual-clutch", zto100: 5.4, top: 270, torque: 450, drive: "RWD", weight: 1875 }),
  c({ brand: "Porsche", model: "Taycan", year: 2023, cats: ["electric", "luxury"], body: "Sedan", price: 90000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 402, trans: "Automatic", zto100: 5.4, top: 230, torque: 640, drive: "RWD", weight: 2050, img: 30306584 }),
  c({ brand: "Porsche", model: "911 Carrera 4S", year: 2022, cats: ["sports", "supercar"], body: "Coupe", price: 125000, engine: "3.0L Twin-Turbo Flat-6", fuel: "Petrol", hp: 450, trans: "Dual-clutch", zto100: 3.6, top: 306, torque: 530, drive: "AWD", weight: 1565 }),
  c({ brand: "Porsche", model: "718 Boxster", year: 2023, cats: ["sports"], body: "Convertible", price: 68000, engine: "2.0L Turbo Flat-4", fuel: "Petrol", hp: 300, trans: "Manual", zto100: 5.1, top: 275, torque: 380, drive: "RWD", weight: 1375 }),
  c({ brand: "Porsche", model: "911 Dakar", year: 2023, cats: ["offroad", "sports"], body: "Coupe", price: 222000, engine: "3.0L Twin-Turbo Flat-6", fuel: "Petrol", hp: 473, trans: "Dual-clutch", zto100: 3.4, top: 240, torque: 570, drive: "AWD", weight: 1605 }),
];

// McLAREN -------------------------------------------------------
export const mclaren: Car[] = [
  c({ brand: "McLaren", model: "Artura", year: 2023, cats: ["supercar", "electric"], body: "Coupe", price: 225000, engine: "3.0L Twin-Turbo V6 Hybrid", fuel: "Hybrid", hp: 680, trans: "Dual-clutch", zto100: 3.0, top: 330, torque: 720, drive: "RWD", weight: 1498, img: 29115178 }),
  c({ brand: "McLaren", model: "765LT", year: 2021, cats: ["supercar"], body: "Coupe", price: 358000, engine: "4.0L Twin-Turbo V8", fuel: "Petrol", hp: 765, trans: "Dual-clutch", zto100: 2.8, top: 330, torque: 800, drive: "RWD", weight: 1368 }),
  c({ brand: "McLaren", model: "570S", year: 2019, cats: ["supercar", "sports"], body: "Coupe", price: 190000, engine: "3.8L Twin-Turbo V8", fuel: "Petrol", hp: 570, trans: "Dual-clutch", zto100: 3.2, top: 328, torque: 600, drive: "RWD", weight: 1440 }),
  c({ brand: "McLaren", model: "GT", year: 2022, cats: ["supercar", "luxury"], body: "Coupe", price: 210000, engine: "4.0L Twin-Turbo V8", fuel: "Petrol", hp: 620, trans: "Dual-clutch", zto100: 3.2, top: 326, torque: 630, drive: "RWD", weight: 1530 }),
  c({ brand: "McLaren", model: "Senna", year: 2019, cats: ["supercar"], body: "Coupe", price: 1050000, engine: "4.0L Twin-Turbo V8", fuel: "Petrol", hp: 800, trans: "Dual-clutch", zto100: 2.8, top: 340, torque: 800, drive: "RWD", weight: 1198 }),
  c({ brand: "McLaren", model: "F1", year: 1998, cats: ["classic", "supercar"], body: "Coupe", price: 20000000, engine: "6.1L NA V12", fuel: "Petrol", hp: 627, trans: "Manual", zto100: 3.2, top: 386, torque: 651, drive: "RWD", weight: 1140 }),
];

// BUGATTI / KOENIGSEGG / PAGANI ---------------------------------
export const hypercar: Car[] = [
  c({ brand: "Bugatti", model: "Veyron 16.4", year: 2013, cats: ["supercar"], body: "Coupe", price: 1700000, engine: "8.0L Quad-Turbo W16", fuel: "Petrol", hp: 1001, trans: "Dual-clutch", zto100: 2.5, top: 407, torque: 1250, drive: "AWD", weight: 1888, img: 32364051 }),
  c({ brand: "Bugatti", model: "Divo", year: 2021, cats: ["supercar"], body: "Coupe", price: 5800000, engine: "8.0L Quad-Turbo W16", fuel: "Petrol", hp: 1500, trans: "Dual-clutch", zto100: 2.4, top: 380, torque: 1600, drive: "AWD", weight: 1961 }),
  c({ brand: "Koenigsegg", model: "Agera RS", year: 2018, cats: ["supercar"], body: "Coupe", price: 2500000, engine: "5.0L Twin-Turbo V8", fuel: "Petrol", hp: 1360, trans: "Dual-clutch", zto100: 2.8, top: 447, torque: 1371, drive: "RWD", weight: 1395, img: 18366087 }),
  c({ brand: "Koenigsegg", model: "Regera", year: 2020, cats: ["supercar", "electric"], body: "Coupe", price: 1900000, engine: "5.0L Twin-Turbo V8 Hybrid", fuel: "Hybrid", hp: 1500, trans: "Automatic", zto100: 2.8, top: 400, torque: 2000, drive: "RWD", weight: 1590 }),
  c({ brand: "Koenigsegg", model: "Gemera", year: 2024, cats: ["supercar", "electric"], body: "Coupe", price: 1700000, engine: "2.0L Twin-Turbo I3 Hybrid", fuel: "Hybrid", hp: 1700, trans: "Automatic", zto100: 1.9, top: 400, torque: 1850, drive: "AWD", weight: 1850 }),
  c({ brand: "Pagani", model: "Zonda F", year: 2007, cats: ["supercar", "classic"], body: "Coupe", price: 2000000, engine: "7.3L NA V12", fuel: "Petrol", hp: 602, trans: "Manual", zto100: 3.6, top: 345, torque: 760, drive: "RWD", weight: 1230, img: 31417515 }),
  c({ brand: "Pagani", model: "Utopia", year: 2023, cats: ["supercar"], body: "Coupe", price: 2500000, engine: "6.0L Twin-Turbo V12", fuel: "Petrol", hp: 864, trans: "Manual", zto100: 3.0, top: 370, torque: 1100, drive: "RWD", weight: 1280 }),
];

// ASTON MARTIN / BENTLEY / ROLLS-ROYCE --------------------------
export const britishLuxury: Car[] = [
  c({ brand: "Aston Martin", model: "DB11", year: 2022, cats: ["luxury", "sports"], body: "Coupe", price: 210000, engine: "5.2L Twin-Turbo V12", fuel: "Petrol", hp: 630, trans: "Automatic", zto100: 3.9, top: 334, torque: 700, drive: "RWD", weight: 1870, img: 94272 }),
  c({ brand: "Aston Martin", model: "DB5", year: 1964, cats: ["classic", "luxury"], body: "Coupe", price: 1400000, engine: "4.0L NA I6", fuel: "Petrol", hp: 282, trans: "Manual", zto100: 8.0, top: 235, torque: 390, drive: "RWD", weight: 1502 }),
  c({ brand: "Aston Martin", model: "DBS Superleggera", year: 2021, cats: ["luxury", "supercar"], body: "Coupe", price: 320000, engine: "5.2L Twin-Turbo V12", fuel: "Petrol", hp: 725, trans: "Automatic", zto100: 3.4, top: 340, torque: 900, drive: "RWD", weight: 1845 }),
  c({ brand: "Aston Martin", model: "DBX", year: 2022, cats: ["suv", "luxury"], body: "SUV", price: 180000, engine: "4.0L Twin-Turbo V8", fuel: "Petrol", hp: 542, trans: "Automatic", zto100: 4.5, top: 291, torque: 700, drive: "AWD", weight: 2245 }),
  c({ brand: "Bentley", model: "Flying Spur", year: 2022, cats: ["luxury"], body: "Sedan", price: 210000, engine: "4.0L Twin-Turbo V8", fuel: "Petrol", hp: 542, trans: "Dual-clutch", zto100: 4.0, top: 318, torque: 770, drive: "AWD", weight: 2337, img: 16124126 }),
  c({ brand: "Bentley", model: "Bentayga", year: 2022, cats: ["suv", "luxury"], body: "SUV", price: 185000, engine: "4.0L Twin-Turbo V8", fuel: "Petrol", hp: 542, trans: "Automatic", zto100: 4.5, top: 290, torque: 770, drive: "AWD", weight: 2416 }),
  c({ brand: "Bentley", model: "Continental GTC", year: 2022, cats: ["luxury", "sports"], body: "Convertible", price: 240000, engine: "6.0L Twin-Turbo W12", fuel: "Petrol", hp: 650, trans: "Dual-clutch", zto100: 3.8, top: 335, torque: 900, drive: "AWD", weight: 2338 }),
  c({ brand: "Rolls-Royce", model: "Ghost", year: 2023, cats: ["luxury"], body: "Sedan", price: 340000, engine: "6.75L Twin-Turbo V12", fuel: "Petrol", hp: 563, trans: "Automatic", zto100: 4.8, top: 250, torque: 850, drive: "AWD", weight: 2553, img: 11770448 }),
  c({ brand: "Rolls-Royce", model: "Cullinan", year: 2023, cats: ["suv", "luxury", "offroad"], body: "SUV", price: 350000, engine: "6.75L Twin-Turbo V12", fuel: "Petrol", hp: 563, trans: "Automatic", zto100: 5.2, top: 250, torque: 850, drive: "AWD", weight: 2660 }),
  c({ brand: "Rolls-Royce", model: "Wraith", year: 2022, cats: ["luxury"], body: "Coupe", price: 340000, engine: "6.6L Twin-Turbo V12", fuel: "Petrol", hp: 624, trans: "Automatic", zto100: 4.4, top: 250, torque: 820, drive: "RWD", weight: 2440 }),
];

// MASERATI / LOTUS / ALFA / JAGUAR / LAND ROVER -----------------
export const italianBritish: Car[] = [
  c({ brand: "Maserati", model: "GranTurismo", year: 2023, cats: ["luxury", "sports"], body: "Coupe", price: 175000, engine: "3.0L Twin-Turbo V6", fuel: "Petrol", hp: 542, trans: "Automatic", zto100: 3.9, top: 320, torque: 650, drive: "AWD", weight: 1795, img: 19382415 }),
  c({ brand: "Maserati", model: "Levante", year: 2022, cats: ["suv", "luxury"], body: "SUV", price: 100000, engine: "3.0L Twin-Turbo V6", fuel: "Petrol", hp: 424, trans: "Automatic", zto100: 5.2, top: 264, torque: 580, drive: "AWD", weight: 2100 }),
  c({ brand: "Maserati", model: "Ghibli", year: 2022, cats: ["luxury", "daily"], body: "Sedan", price: 76000, engine: "3.0L Twin-Turbo V6", fuel: "Petrol", hp: 424, trans: "Automatic", zto100: 5.0, top: 286, torque: 580, drive: "RWD", weight: 1810 }),
  c({ brand: "Lotus", model: "Evija", year: 2023, cats: ["supercar", "electric"], body: "Coupe", price: 2100000, engine: "Quad-Motor Electric", fuel: "Electric", hp: 1973, trans: "Automatic", zto100: 2.9, top: 350, torque: 1700, drive: "AWD", weight: 1680, img: 38412217 }),
  c({ brand: "Lotus", model: "Evora GT", year: 2022, cats: ["sports"], body: "Coupe", price: 96000, engine: "3.5L Supercharged V6", fuel: "Petrol", hp: 416, trans: "Manual", zto100: 4.1, top: 303, torque: 410, drive: "RWD", weight: 1412 }),
  c({ brand: "Lotus", model: "Elise", year: 2020, cats: ["sports", "classic"], body: "Coupe", price: 55000, engine: "1.8L Supercharged I4", fuel: "Petrol", hp: 217, trans: "Manual", zto100: 4.3, top: 233, torque: 250, drive: "RWD", weight: 866 }),
  c({ brand: "Alfa Romeo", model: "Stelvio Quadrifoglio", year: 2023, cats: ["suv", "sports"], body: "SUV", price: 86000, engine: "2.9L Twin-Turbo V6", fuel: "Petrol", hp: 505, trans: "Automatic", zto100: 3.8, top: 283, torque: 600, drive: "AWD", weight: 1830, img: 11205815 }),
  c({ brand: "Jaguar", model: "F-Pace SVR", year: 2022, cats: ["suv", "sports"], body: "SUV", price: 86000, engine: "5.0L Supercharged V8", fuel: "Petrol", hp: 550, trans: "Automatic", zto100: 4.0, top: 286, torque: 700, drive: "AWD", weight: 1995, img: 9411653 }),
  c({ brand: "Jaguar", model: "E-Type", year: 1971, cats: ["classic", "sports"], body: "Coupe", price: 140000, engine: "4.2L NA I6", fuel: "Petrol", hp: 265, trans: "Manual", zto100: 6.8, top: 241, torque: 384, drive: "RWD", weight: 1080 }),
  c({ brand: "Jaguar", model: "XJ", year: 2019, cats: ["luxury"], body: "Sedan", price: 80000, engine: "3.0L Supercharged V6", fuel: "Petrol", hp: 340, trans: "Automatic", zto100: 5.9, top: 250, torque: 450, drive: "RWD", weight: 1770 }),
  c({ brand: "Land Rover", model: "Range Rover Sport", year: 2023, cats: ["suv", "luxury"], body: "SUV", price: 86000, engine: "3.0L Turbo I6", fuel: "Hybrid", hp: 395, trans: "Automatic", zto100: 5.8, top: 240, torque: 550, drive: "AWD", weight: 2510, img: 31574925 }),
  c({ brand: "Land Rover", model: "Discovery", year: 2022, cats: ["suv", "offroad"], body: "SUV", price: 58000, engine: "3.0L Turbo I6", fuel: "Diesel", hp: 300, trans: "Automatic", zto100: 7.2, top: 209, torque: 650, drive: "AWD", weight: 2400 }),
  c({ brand: "Land Rover", model: "Range Rover Velar", year: 2022, cats: ["suv", "luxury"], body: "SUV", price: 62000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 247, trans: "Automatic", zto100: 7.5, top: 217, torque: 365, drive: "AWD", weight: 1820 }),
];

export const luxury = [
  ...ferrari, ...lamborghini, ...porsche, ...mclaren, ...hypercar,
  ...britishLuxury, ...italianBritish,
];
