// =========================================================================
// PLF ANTIGRAVITY — PLF SPACE DESIGNER & PLF CHANNEL WEB SHOWCASE JAVASCRIPT
// =========================================================================

// --- 1. PRESET LIBRARY DATA (PLF SPACE DESIGNER) ---
const PRESETS = [
  { name: "01. Init / Clean State", cat: "Init", desc: "Stato neutro e trasparente: filtri aperti (20kHz), risonanza e drive a 0." },
  { name: "02. Subterranean Ghost Tape", cat: "Lush", desc: "Saturazione nastro dirty hall, pitch sottile e micro-ritardi stile Burial." },
  { name: "03. South London Cloud", cat: "Lush", desc: "Riverbero cloud denso e granulare per atmosfere nebbiose notturne." },
  { name: "04. Distant Rain Echoes", cat: "Lush", desc: "Texture acquatica con riflessioni concert hall e riverbero morbido." },
  { name: "05. Submerged Cathedral", cat: "Lush", desc: "Ambiente sanctuary immenso e scuro per pad e pianoforti solenni." },
  { name: "06. Kalimba Cascade", cat: "Organic", desc: "Arpeggio granulare pentatonico con decadimento cristallino e riverbero cloud." },
  { name: "07. Migration Cloud", cat: "Organic", desc: "Pastiche organico con grani lenti aperti nel campo stereofonico stile Bonobo." },
  { name: "08. Black Sands Tape Tap", cat: "Organic", desc: "Multi-tap ritmico caldo e naturale con wow and flutter analogico." },
  { name: "09. Organic Harp Swell", cat: "Organic", desc: "Rigonfiamento swell dinamico per arpe e chitarre acustiche." },
  { name: "10. Nordic Aurora Bloom", cat: "Neoclassical", desc: "Fioritura celestiale limpida con modulazione d'aria stile Kiasmos." },
  { name: "11. Reykjavik Micro-Glitch", cat: "Neoclassical", desc: "Glitch ritmico non-lineare con battute sincronizzate e filtro tagliente." },
  { name: "12. Felt Piano Reverse Swell", cat: "Neoclassical", desc: "Pad reverse per pianoforti felt con atmosfera intima ed emozionante." },
  { name: "13. Euphoric Pulse", cat: "Neoclassical", desc: "Pulsazione ritmica 16-step con accordi consonantici a cascata." },
  { name: "14. Solar Wind Shimmer", cat: "Deep Space", desc: "Riverbero shimmer con ottava superiore scintillante ed escursione cosmica." },
  { name: "15. Interstellar Cavern", cat: "Deep Space", desc: "Spazio profondo infinito con detuning granulare tridimensionale." },
  { name: "16. Ethereal Dream Cloud", cat: "Deep Space", desc: "Nuvola fluttuante per ambient, chillout e musica meditativa." },
  { name: "17. Infinite Memory Box", cat: "Deep Space", desc: "Random space con memorie di pitch instabili e nostalgiche." },
  { name: "18. Black Hole Horizon", cat: "Supermassive", desc: "Spazio supermassiccio con feedback a 0.998 e decadimento infinito." },
  { name: "19. Valhalla Cloud Eternal", cat: "Supermassive", desc: "Pura spazialità fluttuante eterna con smorzamento HF trasparente." },
  { name: "20. Andromeda 3D Nebula", cat: "Supermassive", desc: "Nebulosa stellare a matrice olografica multi-tap espansa." },
  { name: "21. Eternal Starlight Pad", cat: "Supermassive", desc: "Pad infinito con rigonfiamento swell continuo e sustain perenne." },
  { name: "22. Abyssal Sanctuary", cat: "Supermassive", desc: "Spazio sacro abissale con corpo sui bassi e decadimento monumentale." },
  { name: "23. Deep Ocean Trench", cat: "Supermassive", desc: "Profondità oceanica con chorus space denso e detuning corale 80s." }
];

// --- 2. RENDER PRESETS ---
function renderPresets(filter = "all") {
  const grid = document.getElementById("presetsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const filtered = filter === "all" 
    ? PRESETS 
    : PRESETS.filter(p => p.cat === filter);

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

// --- 3. SPECTRUM ANALYZER ANIMATION & REAL AUDIO METERING ---
const canvas = document.getElementById("spectrumCanvas");
const needle = document.getElementById("analogNeedle");
let isAudioPlaying = false;
let isWet = true;
let realAnalyser = null;
let freqDataArray = null;

function initCanvasAnimation() {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const numBars = 48;
  const barW = (width / numBars) - 2;
  const bars = new Array(numBars).fill(8);

  function draw() {
    ctx.clearRect(0, 0, width, height);

    let realFrequencies = null;
    let avgEnergy = 0;
    if (realAnalyser && isAudioPlaying) {
      if (!freqDataArray) freqDataArray = new Uint8Array(realAnalyser.frequencyBinCount);
      realAnalyser.getByteFrequencyData(freqDataArray);
      realFrequencies = freqDataArray;
      let sum = 0;
      for (let j = 0; j < realFrequencies.length; j++) sum += realFrequencies[j];
      avgEnergy = sum / realFrequencies.length;
    }

    for (let i = 0; i < numBars; i++) {
      let targetH = 8;
      if (isAudioPlaying) {
        if (realFrequencies) {
          const binIdx = Math.floor((i / numBars) * (realFrequencies.length * 0.7));
          const val = realFrequencies[binIdx] / 255;
          targetH = Math.max(6, val * (height - 10) * (isWet ? 1.25 : 0.95));
        } else {
          const freqWeight = Math.sin((i / numBars) * Math.PI) * (isWet ? 65 : 40);
          const noise = (Math.random() * 22);
          targetH = Math.max(6, freqWeight + noise);
        }
      }
      bars[i] = bars[i] * 0.7 + targetH * 0.3;

      const x = i * (barW + 2);
      const y = height - bars[i];

      const grad = ctx.createLinearGradient(0, height, 0, y);
      if (isWet) {
        grad.addColorStop(0, "rgba(0, 229, 255, 0.7)");
        grad.addColorStop(1, "rgba(208, 92, 227, 0.9)");
      } else {
        grad.addColorStop(0, "rgba(59, 130, 246, 0.5)");
        grad.addColorStop(1, "rgba(56, 189, 248, 0.7)");
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, bars[i]);
    }

    // Update Analog VU Meter Needle
    if (needle) {
      let needleDeg = -18;
      if (isAudioPlaying) {
        if (avgEnergy > 0) {
          const norm = avgEnergy / 128;
          needleDeg = -18 + (norm * 36) + (Math.random() * 4 - 2);
        } else {
          const peak = isWet ? (Math.random() * 22 - 4) : (Math.random() * 18 - 8);
          needleDeg = peak;
        }
      }
      needle.style.transform = `rotate(${needleDeg}deg)`;
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

// --- 4. SEAMLESS WEB AUDIO ENGINE (ZERO LATENCY A/B CROSSFADE) ---
let audioCtx = null;
let dryBuffer = null;
let wetBuffer = null;
let sourceDry = null;
let sourceWet = null;
let gainDry = null;
let gainWet = null;
let masterGain = null;
let playStartTime = 0;
let pauseOffset = 0;
let isBufferLoading = false;

async function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
}

async function loadBuffers() {
  if (dryBuffer && wetBuffer) return true;
  if (isBufferLoading) return false;
  isBufferLoading = true;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContextClass();

    const [dryRes, wetRes] = await Promise.all([
      fetch('logue_dry.wav'),
      fetch('logue_wet.wav')
    ]);

    const [dryData, wetData] = await Promise.all([
      dryRes.arrayBuffer(),
      wetRes.arrayBuffer()
    ]);

    const decode = (buf) => new Promise((resolve, reject) => {
      audioCtx.decodeAudioData(buf, resolve, reject);
    });

    [dryBuffer, wetBuffer] = await Promise.all([
      decode(dryData),
      decode(wetData)
    ]);

    isBufferLoading = false;
    return true;
  } catch (err) {
    console.warn("Could not preload Web Audio buffers:", err);
    isBufferLoading = false;
    return false;
  }
}

function setupWebAudioDemo() {
  const playBtn = document.getElementById("playBtn");
  const playText = document.getElementById("playText");
  const playIcon = document.getElementById("playIcon");
  const dryBtn = document.getElementById("dryBtn");
  const wetBtn = document.getElementById("wetBtn");
  const dspStatus = document.getElementById("dspStatus");

  // Fallback HTML5 audio elements if Web Audio is unsupported
  const audioDryFallback = document.getElementById("audioDry");
  const audioWetFallback = document.getElementById("audioWet");

  function setPlayingUI(playing) {
    isAudioPlaying = playing;
    if (playText && playIcon) {
      if (playing) {
        playText.textContent = "Pausa Riproduzione";
        playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        playBtn.classList.add("playing");
      } else {
        playText.textContent = 'Riproduci Synth ("Logue Reference")';
        playIcon.innerHTML = '<path d="M5 3l14 9-14 9V3z"/>';
        playBtn.classList.remove("playing");
      }
    }
  }

  async function startWebAudio() {
    await initAudioContext();
    const ready = await loadBuffers();
    if (!ready || !dryBuffer || !wetBuffer) {
      fallbackPlay();
      return;
    }

    stopWebAudioSources();

    gainDry = audioCtx.createGain();
    gainWet = audioCtx.createGain();
    masterGain = audioCtx.createGain();

    realAnalyser = audioCtx.createAnalyser();
    realAnalyser.fftSize = 256;
    realAnalyser.smoothingTimeConstant = 0.8;

    gainDry.gain.setValueAtTime(isWet ? 0.0 : 1.0, audioCtx.currentTime);
    gainWet.gain.setValueAtTime(isWet ? 1.0 : 0.0, audioCtx.currentTime);

    gainDry.connect(masterGain);
    gainWet.connect(masterGain);
    masterGain.connect(realAnalyser);
    realAnalyser.connect(audioCtx.destination);

    sourceDry = audioCtx.createBufferSource();
    sourceWet = audioCtx.createBufferSource();
    sourceDry.buffer = dryBuffer;
    sourceWet.buffer = wetBuffer;
    sourceDry.loop = true;
    sourceWet.loop = true;

    sourceDry.connect(gainDry);
    sourceWet.connect(gainWet);

    const duration = dryBuffer.duration;
    const offset = pauseOffset % duration;
    playStartTime = audioCtx.currentTime - offset;

    sourceDry.start(0, offset);
    sourceWet.start(0, offset);

    setPlayingUI(true);
  }

  function stopWebAudioSources() {
    if (sourceDry) {
      try { sourceDry.stop(); } catch(e) {}
      try { sourceDry.disconnect(); } catch(e) {}
      sourceDry = null;
    }
    if (sourceWet) {
      try { sourceWet.stop(); } catch(e) {}
      try { sourceWet.disconnect(); } catch(e) {}
      sourceWet = null;
    }
  }

  function pauseWebAudio() {
    if (audioCtx && dryBuffer) {
      const duration = dryBuffer.duration;
      pauseOffset = (audioCtx.currentTime - playStartTime) % duration;
    }
    stopWebAudioSources();
    setPlayingUI(false);
  }

  // Fallback playback for HTML5 audio
  function fallbackPlay() {
    if (isAudioPlaying) {
      if (audioDryFallback) audioDryFallback.pause();
      if (audioWetFallback) audioWetFallback.pause();
      setPlayingUI(false);
    } else {
      const target = isWet ? audioWetFallback : audioDryFallback;
      if (target) {
        target.play().then(() => setPlayingUI(true)).catch(e => console.warn(e));
      }
    }
  }

  // Play / Pause toggle
  if (playBtn) {
    playBtn.addEventListener("click", async () => {
      if (isAudioPlaying) {
        pauseWebAudio();
        if (audioDryFallback) audioDryFallback.pause();
        if (audioWetFallback) audioWetFallback.pause();
      } else {
        try {
          await startWebAudio();
        } catch (err) {
          console.warn("Web Audio start failed, falling back:", err);
          fallbackPlay();
        }
      }
    });
  }

  // Switch to DRY (Instant Crossfade, 0ms gap!)
  if (dryBtn) {
    dryBtn.addEventListener("click", () => {
      if (!isWet) return;
      isWet = false;
      dryBtn.classList.add("active");
      if (wetBtn) wetBtn.classList.remove("active");
      if (dspStatus) {
        dspStatus.textContent = "Attivo: BYPASS (Korg Minilogue Dry Diretto)";
        dspStatus.style.color = "var(--primary)";
      }

      if (audioCtx && gainDry && gainWet) {
        const t = audioCtx.currentTime;
        gainDry.gain.cancelScheduledValues(t);
        gainWet.gain.cancelScheduledValues(t);
        gainDry.gain.setValueAtTime(gainDry.gain.value, t);
        gainDry.gain.linearRampToValueAtTime(1.0, t + 0.015);
        gainWet.gain.setValueAtTime(gainWet.gain.value, t);
        gainWet.gain.linearRampToValueAtTime(0.0, t + 0.015);
      } else if (audioDryFallback && audioWetFallback && !audioWetFallback.paused) {
        const pos = audioWetFallback.currentTime;
        audioWetFallback.pause();
        audioDryFallback.currentTime = pos;
        audioDryFallback.play().catch(e => console.warn(e));
      }
    });
  }

  // Switch to WET (Instant Crossfade, 0ms gap!)
  if (wetBtn) {
    wetBtn.addEventListener("click", () => {
      if (isWet) return;
      isWet = true;
      wetBtn.classList.add("active");
      if (dryBtn) dryBtn.classList.remove("active");
      if (dspStatus) {
        dspStatus.textContent = "Attivo: PLF SPACE DESIGNER (Supermassive 3D Cloud + Granular Haze)";
        dspStatus.style.color = "#00e5ff";
      }

      if (audioCtx && gainDry && gainWet) {
        const t = audioCtx.currentTime;
        gainDry.gain.cancelScheduledValues(t);
        gainWet.gain.cancelScheduledValues(t);
        gainDry.gain.setValueAtTime(gainDry.gain.value, t);
        gainDry.gain.linearRampToValueAtTime(0.0, t + 0.015);
        gainWet.gain.setValueAtTime(gainWet.gain.value, t);
        gainWet.gain.linearRampToValueAtTime(1.0, t + 0.015);
      } else if (audioDryFallback && audioWetFallback && !audioDryFallback.paused) {
        const pos = audioDryFallback.currentTime;
        audioDryFallback.pause();
        audioWetFallback.currentTime = pos;
        audioWetFallback.play().catch(e => console.warn(e));
      }
    });
  }

  // Start preloading buffers in the background immediately
  loadBuffers();
}

// Initialise everything on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  renderPresets("all");
  initCanvasAnimation();
  setupWebAudioDemo();
});
