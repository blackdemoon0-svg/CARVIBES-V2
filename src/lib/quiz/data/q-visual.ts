// ============================================================
// CARVIBES QUIZ — "Guess the car" + "Guess the price"
//
// Every question here is anchored to a real vehicle in the CarVibes
// database: `carId` supplies the picture and the internal link, and
// `claims` / `fact` are machine-checked against that same database at
// build time (see scripts/validate-quiz.mjs). A specification can never
// drift away from what the rest of the site publishes.
// ============================================================
import { Q } from "./authoring";
import type { QuizQuestion } from "../types";

export const guessAndPrice: QuizQuestion[] = [
  // ----------------------------------------------------------
  // 🚗 GUESS THE CAR — easy
  // ----------------------------------------------------------
  Q(
    "g-e-01", "guess", "easy",
    [
      "Front-engined, naturally aspirated V12, 800 hp and a 340 km/h top speed — Ferrari's last big atmospheric V12 flagship. Which car is it?",
      "V12 atmosphérique à moteur avant, 800 ch et 340 km/h : le dernier grand V12 atmosphérique de Ferrari. De quelle voiture s'agit-il ?",
      "V12 atmosférico delantero, 800 CV y 340 km/h: el último gran V12 atmosférico de Ferrari. ¿Qué coche es?",
    ],
    ["Ferrari 812 Superfast", "Ferrari F8 Tributo", "Ferrari Roma", "Ferrari 488 GTB"],
    0,
    [
      "Its model number is a hint: 800 cv and 12 cylinders.",
      "Son numéro est un indice : 800 cv et 12 cylindres.",
      "Su número es una pista: 800 CV y 12 cilindros.",
    ],
    [
      "The 812 Superfast is Ferrari's front-engined V12 flagship: 800 hp from 6.5 litres, driving the rear wheels.",
      "La 812 Superfast est le V12 avant de Ferrari : 800 ch issus de 6,5 litres, transmis aux roues arrière.",
      "El 812 Superfast es el V12 delantero de Ferrari: 800 CV de 6,5 litros enviados a las ruedas traseras.",
    ],
    { carId: "ferrari-812-superfast", claims: [{ field: "hp", value: 800 }, { field: "topSpeed", value: 340 }] }
  ),
  Q(
    "g-e-02", "guess", "easy",
    [
      "A wedge-shaped V12 icon of the 1970s and 80s, with scissor doors, designed by Marcello Gandini at Bertone.",
      "Une icône V12 en forme de coin des années 70-80, portes papillon, dessinée par Marcello Gandini chez Bertone.",
      "Un icono V12 en forma de cuña de los 70 y 80, con puertas de tijera, diseñado por Marcello Gandini en Bertone.",
    ],
    ["Lamborghini Countach", "Lamborghini Miura", "Lamborghini Diablo", "Ferrari Testarossa"],
    0,
    [
      "Its successor was named after a fighting bull, like every Lamborghini V12 after it.",
      "Sa successor porte le nom d'un taureau de combat, comme tous les V12 Lamborghini qui ont suivi.",
      "Su sucesor lleva el nombre de un toro de lidia, como todos los V12 de Lamborghini después.",
    ],
    [
      "The Countach defined the wedge era of Lamborghini and popularised scissor doors on production cars.",
      "La Countach a défini l'ère du coin chez Lamborghini et popularisé les portes papillon en série.",
      "El Countach definió la era del cuña en Lamborghini y popularizó las puertas de tijera en serie.",
    ],
    { carId: "lamborghini-countach" }
  ),
  Q(
    "g-e-03", "guess", "easy",
    [
      "Unveiled in Geneva in 1961 with a long bonnet and an inline-six; Enzo Ferrari reportedly called it the most beautiful car ever made.",
      "Présentée à Genève en 1961 avec un long capot et un six cylindres en ligne ; Enzo Ferrari l'aurait qualifiée de plus belle voiture jamais construite.",
      "Presentado en Ginebra en 1961, con capó largo y seis cilindros en línea; Enzo Ferrari lo llamó el coche más bonito jamás fabricado.",
    ],
    ["Jaguar E-Type", "Aston Martin DB5", "Mercedes-Benz 300 SL Gullwing", "Chevrolet Corvette C2 Sting Ray"],
    0,
    [
      "It is British, and it is not the car that played a secret agent.",
      "Elle est britannique, et ce n'est pas la voiture de l'agent secret.",
      "Es británico, y no es el coche del agente secreto.",
    ],
    [
      "The Jaguar E-Type debuted at the 1961 Geneva show and became one of the most celebrated designs of the 20th century.",
      "La Jaguar Type E a été révélée au Salon de Genève 1961 et reste l'un des dessins les plus célébrés du XXe siècle.",
      "El Jaguar E-Type debutó en el Salón de Ginebra de 1961 y sigue siendo uno de los diseños más celebrados del siglo XX.",
    ],
    { carId: "jaguar-e-type" }
  ),
  Q(
    "g-e-04", "guess", "easy",
    [
      "A 1967 American pony car fastback with a 4.7-litre V8 making 271 hp.",
      "Un fastback pony car américain de 1967 avec un V8 de 4,7 litres développant 271 ch.",
      "Un fastback pony car estadounidense de 1967 con un V8 de 4,7 litros y 271 CV.",
    ],
    ["Ford Mustang Fastback", "Chevrolet Camaro SS", "Dodge Charger R/T", "Pontiac GTO"],
    0,
    [
      "It is the first generation of a nameplate that is still in production today.",
      "C'est la première génération d'un nom toujours produit aujourd'hui.",
      "Es la primera generación de un nombre que aún se fabrica hoy.",
    ],
    [
      "The 1967 Mustang Fastback is one of the most recognisable American muscle cars ever built.",
      "La Mustang Fastback 1967 est l'une des muscle cars américaines les plus reconnaissables jamais produites.",
      "El Mustang Fastback de 1967 es uno de los muscle cars estadounidenses más reconocibles de la historia.",
    ],
    { carId: "ford-mustang-1967", claims: [{ field: "hp", value: 271 }, { field: "year", value: 1967 }] }
  ),
  Q(
    "g-e-05", "guess", "easy",
    [
      "A 1990s Japanese coupé with a 3.0-litre twin-turbo inline-six, rear-wheel drive and a cult following.",
      "Un coupé japonais des années 90 avec un six cylindres en ligne biturbo de 3,0 litres, propulsion et une communauté culte.",
      "Un coupé japonés de los 90 con un seis cilindros en línea biturbo de 3,0 litros, propulsión y estatus de culto.",
    ],
    ["Toyota Supra A80", "Nissan Skyline GT-R R34", "Mazda RX-7 FD", "Honda NSX"],
    0,
    [
      "Its engine is famous enough to have its own three-letter code.",
      "Son moteur est assez célèbre pour avoir son propre code à trois lettres.",
      "Su motor es tan famoso que tiene su propio código de tres letras.",
    ],
    [
      "The A80 Supra's 2JZ-GTE inline-six made it the defining Japanese tuning icon of the 1990s.",
      "Le six cylindres 2JZ-GTE de la Supra A80 en a fait l'icône absolue du tuning japonais des années 90.",
      "El seis cilindros 2JZ-GTE del Supra A80 lo convirtió en el icono del tuning japonés de los 90.",
    ],
    { carId: "toyota-supra-mk4", claims: [{ field: "drivetrain", value: "RWD" }] }
  ),

  // ----------------------------------------------------------
  // 🚗 GUESS THE CAR — medium
  // ----------------------------------------------------------
  Q(
    "g-m-01", "guess", "medium",
    [
      "Three seats with the driver in the middle, a 6.1-litre V12 built by BMW, and a 386 km/h top speed.",
      "Trois places avec le conducteur au centre, un V12 de 6,1 litres construit par BMW et 386 km/h en pointe.",
      "Tres plazas con el conductor en el centro, un V12 de 6,1 litros fabricado por BMW y 386 km/h de punta.",
    ],
    ["McLaren F1", "Jaguar XJ220", "Bugatti EB110", "Ferrari F50"],
    0,
    [
      "For a decade it was the fastest production car in the world.",
      "Pendant dix ans, elle fut la voiture de série la plus rapide du monde.",
      "Durante una década fue el coche de producción más rápido del mundo.",
    ],
    [
      "The McLaren F1 pairs a central driving position with a BMW-built 6.1-litre V12 and 627 hp in just 1,140 kg.",
      "La McLaren F1 associe une position de conduite centrale à un V12 BMW de 6,1 litres et 627 ch pour 1 140 kg.",
      "El McLaren F1 combina una posición de conducción central con un V12 BMW de 6,1 litros y 627 CV en solo 1.140 kg.",
    ],
    { carId: "mclaren-f1", claims: [{ field: "topSpeed", value: 386 }, { field: "hp", value: 627 }] }
  ),
  Q(
    "g-m-02", "guess", "medium",
    [
      "A 1950s coupé famous for its gullwing doors and for being the first production car with direct petrol injection.",
      "Un coupé des années 50 célèbre pour ses portes papillon et pour être la première voiture de série à injection directe essence.",
      "Un coupé de los 50 famoso por sus puertas de ala de gaviota y por ser el primer coche de producción con inyección directa de gasolina.",
    ],
    ["Mercedes-Benz 300 SL Gullwing", "BMW 507", "Porsche 356 Speedster", "Jaguar XK120"],
    0,
    [
      "Its doors open upwards because the tubular spaceframe had very high sills.",
      "Ses portes s'ouvrent vers le haut car le châssis tubulaire avait des bas de caisse très hauts.",
      "Sus puertas se abren hacia arriba porque el chasis tubular tenía umbrales muy altos.",
    ],
    [
      "The W198 300 SL Gullwing combined a racing spaceframe with mechanical direct injection — a first for a road car.",
      "La 300 SL Gullwing W198 associait un châssis tubulaire de course à une injection directe mécanique, une première en série.",
      "El 300 SL Gullwing W198 combinaba un chasis tubular de competición con inyección directa mecánica, una primicia en serie.",
    ],
    { carId: "mercedes-300sl", claims: [{ field: "hp", value: 215 }] }
  ),
  Q(
    "g-m-03", "guess", "medium",
    [
      "A naturally aspirated 4.0-litre flat-six that revs to 9,000 rpm and makes 510 hp in a rear-wheel-drive 911.",
      "Un flat-six atmosphérique de 4,0 litres qui monte à 9 000 tr/min et délivre 510 ch dans une 911 à propulsion.",
      "Un bóxer de seis cilindros atmosférico de 4,0 litros que sube a 9.000 rpm y da 510 CV en un 911 de propulsión.",
    ],
    ["Porsche 911 GT3", "Porsche 911 Turbo S", "Porsche 718 Cayman", "Porsche 911 Carrera 4S"],
    0,
    [
      "No turbocharger is involved — that rules out two of the four options.",
      "Aucun turbo n'est impliqué, ce qui élimine deux des quatre options.",
      "No hay turbo, lo que descarta dos de las cuatro opciones.",
    ],
    [
      "The 992-generation 911 GT3 keeps a 4.0-litre naturally aspirated flat-six with 510 hp and a 9,000 rpm redline.",
      "La 911 GT3 génération 992 conserve un flat-six atmosphérique de 4,0 litres, 510 ch et un régime maxi de 9 000 tr/min.",
      "El 911 GT3 de la generación 992 mantiene un bóxer atmosférico de 4,0 litros, 510 CV y 9.000 rpm de corte.",
    ],
    { carId: "porsche-911-gt3", claims: [{ field: "hp", value: 510 }] }
  ),
  Q(
    "g-m-04", "guess", "medium",
    [
      "Mid-engine, quattro all-wheel drive and a 5.2-litre naturally aspirated V10 with 610 hp — the first true supercar from Ingolstadt.",
      "Moteur central, transmission intégrale quattro et un V10 atmosphérique de 5,2 litres de 610 ch : la première vraie supercar d'Ingolstadt.",
      "Motor central, tracción quattro y un V10 atmosférico de 5,2 litros con 610 CV: el primer superdeportivo de verdad de Ingolstadt.",
    ],
    ["Audi R8 V10", "Audi RS6 Avant", "Porsche 911 Carrera 4S", "Lamborghini Gallardo LP560-4"],
    0,
    [
      "It is badged with four rings, not a bull.",
      "Elle arbore quatre anneaux, pas un taureau.",
      "Lleva cuatro aros, no un toro.",
    ],
    [
      "The second-generation Audi R8 V10 delivers 610 hp through quattro all-wheel drive from a mid-mounted 5.2-litre V10.",
      "L'Audi R8 V10 de deuxième génération délivre 610 ch via la transmission quattro, depuis un V10 5,2 litres central.",
      "El Audi R8 V10 de segunda generación entrega 610 CV con tracción quattro desde un V10 5.2 central.",
    ],
    { carId: "audi-r8-v10", claims: [{ field: "hp", value: 610 }] }
  ),
  Q(
    "g-m-05", "guess", "medium",
    [
      "A Croatian electric hypercar with four motors, 1,914 hp and a 1.85-second 0–100 km/h.",
      "Une hypercar électrique croate à quatre moteurs, 1 914 ch et un 0–100 km/h en 1,85 seconde.",
      "Un hypercar eléctrico croata con cuatro motores, 1.914 CV y un 0–100 km/h en 1,85 segundos.",
    ],
    ["Rimac Nevera", "Tesla Model S Plaid", "Lucid Air Sapphire", "Lotus Evija"],
    0,
    [
      "Its maker is also the technical partner behind a famous French hypercar brand.",
      "Son constructeur est aussi le partenaire technique d'une célèbre marque française d'hypercars.",
      "Su fabricante es también el socio técnico de una famosa marca francesa de hypercars.",
    ],
    [
      "The Rimac Nevera produces 1,914 hp from four electric motors and reaches 100 km/h in 1.85 seconds.",
      "La Rimac Nevera produit 1 914 ch grâce à quatre moteurs électriques et atteint 100 km/h en 1,85 seconde.",
      "El Rimac Nevera produce 1.914 CV con cuatro motores eléctricos y alcanza 100 km/h en 1,85 segundos.",
    ],
    { carId: "rimac-nevera", claims: [{ field: "hp", value: 1914 }, { field: "zeroToHundred", value: 1.85 }] }
  ),

  // ----------------------------------------------------------
  // 🚗 GUESS THE CAR — hard
  // ----------------------------------------------------------
  Q(
    "g-h-01", "guess", "hard",
    [
      "A Swedish hypercar with a 5.0-litre twin-turbo V8 producing 1,600 hp on E85 and a flat-plane crankshaft.",
      "Une hypercar suédoise avec un V8 biturbo de 5,0 litres produisant 1 600 ch à l'E85 et un vilebrequin à plat.",
      "Un hypercar sueco con un V8 biturbo de 5,0 litros que rinde 1.600 CV con E85 y cigüeñal plano.",
    ],
    ["Koenigsegg Jesko", "Koenigsegg Agera RS", "Bugatti Chiron Super Sport", "Pagani Utopia"],
    0,
    [
      "It is named after the founder's father.",
      "Elle porte le nom du père du fondateur.",
      "Lleva el nombre del padre del fundador.",
    ],
    [
      "The Jesko uses a 5.0-litre twin-turbo flat-plane V8 rated at 1,600 hp on E85 fuel.",
      "La Jesko utilise un V8 biturbo à plat de 5,0 litres développant 1 600 ch à l'E85.",
      "El Jesko usa un V8 biturbo plano de 5,0 litros con 1.600 CV usando E85.",
    ],
    { carId: "koenigsegg-jesko", claims: [{ field: "hp", value: 1600 }] }
  ),
  Q(
    "g-h-02", "guess", "hard",
    [
      "A Japanese supercar with a 4.8-litre V10 co-developed with Yamaha, a tachometer so fast it had to be digital, and only 500 built.",
      "Une supercar japonaise avec un V10 de 4,8 litres co-développé avec Yamaha, un compte-tours si rapide qu'il dut être digital, et seulement 500 exemplaires.",
      "Un superdeportivo japonés con un V10 de 4,8 litros codesarrollado con Yamaha, un cuentarrevoluciones tan rápido que tuvo que ser digital, y solo 500 unidades.",
    ],
    ["Lexus LFA", "Honda NSX", "Nissan GT-R Nismo", "Acura NSX Type S"],
    0,
    [
      "Its exhaust note is one of the most celebrated of the modern era.",
      "Sa sonorité d'échappement est l'une des plus célébrées de l'ère moderne.",
      "Su sonido de escape es uno de los más celebrados de la era moderna.",
    ],
    [
      "The LFA's 4.8-litre V10 was developed with Yamaha and revved so quickly that a digital instrument cluster was required.",
      "Le V10 4,8 litres de la LFA a été développé avec Yamaha et montait si vite qu'un combiné digital était indispensable.",
      "El V10 de 4,8 litros del LFA se desarrolló con Yamaha y subía tan rápido que exigía una instrumentación digital.",
    ],
    { carId: "lexus-lfa", claims: [{ field: "hp", value: 552 }] }
  ),
  Q(
    "g-h-03", "guess", "hard",
    [
      "A 1960s British grand tourer with a 4.0-litre inline-six, produced in little over 1,000 examples and immortalised on film.",
      "Un grand tourisme britannique des années 60 avec un six cylindres en ligne de 4,0 litres, produit à un peu plus de 1 000 exemplaires et immortalisé au cinéma.",
      "Un gran turismo británico de los 60 con un seis cilindros en línea de 4,0 litros, producido en poco más de 1.000 unidades e inmortalizado en el cine.",
    ],
    ["Aston Martin DB5", "Jaguar E-Type", "Bentley Continental GT", "Aston Martin DB11"],
    0,
    [
      "Its registration plate has appeared in more films than almost any other.",
      "Sa plaque d'immatriculation est apparue dans plus de films que presque toutes les autres.",
      "Su matrícula ha aparecido en más películas que casi cualquier otra.",
    ],
    [
      "The Aston Martin DB5 is the grand tourer most associated with James Bond, powered by a 4.0-litre inline-six.",
      "L'Aston Martin DB5 est le grand tourisme le plus associé à James Bond, animé par un six cylindres en ligne de 4,0 litres.",
      "El Aston Martin DB5 es el gran turismo más asociado a James Bond, con un seis cilindros en línea de 4,0 litros.",
    ],
    { carId: "aston-martin-db5", claims: [{ field: "year", value: 1964 }] }
  ),
  Q(
    "g-h-04", "guess", "hard",
    [
      "A mid-engine two-seater with a 3.0-litre twin-turbo V6 called Nettuno that uses Formula 1-derived pre-chamber combustion, 630 hp.",
      "Une deux places à moteur central avec un V6 biturbo de 3,0 litres nommé Nettuno, à combustion à préchambre inspirée de la F1, 630 ch.",
      "Un biplaza de motor central con un V6 biturbo de 3,0 litros llamado Nettuno, con combustión de precámara derivada de la F1 y 630 CV.",
    ],
    ["Maserati MC20", "Maserati GranTurismo", "Ferrari 296 GTB", "Alfa Romeo Giulia Quadrifoglio"],
    0,
    [
      "Its name marks the start of a new era for a Modena manufacturer.",
      "Son nom marque le début d'une nouvelle ère pour un constructeur de Modène.",
      "Su nombre marca el inicio de una nueva era para un fabricante de Módena.",
    ],
    [
      "The Maserati MC20 introduced the Nettuno V6, with twin combustion chambers per cylinder for 630 hp.",
      "La Maserati MC20 a introduit le V6 Nettuno, avec deux chambres de combustion par cylindre pour 630 ch.",
      "El Maserati MC20 estrenó el V6 Nettuno, con dos cámaras de combustión por cilindro y 630 CV.",
    ],
    { carId: "maserati-mc20", claims: [{ field: "hp", value: 630 }] }
  ),

  // ----------------------------------------------------------
  // 🚗 GUESS THE CAR — expert
  // ----------------------------------------------------------
  Q(
    "g-x-01", "guess", "expert",
    [
      "A 2.9-litre twin-turbo V8, 478 hp, 1,100 kg, and the last car personally approved by the company's founder. Which Ferrari is it?",
      "Un V8 biturbo de 2,9 litres, 478 ch, 1 100 kg, et la dernière voiture approuvée personnellement par le fondateur de la marque. De quelle Ferrari s'agit-il ?",
      "Un V8 biturbo de 2,9 litros, 478 CV, 1.100 kg, y el último coche aprobado personalmente por el fundador de la marca. ¿Qué Ferrari es?",
    ],
    ["Ferrari F40", "Ferrari 288 GTO", "Ferrari F50", "Ferrari Testarossa"],
    0,
    [
      "Its number refers to an anniversary of the company.",
      "Son numéro fait référence à un anniversaire de l'entreprise.",
      "Su número hace referencia a un aniversario de la empresa.",
    ],
    [
      "The F40 was built for Ferrari's 40th anniversary, with 478 hp from a 2.9-litre twin-turbo V8 in just 1,100 kg.",
      "La F40 a été construite pour le 40e anniversaire de Ferrari : 478 ch issus d'un V8 biturbo de 2,9 litres pour 1 100 kg.",
      "El F40 se construyó para el 40 aniversario de Ferrari: 478 CV de un V8 biturbo de 2,9 litros en solo 1.100 kg.",
    ],
    { carId: "ferrari-f40", claims: [{ field: "hp", value: 478 }, { field: "weight", value: 1100 }] }
  ),
  Q(
    "g-x-02", "guess", "expert",
    [
      "A Lamborghini flagship whose name means “bat”, with a 6.5-litre V12 rated at 640 hp in this version.",
      "Un vaisseau amiral Lamborghini dont le nom signifie « chauve-souris », avec un V12 de 6,5 litres développant 640 ch dans cette version.",
      "Un buque insignia de Lamborghini cuyo nombre significa «murciélago», con un V12 de 6,5 litros y 640 CV en esta versión.",
    ],
    ["Lamborghini Murciélago LP640", "Lamborghini Diablo VT", "Lamborghini Aventador SVJ", "Lamborghini Gallardo LP560-4"],
    0,
    [
      "The LP in its badge means longitudinal-posterior: engine mounted lengthwise at the rear.",
      "Le LP de son badge signifie longitudinal-postérieur : moteur placé longitudinalement à l'arrière.",
      "Las siglas LP significan longitudinal-posterior: motor montado longitudinalmente detrás.",
    ],
    [
      "The Murciélago LP640 pairs Lamborghini's 6.5-litre V12 with 640 hp, sitting between the Diablo and the Aventador.",
      "La Murciélago LP640 associe le V12 6,5 litres de Lamborghini à 640 ch, entre la Diablo et l'Aventador.",
      "El Murciélago LP640 combina el V12 de 6,5 litros de Lamborghini con 640 CV, entre el Diablo y el Aventador.",
    ],
    { carId: "lamborghini-murci-lago-lp640", claims: [{ field: "hp", value: 640 }] }
  ),
  Q(
    "g-x-03", "guess", "expert",
    [
      "A 1973 homologation special: 2.7-litre flat-six, 210 hp, 975 kg and the first road 911 with a ducktail rear spoiler.",
      "Une série d'homologation de 1973 : flat-six de 2,7 litres, 210 ch, 975 kg et la première 911 de route avec un aileron « ducktail ».",
      "Una serie de homologación de 1973: bóxer de seis cilindros de 2,7 litros, 210 CV, 975 kg y el primer 911 de calle con alerón «ducktail».",
    ],
    ["Porsche 911 Carrera RS 2.7", "Porsche 911 Turbo 3.3", "Porsche 911 SC", "Porsche 964 Carrera 2"],
    0,
    [
      "Its name refers to a racing series, and it was built to homologate a race car.",
      "Son nom fait référence à une série de course, et elle a été construite pour homologuer une voiture de course.",
      "Su nombre hace referencia a una serie de competición y se construyó para homologar un coche de carreras.",
    ],
    [
      "The 911 Carrera RS 2.7 was a lightweight homologation special with 210 hp from 2.7 litres and a weight of just 975 kg.",
      "La 911 Carrera RS 2.7 était une série d'homologation allégée : 210 ch pour 2,7 litres et seulement 975 kg.",
      "El 911 Carrera RS 2.7 fue una serie de homologación aligerada: 210 CV de 2,7 litros y solo 975 kg.",
    ],
    { carId: "porsche-911-turbo-classic", claims: [{ field: "hp", value: 210 }, { field: "weight", value: 975 }] }
  ),

  // ----------------------------------------------------------
  // 🚗 GUESS THE CAR — insane
  // ----------------------------------------------------------
  Q(
    "g-i-01", "guess", "insane",
    [
      "The first production car to break 400 km/h: an 8.0-litre quad-turbo W16 with 1,001 hp and ten radiators.",
      "La première voiture de série à franchir 400 km/h : un W16 de 8,0 litres à quatre turbos, 1 001 ch et dix radiateurs.",
      "El primer coche de producción en superar los 400 km/h: un W16 de 8,0 litros con cuatro turbos, 1.001 CV y diez radiadores.",
    ],
    ["Bugatti Veyron 16.4", "Bugatti Chiron", "Koenigsegg CCX", "McLaren F1"],
    0,
    [
      "Its engine is effectively two narrow-angle V8s joined together.",
      "Son moteur est en réalité deux V8 à angle étroit réunis.",
      "Su motor es, en realidad, dos V8 de ángulo estrecho unidos.",
    ],
    [
      "The Veyron 16.4 delivered 1,001 hp from an 8.0-litre quad-turbo W16 and reached 407 km/h.",
      "La Veyron 16.4 délivrait 1 001 ch depuis un W16 8,0 litres à quatre turbos et atteignait 407 km/h.",
      "El Veyron 16.4 entregaba 1.001 CV con un W16 de 8,0 litros y cuatro turbos, y alcanzaba 407 km/h.",
    ],
    { carId: "bugatti-veyron-16-4", claims: [{ field: "hp", value: 1001 }, { field: "topSpeed", value: 407 }] }
  ),
  Q(
    "g-i-02", "guess", "insane",
    [
      "The first series-production car from an Argentine-Italian designer, with a 7.3-litre naturally aspirated V12 built by AMG and 602 hp.",
      "La première voiture de série d'un designer argentino-italien, avec un V12 atmosphérique de 7,3 litres construit par AMG et 602 ch.",
      "El primer coche de serie de un diseñador ítalo-argentino, con un V12 atmosférico de 7,3 litros fabricado por AMG y 602 CV.",
    ],
    ["Pagani Zonda F", "Pagani Huayra", "Pagani Utopia", "Ferrari Enzo"],
    0,
    [
      "Both this car and its successor are named after winds, not after people.",
      "Cette voiture et sa successor portent toutes deux le nom de vents, pas de personnes.",
      "Tanto este coche como su sucesor llevan el nombre de vientos, no de personas.",
    ],
    [
      "The Zonda F carries a 7.3-litre AMG-built V12 with 602 hp and is named after Formula One driver Juan Manuel Fangio's nickname era — the Zonda wind of Argentina.",
      "La Zonda F embarque un V12 AMG de 7,3 litres de 602 ch et tire son nom du vent Zonda d'Argentine.",
      "El Zonda F monta un V12 AMG de 7,3 litros con 602 CV y toma su nombre del viento Zonda de Argentina.",
    ],
    { carId: "pagani-zonda-f", claims: [{ field: "hp", value: 602 }] }
  ),
  Q(
    "g-i-03", "guess", "insane",
    [
      "A Japanese coupé built from 1999 to 2002 with a 2.6-litre twin-turbo inline-six and the ATTESA E-TS four-wheel-drive system.",
      "Un coupé japonais produit de 1999 à 2002 avec un six cylindres en ligne biturbo de 2,6 litres et la transmission intégrale ATTESA E-TS.",
      "Un coupé japonés fabricado de 1999 a 2002 con un seis cilindros en línea biturbo de 2,6 litros y el sistema de tracción ATTESA E-TS.",
    ],
    ["Nissan Skyline GT-R R34", "Nissan GT-R Nismo", "Mitsubishi Lancer Evolution IX", "Toyota Supra A80"],
    0,
    [
      "Its engine code starts with RB, not VR.",
      "Le code de son moteur commence par RB, pas VR.",
      "El código de su motor empieza por RB, no por VR.",
    ],
    [
      "The R34 Skyline GT-R used the RB26DETT inline-six with ATTESA E-TS all-wheel drive and Super HICAS rear steering.",
      "La Skyline GT-R R34 utilisait le six cylindres RB26DETT avec la transmission ATTESA E-TS et les roues arrière directrices Super HICAS.",
      "El Skyline GT-R R34 usaba el seis cilindros RB26DETT con tracción ATTESA E-TS y dirección trasera Super HICAS.",
    ],
    { carId: "nissan-skyline-r34", claims: [{ field: "drivetrain", value: "AWD" }] }
  ),

  // ----------------------------------------------------------
  // 💰 GUESS THE PRICE — easy
  // ----------------------------------------------------------
  Q(
    "p-e-01", "price", "easy",
    [
      "What price does the CarVibes database list for a new Mazda MX-5 Miata?",
      "Quel prix la base de données CarVibes indique-t-elle pour une Mazda MX-5 Miata neuve ?",
      "¿Qué precio indica la base de datos de CarVibes para un Mazda MX-5 Miata nuevo?",
    ],
    ["$28,000", "$41,000", "$52,000", "$19,000"],
    0,
    [
      "It is the best-selling two-seat sports car in history, and it was never expensive.",
      "C'est le roadster deux places le plus vendu de l'histoire, et il n'a jamais été cher.",
      "Es el deportivo biplaza más vendido de la historia y nunca fue caro.",
    ],
    [
      "The MX-5 stays deliberately affordable: 181 hp, 1,050 kg and a list price around $28,000.",
      "La MX-5 reste volontairement abordable : 181 ch, 1 050 kg et un prix catalogue d'environ 28 000 $.",
      "El MX-5 sigue siendo deliberadamente asequible: 181 CV, 1.050 kg y un precio de unos 28.000 $.",
    ],
    { carId: "mazda-mx5-miata", fact: { carId: "mazda-mx5-miata", field: "price" } }
  ),
  Q(
    "p-e-02", "price", "easy",
    [
      "What price does the CarVibes database list for a new Toyota Corolla?",
      "Quel prix la base de données CarVibes indique-t-elle pour une Toyota Corolla neuve ?",
      "¿Qué precio indica la base de datos de CarVibes para un Toyota Corolla nuevo?",
    ],
    ["$22,000", "$31,000", "$17,000", "$27,000"],
    0,
    [
      "It is the best-selling nameplate in automotive history, priced to be accessible.",
      "C'est le nom le plus vendu de l'histoire automobile, tarifé pour rester accessible.",
      "Es el nombre más vendido de la historia del automóvil, con un precio accesible.",
    ],
    [
      "The Corolla is listed around $22,000 — an entry point that explains its status as the best-selling car ever.",
      "La Corolla est listée autour de 22 000 $, un prix d'appel qui explique son statut de voiture la plus vendue au monde.",
      "El Corolla figura en torno a 22.000 $, un precio de entrada que explica su condición de coche más vendido del mundo.",
    ],
    { carId: "toyota-corolla", fact: { carId: "toyota-corolla", field: "price" } }
  ),
  Q(
    "p-e-03", "price", "easy",
    [
      "What price does the CarVibes database list for a new Volkswagen Golf GTI?",
      "Quel prix la base de données CarVibes indique-t-elle pour une Volkswagen Golf GTI neuve ?",
      "¿Qué precio indica la base de datos de CarVibes para un Volkswagen Golf GTI nuevo?",
    ],
    ["$31,000", "$42,000", "$24,000", "$38,000"],
    0,
    [
      "It is the car that invented the hot hatch segment in 1976.",
      "C'est la voiture qui a inventé le segment des compactes sportives en 1976.",
      "Es el coche que inventó el segmento de los compactos deportivos en 1976.",
    ],
    [
      "The Golf GTI is listed around $31,000 — a hot hatch that has defined the segment since 1976.",
      "La Golf GTI est listée autour de 31 000 $, une compacte sportive qui définit le segment depuis 1976.",
      "El Golf GTI figura en torno a 31.000 $, un compacto deportivo que define el segmento desde 1976.",
    ],
    { carId: "volkswagen-golf-gti", fact: { carId: "volkswagen-golf-gti", field: "price" } }
  ),

  // ----------------------------------------------------------
  // 💰 GUESS THE PRICE — medium
  // ----------------------------------------------------------
  Q(
    "p-m-01", "price", "medium",
    [
      "What price does the CarVibes database list for the mid-engine Chevrolet Corvette C8?",
      "Quel prix la base de données CarVibes indique-t-elle pour la Chevrolet Corvette C8 à moteur central ?",
      "¿Qué precio indica la base de datos de CarVibes para el Chevrolet Corvette C8 de motor central?",
    ],
    ["$68,000", "$95,000", "$52,000", "$120,000"],
    0,
    [
      "It undercuts European mid-engine rivals by a wide margin.",
      "Elle sous-cote largement ses rivales européennes à moteur central.",
      "Cuesta bastante menos que sus rivales europeos de motor central.",
    ],
    [
      "The C8 Corvette is listed around $68,000 despite 495 hp and a 2.9-second 0–100 km/h.",
      "La Corvette C8 est listée autour de 68 000 $ malgré 495 ch et un 0–100 km/h en 2,9 secondes.",
      "El Corvette C8 figura en torno a 68.000 $ pese a sus 495 CV y un 0–100 km/h en 2,9 segundos.",
    ],
    { carId: "chevrolet-corvette-c8", fact: { carId: "chevrolet-corvette-c8", field: "price" } }
  ),
  Q(
    "p-m-02", "price", "medium",
    [
      "What price does the CarVibes database list for the BMW M3 Competition?",
      "Quel prix la base de données CarVibes indique-t-elle pour la BMW M3 Competition ?",
      "¿Qué precio indica la base de datos de CarVibes para el BMW M3 Competition?",
    ],
    ["$76,000", "$62,000", "$94,000", "$110,000"],
    0,
    [
      "It costs roughly what a mid-size SUV from the same brand costs — with 510 hp instead of 375.",
      "Elle coûte à peu près le prix d'un SUV intermédiaire de la même marque, avec 510 ch au lieu de 375.",
      "Cuesta aproximadamente lo que un SUV medio de la misma marca, con 510 CV en lugar de 375.",
    ],
    [
      "The M3 Competition is listed around $76,000, powered by the S58 3.0-litre twin-turbo inline-six with 510 hp.",
      "La M3 Competition est listée autour de 76 000 $, animée par le six cylindres biturbo S58 de 3,0 litres et 510 ch.",
      "El M3 Competition figura en torno a 76.000 $, con el seis cilindros biturbo S58 de 3,0 litros y 510 CV.",
    ],
    { carId: "bmw-m3-competition", fact: { carId: "bmw-m3-competition", field: "price" } }
  ),
  Q(
    "p-m-03", "price", "medium",
    [
      "What price does the CarVibes database list for a base Porsche 911 Carrera?",
      "Quel prix la base de données CarVibes indique-t-elle pour une Porsche 911 Carrera de base ?",
      "¿Qué precio indica la base de datos de CarVibes para un Porsche 911 Carrera básico?",
    ],
    ["$107,000", "$89,000", "$145,000", "$132,000"],
    0,
    [
      "It is the entry point to the 911 range — not the Turbo, not the GT3.",
      "C'est le point d'entrée de la gamme 911 — ni la Turbo, ni la GT3.",
      "Es la puerta de entrada a la gama 911: ni el Turbo ni el GT3.",
    ],
    [
      "The 911 Carrera starts around $107,000 with a 3.0-litre twin-turbo flat-six making 385 hp.",
      "La 911 Carrera démarre autour de 107 000 $ avec un flat-six biturbo de 3,0 litres de 385 ch.",
      "El 911 Carrera parte de unos 107.000 $ con un bóxer biturbo de 3,0 litros y 385 CV.",
    ],
    { carId: "porsche-911-carrera", fact: { carId: "porsche-911-carrera", field: "price" } }
  ),
  Q(
    "p-m-04", "price", "medium",
    [
      "What price does the CarVibes database list for the Tesla Model S Plaid?",
      "Quel prix la base de données CarVibes indique-t-elle pour la Tesla Model S Plaid ?",
      "¿Qué precio indica la base de datos de CarVibes para el Tesla Model S Plaid?",
    ],
    ["$90,000", "$135,000", "$72,000", "$150,000"],
    0,
    [
      "1,020 hp from three motors — and it costs less than many 600-hp supercars.",
      "1 020 ch issus de trois moteurs — et elle coûte moins cher que beaucoup de supercars de 600 ch.",
      "1.020 CV de tres motores, y cuesta menos que muchos superdeportivos de 600 CV.",
    ],
    [
      "The Model S Plaid is listed around $90,000 for 1,020 hp and a 2.1-second 0–100 km/h.",
      "La Model S Plaid est listée autour de 90 000 $ pour 1 020 ch et un 0–100 km/h en 2,1 secondes.",
      "El Model S Plaid figura en torno a 90.000 $ con 1.020 CV y un 0–100 km/h en 2,1 segundos.",
    ],
    { carId: "tesla-model-s-plaid", fact: { carId: "tesla-model-s-plaid", field: "price" } }
  ),

  // ----------------------------------------------------------
  // 💰 GUESS THE PRICE — hard
  // ----------------------------------------------------------
  Q(
    "p-h-01", "price", "hard",
    [
      "What price does the CarVibes database list for the Ferrari F8 Tributo?",
      "Quel prix la base de données CarVibes indique-t-elle pour la Ferrari F8 Tributo ?",
      "¿Qué precio indica la base de datos de CarVibes para el Ferrari F8 Tributo?",
    ],
    ["$280,000", "$195,000", "$420,000", "$340,000"],
    0,
    [
      "It sits between the 488 GTB and the V12 flagships in the range.",
      "Elle se situe entre la 488 GTB et les vaisseaux V12 de la gamme.",
      "Se sitúa entre el 488 GTB y los V12 tope de gama.",
    ],
    [
      "The F8 Tributo is listed around $280,000, with 720 hp from a 3.9-litre twin-turbo V8.",
      "La F8 Tributo est listée autour de 280 000 $, avec 720 ch issus d'un V8 biturbo de 3,9 litres.",
      "El F8 Tributo figura en torno a 280.000 $, con 720 CV de un V8 biturbo de 3,9 litros.",
    ],
    { carId: "ferrari-f8-tributo", fact: { carId: "ferrari-f8-tributo", field: "price" } }
  ),
  Q(
    "p-h-02", "price", "hard",
    [
      "What price does the CarVibes database list for the Porsche Taycan Turbo S?",
      "Quel prix la base de données CarVibes indique-t-elle pour la Porsche Taycan Turbo S ?",
      "¿Qué precio indica la base de datos de CarVibes para el Porsche Taycan Turbo S?",
    ],
    ["$188,000", "$142,000", "$245,000", "$120,000"],
    0,
    [
      "It carries no combustion engine, but it is priced like a 911 Turbo S rival.",
      "Elle n'a aucun moteur thermique, mais elle est tarifée comme une rivale de la 911 Turbo S.",
      "No lleva motor de combustión, pero tiene precio de rival del 911 Turbo S.",
    ],
    [
      "The Taycan Turbo S is listed around $188,000, with 761 hp on overboost from its 800-volt architecture.",
      "La Taycan Turbo S est listée autour de 188 000 $, avec 761 ch en overboost grâce à son architecture 800 volts.",
      "El Taycan Turbo S figura en torno a 188.000 $, con 761 CV en overboost gracias a su arquitectura de 800 voltios.",
    ],
    { carId: "porsche-taycan-turbo-s", fact: { carId: "porsche-taycan-turbo-s", field: "price" } }
  ),
  Q(
    "p-h-03", "price", "hard",
    [
      "What price does the CarVibes database list for the McLaren 720S?",
      "Quel prix la base de données CarVibes indique-t-elle pour la McLaren 720S ?",
      "¿Qué precio indica la base de datos de CarVibes para el McLaren 720S?",
    ],
    ["$300,000", "$220,000", "$410,000", "$265,000"],
    0,
    [
      "Its name tells you its power output; its price is close to a Ferrari V8 flagship.",
      "Son nom indique sa puissance ; son prix est proche d'un vaisseau V8 Ferrari.",
      "Su nombre indica su potencia y su precio es cercano al de un V8 tope de Ferrari.",
    ],
    [
      "The 720S is listed around $300,000 — 720 hp from a 4.0-litre twin-turbo V8 in a 1,419 kg carbon tub.",
      "La 720S est listée autour de 300 000 $ : 720 ch issus d'un V8 biturbo de 4,0 litres dans une coque carbone de 1 419 kg.",
      "El 720S figura en torno a 300.000 $: 720 CV de un V8 biturbo de 4,0 litros en una bañera de carbono de 1.419 kg.",
    ],
    { carId: "mclaren-720s", fact: { carId: "mclaren-720s", field: "price" } }
  ),
  Q(
    "p-h-04", "price", "hard",
    [
      "What price does the CarVibes database list for the Rolls-Royce Ghost?",
      "Quel prix la base de données CarVibes indique-t-elle pour la Rolls-Royce Ghost ?",
      "¿Qué precio indica la base de datos de CarVibes para el Rolls-Royce Ghost?",
    ],
    ["$340,000", "$260,000", "$480,000", "$195,000"],
    0,
    [
      "It is the “entry” model of a brand whose flagship costs considerably more.",
      "C'est le modèle « d'entrée » d'une marque dont le vaisseau amiral coûte nettement plus cher.",
      "Es el modelo «de entrada» de una marca cuyo buque insignia cuesta bastante más.",
    ],
    [
      "The Ghost is listed around $340,000, with a 6.75-litre twin-turbo V12 producing 563 hp.",
      "La Ghost est listée autour de 340 000 $, avec un V12 biturbo de 6,75 litres développant 563 ch.",
      "El Ghost figura en torno a 340.000 $, con un V12 biturbo de 6,75 litros y 563 CV.",
    ],
    { carId: "rolls-royce-ghost", fact: { carId: "rolls-royce-ghost", field: "price" } }
  ),

  // ----------------------------------------------------------
  // 💰 GUESS THE PRICE — expert
  // ----------------------------------------------------------
  Q(
    "p-x-01", "price", "expert",
    [
      "What price does the CarVibes database list for the Bugatti Veyron 16.4?",
      "Quel prix la base de données CarVibes indique-t-elle pour la Bugatti Veyron 16.4 ?",
      "¿Qué precio indica la base de datos de CarVibes para el Bugatti Veyron 16.4?",
    ],
    ["$1,700,000", "$2,900,000", "$1,100,000", "$4,200,000"],
    0,
    [
      "Its development reportedly cost the group far more than every unit ever sold.",
      "Son développement aurait coûté au groupe bien plus que toutes les unités vendues.",
      "Su desarrollo costó al grupo mucho más de lo que se recaudó con todas las unidades.",
    ],
    [
      "The Veyron 16.4 is listed around $1.7 million — a figure that famously never covered its development cost.",
      "La Veyron 16.4 est listée autour de 1,7 million de dollars, un montant qui n'a jamais couvert son coût de développement.",
      "El Veyron 16.4 figura en torno a 1,7 millones de dólares, una cifra que nunca cubrió su coste de desarrollo.",
    ],
    { carId: "bugatti-veyron-16-4", fact: { carId: "bugatti-veyron-16-4", field: "price" } }
  ),
  Q(
    "p-x-02", "price", "expert",
    [
      "What price does the CarVibes database list for the Ferrari LaFerrari?",
      "Quel prix la base de données CarVibes indique-t-elle pour la Ferrari LaFerrari ?",
      "¿Qué precio indica la base de datos de CarVibes para el Ferrari LaFerrari?",
    ],
    ["$1,500,000", "$890,000", "$2,400,000", "$1,050,000"],
    0,
    [
      "You could not simply buy one: ownership of several Ferraris was a precondition.",
      "On ne pouvait pas simplement l'acheter : posséder plusieurs Ferrari était un prérequis.",
      "No bastaba con querer comprarlo: poseer varios Ferrari era un requisito previo.",
    ],
    [
      "The LaFerrari is listed around $1.5 million, combining a 6.3-litre V12 with hybrid assistance for 950 hp.",
      "La LaFerrari est listée autour de 1,5 million de dollars, combinant un V12 de 6,3 litres et une hybridation pour 950 ch.",
      "El LaFerrari figura en torno a 1,5 millones de dólares, con un V12 de 6,3 litros e hibridación para 950 CV.",
    ],
    { carId: "ferrari-laferrari", fact: { carId: "ferrari-laferrari", field: "price" } }
  ),
  Q(
    "p-x-03", "price", "expert",
    [
      "What price does the CarVibes database list for the Pagani Utopia?",
      "Quel prix la base de données CarVibes indique-t-elle pour la Pagani Utopia ?",
      "¿Qué precio indica la base de datos de CarVibes para el Pagani Utopia?",
    ],
    ["$2,500,000", "$1,600,000", "$3,900,000", "$2,100,000"],
    0,
    [
      "It deliberately rejects the digital screen era: analogue gauges and a manual gearbox option.",
      "Elle rejette volontairement l'ère des écrans : cadrans analogiques et boîte manuelle en option.",
      "Rechaza a propósito la era de las pantallas: relojes analógicos y opción de cambio manual.",
    ],
    [
      "The Utopia is listed around $2.5 million, with 864 hp from an AMG-built 6.0-litre twin-turbo V12.",
      "L'Utopia est listée autour de 2,5 millions de dollars, avec 864 ch issus d'un V12 biturbo AMG de 6,0 litres.",
      "El Utopia figura en torno a 2,5 millones de dólares, con 864 CV de un V12 biturbo AMG de 6,0 litros.",
    ],
    { carId: "pagani-utopia", fact: { carId: "pagani-utopia", field: "price" } }
  ),

  // ----------------------------------------------------------
  // 💰 GUESS THE PRICE — insane
  // ----------------------------------------------------------
  Q(
    "p-i-01", "price", "insane",
    [
      "What price does the CarVibes database list for a McLaren F1 — the value it commands today, not its original list price?",
      "Quel prix la base de données CarVibes indique-t-elle pour une McLaren F1 — sa valeur actuelle, pas son prix d'origine ?",
      "¿Qué precio indica la base de datos de CarVibes para un McLaren F1: su valor actual, no su precio original?",
    ],
    ["$20,000,000", "$8,500,000", "$34,000,000", "$12,000,000"],
    0,
    [
      "Fewer than 70 road cars were built, and collector demand has pushed the figure far beyond its 1990s list price.",
      "Moins de 70 exemplaires routiers ont été construits, et la demande des collectionneurs a propulsé le chiffre bien au-delà du prix des années 90.",
      "Se fabricaron menos de 70 unidades de calle y la demanda de los coleccionistas ha disparado la cifra muy por encima del precio de los 90.",
    ],
    [
      "CarVibes lists the McLaren F1 around $20 million, reflecting modern auction values rather than its original price.",
      "CarVibes liste la McLaren F1 autour de 20 millions de dollars, reflétant les valeurs actuelles aux enchères plutôt que son prix d'origine.",
      "CarVibes lista el McLaren F1 en torno a 20 millones de dólares, reflejando los valores actuales en subasta y no su precio original.",
    ],
    { carId: "mclaren-f1", fact: { carId: "mclaren-f1", field: "price" } }
  ),
  Q(
    "p-i-02", "price", "insane",
    [
      "What price does the CarVibes database list for a Mercedes-Benz 300 SL Gullwing today?",
      "Quel prix la base de données CarVibes indique-t-elle aujourd'hui pour une Mercedes-Benz 300 SL Gullwing ?",
      "¿Qué precio indica la base de datos de CarVibes hoy para un Mercedes-Benz 300 SL Gullwing?",
    ],
    ["$1,500,000", "$620,000", "$2,800,000", "$430,000"],
    0,
    [
      "Its original 1950s price was a fraction of this — the market has multiplied it many times over.",
      "Son prix d'origine dans les années 50 était une fraction de celui-ci — le marché l'a multiplié plusieurs fois.",
      "Su precio original en los 50 era una fracción de este: el mercado lo ha multiplicado varias veces.",
    ],
    [
      "CarVibes lists the 300 SL Gullwing around $1.5 million, a classic whose value keeps climbing.",
      "CarVibes liste la 300 SL Gullwing autour de 1,5 million de dollars, un classique dont la valeur ne cesse de grimper.",
      "CarVibes lista el 300 SL Gullwing en torno a 1,5 millones de dólares, un clásico cuyo valor no deja de subir.",
    ],
    { carId: "mercedes-300sl", fact: { carId: "mercedes-300sl", field: "price" } }
  ),
  Q(
    "p-i-03", "price", "insane",
    [
      "What price does the CarVibes database list for the 1973 Porsche 911 Carrera RS 2.7?",
      "Quel prix la base de données CarVibes indique-t-elle pour la Porsche 911 Carrera RS 2.7 de 1973 ?",
      "¿Qué precio indica la base de datos de CarVibes para el Porsche 911 Carrera RS 2.7 de 1973?",
    ],
    ["$400,000", "$180,000", "$750,000", "$95,000"],
    0,
    [
      "Only 1,580 were built, which is why collectors pay a multiple of its original price.",
      "Seulement 1 580 exemplaires ont été construits, d'où le multiple payé par les collectionneurs.",
      "Solo se fabricaron 1.580 unidades, de ahí el múltiplo que pagan los coleccionistas.",
    ],
    [
      "CarVibes lists the 911 Carrera RS 2.7 around $400,000 — a homologation special built in limited numbers.",
      "CarVibes liste la 911 Carrera RS 2.7 autour de 400 000 $, une série d'homologation produite en nombre limité.",
      "CarVibes lista el 911 Carrera RS 2.7 en torno a 400.000 $, una serie de homologación fabricada en número limitado.",
    ],
    { carId: "porsche-911-turbo-classic", fact: { carId: "porsche-911-turbo-classic", field: "price" } }
  ),
];
