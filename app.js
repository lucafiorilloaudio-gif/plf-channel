// =========================================================================
// PLF ANTIGRAVITY — PLF CHANNEL WEB STORE & SHOWCASE JAVASCRIPT
// =========================================================================

// --- 1. PRESET LIBRARY DATA ---
const PRESETS = [
  { name: "00. Default / Init", cat: "Init", desc: "Stato neutro e trasparente per iniziare da zero." },
  { name: "01. Kick Drum Punch", cat: "Drums", desc: "Taglio a 300Hz, enfasi a 60Hz e click a 4kHz." },
  { name: "02. Snare Crack & Body", cat: "Drums", desc: "Rullante grosso con attacco rapido e aria a 8kHz." },
  { name: "03. Drum Bus Glue", cat: "Drums", desc: "Incolla il drum bus con Comp 4:1, SC-HPF 90Hz e mix 75%." },
  { name: "04. Cymbals & Overhead Air", cat: "Drums", desc: "HPF a 300Hz e apertura ultrasonica morbida a 16kHz." },
  { name: "05. Bass Tight & Round", cat: "Bass", desc: "Basso solido e compresso con LMF dinamico per la cassa." },
  { name: "06. 808 Sub Heavy", cat: "Bass", desc: "Sub a 45Hz esaltato con exciter e monoizzatore sub integrato." },
  { name: "07. Modern Lead Vocal", cat: "Vocals", desc: "Presenza vocale a 3kHz, aria a 14kHz e de-esser dinamico." },
  { name: "08. Warm Tube Vocal", cat: "Vocals", desc: "Calore analogico con drive valvolare ed equalizzazione morbida." },
  { name: "09. Backing Vocals Wide", cat: "Vocals", desc: "Cori e doppie aperte sui lati con Imager all'estremita' stereo." },
  { name: "10. Acoustic Guitar Silk", cat: "Instruments", desc: "Corpo asciugato sulle basse e aria brillante sulle corde." },
  { name: "11. Electric Guitar Edge", cat: "Instruments", desc: "Chitarre rock aggressive con medio-alte scavate e drive console." },
  { name: "12. Piano Concert Hall", cat: "Instruments", desc: "Pianoforte acustico con bilanciamento naturale e dinamica aperta." },
  { name: "13. Synth Lead In Your Face", cat: "Instruments", desc: "Transient d'attacco potenziato e saturazione nastro spinta." },
  { name: "14. Master Bus SSL Glue", cat: "Mix Bus", desc: "Il classico setting SSL serie G da master bus (2-3 dB GR)." },
  { name: "15. Mix Bus Warm Punch", cat: "Mix Bus", desc: "Mix bus con calore sui medio-bassi e attacco preservato." },
  { name: "16. Transparent Pop Master", cat: "Mix Bus", desc: "Master moderno e compatto con soft-clipper inserito." },
  { name: "17. EDM / Club Banger", cat: "Mix Bus", desc: "Bassi in mono, apertura stereo sulle alte e limiter a -0.3 dB." },
  { name: "18. Acoustic Mastering", cat: "Mix Bus", desc: "Intervento minimo e trasparente da mastering acustico/jazz." },
  { name: "19. Parallel Crush Station", cat: "Creative", desc: "Compressione estrema a 10:1 da dosare in parallelo con mix 35%." },
  { name: "20. Lo-Fi Radio Vibe", cat: "Creative", desc: "Effetto radio vintage con tagli stretti passa-alto e drive." }
];

// --- 2. RENDER PRESETS ---
function renderPresets(filter = "all") {
  const grid = document.getElementById("presetsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const filtered = filter === "all" 
    ? PRESETS 
    : PRESETS.filter(p => p.cat === filter || (filter === "Mix Bus" && (p.cat === "Mix Bus" || p.cat === "Mastering")));

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "preset-item-card";
    card.innerHTML = `
      <div class="preset-top">
        <span class="preset-name">${p.name}</span>
        <span class="preset-cat">${p.cat}</span>
      </div>
      <div class="preset-desc">${p.desc}</div>
    `;
    grid.appendChild(card);
  });
}

// Preset Filter Buttons
document.querySelectorAll(".pill-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pill-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPresets(btn.dataset.filter);
  });
});

// --- 3. SPECTRUM ANALYZER ANIMATION ---
const canvas = document.getElementById("spectrumCanvas");
const needle = document.getElementById("analogNeedle");
let isAudioPlaying = false;
let isWet = false;

function initCanvasAnimation() {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const numBars = 48;

  let bars = new Array(numBars).fill(10);

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let y = 15; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Update & Draw Bars
    const barW = (width / numBars) - 2;
    for (let i = 0; i < numBars; i++) {
      let targetH = 8;
      if (isAudioPlaying) {
        // Curve simulating musical spectrum: prominent bass, gentle slope
        const freqWeight = Math.sin((i / numBars) * Math.PI) * (isWet ? 55 : 40);
        const noise = (Math.random() * 22);
        targetH = Math.max(6, freqWeight + noise);
      }
      bars[i] = bars[i] * 0.75 + targetH * 0.25;

      const x = i * (barW + 2);
      const y = height - bars[i];

      // Cyan to Gold gradient
      const grad = ctx.createLinearGradient(0, height, 0, y);
      if (isWet) {
        grad.addColorStop(0, "rgba(56, 189, 248, 0.7)");
        grad.addColorStop(1, "rgba(234, 179, 8, 0.9)");
      } else {
        grad.addColorStop(0, "rgba(59, 130, 246, 0.5)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0.7)");
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, bars[i]);
    }

    // Update Analog VU Needle
    if (needle) {
      let needleDeg = -18;
      if (isAudioPlaying) {
        const peak = isWet ? (Math.random() * 22 - 4) : (Math.random() * 18 - 8);
        needleDeg = peak;
      }
      needle.style.transform = `rotate(${needleDeg}deg)`;
    }

    requestAnimationFrame(draw);
  }
  draw();
}

// --- 4. REAL AUDIO PLAYER DEMO (ONE SINGLE STREAM — ZERO ECHO, ZERO DOUBLE SOUND) ---
const demoAudio = new Audio('chance_wet.mp3');
demoAudio.loop = true;
demoAudio.preload = 'auto';

let isAudioPlaying = false;
let isWet = true; // Default to the PLF Channel master sound!

function setupWebAudioDemo() {
  const playBtn = document.getElementById("playBtn");
  const playText = document.getElementById("playText");
  const dryBtn = document.getElementById("dryBtn");
  const wetBtn = document.getElementById("wetBtn");
  const dspStatus = document.getElementById("dspStatus");
  const waveBarsContainer = document.getElementById("waveBars");

  // Sound Wave Bars in UI
  if (waveBarsContainer) {
    waveBarsContainer.innerHTML = "";
    for (let i = 0; i < 36; i++) {
      const b = document.createElement("div");
      b.className = "wave-bar";
      waveBarsContainer.appendChild(b);
    }
  }

  function updateWaveBars() {
    if (!waveBarsContainer) return;
    const bars = waveBarsContainer.children;
    for (let i = 0; i < bars.length; i++) {
      if (isAudioPlaying) {
        const h = isWet ? Math.floor(Math.random() * 38 + 10) : Math.floor(Math.random() * 24 + 6);
        bars[i].style.height = `${h}px`;
        bars[i].style.background = isWet ? "#38bdf8" : "#3b82f6";
      } else {
        bars[i].style.height = "6px";
        bars[i].style.background = "#212836";
      }
    }
  }
  setInterval(updateWaveBars, 80);

  playBtn.addEventListener("click", () => {
    isAudioPlaying = !isAudioPlaying;
    if (isAudioPlaying) {
      demoAudio.play().catch(e => console.log(e));
      playBtn.style.background = "#22c55e";
      playText.textContent = "Pausa Traccia";
    } else {
      demoAudio.pause();
      playBtn.style.background = "";
      playText.textContent = "Riproduci Traccia (\"Chance\")";
    }
  });

  dryBtn.addEventListener("click", () => {
    if (!isWet) return;
    isWet = false;
    dryBtn.classList.add("active");
    wetBtn.classList.remove("active");
    dspStatus.textContent = "Attivo: BYPASS (Segnale Diretto Originale)";
    dspStatus.style.color = "var(--primary)";

    // Switch stream to DRY preserving exact timestamp with zero echo
    const pos = demoAudio.currentTime;
    demoAudio.src = 'chance_dry.mp3';
    demoAudio.currentTime = pos;
    if (isAudioPlaying) {
      demoAudio.play().catch(e => console.log(e));
    }
  });

  wetBtn.addEventListener("click", () => {
    if (isWet) return;
    isWet = true;
    wetBtn.classList.add("active");
    dryBtn.classList.remove("active");
    dspStatus.textContent = "Attivo: PLF CHANNEL (Console Glue + Dynamic EQ + Exciter)";
    dspStatus.style.color = "var(--gold)";

    // Switch stream to WET preserving exact timestamp with zero echo
    const pos = demoAudio.currentTime;
    demoAudio.src = 'chance_wet.mp3';
    demoAudio.currentTime = pos;
    if (isAudioPlaying) {
      demoAudio.play().catch(e => console.log(e));
    }
  });
}

// --- 5. INTERACTIVE KNOB ROTATION ON CLICK ---
function setupInteractiveKnobs() {
  document.querySelectorAll(".knob-mock").forEach(knob => {
    knob.addEventListener("click", () => {
      const line = knob.querySelector(".knob-line");
      if (!line) return;
      const currentRot = line.style.transform.match(/rotate\(([-\d]+)deg\)/);
      let deg = currentRot ? parseInt(currentRot[1]) : 0;
      deg = (deg + 45 > 135) ? -135 : deg + 45;
      line.style.transform = `rotate(${deg}deg)`;
    });
  });
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  renderPresets("all");
  initCanvasAnimation();
  setupWebAudioDemo();
  setupInteractiveKnobs();
});
