import ExcelJS from "exceljs";

const VALID_STATUSES = [
  "Nuevo",
  "No Contesta",
  "Contactado",
  "En Proceso",
  "Con Factibilidad",
  "Sin Factibilidad",
];

const MAX_LENGTHS = {
  name: 200,
  phone: 100,
  email: 200,
  city: 100,
  address: 300,
  plan: 100,
};

const COLUMN_MAP = {
  name: ["Nombre", "name", "NOMBRE"],
  phone: ["Telefono", "phone", "TELEFONO", "Teléfono", "Tel"],
  email: ["Email", "email", "Correo", "E-mail"],
  city: ["Ciudad", "city", "CIUDAD", "Comuna", "comuna"],
  address: ["Direccion", "address", "DIRECCION", "Dirección", "Dir"],
  plan: ["Plan", "plan", "PLAN"],
  status: ["Estado", "status", "ESTADO"],
};

function sanitizeString(input, maxLength) {
  return String(input || "")
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function findHeaderIndex(headers, candidates) {
  for (const candidate of candidates) {
    const idx = headers.findIndex(
      (h) => String(h || "").trim().toLowerCase() === candidate.toLowerCase()
    );
    if (idx !== -1) return idx;
  }
  return -1;
}

export async function parseLeadsFromExcel(buffer, { assignedTo = "", sellerId = null } = {}) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("El archivo no contiene hojas de cálculo");
  }

  const totalRows = worksheet.rowCount;
  if (totalRows < 2) {
    return { leads: [], skipped: 0, total: 0 };
  }

  const headerRow = worksheet.getRow(1);
  const headers = headerRow.values.map((v) => String(v || "").trim());

  const columns = {};
  for (const [key, candidates] of Object.entries(COLUMN_MAP)) {
    columns[key] = findHeaderIndex(headers, candidates);
  }

  const leads = [];
  let skipped = 0;

  for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const getValue = (key) => {
      const idx = columns[key];
      if (idx === -1) return "";
      const cell = row.getCell(idx);
      const value = cell.value;
      if (value === null || value === undefined) return "";
      if (typeof value === "object" && value.text !== undefined) return String(value.text).trim();
      return String(value).trim();
    };

    const name = sanitizeString(getValue("name"), MAX_LENGTHS.name);
    const phone = sanitizeString(getValue("phone"), MAX_LENGTHS.phone);
    const emailRaw = getValue("email");
    let email = emailRaw ? sanitizeString(emailRaw, MAX_LENGTHS.email) : "";
    const city = sanitizeString(getValue("city"), MAX_LENGTHS.city);
    const address = sanitizeString(getValue("address"), MAX_LENGTHS.address);
    const plan = sanitizeString(getValue("plan"), MAX_LENGTHS.plan);
    const statusRaw = getValue("status");

    if (!name || !phone) {
      skipped++;
      continue;
    }

    if (email && !isValidEmail(email)) {
      email = "";
    }

    const status = VALID_STATUSES.includes(statusRaw) ? statusRaw : "Nuevo";

    const lead = {
      name,
      phone,
      email,
      city: city || "No especificada",
      address: address || "No especificada",
      plan: plan || "Sin Plan",
      status,
      assignedTo,
    };
    if (sellerId) lead.sellerId = sellerId;
    leads.push(lead);
  }

  return { leads, skipped, total: totalRows - 1 };
}
