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

    // Update & Draw Bars
    const barW = (width / numBars) - 2;
    for (let i = 0; i < numBars; i++) {
      let targetH = 8;
      if (isAudioPlaying) {
        if (realFrequencies) {
          const binIdx = Math.floor((i / numBars) * (realFrequencies.length * 0.7));
          const val = realFrequencies[binIdx] / 255;
          targetH = Math.max(6, val * (height - 10) * (isWet ? 1.15 : 0.95));
        } else {
          const freqWeight = Math.sin((i / numBars) * Math.PI) * (isWet ? 55 : 40);
          const noise = (Math.random() * 22);
          targetH = Math.max(6, freqWeight + noise);
        }
      }
      bars[i] = bars[i] * 0.7 + targetH * 0.3;

      const x = i * (barW + 2);
      const y = height - bars[i];

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
  draw();
}

// --- 4. SEAMLESS WEB AUDIO ENGINE (ZERO LATENCY A/B CROSSFADE FOR MOBILE & DESKTOP) ---
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
      fetch('chance_dry.mp3'),
      fetch('chance_wet.mp3')
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
  const waveBarsContainer = document.getElementById("waveBars");

  // Fallback HTML5 audio elements if Web Audio is unsupported
  const audioDryFallback = document.getElementById("audioDry");
  const audioWetFallback = document.getElementById("audioWet");

  // Build waveform visualizer bars
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

  function setPlayingUI(playing) {
    isAudioPlaying = playing;
    if (playing) {
      if (playBtn) playBtn.style.background = "#22c55e";
      if (playText) playText.textContent = "Pausa Traccia";
      if (playIcon) playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    } else {
      if (playBtn) playBtn.style.background = "";
      if (playText) playText.textContent = 'Riproduci Traccia ("Chance")';
      if (playIcon) playIcon.innerHTML = '<path d="M5 3l14 9-14 9V3z"/>';
    }
  }

  function setupRouting() {
    if (!audioCtx) return;
    if (!gainDry) gainDry = audioCtx.createGain();
    if (!gainWet) gainWet = audioCtx.createGain();
    if (!masterGain) masterGain = audioCtx.createGain();
    if (!realAnalyser) {
      realAnalyser = audioCtx.createAnalyser();
      realAnalyser.fftSize = 128;
    }

    gainDry.disconnect();
    gainWet.disconnect();
    masterGain.disconnect();
    realAnalyser.disconnect();

    gainDry.connect(masterGain);
    gainWet.connect(masterGain);
    masterGain.connect(realAnalyser);
    realAnalyser.connect(audioCtx.destination);

    // Initial gains based on active selection
    gainDry.gain.setValueAtTime(isWet ? 0.0 : 1.0, audioCtx.currentTime);
    gainWet.gain.setValueAtTime(isWet ? 1.0 : 0.0, audioCtx.currentTime);
  }

  async function startWebAudio() {
    await initAudioContext();
    if (!dryBuffer || !wetBuffer) {
      if (playText) playText.textContent = "Caricamento audio...";
      const ok = await loadBuffers();
      if (!ok) {
        // Fallback to HTML5 audio if decode failed
        fallbackPlay();
        return;
      }
    }

    setupRouting();

    // Stop any existing sources
    stopWebAudioSources();

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
        dspStatus.textContent = "Attivo: BYPASS (Segnale Diretto Originale)";
        dspStatus.style.color = "var(--primary)";
      }

      if (audioCtx && gainDry && gainWet) {
        // Ultra smooth 15ms sample-accurate crossfade
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
        dspStatus.textContent = "Attivo: PLF CHANNEL (Console Glue + Dynamic EQ + Exciter)";
        dspStatus.style.color = "var(--gold)";
      }

      if (audioCtx && gainDry && gainWet) {
        // Ultra smooth 15ms sample-accurate crossfade
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
