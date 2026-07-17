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
  name: ["Nombre", "nombre", "Name", "name", "NOMBRE", "Cliente", "cliente", "CLIENTE", "Contacto", "contacto"],
  phone: ["Telefono", "telefono", "Teléfono", "teléfono", "Phone", "phone", "TELEFONO", "Tel", "tel", "Celular", "celular", "Móvil", "movil", "Movil", "Número", "numero", "Numero", "Whatsapp", "whatsapp", "WA"],
  email: [
    "Email",
    "email",
    "Correo",
    "correo",
    "E-mail",
    "e-mail",
    "Mail",
    "mail",
    "CORREO",
    "E-Mail",
    "Correo Electronico",
    "Correo Electrónico",
    "correo electronico",
    "correo electrónico",
    "Direccion de correo",
    "Dirección de correo",
    "Email Address",
    "email address",
  ],
  city: ["Ciudad", "ciudad", "City", "city", "CIUDAD", "Comuna", "comuna", "COMUNA", "Region", "Región", "region"],
  address: ["Direccion", "direccion", "Dirección", "dirección", "Address", "address", "DIRECCION", "Dir", "dir", "Domicilio", "domicilio"],
  plan: ["Plan", "plan", "PLAN", "Plan Solicitado", "plan solicitado", "Producto", "producto"],
  status: ["Estado", "estado", "Status", "status", "ESTADO", "Situación", "situacion"],
};

function sanitizeString(input, maxLength) {
  return String(input || "")
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, "");
}

function normalizePhone(input) {
  if (!input) return "";
  // Remueve todo excepto dígitos y el signo +
  const digits = String(input).replace(/[^\d+]/g, "");
  // Si empieza con +56 o 56, lo dejamos; si empieza con 9, agregamos 56
  if (digits.startsWith("+56")) return digits.slice(1);
  if (digits.startsWith("56")) return digits;
  if (digits.startsWith("9")) return `56${digits}`;
  if (digits.startsWith("0")) return `56${digits.slice(1)}`;
  return digits;
}

function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function findHeaderIndex(headers, candidates) {
  for (const candidate of candidates) {
    const normalizedCandidate = candidate.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const idx = headers.findIndex((h) => {
      const normalized = String(h || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return normalized === normalizedCandidate;
    });
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseCsvBuffer(buffer) {
  const text = buffer.toString("utf-8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Detecta delimitador por coma o punto-y-coma
  const delimiter = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";
  return lines.map((line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

export async function parseLeadsFromExcel(buffer, fileTypeOrOptions = "xlsx", options = {}) {
  let fileType = "xlsx";
  let assignedTo = "";
  let sellerId = null;

  if (typeof fileTypeOrOptions === "object" && fileTypeOrOptions !== null) {
    // Backwards compatibility: parseLeadsFromExcel(buffer, { assignedTo, sellerId })
    options = fileTypeOrOptions;
    fileType = "xlsx";
  } else if (typeof fileTypeOrOptions === "string") {
    fileType = fileTypeOrOptions;
  }

  if (options) {
    assignedTo = options.assignedTo || "";
    sellerId = options.sellerId || null;
  }

  // Si se recibe un Buffer/ArrayBuffer, intenta adivinar el tipo por la firma mágica de ZIP (xlsx)
  if (Buffer.isBuffer(buffer) || buffer instanceof ArrayBuffer || buffer instanceof Uint8Array) {
    const peek = Buffer.from(buffer.slice(0, 4));
    const isZip = peek[0] === 0x50 && peek[1] === 0x4b;
    if (isZip && fileType === "csv") fileType = "xlsx";
    if (!isZip && fileType === "xlsx") fileType = "csv";
  }

  fileType = fileType === "csv" ? "csv" : "xlsx";
  let rows = [];

  if (fileType === "csv") {
    rows = parseCsvBuffer(buffer);
  } else {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets.find((ws) => ws.rowCount >= 2) || workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("El archivo no contiene hojas de cálculo");
    }

    const totalRows = worksheet.rowCount;
    if (totalRows < 2) {
      return { leads: [], skipped: 0, total: 0 };
    }

    for (let rowNumber = 1; rowNumber <= totalRows; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const values = row.values.slice(1).map((v) => {
        if (v === null || v === undefined) return "";
        if (typeof v === "object" && v.text !== undefined) return String(v.text).trim();
        return String(v).trim();
      });
      rows.push(values);
    }
  }

  if (rows.length < 2) {
    return { leads: [], skipped: 0, total: 0 };
  }

  const headers = rows[0];

  const columns = {};
  for (const [key, candidates] of Object.entries(COLUMN_MAP)) {
    columns[key] = findHeaderIndex(headers, candidates);
  }

  // Fallback: si no hay nombre/teléfono identificados, usa la primera y segunda columna
  if (columns.name === -1) columns.name = 0;
  if (columns.phone === -1) columns.phone = 1;

  const leads = [];
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const getValue = (key) => {
      const idx = columns[key];
      if (idx === -1 || idx >= row.length) return "";
      const value = row[idx];
      if (value === null || value === undefined) return "";
      if (typeof value === "object" && value.text !== undefined) return String(value.text).trim();
      return String(value).trim();
    };

    let name = sanitizeString(getValue("name"), MAX_LENGTHS.name);
    let phone = normalizePhone(getValue("phone"));
    const emailRaw = getValue("email");
    let email = emailRaw ? sanitizeString(emailRaw, MAX_LENGTHS.email) : "";
    const city = sanitizeString(getValue("city"), MAX_LENGTHS.city);
    const address = sanitizeString(getValue("address"), MAX_LENGTHS.address);
    const plan = sanitizeString(getValue("plan"), MAX_LENGTHS.plan);
    const statusRaw = getValue("status");

    // Fallback si la fila tiene columnas vacías por delante
    if (!name && row.length > 0) name = sanitizeString(row[0], MAX_LENGTHS.name);
    if (!phone && row.length > 1) phone = normalizePhone(row[1]);

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

  return { leads, skipped, total: rows.length - 1 };
}
