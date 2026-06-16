#!/usr/bin/env node

const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const backendDir = path.join(rootDir, "Trash_Dash_backend");
const frontendDir = path.join(rootDir, "Trash_Dash_frontend");

const argv = process.argv.slice(2);

function hasFlag(name) {
  return argv.includes(name);
}

function readValue(name) {
  const prefix = `${name}=`;
  const inline = argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = argv.indexOf(name);
  if (index >= 0 && argv[index + 1] && !argv[index + 1].startsWith("--")) {
    return argv[index + 1];
  }
  return "";
}

const options = {
  setup: hasFlag("--setup"),
  tunnel: hasFlag("--tunnel"),
  web: hasFlag("--web"),
  android: hasFlag("--android"),
  frontendOnly: hasFlag("--frontend-only"),
  backendOnly: hasFlag("--backend-only"),
  prepareOnly: hasFlag("--prepare-only"),
  skipSeed: hasFlag("--skip-seed"),
  help: hasFlag("--help") || hasFlag("-h"),
  ip: readValue("--ip") || process.env.TRASHDASH_HOST_IP || ""
};

if (options.help) {
  printHelp();
  process.exit(0);
}

function printHelp() {
  console.log(`
TrashDash cross-platform launcher

Uso:
  node Trash_Dash_frontend/start-trashdash.js --setup
                              Installa dipendenze, prepara DB e avvia backend + frontend
  node Trash_Dash_frontend/start-trashdash.js
                              Avvia backend + frontend usando dipendenze gia installate
  node Trash_Dash_frontend/start-trashdash.js --tunnel
                              Avvia Expo in tunnel se il QR LAN non funziona
  node Trash_Dash_frontend/start-trashdash.js --ip=192.168.x.x
                              Forza l'IP LAN da usare sul telefono
  node Trash_Dash_frontend/start-trashdash.js --web
                              Avvia Expo web
  node Trash_Dash_frontend/start-trashdash.js --android
                              Avvia Android Emulator con API su 10.0.2.2

Opzioni:
  --setup          Esegue npm ci, Docker, Prisma e seed prima dell'avvio
  --tunnel         Usa Expo tunnel
  --web            Usa Expo web e backend su localhost
  --android        Usa Android Emulator e backend su 10.0.2.2
  --ip <indirizzo> Forza IP LAN del PC, utile su reti particolari
  --frontend-only  Avvia solo il frontend
  --backend-only   Avvia solo backend/database
  --prepare-only   Scrive gli .env e termina
  --skip-seed      Non esegue npm run seed
`);
}

function log(message) {
  console.log(`[TrashDash] ${message}`);
}

function warn(message) {
  console.warn(`[TrashDash][ATTENZIONE] ${message}`);
}

function commandExists(command) {
  const spawnTarget = buildSpawnTarget(command, ["--version"]);
  const result = spawnSync(spawnTarget.command, spawnTarget.args, {
    cwd: rootDir,
    stdio: "ignore"
  });
  return result.status === 0;
}

function run(command, args, cwd, label) {
  return new Promise((resolve, reject) => {
    log(`${label}: ${command} ${args.join(" ")}`);
    const spawnTarget = buildSpawnTarget(command, args);
    const child = spawn(spawnTarget.command, spawnTarget.args, {
      cwd,
      stdio: "inherit"
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} terminato con codice ${code}`));
    });
  });
}

function startLong(command, args, cwd, label) {
  log(`${label}: ${command} ${args.join(" ")}`);
  const spawnTarget = buildSpawnTarget(command, args);
  const child = spawn(spawnTarget.command, spawnTarget.args, {
    cwd,
    stdio: "inherit"
  });
  child.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      warn(`${label} terminato con codice ${code}`);
    }
  });
  return child;
}

function buildSpawnTarget(command, args) {
  if (process.platform === "win32" && (command === "npm" || command === "npx")) {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", [command, ...args].map(quoteForCmd).join(" ")]
    };
  }
  return { command, args };
}

function quoteForCmd(value) {
  const text = String(value);
  if (/^[A-Za-z0-9_./:=@-]+$/.test(text)) return text;
  return `"${text.replace(/"/g, '\\"')}"`;
}

function listIpv4Candidates() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family !== "IPv4") continue;
      if (entry.internal) continue;
      if (!entry.address || entry.address.startsWith("169.254.")) continue;

      candidates.push({
        name,
        address: entry.address,
        virtual: /docker|veth|vethernet|virtualbox|vmware|wsl|hyper-v|loopback/i.test(name),
        private: isPrivateIpv4(entry.address)
      });
    }
  }

  return candidates.sort((a, b) => {
    if (a.virtual !== b.virtual) return a.virtual ? 1 : -1;
    if (a.private !== b.private) return a.private ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function isPrivateIpv4(ip) {
  const parts = ip.split(".").map((item) => Number(item));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  return false;
}

function chooseNetworkTarget() {
  if (options.android) {
    return {
      apiHost: "10.0.2.2",
      expoMode: "android",
      note: "Android Emulator usa 10.0.2.2 per raggiungere localhost del PC."
    };
  }

  if (options.web) {
    return {
      apiHost: "localhost",
      expoMode: "web",
      note: "Expo web usa localhost."
    };
  }

  if (options.ip) {
    return {
      apiHost: options.ip,
      expoMode: options.tunnel ? "tunnel" : "lan",
      note: `IP forzato dall'utente: ${options.ip}`
    };
  }

  const candidates = listIpv4Candidates();
  if (candidates.length > 0) {
    log("IP rilevati:");
    for (const candidate of candidates) {
      log(`- ${candidate.address} (${candidate.name}${candidate.virtual ? ", virtuale" : ""})`);
    }

    return {
      apiHost: candidates[0].address,
      expoMode: options.tunnel ? "tunnel" : "lan",
      note: `Uso ${candidates[0].address} (${candidates[0].name}).`
    };
  }

  warn("Nessun IP LAN rilevato. Uso localhost come fallback.");
  warn("Su telefono fisico localhost non basta: usa node Trash_Dash_frontend/start-trashdash.js --ip=TUO_IP oppure --tunnel.");
  return {
    apiHost: "localhost",
    expoMode: options.tunnel ? "tunnel" : "lan",
    note: "Fallback localhost."
  };
}

function ensureBackendEnv() {
  const envPath = path.join(backendDir, ".env");
  const examplePath = path.join(backendDir, ".env.example");
  if (!fs.existsSync(envPath)) {
    if (!fs.existsSync(examplePath)) throw new Error("Trash_Dash_backend/.env.example non trovato.");
    fs.copyFileSync(examplePath, envPath);
  }

  let content = fs.readFileSync(envPath, "utf8");
  if (content.includes("<genera_un_segreto_lungo_locale>")) {
    const secret = crypto.randomBytes(32).toString("hex");
    content = content.replace("<genera_un_segreto_lungo_locale>", secret);
    fs.writeFileSync(envPath, content);
  }
}

function writeFrontendEnv(apiHost) {
  const envPath = path.join(frontendDir, ".env");
  const content = [
    `EXPO_PUBLIC_API_BASE_URL=http://${apiHost}:4000/api`,
    `EXPO_PUBLIC_WS_URL=ws://${apiHost}:4000/ws`,
    ""
  ].join(os.EOL);
  fs.writeFileSync(envPath, content);
  log(`Frontend .env scritto con backend http://${apiHost}:4000/api`);
}

async function ensureDependencies(projectDir, label) {
  const nodeModules = path.join(projectDir, "node_modules");
  if (options.setup || !fs.existsSync(nodeModules)) {
    await run("npm", ["ci"], projectDir, `${label} dipendenze`);
  } else {
    log(`${label}: node_modules gia presenti, salto npm ci.`);
  }
}

async function setupBackend() {
  await ensureDependencies(backendDir, "Backend");

  if (commandExists("docker")) {
    await run("docker", ["compose", "up", "-d"], backendDir, "Database Docker");
  } else {
    warn("Docker non trovato. Il backend parte solo se PostgreSQL e' gia disponibile su localhost:5434.");
  }

  await run("npm", ["run", "prisma:generate"], backendDir, "Prisma generate");
  await run("npm", ["run", "prisma:push"], backendDir, "Prisma push");

  if (!options.skipSeed) {
    await run("npm", ["run", "seed"], backendDir, "Seed database");
  }
}

async function setupFrontend() {
  await ensureDependencies(frontendDir, "Frontend");
  await run("npx", ["expo", "install", "--check"], frontendDir, "Expo dependency check");
}

async function fetchHealth() {
  try {
    const response = await fetch("http://localhost:4000/api/health", { signal: AbortSignal.timeout(1500) });
    if (!response.ok) return false;
    const data = await response.json().catch(() => ({}));
    return data.service === "trashdash-backend" || data.status === "ok";
  } catch {
    return false;
  }
}

async function waitForHealth(seconds) {
  const deadline = Date.now() + seconds * 1000;
  while (Date.now() < deadline) {
    if (await fetchHealth()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

function frontendArgs(mode) {
  if (mode === "web") return ["expo", "start", "--web", "--clear"];
  if (mode === "android") return ["expo", "start", "--android", "--clear"];
  if (mode === "tunnel") return ["expo", "start", "--tunnel", "--clear"];
  return ["expo", "start", "--lan", "--clear"];
}

async function main() {
  if (!commandExists("node") || !commandExists("npm") || !commandExists("npx")) {
    throw new Error("Node.js, npm e npx devono essere installati e disponibili nel PATH.");
  }

  const network = chooseNetworkTarget();
  log(network.note);

  ensureBackendEnv();
  writeFrontendEnv(network.apiHost);

  if (options.prepareOnly) {
    log("Preparazione completata. Non avvio processi perche e' stato usato --prepare-only.");
    return;
  }

  if (!options.frontendOnly) {
    await setupBackend();
  }

  if (!options.backendOnly) {
    await setupFrontend();
  }

  const children = [];

  process.on("SIGINT", () => {
    log("Chiusura processi...");
    for (const child of children) child.kill("SIGINT");
    process.exit(0);
  });

  if (!options.frontendOnly) {
    if (await fetchHealth()) {
      log("Backend gia attivo su http://localhost:4000/api, non avvio un secondo processo.");
    } else {
      children.push(startLong("npm", ["run", "dev"], backendDir, "Backend"));
      const ready = await waitForHealth(25);
      if (!ready) {
        warn("Backend non confermato entro 25 secondi. Controlla il terminale backend.");
      }
    }
  }

  if (!options.backendOnly) {
    children.push(startLong("npx", frontendArgs(network.expoMode), frontendDir, "Frontend Expo"));
  }

  if (children.length === 0) {
    log("Nessun processo da avviare.");
    return;
  }

  await new Promise(() => {});
}

main().catch((error) => {
  console.error(`[TrashDash][ERRORE] ${error.message}`);
  process.exit(1);
});
