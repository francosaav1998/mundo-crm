const { spawn, exec } = require("child_process");
const http = require("http");

const PORT = process.env.PORT || 3000;
const HOST = `http://localhost:${PORT}`;
const DASHBOARD = `${HOST}/dashboard`;
const LANDING = `${HOST}/`;

function openBrowser(url) {
  const command = process.platform === "win32"
    ? `start "" "${url}"`
    : process.platform === "darwin"
    ? `open "${url}"`
    : `xdg-open "${url}"`;

  exec(command, { windowsHide: true }, (err) => {
    if (err) {
      console.log(`\n⚠️ No se pudo abrir el navegador automáticamente. Abrí manualmente: ${url}`);
    }
  });
}

function waitForServer(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve();
          } else {
            retry();
          }
        })
        .on("error", retry);
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error("El servidor no respondió a tiempo"));
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  });
}

function main() {
  const openDashboard = process.argv.includes("--dashboard");
  const openLanding = process.argv.includes("--landing") || !openDashboard;
  const targetUrl = openDashboard ? DASHBOARD : LANDING;

  const child = spawn(process.platform === "win32" ? "cmd" : "sh", [
    process.platform === "win32" ? "/c" : "-c",
    `npx next dev --port ${PORT}`,
  ], { stdio: "inherit" });

  waitForServer(HOST)
    .then(() => {
      console.log(`\n✅ Servidor listo en ${HOST}`);
      console.log(`🌐 Abriendo ${openDashboard ? "dashboard" : "landing"}...`);
      openBrowser(targetUrl);
    })
    .catch((err) => {
      console.error("❌", err.message);
      child.kill();
      process.exit(1);
    });

  child.on("exit", (code) => process.exit(code));
}

main();
