// ─═ Mazen Chef — Setup Script ─═
// Lit le fichier .env et génère les fichiers JS de config.
//
// Usage :
//   1. Remplis .env avec tes vraies valeurs
//   2. Exécute : node setup.js
//   3. Ouvre le site dans le navigateur

const fs = require('fs');
const path = require('path');

// ── Lit le .env ─────────────────────────────────────
const envPath = path.join(__dirname, '.env');
let envContent;
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch {
  console.error('❌ Fichier .env introuvable.');
  console.error('   Copie .env.example en .env et remplis-le.');
  process.exit(1);
}

// ── Parse les variables ──────────────────────────────
function parseEnv(text) {
  const vars = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    const dq = value.startsWith('"') && value.endsWith('"');
    const sq = value.startsWith("'") && value.endsWith("'");
    if (dq || sq) value = value.slice(1, -1);
    vars[key] = value;
  }
  return vars;
}

const env = parseEnv(envContent);

// ── Validation ───────────────────────────────────────
const missing = [];
if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
if (!env.SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');

if (missing.length > 0) {
  console.error('❌ Variables manquantes dans .env :');
  for (const v of missing) console.error(`   - ${v}`);
  console.error('\n   Remplis-les puis réexécute : node setup.js');
  process.exit(1);
}

console.log('✅ Configuration chargée depuis .env');

// ── Génère app-config.js ────────────────────────────
const appConfigPath = path.join(__dirname, 'assets', 'js', 'config', 'app-config.js');
const appConfigContent = `export const APP_CONFIG = {
  whatsappPhone: '${env.WHATSAPP_PHONE || '212613181823'}',
  serviceWorkerPath: 'sw.js',
  hero: {
    images: [
      'assets/images/slider/nous-avons-decouvert.jpg',
      'assets/images/slider/mazen-chef-restaurant%20(1).jpg',
    ],
    overlay: 'linear-gradient(160deg, rgba(15,15,15,0.3) 0%, rgba(15,15,15,0.7) 60%, rgba(15,15,15,0.95) 100%)',
    interval: 5500,
    fadeDuration: 1200,
  },
  videoReviews: {
    interval: 4500,
  },
  datepicker: {
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  },
  supabase: {
    url: '${env.SUPABASE_URL}',
    anonKey: '${env.SUPABASE_ANON_KEY}',
  },
};
`;

fs.writeFileSync(appConfigPath, appConfigContent);
console.log('✅ assets/js/config/app-config.js mis à jour');

// ── Terminé ──────────────────────────────────────────
console.log('\n🚀 Tout est prêt ! Ouvre index.html dans ton navigateur.');
