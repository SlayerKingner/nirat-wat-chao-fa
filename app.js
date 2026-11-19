/* =========================================================
   app.js — เอนจินเล่าเรื่อง: ฉาก SVG, เสียง WebAudio, มินิเกม
   เนื้อหาอยู่ใน content.js
   ========================================================= */
(() => {
'use strict';
const S = window.STORY;
const $ = (q, el = document) => el.querySelector(q);
const thaiNum = n => String(n).replace(/\d/g, d => '๐๑๒๓๔๕๖๗๘๙'[d]);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const rng = seed => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* =========================================================
   1) ART — ภาพฉากวาดด้วย SVG
   class="L" data-d  = ชั้นพารัลแลกซ์ (ยิ่งมาก ยิ่งเลื่อนเร็ว)
   class="mv" data-x0 data-x1 = เคลื่อนแนวนอนตามความคืบหน้าของบท
   ========================================================= */
const W = 1600, H = 900;
const sky = (id, cs) => `<defs><linearGradient id="sk${id}" x1="0" y1="0" x2="0" y2="1">${
  cs.map((c, i) => `<stop offset="${i / (cs.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#sk${id})"/>`;
const stars = (r, n, maxY) => { let s = ''; for (let i = 0; i < n; i++) {
  const tw = r() < .3 ? ' class="twinkle" style="animation-delay:' + (-r() * 3).toFixed(1) + 's"' : '';
  s += `<circle${tw} cx="${(r() * W) | 0}" cy="${(r() * maxY) | 0}" r="${(.5 + r() * 1.4).toFixed(1)}" fill="#fff" opacity="${(.3 + r() * .7).toFixed(2)}"/>`; }
  return `<g>${s}</g>`; };
const glow = (x, y, r, c, o = .5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity="${o}" filter="url(#blur30)"/>`;
const moon = (x, y, r, c, cut) => `${glow(x, y, r * 2.2, c, .25)}<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>${
  cut ? `<circle cx="${x + r * .55}" cy="${y - r * .15}" r="${r * .95}" fill="${cut}"/>` : ''}`;
let wid = 0;
const water = (y, c1, c2, sh = 'rgba(255,255,255,.18)', r = rng(7)) => { const id = 'w' + (wid++);
  let l = ''; for (let i = 0; i < 18; i++) { const yy = y + 12 + i * ((H - y) / 18); const x = r() * W;
    l += `<line class="water-line" x1="${x | 0}" y1="${yy | 0}" x2="${(x + 120 + r() * 220) | 0}" y2="${yy | 0}" stroke="${sh}" stroke-width="${1 + i * .15}" style="animation-delay:${(-r() * 6).toFixed(1)}s"/>`; }
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect y="${y}" width="${W}" height="${H - y}" fill="url(#${id})"/>${l}`; };
const treeline = (r, y, c, amp = 40, step = 30) => { let d = `M0 ${H} L0 ${y}`;
  for (let x = 0; x <= W + step; x += step) d += ` Q${x - step / 2} ${y - amp * (.4 + r())} ${x} ${y - amp * r() * .5}`;
  return `<path d="${d} L${W} ${H} Z" fill="${c}"/>`; };
const palm = (x, y, h, c) => { let lv = '';
  for (let a = -165; a <= -15; a += 15) { const rad = a * Math.PI / 180, L = h * .28;
    lv += `<path d="M0 ${-h} q${Math.cos(rad) * L * .5} ${Math.sin(rad) * L * .7 - 10} ${Math.cos(rad) * L} ${Math.sin(rad) * L + L * .25}" stroke="${c}" stroke-width="${h * .022}" fill="none" stroke-linecap="round"/>`; }
  return `<g transform="translate(${x},${y})"><path d="M0 0 Q${h * .04} ${-h / 2} 0 ${-h}" stroke="${c}" stroke-width="${h * .035}" fill="none"/>${lv}<circle cy="${-h}" r="${h * .05}" fill="${c}"/></g>`; };
const banyan = (x, y, s, c, r = rng(11)) => { let b = '';
  for (let i = 0; i < 14; i++) b += `<circle cx="${(r() - .5) * 420}" cy="${-260 - r() * 170}" r="${80 + r() * 70}" fill="${c}"/>`;
  for (let i = 0; i < 22; i++) { const xx = (r() - .5) * 440; b += `<path d="M${xx} -230 q${(r() - .5) * 20} 120 ${(r() - .5) * 30} ${200 + r() * 30}" stroke="${c}" stroke-width="${1 + r() * 2}" fill="none"/>`; }
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-40 0 Q-20 -150 -30 -260 L30 -260 Q20 -150 50 0Z" fill="${c}"/>${b}</g>`; };
const chedi = (x, y, h, c) => `<g transform="translate(${x},${y}) scale(${h / 300})" fill="${c}">
  <rect x="-95" y="-20" width="190" height="20"/><rect x="-78" y="-40" width="156" height="20"/><rect x="-62" y="-55" width="124" height="15"/>
  <path d="M-60 -55 C-60 -150 -22 -172 0 -176 C22 -172 60 -150 60 -55Z"/><rect x="-20" y="-196" width="40" height="22"/>
  <path d="M-15 -196 L0 -300 L15 -196Z"/></g>`;
const temple = (x, y, s, c, ruin = false) => `<g transform="translate(${x},${y}) scale(${s})" fill="${c}">
  <rect x="-130" y="-70" width="260" height="70"/>
  ${ruin ? `<path d="M-150 -70 L-70 -150 L-20 -150 L-40 -120 L10 -110 L-10 -70Z"/><path d="M60 -70 L80 -120 L150 -70Z"/>` :
  `<path d="M-155 -70 L-60 -150 L60 -150 L155 -70Z"/><path d="M-105 -125 L-30 -205 L30 -205 L105 -125Z"/>
  <path d="M-30 -205 L0 -240 L30 -205Z"/><path d="M0 -240 q6 -14 14 -10" stroke="${c}" stroke-width="5" fill="none"/>
  <path d="M-155 -70 q-14 -8 -10 -24" stroke="${c}" stroke-width="5" fill="none"/><path d="M155 -70 q14 -8 10 -24" stroke="${c}" stroke-width="5" fill="none"/>`}</g>`;
const boat = (x, y, s, c, lantern = true) => `<g class="mv-boat" transform="translate(${x},${y}) scale(${s})">
  ${lantern ? glow(70, -40, 50, '#ffcf6a', .55) : ''}
  <path d="M-175 -28 Q-150 12 0 14 Q150 12 178 -30 Q120 -4 0 -6 Q-120 -4 -175 -28Z" fill="${c}"/>
  <path d="M-55 -6 Q0 -78 60 -6Z" fill="${c}"/>
  <circle cx="-120" cy="-62" r="9" fill="${c}"/><path d="M-120 -54 L-118 -10" stroke="${c}" stroke-width="10"/>
  <path d="M-128 -40 L-175 40" stroke="${c}" stroke-width="4"/>
  <circle cx="110" cy="-34" r="8" fill="${c}"/><path d="M95 -8 Q110 -40 125 -8Z" fill="${c}"/>
  ${lantern ? `<circle class="flicker" cx="70" cy="-40" r="5" fill="#ffd27a"/>` : ''}</g>`;
const reeds = (r, x0, x1, y, c, n, hm) => { let s = '';
  for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), h = hm * (.4 + r() * .6), b = (r() - .5) * 50;
    s += `<path d="M${x | 0} ${y} q${b / 2} ${-h / 2} ${b} ${-h}" stroke="${c}" stroke-width="${1.5 + r() * 2.5}" fill="none"/>`; }
  return `<g>${s}</g>`; };
const person = (x, y, s, c, lamp) => `<g transform="translate(${x},${y}) scale(${s})" fill="${c}">
  <circle cy="-62" r="9"/><path d="M-12 -52 L12 -52 L16 0 L-16 0Z"/>${lamp ? `${glow(22, -30, 30, '#ffc65a', .7)}<circle class="flicker" cx="22" cy="-30" r="5" fill="#ffd27a"/>` : ''}</g>`;
const clouds = (r, n, y0, y1, c, o) => { let s = '';
  for (let i = 0; i < n; i++) s += `<ellipse cx="${r() * W}" cy="${y0 + r() * (y1 - y0)}" rx="${150 + r() * 260}" ry="${30 + r() * 50}" fill="${c}" opacity="${o}"/>`;
  return `<g filter="url(#blur8)">${s}</g>`; };
const rain = r => { let s = ''; for (let i = 0; i < 90; i++) { const x = r() * (W + 300);
  s += `<line x1="${x | 0}" y1="0" x2="${(x - 18) | 0}" y2="60" stroke="rgba(200,215,255,.35)" stroke-width="1.3" style="animation-delay:${(-r()).toFixed(2)}s;animation-duration:${(.5 + r() * .4).toFixed(2)}s"/>`; }
  return `<g class="rain">${s}</g>`; };
const L = (d, inner) => `<g class="L" data-d="${d}">${inner}</g>`;
const MV = (x0, x1, inner) => `<g class="mv" data-x0="${x0}" data-x1="${x1}">${inner}</g>`;

const DEFS = `<defs><filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="blur30" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="30"/></filter></defs>`;

const ART = {
  depart: () => { const r = rng(3); return sky('dp', ['#1a1533', '#4b2648', '#b8583a', '#f2a65a']) +
    glow(1150, 560, 160, '#ffb35c', .7) + `<circle cx="1150" cy="575" r="60" fill="#ffd08a"/>` + stars(r, 25, 250) +
    L(.08, `${chedi(260, 600, 330, '#2a1830')}${chedi(360, 600, 380, '#2a1830')}${chedi(460, 600, 330, '#2a1830')}${chedi(555, 600, 300, '#2a1830')}${temple(780, 600, 1.1, '#2a1830')}`) +
    L(.15, treeline(r, 600, '#1e1226', 25)) +
    water(600, '#7a3a3a', '#1a1230', 'rgba(255,200,140,.25)') +
    MV(150, 1250, boat(0, 690, 1.15, '#0e0a14')) +
    L(.5, reeds(r, 0, 420, 900, '#08060c', 50, 220) + reeds(r, 1250, 1600, 900, '#08060c', 40, 200)); },

  rakhang: () => { const r = rng(5); return sky('rk', ['#121836', '#33264f', '#7a4256']) + stars(r, 60, 400) +
    moon(300, 180, 40, '#f4e8c8') +
    L(.08, `${chedi(620, 610, 420, '#1b1430')}${temple(860, 610, 1.4, '#1b1430')}`) +
    L(.1, `<g transform="translate(1180,610)" fill="#1b1430"><rect x="-55" y="-220" width="110" height="220" opacity=".0"/><rect x="-50" y="-180" width="12" height="180"/><rect x="38" y="-180" width="12" height="180"/><path d="M-70 -180 L0 -260 L70 -180Z"/></g>
      ${glow(1180, -130 + 610, 50, '#d4a94e', .5)}<path d="M1160 470 Q1160 440 1180 438 Q1200 440 1200 470 L1205 490 L1155 490Z" fill="#d4a94e"/>`) +
    L(.15, treeline(r, 615, '#120d22', 20)) + water(615, '#3a2a4a', '#0c0a18') +
    MV(350, 800, boat(0, 700, .9, '#07060d')) +
    L(.5, reeds(r, 0, 1600, 900, '#06050a', 70, 160)); },

  river: () => { const r = rng(9); let orch = ''; for (let i = 0; i < 18; i++) orch += `<circle cx="${640 + r() * 320}" cy="${590 + r() * 60}" r="${20 + r() * 26}" fill="#0b1426"/>`;
    return sky('rv', ['#0b1330', '#1b2b55', '#3b5a86']) + stars(r, 80, 450) + moon(1250, 170, 44, '#e9eef8', '#0f183a') +
    L(.1, treeline(r, 560, '#0c1630', 30)) + water(560, '#2b4672', '#0a1022', 'rgba(200,220,255,.22)') +
    L(.12, `<path d="M800 560 L650 600 L380 900 L1220 900 L950 600Z" fill="#0b1426"/>${orch}${palm(700, 610, 200, '#0b1426')}${palm(900, 600, 230, '#0b1426')}`) +
    MV(-150, 420, boat(0, 760, .85, '#050914')) +
    L(.5, reeds(r, 0, 300, 900, '#04070e', 40, 180) + reeds(r, 1350, 1600, 900, '#04070e', 30, 160)); },

  fireflies: () => { const r = rng(13); return sky('ff', ['#04060d', '#0a1124', '#13203e']) + stars(r, 160, 520) +
    moon(1250, 170, 38, '#f0ead6', '#06091a') +
    L(.08, treeline(r, 640, '#060a16', 45)) + water(640, '#101c36', '#03050b', 'rgba(255,230,150,.12)') +
    L(.3, reeds(r, 0, 1600, 760, '#02040a', 120, 260)) + L(.55, reeds(r, 0, 1600, 900, '#010205', 90, 330)); },

  charnel: () => { const r = rng(17); let graves = ''; for (let i = 0; i < 6; i++) graves += chedi(150 + i * 110 + r() * 40, 760, 70 + r() * 40, '#0a0d14');
    return sky('cn', ['#05070c', '#0f1420', '#1b2230']) + stars(r, 40, 300) +
    L(.06, clouds(r, 6, 450, 700, '#9aa6c0', .12)) +
    L(.12, banyan(1050, 790, 1.7, '#05070b')) +
    L(.16, `<g>${graves}</g>${person(1000, 790, 1.2, '#05070b')}${glow(1040, 770, 40, '#ffb85a', .6)}<circle class="flicker" cx="1040" cy="775" r="4" fill="#ffd27a"/>`) +
    `<g>${[0, 1, 2].map(i => `<ellipse class="wisp" cx="${500 + i * 380}" cy="${520 - i * 60}" rx="60" ry="110" fill="#cfd8ff" opacity=".3"/>`).join('')}</g>` +
    `<rect y="700" width="${W}" height="200" fill="#04060a"/>` +
    L(.4, clouds(r, 8, 760, 880, '#aab3c8', .1)); },

  watyai: () => { const r = rng(19); return sky('wy', ['#080b16', '#171e33', '#29324d']) + stars(r, 30, 200) +
    glow(1320, 140, 40, '#fff6d8', .8) + `<circle class="twinkle" cx="1320" cy="140" r="5" fill="#fffbe8"/>` +
    L(.05, clouds(r, 9, 120, 420, '#0d1120', .8)) +
    L(.1, `${chedi(800, 720, 600, '#0c0f1c')}${chedi(430, 720, 260, '#0e1220')}${chedi(1170, 720, 260, '#0e1220')}${chedi(300, 720, 170, '#0f1322')}${chedi(1300, 720, 170, '#0f1322')}`) +
    L(.16, banyan(150, 760, .8, '#090c16') + banyan(1500, 760, .9, '#090c16')) +
    `<rect y="720" width="${W}" height="180" fill="#070912"/>` + rain(r); },

  field: () => { const r = rng(23); return sky('fd', ['#0e1530', '#2a3260', '#6d5f86', '#c4957a']) + stars(r, 50, 300) +
    L(.06, `<rect y="560" width="${W}" height="340" fill="#1c1e33"/>${palm(220, 565, 230, '#141628')}${palm(330, 565, 180, '#141628')}${palm(1180, 565, 260, '#141628')}${palm(1420, 565, 200, '#141628')}`) +
    L(.1, reeds(r, 0, 1600, 640, '#121326', 120, 70)) +
    MV(200, 900, `${person(0, 640, .9, '#07080f', true)}${person(60, 645, .8, '#07080f')}${person(115, 642, .85, '#07080f', true)}`) +
    `<ellipse cx="800" cy="820" rx="560" ry="110" fill="#0d1124"/><ellipse cx="800" cy="820" rx="560" ry="110" fill="none" stroke="rgba(200,180,200,.15)" stroke-width="2"/>
     <g class="splash"><ellipse cx="800" cy="800" rx="300" ry="50" fill="none" stroke="#e8e2f4" stroke-width="5"/></g>
     <g class="buffalo" fill="#04050a"><ellipse cx="800" cy="780" rx="190" ry="85"/><ellipse cx="610" cy="740" rx="75" ry="60"/>
       <path d="M560 705 Q470 650 520 600 Q520 660 600 690Z"/><path d="M660 705 Q750 650 700 600 Q700 660 620 690Z"/>
       <circle cx="590" cy="735" r="7" fill="#ffd35a"/><circle cx="630" cy="735" r="7" fill="#ffd35a"/></g>
     <rect y="830" width="${W}" height="70" fill="#05060c"/>` +
    L(.5, reeds(r, 0, 1600, 900, '#020306', 80, 200)); },

  legend: () => { const r = rng(29); return sky('lg', ['#2b1a2e', '#6e3638', '#c97f45', '#f2c46e']) +
    glow(1200, 520, 200, '#ffd38a', .6) +
    `<g class="hermit" fill="#2a1520">${[0, 1, 2, 3].map(i => `<g transform="translate(${i * -70},${150 + (i % 2) * 30})"><circle r="8"/><path d="M-8 6 L8 6 L26 26 L-14 22Z"/></g>`).join('')}</g>` +
    L(.08, `<path d="M300 900 Q800 380 1300 900Z" fill="#3a1d24"/>${palm(820, 560, 300, '#26121a')}${temple(640, 700, .8, '#26121a', true)}`) +
    L(.14, `<g transform="translate(1050,690)" fill="#20101a"><ellipse rx="22" ry="14"/><path d="M15 -6 Q30 -50 25 -70" stroke="#20101a" stroke-width="5" fill="none"/><circle cx="25" cy="-72" r="7"/><path d="M-18 0 Q-120 -40 -170 10 Q-100 0 -18 8Z"/></g>`) +
    L(.4, treeline(r, 830, '#1a0c12', 30) + reeds(r, 0, 1600, 900, '#12080d', 60, 160)); },

  ritual: () => { const r = rng(31); return sky('rt', ['#04050b', '#0d101b', '#191d2b']) +
    L(.05, clouds(r, 10, 80, 450, '#0a0c16', .9)) +
    L(.08, `<path d="M200 900 Q800 400 1400 900Z" fill="#0a0c14"/><g transform="rotate(-8 820 600)">${palm(820, 600, 300, '#06070c')}</g>${temple(620, 720, .8, '#06070c', true)}`) +
    L(.12, `<rect x="760" y="720" width="120" height="40" fill="#06070c"/>${glow(800, 705, 50, '#ffb04a', .7)}${glow(840, 705, 50, '#ffb04a', .7)}
      <rect x="796" y="700" width="6" height="22" fill="#e8dcc0"/><rect x="836" y="700" width="6" height="22" fill="#e8dcc0"/>
      <circle class="flicker" cx="799" cy="696" r="4" fill="#ffd27a"/><circle class="flicker" cx="839" cy="696" r="4" fill="#ffd27a"/>
      ${person(730, 760, 1, '#04050a')}${person(900, 762, .9, '#04050a')}`) + rain(r); },

  return: () => { const r = rng(37); let birds = ''; for (let i = 0; i < 9; i++) { const x = 900 + i * 40, y = 200 + Math.abs(i - 4) * 22;
    birds += `<path d="M${x} ${y} q8 -8 16 0 q8 -8 16 0" stroke="#3a3a55" stroke-width="2.5" fill="none"/>`; }
    return sky('rn', ['#6d8fbb', '#b9b6c0', '#f1cf94']) + glow(400, 560, 220, '#ffe2a0', .7) + `<circle cx="400" cy="570" r="70" fill="#fff0c8"/>` +
    L(.05, birds) +
    L(.08, `${chedi(1300, 600, 260, '#6e6a86')}${chedi(1380, 600, 300, '#6e6a86')}${chedi(1460, 600, 260, '#6e6a86')}`) +
    L(.12, treeline(r, 600, '#5a5674', 22)) + water(600, '#d9b58a', '#4d5a7a', 'rgba(255,255,255,.35)') +
    MV(1300, 250, `<g transform="scale(-1,1)">${boat(0, 700, 1.1, '#2b2a3e', false)}</g>`) +
    L(.5, reeds(r, 0, 300, 900, '#252336', 40, 200)); },
};

/* =========================================================
   2) AUDIO — เสียงบรรยากาศสังเคราะห์สด (ไม่ใช้ไฟล์)
   ========================================================= */
const A = { ctx: null, on: false, beds: {}, level: {} };
A.init = () => {
  if (A.ctx) return;
  const C = A.ctx = new (window.AudioContext || window.webkitAudioContext)();
  A.master = C.createGain(); A.master.gain.value = 0; A.master.connect(C.destination);
  const buf = C.createBuffer(1, C.sampleRate * 3, C.sampleRate), d = buf.getChannelData(0);
  let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; d[i] = w; }
  A.noise = buf;
  const brown = C.createBuffer(1, C.sampleRate * 3, C.sampleRate), b = brown.getChannelData(0);
  for (let i = 0; i < b.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; b[i] = last * 3.5; }
  const bed = name => { const g = C.createGain(); g.gain.value = 0; g.connect(A.master); A.beds[name] = g; A.level[name] = 0; return g; };
  const loop = (bf, rate = 1) => { const s = C.createBufferSource(); s.buffer = bf; s.loop = true; s.playbackRate.value = rate; s.start(); return s; };
  const lfo = (f, amt, target) => { const o = C.createOscillator(), g = C.createGain(); o.frequency.value = f; g.gain.value = amt; o.connect(g); g.connect(target); o.start(); };
  // river
  { const s = loop(brown), f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
    const g = C.createGain(); g.gain.value = .6; lfo(.13, .25, g.gain); s.connect(f); f.connect(g); g.connect(bed('river'));
    const s2 = loop(A.noise, .9), f2 = C.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 2400; f2.Q.value = 2;
    const g2 = C.createGain(); g2.gain.value = .03; lfo(.4, .025, g2.gain); s2.connect(f2); f2.connect(g2); g2.connect(A.beds.river); }
  // wind
  { const s = loop(A.noise), f = C.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 600; f.Q.value = .8;
    lfo(.07, 350, f.frequency); const g = C.createGain(); g.gain.value = .35; lfo(.11, .2, g.gain); s.connect(f); f.connect(g); g.connect(bed('wind')); }
  // storm
  { const s = loop(A.noise, .7), f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1800;
    const g = C.createGain(); g.gain.value = .25; s.connect(f); f.connect(g); g.connect(bed('storm')); }
  // ghost (beating sines)
  { const g = C.createGain(); g.gain.value = .04; lfo(.05, .035, g.gain);
    [311, 316.5, 466].forEach(fr => { const o = C.createOscillator(); o.type = 'sine'; o.frequency.value = fr; o.connect(g); o.start(); });
    g.connect(bed('ghost')); }
  // drone (temple)
  { const g = C.createGain(); g.gain.value = .05; [98, 147, 196.5].forEach(fr => { const o = C.createOscillator(); o.frequency.value = fr; o.connect(g); o.start(); });
    g.connect(bed('drone')); }
  bed('night'); bed('birds');
  setInterval(A.tick, 110);
};
A.env = (node, t, a, peak, dec) => { node.gain.setValueAtTime(0, t); node.gain.linearRampToValueAtTime(peak, t + a); node.gain.exponentialRampToValueAtTime(.0001, t + a + dec); };
A.tick = () => { if (!A.on) return; const C = A.ctx, t = C.currentTime;
  const n = A.level.night || 0, b = A.level.birds || 0, st = A.level.storm || 0, gh = A.level.ghost || 0;
  if (n > .05 && Math.random() < .35) { // cricket
    const o = C.createOscillator(), g = C.createGain(), p = C.createStereoPanner ? C.createStereoPanner() : null;
    o.frequency.value = 4200 + Math.random() * 900; o.connect(g);
    if (p) { p.pan.value = Math.random() * 2 - 1; g.connect(p); p.connect(A.beds.night); } else g.connect(A.beds.night);
    const k = 2 + (Math.random() * 4 | 0); g.gain.setValueAtTime(0, t);
    for (let i = 0; i < k; i++) { g.gain.linearRampToValueAtTime(.05, t + i * .05 + .01); g.gain.linearRampToValueAtTime(0, t + i * .05 + .035); }
    o.start(t); o.stop(t + k * .05 + .05); }
  if (n > .05 && Math.random() < .08) { // frog
    const o = C.createOscillator(), g = C.createGain(); o.type = 'square'; const f = 120 + Math.random() * 140;
    o.frequency.setValueAtTime(f * 1.4, t); o.frequency.exponentialRampToValueAtTime(f, t + .09);
    const lp = C.createBiquadFilter(); lp.frequency.value = 700; o.connect(lp); lp.connect(g); g.connect(A.beds.night);
    A.env(g, t, .01, .12, .14); o.start(t); o.stop(t + .2); }
  if (b > .05 && Math.random() < .07) { // bird
    const o = C.createOscillator(), g = C.createGain(); const f = 2200 + Math.random() * 1800;
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (Math.random() < .5 ? 1.5 : .7), t + .12);
    o.connect(g); g.connect(A.beds.birds); A.env(g, t, .01, .06, .15); o.start(t); o.stop(t + .2); }
  if (st > .1 && Math.random() < .006) A.fx('thunder', .6);
  if (gh > .1 && Math.random() < .012) A.fx('whistle', .5);
};
A.setBeds = obj => { if (!A.ctx) return; const t = A.ctx.currentTime;
  Object.keys(A.beds).forEach(k => { const v = (obj && obj[k]) || 0; A.level[k] = v; A.beds[k].gain.setTargetAtTime(v, t, 1.2); }); };
A.start = () => { A.init(); A.ctx.resume(); A.on = true; A.master.gain.setTargetAtTime(.85, A.ctx.currentTime, .5); };
A.toggle = () => { if (!A.ctx) return A.start();
  A.on = !A.on; A.master.gain.setTargetAtTime(A.on ? .85 : 0, A.ctx.currentTime, .3); if (A.on) A.ctx.resume(); };
A.fx = (name, vol = 1) => { if (!A.on) return; const C = A.ctx, t = C.currentTime, out = C.createGain(); out.gain.value = vol; out.connect(A.master);
  const noiseSrc = () => { const s = C.createBufferSource(); s.buffer = A.noise; return s; };
  if (name === 'gong') { [1, 2.32, 4.25, 5.41, 6.8].forEach((m, i) => { const o = C.createOscillator(), g = C.createGain();
      o.frequency.value = 196 * m; o.connect(g); g.connect(out); A.env(g, t, .005, .25 / (i + 1), 5 / (i * .6 + 1)); o.start(t); o.stop(t + 7); }); }
  if (name === 'thunder') { const s = noiseSrc(), f = C.createBiquadFilter(), g = C.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(80, t + 3);
    s.connect(f); f.connect(g); g.connect(out); A.env(g, t, .04, 1.2, 3.5); s.start(t); s.stop(t + 4.5); }
  if (name === 'splash') { const s = noiseSrc(), f = C.createBiquadFilter(), g = C.createGain(); f.type = 'bandpass'; f.frequency.setValueAtTime(1500, t); f.frequency.exponentialRampToValueAtTime(300, t + .8);
    s.connect(f); f.connect(g); g.connect(out); A.env(g, t, .01, 1.4, .9); s.start(t); s.stop(t + 1.2);
    const o = C.createOscillator(), g2 = C.createGain(); o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(40, t + .4); o.connect(g2); g2.connect(out); A.env(g2, t, .01, .8, .5); o.start(t); o.stop(t + .6); }
  if (name === 'slip') { const o = C.createOscillator(), g = C.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(2600, t + .25);
    o.connect(g); g.connect(out); A.env(g, t, .01, .15, .3); o.start(t); o.stop(t + .4); }
  if (name === 'catch') { const o = C.createOscillator(), g = C.createGain(); o.frequency.value = 1320; o.connect(g); g.connect(out); A.env(g, t, .005, .12, .6); o.start(t); o.stop(t + .7); }
  if (name === 'whoosh') { const s = noiseSrc(), f = C.createBiquadFilter(), g = C.createGain(); f.type = 'bandpass'; f.Q.value = 1.5; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2500, t + .6);
    s.connect(f); f.connect(g); g.connect(out); A.env(g, t, .2, .9, .6); s.start(t); s.stop(t + 1); }
  if (name === 'whistle' || name === 'ghost') { const o = C.createOscillator(), g = C.createGain(); const f = 500 + Math.random() * 300;
    o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 1.5, t + 1.2); o.frequency.linearRampToValueAtTime(f * .8, t + 2.6);
    const v = C.createOscillator(), vg = C.createGain(); v.frequency.value = 5; vg.gain.value = 12; v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + 3);
    o.connect(g); g.connect(out); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .8); g.gain.linearRampToValueAtTime(0, t + 2.8); o.start(t); o.stop(t + 3); }
};

/* =========================================================
   3) BUILD — สร้างหน้าเว็บจาก content.js
   ========================================================= */
const story = $('#story');
$('#gTitle').textContent = S.title; $('#gSub').textContent = S.subtitle; $('#gByline').textContent = S.byline;
document.title = `${S.title} — ${S.subtitle}`;

const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const beatHTML = (b, ch) => {
  if (b.t === 'verse') {
    const ls = b.lines.map(([a, c], i) => `<span class="${a ? '' : 'empty'}" style="transition-delay:${i * .35}s">${esc(a)}</span><span class="r" style="transition-delay:${i * .35 + .18}s">${esc(c)}</span>`).join('');
    return `<div class="card verse"><div class="vl">${ls}</div>${b.src ? `<div class="vsrc">— ${esc(b.src)}</div>` : ''}</div>`; }
  if (b.t === 'game') {
    const extra = b.game === 'candle' ? `<button class="hold">แตะค้าง · บังลม</button>` : '';
    return `<div class="card game" data-game="${b.game}"><p>${esc(b.p || '')}</p>${b.game !== 'fireflies' ? `<canvas></canvas>${extra}<div class="gmsg"></div>` : ''}</div>`; }
  if (b.t === 'fx') return `<div class="card fx">${esc(b.p || '')}</div>`;
  if (b.t === 'map') return `<div class="card map">${MAP_SVG}<p>${esc(b.p)}</p></div>`;
  return `<div class="card">${b.h ? `<h3>${esc(b.h)}</h3>` : ''}<p>${esc(b.p)}</p></div>`;
};
const MAP_SVG = `<svg viewBox="0 0 600 300"><g fill="none" stroke="#5a3d1e" stroke-width="2">
  <path d="M60 0 C100 80 30 150 80 300" stroke-width="10" stroke="#8aa0a8" opacity=".6"/>
  <path d="M90 150 C200 120 260 210 360 170 S500 110 530 140" stroke-dasharray="6 8"/></g>
  <g fill="#5a3d1e" font-family="Trirong" font-size="16">
  <text x="20" y="290">แม่น้ำ</text>${chedi(110, 165, 70, '#5a3d1e')}<text x="70" y="190">วัดใหญ่</text>
  ${palm(300, 200, 70, '#5a3d1e')}${palm(330, 205, 55, '#5a3d1e')}<text x="270" y="230">ดงตาล</text>
  ${palm(520, 128, 80, '#5a3d1e')}<text x="470" y="175">เนินตาลโดด</text></g>
  <g stroke="#b5452f" stroke-width="5"><line x1="535" y1="135" x2="555" y2="155"/><line x1="555" y1="135" x2="535" y2="155"/></g>
  <text x="300" y="40" text-anchor="middle" font-family="Charm" font-size="30" fill="#3a2812">ลายแทง</text></svg>`;

const chapters = [];
S.chapters.forEach((ch, i) => {
  const sec = document.createElement('section'); sec.className = 'chapter'; sec.id = 'ch-' + ch.id;
  const beats = (i === 0 ? [{ t: 'narr', p: S.intro }] : []).concat(ch.beats);
  sec.innerHTML = `<div class="stage"><svg class="art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">${DEFS}${(ART[ch.art] || ART.depart)()}</svg>${ch.art === 'fireflies' ? '<canvas class="ffc"></canvas>' : ''}</div>
    <div class="beats"><div class="beat head"><div class="chap-head"><div class="no">บทที่ ${thaiNum(i + 1)}</div><h2>${esc(ch.title)}</h2><div class="place">${esc(ch.place)}</div></div></div>
    ${beats.map((b, j) => `<div class="beat" data-j="${j}">${beatHTML(b, ch)}</div>`).join('')}</div>`;
  story.appendChild(sec);
  chapters.push({ ch, el: sec, beats, i,
    layers: [...sec.querySelectorAll('.L')].map(g => ({ g, d: +g.dataset.d })),
    movers: [...sec.querySelectorAll('.mv')].map(g => ({ g, x0: +g.dataset.x0, x1: +g.dataset.x1 })) });
});
const out = document.createElement('section'); out.className = 'outro';
out.innerHTML = `<h2>${esc(S.outro.h)}</h2>${S.outro.p.map(p => `<p>${esc(p)}</p>`).join('')}
  <p class="credit">${esc(S.outro.credit)}</p><button class="btn btn-ghost again">↑ อ่านอีกครั้ง</button>`;
story.appendChild(out);
$('.again', out).onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

// menu
const menu = $('#menu');
menu.innerHTML = S.chapters.map((c, i) => `<a href="#ch-${c.id}" data-i="${i}"><b>${thaiNum(i + 1)}</b>${esc(c.title)}<small>${esc(c.day)}</small></a>`).join('');
$('#menuBtn').onclick = () => { menu.hidden = !menu.hidden; };
menu.onclick = e => { if (e.target.closest('a')) menu.hidden = true; };

/* =========================================================
   4) SCROLL ENGINE
   ========================================================= */
let active = -1, vh = innerHeight;
addEventListener('resize', () => { vh = innerHeight; });
const hudFill = $('#hudFill');
const frame = () => {
  const mid = vh / 2;
  chapters.forEach(c => {
    const r = c.el.getBoundingClientRect();
    if (r.bottom < -50 || r.top > vh + 50) return;
    const p = clamp(-r.top / Math.max(1, r.height - vh)); c.p = p;
    c.layers.forEach(({ g, d }) => { g.style.transform = `translate(${(-p * d * 260).toFixed(1)}px,${(p * d * 120).toFixed(1)}px)`; });
    c.movers.forEach(({ g, x0, x1 }) => { g.style.transform = `translate(${(x0 + (x1 - x0) * p).toFixed(1)}px,0)`; });
    if (r.top <= mid && r.bottom > mid && active !== c.i) setActive(c.i);
  });
  const docH = document.documentElement.scrollHeight - vh;
  hudFill.style.width = (clamp(scrollY / Math.max(1, docH)) * 100) + '%';
  if (out.getBoundingClientRect().top < mid && active !== -2) { active = -2; A.setBeds({ river: .2, drone: .08 }); }
};
let ticking = false;
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); } }, { passive: true });
const setActive = i => { active = i; const c = chapters[i];
  $('#hudNo').textContent = thaiNum(i + 1); $('#hudTitle').textContent = c.ch.title; $('#hudDay').textContent = c.ch.day;
  menu.querySelectorAll('a').forEach(a => a.classList.toggle('cur', +a.dataset.i === i));
  A.setBeds(c.ch.sound); };

// beats in/out
const io = new IntersectionObserver(es => es.forEach(e => {
  const el = e.target;
  if (e.isIntersecting) {
    if (el.classList.contains('in')) return; el.classList.add('in');
    const sec = el.closest('.chapter'), c = chapters.find(x => x.el === sec);
    const b = el.dataset.j != null ? c.beats[+el.dataset.j] : null;
    if (!b) return;
    if (b.fx) runFx(b.fx, c);
    if (b.t === 'game') startGame($('.card.game', el), b.game, c);
  } else if (e.intersectionRatio === 0) {
    el.classList.remove('in');
    const sec = el.closest('.chapter'); const c = chapters.find(x => x.el === sec);
    const b = el.dataset.j != null ? c.beats[+el.dataset.j] : null;
    if (b && b.fx === 'buffalo') sec.classList.remove('buf');
  }
}), { threshold: [0, .4] });
document.querySelectorAll('.beat').forEach(b => io.observe(b));

const flash = () => { const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); };
const shake = c => { c.el.classList.remove('shake'); void c.el.offsetWidth; c.el.classList.add('shake'); navigator.vibrate && navigator.vibrate(120); };
const runFx = (fx, c) => {
  if (fx === 'buffalo') { c.el.classList.add('buf'); A.fx('splash'); setTimeout(() => shake(c), 120); return; }
  if (fx === 'thunder') { A.fx('thunder'); flash(); shake(c); return; }
  A.fx(fx);
};

/* =========================================================
   5) GAMES
   ========================================================= */
const fitCanvas = cv => { const dpr = Math.min(2, devicePixelRatio || 1), r = cv.getBoundingClientRect();
  cv.width = r.width * dpr; cv.height = r.height * dpr; const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); return { x, w: r.width, h: r.height }; };

// ---- หิ่งห้อย: ทำงานตลอดเมื่ออยู่ในบท ----
(() => { const c = chapters.find(c => c.ch.art === 'fireflies'); if (!c) return;
  const cv = $('.ffc', c.el); let g, flies = [], ptr = null, ptrT = 0;
  const reset = () => { g = fitCanvas(cv); flies = Array.from({ length: 70 }, () => ({ x: Math.random() * g.w, y: g.h * (.45 + Math.random() * .5), vx: 0, vy: 0, ph: Math.random() * 6.3 })); };
  reset(); addEventListener('resize', reset);
  const mv = e => { if (active !== c.i) return; const t = e.touches ? e.touches[0] : e; ptr = { x: t.clientX, y: t.clientY }; ptrT = performance.now(); };
  addEventListener('pointermove', mv, { passive: true }); addEventListener('pointerdown', mv, { passive: true }); addEventListener('touchmove', mv, { passive: true });
  const loop = now => { requestAnimationFrame(loop); if (active !== c.i) return;
    const x = g.x; x.clearRect(0, 0, g.w, g.h); const near = ptr && now - ptrT < 2500;
    flies.forEach(f => { f.ph += .03 + Math.random() * .02;
      if (near) { const dx = ptr.x - f.x, dy = ptr.y - f.y, d = Math.hypot(dx, dy) + 1; f.vx += dx / d * .12; f.vy += dy / d * .12; }
      f.vx += (Math.random() - .5) * .15; f.vy += (Math.random() - .5) * .15; f.vx *= .96; f.vy *= .96; f.x += f.vx; f.y += f.vy;
      if (f.x < 0) f.x = g.w; if (f.x > g.w) f.x = 0; if (f.y < g.h * .2) f.vy += .1; if (f.y > g.h) f.vy -= .2;
      const a = .35 + .65 * Math.max(0, Math.sin(f.ph)); const gr = x.createRadialGradient(f.x, f.y, 0, f.x, f.y, 14);
      gr.addColorStop(0, `rgba(230,255,140,${a})`); gr.addColorStop(1, 'rgba(180,255,80,0)'); x.fillStyle = gr; x.fillRect(f.x - 14, f.y - 14, 28, 28); });
  }; requestAnimationFrame(loop);
})();

const started = new WeakSet();
const startGame = (card, kind, c) => { if (started.has(card)) return; started.add(card);
  if (kind === 'mercury') mercury(card); if (kind === 'candle') candle(card, c); };

// ---- จับปรอท: จับได้แล้วลื่นหลุดทุกครั้ง ----
function mercury(card) {
  const cv = $('canvas', card), msg = $('.gmsg', card); let g = fitCanvas(cv), lost = 0, drops;
  const make = () => { drops = [0, 1, 2].map(i => ({ x: g.w * (.25 + i * .25), y: g.h * (.45 + (i % 2) * .15), r: 16, s: 'free', t: 0, vx: 0, vy: 0, ph: Math.random() * 6 })); lost = 0; msg.textContent = 'ปรอทสามหยดกลิ้งอยู่บนน้ำผึ้ง…'; };
  make();
  cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    if (lost >= 3) { make(); return; }
    drops.forEach(d => { if (d.s === 'free' && Math.hypot(px - d.x, py - d.y) < d.r + 18) { d.s = 'caught'; d.t = performance.now(); A.fx('catch', .7); msg.textContent = 'จับได้แล้ว!'; } }); });
  const loop = now => { if (!card.isConnected) return; requestAnimationFrame(loop); const x = g.x; x.clearRect(0, 0, g.w, g.h);
    const hg = x.createLinearGradient(0, g.h * .6, 0, g.h); hg.addColorStop(0, 'rgba(200,140,40,.0)'); hg.addColorStop(1, 'rgba(200,140,40,.35)'); x.fillStyle = hg; x.fillRect(0, 0, g.w, g.h);
    drops.forEach(d => { d.ph += .05;
      if (d.s === 'free') { d.x += Math.sin(d.ph) * .4; d.y += Math.cos(d.ph * .7) * .3; }
      if (d.s === 'caught') { d.x += (g.w / 2 - d.x) * .1; d.y += (g.h / 2 - d.y) * .1;
        if (now - d.t > 700) { d.s = 'slip'; const a = Math.random() * 6.28; d.vx = Math.cos(a) * 9; d.vy = Math.sin(a) * 9; A.fx('slip'); msg.textContent = '…ลื่นหลุด!'; } }
      if (d.s === 'slip') { d.x += d.vx; d.y += d.vy; d.vx *= 1.02; d.vy *= 1.02;
        if (d.x < -40 || d.x > g.w + 40 || d.y < -40 || d.y > g.h + 40) { d.s = 'gone'; lost++;
          msg.textContent = lost >= 3 ? 'ได้มาสามหยด แล้วก็หลุดหายไปหมด · แตะเพื่อลองใหม่' : `หลุดไป ${thaiNum(lost)} หยด`; } }
      if (d.s === 'gone') return;
      const wob = 1 + Math.sin(d.ph * 3) * .08, gr = x.createRadialGradient(d.x - 5, d.y - 6, 2, d.x, d.y, d.r * 1.2);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, '#c9d2dc'); gr.addColorStop(1, '#4a5563'); x.fillStyle = gr;
      x.beginPath(); x.ellipse(d.x, d.y, d.r * wob, d.r / wob, 0, 0, 6.29); x.fill();
      if (d.s === 'caught') { x.strokeStyle = 'rgba(241,212,138,.8)'; x.lineWidth = 2; x.beginPath(); x.arc(d.x, d.y, d.r + 8, 0, 6.29); x.stroke(); } });
  }; requestAnimationFrame(loop);
  addEventListener('resize', () => { g = fitCanvas(cv); });
}

// ---- บังเทียน: สุดท้ายพายุก็พัดดับ ----
function candle(card, c) {
  const cv = $('canvas', card), msg = $('.gmsg', card), btn = $('.hold', card); let g = fitCanvas(cv);
  let hold = false, life, t0, outT, smoke = [];
  const reset = () => { life = 1; t0 = performance.now(); outT = 0; smoke = []; msg.textContent = 'ลมเริ่มแรงขึ้น…'; btn.textContent = 'แตะค้าง · บังลม'; };
  reset();
  const down = e => { e.preventDefault(); if (outT) { reset(); return; } hold = true; btn.classList.add('on'); };
  const up = () => { hold = false; btn.classList.remove('on'); };
  btn.addEventListener('pointerdown', down); addEventListener('pointerup', up); addEventListener('pointercancel', up);
  const loop = now => { if (!card.isConnected) return; requestAnimationFrame(loop); const x = g.x, w = g.w, h = g.h; x.clearRect(0, 0, w, h);
    const el = (now - t0) / 1000, wind = clamp(el / 7);
    if (!outT) { life -= (hold ? .0015 : .006) * (.4 + wind * 2); if (el > 7.5) life = 0;
      if (life <= 0) { outT = now; msg.textContent = 'พายุพัดเทียนดับ เครื่องบูชาและลายแทงปลิวหาย · แตะเพื่อลองใหม่'; btn.textContent = 'ลองใหม่';
        A.fx('whoosh'); setTimeout(() => { A.fx('thunder'); flash(); shake(c); }, 350); } }
    // candle body
    const cx = w / 2, base = h * .85; x.fillStyle = '#e9dcc0'; x.fillRect(cx - 9, base - 80, 18, 80); x.fillStyle = '#2a2a2a'; x.fillRect(cx - 1, base - 88, 2, 9);
    if (!outT) { const sway = Math.sin(now / 90) * (hold ? 2 : 6) * (.3 + wind) + (hold ? 0 : wind * 10), fl = 28 * life * (.85 + Math.random() * .15);
      const gr = x.createRadialGradient(cx + sway / 2, base - 100, 2, cx, base - 100, 70 * life); gr.addColorStop(0, 'rgba(255,200,90,.55)'); gr.addColorStop(1, 'rgba(255,160,60,0)');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
      x.fillStyle = '#ffd27a'; x.beginPath(); x.moveTo(cx - 6, base - 90); x.quadraticCurveTo(cx - 8, base - 90 - fl * .6, cx + sway, base - 90 - fl); x.quadraticCurveTo(cx + 8, base - 90 - fl * .6, cx + 6, base - 90); x.fill();
      if (hold) { x.strokeStyle = 'rgba(239,230,210,.5)'; x.lineWidth = 3; x.beginPath(); x.arc(cx - 24, base - 95, 30, Math.PI * .6, Math.PI * 1.4); x.stroke(); }
    } else { if (smoke.length < 40 && Math.random() < .5) smoke.push({ x: cx, y: base - 90, a: .5, vx: (Math.random() - .3) * .8 });
      smoke.forEach(s => { s.y -= .8; s.x += s.vx + .6; s.a *= .985; x.fillStyle = `rgba(200,200,210,${s.a})`; x.beginPath(); x.arc(s.x, s.y, 6, 0, 6.29); x.fill(); }); }
    // wind streaks
    x.strokeStyle = `rgba(200,215,255,${.15 + wind * .35})`; x.lineWidth = 1.5;
    for (let i = 0; i < 6 + wind * 14; i++) { const yy = (i * 37 + now / 3) % h, xx = (now * (.6 + wind) + i * 120) % (w + 200) - 100; x.beginPath(); x.moveTo(xx, yy); x.lineTo(xx + 40 + wind * 60, yy - 6); x.stroke(); }
  }; requestAnimationFrame(loop);
  addEventListener('resize', () => { g = fitCanvas(cv); });
}

/* =========================================================
   6) GATE + ลมฟ้าแลบในบทพายุ
   ========================================================= */
const begin = withSound => { document.body.classList.remove('locked'); $('#gate').classList.add('gone'); $('#hud').classList.add('on');
  if (withSound) A.start(); $('#muteBtn').textContent = withSound ? '🔊' : '🔇'; frame(); };
document.body.classList.add('locked');
$('#startSound').onclick = () => begin(true);
$('#startQuiet').onclick = () => begin(false);
$('#muteBtn').onclick = () => { A.toggle(); $('#muteBtn').textContent = A.on ? '🔊' : '🔇'; if (A.on && active >= 0) A.setBeds(chapters[active].ch.sound); };
setInterval(() => { if (active < 0) return; const c = chapters[active]; if ((c.ch.sound.storm || 0) > .3 && Math.random() < .25) { flash(); A.fx('thunder', .5); } }, 4000);
frame();
})();
