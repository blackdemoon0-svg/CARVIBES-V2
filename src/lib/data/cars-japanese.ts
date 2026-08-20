import { c } from "../carBuilder";
import type { Car } from "../cars";

export const toyota: Car[] = [
  c({ brand: "Toyota", model: "GR Yaris", year: 2023, cats: ["jdm", "sports"], body: "Hatchback", price: 36000, engine: "1.6L Turbo I3", fuel: "Petrol", hp: 268, trans: "Manual", zto100: 5.5, top: 230, torque: 370, drive: "AWD", weight: 1280, img: 13627441 }),
  c({ brand: "Toyota", model: "GR Corolla", year: 2023, cats: ["jdm", "sports", "daily"], body: "Hatchback", price: 36000, engine: "1.6L Turbo I3", fuel: "Petrol", hp: 300, trans: "Manual", zto100: 5.5, top: 230, torque: 400, drive: "AWD", weight: 1470 }),
  c({ brand: "Toyota", model: "GR 86", year: 2023, cats: ["jdm", "sports"], body: "Coupe", price: 28000, engine: "2.4L NA Flat-4", fuel: "Petrol", hp: 228, trans: "Manual", zto100: 6.1, top: 226, torque: 250, drive: "RWD", weight: 1280, img: 34258634 }),
  c({ brand: "Toyota", model: "Camry", year: 2023, cats: ["daily"], body: "Sedan", price: 27000, engine: "2.5L NA I4", fuel: "Petrol", hp: 203, trans: "Automatic", zto100: 7.6, top: 210, torque: 250, drive: "FWD", weight: 1550 }),
  c({ brand: "Toyota", model: "Prius", year: 2023, cats: ["daily", "electric"], body: "Hatchback", price: 28000, engine: "1.8L I4 Hybrid", fuel: "Hybrid", hp: 194, trans: "CVT", zto100: 7.2, top: 177, torque: 306, drive: "FWD", weight: 1400 }),
  c({ brand: "Toyota", model: "RAV4", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 29000, engine: "2.5L I4 Hybrid", fuel: "Hybrid", hp: 219, trans: "CVT", zto100: 7.8, top: 180, torque: 250, drive: "AWD", weight: 1690 }),
  c({ brand: "Toyota", model: "Highlander", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 39000, engine: "2.5L I4 Hybrid", fuel: "Hybrid", hp: 243, trans: "CVT", zto100: 8.4, top: 180, torque: 360, drive: "AWD", weight: 2040 }),
  c({ brand: "Toyota", model: "Land Cruiser", year: 2023, cats: ["suv", "offroad"], body: "SUV", price: 86000, engine: "3.4L Twin-Turbo V6", fuel: "Petrol", hp: 409, trans: "Automatic", zto100: 6.7, top: 210, torque: 650, drive: "4WD", weight: 2610 }),
  c({ brand: "Toyota", model: "4Runner", year: 2023, cats: ["suv", "offroad"], body: "SUV", price: 41000, engine: "4.0L NA V6", fuel: "Petrol", hp: 270, trans: "Automatic", zto100: 7.5, top: 190, torque: 377, drive: "4WD", weight: 2000 }),
  c({ brand: "Toyota", model: "Tacoma", year: 2023, cats: ["offroad"], body: "Pickup", price: 28000, engine: "2.4L Turbo I4", fuel: "Petrol", hp: 278, trans: "Automatic", zto100: 7.7, top: 180, torque: 430, drive: "4WD", weight: 2050 }),
  c({ brand: "Toyota", model: "Tundra", year: 2023, cats: ["offroad"], body: "Pickup", price: 39000, engine: "3.4L Twin-Turbo V6", fuel: "Petrol", hp: 389, trans: "Automatic", zto100: 6.5, top: 180, torque: 650, drive: "4WD", weight: 2540 }),
  c({ brand: "Toyota", model: "AE86 Sprinter Trueno", year: 1986, cats: ["jdm", "classic"], body: "Coupe", price: 35000, engine: "1.6L NA I4", fuel: "Petrol", hp: 130, trans: "Manual", zto100: 8.5, top: 195, torque: 150, drive: "RWD", weight: 960 }),
  c({ brand: "Toyota", model: "Celica GT-Four", year: 1994, cats: ["jdm", "classic"], body: "Coupe", price: 30000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 239, trans: "Manual", zto100: 6.3, top: 245, torque: 304, drive: "AWD", weight: 1400 }),
  c({ brand: "Toyota", model: "MR2", year: 1995, cats: ["jdm", "classic"], body: "Coupe", price: 22000, engine: "2.0L NA I4", fuel: "Petrol", hp: 168, trans: "Manual", zto100: 7.2, top: 210, torque: 186, drive: "RWD", weight: 1210 }),
  c({ brand: "Toyota", model: "2000GT", year: 1968, cats: ["classic", "jdm"], body: "Coupe", price: 1200000, engine: "2.0L NA I6", fuel: "Petrol", hp: 150, trans: "Manual", zto100: 8.6, top: 220, torque: 175, drive: "RWD", weight: 1160 }),
  c({ brand: "Toyota", model: "C-HR", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 27000, engine: "2.0L I4 Hybrid", fuel: "Hybrid", hp: 184, trans: "CVT", zto100: 8.2, top: 170, torque: 305, drive: "FWD", weight: 1450 }),
];

export const lexus: Car[] = [
  c({ brand: "Lexus", model: "LFA", year: 2012, cats: ["supercar", "classic"], body: "Coupe", price: 375000, engine: "4.8L NA V10", fuel: "Petrol", hp: 552, trans: "Automatic", zto100: 3.6, top: 325, torque: 480, drive: "RWD", weight: 1480, img: 10029873 }),
  c({ brand: "Lexus", model: "LC 500", year: 2023, cats: ["luxury", "sports"], body: "Coupe", price: 95000, engine: "5.0L NA V8", fuel: "Petrol", hp: 471, trans: "Automatic", zto100: 4.7, top: 270, torque: 540, drive: "RWD", weight: 1940 }),
  c({ brand: "Lexus", model: "RX", year: 2023, cats: ["suv", "luxury"], body: "SUV", price: 49000, engine: "2.4L Turbo I4 Hybrid", fuel: "Hybrid", hp: 275, trans: "CVT", zto100: 7.4, top: 190, torque: 430, drive: "AWD", weight: 2040 }),
  c({ brand: "Lexus", model: "NX", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 42000, engine: "2.5L I4 Hybrid", fuel: "Hybrid", hp: 240, trans: "CVT", zto100: 7.9, top: 180, torque: 360, drive: "AWD", weight: 1840 }),
  c({ brand: "Lexus", model: "GX", year: 2023, cats: ["suv", "offroad"], body: "SUV", price: 62000, engine: "3.4L Twin-Turbo V6", fuel: "Petrol", hp: 349, trans: "Automatic", zto100: 6.5, top: 190, torque: 650, drive: "4WD", weight: 2570 }),
  c({ brand: "Lexus", model: "LX", year: 2023, cats: ["suv", "offroad", "luxury"], body: "SUV", price: 90000, engine: "3.4L Twin-Turbo V6", fuel: "Petrol", hp: 409, trans: "Automatic", zto100: 6.9, top: 210, torque: 650, drive: "4WD", weight: 2800 }),
  c({ brand: "Lexus", model: "RZ 450e", year: 2023, cats: ["electric", "suv"], body: "SUV", price: 59000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 308, trans: "Automatic", zto100: 5.6, top: 160, torque: 435, drive: "AWD", weight: 2025 }),
  c({ brand: "Lexus", model: "IS 500", year: 2023, cats: ["sports", "luxury"], body: "Sedan", price: 56000, engine: "5.0L NA V8", fuel: "Petrol", hp: 472, trans: "Automatic", zto100: 4.5, top: 270, torque: 536, drive: "RWD", weight: 1765 }),
];

export const nissan: Car[] = [
  c({ brand: "Nissan", model: "Z", year: 2023, cats: ["jdm", "sports"], body: "Coupe", price: 41000, engine: "3.0L Twin-Turbo V6", fuel: "Petrol", hp: 400, trans: "Manual", zto100: 4.5, top: 250, torque: 475, drive: "RWD", weight: 1580, img: 20131557 }),
  c({ brand: "Nissan", model: "370Z", year: 2020, cats: ["jdm", "sports"], body: "Coupe", price: 31000, engine: "3.7L NA V6", fuel: "Petrol", hp: 332, trans: "Manual", zto100: 5.2, top: 250, torque: 366, drive: "RWD", weight: 1500 }),
  c({ brand: "Nissan", model: "350Z", year: 2008, cats: ["jdm", "classic"], body: "Coupe", price: 17000, engine: "3.5L NA V6", fuel: "Petrol", hp: 306, trans: "Manual", zto100: 5.7, top: 250, torque: 363, drive: "RWD", weight: 1450 }),
  c({ brand: "Nissan", model: "Silvia S15", year: 2002, cats: ["jdm", "classic"], body: "Coupe", price: 30000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 250, trans: "Manual", zto100: 5.9, top: 250, torque: 274, drive: "RWD", weight: 1240 }),
  c({ brand: "Nissan", model: "Skyline GT-R R32", year: 1992, cats: ["jdm", "classic"], body: "Coupe", price: 50000, engine: "2.6L Twin-Turbo I6", fuel: "Petrol", hp: 280, trans: "Manual", zto100: 5.6, top: 250, torque: 368, drive: "AWD", weight: 1480, img: 19557554 }),
  c({ brand: "Nissan", model: "Skyline GT-R R33", year: 1997, cats: ["jdm", "classic"], body: "Coupe", price: 45000, engine: "2.6L Twin-Turbo I6", fuel: "Petrol", hp: 280, trans: "Manual", zto100: 5.2, top: 250, torque: 368, drive: "AWD", weight: 1540 }),
  c({ brand: "Nissan", model: "Altima", year: 2023, cats: ["daily"], body: "Sedan", price: 26000, engine: "2.5L NA I4", fuel: "Petrol", hp: 188, trans: "CVT", zto100: 7.4, top: 190, torque: 244, drive: "FWD", weight: 1480 }),
  c({ brand: "Nissan", model: "Maxima", year: 2023, cats: ["daily"], body: "Sedan", price: 38000, engine: "3.5L NA V6", fuel: "Petrol", hp: 300, trans: "CVT", zto100: 5.9, top: 210, torque: 354, drive: "FWD", weight: 1610 }),
  c({ brand: "Nissan", model: "Rogue", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 28000, engine: "1.5L Turbo I3", fuel: "Petrol", hp: 201, trans: "CVT", zto100: 8.4, top: 180, torque: 305, drive: "AWD", weight: 1600 }),
  c({ brand: "Nissan", model: "Pathfinder", year: 2023, cats: ["suv", "offroad"], body: "SUV", price: 36000, engine: "3.5L NA V6", fuel: "Petrol", hp: 284, trans: "Automatic", zto100: 7.7, top: 190, torque: 351, drive: "AWD", weight: 2070 }),
  c({ brand: "Nissan", model: "Murano", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 35000, engine: "3.5L NA V6", fuel: "Petrol", hp: 260, trans: "CVT", zto100: 7.3, top: 190, torque: 325, drive: "AWD", weight: 1800 }),
  c({ brand: "Nissan", model: "Ariya", year: 2023, cats: ["electric", "suv"], body: "SUV", price: 44000, engine: "Dual-Motor Electric", fuel: "Electric", hp: 389, trans: "Automatic", zto100: 5.0, top: 200, torque: 600, drive: "AWD", weight: 2140 }),
  c({ brand: "Nissan", model: "Leaf", year: 2023, cats: ["electric", "daily"], body: "Hatchback", price: 28000, engine: "Single-Motor Electric", fuel: "Electric", hp: 214, trans: "Automatic", zto100: 6.9, top: 157, torque: 340, drive: "FWD", weight: 1580 }),
  c({ brand: "Nissan", model: "240SX", year: 1998, cats: ["jdm", "classic"], body: "Coupe", price: 18000, engine: "2.4L NA I4", fuel: "Petrol", hp: 155, trans: "Manual", zto100: 7.6, top: 205, torque: 217, drive: "RWD", weight: 1250 }),
];

export const honda: Car[] = [
  c({ brand: "Honda", model: "Civic Si", year: 2023, cats: ["sports", "daily"], body: "Sedan", price: 29000, engine: "1.5L Turbo I4", fuel: "Petrol", hp: 200, trans: "Manual", zto100: 6.8, top: 220, torque: 260, drive: "FWD", weight: 1330, img: 20043434 }),
  c({ brand: "Honda", model: "Civic", year: 2023, cats: ["daily"], body: "Sedan", price: 25000, engine: "2.0L NA I4", fuel: "Petrol", hp: 158, trans: "CVT", zto100: 9.0, top: 185, torque: 187, drive: "FWD", weight: 1330 }),
  c({ brand: "Honda", model: "Accord", year: 2023, cats: ["daily"], body: "Sedan", price: 29000, engine: "1.5L Turbo I4", fuel: "Petrol", hp: 192, trans: "CVT", zto100: 7.3, top: 190, torque: 260, drive: "FWD", weight: 1430 }),
  c({ brand: "Honda", model: "CR-V", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 30000, engine: "1.5L Turbo I4", fuel: "Petrol", hp: 190, trans: "CVT", zto100: 8.0, top: 180, torque: 243, drive: "AWD", weight: 1600 }),
  c({ brand: "Honda", model: "Pilot", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 40000, engine: "3.5L NA V6", fuel: "Petrol", hp: 285, trans: "Automatic", zto100: 7.0, top: 180, torque: 355, drive: "AWD", weight: 2040 }),
  c({ brand: "Honda", model: "S2000", year: 2007, cats: ["jdm", "classic", "sports"], body: "Convertible", price: 35000, engine: "2.0L NA I4", fuel: "Petrol", hp: 240, trans: "Manual", zto100: 6.0, top: 240, torque: 208, drive: "RWD", weight: 1290 }),
  c({ brand: "Honda", model: "Integra Type R", year: 2001, cats: ["jdm", "classic"], body: "Coupe", price: 30000, engine: "1.8L NA I4", fuel: "Petrol", hp: 195, trans: "Manual", zto100: 6.2, top: 232, torque: 176, drive: "FWD", weight: 1190 }),
  c({ brand: "Honda", model: "NSX (NC1)", year: 2022, cats: ["supercar", "electric"], body: "Coupe", price: 169000, engine: "3.5L Twin-Turbo V6 Hybrid", fuel: "Hybrid", hp: 573, trans: "Dual-clutch", zto100: 2.9, top: 307, torque: 645, drive: "AWD", weight: 1725, img: 30570357 }),
  c({ brand: "Honda", model: "Prelude", year: 1999, cats: ["jdm", "classic"], body: "Coupe", price: 15000, engine: "2.2L NA I4", fuel: "Petrol", hp: 200, trans: "Manual", zto100: 6.8, top: 220, torque: 219, drive: "FWD", weight: 1290 }),
  c({ brand: "Honda", model: "FIT / Jazz", year: 2023, cats: ["daily"], body: "Hatchback", price: 18000, engine: "1.5L NA I4", fuel: "Petrol", hp: 130, trans: "CVT", zto100: 9.4, top: 185, torque: 155, drive: "FWD", weight: 1120 }),
];

export const mazda: Car[] = [
  c({ brand: "Mazda", model: "RX-8", year: 2010, cats: ["jdm", "sports"], body: "Coupe", price: 12000, engine: "1.3L NA Rotary", fuel: "Petrol", hp: 232, trans: "Manual", zto100: 6.4, top: 234, torque: 216, drive: "RWD", weight: 1390, img: 33229798 }),
  c({ brand: "Mazda", model: "3", year: 2023, cats: ["daily"], body: "Sedan", price: 23000, engine: "2.5L NA I4", fuel: "Petrol", hp: 191, trans: "Automatic", zto100: 7.4, top: 200, torque: 252, drive: "AWD", weight: 1450 }),
  c({ brand: "Mazda", model: "6", year: 2022, cats: ["daily"], body: "Sedan", price: 25000, engine: "2.5L Turbo I4", fuel: "Petrol", hp: 250, trans: "Automatic", zto100: 6.4, top: 220, torque: 420, drive: "FWD", weight: 1580 }),
  c({ brand: "Mazda", model: "CX-5", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 27000, engine: "2.5L NA I4", fuel: "Petrol", hp: 187, trans: "Automatic", zto100: 8.8, top: 190, torque: 252, drive: "AWD", weight: 1600 }),
  c({ brand: "Mazda", model: "CX-30", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 24000, engine: "2.5L NA I4", fuel: "Petrol", hp: 191, trans: "Automatic", zto100: 8.5, top: 190, torque: 252, drive: "AWD", weight: 1520 }),
  c({ brand: "Mazda", model: "MX-6", year: 1993, cats: ["jdm", "classic"], body: "Coupe", price: 10000, engine: "2.5L NA V6", fuel: "Petrol", hp: 164, trans: "Manual", zto100: 8.2, top: 210, torque: 217, drive: "FWD", weight: 1260 }),
];

export const subaru: Car[] = [
  c({ brand: "Subaru", model: "WRX", year: 2023, cats: ["jdm", "sports", "daily"], body: "Sedan", price: 30000, engine: "2.4L Turbo Flat-4", fuel: "Petrol", hp: 271, trans: "Manual", zto100: 5.5, top: 230, torque: 350, drive: "AWD", weight: 1490, img: 35831596 }),
  c({ brand: "Subaru", model: "Impreza WRX STI", year: 1999, cats: ["jdm", "classic"], body: "Sedan", price: 30000, engine: "2.0L Turbo Flat-4", fuel: "Petrol", hp: 280, trans: "Manual", zto100: 5.5, top: 250, torque: 340, drive: "AWD", weight: 1250 }),
  c({ brand: "Subaru", model: "BRZ", year: 2023, cats: ["jdm", "sports"], body: "Coupe", price: 28000, engine: "2.4L NA Flat-4", fuel: "Petrol", hp: 228, trans: "Manual", zto100: 6.1, top: 226, torque: 250, drive: "RWD", weight: 1270 }),
  c({ brand: "Subaru", model: "Outback", year: 2023, cats: ["suv", "daily", "offroad"], body: "Wagon", price: 29000, engine: "2.5L NA Flat-4", fuel: "Petrol", hp: 182, trans: "CVT", zto100: 8.0, top: 180, torque: 239, drive: "AWD", weight: 1640 }),
  c({ brand: "Subaru", model: "Forester", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 28000, engine: "2.5L NA Flat-4", fuel: "Petrol", hp: 182, trans: "CVT", zto100: 8.2, top: 180, torque: 239, drive: "AWD", weight: 1600 }),
  c({ brand: "Subaru", model: "Crosstrek", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 26000, engine: "2.0L NA Flat-4", fuel: "Petrol", hp: 152, trans: "CVT", zto100: 9.0, top: 175, torque: 196, drive: "AWD", weight: 1490 }),
  c({ brand: "Subaru", model: "Legacy", year: 2023, cats: ["daily"], body: "Sedan", price: 25000, engine: "2.4L Turbo Flat-4", fuel: "Petrol", hp: 260, trans: "CVT", zto100: 6.5, top: 210, torque: 376, drive: "AWD", weight: 1600 }),
];

export const mitsubishi: Car[] = [
  c({ brand: "Mitsubishi", model: "Lancer Evolution X", year: 2014, cats: ["jdm", "sports"], body: "Sedan", price: 26000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 295, trans: "Dual-clutch", zto100: 4.9, top: 250, torque: 366, drive: "AWD", weight: 1560, img: 9702328 }),
  c({ brand: "Mitsubishi", model: "3000GT VR-4", year: 1997, cats: ["jdm", "classic"], body: "Coupe", price: 22000, engine: "3.0L Twin-Turbo V6", fuel: "Petrol", hp: 320, trans: "Manual", zto100: 5.4, top: 250, torque: 427, drive: "AWD", weight: 1710 }),
  c({ brand: "Mitsubishi", model: "Eclipse GSX", year: 1997, cats: ["jdm", "classic"], body: "Coupe", price: 15000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 210, trans: "Manual", zto100: 6.9, top: 220, torque: 290, drive: "AWD", weight: 1430 }),
  c({ brand: "Mitsubishi", model: "Outlander", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 27000, engine: "2.5L NA I4", fuel: "Petrol", hp: 181, trans: "CVT", zto100: 8.5, top: 180, torque: 245, drive: "AWD", weight: 1630 }),
  c({ brand: "Mitsubishi", model: "Pajero / Montero", year: 2018, cats: ["suv", "offroad"], body: "SUV", price: 35000, engine: "3.2L I4 Diesel", fuel: "Diesel", hp: 190, trans: "Automatic", zto100: 10.0, top: 175, torque: 441, drive: "4WD", weight: 2100 }),
  c({ brand: "Mitsubishi", model: "Galant VR-4", year: 1992, cats: ["jdm", "classic"], body: "Sedan", price: 12000, engine: "2.0L Turbo I4", fuel: "Petrol", hp: 237, trans: "Manual", zto100: 6.1, top: 230, torque: 320, drive: "AWD", weight: 1480 }),
];

export const suzuki: Car[] = [
  c({ brand: "Suzuki", model: "Jimny", year: 2023, cats: ["offroad", "suv"], body: "SUV", price: 28000, engine: "1.5L NA I4", fuel: "Petrol", hp: 102, trans: "Manual", zto100: 13.0, top: 145, torque: 130, drive: "4WD", weight: 1130, img: 16896042 }),
  c({ brand: "Suzuki", model: "Swift", year: 2023, cats: ["daily"], body: "Hatchback", price: 18000, engine: "1.2L NA I4", fuel: "Petrol", hp: 82, trans: "CVT", zto100: 12.0, top: 170, torque: 107, drive: "FWD", weight: 940 }),
  c({ brand: "Suzuki", model: "Swift Sport", year: 2023, cats: ["daily", "sports"], body: "Hatchback", price: 24000, engine: "1.4L Turbo I4", fuel: "Petrol", hp: 138, trans: "Manual", zto100: 8.0, top: 200, torque: 230, drive: "FWD", weight: 980 }),
  c({ brand: "Suzuki", model: "Vitara", year: 2023, cats: ["suv", "daily"], body: "SUV", price: 23000, engine: "1.4L Turbo I4", fuel: "Petrol", hp: 129, trans: "Manual", zto100: 9.9, top: 180, torque: 210, drive: "AWD", weight: 1250 }),
  c({ brand: "Suzuki", model: "Cappuccino", year: 1995, cats: ["jdm", "classic"], body: "Convertible", price: 15000, engine: "0.7L Turbo I3", fuel: "Petrol", hp: 64, trans: "Manual", zto100: 8.8, top: 160, torque: 85, drive: "RWD", weight: 725 }),
];

export const infinitiAcura: Car[] = [
  c({ brand: "Infiniti", model: "Q60", year: 2022, cats: ["sports", "luxury"], body: "Coupe", price: 42000, engine: "3.0L Twin-Turbo V6", fuel: "Petrol", hp: 400, trans: "Automatic", zto100: 4.5, top: 250, torque: 475, drive: "RWD", weight: 1760, img: 29580161 }),
  c({ brand: "Infiniti", model: "Q50", year: 2022, cats: ["daily", "luxury"], body: "Sedan", price: 40000, engine: "3.0L Twin-Turbo V6", fuel: "Petrol", hp: 400, trans: "Automatic", zto100: 4.5, top: 250, torque: 475, drive: "AWD", weight: 1780 }),
  c({ brand: "Infiniti", model: "QX60", year: 2023, cats: ["suv", "luxury"], body: "SUV", price: 49000, engine: "3.5L NA V6", fuel: "Petrol", hp: 295, trans: "Automatic", zto100: 7.0, top: 190, torque: 366, drive: "AWD", weight: 2000 }),
  c({ brand: "Acura", model: "Integra", year: 2023, cats: ["daily", "sports"], body: "Hatchback", price: 31000, engine: "1.5L Turbo I4", fuel: "Petrol", hp: 200, trans: "Manual", zto100: 6.8, top: 220, torque: 260, drive: "FWD", weight: 1330, img: 30570357 }),
  c({ brand: "Acura", model: "NSX Type S", year: 2022, cats: ["supercar", "electric"], body: "Coupe", price: 170000, engine: "3.5L Twin-Turbo V6 Hybrid", fuel: "Hybrid", hp: 600, trans: "Dual-clutch", zto100: 2.7, top: 307, torque: 667, drive: "AWD", weight: 1725 }),
  c({ brand: "Acura", model: "MDX", year: 2023, cats: ["suv", "luxury"], body: "SUV", price: 50000, engine: "3.5L NA V6", fuel: "Petrol", hp: 290, trans: "Automatic", zto100: 7.3, top: 180, torque: 362, drive: "AWD", weight: 2070 }),
  c({ brand: "Datsun", model: "240Z", year: 1971, cats: ["classic", "jdm"], body: "Coupe", price: 50000, engine: "2.4L NA I6", fuel: "Petrol", hp: 151, trans: "Manual", zto100: 8.0, top: 200, torque: 198, drive: "RWD", weight: 1068, img: 3966847 }),
];

export const japanese = [
  ...toyota, ...lexus, ...nissan, ...honda, ...mazda,
  ...subaru, ...mitsubishi, ...suzuki, ...infinitiAcura,
];
