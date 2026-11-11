import test from "node:test";
import assert from "node:assert/strict";
import {
  filterBikesByCategory,
  findBikeBySlug,
  toggleCompareList,
  calculatePowerToWeightRatio,
  validateBuyerForm,
  calculateTripMetrics,
  validateRegisterForm,
  validateRegisterStep1,
  validateRegisterStep2,
  validateRegisterStep3,
  validateLoginForm,
} from "./logic";
import { bikes } from "./data";

test("filterBikesByCategory returns all bikes when category is Todas", () => {
  const all = filterBikesByCategory(bikes, "Todas");
  assert.equal(all.length, bikes.length);
});

test("filterBikesByCategory filters correctly by specific category", () => {
  const nakedBikes = filterBikesByCategory(bikes, "Naked");
  assert.equal(nakedBikes.length, 1);
  assert.equal(nakedBikes[0].name, "AKR 1390");

  const adventureBikes = filterBikesByCategory(bikes, "Adventure");
  assert.equal(adventureBikes.length, 1);
  assert.equal(adventureBikes[0].name, "AKR 990R");
});

test("findBikeBySlug locates bike by exact slug and verifies updated tech specs", () => {
  const bike = findBikeBySlug(bikes, "akr-1390");
  assert.ok(bike);
  assert.equal(bike?.name, "AKR 1390");
  assert.equal(bike?.hp, "180 HP");
  assert.ok(bike?.tech && bike.tech.length >= 7);
  assert.equal(bike?.tech[0][0], "ABS");
  assert.equal(bike?.tech[0][1], "Bosch 10.3 Cornering ABS con modo Supermoto");

  const notFound = findBikeBySlug(bikes, "non-existent-bike");
  assert.equal(notFound, undefined);
});

test("toggleCompareList adds, caps at max 2, and removes correctly", () => {
  let list: string[] = [];
  list = toggleCompareList(list, "AKR 1390");
  assert.deepEqual(list, ["AKR 1390"]);

  list = toggleCompareList(list, "AKR 990R");
  assert.deepEqual(list, ["AKR 1390", "AKR 990R"]);

  // Adding 3rd drops the first to keep max 2
  list = toggleCompareList(list, "AKR 790");
  assert.deepEqual(list, ["AKR 990R", "AKR 790"]);

  // Clicking an already selected item removes it
  list = toggleCompareList(list, "AKR 790");
  assert.deepEqual(list, ["AKR 990R"]);
});

test("calculatePowerToWeightRatio parses strings and calculates ratio accurately", () => {
  const ratio = calculatePowerToWeightRatio("180 HP", "199 kg");
  assert.equal(ratio, 0.9);

  const mxRatio = calculatePowerToWeightRatio("63 HP", "104 kg");
  assert.equal(mxRatio, 0.61);
});

test("validateBuyerForm validates all required fields, document regex and terminos", () => {
  const emptyResult = validateBuyerForm({
    nombre: "",
    documento: "",
    email: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    terminos: false,
  });
  assert.ok(emptyResult.nombre);
  assert.ok(emptyResult.documento);
  assert.ok(emptyResult.email);
  assert.ok(emptyResult.telefono);
  assert.ok(emptyResult.ciudad);
  assert.ok(emptyResult.direccion);
  assert.ok(emptyResult.terminos);

  const invalidDoc = validateBuyerForm({
    nombre: "Juan Perez",
    documento: "abc12",
    email: "correo@invalido",
    telefono: "123",
    ciudad: "Bogotá",
    direccion: "Calle 100",
    terminos: true,
  });
  assert.ok(invalidDoc.documento);
  assert.ok(invalidDoc.email);
  assert.ok(invalidDoc.telefono);
  assert.equal(invalidDoc.nombre, undefined);
  assert.equal(invalidDoc.ciudad, undefined);
  assert.equal(invalidDoc.direccion, undefined);
  assert.equal(invalidDoc.terminos, undefined);

  const validResult = validateBuyerForm({
    nombre: "Juan Perez",
    documento: "1020304050",
    email: "juan@example.com",
    telefono: "+57 300 1234567",
    ciudad: "Bogotá",
    direccion: "Carrera 15 # 93-60",
    terminos: true,
  });
  assert.deepEqual(validResult, {});
});

test("calculateTripMetrics computes fuel, tank percentage and autonomy accurately", () => {
  // AKR 1390: 17.5 L tank, 6.5 L / 100 km
  // 100 km trip in touring mode
  const res100 = calculateTripMetrics(100, 6.5, 17.5, "touring");
  assert.equal(res100.litersRequired, 6.5);
  assert.equal(res100.reachesWithoutRefuel, true);
  assert.equal(res100.refuelStopsNeeded, 0);
  assert.equal(res100.remainingLitersInTank, 11);
  assert.equal(res100.tankPercentage, 37);

  // 500 km trip (exceeds single tank)
  const res500 = calculateTripMetrics(500, 6.5, 17.5, "touring");
  assert.equal(res500.litersRequired, 32.5);
  assert.equal(res500.reachesWithoutRefuel, false);
  assert.equal(res500.refuelStopsNeeded, 1);
  assert.equal(res500.remainingLitersInTank, 0);

  // Sport mode increases consumption by 15%
  const resSport = calculateTripMetrics(100, 6.5, 17.5, "sport");
  assert.equal(resSport.litersRequired, 7.47);

  // Eco mode decreases consumption by 12%
  const resEco = calculateTripMetrics(100, 6.5, 17.5, "eco");
  assert.equal(resEco.litersRequired, 5.72); // 100 * (6.5 * 0.88) / 100 = 5.72
});

test("validateRegisterForm validates all fields: names, user, email, numbers, passwords, terminos", () => {
  // Empty input
  const emptyRes = validateRegisterForm({
    primerNombre: "",
    primerApellido: "",
    usuario: "",
    email: "",
    documento: "",
    telefono: "",
    ciudad: "",
    password: "",
    confirmPassword: "",
    terminos: false,
  });
  assert.ok(emptyRes.primerNombre);
  assert.ok(emptyRes.primerApellido);
  assert.ok(emptyRes.usuario);
  assert.ok(emptyRes.email);
  assert.ok(emptyRes.documento);
  assert.ok(emptyRes.telefono);
  assert.ok(emptyRes.ciudad);
  assert.ok(emptyRes.password);
  assert.ok(emptyRes.confirmPassword);
  assert.ok(emptyRes.terminos);

  // Mismatched passwords and invalid formats
  const invalidRes = validateRegisterForm({
    primerNombre: "1234",
    primerApellido: "5678",
    usuario: "user with spaces",
    email: "not-an-email",
    documento: "doc_letras",
    telefono: "abc",
    ciudad: "Bogotá",
    password: "pass",
    confirmPassword: "different_pass",
    terminos: true,
  });
  assert.ok(invalidRes.primerNombre);
  assert.ok(invalidRes.primerApellido);
  assert.ok(invalidRes.usuario);
  assert.ok(invalidRes.email);
  assert.ok(invalidRes.documento);
  assert.ok(invalidRes.telefono);
  assert.ok(invalidRes.password);
  assert.ok(invalidRes.confirmPassword);

  // Valid input
  const validRes = validateRegisterForm({
    primerNombre: "Carlos",
    segundoNombre: "Eduardo",
    primerApellido: "Gómez",
    segundoApellido: "Restrepo",
    usuario: "carlos_gomez",
    email: "carlos@akiramotors.com",
    documento: "1020304050",
    telefono: "+57 300 1234567",
    ciudad: "Medellín",
    password: "securePassword123",
    confirmPassword: "securePassword123",
    terminos: true,
  });
  assert.deepEqual(validRes, {});
});

test("validateLoginForm validates user identifier and password", () => {
  const emptyRes = validateLoginForm({ identifier: "", password: "" });
  const validRes = validateLoginForm({ identifier: "piloto_akira", password: "akira2026" });
  assert.deepEqual(validRes, {});
});

test("validateRegisterStep1, Step2, and Step3 work independently", () => {
  // Step 1: Names and username
  const step1Err = validateRegisterStep1({
    primerNombre: "",
    primerApellido: "",
    usuario: "ab",
  });
  assert.ok(step1Err.primerNombre);
  assert.ok(step1Err.primerApellido);
  assert.ok(step1Err.usuario);

  const step1Ok = validateRegisterStep1({
    primerNombre: "Tetsuo",
    segundoNombre: "Kenji",
    primerApellido: "Shima",
    segundoApellido: "",
    usuario: "tetsuo_akira",
  });
  assert.deepEqual(step1Ok, {});

  // Step 2: Document, phone, city
  const step2Err = validateRegisterStep2({
    documento: "letras",
    telefono: "12",
    ciudad: "",
  });
  assert.ok(step2Err.documento);
  assert.ok(step2Err.telefono);
  assert.ok(step2Err.ciudad);

  const step2Ok = validateRegisterStep2({
    documento: "1020304050",
    telefono: "+57 315 1234567",
    ciudad: "Bogotá",
  });
  assert.deepEqual(step2Ok, {});

  // Step 3: Email, password, terminos
  const step3Err = validateRegisterStep3({
    email: "correo_malo",
    password: "123",
    confirmPassword: "456",
    terminos: false,
  });
  assert.ok(step3Err.email);
  assert.ok(step3Err.password);
  assert.ok(step3Err.confirmPassword);
  assert.ok(step3Err.terminos);

  const step3Ok = validateRegisterStep3({
    email: "tetsuo@akira.com",
    password: "securePassword123",
    confirmPassword: "securePassword123",
    terminos: true,
  });
  assert.deepEqual(step3Ok, {});
});

