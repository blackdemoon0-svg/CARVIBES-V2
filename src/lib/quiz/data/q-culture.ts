// ============================================================
// CARVIBES QUIZ — 🇮🇹 Italian · 🏎️ Supercars · ⚡ Electric · 👑 Luxury
// ============================================================
import { Q } from "./authoring";
import type { QuizQuestion } from "../types";

export const italianSuperElectricLuxury: QuizQuestion[] = [
  // ----------------------------------------------------------
  // 🇮🇹 ITALIAN — easy
  // ----------------------------------------------------------
  Q(
    "it-e-01", "italian", "easy",
    [
      "Which Italian manufacturer was founded in 1963 by a tractor maker after a dispute with Enzo Ferrari?",
      "Quel constructeur italien a été fondé en 1963 par un fabricant de tracteurs après un différend avec Enzo Ferrari ?",
      "¿Qué fabricante italiano fue fundado en 1963 por un fabricante de tractores tras una disputa con Enzo Ferrari?",
    ],
    ["Lamborghini", "Maserati", "Alfa Romeo", "Lancia"],
    0,
    [
      "Its badge features a bull, reflecting the founder's zodiac sign.",
      "Son blason représente un taureau, signe astrologique du fondateur.",
      "Su emblema muestra un toro, el signo del zodíaco del fundador.",
    ],
    [
      "Ferruccio Lamborghini founded his car company in 1963 in Sant'Agata Bolognese, partly out of rivalry with Ferrari.",
      "Ferruccio Lamborghini a fondé son constructeur en 1963 à Sant'Agata Bolognese, en partie par rivalité avec Ferrari.",
      "Ferruccio Lamborghini fundó su marca en 1963 en Sant'Agata Bolognese, en parte por rivalidad con Ferrari.",
    ]
  ),
  Q(
    "it-e-02", "italian", "easy",
    [
      "Where does the prancing horse on the Ferrari badge come from?",
      "D'où vient le cheval cabré du blason Ferrari ?",
      "¿De dónde procede el caballo rampante del emblema de Ferrari?",
    ],
    [
      "The insignia of First World War flying ace Francesco Baracca",
      "The coat of arms of the city of Modena",
      "The logo of a local racing stable",
      "A symbol chosen by Enzo Ferrari's wife",
    ],
    0,
    [
      "Baracca's family suggested Enzo use it after his death, as a good-luck emblem.",
      "La famille de Baracca a suggéré à Enzo de l'utiliser après sa mort, comme porte-bonheur.",
      "La familia de Baracca sugirió a Enzo usarlo tras su muerte, como amuleto.",
    ],
    [
      "Enzo Ferrari adopted the cavallino rampante of ace Francesco Baracca at his family's suggestion, adding the yellow of Modena.",
      "Enzo Ferrari a adopté le cavallino rampante de l'as Francesco Baracca, à la suggestion de sa famille, en y ajoutant le jaune de Modène.",
      "Enzo Ferrari adoptó el cavallino rampante del as Francesco Baracca a sugerencia de su familia, añadiendo el amarillo de Módena.",
    ]
  ),

  // ----------------------------------------------------------
  // 🇮🇹 ITALIAN — medium
  // ----------------------------------------------------------
  Q(
    "it-m-01", "italian", "medium",
    [
      "The 2.9-litre V6 in the Alfa Romeo Giulia Quadrifoglio is derived from which Ferrari engine?",
      "Le V6 de 2,9 litres de l'Alfa Romeo Giulia Quadrifoglio dérive de quel moteur Ferrari ?",
      "¿De qué motor Ferrari deriva el V6 de 2,9 litros del Alfa Romeo Giulia Quadrifoglio?",
    ],
    ["Ferrari's F154 V8", "Ferrari's F140 V12", "Maserati's Nettuno V6", "Lancia's Flavia V6"],
    0,
    [
      "It is effectively half of a twin-turbo V8 from Maranello.",
      "C'est en réalité la moitié d'un V8 biturbo de Maranello.",
      "Es, en la práctica, la mitad de un V8 biturbo de Maranello.",
    ],
    [
      "The Giulia Quadrifoglio's V6 is derived from Ferrari's F154 twin-turbo V8, with two cylinders removed.",
      "Le V6 de la Giulia Quadrifoglio dérive du V8 biturbo F154 de Ferrari, amputé de deux cylindres.",
      "El V6 del Giulia Quadrifoglio deriva del V8 biturbo F154 de Ferrari, con dos cilindros menos.",
    ],
    { carId: "alfa-romeo-giulia-qv", claims: [{ field: "hp", value: 505 }] }
  ),
  Q(
    "it-m-02", "italian", "medium",
    [
      "Which Italian manufacturer built the Miura, widely regarded as the first mid-engine supercar?",
      "Quel constructeur italien a construit la Miura, largement considérée comme la première supercar à moteur central ?",
      "¿Qué fabricante italiano construyó el Miura, considerado el primer superdeportivo de motor central?",
    ],
    ["Lamborghini", "Ferrari", "De Tomaso", "Iso"],
    0,
    [
      "It was unveiled in 1965–66 and named after a bull-breeding family.",
      "Elle a été dévoilée en 1965-66 et porte le nom d'une famille d'éleveurs de taureaux.",
      "Se presentó en 1965-66 y lleva el nombre de una familia de ganaderos de toros.",
    ],
    [
      "The Lamborghini Miura (1966) put a transversely mounted V12 behind the seats and defined the supercar template.",
      "La Lamborghini Miura (1966) plaçait un V12 transversal derrière les sièges et a défini le modèle de la supercar.",
      "El Lamborghini Miura (1966) situaba un V12 transversal detrás de los asientos y definió el modelo del superdeportivo.",
    ]
  ),
  Q(
    "it-m-03", "italian", "medium",
    [
      "The Maserati MC12 was based on which Ferrari?",
      "Sur quelle Ferrari la Maserati MC12 était-elle basée ?",
      "¿En qué Ferrari se basaba el Maserati MC12?",
    ],
    ["Enzo", "F430", "360 Modena", "575M Maranello"],
    0,
    [
      "It was built to homologate a GT1 race car, and only 50 road versions exist.",
      "Elle a été construite pour homologuer une voiture de course GT1, et seules 50 versions route existent.",
      "Se construyó para homologar un coche de carreras GT1 y solo existen 50 versiones de calle.",
    ],
    [
      "The MC12 shared its chassis and V12 with the Ferrari Enzo, built to homologate Maserati's GT1 racer.",
      "La MC12 partageait son châssis et son V12 avec la Ferrari Enzo, construite pour homologuer la GT1 de Maserati.",
      "El MC12 compartía chasis y V12 con el Ferrari Enzo, construido para homologar el GT1 de Maserati.",
    ],
    { carId: "ferrari-enzo" }
  ),

  // ----------------------------------------------------------
  // 🇮🇹 ITALIAN — hard
  // ----------------------------------------------------------
  Q(
    "it-h-01", "italian", "hard",
    [
      "Which Italian car was the first production car to exceed 200 mph?",
      "Quelle voiture italienne a été la première voiture de série à dépasser 200 mph ?",
      "¿Qué coche italiano fue el primero de producción en superar las 200 mph?",
    ],
    ["Ferrari F40", "Lamborghini Diablo", "Bugatti EB110", "Ferrari 288 GTO"],
    0,
    [
      "Its top speed is recorded at 324 km/h.",
      "Sa vitesse maximale est enregistrée à 324 km/h.",
      "Su velocidad máxima está registrada en 324 km/h.",
    ],
    [
      "The F40 reached 324 km/h, making it the first production car past 200 mph when it launched.",
      "La F40 atteignait 324 km/h, première voiture de série à dépasser les 200 mph à son lancement.",
      "El F40 alcanzaba 324 km/h, el primer coche de producción en superar las 200 mph en su lanzamiento.",
    ],
    { carId: "ferrari-f40", claims: [{ field: "topSpeed", value: 324 }] }
  ),
  Q(
    "it-h-02", "italian", "hard",
    [
      "Which engine does the Lamborghini Aventador use?",
      "Quel moteur utilise la Lamborghini Aventador ?",
      "¿Qué motor usa el Lamborghini Aventador?",
    ],
    ["6.5-litre naturally aspirated V12", "5.2-litre V10", "4.0-litre twin-turbo V8", "6.0-litre turbo W12"],
    0,
    [
      "It is atmospheric, and it remained in production for over a decade.",
      "Il est atmosphérique, et il est resté en production plus d'une décennie.",
      "Es atmosférico y se mantuvo en producción más de una década.",
    ],
    [
      "The Aventador uses Lamborghini's 6.5-litre naturally aspirated V12, in outputs from 700 to 770 hp.",
      "L'Aventador utilise le V12 atmosphérique de 6,5 litres de Lamborghini, de 700 à 770 ch.",
      "El Aventador usa el V12 atmosférico de 6,5 litros de Lamborghini, con potencias de 700 a 770 CV.",
    ],
    { carId: "lamborghini-aventador-svj", claims: [{ field: "hp", value: 770 }] }
  ),
  Q(
    "it-h-03", "italian", "hard",
    [
      "Why does Alfa Romeo use a four-leaf clover on its performance models?",
      "Pourquoi Alfa Romeo utilise-t-elle un trèfle à quatre feuilles sur ses modèles performants ?",
      "¿Por qué Alfa Romeo usa un trébol de cuatro hojas en sus modelos de altas prestaciones?",
    ],
    [
      "It was a good-luck emblem first painted on a race car in 1923",
      "It represents the four cylinders of the original engine",
      "It was the family crest of the company founder",
      "It marks cars built in the fourth factory",
    ],
    0,
    [
      "It belongs to racing folklore rather than engineering.",
      "Cela relève du folklore de la course plutôt que de l'ingénierie.",
      "Pertenece al folclore de las carreras más que a la ingeniería.",
    ],
    [
      "Driver Ugo Sivocci painted a four-leaf clover in a white square for luck before the 1923 Targa Florio — and won. It has marked Alfa's racing and performance cars ever since.",
      "Le pilote Ugo Sivocci a peint un trèfle à quatre feuilles dans un carré blanc avant la Targa Florio 1923 — et a gagné. Il marque depuis les Alfa de course et de performance.",
      "El piloto Ugo Sivocci pintó un trébol de cuatro hojas en un cuadrado blanco antes de la Targa Florio de 1923, y ganó. Desde entonces marca los Alfa de competición y altas prestaciones.",
    ]
  ),

  // ----------------------------------------------------------
  // 🇮🇹 ITALIAN — expert
  // ----------------------------------------------------------
  Q(
    "it-x-01", "italian", "expert",
    [
      "Roughly how many Ferrari Enzo cars were built?",
      "Environ combien de Ferrari Enzo ont été construites ?",
      "¿Aproximadamente cuántos Ferrari Enzo se fabricaron?",
    ],
    ["Around 400", "Around 250", "Around 600", "Around 1,000"],
    0,
    [
      "The production run was deliberately capped, though demand far exceeded it.",
      "La production a été volontairement limitée, alors que la demande la dépassait largement.",
      "La producción se limitó a propósito, aunque la demanda la superaba con creces.",
    ],
    [
      "Around 400 Enzos were built between 2002 and 2004, each with a 6.0-litre V12 producing 660 hp.",
      "Environ 400 Enzo ont été construites entre 2002 et 2004, chacune avec un V12 de 6,0 litres de 660 ch.",
      "Se fabricaron unos 400 Enzo entre 2002 y 2004, cada uno con un V12 de 6,0 litros y 660 CV.",
    ],
    { carId: "ferrari-enzo", claims: [{ field: "hp", value: 660 }] }
  ),
  Q(
    "it-x-02", "italian", "expert",
    [
      "Which Italian coachbuilder designed the body of the Ferrari Testarossa?",
      "Quel carrossier italien a dessiné la carrosserie de la Ferrari Testarossa ?",
      "¿Qué carrocero italiano diseñó la carrocería del Ferrari Testarossa?",
    ],
    ["Pininfarina", "Bertone", "Zagato", "Touring Superleggera"],
    0,
    [
      "The same house designed most Ferraris from the 1950s to the 2000s.",
      "La même maison a dessiné la plupart des Ferrari des années 50 aux années 2000.",
      "La misma casa diseñó la mayoría de los Ferrari de los años 50 a los 2000.",
    ],
    [
      "Pininfarina designed the Testarossa, including the famous side strakes and full-width rear light panel.",
      "Pininfarina a dessiné la Testarossa, avec ses célèbres stries latérales et son bandeau arrière pleine largeur.",
      "Pininfarina diseñó el Testarossa, incluidas sus famosas branquias laterales y su banda trasera de ancho completo.",
    ],
    { carId: "ferrari-testarossa" }
  ),
  Q(
    "it-x-03", "italian", "expert",
    [
      "How many Ferrari 250 GTOs were built?",
      "Combien de Ferrari 250 GTO ont été construites ?",
      "¿Cuántos Ferrari 250 GTO se fabricaron?",
    ],
    ["39", "24", "72", "100"],
    0,
    [
      "Its scarcity is a large part of why it regularly tops auction records.",
      "Sa rareté explique en grande partie ses records réguliers aux enchères.",
      "Su escasez explica en gran parte sus récords habituales en subastas.",
    ],
    [
      "39 examples of the 250 GTO were built between 1962 and 1964, making it one of the most valuable cars in the world.",
      "39 exemplaires de la 250 GTO ont été construits entre 1962 et 1964, l'une des voitures les plus cotées au monde.",
      "Se fabricaron 39 unidades del 250 GTO entre 1962 y 1964, uno de los coches más valiosos del mundo.",
    ]
  ),

  // ----------------------------------------------------------
  // 🇮🇹 ITALIAN — insane
  // ----------------------------------------------------------
  Q(
    "it-i-01", "italian", "insane",
    [
      "Which engine powered the Lancia Stratos, the first car designed specifically to win world rallying?",
      "Quel moteur animait la Lancia Stratos, première voiture conçue spécifiquement pour gagner en rallye mondial ?",
      "¿Qué motor llevaba el Lancia Stratos, el primer coche diseñado específicamente para ganar el mundial de rallies?",
    ],
    ["A 2.4-litre Dino V6", "A 2.0-litre flat-four", "A 3.0-litre V8", "A 1.6-litre turbo four"],
    0,
    [
      "The engine came from another Italian group brand, mid-mounted behind the seats.",
      "Le moteur venait d'une autre marque du groupe italien, placé en position centrale arrière.",
      "El motor procedía de otra marca del grupo italiano, montado en posición central trasera.",
    ],
    [
      "The Stratos used Ferrari's 2.4-litre Dino V6 in just 980 kg, winning three consecutive world rally titles.",
      "La Stratos utilisait le V6 Dino de 2,4 litres de Ferrari pour 980 kg, remportant trois titres mondiaux consécutifs.",
      "El Stratos usaba el V6 Dino de 2,4 litros de Ferrari en solo 980 kg y ganó tres títulos mundiales consecutivos.",
    ],
    { carId: "lancia-stratos", claims: [{ field: "weight", value: 980 }] }
  ),
  Q(
    "it-i-02", "italian", "insane",
    [
      "Which engine supplier builds the V12 for the Pagani Huayra?",
      "Quel motoriste construit le V12 de la Pagani Huayra ?",
      "¿Qué proveedor fabrica el V12 del Pagani Huayra?",
    ],
    ["Mercedes-AMG", "Ferrari", "Lamborghini", "Cosworth"],
    0,
    [
      "The engine code is M158, and the partnership dates back to the Zonda.",
      "Le code moteur est M158, et le partenariat remonte à la Zonda.",
      "El código de motor es M158 y la asociación se remonta al Zonda.",
    ],
    [
      "Mercedes-AMG supplies Pagani's V12s: the M158 in the Huayra produces 730 hp from 6.0 litres.",
      "Mercedes-AMG fournit les V12 de Pagani : le M158 de la Huayra développe 730 ch pour 6,0 litres.",
      "Mercedes-AMG suministra los V12 de Pagani: el M158 del Huayra rinde 730 CV de 6,0 litros.",
    ],
    { carId: "pagani-huayra", claims: [{ field: "hp", value: 730 }] }
  ),
  Q(
    "it-i-03", "italian", "insane",
    [
      "How many valves per cylinder did the 5.2-litre V12 of the Lamborghini Countach 5000 QV use?",
      "Combien de soupapes par cylindre le V12 5,2 litres de la Lamborghini Countach 5000 QV utilisait-il ?",
      "¿Cuántas válvulas por cilindro usaba el V12 de 5,2 litros del Lamborghini Countach 5000 QV?",
    ],
    ["Four", "Two", "Three", "Five"],
    0,
    [
      "The QV in its name literally stands for the answer.",
      "Le QV de son nom signifie littéralement la réponse.",
      "Las siglas QV de su nombre significan literalmente la respuesta.",
    ],
    [
      "QV stands for quattrovalvole — four valves — on the 5.2-litre V12 Countach produced from 1985.",
      "QV signifie quattrovalvole — quatre soupapes — sur le V12 5,2 litres de la Countach produite à partir de 1985.",
      "QV significa quattrovalvole —cuatro válvulas— en el V12 de 5,2 litros del Countach producido desde 1985.",
    ],
    { carId: "lamborghini-countach", claims: [{ field: "hp", value: 455 }] }
  ),

  // ----------------------------------------------------------
  // 🏎️ SUPERCARS — easy
  // ----------------------------------------------------------
  Q(
    "sc-e-01", "supercars", "easy",
    [
      "Which 1966 car is usually credited as the first modern “supercar”?",
      "Quelle voiture de 1966 est généralement considérée comme la première « supercar » moderne ?",
      "¿Qué coche de 1966 se considera habitualmente el primer «superdeportivo» moderno?",
    ],
    ["Lamborghini Miura", "Ferrari Daytona", "Porsche 911", "Ford GT40"],
    0,
    [
      "Its mid-engine layout was radical for a road car at the time.",
      "Son architecture à moteur central était radicale pour une voiture de route à l'époque.",
      "Su configuración de motor central era radical para un coche de calle en aquella época.",
    ],
    [
      "The Miura's transverse mid-engine V12 set the template that the term “supercar” came to describe.",
      "Le V12 central transversal de la Miura a établi le modèle que le terme « supercar » a fini par désigner.",
      "El V12 central transversal del Miura estableció el modelo que el término «superdeportivo» acabó describiendo.",
    ]
  ),
  Q(
    "sc-e-02", "supercars", "easy",
    [
      "Which of these cars has the highest power output?",
      "Laquelle de ces voitures a la puissance la plus élevée ?",
      "¿Cuál de estos coches tiene la mayor potencia?",
    ],
    ["Rimac Nevera (1,914 hp)", "Ferrari F8 Tributo (720 hp)", "McLaren 720S (720 hp)", "Lamborghini Huracán EVO (640 hp)"],
    0,
    [
      "It is electric, with a motor at each wheel.",
      "Elle est électrique, avec un moteur à chaque roue.",
      "Es eléctrico, con un motor en cada rueda.",
    ],
    [
      "At 1,914 hp the Rimac Nevera produces more than twice the output of the two 720-hp cars in this list.",
      "Avec 1 914 ch, la Rimac Nevera produit plus du double des deux voitures de 720 ch de cette liste.",
      "Con 1.914 CV, el Rimac Nevera rinde más del doble que los dos coches de 720 CV de esta lista.",
    ],
    { carId: "rimac-nevera", claims: [{ field: "hp", value: 1914 }] }
  ),

  // ----------------------------------------------------------
  // 🏎️ SUPERCARS — medium
  // ----------------------------------------------------------
  Q(
    "sc-m-01", "supercars", "medium",
    [
      "What does the number in the McLaren 720S name refer to?",
      "À quoi le chiffre du nom de la McLaren 720S fait-il référence ?",
      "¿A qué se refiere el número en el nombre del McLaren 720S?",
    ],
    ["Its power output in metric horsepower", "Its top speed in km/h, halved", "Its engine capacity in cubic centimetres", "The number of units built"],
    0,
    [
      "McLaren has used this naming convention since the 12C and 650S.",
      "McLaren utilise cette convention depuis la 12C et la 650S.",
      "McLaren usa esta convención desde el 12C y el 650S.",
    ],
    [
      "The 720S makes 720 PS from its 4.0-litre twin-turbo V8 — the name is simply its output.",
      "La 720S développe 720 ch grâce à son V8 biturbo de 4,0 litres : le nom indique simplement sa puissance.",
      "El 720S rinde 720 CV con su V8 biturbo de 4,0 litros: el nombre indica simplemente su potencia.",
    ],
    { carId: "mclaren-720s", claims: [{ field: "hp", value: 720 }] }
  ),
  Q(
    "sc-m-02", "supercars", "medium",
    [
      "Which supercar is built around a carbon-fibre tub that McLaren calls the MonoCell?",
      "Quelle supercar est construite autour d'une coque en carbone que McLaren appelle MonoCell ?",
      "¿Qué superdeportivo se construye alrededor de una bañera de carbono que McLaren llama MonoCell?",
    ],
    ["McLaren 720S", "Ferrari 488 GTB", "Aston Martin DB11", "Bentley Continental GT"],
    0,
    [
      "The British manufacturer has used carbon tubs in every road car since the F1.",
      "Le constructeur britannique utilise des coques en carbone sur toutes ses voitures de route depuis la F1.",
      "El fabricante británico usa bañeras de carbono en todos sus coches de calle desde el F1.",
    ],
    [
      "McLaren has built every road car since the F1 around a carbon-fibre monocoque — the Monocage on the 720S.",
      "McLaren construit toutes ses voitures de route autour d'une monocoque en carbone depuis la F1 — la Monocage sur la 720S.",
      "McLaren construye todos sus coches de calle alrededor de un monocasco de carbono desde el F1: la Monocage en el 720S.",
    ],
    { carId: "mclaren-720s" }
  ),
  Q(
    "sc-m-03", "supercars", "medium",
    [
      "What is the engine configuration of the Lamborghini Huracán EVO?",
      "Quelle est l'architecture moteur de la Lamborghini Huracán EVO ?",
      "¿Cuál es la configuración del motor del Lamborghini Huracán EVO?",
    ],
    ["5.2-litre naturally aspirated V10", "4.0-litre twin-turbo V8", "6.5-litre V12", "3.8-litre twin-turbo flat-six"],
    0,
    [
      "Ten cylinders, no turbochargers, and a very high redline.",
      "Dix cylindres, aucun turbo, et un régime maximal très élevé.",
      "Diez cilindros, sin turbos y con un régimen máximo muy alto.",
    ],
    [
      "The Huracán EVO uses a 5.2-litre naturally aspirated V10 producing 640 hp, shared in concept with the Audi R8.",
      "La Huracán EVO utilise un V10 atmosphérique de 5,2 litres développant 640 ch, proche de celui de l'Audi R8.",
      "El Huracán EVO usa un V10 atmosférico de 5,2 litros con 640 CV, próximo al del Audi R8.",
    ],
    { carId: "lamborghini-huracan-evo", claims: [{ field: "hp", value: 640 }] }
  ),

  // ----------------------------------------------------------
  // 🏎️ SUPERCARS — hard
  // ----------------------------------------------------------
  Q(
    "sc-h-01", "supercars", "hard",
    [
      "Which car set the two-way production car speed record in 2017 at 277.87 mph?",
      "Quelle voiture a établi le record de vitesse en deux passes pour voiture de série en 2017, à 277,87 mph ?",
      "¿Qué coche estableció en 2017 el récord de velocidad en dos pasadas para coches de serie, a 277,87 mph?",
    ],
    ["Koenigsegg Agera RS", "Bugatti Chiron", "Hennessey Venom GT", "SSC Tuatara"],
    0,
    [
      "The run took place on a closed public highway in Nevada.",
      "La tentative a eu lieu sur une route publique fermée dans le Nevada.",
      "El intento se realizó en una carretera pública cerrada en Nevada.",
    ],
    [
      "The Agera RS averaged 277.87 mph (447.19 km/h) over two runs on a Nevada highway in 2017.",
      "L'Agera RS a atteint 277,87 mph (447,19 km/h) en moyenne sur deux passes dans le Nevada en 2017.",
      "El Agera RS promedió 277,87 mph (447,19 km/h) en dos pasadas en una carretera de Nevada en 2017.",
    ],
    { carId: "koenigsegg-agera-rs", claims: [{ field: "topSpeed", value: 447 }] }
  ),
  Q(
    "sc-h-02", "supercars", "hard",
    [
      "The V12 in the Aston Martin Valkyrie was developed with which engineering company?",
      "Avec quelle société d'ingénierie le V12 de l'Aston Martin Valkyrie a-t-il été développé ?",
      "¿Con qué empresa de ingeniería se desarrolló el V12 del Aston Martin Valkyrie?",
    ],
    ["Cosworth", "Ilmor", "Ricardo", "Prodrive"],
    0,
    [
      "The same British firm built the DFV that dominated Formula 1 for a decade.",
      "La même société britannique a construit le DFV qui a dominé la Formule 1 pendant une décennie.",
      "La misma firma británica construyó el DFV que dominó la Fórmula 1 durante una década.",
    ],
    [
      "Cosworth built the Valkyrie's 6.5-litre V12, which revs past 11,000 rpm and is combined with hybrid assistance.",
      "Cosworth a construit le V12 de 6,5 litres de la Valkyrie, qui dépasse 11 000 tr/min et est associé à une hybridation.",
      "Cosworth construyó el V12 de 6,5 litros del Valkyrie, que supera las 11.000 rpm y se combina con hibridación.",
    ],
    { carId: "aston-martin-valkyrie" }
  ),
  Q(
    "sc-h-03", "supercars", "hard",
    [
      "Which of these cars is the lightest?",
      "Laquelle de ces voitures est la plus légère ?",
      "¿Cuál de estos coches es el más ligero?",
    ],
    ["Lotus Elise", "Porsche 911 GT3", "McLaren 570S", "Ferrari 458 Italia"],
    0,
    [
      "Its maker's philosophy is: simplify, then add lightness.",
      "La philosophie de son constructeur : simplifier, puis alléger.",
      "La filosofía de su fabricante: simplificar y luego aligerar.",
    ],
    [
      "At 866 kg the Elise is hundreds of kilos lighter than anything else here — that is the whole Lotus philosophy.",
      "Avec 866 kg, l'Elise est des centaines de kilos plus légère que les autres : c'est toute la philosophie Lotus.",
      "Con 866 kg, el Elise es cientos de kilos más ligero que el resto: esa es toda la filosofía de Lotus.",
    ],
    { carId: "lotus-elise", claims: [{ field: "weight", value: 866 }] }
  ),

  // ----------------------------------------------------------
  // 🏎️ SUPERCARS — expert
  // ----------------------------------------------------------
  Q(
    "sc-x-01", "supercars", "expert",
    [
      "What was the powertrain layout of the Porsche Carrera GT?",
      "Quelle était l'architecture mécanique de la Porsche Carrera GT ?",
      "¿Cuál era la configuración mecánica del Porsche Carrera GT?",
    ],
    ["5.7-litre V10 with a manual gearbox", "5.5-litre V12 with an automatic", "4.5-litre twin-turbo flat-six, manual", "6.0-litre W12 with a dual-clutch"],
    0,
    [
      "Its engine was originally developed for a cancelled Le Mans prototype.",
      "Son moteur avait été développé à l'origine pour un prototype du Mans annulé.",
      "Su motor se desarrolló originalmente para un prototipo de Le Mans cancelado.",
    ],
    [
      "The Carrera GT used a 5.7-litre V10 with a six-speed manual gearbox and a beechwood-and-carbon shift knob.",
      "La Carrera GT utilisait un V10 de 5,7 litres avec une boîte manuelle à six rapports et un pommeau en hêtre et carbone.",
      "El Carrera GT usaba un V10 de 5,7 litros con cambio manual de seis marchas y un pomo de haya y carbono.",
    ]
  ),
  Q(
    "sc-x-02", "supercars", "expert",
    [
      "Which McLaren was the first to use the 3.0-litre V6 hybrid powertrain?",
      "Quelle McLaren a été la première à utiliser le groupe propulseur V6 hybride de 3,0 litres ?",
      "¿Qué McLaren fue el primero en usar el grupo motopropulsor V6 híbrido de 3,0 litros?",
    ],
    ["Artura", "720S", "Senna", "Speedtail"],
    0,
    [
      "Its name refers to a new beginning for the company.",
      "Son nom évoque un nouveau départ pour l'entreprise.",
      "Su nombre alude a un nuevo comienzo para la empresa.",
    ],
    [
      "The Artura, launched in 2021, was McLaren's first series-production hybrid, with a 3.0-litre twin-turbo V6 and an axial-flux motor.",
      "L'Artura, lancée en 2021, fut la première hybride de série de McLaren, avec un V6 biturbo de 3,0 litres et un moteur à flux axial.",
      "El Artura, lanzado en 2021, fue el primer híbrido de serie de McLaren, con un V6 biturbo de 3,0 litros y un motor de flujo axial.",
    ],
    { carId: "mclaren-artura" }
  ),
  Q(
    "sc-x-03", "supercars", "expert",
    [
      "How many examples of the Bugatti Divo were built?",
      "Combien d'exemplaires de la Bugatti Divo ont été construits ?",
      "¿Cuántas unidades del Bugatti Divo se fabricaron?",
    ],
    ["40", "25", "100", "300"],
    0,
    [
      "It is a cornering-focused derivative of the Chiron, not a top-speed car.",
      "C'est une dérivée de la Chiron axée sur le virage, pas sur la vitesse de pointe.",
      "Es una derivada del Chiron centrada en el paso por curva, no en la velocidad punta.",
    ],
    [
      "Just 40 Divos were built, each focused on cornering rather than absolute top speed.",
      "Seulement 40 Divo ont été construites, chacune axée sur le virage plutôt que sur la vitesse absolue.",
      "Solo se fabricaron 40 Divo, cada uno centrado en el paso por curva más que en la velocidad absoluta.",
    ],
    { carId: "bugatti-divo" }
  ),

  // ----------------------------------------------------------
  // 🏎️ SUPERCARS — insane
  // ----------------------------------------------------------
  Q(
    "sc-i-01", "supercars", "insane",
    [
      "Which electric hypercar in the CarVibes database has the highest power output?",
      "Quelle hypercar électrique de la base de données CarVibes a la puissance la plus élevée ?",
      "¿Qué hypercar eléctrico de la base de datos de CarVibes tiene la mayor potencia?",
    ],
    ["Lotus Evija (1,973 hp)", "Rimac Nevera (1,914 hp)", "Koenigsegg Gemera (1,700 hp)", "Bugatti Chiron Super Sport (1,600 hp)"],
    0,
    [
      "One of the four options is not electric at all, and one is a four-seater.",
      "L'une des quatre options n'est pas du tout électrique, et une autre est une quatre places.",
      "Una de las cuatro opciones no es eléctrica y otra es un cuatro plazas.",
    ],
    [
      "The Lotus Evija is rated at 1,973 hp from four electric motors, edging out the Rimac Nevera's 1,914 hp.",
      "La Lotus Evija affiche 1 973 ch issus de quatre moteurs électriques, devant les 1 914 ch de la Rimac Nevera.",
      "El Lotus Evija rinde 1.973 CV de cuatro motores eléctricos, por delante de los 1.914 CV del Rimac Nevera.",
    ],
    { carId: "lotus-evija", fact: { carId: "lotus-evija", field: "hp" } }
  ),
  Q(
    "sc-i-02", "supercars", "insane",
    [
      "The Koenigsegg Regera has no conventional gearbox. What takes its place?",
      "La Koenigsegg Regera n'a pas de boîte de vitesses classique. Qu'est-ce qui la remplace ?",
      "¿El Koenigsegg Regera no tiene caja de cambios convencional. ¿Qué la sustituye?",
    ],
    ["A direct-drive system with a hydraulic coupling", "A continuously variable transmission", "A single-speed planetary gearbox", "A two-ratio dual-clutch"],
    0,
    [
      "Koenigsegg calls it KDD, and it removes an entire set of gears.",
      "Koenigsegg l'appelle KDD, et il supprime tout un jeu d'engrenages.",
      "Koenigsegg lo llama KDD y elimina todo un conjunto de engranajes.",
    ],
    [
      "The Regera uses Koenigsegg Direct Drive: the engine is coupled to the rear axle through a hydraulic coupling, with electric motors filling in the torque.",
      "La Regera utilise le Koenigsegg Direct Drive : le moteur est couplé à l'essieu arrière par un accouplement hydraulique, les moteurs électriques complétant le couple.",
      "El Regera usa el Koenigsegg Direct Drive: el motor va acoplado al eje trasero mediante un acoplamiento hidráulico, y los motores eléctricos completan el par.",
    ],
    { carId: "koenigsegg-regera" }
  ),
  Q(
    "sc-i-03", "supercars", "insane",
    [
      "Which supercar had an engine bay lined with gold foil?",
      "Quelle supercar avait un compartiment moteur garni de feuille d'or ?",
      "¿Qué superdeportivo tenía el vano motor revestido de pan de oro?",
    ],
    ["McLaren F1", "Bugatti Veyron", "Pagani Zonda F", "Ferrari F50"],
    0,
    [
      "The material was chosen for heat reflection, not decoration.",
      "Le matériau a été choisi pour la réflexion thermique, pas pour la décoration.",
      "El material se eligió por su reflexión térmica, no por decoración.",
    ],
    [
      "The McLaren F1's engine bay is lined with gold foil to reflect heat away from the carbon-fibre tub.",
      "Le compartiment moteur de la McLaren F1 est garni de feuille d'or pour réfléchir la chaleur loin de la coque en carbone.",
      "El vano motor del McLaren F1 está revestido de pan de oro para reflejar el calor lejos de la bañera de carbono.",
    ],
    { carId: "mclaren-f1" }
  ),
  Q(
    "sc-i-04", "supercars", "insane",
    [
      "How many Pagani Huayra coupés were originally planned for production?",
      "Combien de coupés Pagani Huayra étaient initialement prévus en production ?",
      "¿Cuántos Pagani Huayra coupé se planificaron originalmente?",
    ],
    ["100", "50", "300", "25"],
    0,
    [
      "Once all 100 were allocated, Pagani introduced roadster and special versions.",
      "Une fois les 100 attribuées, Pagani a introduit des versions roadster et spéciales.",
      "Una vez asignados los 100, Pagani introdujo versiones roadster y especiales.",
    ],
    [
      "The Huayra was limited to 100 coupés; after they sold out, Pagani built the Roadster, BC and Imola variants.",
      "La Huayra a été limitée à 100 coupés ; une fois vendus, Pagani a produit les versions Roadster, BC et Imola.",
      "El Huayra se limitó a 100 coupés; una vez vendidos, Pagani fabricó las versiones Roadster, BC e Imola.",
    ],
    { carId: "pagani-huayra" }
  ),

  // ----------------------------------------------------------
  // ⚡ ELECTRIC — easy
  // ----------------------------------------------------------
  Q(
    "ev-e-01", "electric", "easy",
    [
      "Which company builds the Model S Plaid?",
      "Quel constructeur fabrique la Model S Plaid ?",
      "¿Qué fabricante produce el Model S Plaid?",
    ],
    ["Tesla", "Lucid", "Rivian", "Polestar"],
    0,
    [
      "Its name comes from a joke about a very high speed in a cult film.",
      "Son nom vient d'une blague sur une vitesse très élevée dans un film culte.",
      "Su nombre procede de una broma sobre una velocidad muy alta en una película de culto.",
    ],
    [
      "The Model S Plaid is Tesla's tri-motor flagship saloon, with 1,020 hp.",
      "La Model S Plaid est la berline phare de Tesla à trois moteurs, avec 1 020 ch.",
      "El Model S Plaid es la berlina insignia de Tesla con tres motores y 1.020 CV.",
    ],
    { carId: "tesla-model-s-plaid", claims: [{ field: "hp", value: 1020 }] }
  ),
  Q(
    "ev-e-02", "electric", "easy",
    [
      "What does the kWh figure quoted for an electric car describe?",
      "Que décrit la valeur en kWh donnée pour une voiture électrique ?",
      "¿Qué describe la cifra de kWh que se indica en un coche eléctrico?",
    ],
    [
      "The energy capacity of its battery",
      "Its maximum power output",
      "Its motor efficiency",
      "Its maximum charging speed",
    ],
    0,
    [
      "It is a measure of stored energy, not of power.",
      "C'est une mesure d'énergie stockée, pas de puissance.",
      "Es una medida de energía almacenada, no de potencia.",
    ],
    [
      "A kilowatt-hour measures stored energy: a 100 kWh battery can deliver 100 kW for one hour, in theory.",
      "Un kilowattheure mesure l'énergie stockée : une batterie de 100 kWh peut théoriquement délivrer 100 kW pendant une heure.",
      "Un kilovatio-hora mide la energía almacenada: una batería de 100 kWh puede entregar 100 kW durante una hora, en teoría.",
    ]
  ),

  // ----------------------------------------------------------
  // ⚡ ELECTRIC — medium
  // ----------------------------------------------------------
  Q(
    "ev-m-01", "electric", "medium",
    [
      "Which electric saloon uses an 800-volt architecture to allow very fast charging?",
      "Quelle berline électrique utilise une architecture 800 volts permettant une charge très rapide ?",
      "¿Qué berlina eléctrica usa una arquitectura de 800 voltios para permitir una carga muy rápida?",
    ],
    ["Porsche Taycan", "Nissan Leaf", "BMW i3", "Tesla Model 3"],
    0,
    [
      "Higher voltage means lower current for the same power, so thinner cables and less heat.",
      "Une tension plus élevée signifie moins de courant pour la même puissance, donc des câbles plus fins et moins de chaleur.",
      "Más voltaje significa menos corriente para la misma potencia, así que cables más finos y menos calor.",
    ],
    [
      "The Taycan was the first production EV on an 800-volt architecture, which enables much higher charging power.",
      "La Taycan a été la première voiture électrique de série sur une architecture 800 volts, permettant une puissance de charge bien supérieure.",
      "El Taycan fue el primer eléctrico de producción con arquitectura de 800 voltios, lo que permite mucha más potencia de carga.",
    ],
    { carId: "porsche-taycan" }
  ),
  Q(
    "ev-m-02", "electric", "medium",
    [
      "What is the main benefit of regenerative braking?",
      "Quel est le principal avantage du freinage régénératif ?",
      "¿Cuál es la principal ventaja del frenado regenerativo?",
    ],
    [
      "It converts kinetic energy back into stored battery energy",
      "It removes the need for friction brakes entirely",
      "It increases the car's top speed",
      "It reduces the battery's usable capacity",
    ],
    0,
    [
      "The electric motor acts as a generator while slowing down.",
      "Le moteur électrique agit comme une génératrice lors du ralentissement.",
      "El motor eléctrico actúa como generador al frenar.",
    ],
    [
      "Regenerative braking turns the motor into a generator, recovering energy that friction brakes would waste as heat.",
      "Le freinage régénératif transforme le moteur en génératrice, récupérant l'énergie que les freins dissiperaient en chaleur.",
      "El frenado regenerativo convierte el motor en generador y recupera la energía que los frenos desperdiciarían como calor.",
    ]
  ),
  Q(
    "ev-m-03", "electric", "medium",
    [
      "In which country is the Rimac Nevera made?",
      "Dans quel pays la Rimac Nevera est-elle fabriquée ?",
      "¿En qué país se fabrica el Rimac Nevera?",
    ],
    ["Croatia", "Slovenia", "Italy", "Austria"],
    0,
    [
      "The company started in a garage, converting an old BMW to electric drive.",
      "L'entreprise a commencé dans un garage, en convertissant une vieille BMW à l'électrique.",
      "La empresa empezó en un garaje, convirtiendo un viejo BMW a eléctrico.",
    ],
    [
      "Rimac Automobili builds its hypercars and battery technology in Croatia.",
      "Rimac Automobili construit ses hypercars et sa technologie de batteries en Croatie.",
      "Rimac Automobili fabrica sus hypercars y su tecnología de baterías en Croacia.",
    ],
    { carId: "rimac-nevera" }
  ),

  // ----------------------------------------------------------
  // ⚡ ELECTRIC — hard
  // ----------------------------------------------------------
  Q(
    "ev-h-01", "electric", "hard",
    [
      "In electric vehicle batteries, what does LFP stand for?",
      "Dans les batteries de voitures électriques, que signifie LFP ?",
      "En las baterías de vehículos eléctricos, ¿qué significa LFP?",
    ],
    ["Lithium iron phosphate", "Lithium fluoropolymer", "Low-frequency pulse", "Lithium ferrite pack"],
    0,
    [
      "The chemistry uses no nickel or cobalt, which makes it cheaper and longer-lived.",
      "Cette chimie n'utilise ni nickel ni cobalt, ce qui la rend moins chère et plus durable.",
      "Esta química no usa níquel ni cobalto, lo que la hace más barata y duradera.",
    ],
    [
      "LFP — lithium iron phosphate — cells are cheaper, more durable and thermally stable, at the cost of lower energy density.",
      "Les cellules LFP — lithium fer phosphate — sont moins chères, plus durables et plus stables, au prix d'une densité d'énergie plus faible.",
      "Las celdas LFP —litio hierro fosfato— son más baratas, duraderas y estables, a costa de una menor densidad energética.",
    ]
  ),
  Q(
    "ev-h-02", "electric", "hard",
    [
      "How many electric motors does the Tesla Model S Plaid use?",
      "Combien de moteurs électriques la Tesla Model S Plaid utilise-t-elle ?",
      "¿Cuántos motores eléctricos usa el Tesla Model S Plaid?",
    ],
    ["Three", "Two", "Four", "One"],
    0,
    [
      "One drives the front axle and the other two split the rear.",
      "Un moteur entraîne l'essieu avant et les deux autres se partagent l'arrière.",
      "Un motor mueve el eje delantero y los otros dos se reparten el trasero.",
    ],
    [
      "The Plaid uses three motors — one at the front and two at the rear — for 1,020 hp and torque vectoring.",
      "La Plaid utilise trois moteurs — un à l'avant et deux à l'arrière — pour 1 020 ch et un vectoring de couple.",
      "El Plaid usa tres motores —uno delante y dos detrás— para 1.020 CV y vectorización de par.",
    ],
    { carId: "tesla-model-s-plaid", claims: [{ field: "hp", value: 1020 }] }
  ),
  Q(
    "ev-h-03", "electric", "hard",
    [
      "Which electric hypercar in the CarVibes database is rated at 1,914 hp?",
      "Quelle hypercar électrique de la base de données CarVibes affiche 1 914 ch ?",
      "¿Qué hypercar eléctrico de la base de datos de CarVibes rinde 1.914 CV?",
    ],
    ["Rimac Nevera", "Tesla Roadster", "Lucid Air Sapphire", "Audi e-tron GT"],
    0,
    [
      "It is named after a Mediterranean storm.",
      "Elle porte le nom d'une tempête méditerranéenne.",
      "Lleva el nombre de una tormenta mediterránea.",
    ],
    [
      "The Rimac Nevera produces 1,914 hp from four electric motors and a 120 kWh battery pack.",
      "La Rimac Nevera produit 1 914 ch grâce à quatre moteurs électriques et une batterie de 120 kWh.",
      "El Rimac Nevera produce 1.914 CV con cuatro motores eléctricos y una batería de 120 kWh.",
    ],
    { carId: "rimac-nevera", claims: [{ field: "hp", value: 1914 }] }
  ),

  // ----------------------------------------------------------
  // ⚡ ELECTRIC — expert
  // ----------------------------------------------------------
  Q(
    "ev-x-01", "electric", "expert",
    [
      "Lucid's chief engineer previously led the engineering of which car?",
      "L'ingénieur en chef de Lucid a précédemment dirigé l'ingénierie de quelle voiture ?",
      "¿El ingeniero jefe de Lucid dirigió antes la ingeniería de qué coche?",
    ],
    ["Tesla Model S", "BMW i8", "Nissan Leaf", "Chevrolet Bolt"],
    0,
    [
      "He left the American EV pioneer to found his own company.",
      "Il a quitté le pionnier américain de l'électrique pour fonder sa propre entreprise.",
      "Dejó al pionero estadounidense del eléctrico para fundar su propia empresa.",
    ],
    [
      "Peter Rawlinson was chief engineer of the Tesla Model S before becoming Lucid's CEO and CTO.",
      "Peter Rawlinson était ingénieur en chef de la Tesla Model S avant de devenir PDG et directeur technique de Lucid.",
      "Peter Rawlinson fue ingeniero jefe del Tesla Model S antes de convertirse en CEO y CTO de Lucid.",
    ],
    { carId: "lucid-air-grand-touring" }
  ),
  Q(
    "ev-x-02", "electric", "expert",
    [
      "What 0–100 km/h time does the CarVibes database list for the Tesla Roadster?",
      "Quel 0–100 km/h la base de données CarVibes indique-t-elle pour la Tesla Roadster ?",
      "¿Qué 0–100 km/h indica la base de datos de CarVibes para el Tesla Roadster?",
    ],
    ["1.9 s", "2.4 s", "1.4 s", "3.1 s"],
    0,
    [
      "It is a tri-motor car with 1,020 hp.",
      "C'est une voiture à trois moteurs avec 1 020 ch.",
      "Es un coche con tres motores y 1.020 CV.",
    ],
    [
      "CarVibes lists the Roadster at 1.9 seconds to 100 km/h, with 1,020 hp from three motors.",
      "CarVibes indique 1,9 seconde au 0–100 km/h pour le Roadster, avec 1 020 ch issus de trois moteurs.",
      "CarVibes indica 1,9 segundos en el 0–100 km/h del Roadster, con 1.020 CV de tres motores.",
    ],
    { carId: "tesla-roadster", fact: { carId: "tesla-roadster", field: "zeroToHundred" } }
  ),
  Q(
    "ev-x-03", "electric", "expert",
    [
      "Which company is the world's largest EV battery supplier by volume?",
      "Quelle entreprise est le plus grand fournisseur mondial de batteries pour voitures électriques en volume ?",
      "¿Qué empresa es el mayor proveedor mundial de baterías para vehículos eléctricos por volumen?",
    ],
    ["CATL", "LG Energy Solution", "Panasonic", "SK On"],
    0,
    [
      "It is Chinese, and it supplies both Tesla and most European manufacturers.",
      "Elle est chinoise, et fournit à la fois Tesla et la plupart des constructeurs européens.",
      "Es china y suministra tanto a Tesla como a la mayoría de los fabricantes europeos.",
    ],
    [
      "CATL supplies battery cells to Tesla, BMW, Volkswagen and many others, and leads global volume.",
      "CATL fournit des cellules à Tesla, BMW, Volkswagen et bien d'autres, et domine les volumes mondiaux.",
      "CATL suministra celdas a Tesla, BMW, Volkswagen y muchos otros, y lidera el volumen mundial.",
    ]
  ),

  // ----------------------------------------------------------
  // ⚡ ELECTRIC — insane
  // ----------------------------------------------------------
  Q(
    "ev-i-01", "electric", "insane",
    [
      "What top speed does the CarVibes database list for the Lotus Evija?",
      "Quelle vitesse maximale la base de données CarVibes indique-t-elle pour la Lotus Evija ?",
      "¿Qué velocidad máxima indica la base de datos de CarVibes para el Lotus Evija?",
    ],
    ["350 km/h", "320 km/h", "400 km/h", "280 km/h"],
    0,
    [
      "It is the first all-electric hypercar from the Norfolk manufacturer.",
      "C'est la première hypercar tout électrique du constructeur de Norfolk.",
      "Es el primer hypercar totalmente eléctrico del fabricante de Norfolk.",
    ],
    [
      "CarVibes lists the Evija at 350 km/h, with 1,973 hp from four electric motors.",
      "CarVibes indique 350 km/h pour l'Evija, avec 1 973 ch issus de quatre moteurs électriques.",
      "CarVibes indica 350 km/h para el Evija, con 1.973 CV de cuatro motores eléctricos.",
    ],
    { carId: "lotus-evija", fact: { carId: "lotus-evija", field: "topSpeed" } }
  ),
  Q(
    "ev-i-02", "electric", "insane",
    [
      "Which of these EVs uses four motors, one per wheel?",
      "Lequel de ces véhicules électriques utilise quatre moteurs, un par roue ?",
      "¿Cuál de estos eléctricos usa cuatro motores, uno por rueda?",
    ],
    ["Rimac Nevera", "Porsche Taycan Turbo S", "Audi e-tron GT", "Tesla Model Y"],
    0,
    [
      "Each of its wheels can be driven and braked independently.",
      "Chacune de ses roues peut être entraînée et freinée indépendamment.",
      "Cada una de sus ruedas puede impulsarse y frenarse de forma independiente.",
    ],
    [
      "The Nevera drives each wheel with its own motor, allowing precise torque vectoring without mechanical differentials.",
      "La Nevera entraîne chaque roue avec son propre moteur, permettant un vectoring de couple précis sans différentiel mécanique.",
      "El Nevera impulsa cada rueda con su propio motor, lo que permite una vectorización de par precisa sin diferenciales mecánicos.",
    ],
    { carId: "rimac-nevera" }
  ),
  Q(
    "ev-i-03", "electric", "insane",
    [
      "The first Tesla Roadster, launched in 2008, was based on which British sports car?",
      "La première Tesla Roadster, lancée en 2008, était basée sur quelle sportive britannique ?",
      "¿En qué deportivo británico se basó el primer Tesla Roadster, lanzado en 2008?",
    ],
    ["Lotus Elise", "TVR Sagaris", "Caterham Seven", "Morgan Aero 8"],
    0,
    [
      "The donor car's aluminium chassis was retained, with the drivetrain replaced.",
      "Le châssis en aluminium de la voiture donneuse a été conservé, la transmission étant remplacée.",
      "Se mantuvo el chasis de aluminio del coche donante, sustituyendo la transmisión.",
    ],
    [
      "The 2008 Tesla Roadster used a stretched Lotus Elise chassis with a new electric drivetrain.",
      "La Tesla Roadster de 2008 reprenait un châssis de Lotus Elise rallongé avec une nouvelle transmission électrique.",
      "El Tesla Roadster de 2008 usaba un chasis de Lotus Elise alargado con una nueva transmisión eléctrica.",
    ],
    { carId: "lotus-elise" }
  ),

  // ----------------------------------------------------------
  // 👑 LUXURY — easy
  // ----------------------------------------------------------
  Q(
    "lx-e-01", "luxury", "easy",
    [
      "Which brand is famous for the Spirit of Ecstasy bonnet ornament?",
      "Quelle marque est célèbre pour l'ornement de capot Spirit of Ecstasy ?",
      "¿Qué marca es famosa por el adorno de capó Spirit of Ecstasy?",
    ],
    ["Rolls-Royce", "Bentley", "Maybach", "Aston Martin"],
    0,
    [
      "The figure is often called the Flying Lady, and it retracts into the grille.",
      "La figurine est souvent appelée Flying Lady, et se rétracte dans la calandre.",
      "La figura suele llamarse Flying Lady y se retrae en la parrilla.",
    ],
    [
      "The Spirit of Ecstasy has stood on the bonnet of Rolls-Royce cars since 1911, and retracts automatically on modern models.",
      "La Spirit of Ecstasy orne le capot des Rolls-Royce depuis 1911 et se rétracte automatiquement sur les modèles modernes.",
      "La Spirit of Ecstasy adorna el capó de los Rolls-Royce desde 1911 y se retrae automáticamente en los modelos modernos.",
    ],
    { carId: "rolls-royce-phantom" }
  ),
  Q(
    "lx-e-02", "luxury", "easy",
    [
      "Which engine does the flagship Bentley Continental GT use?",
      "Quel moteur utilise la Bentley Continental GT haut de gamme ?",
      "¿Qué motor usa el Bentley Continental GT tope de gama?",
    ],
    ["6.0-litre twin-turbo W12", "5.0-litre supercharged V8", "6.75-litre V8", "4.4-litre twin-turbo V8"],
    0,
    [
      "It has twelve cylinders arranged in two narrow banks.",
      "Il compte douze cylindres répartis en deux rangées à angle fermé.",
      "Tiene doce cilindros dispuestos en dos bancadas de ángulo cerrado.",
    ],
    [
      "The Continental GT's W12 produces 650 hp and drives all four wheels.",
      "Le W12 de la Continental GT développe 650 ch et entraîne les quatre roues.",
      "El W12 del Continental GT rinde 650 CV y mueve las cuatro ruedas.",
    ],
    { carId: "bentley-continental-gt", claims: [{ field: "hp", value: 650 }] }
  ),

  // ----------------------------------------------------------
  // 👑 LUXURY — medium
  // ----------------------------------------------------------
  Q(
    "lx-m-01", "luxury", "medium",
    [
      "Which is the first SUV ever produced by Rolls-Royce?",
      "Quel est le premier SUV jamais produit par Rolls-Royce ?",
      "¿Cuál es el primer SUV fabricado por Rolls-Royce?",
    ],
    ["Cullinan", "Bentayga", "Urus", "DBX"],
    0,
    [
      "It is named after the largest gem-quality diamond ever found.",
      "Il porte le nom du plus gros diamant de qualité gemme jamais trouvé.",
      "Lleva el nombre del diamante de calidad gema más grande jamás encontrado.",
    ],
    [
      "The Cullinan, launched in 2018, was Rolls-Royce's first SUV, named after the world's largest gem-quality rough diamond.",
      "La Cullinan, lancée en 2018, fut le premier SUV de Rolls-Royce, nommé d'après le plus gros diamant brut de qualité gemme au monde.",
      "El Cullinan, lanzado en 2018, fue el primer SUV de Rolls-Royce, llamado así por el mayor diamante en bruto de calidad gema del mundo.",
    ],
    { carId: "rolls-royce-cullinan" }
  ),
  Q(
    "lx-m-02", "luxury", "medium",
    [
      "Which engine powers the Mercedes-Maybach S 680?",
      "Quel moteur équipe la Mercedes-Maybach S 680 ?",
      "¿Qué motor equipa el Mercedes-Maybach S 680?",
    ],
    ["6.0-litre twin-turbo V12", "4.0-litre twin-turbo V8", "5.5-litre V8", "3.0-litre inline-six"],
    0,
    [
      "It is one of the last twelve-cylinder saloons still on sale.",
      "C'est l'une des dernières berlines douze cylindres encore vendues.",
      "Es una de las últimas berlinas de doce cilindros aún a la venta.",
    ],
    [
      "The Maybach S 680 uses a 6.0-litre twin-turbo V12 producing 621 hp, with all-wheel drive.",
      "La Maybach S 680 utilise un V12 biturbo de 6,0 litres développant 621 ch, avec transmission intégrale.",
      "El Maybach S 680 usa un V12 biturbo de 6,0 litros con 621 CV y tracción total.",
    ],
    { carId: "maybach-s-680", claims: [{ field: "hp", value: 621 }] }
  ),
  Q(
    "lx-m-03", "luxury", "medium",
    [
      "The “Flying B” bonnet mascot belongs to which luxury brand?",
      "À quelle marque de luxe appartient la mascotte de capot « Flying B » ?",
      "¿A qué marca de lujo pertenece la mascota de capó «Flying B»?",
    ],
    ["Bentley", "Rolls-Royce", "Maybach", "Jaguar"],
    0,
    [
      "The letter in the mascot is the first letter of the brand name.",
      "La lettre de la mascotte est la première lettre du nom de la marque.",
      "La letra de la mascota es la primera letra del nombre de la marca.",
    ],
    [
      "The Flying B has crowned Bentley bonnets since the 1930s and returns as a deployable ornament on modern cars.",
      "Le Flying B orne les capots Bentley depuis les années 30 et redevient déployable sur les modèles modernes.",
      "La Flying B corona los capós de Bentley desde los años 30 y vuelve a ser desplegable en los modelos modernos.",
    ],
    { carId: "bentley-bentayga" }
  ),

  // ----------------------------------------------------------
  // 👑 LUXURY — hard
  // ----------------------------------------------------------
  Q(
    "lx-h-01", "luxury", "hard",
    [
      "Which brand's flagship saloon, the Mulsanne, used a 6.75-litre twin-turbo V8?",
      "Quel constructeur avait comme berline phare la Mulsanne, avec un V8 biturbo de 6,75 litres ?",
      "¿Qué marca tenía como berlina insignia el Mulsanne, con un V8 biturbo de 6,75 litros?",
    ],
    ["Bentley", "Rolls-Royce", "Mercedes-Maybach", "Aston Martin"],
    0,
    [
      "Its engine size was a direct descendant of a design from 1959.",
      "Sa cylindrée descendait directement d'un moteur de 1959.",
      "Su cilindrada descendía directamente de un motor de 1959.",
    ],
    [
      "The Bentley Mulsanne used the 6.75-litre V8 whose lineage ran back to 1959, until production ended in 2020.",
      "La Bentley Mulsanne utilisait le V8 de 6,75 litres dont la lignée remontait à 1959, jusqu'à l'arrêt de la production en 2020.",
      "El Bentley Mulsanne usaba el V8 de 6,75 litros cuya estirpe se remontaba a 1959, hasta el fin de la producción en 2020.",
    ],
    { carId: "bentley-mulsanne" }
  ),
  Q(
    "lx-h-02", "luxury", "hard",
    [
      "What is the kerb weight of the Rolls-Royce Phantom?",
      "Quel est le poids à vide de la Rolls-Royce Phantom ?",
      "¿Cuál es el peso en vacío del Rolls-Royce Phantom?",
    ],
    ["2,560 kg", "2,150 kg", "2,900 kg", "1,980 kg"],
    0,
    [
      "Despite its weight, it reaches 100 km/h in a little over five seconds.",
      "Malgré son poids, elle atteint 100 km/h en un peu plus de cinq secondes.",
      "Pese a su peso, alcanza 100 km/h en algo más de cinco segundos.",
    ],
    [
      "The Phantom weighs 2,560 kg, moved by a 6.75-litre twin-turbo V12 with 563 hp.",
      "La Phantom pèse 2 560 kg, mue par un V12 biturbo de 6,75 litres de 563 ch.",
      "El Phantom pesa 2.560 kg, movido por un V12 biturbo de 6,75 litros con 563 CV.",
    ],
    { carId: "rolls-royce-phantom", fact: { carId: "rolls-royce-phantom", field: "weight" } }
  ),
  Q(
    "lx-h-03", "luxury", "hard",
    [
      "Which ultra-luxury brand is owned by the BMW Group?",
      "Quelle marque d'ultra-luxe appartient au groupe BMW ?",
      "¿Qué marca de ultra-lujo pertenece al grupo BMW?",
    ],
    ["Rolls-Royce", "Bentley", "Maybach", "Aston Martin"],
    0,
    [
      "Its cars are built in Goodwood, England.",
      "Ses voitures sont construites à Goodwood, en Angleterre.",
      "Sus coches se fabrican en Goodwood, Inglaterra.",
    ],
    [
      "BMW acquired the Rolls-Royce name in 1998; Bentley went to the Volkswagen Group in the same deal.",
      "BMW a acquis le nom Rolls-Royce en 1998 ; Bentley est passé au groupe Volkswagen dans le même accord.",
      "BMW adquirió el nombre Rolls-Royce en 1998; Bentley pasó al grupo Volkswagen en el mismo acuerdo.",
    ]
  ),

  // ----------------------------------------------------------
  // 👑 LUXURY — expert
  // ----------------------------------------------------------
  Q(
    "lx-x-01", "luxury", "expert",
    [
      "Which group acquired Bentley in 1998, after a bidding contest with BMW?",
      "Quel groupe a acquis Bentley en 1998, après une bataille d'enchères avec BMW ?",
      "¿Qué grupo adquirió Bentley en 1998, tras una puja con BMW?",
    ],
    ["Volkswagen Group", "BMW", "Daimler", "Ford"],
    0,
    [
      "The outcome split two British marques that had shared factories for decades.",
      "Le résultat a séparé deux marques britanniques qui avaient partagé des usines pendant des décennies.",
      "El resultado separó a dos marcas británicas que habían compartido fábricas durante décadas.",
    ],
    [
      "Volkswagen won Bentley and the Crewe factory, while BMW secured the rights to the Rolls-Royce name.",
      "Volkswagen a obtenu Bentley et l'usine de Crewe, tandis que BMW obtenait les droits du nom Rolls-Royce.",
      "Volkswagen se quedó con Bentley y la fábrica de Crewe, mientras BMW logró los derechos del nombre Rolls-Royce.",
    ]
  ),
  Q(
    "lx-x-02", "luxury", "expert",
    [
      "How much power does the 6.75-litre V12 in the Rolls-Royce Phantom produce?",
      "Quelle puissance développe le V12 de 6,75 litres de la Rolls-Royce Phantom ?",
      "¿Cuánta potencia rinde el V12 de 6,75 litros del Rolls-Royce Phantom?",
    ],
    ["563 hp", "460 hp", "632 hp", "500 hp"],
    0,
    [
      "Rolls-Royce does not publish torque figures, only that it is “sufficient”.",
      "Rolls-Royce ne publie pas le couple, indiquant simplement qu'il est « suffisant ».",
      "Rolls-Royce no publica la cifra de par, solo que es «suficiente».",
    ],
    [
      "The Phantom's 6.75-litre twin-turbo V12 makes 563 hp, delivered with the effortless quality the brand is known for.",
      "Le V12 biturbo de 6,75 litres de la Phantom développe 563 ch, avec la douceur caractéristique de la marque.",
      "El V12 biturbo de 6,75 litros del Phantom rinde 563 CV, con la suavidad característica de la marca.",
    ],
    { carId: "rolls-royce-phantom", fact: { carId: "rolls-royce-phantom", field: "hp" } }
  ),

  // ----------------------------------------------------------
  // 👑 LUXURY — insane
  // ----------------------------------------------------------
  Q(
    "lx-i-01", "luxury", "insane",
    [
      "What top speed does the CarVibes database list for the Bentley Continental GT?",
      "Quelle vitesse maximale la base de données CarVibes indique-t-elle pour la Bentley Continental GT ?",
      "¿Qué velocidad máxima indica la base de datos de CarVibes para el Bentley Continental GT?",
    ],
    ["335 km/h", "305 km/h", "350 km/h", "280 km/h"],
    0,
    [
      "It is a grand tourer that can genuinely cross continents at very high speed.",
      "C'est un grand tourisme capable de traverser des continents à très haute vitesse.",
      "Es un gran turismo capaz de cruzar continentes a muy alta velocidad.",
    ],
    [
      "CarVibes lists the Continental GT at 335 km/h, with 650 hp from its 6.0-litre W12.",
      "CarVibes indique 335 km/h pour la Continental GT, avec 650 ch issus de son W12 de 6,0 litres.",
      "CarVibes indica 335 km/h para el Continental GT, con 650 CV de su W12 de 6,0 litros.",
    ],
    { carId: "bentley-continental-gt", fact: { carId: "bentley-continental-gt", field: "topSpeed" } }
  ),
  Q(
    "lx-i-02", "luxury", "insane",
    [
      "How much power does the 6.6-litre V12 in the Rolls-Royce Wraith produce?",
      "Quelle puissance développe le V12 de 6,6 litres de la Rolls-Royce Wraith ?",
      "¿Cuánta potencia rinde el V12 de 6,6 litros del Rolls-Royce Wraith?",
    ],
    ["624 hp", "563 hp", "700 hp", "503 hp"],
    0,
    [
      "It was the most powerful Rolls-Royce ever offered when it launched.",
      "C'était la Rolls-Royce la plus puissante jamais proposée à son lancement.",
      "Fue el Rolls-Royce más potente jamás ofrecido en su lanzamiento.",
    ],
    [
      "The Wraith's 6.6-litre twin-turbo V12 produces 624 hp, making it the most powerful Rolls-Royce of its time.",
      "Le V12 biturbo de 6,6 litres de la Wraith développe 624 ch, la Rolls-Royce la plus puissante de son époque.",
      "El V12 biturbo de 6,6 litros del Wraith rinde 624 CV, el Rolls-Royce más potente de su época.",
    ],
    { carId: "rolls-royce-wraith", fact: { carId: "rolls-royce-wraith", field: "hp" } }
  ),
];
