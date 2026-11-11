import { bikes, type Category, type Bike } from "./data";

export function filterBikesByCategory(
  allBikes: Bike[],
  category: "Todas" | Category
): Bike[] {
  if (category === "Todas") {
    return allBikes;
  }
  return allBikes.filter((bike) => bike.cat === category);
}

export function findBikeBySlug(allBikes: Bike[], slug: string): Bike | undefined {
  return allBikes.find((bike) => bike.slug === slug);
}

export function toggleCompareList(
  currentList: string[],
  bikeName: string,
  maxCompare = 2
): string[] {
  if (currentList.includes(bikeName)) {
    return currentList.filter((name) => name !== bikeName);
  }
  return [...currentList, bikeName].slice(-maxCompare);
}

export function calculatePowerToWeightRatio(hpStr: string, kgStr: string): number {
  const hp = parseFloat(hpStr.replace(/[^0-9.]/g, ""));
  const kg = parseFloat(kgStr.replace(/[^0-9.]/g, ""));
  if (isNaN(hp) || isNaN(kg) || kg <= 0) return 0;
  return Number((hp / kg).toFixed(2));
}

export interface BuyerFormInput {
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  terminos: boolean;
}

export function validateBuyerForm(input: BuyerFormInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.nombre.trim() || input.nombre.trim().length < 2) {
    errors.nombre = "Escribe tu nombre completo";
  }
  if (!input.documento.trim() || !/^[0-9]{5,12}$/.test(input.documento.trim())) {
    errors.documento = "Documento inválido (solo números de 5 a 12 dígitos)";
  }
  if (
    !input.email.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())
  ) {
    errors.email = "Correo inválido (ej. nombre@correo.com)";
  }
  if (
    !input.telefono.trim() ||
    !/^[0-9+ ]{7,15}$/.test(input.telefono.trim())
  ) {
    errors.telefono = "Teléfono inválido (ej. +57 300 1234567)";
  }
  if (!input.ciudad) {
    errors.ciudad = "Elige una ciudad";
  }
  if (!input.direccion.trim() || input.direccion.trim().length < 5) {
    errors.direccion = "Escribe tu dirección de entrega";
  }
  if (!input.terminos) {
    errors.terminos = "Debes aceptar los términos y condiciones";
  }
  return errors;
}

export interface RegisterInput {
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  usuario: string;
  email: string;
  documento: string;
  telefono: string;
  ciudad: string;
  password: string;
  confirmPassword: string;
  terminos: boolean;
}

export interface LoginInput {
  identifier: string; // usuario o correo electrónico
  password: string;
}

export interface UserProfile {
  id: string;
  riderCode: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  nombreCompleto: string;
  usuario: string;
  email: string;
  documento: string;
  telefono: string;
  ciudad: string;
  createdAt: string;
}

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]{2,40}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOC_REGEX = /^[0-9]{5,12}$/;
const TEL_REGEX = /^[0-9+ ]{7,15}$/;

export function validateRegisterStep1(
  input: Pick<
    RegisterInput,
    "primerNombre" | "segundoNombre" | "primerApellido" | "segundoApellido" | "usuario"
  >
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Primer Nombre (obligatorio, solo letras/texto)
  if (!input.primerNombre.trim()) {
    errors.primerNombre = "El primer nombre es obligatorio";
  } else if (!NAME_REGEX.test(input.primerNombre.trim())) {
    errors.primerNombre = "Solo letras y espacios (mínimo 2 caracteres)";
  }

  // Segundo Nombre (opcional)
  if (input.segundoNombre && input.segundoNombre.trim().length > 0) {
    if (!NAME_REGEX.test(input.segundoNombre.trim())) {
      errors.segundoNombre = "El segundo nombre solo debe contener letras";
    }
  }

  // Primer Apellido (obligatorio, solo letras/texto)
  if (!input.primerApellido.trim()) {
    errors.primerApellido = "El primer apellido es obligatorio";
  } else if (!NAME_REGEX.test(input.primerApellido.trim())) {
    errors.primerApellido = "Solo letras y espacios (mínimo 2 caracteres)";
  }

  // Segundo Apellido (opcional)
  if (input.segundoApellido && input.segundoApellido.trim().length > 0) {
    if (!NAME_REGEX.test(input.segundoApellido.trim())) {
      errors.segundoApellido = "El segundo apellido solo debe contener letras";
    }
  }

  // Usuario (obligatorio, alfanumérico)
  if (!input.usuario.trim()) {
    errors.usuario = "El nombre de usuario es obligatorio";
  } else if (!USERNAME_REGEX.test(input.usuario.trim())) {
    errors.usuario = "Usuario debe tener entre 3 y 20 caracteres (sin espacios ni símbolos raros)";
  }

  return errors;
}

export function validateRegisterStep2(
  input: Pick<RegisterInput, "documento" | "telefono" | "ciudad">
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Documento / Cédula (tipo numérico)
  if (!input.documento.trim()) {
    errors.documento = "El número de documento es obligatorio";
  } else if (!DOC_REGEX.test(input.documento.trim())) {
    errors.documento = "Documento no válido (solo números de 5 a 12 dígitos)";
  }

  // Teléfono móvil (tipo numérico / tel)
  if (!input.telefono.trim()) {
    errors.telefono = "El número de teléfono móvil es obligatorio";
  } else if (!TEL_REGEX.test(input.telefono.trim())) {
    errors.telefono = "Número telefónico no válido (ej. +57 300 1234567)";
  }

  // Ciudad
  if (!input.ciudad) {
    errors.ciudad = "Selecciona tu ciudad de residencia";
  }

  return errors;
}

export function validateRegisterStep3(
  input: Pick<RegisterInput, "email" | "password" | "confirmPassword" | "terminos">
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Correo electrónico (tipo email)
  if (!input.email.trim()) {
    errors.email = "El correo electrónico es obligatorio";
  } else if (!EMAIL_REGEX.test(input.email.trim())) {
    errors.email = "Formato de correo no válido (ej. piloto@akiramotors.com)";
  }

  // Contraseña
  if (!input.password) {
    errors.password = "La contraseña es obligatoria";
  } else if (input.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  // Confirmar Contraseña
  if (!input.confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña";
  } else if (input.confirmPassword !== input.password) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  // Términos
  if (!input.terminos) {
    errors.terminos = "Debes aceptar los términos y condiciones de Akira Motors";
  }

  return errors;
}

export function validateRegisterForm(input: RegisterInput): Record<string, string> {
  return {
    ...validateRegisterStep1(input),
    ...validateRegisterStep2(input),
    ...validateRegisterStep3(input),
  };
}

export function validateLoginForm(input: LoginInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.identifier.trim()) {
    errors.identifier = "Ingresa tu usuario o correo electrónico";
  } else if (input.identifier.trim().length < 3) {
    errors.identifier = "Identificador demasiado corto";
  }

  if (!input.password) {
    errors.password = "Ingresa tu contraseña";
  }

  return errors;
}

export type RidingMode = "eco" | "touring" | "sport";

export interface TripMetricsResult {
  distanceKm: number;
  durationMinutes: number;
  durationFormatted: string;
  litersRequired: number;
  gallonsRequired: number;
  tankPercentage: number;
  tanksRequired: number;
  reachesWithoutRefuel: boolean;
  remainingLitersInTank: number;
  refuelStopsNeeded: number;
  estimatedCostCop: number;
  modeFactor: number;
  consumptionKmPerLiter: number;
}

export function calculateTripMetrics(
  distanceKm: number,
  fuelConsumptionLPer100Km: number,
  tankCapacityLiters: number,
  mode: RidingMode = "touring",
  fuelPricePerGallonCop = 15500
): TripMetricsResult {
  const modeFactorMap: Record<RidingMode, number> = {
    eco: 0.88,
    touring: 1.0,
    sport: 1.15,
  };

  const modeFactor = modeFactorMap[mode] ?? 1.0;
  const effectiveConsumptionL100 = fuelConsumptionLPer100Km * modeFactor;
  const litersRequired = Number(((distanceKm * effectiveConsumptionL100) / 100).toFixed(2));
  const gallonsRequired = Number((litersRequired / 3.78541).toFixed(2));
  const tanksRequired = Number((litersRequired / Math.max(0.1, tankCapacityLiters)).toFixed(2));
  const tankPercentage = Math.round((litersRequired / Math.max(0.1, tankCapacityLiters)) * 100);
  const reachesWithoutRefuel = litersRequired <= tankCapacityLiters;
  const remainingLitersInTank = reachesWithoutRefuel
    ? Number((tankCapacityLiters - litersRequired).toFixed(2))
    : 0;
  const refuelStopsNeeded = reachesWithoutRefuel
    ? 0
    : Math.max(1, Math.ceil(litersRequired / tankCapacityLiters) - 1);
  const estimatedCostCop = Math.round(gallonsRequired * fuelPricePerGallonCop);

  // Speed assumptions for motorcycles depending on mode
  const avgSpeedKmh = mode === "sport" ? 85 : mode === "eco" ? 65 : 75;
  const rawMinutes = Math.round((distanceKm / avgSpeedKmh) * 60);
  const durationMinutes = Math.max(15, rawMinutes);
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationFormatted = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;

  const consumptionKmPerLiter = Number((100 / effectiveConsumptionL100).toFixed(2));

  return {
    distanceKm,
    durationMinutes,
    durationFormatted,
    litersRequired,
    gallonsRequired,
    tankPercentage,
    tanksRequired,
    reachesWithoutRefuel,
    remainingLitersInTank,
    refuelStopsNeeded,
    estimatedCostCop,
    modeFactor,
    consumptionKmPerLiter,
  };
}

export interface RouteLocation {
  name: string;
  lat: number;
  lng: number;
  description?: string;
}

export const POPULAR_LOCATIONS: Record<string, RouteLocation> = {
  "Bogotá": { name: "Bogotá, D.C.", lat: 4.711, lng: -74.0721, description: "Capital a 2.600 msnm" },
  "Medellín": { name: "Medellín, Antioquia", lat: 6.2442, lng: -75.5812, description: "Valle de Aburrá" },
  "Cali": { name: "Cali, Valle del Cauca", lat: 3.4516, lng: -76.532, description: "Capital del Valle" },
  "Barranquilla": { name: "Barranquilla, Atlántico", lat: 10.9685, lng: -74.7813, description: "Costa Caribe" },
  "Cartagena": { name: "Cartagena, Bolívar", lat: 10.391, lng: -75.4794, description: "Ciudad amurallada" },
  "Bucaramanga": { name: "Bucaramanga, Santander", lat: 7.1254, lng: -73.1198, description: "Ciudad Bonita" },
  "Pereira": { name: "Pereira, Risaralda", lat: 4.8133, lng: -75.6961, description: "Eje Cafetero" },
  "Manizales": { name: "Manizales, Caldas", lat: 5.0689, lng: -75.5174, description: "Ciudad de las Puertas Abiertas" },
  "Tunja": { name: "Tunja, Boyacá", lat: 5.5353, lng: -73.3678, description: "Altiplano cundiboyacense" },
  "Villa de Leyva": { name: "Villa de Leyva, Boyacá", lat: 5.6324, lng: -73.5284, description: "Ruta colonial y curvas" },
  "Guatapé": { name: "Guatapé, Antioquia", lat: 6.2341, lng: -75.1584, description: "Curvas reviradas y embalse" },
  "Santa Marta": { name: "Santa Marta, Magdalena", lat: 11.2408, lng: -74.199, description: "Carretera costera del Caribe" },
  "San Gil": { name: "San Gil, Santander", lat: 6.5562, lng: -73.1368, description: "Cañón del Chicamocha" },
  "Salento": { name: "Salento, Quindío", lat: 4.6375, lng: -75.5703, description: "Ruta cafetera y Valle de Cocora" },
  "Villavicencio": { name: "Villavicencio, Meta", lat: 4.142, lng: -73.6266, description: "Puerta al Llano" },
  "Ibagué": { name: "Ibagué, Tolima", lat: 4.4389, lng: -75.2322, description: "Capital musical" },
  "Armenia": { name: "Armenia, Quindío", lat: 4.5339, lng: -75.6811, description: "Corazón del Eje Cafetero" },
  "Girardot": { name: "Girardot, Cundinamarca", lat: 4.3015, lng: -74.8064, description: "Ruta cálida del Magdalena" },
  "Pasto": { name: "Pasto, Nariño", lat: 1.2136, lng: -77.2811, description: "Ruta del Galeras" },
  "Popayán": { name: "Popayán, Cauca", lat: 2.4419, lng: -76.6063, description: "Ciudad Blanca" },
  "Cúcuta": { name: "Cúcuta, Norte de Santander", lat: 7.8939, lng: -72.5078, description: "Frontera Oriental" },
  "Montería": { name: "Montería, Córdoba", lat: 8.755, lng: -75.887, description: "Valle del Sinú" },
  "Valledupar": { name: "Valledupar, Cesar", lat: 10.4631, lng: -73.2532, description: "Tierra de acordeones" },
  "Neiva": { name: "Neiva, Huila", lat: 2.9273, lng: -75.2819, description: "Desierto de la Tatacoa" },
  "Sincelejo": { name: "Sincelejo, Sucre", lat: 9.3047, lng: -75.3978, description: "Sabanas de Sucre" },
  "Riohacha": { name: "Riohacha, La Guajira", lat: 11.5444, lng: -72.9072, description: "Entrada al desierto de La Guajira" },
  "Melgar": { name: "Melgar, Tolima", lat: 4.2047, lng: -74.6408, description: "Paseo de fin de semana" },
  "Barichara": { name: "Barichara, Santander", lat: 6.6349, lng: -73.2235, description: "Pueblito más lindo de Colombia" },
  "Doradal": { name: "Doradal, Antioquia", lat: 5.9083, lng: -74.7297, description: "Ruta autopista Medellín-Bogotá" },
  "Zipaquirá": { name: "Zipaquirá, Cundinamarca", lat: 5.0256, lng: -74.0042, description: "Catedral de Sal" },
  "Yopal": { name: "Yopal, Casanare", lat: 5.3378, lng: -72.3959, description: "Corazón llanero" },
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function resolveColombianLocation(query: string): RouteLocation | null {
  if (!query || !query.trim()) return null;
  const clean = normalizeText(query);

  // Exact or contains match
  for (const [key, loc] of Object.entries(POPULAR_LOCATIONS)) {
    const normKey = normalizeText(key);
    const normName = normalizeText(loc.name);
    if (clean === normKey || clean.includes(normKey) || normKey.includes(clean)) {
      return loc;
    }
    if (clean === normName || clean.includes(normName) || normName.includes(clean)) {
      return loc;
    }
  }

  // Fallback: check parts separated by comma
  const parts = clean.split(/[,.-]/).map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    for (const [key, loc] of Object.entries(POPULAR_LOCATIONS)) {
      const normKey = normalizeText(key);
      if (part === normKey || part.includes(normKey) || normKey.includes(part)) {
        return loc;
      }
    }
  }

  return null;
}

export interface ScenicRoute {
  id: string;
  title: string;
  origin: string;
  destination: string;
  distanceKm: number;
  durationMinutes: number;
  terrainType: string;
  badge: string;
}

// Exactly 4 predefined scenic routes as requested
export const SCENIC_ROUTES: ScenicRoute[] = [
  {
    id: "bog-vdl",
    title: "Ruta Colonial Boyacense",
    origin: "Bogotá",
    destination: "Villa de Leyva",
    distanceKm: 165,
    durationMinutes: 165,
    terrainType: "Asfalto de montaña con curvas medias",
    badge: "Ideal Naked & Sport",
  },
  {
    id: "med-gtp",
    title: "Circuito del Oriente & Represa",
    origin: "Medellín",
    destination: "Guatapé",
    distanceKm: 79,
    durationMinutes: 80,
    terrainType: "Curvas cerradas y subidas continuas",
    badge: "Pura agilidad",
  },
  {
    id: "baq-smr",
    title: "Vía Costera del Caribe",
    origin: "Barranquilla",
    destination: "Santa Marta",
    distanceKm: 105,
    durationMinutes: 90,
    terrainType: "Recta plana a nivel del mar",
    badge: "Velocidad constante",
  },
  {
    id: "cal-sle",
    title: "Travesía Eje Cafetero",
    origin: "Cali",
    destination: "Salento",
    distanceKm: 198,
    durationMinutes: 195,
    terrainType: "Valle y ascenso empinado",
    badge: "Adventure & Touring",
  },
];

export function estimateRoadDistanceKm(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): number {
  const R = 6371;
  const dLat = ((destLat - originLat) * Math.PI) / 180;
  const dLng = ((destLng - originLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((originLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  return Number((straightLine * 1.28).toFixed(1));
}
