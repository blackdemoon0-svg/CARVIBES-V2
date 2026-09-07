// ============================================================
// CARVIBES QUIZ — 🇩🇪 German cars + 🇯🇵 JDM
// ============================================================
import { Q } from "./authoring";
import type { QuizQuestion } from "../types";

export const germanAndJdm: QuizQuestion[] = [
  // ----------------------------------------------------------
  // 🇩🇪 GERMAN — easy
  // ----------------------------------------------------------
  Q(
    "gd-e-01", "german", "easy",
    [
      "Which of these German brands belongs to the Volkswagen Group?",
      "Laquelle de ces marques allemandes appartient au groupe Volkswagen ?",
      "¿Cuál de estas marcas alemanas pertenece al grupo Volkswagen?",
    ],
    ["Audi", "BMW", "Mercedes-Benz", "Opel"],
    0,
    [
      "Its headquarters are in Ingolstadt, and it shares platforms with Porsche and Lamborghini.",
      "Son siège est à Ingolstadt, et elle partage des plateformes avec Porsche et Lamborghini.",
      "Su sede está en Ingolstadt y comparte plataformas con Porsche y Lamborghini.",
    ],
    [
      "Audi has been part of the Volkswagen Group since the 1960s; BMW and Mercedes-Benz remain independent.",
      "Audi fait partie du groupe Volkswagen depuis les années 60 ; BMW et Mercedes-Benz restent indépendants.",
      "Audi forma parte del grupo Volkswagen desde los años 60; BMW y Mercedes-Benz siguen siendo independientes.",
    ]
  ),
  Q(
    "gd-e-02", "german", "easy",
    [
      "What does AMG stand for in Mercedes-AMG?",
      "Que signifie AMG dans Mercedes-AMG ?",
      "¿Qué significa AMG en Mercedes-AMG?",
    ],
    [
      "Aufrecht, Melcher and Großaspach",
      "Automobil Mercedes Getriebe",
      "Advanced Motorsport Group",
      "Aufbau Motoren Gesellschaft",
    ],
    0,
    [
      "Two of the three are surnames; the third is a town.",
      "Deux des trois sont des noms de famille ; le troisième est une ville.",
      "Dos de los tres son apellidos; el tercero es una ciudad.",
    ],
    [
      "AMG comes from founders Hans Werner Aufrecht and Erhard Melcher, plus Aufrecht's birthplace, Großaspach.",
      "AMG vient des fondateurs Hans Werner Aufrecht et Erhard Melcher, et de la ville natale d'Aufrecht, Großaspach.",
      "AMG procede de los fundadores Hans Werner Aufrecht y Erhard Melcher, más la ciudad natal de Aufrecht, Großaspach.",
    ]
  ),

  // ----------------------------------------------------------
  // 🇩🇪 GERMAN — medium
  // ----------------------------------------------------------
  Q(
    "gd-m-01", "german", "medium",
    [
      "Which car was the first model developed by BMW Motorsport GmbH, founded in 1972?",
      "Quel modèle a été le premier développé par BMW Motorsport GmbH, fondée en 1972 ?",
      "¿Qué modelo fue el primero desarrollado por BMW Motorsport GmbH, fundada en 1972?",
    ],
    ["BMW 3.0 CSL", "BMW M1", "BMW E30 M3", "BMW M635CSi"],
    0,
    [
      "The M1 came later, as the division's first complete car of its own.",
      "La M1 est venue plus tard, comme première voiture entièrement conçue par la division.",
      "El M1 llegó después, como el primer coche completo diseñado por la división.",
    ],
    [
      "The 3.0 CSL was BMW Motorsport's first project in 1972; the M1 followed in 1978 as the first car designed entirely by the division.",
      "La 3.0 CSL fut le premier projet de BMW Motorsport en 1972 ; la M1 a suivi en 1978, première voiture entièrement conçue par la division.",
      "El 3.0 CSL fue el primer proyecto de BMW Motorsport en 1972; el M1 llegó en 1978 como primer coche diseñado íntegramente por la división.",
    ]
  ),
  Q(
    "gd-m-02", "german", "medium",
    [
      "In which country did Porsche build the first 356 production cars, from 1948?",
      "Dans quel pays Porsche a-t-il construit les premières 356 de série, à partir de 1948 ?",
      "¿En qué país fabricó Porsche los primeros 356 de serie, a partir de 1948?",
    ],
    ["Austria", "Germany", "Switzerland", "Italy"],
    0,
    [
      "Production only moved to Stuttgart-Zuffenhausen two years later.",
      "La production n'a été transférée à Stuttgart-Zuffenhausen que deux ans plus tard.",
      "La producción no se trasladó a Stuttgart-Zuffenhausen hasta dos años después.",
    ],
    [
      "The first 356s were hand-built in Gmünd, Austria; production moved to Stuttgart in 1950.",
      "Les premières 356 ont été construites à la main à Gmünd, en Autriche ; la production a déménagé à Stuttgart en 1950.",
      "Los primeros 356 se construyeron a mano en Gmünd, Austria; la producción pasó a Stuttgart en 1950.",
    ]
  ),
  Q(
    "gd-m-03", "german", "medium",
    [
      "Which Audi estate was co-developed with Porsche and launched in 1994?",
      "Quelle Audi break a été co-développée avec Porsche et lancée en 1994 ?",
      "¿Qué familiar de Audi se codesarrolló con Porsche y se lanzó en 1994?",
    ],
    ["RS2 Avant", "S4 Avant", "A6 Allroad", "S2 Coupé"],
    0,
    [
      "Its turbocharged five-cylinder engine was tuned by the Stuttgart specialist.",
      "Son cinq cylindres turbo a été préparé par le spécialiste de Stuttgart.",
      "Su motor de cinco cilindros turbo fue puesto a punto por el especialista de Stuttgart.",
    ],
    [
      "The RS2 Avant was developed with Porsche, using a 315 PS turbo five-cylinder — the start of Audi's RS line.",
      "La RS2 Avant a été développée avec Porsche, avec un cinq cylindres turbo de 315 ch — le début de la lignée RS d'Audi.",
      "El RS2 Avant se desarrolló con Porsche, con un cinco cilindros turbo de 315 CV: el inicio de la saga RS de Audi.",
    ]
  ),

  // ----------------------------------------------------------
  // 🇩🇪 GERMAN — hard
  // ----------------------------------------------------------
  Q(
    "gd-h-01", "german", "hard",
    [
      "What does BMW's VANOS system control?",
      "Que contrôle le système VANOS de BMW ?",
      "¿Qué controla el sistema VANOS de BMW?",
    ],
    [
      "Camshaft timing",
      "Valve lift only",
      "Turbocharger boost pressure",
      "Cylinder deactivation",
    ],
    0,
    [
      "The name is short for variable Nockenwellen Steuerung — variable camshaft control.",
      "Le nom est l'abréviation de variable Nockenwellen Steuerung — contrôle variable des arbres à cames.",
      "El nombre viene de variable Nockenwellen Steuerung: control variable de los árboles de levas.",
    ],
    [
      "VANOS varies camshaft timing; BMW's Valvetronic system, introduced later, varies valve lift as well.",
      "VANOS fait varier le calage des arbres à cames ; Valvetronic, introduit plus tard, fait aussi varier la levée des soupapes.",
      "VANOS varía la distribución de los árboles de levas; Valvetronic, posterior, varía también la alzada de válvulas.",
    ]
  ),
  Q(
    "gd-h-02", "german", "hard",
    [
      "Which engine did the Porsche 917 that won Le Mans in 1970 use?",
      "Quel moteur utilisait la Porsche 917 victorieuse au Mans en 1970 ?",
      "¿Qué motor usaba el Porsche 917 que ganó Le Mans en 1970?",
    ],
    [
      "A 4.5-litre flat-12",
      "A 3.0-litre turbo flat-8",
      "A 5.0-litre V8",
      "A 6.0-litre flat-6",
    ],
    0,
    [
      "Twelve cylinders, laid flat, and originally developed against a 4.5-litre limit.",
      "Douze cylindres à plat, développés à l'origine sous une limite de 4,5 litres.",
      "Doce cilindros planos, desarrollados originalmente bajo un límite de 4,5 litros.",
    ],
    [
      "The 917K that won the 1970 Le Mans used a 4.5-litre flat-12 — Porsche's first overall victory at the race.",
      "La 917K victorieuse au Mans 1970 utilisait un flat-12 de 4,5 litres — première victoire absolue de Porsche dans l'épreuve.",
      "El 917K ganador de Le Mans 1970 usaba un bóxer de doce cilindros y 4,5 litros: la primera victoria absoluta de Porsche.",
    ]
  ),
  Q(
    "gd-h-03", "german", "hard",
    [
      "Mercedes-Benz was created in 1926 by the merger of which two companies?",
      "Mercedes-Benz est née en 1926 de la fusion de quelles deux entreprises ?",
      "¿Mercedes-Benz nació en 1926 de la fusión de qué dos empresas?",
    ],
    [
      "Daimler-Motoren-Gesellschaft and Benz & Cie.",
      "Auto Union and Horch",
      "BMW and Rapp Motorenwerke",
      "Maybach and NSU",
    ],
    0,
    [
      "Both founders had built pioneering cars in the 1880s, independently of each other.",
      "Les deux fondateurs avaient construit des voitures pionnières dans les années 1880, indépendamment l'un de l'autre.",
      "Ambos fundadores habían construido coches pioneros en la década de 1880, de forma independiente.",
    ],
    [
      "Daimler-Motoren-Gesellschaft and Benz & Cie. merged in 1926 to form Daimler-Benz, maker of Mercedes-Benz cars.",
      "Daimler-Motoren-Gesellschaft et Benz & Cie. ont fusionné en 1926 pour former Daimler-Benz, constructeur des Mercedes-Benz.",
      "Daimler-Motoren-Gesellschaft y Benz & Cie. se fusionaron en 1926 para formar Daimler-Benz, fabricante de los Mercedes-Benz.",
    ]
  ),
  Q(
    "gd-h-04", "german", "hard",
    [
      "The first-generation Audi R8 shares its V10 engine with which Lamborghini?",
      "La première génération d'Audi R8 partage son moteur V10 avec quelle Lamborghini ?",
      "¿Con qué Lamborghini comparte motor V10 la primera generación del Audi R8?",
    ],
    ["Gallardo", "Murciélago", "Huracán", "Aventador"],
    0,
    [
      "That Lamborghini was produced from 2003 to 2013, overlapping the R8's first generation.",
      "Cette Lamborghini a été produite de 2003 à 2013, chevauchant la première génération de R8.",
      "Ese Lamborghini se produjo de 2003 a 2013, coincidiendo con la primera generación del R8.",
    ],
    [
      "The Audi R8's 5.2-litre V10 is closely related to the unit used in the Lamborghini Gallardo.",
      "Le V10 de 5,2 litres de l'Audi R8 est étroitement apparenté à celui de la Lamborghini Gallardo.",
      "El V10 de 5,2 litros del Audi R8 está estrechamente emparentado con el del Lamborghini Gallardo.",
    ]
  ),

  // ----------------------------------------------------------
  // 🇩🇪 GERMAN — expert
  // ----------------------------------------------------------
  Q(
    "gd-x-01", "german", "expert",
    [
      "What was the powertrain layout of the Volkswagen Golf R32 (Mk4, 2002)?",
      "Quelle était l'architecture mécanique de la Volkswagen Golf R32 (Mk4, 2002) ?",
      "¿Cuál era la configuración mecánica del Volkswagen Golf R32 (Mk4, 2002)?",
    ],
    [
      "VR6 engine with Haldex all-wheel drive",
      "Turbo inline-four with a Torsen differential",
      "VR6 driving the rear wheels only",
      "Narrow-angle V8 with permanent all-wheel drive",
    ],
    0,
    [
      "Its engine is a 3.2-litre six-cylinder, and its name states the capacity.",
      "Son moteur est un six cylindres de 3,2 litres, et son nom indique la cylindrée.",
      "Su motor es un seis cilindros de 3,2 litros y su nombre indica la cilindrada.",
    ],
    [
      "The Mk4 Golf R32 paired a 3.2-litre VR6 with a Haldex all-wheel-drive system and a six-speed gearbox.",
      "La Golf R32 Mk4 associait un VR6 de 3,2 litres à une transmission intégrale Haldex et une boîte six rapports.",
      "El Golf R32 Mk4 combinaba un VR6 de 3,2 litros con tracción total Haldex y caja de seis velocidades.",
    ]
  ),
  Q(
    "gd-x-02", "german", "expert",
    [
      "Which 911 generation was the last with an air-cooled engine?",
      "Quelle génération de 911 a été la dernière à moteur refroidi par air ?",
      "¿Qué generación del 911 fue la última con motor refrigerado por aire?",
    ],
    ["993", "964", "996", "997"],
    0,
    [
      "Its successor, launched in 1997, caused controversy by switching to water cooling.",
      "Sa successor, lancée en 1997, a fait polémique en passant au refroidissement par eau.",
      "Su sucesor, lanzado en 1997, generó polémica al pasar a la refrigeración por agua.",
    ],
    [
      "The 993, produced until 1998, was the last air-cooled 911; the 996 that followed moved to water cooling.",
      "La 993, produite jusqu'en 1998, fut la dernière 911 refroidie par air ; la 996 suivante est passée à l'eau.",
      "El 993, producido hasta 1998, fue el último 911 refrigerado por aire; el 996 siguiente pasó al agua.",
    ]
  ),
  Q(
    "gd-x-03", "german", "expert",
    [
      "BMW originally contracted which Italian manufacturer to build the M1, before moving production?",
      "Avec quel constructeur italien BMW avait-elle initialement contracté la fabrication de la M1, avant de la déplacer ?",
      "¿Con qué fabricante italiano contrató BMW inicialmente la fabricación del M1, antes de trasladarla?",
    ],
    ["Lamborghini", "Ferrari", "Maserati", "De Tomaso"],
    0,
    [
      "Financial trouble at that supplier forced BMW to finish the job elsewhere.",
      "Les difficultés financières de ce fournisseur ont obligé BMW à terminer ailleurs.",
      "Las dificultades financieras de ese proveedor obligaron a BMW a terminarlo en otro lugar.",
    ],
    [
      "Lamborghini was contracted to build the M1; when it hit financial trouble, BMW moved production to Baur and other specialists.",
      "Lamborghini devait construire la M1 ; face à ses difficultés financières, BMW a transféré la production chez Baur et d'autres spécialistes.",
      "Lamborghini debía fabricar el M1; ante sus problemas financieros, BMW trasladó la producción a Baur y otros especialistas.",
    ]
  ),

  // ----------------------------------------------------------
  // 🇩🇪 GERMAN — insane
  // ----------------------------------------------------------
  Q(
    "gd-i-01", "german", "insane",
    [
      "Roughly how many BMW M1 cars were built in total, road and race versions included?",
      "Environ combien de BMW M1 ont été produites au total, versions route et course comprises ?",
      "¿Aproximadamente cuántos BMW M1 se fabricaron en total, incluidas las versiones de calle y competición?",
    ],
    ["About 450", "About 250", "About 900", "About 1,200"],
    0,
    [
      "It is a low-volume car — production ran from 1978 to 1981.",
      "C'est une voiture à faible diffusion, produite de 1978 à 1981.",
      "Es un coche de baja producción, fabricado de 1978 a 1981.",
    ],
    [
      "Around 450 M1s were built between 1978 and 1981, most as road cars with a smaller racing contingent.",
      "Environ 450 M1 ont été construites entre 1978 et 1981, la plupart en version route, plus une série pour la course.",
      "Se fabricaron unos 450 M1 entre 1978 y 1981, la mayoría de calle, más un contingente de competición.",
    ]
  ),
  Q(
    "gd-i-02", "german", "insane",
    [
      "What top speed did the Porsche 959 achieve at launch?",
      "Quelle vitesse maximale atteignait la Porsche 959 à son lancement ?",
      "¿Qué velocidad máxima alcanzaba el Porsche 959 en su lanzamiento?",
    ],
    ["317 km/h", "280 km/h", "350 km/h", "250 km/h"],
    0,
    [
      "It made the 959 the fastest production road car of its time.",
      "Elle a fait de la 959 la voiture de série la plus rapide de son époque.",
      "Lo convirtió en el coche de producción más rápido de su época.",
    ],
    [
      "The 959 reached 317 km/h, making it the fastest production road car when it launched in 1986.",
      "La 959 atteignait 317 km/h, la voiture de série la plus rapide du monde à son lancement en 1986.",
      "El 959 alcanzaba 317 km/h, el coche de producción más rápido del mundo en su lanzamiento en 1986.",
    ]
  ),
  Q(
    "gd-i-03", "german", "insane",
    [
      "In which year was BMW founded?",
      "En quelle année BMW a-t-elle été fondée ?",
      "¿En qué año se fundó BMW?",
    ],
    ["1916", "1929", "1913", "1926"],
    0,
    [
      "It began as an aircraft engine works in Munich, during the First World War.",
      "Elle a commencé comme usine de moteurs d'avion à Munich, pendant la Première Guerre mondiale.",
      "Empezó como fábrica de motores de avión en Múnich, durante la Primera Guerra Mundial.",
    ],
    [
      "BMW traces its origins to Bayerische Flugzeugwerke, founded in 1916 and renamed BMW in 1917/18 — aircraft engines came first, cars much later.",
      "BMW tire son origine de Bayerische Flugzeugwerke, fondée en 1916 et renommée BMW en 1917/18 : les moteurs d'avion d'abord, les voitures bien plus tard.",
      "BMW se remonta a Bayerische Flugzeugwerke, fundada en 1916 y rebautizada BMW en 1917/18: primero motores de avión, los coches mucho después.",
    ]
  ),

  // ----------------------------------------------------------
  // 🇯🇵 JDM — easy
  // ----------------------------------------------------------
  Q(
    "jdm-e-01", "jdm", "easy",
    [
      "What does the abbreviation JDM stand for?",
      "Que signifie l'abréviation JDM ?",
      "¿Qué significa la abreviatura JDM?",
    ],
    ["Japanese Domestic Market", "Japanese Drive Machine", "Joint Drivetrain Manufacturing", "Japanese Direct Motorsport"],
    0,
    [
      "It refers to cars built and sold for the Japanese home market.",
      "Cela désigne les voitures construites et vendues pour le marché intérieur japonais.",
      "Se refiere a los coches fabricados y vendidos para el mercado interior japonés.",
    ],
    [
      "JDM means Japanese Domestic Market — specification built for Japan, which often differed from export versions.",
      "JDM signifie Japanese Domestic Market : les spécifications destinées au Japon, souvent différentes des versions export.",
      "JDM significa Japanese Domestic Market: la especificación destinada a Japón, a menudo distinta de las versiones de exportación.",
    ]
  ),
  Q(
    "jdm-e-02", "jdm", "easy",
    [
      "Which Japanese sports car used a rotary engine and was produced until 2002?",
      "Quelle sportive japonaise utilisait un moteur rotatif et a été produite jusqu'en 2002 ?",
      "¿Qué deportivo japonés usaba un motor rotativo y se produjo hasta 2002?",
    ],
    ["Mazda RX-7", "Nissan 300ZX", "Toyota MR2", "Honda Prelude"],
    0,
    [
      "Only one Japanese manufacturer has ever mass-produced a rotary engine.",
      "Un seul constructeur japonais a produit en série un moteur rotatif.",
      "Solo un fabricante japonés ha producido en serie un motor rotativo.",
    ],
    [
      "The Mazda RX-7 FD ran until 2002 with the 13B-REW twin-rotor engine; the rotary-powered RX-8 followed in 2003.",
      "La Mazda RX-7 FD a été produite jusqu'en 2002 avec le birotor 13B-REW ; la RX-8 rotative a suivi en 2003.",
      "El Mazda RX-7 FD se produjo hasta 2002 con el birrotor 13B-REW; el RX-8 rotativo llegó en 2003.",
    ],
    { carId: "mazda-rx7-fd" }
  ),

  // ----------------------------------------------------------
  // 🇯🇵 JDM — medium
  // ----------------------------------------------------------
  Q(
    "jdm-m-01", "jdm", "medium",
    [
      "What is the engine code of the twin-turbo inline-six in the Toyota Supra A80?",
      "Quel est le code moteur du six cylindres en ligne biturbo de la Toyota Supra A80 ?",
      "¿Cuál es el código del motor seis cilindros en línea biturbo del Toyota Supra A80?",
    ],
    ["2JZ-GTE", "RB26DETT", "4G63T", "SR20DET"],
    0,
    [
      "It is a Toyota engine, so its code starts with a 2, not an R or a 4.",
      "C'est un moteur Toyota, donc son code commence par 2, pas par R ou 4.",
      "Es un motor Toyota, así que su código empieza por 2, no por R ni por 4.",
    ],
    [
      "The A80 Supra's 2JZ-GTE is a 3.0-litre twin-turbo inline-six, famous for how much boost its cast-iron block tolerates.",
      "Le 2JZ-GTE de la Supra A80 est un six cylindres en ligne biturbo de 3,0 litres, célèbre pour la surpression que son bloc en fonte supporte.",
      "El 2JZ-GTE del Supra A80 es un seis en línea biturbo de 3,0 litros, famoso por la presión que soporta su bloque de fundición.",
    ],
    { carId: "toyota-supra-mk4" }
  ),
  Q(
    "jdm-m-02", "jdm", "medium",
    [
      "Which drivetrain does the Subaru WRX STI use?",
      "Quelle transmission utilise la Subaru WRX STI ?",
      "¿Qué tracción utiliza el Subaru WRX STI?",
    ],
    [
      "Symmetrical all-wheel drive",
      "Front-wheel drive",
      "Rear-wheel drive",
      "Part-time four-wheel drive with a transfer case",
    ],
    0,
    [
      "Its flat-four layout puts the crankshaft in line with the gearbox, which is why the layout has that name.",
      "Son architecture à plat aligne le vilebrequin avec la boîte, d'où le nom de cette architecture.",
      "Su arquitectura plana alinea el cigüeñal con la caja, de ahí el nombre de ese esquema.",
    ],
    [
      "Subaru pairs its boxer engines with a symmetrical all-wheel-drive system, keeping the drivetrain centred along the car's axis.",
      "Subaru associe ses moteurs à plat à une transmission intégrale symétrique, centrée sur l'axe de la voiture.",
      "Subaru combina sus motores bóxer con una tracción total simétrica, centrada sobre el eje del coche.",
    ],
    { carId: "subaru-wrx-sti", fact: { carId: "subaru-wrx-sti", field: "drivetrain" } }
  ),
  Q(
    "jdm-m-03", "jdm", "medium",
    [
      "What was the informal horsepower ceiling that Japanese manufacturers observed for domestic-market cars in the 1990s?",
      "Quel était le plafond de puissance informel observé par les constructeurs japonais pour le marché intérieur dans les années 90 ?",
      "¿Cuál era el límite informal de potencia que respetaban los fabricantes japoneses para el mercado interior en los 90?",
    ],
    ["280 PS", "240 PS", "300 PS", "250 PS"],
    0,
    [
      "It is the reason so many famous Japanese engines of that era advertise the same figure.",
      "C'est la raison pour laquelle tant de moteurs japonais célèbres de cette époque affichent le même chiffre.",
      "Es la razón por la que tantos motores japoneses famosos de esa época anuncian la misma cifra.",
    ],
    [
      "The gentlemen's agreement capped advertised output at 280 PS (276 hp) for the Japanese market until it was abandoned in the mid-2000s.",
      "L'accord tacite limitait la puissance annoncée à 280 ch (276 hp) pour le marché japonais, jusqu'à son abandon au milieu des années 2000.",
      "El acuerdo tácito limitaba la potencia declarada a 280 CV (276 hp) para el mercado japonés, hasta su abandono a mediados de los 2000.",
    ]
  ),

  // ----------------------------------------------------------
  // 🇯🇵 JDM — hard
  // ----------------------------------------------------------
  Q(
    "jdm-h-01", "jdm", "hard",
    [
      "Which engine powered the first-generation Honda NSX launched in 1990?",
      "Quel moteur animait la première génération de Honda NSX lancée en 1990 ?",
      "¿Qué motor llevaba la primera generación del Honda NSX lanzada en 1990?",
    ],
    ["C30A 3.0-litre V6 with VTEC", "B16A 1.6-litre inline-four", "F20C 2.0-litre inline-four", "H22A 2.2-litre inline-four"],
    0,
    [
      "It was an all-aluminium V6, mid-mounted behind the seats.",
      "C'était un V6 tout aluminium, placé en position centrale arrière.",
      "Era un V6 totalmente de aluminio, montado en posición central trasera.",
    ],
    [
      "The NA1 NSX used the C30A, a 3.0-litre all-aluminium V6 with VTEC, in the first all-aluminium production monocoque.",
      "La NSX NA1 utilisait le C30A, un V6 tout aluminium de 3,0 litres avec VTEC, dans la première monocoque de série tout aluminium.",
      "El NSX NA1 usaba el C30A, un V6 de aluminio de 3,0 litros con VTEC, en el primer monocasco de producción totalmente de aluminio.",
    ],
    { carId: "honda-nsx" }
  ),
  Q(
    "jdm-h-02", "jdm", "hard",
    [
      "What redline does the Honda S2000's F20C engine reach on the Japanese market?",
      "À quel régime le moteur F20C de la Honda S2000 monte-t-il sur le marché japonais ?",
      "¿Hasta qué régimen sube el motor F20C del Honda S2000 en el mercado japonés?",
    ],
    ["9,000 rpm", "8,000 rpm", "7,500 rpm", "8,600 rpm"],
    0,
    [
      "It held the record for specific output among naturally aspirated production engines for years.",
      "Elle a détenu pendant des années le record de puissance spécifique pour un moteur atmosphérique de série.",
      "Ostentó durante años el récord de potencia específica entre los motores atmosféricos de producción.",
    ],
    [
      "The F20C revved to 9,000 rpm and produced around 250 PS in Japan, giving it class-leading specific output.",
      "Le F20C montait à 9 000 tr/min et développait environ 250 ch au Japon, une puissance spécifique record.",
      "El F20C subía a 9.000 rpm y rendía unos 250 CV en Japón, con una potencia específica de referencia.",
    ]
  ),
  Q(
    "jdm-h-03", "jdm", "hard",
    [
      "Which car did Mitsubishi launch in 1992 specifically to homologate a Group A rally car?",
      "Quelle voiture Mitsubishi a-t-elle lancée en 1992 spécifiquement pour homologuer une voiture de rallye du Groupe A ?",
      "¿Qué coche lanzó Mitsubishi en 1992 específicamente para homologar un coche de rallies del Grupo A?",
    ],
    ["Lancer Evolution", "Galant VR-4", "3000GT", "Eclipse GSX"],
    0,
    [
      "It went through ten generations before production ended in 2016.",
      "Elle a connu dix générations avant l'arrêt de la production en 2016.",
      "Tuvo diez generaciones antes de que la producción terminara en 2016.",
    ],
    [
      "The Lancer Evolution was built to homologate Mitsubishi's Group A rally car and ran for ten generations.",
      "La Lancer Evolution a été construite pour homologuer la voiture de rallye Groupe A de Mitsubishi, sur dix générations.",
      "El Lancer Evolution se construyó para homologar el coche de rallies Grupo A de Mitsubishi, a lo largo de diez generaciones.",
    ],
    { carId: "mitsubishi-evo-ix" }
  ),
  Q(
    "jdm-h-04", "jdm", "hard",
    [
      "Which system provides torque split on the Nissan Skyline GT-R from the R32 to the R34?",
      "Quel système assure la répartition du couple sur les Nissan Skyline GT-R, de la R32 à la R34 ?",
      "¿Qué sistema gestiona el reparto de par en el Nissan Skyline GT-R del R32 al R34?",
    ],
    ["ATTESA E-TS all-wheel drive", "SH-AWD", "Symmetrical AWD", "Super Select 4WD"],
    0,
    [
      "It is rear-biased, sending torque forwards only when the rear axle needs help.",
      "Il est orienté vers l'arrière, et n'envoie le couple vers l'avant que lorsque l'essieu arrière a besoin d'aide.",
      "Está orientado al eje trasero y solo envía par hacia delante cuando el trasero necesita ayuda.",
    ],
    [
      "ATTESA E-TS is a rear-biased all-wheel-drive system that can send up to half the torque to the front axle.",
      "ATTESA E-TS est une transmission intégrale à dominante arrière pouvant envoyer jusqu'à la moitié du couple à l'avant.",
      "ATTESA E-TS es un sistema de tracción total con predominio trasero que puede enviar hasta la mitad del par al eje delantero.",
    ],
    { carId: "nissan-skyline-r34" }
  ),

  // ----------------------------------------------------------
  // 🇯🇵 JDM — expert
  // ----------------------------------------------------------
  Q(
    "jdm-x-01", "jdm", "expert",
    [
      "Which Formula 1 driver was involved in developing the chassis of the original Honda NSX?",
      "Quel pilote de Formule 1 a participé au développement du châssis de la Honda NSX d'origine ?",
      "¿Qué piloto de Fórmula 1 participó en el desarrollo del chasis del Honda NSX original?",
    ],
    ["Ayrton Senna", "Alain Prost", "Nigel Mansell", "Keke Rosberg"],
    0,
    [
      "He drove for the engine supplier during the car's development period.",
      "Il pilotait pour le motoriste pendant la période de développement de la voiture.",
      "Corría para el motorista durante el periodo de desarrollo del coche.",
    ],
    [
      "Ayrton Senna, then driving for McLaren-Honda, tested the NSX and pushed for a stiffer chassis.",
      "Ayrton Senna, alors pilote McLaren-Honda, a testé la NSX et insisté pour rigidifier le châssis.",
      "Ayrton Senna, entonces piloto de McLaren-Honda, probó el NSX e insistió en rigidizar el chasis.",
    ]
  ),
  Q(
    "jdm-x-02", "jdm", "expert",
    [
      "How many Lexus LFA cars were produced?",
      "Combien de Lexus LFA ont été produites ?",
      "¿Cuántos Lexus LFA se produjeron?",
    ],
    ["500", "150", "1,000", "3,500"],
    0,
    [
      "Production ran for two years, at roughly one car a day.",
      "La production a duré deux ans, à raison d'environ une voiture par jour.",
      "La producción duró dos años, a razón de un coche al día.",
    ],
    [
      "Exactly 500 LFAs were built between 2010 and 2012, at a rate of about one car per day.",
      "Exactement 500 LFA ont été construites entre 2010 et 2012, au rythme d'environ une voiture par jour.",
      "Se fabricaron exactamente 500 LFA entre 2010 y 2012, a un ritmo de aproximadamente un coche al día.",
    ],
    { carId: "lexus-lfa" }
  ),
  Q(
    "jdm-x-03", "jdm", "expert",
    [
      "Which engine did the Nissan GT-R R35 use at launch in 2007?",
      "Quel moteur la Nissan GT-R R35 utilisait-elle à son lancement en 2007 ?",
      "¿Qué motor usaba el Nissan GT-R R35 en su lanzamiento en 2007?",
    ],
    ["VR38DETT 3.8-litre twin-turbo V6", "RB26DETT 2.6-litre twin-turbo inline-six", "VQ37VHR 3.7-litre V6", "VRH35 3.5-litre V8"],
    0,
    [
      "The engine code starts with VR, not RB — the Skyline's engine was not carried over.",
      "Le code moteur commence par VR, pas RB : le moteur de la Skyline n'a pas été repris.",
      "El código empieza por VR, no por RB: el motor del Skyline no se reutilizó.",
    ],
    [
      "The R35 GT-R uses the VR38DETT, a 3.8-litre twin-turbo V6, mounted ahead of the front axle with a rear transaxle.",
      "La GT-R R35 utilise le VR38DETT, un V6 biturbo de 3,8 litres, monté devant l'essieu avant avec un pont arrière.",
      "El GT-R R35 usa el VR38DETT, un V6 biturbo de 3,8 litros, montado delante del eje delantero con transeje trasero.",
    ],
    { carId: "nissan-gtr-nismo" }
  ),

  // ----------------------------------------------------------
  // 🇯🇵 JDM — insane
  // ----------------------------------------------------------
  Q(
    "jdm-i-01", "jdm", "insane",
    [
      "What was the Japanese-market power figure of the Mazda RX-7 FD's 13B-REW engine in its final form?",
      "Quelle était la puissance sur le marché japonais du moteur 13B-REW de la Mazda RX-7 FD dans sa dernière évolution ?",
      "¿Cuál era la potencia para el mercado japonés del motor 13B-REW del Mazda RX-7 FD en su última evolución?",
    ],
    ["280 PS", "255 PS", "300 PS", "240 PS"],
    0,
    [
      "It matches the informal domestic ceiling that applied to Japanese manufacturers at the time.",
      "Elle correspond au plafond informel appliqué aux constructeurs japonais à l'époque.",
      "Coincide con el límite informal que se aplicaba a los fabricantes japoneses en aquella época.",
    ],
    [
      "The final RX-7 FD was rated at 280 PS in Japan, exactly at the domestic gentlemen's-agreement ceiling.",
      "La dernière RX-7 FD était annoncée à 280 ch au Japon, exactement au plafond de l'accord tacite national.",
      "El último RX-7 FD se anunciaba con 280 CV en Japón, justo en el techo del acuerdo tácito nacional.",
    ],
    { carId: "mazda-rx7-fd", claims: [{ field: "hp", value: 280 }] }
  ),
  Q(
    "jdm-i-02", "jdm", "insane",
    [
      "How much power did the Toyota 2000GT, launched in 1967, produce?",
      "Quelle puissance développait la Toyota 2000GT, lancée en 1967 ?",
      "¿Cuánta potencia rendía el Toyota 2000GT, lanzado en 1967?",
    ],
    ["150 hp", "120 hp", "190 hp", "105 hp"],
    0,
    [
      "Its 2.0-litre inline-six was derived from a saloon engine and developed with Yamaha.",
      "Son six cylindres en ligne de 2,0 litres dérivait d'un moteur de berline et a été développé avec Yamaha.",
      "Su seis cilindros en línea de 2,0 litros derivaba de un motor de berlina y se desarrolló con Yamaha.",
    ],
    [
      "The 2000GT produced 150 hp from a Yamaha-developed 2.0-litre inline-six — modest figures, but it became Japan's first true halo car.",
      "La 2000GT développait 150 ch grâce à un six cylindres en ligne de 2,0 litres développé avec Yamaha — modeste, mais première véritable voiture-halo japonaise.",
      "El 2000GT rendía 150 CV con un seis cilindros en línea de 2,0 litros desarrollado con Yamaha: cifras modestas, pero fue el primer halo car japonés.",
    ]
  ),
  Q(
    "jdm-i-03", "jdm", "insane",
    [
      "Which Japanese car used the VG30DETT twin-turbo 3.0-litre V6?",
      "Quelle voiture japonaise utilisait le V6 3,0 litres biturbo VG30DETT ?",
      "¿Qué coche japonés usaba el V6 3.0 biturbo VG30DETT?",
    ],
    ["Nissan 300ZX Z32", "Toyota Supra A80", "Mitsubishi 3000GT", "Honda NSX"],
    0,
    [
      "Its chassis code starts with Z, and it was sold as the Fairlady Z in Japan.",
      "Son code de châssis commence par Z, et elle était vendue sous le nom Fairlady Z au Japon.",
      "Su código de chasis empieza por Z y en Japón se vendía como Fairlady Z.",
    ],
    [
      "The VG30DETT powered the Z32 300ZX with 300 hp, sold as the Fairlady Z in Japan.",
      "Le VG30DETT équipait la 300ZX Z32 avec 300 ch, vendue sous le nom Fairlady Z au Japon.",
      "El VG30DETT equipaba el 300ZX Z32 con 300 CV, vendido como Fairlady Z en Japón.",
    ]
  ),
];
