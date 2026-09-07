// ============================================================
// CARVIBES QUIZ — 🧠 Car knowledge + 🏁 Performance
//
// Knowledge questions cover engineering, history and manufacturers.
// Performance questions quote figures straight out of the CarVibes car
// database; every one carries a `fact` reference that the validator
// checks against that same database.
// ============================================================
import { Q } from "./authoring";
import type { QuizQuestion } from "../types";

export const knowledgeAndPerformance: QuizQuestion[] = [
  // ----------------------------------------------------------
  // 🧠 CAR KNOWLEDGE — easy
  // ----------------------------------------------------------
  Q(
    "k-e-01", "knowledge", "easy",
    [
      "Which German manufacturer began as an aircraft engine builder during the First World War?",
      "Quel constructeur allemand a commencé comme fabricant de moteurs d'avion pendant la Première Guerre mondiale ?",
      "¿Qué fabricante alemán empezó construyendo motores de avión durante la Primera Guerra Mundial?",
    ],
    ["BMW", "Mercedes-Benz", "Audi", "Opel"],
    0,
    [
      "Its name stands for Bavarian Motor Works.",
      "Son nom signifie Manufacture bavaroise de moteurs.",
      "Su nombre significa Fábrica Bávara de Motores.",
    ],
    [
      "BMW — Bayerische Motoren Werke — was founded in 1916 to build aircraft engines before turning to motorcycles and cars.",
      "BMW — Bayerische Motoren Werke — a été fondée en 1916 pour construire des moteurs d'avion avant de passer aux motos et aux voitures.",
      "BMW — Bayerische Motoren Werke — se fundó en 1916 para fabricar motores de avión antes de pasar a motos y coches.",
    ]
  ),
  Q(
    "k-e-02", "knowledge", "easy",
    [
      "What is the main job of a turbocharger in a car engine?",
      "Quel est le rôle principal d'un turbocompresseur dans un moteur ?",
      "¿Cuál es la función principal de un turbocompresor en un motor?",
    ],
    [
      "Force more air into the cylinders using exhaust gas energy",
      "Reduce fuel consumption when idling",
      "Cool the engine oil at high speed",
      "Mechanically raise the compression ratio",
    ],
    0,
    [
      "It is driven by something the engine already throws away.",
      "Il est entraîné par quelque chose que le moteur rejette déjà.",
      "Lo mueve algo que el motor ya desecha.",
    ],
    [
      "A turbocharger uses exhaust gases to spin a turbine that compresses intake air, letting the engine burn more fuel and make more power.",
      "Un turbocompresseur utilise les gaz d'échappement pour entraîner une turbine qui comprime l'air d'admission, permettant de brûler plus de carburant.",
      "Un turbocompresor usa los gases de escape para mover una turbina que comprime el aire de admisión, permitiendo quemar más combustible.",
    ]
  ),
  Q(
    "k-e-03", "knowledge", "easy",
    [
      "Who built the Patent-Motorwagen of 1886, widely regarded as the first production automobile?",
      "Qui a construit le Patent-Motorwagen de 1886, largement considéré comme la première automobile de série ?",
      "¿Quién construyó el Patent-Motorwagen de 1886, considerado el primer automóvil de producción?",
    ],
    ["Carl Benz", "Gottlieb Daimler", "Ferdinand Porsche", "Henry Ford"],
    0,
    [
      "His surname still appears in the name of a German luxury brand.",
      "Son nom figure encore dans celui d'une marque de luxe allemande.",
      "Su apellido aún forma parte del nombre de una marca alemana de lujo.",
    ],
    [
      "Carl Benz patented the Motorwagen in 1886; Benz & Cie. later merged with Daimler-Motoren-Gesellschaft to form Mercedes-Benz in 1926.",
      "Carl Benz a breveté la Motorwagen en 1886 ; Benz & Cie. a fusionné avec Daimler-Motoren-Gesellschaft en 1926 pour former Mercedes-Benz.",
      "Carl Benz patentó el Motorwagen en 1886; Benz & Cie. se fusionó con Daimler-Motoren-Gesellschaft en 1926 para formar Mercedes-Benz.",
    ]
  ),
  Q(
    "k-e-04", "knowledge", "easy",
    [
      "In a specification sheet, what does the abbreviation RWD stand for?",
      "Sur une fiche technique, que signifie l'abréviation RWD ?",
      "En una ficha técnica, ¿qué significa la abreviatura RWD?",
    ],
    ["Rear-wheel drive", "Rear weight distribution", "Reversible wheel drive", "Reduced wheel drag"],
    0,
    [
      "It describes which wheels receive the engine's torque.",
      "Cela décrit quelles roues reçoivent le couple du moteur.",
      "Describe qué ruedas reciben el par del motor.",
    ],
    [
      "RWD means rear-wheel drive: the engine drives the rear axle, which is why most sports cars still use it.",
      "RWD signifie propulsion arrière : le moteur entraîne l'essieu arrière, d'où son usage persistant sur les sportives.",
      "RWD significa propulsión trasera: el motor mueve el eje trasero, de ahí su uso constante en deportivos.",
    ]
  ),
  Q(
    "k-e-05", "knowledge", "easy",
    [
      "How does a Mazda rotary (Wankel) engine differ from a conventional piston engine?",
      "En quoi un moteur rotatif Mazda (Wankel) diffère-t-il d'un moteur à pistons classique ?",
      "¿En qué se diferencia un motor rotativo Mazda (Wankel) de un motor de pistones convencional?",
    ],
    [
      "It uses rotating triangular rotors instead of reciprocating pistons",
      "It uses opposed pistons in a horizontal layout",
      "It uses a gas turbine instead of cylinders",
      "It uses free pistons driving a linear generator",
    ],
    0,
    [
      "Nothing moves up and down inside it.",
      "Rien n'y fait de mouvement de va-et-vient.",
      "Nada se mueve arriba y abajo en su interior.",
    ],
    [
      "The Wankel engine replaces pistons with triangular rotors spinning in an oval housing — compact, smooth-revving and free-revving.",
      "Le moteur Wankel remplace les pistons par des rotors triangulaires tournant dans un logement ovale — compact et très libre en régime.",
      "El motor Wankel sustituye los pistones por rotores triangulares que giran en una cámara ovalada: compacto y muy elástico en régimen.",
    ]
  ),

  // ----------------------------------------------------------
  // 🧠 CAR KNOWLEDGE — medium
  // ----------------------------------------------------------
  Q(
    "k-m-01", "knowledge", "medium",
    [
      "What defines a VR6 engine layout?",
      "Qu'est-ce qui définit l'architecture d'un moteur VR6 ?",
      "¿Qué define la arquitectura de un motor VR6?",
    ],
    [
      "Six cylinders in a narrow-angle V (around 15°) sharing a single cylinder head",
      "Six horizontally opposed cylinders in two banks",
      "Six cylinders arranged in a straight line",
      "Six cylinders in two banks at 90° with two cylinder heads",
    ],
    0,
    [
      "The angle between its banks is so small that one head covers both.",
      "L'angle entre ses rangées est si faible qu'une seule culasse couvre les deux.",
      "El ángulo entre sus bancadas es tan pequeño que una sola culata cubre ambas.",
    ],
    [
      "Volkswagen's VR6 packs six cylinders into an angle narrow enough for a single cylinder head, so it fits where an inline-four would.",
      "Le VR6 de Volkswagen regroupe six cylindres dans un angle assez fermé pour une seule culasse, tenant la place d'un quatre cylindres en ligne.",
      "El VR6 de Volkswagen agrupa seis cilindros en un ángulo tan cerrado que usa una sola culata y ocupa el espacio de un cuatro en línea.",
    ]
  ),
  Q(
    "k-m-02", "knowledge", "medium",
    [
      "Which designer created the wedge shape of the Lamborghini Countach?",
      "Quel designer a créé la forme en coin de la Lamborghini Countach ?",
      "¿Qué diseñador creó la forma de cuña del Lamborghini Countach?",
    ],
    [
      "Marcello Gandini at Bertone",
      "Giorgetto Giugiaro at Italdesign",
      "Leonardo Fioravanti at Pininfarina",
      "Franco Scaglione at Touring",
    ],
    0,
    [
      "The same designer had already penned the Miura for the same coachbuilder.",
      "Le même designer avait déjà dessiné la Miura pour le même carrossier.",
      "El mismo diseñador ya había dibujado el Miura para el mismo carrocero.",
    ],
    [
      "Marcello Gandini, working at Bertone, designed both the Miura and the Countach — two of the most influential shapes in car design.",
      "Marcello Gandini, chez Bertone, a dessiné la Miura et la Countach, deux des formes les plus influentes de l'histoire du design automobile.",
      "Marcello Gandini, en Bertone, diseñó tanto el Miura como el Countach, dos de las formas más influyentes del diseño automovilístico.",
    ]
  ),
  Q(
    "k-m-03", "knowledge", "medium",
    [
      "What does Honda's VTEC system actually do?",
      "Que fait réellement le système VTEC de Honda ?",
      "¿Qué hace realmente el sistema VTEC de Honda?",
    ],
    [
      "Switches between cam profiles for low-end torque and high-rpm power",
      "Varies turbocharger boost pressure with engine load",
      "Deactivates cylinders while cruising",
      "Changes the compression ratio on the fly",
    ],
    0,
    [
      "The letters stand for Variable Valve Timing and Lift Electronic Control.",
      "Les lettres signifient Variable Valve Timing and Lift Electronic Control.",
      "Las siglas significan Variable Valve Timing and Lift Electronic Control.",
    ],
    [
      "VTEC swaps to an aggressive cam profile at high rpm, which is why Honda engines of the era scream past 8,000 rpm.",
      "VTEC bascule vers un profil d'arbre à cames agressif à haut régime, d'où les Honda qui hurlent au-delà de 8 000 tr/min.",
      "VTEC cambia a un perfil de leva agresivo a alto régimen, por eso los Honda de la época aúllan por encima de 8.000 rpm.",
    ]
  ),
  Q(
    "k-m-04", "knowledge", "medium",
    [
      "Which brand took quattro permanent all-wheel drive to world rallying in the 1980s?",
      "Quelle marque a imposé la transmission intégrale permanente quattro en rallye mondial dans les années 80 ?",
      "¿Qué marca llevó la tracción total permanente quattro al mundial de rallies en los 80?",
    ],
    ["Audi", "Lancia", "Peugeot", "Toyota"],
    0,
    [
      "Its Group B car carried a five-cylinder turbo engine.",
      "Sa voiture du Groupe B embarquait un cinq cylindres turbo.",
      "Su coche del Grupo B llevaba un motor de cinco cilindros turbo.",
    ],
    [
      "Audi's quattro, launched in 1980, proved all-wheel drive in rallying and forced the rest of the sport to follow.",
      "La quattro d'Audi, lancée en 1980, a imposé la transmission intégrale en rallye et forcé tout le sport à suivre.",
      "El quattro de Audi, lanzado en 1980, impuso la tracción total en los rallies y obligó a todo el deporte a seguirlo.",
    ]
  ),
  Q(
    "k-m-05", "knowledge", "medium",
    [
      "What is the purpose of a limited-slip differential?",
      "À quoi sert un différentiel à glissement limité ?",
      "¿Para qué sirve un diferencial de deslizamiento limitado?",
    ],
    [
      "Limit the speed difference between driven wheels so the wheel with grip keeps driving",
      "Reduce steering effort at low speed",
      "Lock the gearbox into a single ratio",
      "Cut engine torque whenever wheelspin is detected",
    ],
    0,
    [
      "An open differential always sends torque to the wheel with the least grip — this is the fix.",
      "Un différentiel ouvert envoie toujours le couple à la roue qui adhère le moins — ceci est la solution.",
      "Un diferencial abierto siempre envía el par a la rueda con menos agarre: esto es la solución.",
    ],
    [
      "A limited-slip differential restricts how much one wheel can outrun the other, so power still reaches the wheel that has traction.",
      "Un différentiel à glissement limité restreint l'écart de rotation entre les roues, pour transmettre la puissance à celle qui adhère.",
      "Un diferencial de deslizamiento limitado restringe la diferencia de giro entre ruedas, para enviar la potencia a la que tiene agarre.",
    ]
  ),

  // ----------------------------------------------------------
  // 🧠 CAR KNOWLEDGE — hard
  // ----------------------------------------------------------
  Q(
    "k-h-01", "knowledge", "hard",
    [
      "How long is the Nürburgring Nordschleife on the layout used for manufacturer lap records?",
      "Quelle est la longueur de la Nordschleife du Nürburgring sur le tracé utilisé pour les records constructeurs ?",
      "¿Cuánto mide la Nordschleife de Nürburgring en el trazado usado para los récords de fabricantes?",
    ],
    ["20.832 km", "17.600 km", "25.378 km", "22.835 km"],
    0,
    [
      "It is often called the Green Hell, and it is longer than most people assume.",
      "On la surnomme l'Enfer vert, et elle est plus longue que ce que l'on imagine souvent.",
      "Se la llama el Infierno Verde y es más larga de lo que muchos creen.",
    ],
    [
      "Since 2019 the official record layout measures 20.832 km, including the short stretch used to bridge the timing lines.",
      "Depuis 2019, le tracé officiel de record mesure 20,832 km, incluant le tronçon reliant les lignes de chronométrage.",
      "Desde 2019 el trazado oficial de récord mide 20,832 km, incluido el tramo que une las líneas de cronometraje.",
    ]
  ),
  Q(
    "k-h-02", "knowledge", "hard",
    [
      "What was the powertrain layout of the Porsche 959, launched in 1986?",
      "Quelle était l'architecture mécanique de la Porsche 959, lancée en 1986 ?",
      "¿Cuál era la configuración mecánica del Porsche 959, lanzado en 1986?",
    ],
    [
      "Twin-turbo flat-six with all-wheel drive",
      "Naturally aspirated flat-six, rear-wheel drive",
      "Supercharged V8, rear-wheel drive",
      "Turbo flat-four with rear-wheel drive",
    ],
    0,
    [
      "It was built to homologate a Group B rally car, which explains the four driven wheels.",
      "Elle a été construite pour homologuer une voiture de rallye du Groupe B, d'où les quatre roues motrices.",
      "Se construyó para homologar un coche de rallies del Grupo B, de ahí las cuatro ruedas motrices.",
    ],
    [
      "The 959 combined a 2.85-litre twin-turbo flat-six with a sophisticated all-wheel-drive system, decades ahead of its time.",
      "La 959 associait un flat-six biturbo de 2,85 litres à une transmission intégrale sophistiquée, en avance de plusieurs décennies.",
      "El 959 combinaba un bóxer biturbo de 2,85 litros con una tracción total sofisticada, décadas por delante de su tiempo.",
    ]
  ),
  Q(
    "k-h-03", "knowledge", "hard",
    [
      "In which season did Formula 1 switch to 1.6-litre V6 turbo hybrid power units?",
      "En quelle saison la Formule 1 est-elle passée aux groupes propulseurs V6 turbo hybrides de 1,6 litre ?",
      "¿En qué temporada pasó la Fórmula 1 a las unidades de potencia V6 turbo híbridas de 1,6 litros?",
    ],
    ["2014", "2009", "2017", "2011"],
    0,
    [
      "It was the year Mercedes began a run of constructors' titles that lasted eight seasons.",
      "C'est l'année où Mercedes a entamé une série de titres constructeurs longue de huit saisons.",
      "Fue el año en que Mercedes inició una racha de títulos de constructores de ocho temporadas.",
    ],
    [
      "The 2014 regulations replaced the 2.4-litre V8s with 1.6-litre V6 turbo hybrids, changing the sound and the engineering of the sport.",
      "Le règlement 2014 a remplacé les V8 de 2,4 litres par des V6 turbo hybrides de 1,6 litre, transformant le son et l'ingénierie du sport.",
      "El reglamento de 2014 sustituyó los V8 de 2,4 litros por V6 turbo híbridos de 1,6 litros, cambiando el sonido y la ingeniería del deporte.",
    ]
  ),
  Q(
    "k-h-04", "knowledge", "hard",
    [
      "In a Formula 1 power unit, what does the MGU-H recover?",
      "Dans un groupe propulseur de Formule 1, que récupère le MGU-H ?",
      "En una unidad de potencia de Fórmula 1, ¿qué recupera el MGU-H?",
    ],
    [
      "Energy from the exhaust gases, through the turbocharger",
      "Kinetic energy from the rear axle under braking",
      "Heat rejected by the battery pack",
      "Energy from the front suspension movement",
    ],
    0,
    [
      "The H stands for heat, and it is mounted on the turbo shaft.",
      "Le H signifie chaleur (heat), et il est monté sur l'axe du turbo.",
      "La H significa calor (heat) y está montado en el eje del turbo.",
    ],
    [
      "The MGU-H sits on the turbocharger shaft and recovers energy from the exhaust flow; the MGU-K recovers kinetic energy under braking.",
      "Le MGU-H est placé sur l'axe du turbo et récupère l'énergie des gaz d'échappement ; le MGU-K récupère l'énergie cinétique au freinage.",
      "El MGU-H va montado en el eje del turbo y recupera la energía de los gases; el MGU-K recupera energía cinética al frenar.",
    ]
  ),
  Q(
    "k-h-05", "knowledge", "hard",
    [
      "Which Japanese manufacturer scored its first Formula 1 victory at the 1965 Mexican Grand Prix?",
      "Quel constructeur japonais a remporté sa première victoire en Formule 1 au Grand Prix du Mexique 1965 ?",
      "¿Qué fabricante japonés logró su primera victoria en Fórmula 1 en el Gran Premio de México de 1965?",
    ],
    ["Honda", "Toyota", "Nissan", "Mazda"],
    0,
    [
      "The winning car carried a transversely mounted V12 and an American driver.",
      "La voiture victorieuse embarquait un V12 monté transversalement et un pilote américain.",
      "El coche ganador llevaba un V12 montado transversalmente y un piloto estadounidense.",
    ],
    [
      "Richie Ginther won the 1965 Mexican Grand Prix in the Honda RA272 — the Japanese manufacturer's first Formula 1 victory.",
      "Richie Ginther a remporté le Grand Prix du Mexique 1965 au volant de la Honda RA272, première victoire du constructeur en Formule 1.",
      "Richie Ginther ganó el Gran Premio de México de 1965 con el Honda RA272, la primera victoria del fabricante en Fórmula 1.",
    ]
  ),

  // ----------------------------------------------------------
  // 🧠 CAR KNOWLEDGE — expert
  // ----------------------------------------------------------
  Q(
    "k-x-01", "knowledge", "expert",
    [
      "The Bugatti W16 is effectively assembled from which engine architecture?",
      "À partir de quelle architecture le W16 de Bugatti est-il en réalité assemblé ?",
      "¿A partir de qué arquitectura se ensambla en realidad el W16 de Bugatti?",
    ],
    [
      "Two narrow-angle VR8s joined on a common crankshaft",
      "Four inline-fours sharing one crankshaft",
      "Two flat-eights set at 90 degrees",
      "A single bank of sixteen cylinders",
    ],
    0,
    [
      "Think of the VR6 idea, applied twice over.",
      "Pensez au principe du VR6, appliqué deux fois.",
      "Piensa en el principio del VR6, aplicado dos veces.",
    ],
    [
      "The 8.0-litre W16 is essentially two VR8 banks on one crankshaft, with four turbochargers fed by one exhaust system.",
      "Le W16 de 8,0 litres est essentiellement deux rangées VR8 sur un seul vilebrequin, avec quatre turbocompresseurs.",
      "El W16 de 8,0 litros es esencialmente dos bancadas VR8 sobre un cigüeñal común, con cuatro turbocompresores.",
    ]
  ),
  Q(
    "k-x-02", "knowledge", "expert",
    [
      "Which engineer led the design of the McLaren F1 road car?",
      "Quel ingénieur a dirigé la conception de la McLaren F1 de route ?",
      "¿Qué ingeniero dirigió el diseño del McLaren F1 de calle?",
    ],
    ["Gordon Murray", "Adrian Newey", "John Barnard", "Ross Brawn"],
    0,
    [
      "He later applied the same lightweight philosophy to a small city car.",
      "Il a ensuite appliqué la même philosophie de légèreté à une petite citadine.",
      "Después aplicó la misma filosofía de ligereza a un pequeño urbano.",
    ],
    [
      "Gordon Murray led the McLaren F1 project, insisting on a carbon-fibre tub, a central driving seat and a gold-lined engine bay.",
      "Gordon Murray a dirigé le projet McLaren F1, imposant une coque en carbone, un siège central et un compartiment moteur doré.",
      "Gordon Murray dirigió el proyecto McLaren F1, imponiendo una bañera de carbono, asiento central y un vano motor dorado.",
    ]
  ),
  Q(
    "k-x-03", "knowledge", "expert",
    [
      "How does the pre-chamber combustion used in engines such as Maserati's Nettuno V6 work?",
      "Comment fonctionne la combustion à préchambre utilisée dans des moteurs comme le V6 Nettuno de Maserati ?",
      "¿Cómo funciona la combustión de precámara usada en motores como el V6 Nettuno de Maserati?",
    ],
    [
      "A small pre-chamber with its own spark plug ignites the main mixture through jets, allowing a leaner, faster burn",
      "A second combustion chamber burns exhaust gases a second time",
      "The pre-chamber stores compressed air to smooth turbo lag",
      "It replaces the spark plug with a compression-ignition glow element",
    ],
    0,
    [
      "The technique is borrowed from Formula 1, where it allows very lean mixtures.",
      "La technique vient de la Formule 1, où elle autorise des mélanges très pauvres.",
      "La técnica procede de la Fórmula 1, donde permite mezclas muy pobres.",
    ],
    [
      "Pre-chamber ignition fires a small volume first and shoots jets of flame into the main chamber, giving a faster, more complete burn and higher output.",
      "L'allumage à préchambre enflamme d'abord un petit volume puis projette des jets de flamme dans la chambre principale, pour une combustion plus rapide et plus complète.",
      "El encendido de precámara inflama primero un volumen pequeño y lanza chorros de llama a la cámara principal, logrando una combustión más rápida y completa.",
    ]
  ),
  Q(
    "k-x-04", "knowledge", "expert",
    [
      "The 1.6-litre V6 in the Mercedes-AMG One is derived from what?",
      "D'où provient le V6 de 1,6 litre de la Mercedes-AMG One ?",
      "¿De dónde procede el V6 de 1,6 litros del Mercedes-AMG One?",
    ],
    [
      "Mercedes' Formula 1 power unit",
      "The AMG 2.0-litre four used in the A45 S",
      "A detuned M139 engine with a supercharger",
      "A Renault-Nissan alliance engine family",
    ],
    0,
    [
      "It idles at a racing engine speed, which is exactly why it is so hard to use on the road.",
      "Elle tourne au ralenti à un régime de moteur de course, ce qui explique sa difficulté d'usage sur route.",
      "Ralentiza a un régimen de motor de carreras, lo que explica su dificultad de uso en carretera.",
    ],
    [
      "The AMG One carries a Formula 1-derived 1.6-litre V6 with hybrid assistance, complete with a race-engine idle speed and service intervals.",
      "L'AMG One embarque un V6 de 1,6 litre dérivé de la Formule 1 avec hybridation, régime de ralenti et intervalles d'entretien de moteur de course.",
      "El AMG One monta un V6 de 1,6 litros derivado de la Fórmula 1 con hibridación, ralentí de motor de carreras e intervalos de mantenimiento similares.",
    ]
  ),

  // ----------------------------------------------------------
  // 🧠 CAR KNOWLEDGE — insane
  // ----------------------------------------------------------
  Q(
    "k-i-01", "knowledge", "insane",
    [
      "What top speed did the Bugatti Chiron Super Sport 300+ record in its 2019 one-way run?",
      "Quelle vitesse maximale la Bugatti Chiron Super Sport 300+ a-t-elle enregistrée lors de sa tentative de 2019 ?",
      "¿Qué velocidad máxima registró el Bugatti Chiron Super Sport 300+ en su intento de 2019?",
    ],
    ["304.773 mph (490.484 km/h)", "277.87 mph (447.19 km/h)", "282.9 mph (455.3 km/h)", "311.4 mph (501.2 km/h)"],
    0,
    [
      "The number in the car's name is the barrier it crossed, in miles per hour.",
      "Le chiffre dans le nom de la voiture est la barrière franchie, en miles par heure.",
      "El número en el nombre del coche es la barrera que superó, en millas por hora.",
    ],
    [
      "The Chiron Super Sport 300+ reached 304.773 mph in 2019, becoming the first production car past the 300 mph barrier.",
      "La Chiron Super Sport 300+ a atteint 304,773 mph en 2019, première voiture de série à franchir les 300 mph.",
      "El Chiron Super Sport 300+ alcanzó 304,773 mph en 2019, el primer coche de producción en superar las 300 mph.",
    ]
  ),
  Q(
    "k-i-02", "knowledge", "insane",
    [
      "Which engine powered the Mazda 787B that won the 24 Hours of Le Mans in 1991?",
      "Quel moteur animait la Mazda 787B, victorieuse des 24 Heures du Mans 1991 ?",
      "¿Qué motor llevaba el Mazda 787B, ganador de las 24 Horas de Le Mans de 1991?",
    ],
    ["R26B four-rotor", "R20B twin-rotor", "13B twin-rotor turbo", "RV10 V10"],
    0,
    [
      "It is the only rotary engine ever to win at Le Mans, and its sound is unmistakable.",
      "C'est le seul moteur rotatif à avoir gagné au Mans, et sa sonorité est inoubliable.",
      "Es el único motor rotativo que ha ganado en Le Mans, y su sonido es inconfundible.",
    ],
    [
      "The 787B used the R26B four-rotor engine, making Mazda the only rotary-powered winner in Le Mans history.",
      "La 787B utilisait le quatre rotors R26B, faisant de Mazda le seul vainqueur du Mans avec un moteur rotatif.",
      "El 787B usaba el cuatro rotores R26B, convirtiendo a Mazda en el único ganador de Le Mans con motor rotativo.",
    ]
  ),
  Q(
    "k-i-03", "knowledge", "insane",
    [
      "Nissan's VR38DETT engines for the GT-R are hand-assembled by specialised technicians in which Japanese city?",
      "Dans quelle ville japonaise les moteurs VR38DETT de la GT-R sont-ils assemblés à la main par des techniciens spécialisés ?",
      "¿En qué ciudad japonesa ensamblan a mano técnicos especializados los motores VR38DETT del GT-R?",
    ],
    ["Yokohama", "Tochigi", "Hiroshima", "Toyota City"],
    0,
    [
      "It is a port city south of Tokyo, home to Nissan's engine plant.",
      "C'est une ville portuaire au sud de Tokyo, où se trouve l'usine de moteurs de Nissan.",
      "Es una ciudad portuaria al sur de Tokio, sede de la fábrica de motores de Nissan.",
    ],
    [
      "Each VR38DETT is hand-built in a clean room in Yokohama by a single craftsman, whose name appears on a plate on the engine.",
      "Chaque VR38DETT est assemblé à la main dans une salle blanche à Yokohama par un seul artisan, dont le nom figure sur une plaque.",
      "Cada VR38DETT se ensambla a mano en una sala limpia de Yokohama por un único artesano, cuyo nombre figura en una placa.",
    ]
  ),
  Q(
    "k-i-04", "knowledge", "insane",
    [
      "Which was the first production road car sold with a dual-clutch gearbox?",
      "Quelle a été la première voiture de série vendue avec une boîte à double embrayage ?",
      "¿Cuál fue el primer coche de producción vendido con una caja de doble embrague?",
    ],
    [
      "Volkswagen Golf R32 (2003)",
      "Porsche 911 Carrera (2008)",
      "Ferrari 360 Modena (2001)",
      "Audi TT (1999)",
    ],
    0,
    [
      "The technology reached the mass market through a compact hatchback, not a supercar.",
      "La technologie a atteint le grand marché par une compacte, pas par une supercar.",
      "La tecnología llegó al mercado masivo a través de un compacto, no de un superdeportivo.",
    ],
    [
      "Volkswagen introduced the DSG six-speed dual-clutch gearbox on the 2003 Golf R32, years before PDK reached the 911.",
      "Volkswagen a introduit la boîte DSG à six rapports et double embrayage sur la Golf R32 de 2003, bien avant la PDK de la 911.",
      "Volkswagen introdujo la caja DSG de seis velocidades y doble embrague en el Golf R32 de 2003, años antes de que el PDK llegara al 911.",
    ]
  ),
  Q(
    "k-i-05", "knowledge", "insane",
    [
      "What is the displacement of the Yamaha-developed V10 in the Lexus LFA?",
      "Quelle est la cylindrée du V10 développé avec Yamaha dans la Lexus LFA ?",
      "¿Cuál es la cilindrada del V10 desarrollado con Yamaha del Lexus LFA?",
    ],
    ["4.8 litres", "4.5 litres", "5.0 litres", "4.4 litres"],
    0,
    [
      "Its engine code is 1LR-GUE, and the first two characters describe its capacity.",
      "Son code moteur est 1LR-GUE, et les deux premiers chiffres décrivent sa cylindrée.",
      "Su código de motor es 1LR-GUE y los dos primeros dígitos describen su cilindrada.",
    ],
    [
      "The 1LR-GUE is a 4.8-litre V10 producing 552 hp, revving to 9,000 rpm in around 0.6 seconds.",
      "Le 1LR-GUE est un V10 de 4,8 litres développant 552 ch, montant à 9 000 tr/min en environ 0,6 seconde.",
      "El 1LR-GUE es un V10 de 4,8 litros con 552 CV que sube a 9.000 rpm en unos 0,6 segundos.",
    ]
  ),

  // ----------------------------------------------------------
  // 🏁 PERFORMANCE — easy
  // ----------------------------------------------------------
  Q(
    "pf-e-01", "performance", "easy",
    [
      "How much power does the 5.0-litre V8 in the Ford Mustang GT produce?",
      "Quelle puissance développe le V8 de 5,0 litres de la Ford Mustang GT ?",
      "¿Cuánta potencia rinde el V8 de 5,0 litros del Ford Mustang GT?",
    ],
    ["460 hp", "385 hp", "520 hp", "310 hp"],
    0,
    [
      "It is naturally aspirated, and it sits well above the turbo four-cylinder in the range.",
      "Il est atmosphérique, et se situe bien au-dessus du quatre cylindres turbo de la gamme.",
      "Es atmosférico y está muy por encima del cuatro cilindros turbo de la gama.",
    ],
    [
      "The Mustang GT's 5.0-litre V8 makes 460 hp, driving the rear wheels through a manual or automatic gearbox.",
      "Le V8 de 5,0 litres de la Mustang GT développe 460 ch, transmis aux roues arrière.",
      "El V8 de 5,0 litros del Mustang GT rinde 460 CV, enviados a las ruedas traseras.",
    ],
    { carId: "ford-mustang-gt", fact: { carId: "ford-mustang-gt", field: "hp" } }
  ),
  Q(
    "pf-e-02", "performance", "easy",
    [
      "What is the 0–100 km/h time of the dual-motor Tesla Model 3 Long Range?",
      "Quel est le 0–100 km/h de la Tesla Model 3 Long Range à deux moteurs ?",
      "¿Cuál es el 0–100 km/h del Tesla Model 3 Long Range de doble motor?",
    ],
    ["4.2 s", "3.1 s", "5.6 s", "6.4 s"],
    0,
    [
      "Instant electric torque makes it quicker than most petrol saloons in the same price bracket.",
      "Le couple électrique instantané la rend plus rapide que la plupart des berlines essence du même budget.",
      "El par eléctrico instantáneo lo hace más rápido que la mayoría de las berlinas de gasolina de precio similar.",
    ],
    [
      "The dual-motor Model 3 Long Range reaches 100 km/h in 4.2 seconds with all-wheel drive.",
      "La Model 3 Long Range à deux moteurs atteint 100 km/h en 4,2 secondes avec transmission intégrale.",
      "El Model 3 Long Range de doble motor alcanza 100 km/h en 4,2 segundos con tracción total.",
    ],
    { carId: "tesla-model-3", fact: { carId: "tesla-model-3", field: "zeroToHundred" } }
  ),
  Q(
    "pf-e-03", "performance", "easy",
    [
      "How much power does the 2.4-litre boxer four in the Toyota GR86 produce?",
      "Quelle puissance développe le quatre cylindres à plat de 2,4 litres de la Toyota GR86 ?",
      "¿Cuánta potencia rinde el bóxer de cuatro cilindros y 2,4 litros del Toyota GR86?",
    ],
    ["228 hp", "181 hp", "255 hp", "205 hp"],
    0,
    [
      "It is deliberately modest — this car is about balance, not straight-line speed.",
      "Elle est volontairement modeste : cette voiture privilégie l'équilibre, pas la ligne droite.",
      "Es deliberadamente modesta: este coche prioriza el equilibrio, no la velocidad punta.",
    ],
    [
      "The GR86 makes 228 hp from a 2.4-litre Subaru-built boxer four in just 1,280 kg.",
      "La GR86 développe 228 ch grâce à un quatre cylindres à plat Subaru de 2,4 litres, pour 1 280 kg.",
      "El GR86 rinde 228 CV con un bóxer de 2,4 litros fabricado por Subaru, en solo 1.280 kg.",
    ],
    { carId: "toyota-gr86", fact: { carId: "toyota-gr86", field: "hp" } }
  ),
  Q(
    "pf-e-04", "performance", "easy",
    [
      "What is the kerb weight of the Mazda MX-5 Miata?",
      "Quel est le poids à vide de la Mazda MX-5 Miata ?",
      "¿Cuál es el peso en vacío del Mazda MX-5 Miata?",
    ],
    ["1,050 kg", "1,250 kg", "900 kg", "1,420 kg"],
    0,
    [
      "Low weight is the entire philosophy of this car.",
      "La légèreté est toute la philosophie de cette voiture.",
      "La ligereza es toda la filosofía de este coche.",
    ],
    [
      "The MX-5 weighs around 1,050 kg, which is why 181 hp feels generous in it.",
      "La MX-5 pèse environ 1 050 kg, d'où la sensation de vivacité malgré 181 ch.",
      "El MX-5 pesa unos 1.050 kg, por eso 181 CV se sienten generosos.",
    ],
    { carId: "mazda-mx5-miata", fact: { carId: "mazda-mx5-miata", field: "weight" } }
  ),

  // ----------------------------------------------------------
  // 🏁 PERFORMANCE — medium
  // ----------------------------------------------------------
  Q(
    "pf-m-01", "performance", "medium",
    [
      "How much power does the BMW M3 Competition produce?",
      "Quelle puissance développe la BMW M3 Competition ?",
      "¿Cuánta potencia rinde el BMW M3 Competition?",
    ],
    ["510 hp", "473 hp", "550 hp", "444 hp"],
    0,
    [
      "Its engine code is S58, a twin-turbo inline-six shared with the X3 M.",
      "Son code moteur est S58, un six cylindres en ligne biturbo partagé avec le X3 M.",
      "Su código de motor es S58, un seis en línea biturbo compartido con el X3 M.",
    ],
    [
      "The M3 Competition makes 510 hp from the S58 3.0-litre twin-turbo inline-six.",
      "La M3 Competition développe 510 ch grâce au six cylindres en ligne biturbo S58 de 3,0 litres.",
      "El M3 Competition rinde 510 CV con el seis en línea biturbo S58 de 3,0 litros.",
    ],
    { carId: "bmw-m3-competition", fact: { carId: "bmw-m3-competition", field: "hp" } }
  ),
  Q(
    "pf-m-02", "performance", "medium",
    [
      "What is the 0–100 km/h time of the Audi RS6 Avant?",
      "Quel est le 0–100 km/h de l'Audi RS6 Avant ?",
      "¿Cuál es el 0–100 km/h del Audi RS6 Avant?",
    ],
    ["3.6 s", "4.2 s", "3.1 s", "4.8 s"],
    0,
    [
      "A five-door estate with supercar-rivaling acceleration.",
      "Un break cinq portes avec une accélération digne d'une supercar.",
      "Un familiar de cinco puertas con aceleración de superdeportivo.",
    ],
    [
      "The RS6 Avant reaches 100 km/h in 3.6 seconds, thanks to 621 hp and quattro all-wheel drive.",
      "L'Audi RS6 Avant atteint 100 km/h en 3,6 secondes grâce à 621 ch et à la transmission quattro.",
      "El Audi RS6 Avant alcanza 100 km/h en 3,6 segundos gracias a 621 CV y a la tracción quattro.",
    ],
    { carId: "audi-rs6-avant", fact: { carId: "audi-rs6-avant", field: "zeroToHundred" } }
  ),
  Q(
    "pf-m-03", "performance", "medium",
    [
      "Which drivetrain does the Honda Civic Type R use?",
      "Quelle transmission utilise la Honda Civic Type R ?",
      "¿Qué tracción utiliza el Honda Civic Type R?",
    ],
    ["Front-wheel drive", "Rear-wheel drive", "All-wheel drive", "Part-time four-wheel drive"],
    0,
    [
      "It holds front-wheel-drive lap records at several circuits precisely because of how its limited-slip differential is set up.",
      "Elle détient des records de tour pour traction avant sur plusieurs circuits, grâce à son différentiel à glissement limité.",
      "Tiene récords de vuelta para tracción delantera en varios circuitos gracias a su diferencial de deslizamiento limitado.",
    ],
    [
      "The Civic Type R sends 315 hp through the front wheels only, helped by a helical limited-slip differential.",
      "La Civic Type R envoie 315 ch uniquement aux roues avant, aidée par un différentiel à glissement limité hélicoïdal.",
      "El Civic Type R envía 315 CV solo a las ruedas delanteras, ayudado por un diferencial de deslizamiento limitado helicoidal.",
    ],
    { carId: "honda-civic-type-r", fact: { carId: "honda-civic-type-r", field: "drivetrain" } }
  ),
  Q(
    "pf-m-04", "performance", "medium",
    [
      "How much power does the Porsche Taycan Turbo S produce with overboost?",
      "Quelle puissance développe la Porsche Taycan Turbo S en overboost ?",
      "¿Cuánta potencia rinde el Porsche Taycan Turbo S con overboost?",
    ],
    ["761 hp", "680 hp", "820 hp", "616 hp"],
    0,
    [
      "The figure is only available for a few seconds at a time under launch conditions.",
      "Cette valeur n'est disponible que quelques secondes, en conditions de lancement.",
      "Esa cifra solo está disponible unos segundos, en condiciones de lanzamiento.",
    ],
    [
      "The Taycan Turbo S produces 761 hp on overboost from its 800-volt dual-motor layout.",
      "La Taycan Turbo S développe 761 ch en overboost grâce à son architecture 800 volts à deux moteurs.",
      "El Taycan Turbo S rinde 761 CV con overboost gracias a su arquitectura de 800 voltios y doble motor.",
    ],
    { carId: "porsche-taycan-turbo-s", fact: { carId: "porsche-taycan-turbo-s", field: "hp" } }
  ),

  // ----------------------------------------------------------
  // 🏁 PERFORMANCE — hard
  // ----------------------------------------------------------
  Q(
    "pf-h-01", "performance", "hard",
    [
      "What is the 0–100 km/h time of the Rimac Nevera?",
      "Quel est le 0–100 km/h de la Rimac Nevera ?",
      "¿Cuál es el 0–100 km/h del Rimac Nevera?",
    ],
    ["1.85 s", "2.1 s", "1.6 s", "2.4 s"],
    0,
    [
      "Four electric motors, one for each wheel, and torque vectoring instead of a mechanical differential.",
      "Quatre moteurs électriques, un par roue, et un vectoring de couple plutôt qu'un différentiel mécanique.",
      "Cuatro motores eléctricos, uno por rueda, y vectorización de par en lugar de un diferencial mecánico.",
    ],
    [
      "The Nevera reaches 100 km/h in 1.85 seconds, with 1,914 hp from four electric motors.",
      "La Nevera atteint 100 km/h en 1,85 seconde, avec 1 914 ch issus de quatre moteurs électriques.",
      "El Nevera alcanza 100 km/h en 1,85 segundos, con 1.914 CV de cuatro motores eléctricos.",
    ],
    { carId: "rimac-nevera", fact: { carId: "rimac-nevera", field: "zeroToHundred" } }
  ),
  Q(
    "pf-h-02", "performance", "hard",
    [
      "What top speed does the Bugatti Chiron Super Sport reach?",
      "Quelle vitesse maximale atteint la Bugatti Chiron Super Sport ?",
      "¿Qué velocidad máxima alcanza el Bugatti Chiron Super Sport?",
    ],
    ["440 km/h", "407 km/h", "490 km/h", "380 km/h"],
    0,
    [
      "It is the road-legal version of the car that broke the 300 mph barrier.",
      "C'est la version homologuée route de la voiture qui a franchi les 300 mph.",
      "Es la versión de calle del coche que superó la barrera de las 300 mph.",
    ],
    [
      "The Chiron Super Sport is limited to 440 km/h, with 1,600 hp from its 8.0-litre quad-turbo W16.",
      "La Chiron Super Sport est limitée à 440 km/h, avec 1 600 ch issus de son W16 8,0 litres à quatre turbos.",
      "El Chiron Super Sport está limitado a 440 km/h, con 1.600 CV de su W16 de 8,0 litros y cuatro turbos.",
    ],
    { carId: "bugatti-chiron-super-sport", fact: { carId: "bugatti-chiron-super-sport", field: "topSpeed" } }
  ),
  Q(
    "pf-h-03", "performance", "hard",
    [
      "How much power does the naturally aspirated 5.5-litre flat-plane V8 in the Corvette Z06 produce?",
      "Quelle puissance développe le V8 à plat de 5,5 litres atmosphérique de la Corvette Z06 ?",
      "¿Cuánta potencia rinde el V8 plano atmosférico de 5,5 litros del Corvette Z06?",
    ],
    ["670 hp", "495 hp", "755 hp", "610 hp"],
    0,
    [
      "It revs to 8,600 rpm, which is unusual for an American pushrod-free V8.",
      "Il monte à 8 600 tr/min, ce qui est inhabituel pour un V8 américain.",
      "Sube a 8.600 rpm, algo inusual para un V8 estadounidense.",
    ],
    [
      "The C8 Z06 uses a 5.5-litre flat-plane crank V8 making 670 hp — the most powerful naturally aspirated V8 in a production car.",
      "La Z06 C8 utilise un V8 à plat de 5,5 litres développant 670 ch, le V8 atmosphérique le plus puissant jamais monté en série.",
      "El C8 Z06 usa un V8 plano de 5,5 litros con 670 CV, el V8 atmosférico más potente montado en un coche de producción.",
    ],
    { carId: "chevrolet-corvette-z06", fact: { carId: "chevrolet-corvette-z06", field: "hp" } }
  ),
  Q(
    "pf-h-04", "performance", "hard",
    [
      "What is the kerb weight of the Lamborghini Huracán EVO?",
      "Quel est le poids à vide de la Lamborghini Huracán EVO ?",
      "¿Cuál es el peso en vacío del Lamborghini Huracán EVO?",
    ],
    ["1,422 kg", "1,610 kg", "1,290 kg", "1,540 kg"],
    0,
    [
      "Its V10 is shared with a car from the same group, in Ingolstadt.",
      "Son V10 est partagé avec une voiture du même groupe, à Ingolstadt.",
      "Su V10 es compartido con un coche del mismo grupo, en Ingolstadt.",
    ],
    [
      "The Huracán EVO weighs 1,422 kg with 640 hp from its 5.2-litre naturally aspirated V10.",
      "La Huracán EVO pèse 1 422 kg, avec 640 ch issus de son V10 atmosphérique de 5,2 litres.",
      "El Huracán EVO pesa 1.422 kg, con 640 CV de su V10 atmosférico de 5,2 litros.",
    ],
    { carId: "lamborghini-huracan-evo", fact: { carId: "lamborghini-huracan-evo", field: "weight" } }
  ),

  // ----------------------------------------------------------
  // 🏁 PERFORMANCE — expert
  // ----------------------------------------------------------
  Q(
    "pf-x-01", "performance", "expert",
    [
      "What top speed does the Koenigsegg Agera RS reach?",
      "Quelle vitesse maximale atteint la Koenigsegg Agera RS ?",
      "¿Qué velocidad máxima alcanza el Koenigsegg Agera RS?",
    ],
    ["447 km/h", "407 km/h", "482 km/h", "431 km/h"],
    0,
    [
      "In 2017 it held the two-way production car record, at 277.87 mph.",
      "En 2017, elle détenait le record de vitesse en deux passes, à 277,87 mph.",
      "En 2017 tenía el récord de velocidad en dos pasadas, a 277,87 mph.",
    ],
    [
      "The Agera RS reached 447 km/h (277.87 mph), a two-way average record that stood until 2019.",
      "L'Agera RS a atteint 447 km/h (277,87 mph), un record en deux passes tenu jusqu'en 2019.",
      "El Agera RS alcanzó 447 km/h (277,87 mph), un récord en dos pasadas vigente hasta 2019.",
    ],
    { carId: "koenigsegg-agera-rs", fact: { carId: "koenigsegg-agera-rs", field: "topSpeed" } }
  ),
  Q(
    "pf-x-02", "performance", "expert",
    [
      "How much does the McLaren F1 weigh?",
      "Quel est le poids de la McLaren F1 ?",
      "¿Cuánto pesa el McLaren F1?",
    ],
    ["1,140 kg", "1,290 kg", "980 kg", "1,380 kg"],
    0,
    [
      "Its carbon-fibre tub and gold-foil engine bay were both weight-saving measures.",
      "Sa coque en carbone et son compartiment moteur doré étaient tous deux des mesures d'allègement.",
      "Su bañera de carbono y su vano motor con pan de oro eran medidas para ahorrar peso.",
    ],
    [
      "The McLaren F1 weighs 1,140 kg — 627 hp in that mass is why it stayed the fastest for a decade.",
      "La McLaren F1 pèse 1 140 kg : 627 ch dans cette masse expliquent son record tenu pendant dix ans.",
      "El McLaren F1 pesa 1.140 kg: 627 CV en esa masa explican que fuera el más rápido durante una década.",
    ],
    { carId: "mclaren-f1", fact: { carId: "mclaren-f1", field: "weight" } }
  ),
  Q(
    "pf-x-03", "performance", "expert",
    [
      "What is the 0–100 km/h time of the Ferrari F40?",
      "Quel est le 0–100 km/h de la Ferrari F40 ?",
      "¿Cuál es el 0–100 km/h del Ferrari F40?",
    ],
    ["4.1 s", "3.4 s", "5.2 s", "3.8 s"],
    0,
    [
      "Turbo lag made it feel slower off the line than its power-to-weight suggests.",
      "Le temps de réponse du turbo la faisait paraître plus lente au départ que ne le suggère son rapport poids/puissance.",
      "El retardo del turbo hacía que pareciera más lento de lo que sugiere su relación peso-potencia.",
    ],
    [
      "The F40 reaches 100 km/h in 4.1 seconds — impressive for 1987, despite brutal turbo lag.",
      "La F40 atteint 100 km/h en 4,1 secondes, remarquable pour 1987 malgré un temps de réponse brutal.",
      "El F40 alcanza 100 km/h en 4,1 segundos, notable para 1987 pese a un retardo de turbo brutal.",
    ],
    { carId: "ferrari-f40", fact: { carId: "ferrari-f40", field: "zeroToHundred" } }
  ),

  // ----------------------------------------------------------
  // 🏁 PERFORMANCE — insane
  // ----------------------------------------------------------
  Q(
    "pf-i-01", "performance", "insane",
    [
      "How much combined power does the Koenigsegg Gemera produce?",
      "Quelle puissance combinée développe la Koenigsegg Gemera ?",
      "¿Cuánta potencia combinada rinde el Koenigsegg Gemera?",
    ],
    ["1,700 hp", "1,280 hp", "2,000 hp", "1,400 hp"],
    0,
    [
      "Part of the output comes from a three-cylinder engine with no camshafts.",
      "Une partie de la puissance vient d'un trois cylindres sans arbres à cames.",
      "Parte de la potencia procede de un tres cilindros sin árboles de levas.",
    ],
    [
      "The Gemera combines a 2.0-litre three-cylinder with electric motors for 1,700 hp — in a four-seater.",
      "La Gemera associe un trois cylindres de 2,0 litres à des moteurs électriques pour 1 700 ch, dans une quatre places.",
      "El Gemera combina un tres cilindros de 2,0 litros con motores eléctricos para 1.700 CV, en un cuatro plazas.",
    ],
    { carId: "koenigsegg-gemera", fact: { carId: "koenigsegg-gemera", field: "hp" } }
  ),
  Q(
    "pf-i-02", "performance", "insane",
    [
      "What is the kerb weight of the tri-motor Tesla Cybertruck?",
      "Quel est le poids à vide du Tesla Cybertruck à trois moteurs ?",
      "¿Cuál es el peso en vacío del Tesla Cybertruck de triple motor?",
    ],
    ["3,100 kg", "2,450 kg", "3,800 kg", "1,980 kg"],
    0,
    [
      "Its stainless-steel exoskeleton is a large part of that figure.",
      "Son exosquelette en acier inoxydable explique une grande partie de ce chiffre.",
      "Su exoesqueleto de acero inoxidable explica buena parte de esa cifra.",
    ],
    [
      "The tri-motor Cybertruck weighs around 3,100 kg, making it one of the heaviest vehicles in the CarVibes database.",
      "Le Cybertruck à trois moteurs pèse environ 3 100 kg, l'un des véhicules les plus lourds de la base CarVibes.",
      "El Cybertruck de triple motor pesa unos 3.100 kg, uno de los vehículos más pesados de la base de CarVibes.",
    ],
    { carId: "tesla-cybertruck", fact: { carId: "tesla-cybertruck", field: "weight" } }
  ),
  Q(
    "pf-i-03", "performance", "insane",
    [
      "What is the 0–100 km/h time of the Lucid Air Sapphire?",
      "Quel est le 0–100 km/h de la Lucid Air Sapphire ?",
      "¿Cuál es el 0–100 km/h del Lucid Air Sapphire?",
    ],
    ["1.89 s", "2.15 s", "1.69 s", "2.4 s"],
    0,
    [
      "It is a full-size luxury saloon, which makes the figure almost absurd.",
      "C'est une grande berline de luxe, ce qui rend ce chiffre presque absurde.",
      "Es una berlina de lujo de gran tamaño, lo que hace que la cifra sea casi absurda.",
    ],
    [
      "The Air Sapphire reaches 100 km/h in 1.89 seconds with 1,234 hp from three motors — in a five-seat saloon.",
      "L'Air Sapphire atteint 100 km/h en 1,89 seconde avec 1 234 ch issus de trois moteurs, dans une berline cinq places.",
      "El Air Sapphire alcanza 100 km/h en 1,89 segundos con 1.234 CV de tres motores, en una berlina de cinco plazas.",
    ],
    { carId: "lucid-air-sapphire", fact: { carId: "lucid-air-sapphire", field: "zeroToHundred" } }
  ),
];
