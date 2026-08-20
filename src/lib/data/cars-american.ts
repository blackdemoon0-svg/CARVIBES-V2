import { c } from "../carBuilder";
import type { Car } from "../cars";

export const ford: Car[] = [
  c({ brand: "Ford", model: "Mustang Mach 1", year: 2022, cats: ["sports", "classic"], body: "Coupe", price: 57000, engine: "5.0L NA V8", fuel: "Petrol", hp: 480, trans: "Manual", zto100: 4.2, top: 267, torque: 570, drive: "RWD", weight: 1710, img: 37508222 }),
  c({ brand: "Ford", model: "Mustang Mach-E", year: 2023, cats: ["electric", "suv"], body: "SUV", price: 44000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 346, trans: "Automatic", zto100: 5.2, top: 180, torque: 580, drive: "AWD", weight: 2210 }),
  c({ brand: "Ford", model: "GT", year: 2022, cats: ["supercar"], body: "Coupe", price: 500000, engine: "3.5L Twin-Turbo V6", fuel: "Petrol", hp: 660, trans: "Dual-clutch", zto100: 3.0, top: 348, torque: 746, drive: "RWD", weight: 1385, img: 20001475 }),
  c({ brand: "Ford", model: "Bronco", year: 2023, cats: ["offroad", "suv"], body: "SUV", price: 34000, engine: "2.3L Turbo I4", fuel: "Petrol", hp: 300, trans: "Manual", zto100: 7.0, top: 180, torque: 441, drive: "4WD", weight: 2000 }),
  c({ brand: "Ford", model: "Focus RS", year: 2018, cats: ["sports", "daily"], body: "Hatchback", price: 37000, engine: "2.3L Turbo I4", fuel: "Petrol", hp: 350, trans: "Manual", zto100: 4.7, top: 266, torque: 470, drive: "AWD", weight: 1590 }),
  c({ brand: "Ford", model: "Fiesta ST", year: 2019, cats: ["sports", "daily"], body: "Hatchback", price: 22000, engine: "1.6L Turbo I4", fuel: "Petrol", hp: 197, trans: "Manual", zto100: 6.5, top: 230, torque: 290, drive: "FWD", weight: 1240 }),
  c({ brand: "Ford", model: "F-150 Raptor", year: 2023, cats: ["offroad"], body: "Pickup", price: 76000, engine: "3.5L Twin-Turbo V6", fuel: "Petrol", hp: 450, trans: "Automatic", zto100: 5.5, top: 180, torque: 690, drive: "4WD", weight: 2700 }),
  c({ brand: "Ford", model: "F-150", year: 2023, cats: ["offroad", "daily"], body: "Pickup", price: 34000, engine: "2.7L Twin-Turbo V6", fuel: "Petrol", hp: 325, trans: "Automatic", zto100: 6.5, top: 180, torque: 540, drive: "4WD", weight: 2400 }),
  c({ brand: "Ford", model: "Ranger Raptor", year: 2023, cats: ["offroad"], body: "Pickup", price: 55000, engine: "3.0L Twin-Turbo V6", fuel: "Petrol", hp: 405, trans: "Automatic", zto100: 6.0, top: 180, torque: 580, drive: "4WD", weight: 2260 }),
  c({ brand: "Ford", model: "Explorer", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 36000, engine: "2.3L Turbo I4", fuel: "Petrol", hp: 300, trans: "Automatic", zto100: 7.0, top: 190, torque: 420, drive: "AWD", weight: 2070 }),
  c({ brand: "Ford", model: "Escort RS Cosworth", year: 1994, cats: ["classic", "sports"], body: "Hatchback", price: 50000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 227, trans: "Manual", zto100: 5.7, top: 240, torque: 290, drive: "AWD", weight: 1275 }),
  c({ brand: "Ford", model: "Sierra RS500 Cosworth", year: 1987, cats: ["classic", "sports"], body: "Hatchback", price: 120000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 224, trans: "Manual", zto100: 5.9, top: 230, torque: 277, drive: "RWD", weight: 1240 }),
];

export const chevrolet: Car[] = [
  c({ brand: "Chevrolet", model: "Corvette Z06", year: 2023, cats: ["supercar", "sports"], body: "Coupe", price: 108000, engine: "5.5L NA V8", fuel: "Petrol", hp: 670, trans: "Dual-clutch", zto100: 2.6, top: 312, torque: 623, drive: "RWD", weight: 1560, img: 30090368 }),
  c({ brand: "Chevrolet", model: "Camaro ZL1", year: 2023, cats: ["sports", "daily"], body: "Coupe", price: 66000, engine: "6.2L Supercharged V8", fuel: "Petrol", hp: 650, trans: "Manual", zto100: 3.5, top: 315, torque: 881, drive: "RWD", weight: 1710 }),
  c({ brand: "Chevrolet", model: "Camaro SS", year: 2023, cats: ["sports", "daily"], body: "Coupe", price: 43000, engine: "6.2L NA V8", fuel: "Petrol", hp: 455, trans: "Manual", zto100: 3.9, top: 290, torque: 617, drive: "RWD", weight: 1650 }),
  c({ brand: "Chevrolet", model: "Silverado", year: 2023, cats: ["offroad", "daily"], body: "Pickup", price: 37000, engine: "5.3L NA V8", fuel: "Petrol", hp: 355, trans: "Automatic", zto100: 6.5, top: 180, torque: 519, drive: "4WD", weight: 2400 }),
  c({ brand: "Chevrolet", model: "Tahoe", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 56000, engine: "5.3L NA V8", fuel: "Petrol", hp: 355, trans: "Automatic", zto100: 7.0, top: 180, torque: 519, drive: "4WD", weight: 2500 }),
  c({ brand: "Chevrolet", model: "Suburban", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 58000, engine: "5.3L NA V8", fuel: "Petrol", hp: 355, trans: "Automatic", zto100: 7.2, top: 180, torque: 519, drive: "4WD", weight: 2600 }),
  c({ brand: "Chevrolet", model: "Bel Air", year: 1957, cats: ["classic"], body: "Sedan", price: 60000, engine: "4.6L NA V8", fuel: "Petrol", hp: 283, trans: "Manual", zto100: 8.5, top: 180, torque: 393, drive: "RWD", weight: 1630, img: 18435540 }),
  c({ brand: "Chevrolet", model: "Impala", year: 1967, cats: ["classic"], body: "Sedan", price: 45000, engine: "5.4L NA V8", fuel: "Petrol", hp: 275, trans: "Automatic", zto100: 9.0, top: 185, torque: 407, drive: "RWD", weight: 1700 }),
  c({ brand: "Chevrolet", model: "Chevelle SS", year: 1970, cats: ["classic"], body: "Coupe", price: 70000, engine: "7.4L NA V8", fuel: "Petrol", hp: 450, trans: "Manual", zto100: 5.6, top: 200, torque: 678, drive: "RWD", weight: 1650 }),
  c({ brand: "Chevrolet", model: "Equinox", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 27000, engine: "1.5L Turbo I4", fuel: "Petrol", hp: 175, trans: "Automatic", zto100: 8.5, top: 175, torque: 275, drive: "FWD", weight: 1500 }),
];

export const dodge: Car[] = [
  c({ brand: "Dodge", model: "Challenger Hellcat", year: 2023, cats: ["sports", "daily"], body: "Coupe", price: 62000, engine: "6.2L Supercharged V8", fuel: "Petrol", hp: 717, trans: "Automatic", zto100: 3.6, top: 320, torque: 889, drive: "RWD", weight: 2010, img: 34071036 }),
  c({ brand: "Dodge", model: "Challenger Demon", year: 2023, cats: ["sports", "supercar"], body: "Coupe", price: 96000, engine: "6.2L Supercharged V8", fuel: "Petrol", hp: 840, trans: "Automatic", zto100: 2.9, top: 330, torque: 1044, drive: "RWD", weight: 1940 }),
  c({ brand: "Dodge", model: "Charger SRT", year: 2023, cats: ["sports", "daily"], body: "Sedan", price: 48000, engine: "6.4L NA V8", fuel: "Petrol", hp: 485, trans: "Automatic", zto100: 4.3, top: 290, torque: 644, drive: "RWD", weight: 1990 }),
  c({ brand: "Dodge", model: "Durango SRT", year: 2023, cats: ["suv", "sports"], body: "SUV", price: 63000, engine: "6.4L NA V8", fuel: "Petrol", hp: 475, trans: "Automatic", zto100: 4.5, top: 250, torque: 637, drive: "AWD", weight: 2400 }),
  c({ brand: "Dodge", model: "Viper SRT", year: 2017, cats: ["supercar", "classic"], body: "Coupe", price: 95000, engine: "8.4L NA V10", fuel: "Petrol", hp: 645, trans: "Manual", zto100: 3.3, top: 332, torque: 813, drive: "RWD", weight: 1520 }),
  c({ brand: "Dodge", model: "Challenger R/T", year: 1970, cats: ["classic"], body: "Coupe", price: 60000, engine: "7.0L NA V8", fuel: "Petrol", hp: 425, trans: "Manual", zto100: 5.8, top: 220, torque: 664, drive: "RWD", weight: 1650 }),
];

export const cadillacChrysler: Car[] = [
  c({ brand: "Cadillac", model: "CT5-V Blackwing", year: 2023, cats: ["sports", "luxury"], body: "Sedan", price: 90000, engine: "6.2L Supercharged V8", fuel: "Petrol", hp: 668, trans: "Manual", zto100: 3.6, top: 322, torque: 893, drive: "RWD", weight: 1870, img: 18435540 }),
  c({ brand: "Cadillac", model: "Escalade", year: 2023, cats: ["suv", "luxury"], body: "SUV", price: 82000, engine: "6.2L NA V8", fuel: "Petrol", hp: 420, trans: "Automatic", zto100: 6.0, top: 180, torque: 623, drive: "4WD", weight: 2600 }),
  c({ brand: "Cadillac", model: "Lyriq", year: 2023, cats: ["electric", "suv"], body: "SUV", price: 59000, engine: "Single-Motor Electric", fuel: "Electric", hp: 340, trans: "Automatic", zto100: 5.7, top: 190, torque: 440, drive: "RWD", weight: 2500 }),
  c({ brand: "Cadillac", model: "Eldorado", year: 1959, cats: ["classic"], body: "Coupe", price: 80000, engine: "6.4L NA V8", fuel: "Petrol", hp: 325, trans: "Automatic", zto100: 10.0, top: 180, torque: 430, drive: "RWD", weight: 2240 }),
  c({ brand: "Chrysler", model: "300C", year: 2023, cats: ["luxury", "daily"], body: "Sedan", price: 44000, engine: "5.7L NA V8", fuel: "Petrol", hp: 363, trans: "Automatic", zto100: 5.9, top: 250, torque: 534, drive: "RWD", weight: 1900, img: 33616781 }),
  c({ brand: "Chrysler", model: "Pacifica", year: 2023, cats: ["daily"], body: "Minivan", price: 38000, engine: "3.6L V6 Hybrid", fuel: "Hybrid", hp: 260, trans: "CVT", zto100: 7.5, top: 180, torque: 320, drive: "FWD", weight: 2270 }),
  c({ brand: "Chrysler", model: "300 SRT8", year: 2014, cats: ["sports", "luxury"], body: "Sedan", price: 35000, engine: "6.4L NA V8", fuel: "Petrol", hp: 470, trans: "Automatic", zto100: 4.7, top: 282, torque: 637, drive: "RWD", weight: 1980 }),
  c({ brand: "Plymouth", model: "Barracuda", year: 1971, cats: ["classic"], body: "Coupe", price: 60000, engine: "7.0L NA V8", fuel: "Petrol", hp: 425, trans: "Manual", zto100: 5.8, top: 230, torque: 664, drive: "RWD", weight: 1580, img: 33616781 }),
];

export const jeepGmcRam: Car[] = [
  c({ brand: "Jeep", model: "Grand Cherokee", year: 2023, cats: ["suv", "offroad"], body: "SUV", price: 42000, engine: "3.6L NA V6", fuel: "Petrol", hp: 293, trans: "Automatic", zto100: 7.4, top: 180, torque: 353, drive: "4WD", weight: 2100, img: 9993526 }),
  c({ brand: "Jeep", model: "Trackhawk", year: 2021, cats: ["suv", "sports"], body: "SUV", price: 88000, engine: "6.2L Supercharged V8", fuel: "Petrol", hp: 707, trans: "Automatic", zto100: 3.5, top: 290, torque: 875, drive: "AWD", weight: 2400 }),
  c({ brand: "Jeep", model: "Gladiator", year: 2023, cats: ["offroad"], body: "Pickup", price: 39000, engine: "3.6L NA V6", fuel: "Petrol", hp: 285, trans: "Manual", zto100: 7.5, top: 180, torque: 353, drive: "4WD", weight: 2200 }),
  c({ brand: "Jeep", model: "Wagoneer", year: 2023, cats: ["suv", "luxury"], body: "SUV", price: 60000, engine: "3.0L Turbo I6", fuel: "Petrol", hp: 420, trans: "Automatic", zto100: 6.0, top: 180, torque: 635, drive: "4WD", weight: 2800 }),
  c({ brand: "GMC", model: "Sierra", year: 2023, cats: ["offroad", "daily"], body: "Pickup", price: 54000, engine: "6.2L NA V8", fuel: "Petrol", hp: 420, trans: "Automatic", zto100: 5.9, top: 180, torque: 624, drive: "4WD", weight: 2400, img: 29566897 }),
  c({ brand: "GMC", model: "Yukon", year: 2023, cats: ["suv", "luxury"], body: "SUV", price: 58000, engine: "6.2L NA V8", fuel: "Petrol", hp: 420, trans: "Automatic", zto100: 6.0, top: 180, torque: 624, drive: "4WD", weight: 2600 }),
  c({ brand: "GMC", model: "Hummer EV", year: 2023, cats: ["electric", "offroad"], body: "SUV", price: 110000, engine: "Tri-Motor Electric", fuel: "Electric", hp: 1000, trans: "Automatic", zto100: 3.5, top: 180, torque: 1559, drive: "4WD", weight: 4100 }),
  c({ brand: "RAM", model: "1500 TRX", year: 2023, cats: ["offroad", "sports"], body: "Pickup", price: 85000, engine: "6.2L Supercharged V8", fuel: "Petrol", hp: 702, trans: "Automatic", zto100: 4.5, top: 190, torque: 881, drive: "4WD", weight: 2900, img: 29566905 }),
  c({ brand: "RAM", model: "1500", year: 2023, cats: ["offroad", "daily"], body: "Pickup", price: 40000, engine: "5.7L NA V8", fuel: "Petrol", hp: 395, trans: "Automatic", zto100: 6.5, top: 180, torque: 556, drive: "4WD", weight: 2500 }),
  c({ brand: "Shelby", model: "Cobra 427", year: 1965, cats: ["classic", "supercar"], body: "Roadster", price: 1500000, engine: "7.0L NA V8", fuel: "Petrol", hp: 425, trans: "Manual", zto100: 4.2, top: 265, torque: 651, drive: "RWD", weight: 1080, img: 33787717 }),
  c({ brand: "AC", model: "Cobra 289", year: 1964, cats: ["classic", "sports"], body: "Roadster", price: 900000, engine: "4.7L NA V8", fuel: "Petrol", hp: 271, trans: "Manual", zto100: 5.5, top: 220, torque: 424, drive: "RWD", weight: 960, img: 33787717 }),
];

export const american = [...ford, ...chevrolet, ...dodge, ...cadillacChrysler, ...jeepGmcRam];
