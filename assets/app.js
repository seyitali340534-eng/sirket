// ===== Runtime Firebase Config (no secrets) =====
// You can set this once at /config.html; it's saved in localStorage.
function getRuntimeConfig(){
  try {
    const raw = localStorage.getItem('nakliye_firebase_config');
    if(raw){ return JSON.parse(raw); }
  } catch(e){}
  // Fallback placeholders (edit manually if you prefer)
  return {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
}

const firebaseConfig = getRuntimeConfig();

// Load Firebase (v8 CDN – simple)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== Helpers =====
function formatPhoneForWa(phone){
  let p = (phone||'').replace(/\D/g,'');
  if(p.startswith && p.startswith('0')){ p = '9' + p; } // defensive (older browsers may not support startswith)
  if(p[0]==='0'){ p = '9' + p; }
  if(!p.startsWith('90') && p.length>=10){ /* leave as is */ }
  return p;
}

function encodeQuery(msg){ return encodeURIComponent(msg); }

function renderStatusBadge(status){
  const color = status==='approved'?'#22c55e':status==='done'?'#06b6d4':'#eab308';
  return `<span class="badge" style="border-color:${color};color:${color}">${status}</span>`;
}

function autoSuggestVehicle(fleet, payloadKg, volumeM3){
  const fits = fleet.filter(v => (v.payload_kg||0) >= (payloadKg||0) && (v.volume_m3||0) >= (volumeM3||0));
  if(fits.length===0) return null;
  return fits.sort((a,b)=> ((a.payload_kg - payloadKg) + (a.volume_m3 - volumeM3)) - ((b.payload_kg - payloadKg) + (b.volume_m3 - volumeM3)) )[0];
}

window.NakliyeShared = { app, auth, db, formatPhoneForWa, encodeQuery, renderStatusBadge, autoSuggestVehicle };