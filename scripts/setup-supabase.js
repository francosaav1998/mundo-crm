require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL || "admin@mundo-crm.local";
const adminPassword = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

if (!adminPassword) {
  console.error("Falta ADMIN_PASSWORD para crear el usuario administrador");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Create public bucket
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket("assets", {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
  });

  if (bucketError) {
    if (bucketError.message.includes("already exists")) {
      console.log("✅ Bucket 'assets' ya existe");
    } else {
      console.error("❌ Error creando bucket:", bucketError.message);
      process.exit(1);
    }
  } else {
    console.log("✅ Bucket 'assets' creado:", bucket.name);
  }

  // Create admin user
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (userError) {
    if (userError.message.includes("already been registered")) {
      console.log("✅ Usuario admin ya existe");
    } else {
      console.error("❌ Error creando usuario:", userError.message);
      process.exit(1);
    }
  } else {
    console.log("✅ Usuario admin creado:", user.user.email);
  }
}

main().catch((err) => {
  console.error("❌ Error inesperado:", err.message);
  process.exit(1);
});
