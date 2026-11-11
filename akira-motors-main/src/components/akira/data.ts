const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

export const heroImg = asset("akr1390-hero.png");
export const enduroImg = asset("akira-590n-enduro.png");
export const motocrossImg = asset("akira-790-motocross.png");
export const adventureImg = asset("akira-990r-adventure.png");
export const logoImg = asset("akira-logo.png");
export const roadImg = asset("akr1390.jpg");

export { logoImg as default };

export type Category = "Naked" | "Enduro" | "Motocross" | "Adventure";

export type Bike = {
  slug: string;
  name: string;
  cat: Category;
  img: string;
  audioSrc: string;
  tankCapacityLiters: number;
  fuelConsumptionLPer100Km: number;
  fuelConsumptionKmPerL: number;
  estFullTankRangeKm: number;
  soundNote: string;
  cc: string;
  hp: string;
  kg: string;
  price: string;
  tagline: string;
  description: string;
  features: string[];
  specs: [string, string][];
  tech: [string, string][];
};

export const bikes: Bike[] = [
  {
    slug: "akr-1390",
    name: "AKR 1390",
    cat: "Naked",
    img: heroImg,
    audioSrc: asset("aistudio/AKR1390_3b482cad.mp3"),
    tankCapacityLiters: 17.5,
    fuelConsumptionLPer100Km: 6.5,
    fuelConsumptionKmPerL: 15.38,
    estFullTankRangeKm: 269,
    soundNote: "Bicilíndrico en V 75° a 10.000 RPM · Sonido grave y explosivo de alta compresión",
    cc: "1390 cc",
    hp: "180 HP",
    kg: "199 kg",
    price: "$ 89.900.000",
    tagline: "La bestia de la ciudad.",
    description:
      "Nuestra naked insignia. Un bicilíndrico brutal en un chasis ligero, pensado para quien quiere sentir cada aceleración.",
    features: [
      "Control de tracción en curva",
      "Quickshifter bidireccional",
      "Pantalla TFT 5\" con conectividad",
      "Suspensión WP semiactiva",
    ],
    specs: [
      ["Motor", "Bicilíndrico en V 75°"],
      ["Cilindrada", "1390 cc"],
      ["Potencia", "180 HP @ 10.000 rpm"],
      ["Torque", "145 Nm @ 8.000 rpm"],
      ["Peso", "199 kg"],
      ["Tanque", "17,5 L"],
      ["Consumo prom.", "6,5 L / 100 km"],
      ["Autonomía máx.", "269 km"],
      ["Altura asiento", "834 mm"],
      ["Frenos", "Brembo Stylema 320 mm"],
    ],
    tech: [
      ["ABS", "Bosch 10.3 Cornering ABS con modo Supermoto"],
      ["Crucero adaptativo", "Radar frontal, 30–180 km/h"],
      ["Inyección", "Electrónica Keihin, cuerpos de 56 mm, ride-by-wire"],
      ["Barras invertidas", "WP APEX 43 mm · recorrido 140 mm / 150 mm"],
      ["Pantalla y conectividad", "TFT 5\" · Bluetooth, navegación y música"],
      ["Marchas", "6 velocidades + quickshifter"],
      ["Refrigeración", "Líquida"],
    ],
  },
  {
    slug: "akr-990r",
    name: "AKR 990R",
    cat: "Adventure",
    img: adventureImg,
    audioSrc: asset("aistudio/AKR_990R_b51bf02a.mp3"),
    tankCapacityLiters: 23.0,
    fuelConsumptionLPer100Km: 4.8,
    fuelConsumptionKmPerL: 20.83,
    estFullTankRangeKm: 479,
    soundNote: "Bicilíndrico paralelo 947cc · Tono de resistencia con escape Akrapovič Adventure",
    cc: "947 cc",
    hp: "130 HP",
    kg: "220 kg",
    price: "$ 72.500.000",
    tagline: "Explora lo inexplorado.",
    description:
      "Hecha para cruzar países sin mirar el asfalto. Autonomía, protección y potencia para cualquier terreno.",
    features: [
      "Modos Rally, Off-road, Street y Rain",
      "Control crucero adaptativo",
      "Tanque de gran autonomía (23 L)",
      "Protección de motor y manos",
    ],
    specs: [
      ["Motor", "Bicilíndrico paralelo"],
      ["Cilindrada", "947 cc"],
      ["Potencia", "130 HP @ 9.500 rpm"],
      ["Torque", "103 Nm @ 6.750 rpm"],
      ["Peso", "220 kg"],
      ["Tanque", "23 L"],
      ["Consumo prom.", "4,8 L / 100 km"],
      ["Autonomía máx.", "479 km"],
      ["Altura asiento", "880 mm"],
      ["Recorrido susp.", "240 mm"],
    ],
    tech: [
      ["ABS", "Cornering ABS con modo Off-road desconectable"],
      ["Crucero adaptativo", "Radar frontal con distancia ajustable"],
      ["Inyección", "Electrónica, cuerpos de 48 mm, ride-by-wire"],
      ["Barras invertidas", "WP XPLOR 48 mm · recorrido 240 mm / 240 mm"],
      ["Pantalla y conectividad", "TFT 7\" · Bluetooth, GPS turn-by-turn y llamadas"],
      ["Marchas", "6 velocidades"],
      ["Refrigeración", "Líquida con doble radiador"],
    ],
  },
  {
    slug: "akr-790",
    name: "AKR 790",
    cat: "Motocross",
    img: motocrossImg,
    audioSrc: asset("aistudio/AKR_790_922c553a.mp3"),
    tankCapacityLiters: 7.2,
    fuelConsumptionLPer100Km: 4.2,
    fuelConsumptionKmPerL: 23.81,
    estFullTankRangeKm: 171,
    soundNote: "Monocilíndrico 4T 449cc de competición · Respuesta inmediata a 11.500 RPM",
    cc: "449 cc",
    hp: "63 HP",
    kg: "104 kg",
    price: "$ 48.900.000",
    tagline: "Nacida para volar.",
    description:
      "Ligera y explosiva. Diseñada para la pista de motocross, con la respuesta que piden los pilotos de competencia.",
    features: [
      "Launch control",
      "Chasis de cromo-molibdeno",
      "Mapas de motor intercambiables",
      "Arranque eléctrico",
    ],
    specs: [
      ["Motor", "Monocilíndrico 4T"],
      ["Cilindrada", "449 cc"],
      ["Potencia", "63 HP"],
      ["Peso", "104 kg"],
      ["Tanque", "7,2 L"],
      ["Consumo prom.", "4,2 L / 100 km"],
      ["Autonomía máx.", "171 km"],
      ["Altura asiento", "955 mm"],
      ["Suspensión", "WP XACT 48 mm"],
      ["Transmisión", "5 velocidades"],
    ],
    tech: [
      ["ABS", "No incluido (uso en pista)"],
      ["Crucero adaptativo", "No aplica"],
      ["Inyección", "Electrónica Keihin 44 mm con 2 mapas"],
      ["Barras invertidas", "WP XACT 48 mm · recorrido 310 mm / 300 mm"],
      ["Pantalla y conectividad", "Display LCD mínimo · app de mapas vía Bluetooth"],
      ["Marchas", "5 velocidades"],
      ["Refrigeración", "Líquida"],
    ],
  },
  {
    slug: "akr-590n",
    name: "AKR 590N",
    cat: "Enduro",
    img: enduroImg,
    audioSrc: asset("aistudio/AKR_590_7bb57afc.mp3"),
    tankCapacityLiters: 8.5,
    fuelConsumptionLPer100Km: 3.8,
    fuelConsumptionKmPerL: 26.32,
    estFullTankRangeKm: 224,
    soundNote: "Monocilíndrico 586cc Enduro · Sonido áspero y constante optimizado para trocha y asfalto",
    cc: "586 cc",
    hp: "58 HP",
    kg: "112 kg",
    price: "$ 42.300.000",
    tagline: "Del sendero a la ciudad.",
    description:
      "Enduro versátil y resistente. Va al trabajo entre semana y se pierde en la montaña el fin de semana.",
    features: [
      "Homologada para calle",
      "ABS desconectable",
      "Protector de cárter",
      "Iluminación LED",
    ],
    specs: [
      ["Motor", "Monocilíndrico 4T"],
      ["Cilindrada", "586 cc"],
      ["Potencia", "58 HP"],
      ["Peso", "112 kg"],
      ["Tanque", "8,5 L"],
      ["Consumo prom.", "3,8 L / 100 km"],
      ["Autonomía máx.", "224 km"],
      ["Altura asiento", "940 mm"],
      ["Recorrido susp.", "300 mm"],
      ["Transmisión", "6 velocidades"],
    ],
    tech: [
      ["ABS", "Bosch 9.1 desconectable en rueda trasera"],
      ["Crucero adaptativo", "Crucero convencional (no adaptativo)"],
      ["Inyección", "Electrónica Keihin 46 mm"],
      ["Barras invertidas", "WP XPLOR 48 mm · recorrido 300 mm / 310 mm"],
      ["Pantalla y conectividad", "TFT 4,2\" · Bluetooth y app Akira Ride"],
      ["Marchas", "6 velocidades"],
      ["Refrigeración", "Líquida"],
    ],
  },
];

export const categories: ("Todas" | Category)[] = [
  "Todas",
  "Naked",
  "Adventure",
  "Motocross",
  "Enduro",
];

export const cities = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Bucaramanga",
];

export const colors = ["Blanco / Rojo", "Negro mate", "Gris titanio"];

export const paymentMethods = [
  "Contado",
  "Financiación 36 meses",
  "Leasing",
];
