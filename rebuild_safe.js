/**
 * REBUILD ADVENTURE – SAFE VERSION
 * Uses char-position-based surgery, not fragile string.replace()
 * Injects CSS into the SECOND </style> (char 94681) which is the adventure CSS block.
 * Replaces adventure script engine using exact function boundaries.
 */
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// =====================================================
// PART 1: INJECT NEW CSS into 2nd </style> at char 94681
// =====================================================
const NEW_CSS = `
    /* =====================================================
       KOROSI ADVENTURE v2 – 3D VIEWER + MAGNIFIER + MULTI-STEP
       ===================================================== */

    /* Step tracker pills */
    .adv-steps-bar {
      display: flex; align-items: center; gap: 4px;
      justify-content: center; flex-wrap: wrap; margin-bottom: 6px;
    }
    .adv-step-pill {
      padding: 3px 10px; border-radius: 999px; font-size: 0.72rem;
      font-weight: 800; border: 2px solid #c9a06a;
      background: #fff8ee; color: #7c4a1a; transition: background 0.2s, color 0.2s;
    }
    .adv-step-pill.active { background: #f29400; color: #fff; border-color: #a85f00; }
    .adv-step-pill.done { background: #22c55e; color: #fff; border-color: #15803d; }
    .adv-step-arrow { color: #c9a06a; font-size: 0.75rem; }

    /* Full-width play layout */
    .adv-play-full {
      display: flex; flex-direction: column; width: 100%;
      max-width: 900px; gap: 10px; flex: 1;
    }

    /* 3D Viewer */
    .adv-3d-viewer-wrap {
      position: relative; width: 100%;
      background: linear-gradient(160deg, #1e3a5f 0%, #0f1f36 60%, #122240 100%);
      border-radius: 18px; border: 3px solid #5a3a1a;
      box-shadow: 0 8px 0 #3e2710, 0 12px 24px rgba(0,0,0,0.3);
      overflow: hidden; cursor: grab; touch-action: none; user-select: none;
    }
    .adv-3d-viewer-wrap:active { cursor: grabbing; }
    .adv-3d-canvas { display: block; width: 100%; }
    .adv-rotate-hint {
      position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.6); color: #fde047; font-size: 0.7rem;
      font-weight: 800; padding: 3px 10px; border-radius: 999px;
      pointer-events: none; animation: hintFade 3.5s ease-in-out forwards; white-space: nowrap;
    }
    @keyframes hintFade { 0%,60%{opacity:1} 100%{opacity:0} }

    /* Magnifier */
    .adv-magnifier {
      position: absolute; width: 110px; height: 110px; border-radius: 50%;
      border: 5px solid #d4a366;
      box-shadow: 0 0 0 2px #7c4a1a, 0 6px 18px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.6);
      background: radial-gradient(circle at 35% 35%, #1e3a5f, #0a1428);
      overflow: hidden; pointer-events: none;
      transform: translate(-50%, -50%); display: none;
    }
    .adv-magnifier.visible { display: block; }
    .adv-magnifier-glass { width: 100%; height: 100%; position: relative; }
    .adv-magnifier-glare {
      position: absolute; inset: 0; border-radius: 50%;
      background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
      pointer-events: none;
    }
    .adv-magnifier-handle {
      position: absolute; bottom: -18px; right: -14px;
      width: 14px; height: 42px;
      background: linear-gradient(180deg, #d97706, #92400e);
      border-radius: 6px; transform: rotate(-40deg);
      border: 2px solid #451a03; box-shadow: 2px 3px 5px rgba(0,0,0,0.4);
    }

    /* Hotspot clickable areas */
    .adv-hotspot-area {
      position: absolute; border-radius: 50%;
      border: 2.5px dashed rgba(255,255,255,0.5);
      background: rgba(255,255,255,0.08); cursor: pointer;
      pointer-events: all; transition: background 0.2s, border-color 0.2s;
      animation: advHotspotPulseGlow 2.2s infinite ease-in-out;
      display: flex; align-items: center; justify-content: center;
    }
    .adv-hotspot-area.rust { border-color: rgba(249,115,22,0.6); background: rgba(249,115,22,0.12); }
    .adv-hotspot-area.rust:hover { background: rgba(249,115,22,0.3); }
    .adv-hotspot-area.clean { border-color: rgba(74,222,128,0.5); background: rgba(74,222,128,0.1); }
    .adv-hotspot-area.clean:hover { background: rgba(74,222,128,0.25); }
    .adv-hotspot-area.tagged.rust { border-style: solid; border-color: #f97316; background: rgba(249,115,22,0.35); }
    .adv-hotspot-area.tagged.clean { border-style: solid; border-color: #22c55e; background: rgba(34,197,94,0.25); }
    @keyframes advHotspotPulseGlow {
      0%,100%{box-shadow: 0 0 0 0 rgba(249,115,22,0.4);}
      50%{box-shadow: 0 0 0 7px rgba(249,115,22,0);}
    }
    .adv-hotspot-icon { font-size: 1.1rem; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6)); }

    /* Viewer toolbar */
    .adv-viewer-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
    .adv-mag-toggle {
      display: inline-flex; align-items: center; gap: 5px;
      background: #fff8ee; border: 2px solid #d97706; border-radius: 999px;
      padding: 4px 12px; font-size: 0.78rem; font-weight: 800; color: #92400e;
      cursor: pointer; transition: background 0.2s; box-shadow: 0 2px 0 #b45309;
    }
    .adv-mag-toggle:active { transform: translateY(1px); box-shadow: none; }
    .adv-mag-toggle.on { background: #fef3c7; border-color: #f59e0b; }
    .adv-view-hint-text { font-size: 0.75rem; color: #78350f; font-weight: 700; }

    /* Activity panel */
    .adv-activity-panel {
      background: #fffdf5; border: 3px solid #5a3a1a; border-radius: 18px;
      box-shadow: 0 6px 0 #3e2710; padding: 14px 16px; flex: 1;
    }
    .adv-activity-title { font-family: var(--font-display); font-size: 1.0rem; color: #3f1e00; margin: 0 0 10px 0; }
    .adv-activity-instruction {
      font-size: 0.84rem; color: #5a2e04; line-height: 1.5; margin-bottom: 10px;
      background: #fef9ee; border-left: 4px solid #f59e0b; padding: 7px 10px; border-radius: 0 8px 8px 0;
    }

    /* Matching pairs */
    .adv-id-pairs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
    .adv-id-left, .adv-id-right { display: flex; flex-direction: column; gap: 6px; }
    .adv-id-item {
      border: 2px solid #d0c2ad; border-radius: 10px; padding: 7px 10px;
      font-size: 0.8rem; font-weight: 700; background: #fff; text-align: center;
      min-height: 36px; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background 0.15s;
    }
    .adv-id-item.selected { background: #fef3c7; border-color: #f59e0b; }
    .adv-id-item.matched { background: #f0fdf4; border-color: #22c55e; color: #15803d; cursor: default; }
    .adv-id-item.error { background: #fef2f2; border-color: #ef4444; }

    /* Decision visual cards */
    .adv-decision-visual-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px; margin-bottom: 12px;
    }
    .adv-dec-card {
      border: 3px solid #d0c2ad; border-radius: 14px; padding: 10px 8px;
      background: #fff; text-align: center; cursor: pointer;
      transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 0 #c9a06a;
    }
    .adv-dec-card:hover { transform: translateY(-3px); border-color: #f59e0b; }
    .adv-dec-card.selected { border-color: #2563eb; background: #eff6ff; box-shadow: 0 4px 0 #1d4ed8; }
    .adv-dec-card.correct { border-color: #22c55e; background: #f0fdf4; box-shadow: 0 4px 0 #15803d; }
    .adv-dec-card.wrong { border-color: #ef4444; background: #fef2f2; box-shadow: 0 4px 0 #b91c1c; }
    .adv-dec-visual { font-size: 2.4rem; display: block; margin-bottom: 6px; }
    .adv-dec-name { font-size: 0.78rem; font-weight: 800; color: #3b1900; line-height: 1.3; }
    .adv-dec-tag {
      display: inline-block; margin-top: 5px; font-size: 0.65rem;
      padding: 1px 7px; border-radius: 999px; font-weight: 800;
    }
    .adv-dec-tag.eff { background: #e0f2fe; color: #0369a1; }
    .adv-dec-tag.cost { background: #fef3c7; color: #b45309; }
    .adv-dec-tag.env { background: #dcfce7; color: #15803d; }

    /* Checkbox factor select */
    .adv-drag-area { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }

    /* Result animation */
    .adv-result-animation {
      text-align: center; padding: 16px;
      animation: advResultPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes advResultPop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .adv-result-icon { font-size: 3rem; display: block; margin-bottom: 8px; }
    .adv-result-title { font-family: var(--font-display); font-size: 1.2rem; color: #2b1c0a; margin-bottom: 6px; }
    .adv-result-change {
      display: flex; align-items: center; justify-content: center;
      gap: 16px; margin: 14px 0; flex-wrap: wrap;
    }
    .adv-result-before, .adv-result-after { text-align: center; font-size: 0.75rem; font-weight: 800; }
    .adv-result-arrow { font-size: 1.5rem; color: #22c55e; }

    /* Nav row */
    .adv-nav-row {
      display: flex; gap: 8px; flex-wrap: wrap;
      justify-content: space-between; align-items: center; margin-top: 10px;
    }

    /* Score */
    #advScoreDisplay { font-size: 0.8rem; font-weight: 800; color: #78350f; }

    /* Responsive */
    @media (max-width: 600px) {
      .adv-id-pairs { grid-template-columns: 1fr; }
      .adv-decision-visual-grid { grid-template-columns: repeat(2, 1fr); }
      .adv-magnifier { width: 90px; height: 90px; }
      .adv-activity-panel { padding: 10px 12px; }
      .adv-3d-viewer-wrap { border-radius: 14px; }
    }
`;

// Find the SECOND </style> tag (the last one before <script>)
const stylePositions = [];
let searchPos = 0;
while ((searchPos = html.indexOf('</style>', searchPos)) !== -1) {
  stylePositions.push(searchPos);
  searchPos++;
}
console.log('</style> found at:', stylePositions);
// Use the last </style> before <script>
const scriptIdx = html.indexOf('<script');
const targetStyleEnd = stylePositions.filter(p => p < scriptIdx).slice(-1)[0];
console.log('Target </style> for CSS injection:', targetStyleEnd);

// Inject CSS before the target </style>
html = html.substring(0, targetStyleEnd) + NEW_CSS + '\n  ' + html.substring(targetStyleEnd);
console.log('CSS injected. New size:', html.length);

// =====================================================
// PART 2: REPLACE #advPlay HTML SECTION
// =====================================================
const OLD_PLAY_MARKER_START = '<section class="screen adv-screen" id="advPlay"';
// Use the FINAL GAME: VICTORY comment as end marker — robust regardless of \r\n vs \n
const VICTORY_COMMENT = '<!-- FINAL GAME: VICTORY';
const playHtmlStart = html.indexOf(OLD_PLAY_MARKER_START);
// Find the </section> that immediately precedes the VICTORY comment
const victoryCommentPos = html.indexOf(VICTORY_COMMENT, playHtmlStart);
// Search backwards from victoryCommentPos for the </section>
const playHtmlEnd = html.lastIndexOf('</section>', victoryCommentPos) + '</section>'.length;
// Now playHtmlEnd points to right AFTER the </section> that closes advPlay
if (playHtmlStart === -1 || victoryCommentPos === -1) {
  console.error('Cannot find #advPlay section!', playHtmlStart, victoryCommentPos);
  process.exit(1);
}
console.log('playHtmlStart:', playHtmlStart, '| playHtmlEnd:', playHtmlEnd, '| victoryCommentPos:', victoryCommentPos);

const NEW_PLAY_HTML = `<section class="screen adv-screen" id="advPlay" aria-label="Eksplorasi Area" hidden>
      <div class="adv-head">
        <button class="circle" id="advPlayBack" aria-label="Kembali ke peta petualangan">
          <svg viewBox="0 0 24 24"><path d="M20 12H5M11 5l-7 7 7 7"/></svg>
        </button>
        <h2 class="adv-title-ribbon" id="advPlayTitle">Area 1: Taman Sekolah</h2>
        <span class="spacer"></span>
      </div>
      <div class="adv-steps-bar" id="advStepsBar"></div>
      <div class="adv-play-full">
        <div class="adv-viewer-toolbar">
          <button class="adv-mag-toggle" id="advMagToggle">🔍 Kaca Pembesar: <span id="advMagToggleLabel">OFF</span></button>
          <span class="adv-view-hint-text" id="advViewHint">↔ Seret untuk memutar objek</span>
        </div>
        <div class="adv-3d-viewer-wrap" id="adv3dViewerWrap">
          <canvas class="adv-3d-canvas" id="adv3dCanvas"></canvas>
          <div class="adv-rotate-hint" id="advRotateHint">↔ Seret / geser untuk memutar dan amati objek dari berbagai sudut!</div>
          <div id="advHotspotOverlay" style="position:absolute;inset:0;pointer-events:none;"></div>
          <div style="position:absolute;inset:0;pointer-events:none;z-index:20;" id="advMagWrap">
            <div class="adv-magnifier" id="advMagnifier">
              <div class="adv-magnifier-glass" id="advMagnifierGlass"></div>
              <div class="adv-magnifier-glare"></div>
              <div class="adv-magnifier-handle"></div>
            </div>
          </div>
        </div>
        <div class="adv-activity-panel" id="advActivityPanel">
          <h3 class="adv-activity-title" id="advActivityTitle">🔎 Langkah 1: Amati Objek</h3>
          <div class="adv-activity-instruction" id="advActivityInstruction">
            Putar objek dari berbagai sudut dan aktifkan Kaca Pembesar untuk memeriksa permukaan logam secara detail.
          </div>
          <div id="advActivityContent"></div>
          <div class="adv-feedback-box" id="advFeedbackBox"></div>
          <div class="adv-nav-row">
            <span id="advScoreDisplay">⭐ Poin: 0</span>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn-yellow" id="advCheckBtn" style="display:none;">✓ Periksa Jawaban</button>
              <button class="btn-green" id="advNextStepBtn">Lanjut →</button>
              <button class="btn-yellow" id="advFinishAreaBtn" hidden>🏆 Selesai!</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    `;

// Replace from playHtmlStart up to (not including) the whitespace+VICTORY comment
html = html.substring(0, playHtmlStart) + NEW_PLAY_HTML + '\n\n    ' + html.substring(victoryCommentPos);
console.log('advPlay HTML replaced. New size:', html.length);

// =====================================================
// PART 3: REPLACE ADVENTURE SCRIPT ENGINE
// Use precise boundaries within the <script> block
// =====================================================
// Find ADV_AREAS start and openAdvVictory start precisely
const ADV_AREAS_MARKER = 'var ADV_AREAS = {';
const advAreasPos = html.indexOf(ADV_AREAS_MARKER);
if (advAreasPos === -1) { console.error('Cannot find ADV_AREAS!'); process.exit(1); }

// Find the openAdvVictory function — keep it, replace everything FROM ADV_AREAS up TO it
const OPEN_ADV_VICTORY_MARKER = '\n      function openAdvVictory(';
const advVicPos = html.indexOf(OPEN_ADV_VICTORY_MARKER, advAreasPos);
if (advVicPos === -1) { console.error('Cannot find openAdvVictory!'); process.exit(1); }
console.log('ADV_AREAS at:', advAreasPos, '| openAdvVictory at:', advVicPos);

// Everything between advAreasPos and advVicPos gets replaced
const NEW_ENGINE = `var ADV_AREAS = {
        garden: {
          id: 'garden', title: 'Area 1: Taman Sekolah', obj: 'Pagar Besi Hias Taman',
          steps: [
            { id: 'observe',  label: '🔎 Amati',        title: '🔎 Langkah 1: Amati Pagar Besi' },
            { id: 'find',     label: '🎯 Temukan Karat', title: '🎯 Langkah 2: Temukan Bagian Berkarat' },
            { id: 'identify', label: '🧪 Identifikasi',  title: '🧪 Langkah 3: Identifikasi Proses Korosi' },
            { id: 'decide',   label: '⚖️ Putuskan',      title: '⚖️ Langkah 4: Pilih Tindakan Penanganan' },
            { id: 'result',   label: '✅ Hasil',          title: '✅ Hasil Tindakan' }
          ],
          hotspots: [
            { id: 'joint', label: 'Sambungan Jeruji', x: 42, y: 55, type: 'rust',
              magHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #7c2d12 0%, #9a3412 40%, #c2410c 70%, #78350f 100%);display:flex;align-items:center;justify-content:center;font-size:2.2rem;">🟫</div>',
              magDesc: 'Korosi parah! Sambungan logam menggabungkan dua permukaan — air menggenang di celah, mempercepat reaksi: Fe → Fe²⁺ + 2e⁻' },
            { id: 'lower', label: 'Batang Bawah', x: 28, y: 72, type: 'rust',
              magHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle at 40% 40%, #ea580c 0%, #9a3412 50%, #7c2d12 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟤</div>',
              magDesc: 'Batang bawah kontak tanah basah. Air+garam tanah = elektrolit konduktif → korosi galvanik dipercepat drastis.' },
            { id: 'upper', label: 'Batang Atas', x: 60, y: 25, type: 'clean',
              magHtml: '<div style="width:100%;height:100%;background:linear-gradient(135deg, #1e293b 0%, #475569 50%, #94a3b8 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🩶</div>',
              magDesc: 'Permukaan masih bersih dan berkilau. Jauh dari tanah dan air. Besi belum teroksidasi di bagian ini.' },
            { id: 'paint', label: 'Area Bercat', x: 75, y: 45, type: 'clean',
              magHtml: '<div style="width:100%;height:100%;background:linear-gradient(135deg, #15803d 0%, #16a34a 50%, #86efac 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟢</div>',
              magDesc: 'Cat membentuk barrier fisik kedap O₂ dan H₂O. Besi di balik cat masih terlindungi sepenuhnya.' }
          ],
          rustHotspots: ['joint', 'lower'],
          matchPairs: [
            { left: '🌧️ Air hujan & tanah basah', right: 'Elektrolit yang mempercepat korosi', key: 'A' },
            { left: '🔴 Warna merah-cokelat',     right: 'Fe₂O₃·nH₂O (karat besi)', key: 'B' },
            { left: '⚡ Oksidasi besi',           right: 'Fe → Fe²⁺ + 2e⁻', key: 'C' },
            { left: '💚 Cat pelindung',           right: 'Barrier fisik hambat O₂ dan H₂O', key: 'D' }
          ],
          decisions: [
            { id: 'primer', icon: '🖌️', name: 'Cat Primer Anti-Karat',
              tags: ['Efektivitas: Tinggi', 'Biaya: Ekonomis', 'Lingkungan: Ramah'], ok: true,
              why: 'Tepat! Cat primer membentuk lapisan isolasi fisik yang mencegah O₂ dan H₂O bersentuhan dengan besi. Formulasi low-VOC aman bagi tanaman di taman sekolah. Mendukung SDG 9 dan SDG 12.' },
            { id: 'chrome', icon: '✨', name: 'Pelapisan Krom Industri',
              tags: ['Efektivitas: Sangat Tinggi', 'Biaya: Sangat Mahal', 'Lingkungan: Berbahaya'], ok: false,
              why: 'Kurang tepat. Elektroplating krom menghasilkan limbah cair Cr⁶⁺ berbahaya bagi tanah dan akar tanaman di sekitar taman sekolah. Bertentangan dengan SDG 12.' },
            { id: 'pvc', icon: '🧴', name: 'Selubung Plastik PVC',
              tags: ['Efektivitas: Sedang', 'Biaya: Sedang', 'Lingkungan: Mikroplastik'], ok: false,
              why: 'Kurang tepat. PVC getas kena sinar UV. Air hujan merembes ke balik plastik, karat tumbuh tersembunyi dari dalam. Limbah mikroplastik mencemari tanah.' }
          ],
          resultBefore: '🟫 Pagar Berkarat', resultAfter: '✅ Pagar Terlindungi',
          resultDesc: 'Cat primer membentuk lapisan barrier fisik antara besi dan lingkungan. Reaksi oksidasi Fe → Fe²⁺ + 2e⁻ terhenti karena O₂ dan H₂O tidak dapat mencapai permukaan logam.'
        },

        field: {
          id: 'field', title: 'Area 2: Lapangan Sekolah', obj: 'Peralatan Logam Lapangan',
          steps: [
            { id: 'observe',  label: '🔎 Amati',      title: '🔎 Langkah 1: Amati Peralatan Lapangan' },
            { id: 'compare',  label: '⚖️ Bandingkan', title: '⚖️ Langkah 2: Bandingkan Kondisi Objek' },
            { id: 'factors',  label: '🌦️ Faktor',     title: '🌦️ Langkah 3: Identifikasi Faktor Korosi' },
            { id: 'predict',  label: '🔮 Prediksi',    title: '🔮 Langkah 4: Prediksi Dampak Lingkungan' },
            { id: 'decide',   label: '⚖️ Putuskan',    title: '⚖️ Langkah 5: Pilih Pencegahan Terbaik' },
            { id: 'result',   label: '✅ Hasil',        title: '✅ Hasil Tindakan' }
          ],
          hotspots: [
            { id: 'goalpost', label: 'Tiang Gawang', x: 38, y: 30, type: 'rust',
              magHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #9a3412 0%, #c2410c 40%, #78350f 80%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟫</div>',
              magDesc: 'Pitting corrosion parah! Terkena hujan asam dan UV terus-menerus. Ion agresif menembus lapisan oksida dan membuat lubang-lubang mikro.' },
            { id: 'bench', label: 'Bangku Besi', x: 72, y: 62, type: 'rust',
              magHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #b45309 0%, #d97706 40%, #ca8a04 80%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟡</div>',
              magDesc: 'Korosi sedang di area teduh. Kelembapan tinggi + sedikit sinar matahari = permukaan tetap lembap → korosi merayap perlahan.' },
            { id: 'galv', label: 'Tiang Galvanis', x: 55, y: 45, type: 'clean',
              magHtml: '<div style="width:100%;height:100%;background:linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #e2e8f0 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🩶</div>',
              magDesc: 'Terlindungi! Lapisan Zn mengorbankan diri (anoda korban). E° Zn = -0,76V lebih negatif dari Fe = -0,44V → Zn teroksidasi duluan, besi aman.' }
          ],
          rustHotspots: ['goalpost', 'bench'],
          compareObjects: [
            { name: 'Tiang Gawang', icon: '⚽', kondisi: 'Korosi Parah', faktor: 'Hujan langsung, UV, benturan bola', level: 3 },
            { name: 'Bangku Besi', icon: '🪑', kondisi: 'Korosi Sedang', faktor: 'Kelembapan tinggi, area teduh', level: 2 },
            { name: 'Tiang Galvanis', icon: '🏳️', kondisi: 'Baik (Terlindungi)', faktor: 'Lapisan Zn anoda korban aktif', level: 0 }
          ],
          factorItems: ['🌧️ Hujan Asam', '☀️ Sinar UV', '💨 Kelembapan Tinggi', '🧂 Garam Mineral', '💥 Benturan Fisik', '🌡️ Suhu Tinggi Siang Hari'],
          factorCorrect: ['🌧️ Hujan Asam', '☀️ Sinar UV', '💨 Kelembapan Tinggi', '🧂 Garam Mineral', '💥 Benturan Fisik'],
          predictOptions: [
            { text: 'Jika hujan makin asam, korosi pada tiang yang tidak terlindungi akan makin cepat karena ion H⁺ meningkatkan konduktivitas elektrolit.', correct: true },
            { text: 'Jika tiang dicat biasa, korosi berhenti sepenuhnya karena cat menutup semua pori besi secara permanen.', correct: false },
            { text: 'Tiang galvanis tidak butuh perawatan apapun karena lapisan Zn tidak akan habis sama sekali selamanya.', correct: false }
          ],
          decisions: [
            { id: 'galvanize', icon: '🔩', name: 'Galvanisasi Celup Panas',
              tags: ['Ketahanan: 15–20 Th', 'Biaya: Hemat Panjang', 'Lingkungan: Berkelanjutan'], ok: true,
              why: 'Tepat! E° Zn²⁺/Zn = -0,76V lebih negatif dari Fe²⁺/Fe = -0,44V. Seng mengorbankan diri sebagai anoda korban, melindungi besi meski tergores benturan bola. Tahan 15-20 tahun tanpa perawatan. Mendukung SDG 9 dan SDG 12.' },
            { id: 'epoxy', icon: '🖌️', name: 'Cat Epoksi Tugas Berat',
              tags: ['Ketahanan: 2–3 Th', 'Biaya: Boros Berkala', 'Lingkungan: Limbah Thinner'], ok: false,
              why: 'Kurang tepat. Epoksi tidak memiliki proteksi anoda korban. Benturan bola meretakkan lapisan sehingga terjadi undercutting corrosion. Harus dicat ulang tiap 2-3 tahun, menghasilkan limbah cat.' },
            { id: 'stainless', icon: '✨', name: 'Ganti Stainless Steel',
              tags: ['Ketahanan: Sangat Tinggi', 'Biaya: 5x Lipat Anggaran', 'Lingkungan: Jejak C Masif'], ok: false,
              why: 'Kurang tepat. Biaya 5 kali lipat anggaran sekolah. Embodied carbon peleburan Ni-Cr masif, tidak proporsional untuk tiang olahraga sekolah. Kontra SDG 12.' }
          ],
          resultBefore: '🟫 Tiang Berkarat', resultAfter: '✅ Tiang Terlindungi 20 Th',
          resultDesc: 'Galvanisasi menciptakan proteksi katodik aktif. Zn (anoda korban) mengoksidasi diri lebih dulu: Zn → Zn²⁺ + 2e⁻, mengalirkan elektron ke besi dan mencegah besi teroksidasi bahkan saat permukaannya tergores.'
        },

        gate: {
          id: 'gate', title: 'Area 3: Gerbang Sekolah', obj: 'Gerbang Geser Sekolah',
          steps: [
            { id: 'observe',  label: '🔎 Amati',           title: '🔎 Langkah 1: Amati Gerbang Sekolah' },
            { id: 'find',     label: '🎯 Temukan',          title: '🎯 Langkah 2: Temukan Bagian Bermasalah' },
            { id: 'identify', label: '🧪 Analisis',         title: '🧪 Langkah 3: Analisis Kondisi dan Penyebab' },
            { id: 'decide',   label: '⚖️ Putuskan',         title: '⚖️ Langkah 4: Pilih Tindakan Penyelamatan' },
            { id: 'consider', label: '♻️ Keberlanjutan',    title: '♻️ Langkah 5: Pertimbangkan 4 Dimensi Keberlanjutan' },
            { id: 'result',   label: '✅ Hasil',             title: '✅ Hasil Penyelamatan' }
          ],
          hotspots: [
            { id: 'hinge', label: 'Engsel Pintu', x: 22, y: 48, type: 'rust',
              magHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #7c2d12 0%, #9a3412 35%, #c2410c 65%, #92400e 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟫</div>',
              magDesc: 'Gesekan terus-menerus menghilangkan lapisan oksida pelindung. Permukaan besi baru terus terekspos O₂ dan H₂O → korosi dipercepat masif.' },
            { id: 'wheel', label: 'Roda Rel Bawah', x: 50, y: 82, type: 'rust',
              magHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #ca8a04 0%, #b45309 40%, #9a3412 80%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟤</div>',
              magDesc: 'Roda langsung di atas tanah basah. Gesekan mekanis + elektrolit air tanah = kombinasi korosi paling parah di seluruh gerbang.' },
            { id: 'joint', label: 'Sambungan Las', x: 70, y: 38, type: 'rust',
              magHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #78350f 0%, #9a3412 45%, #c2410c 85%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🔴</div>',
              magDesc: 'Sambungan las memiliki tegangan sisa (residual stress). Stres mekanis mempercepat korosi intergranular di area sambungan.' },
            { id: 'panel', label: 'Panel Tengah', x: 45, y: 30, type: 'clean',
              magHtml: '<div style="width:100%;height:100%;background:linear-gradient(135deg, #1e293b 0%, #475569 50%, #94a3b8 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🩶</div>',
              magDesc: 'Panel tengah masih baik. Cat belum terkelupas, tidak ada gesekan mekanis, dan aliran udara baik mencegah penggumpalan uap air.' }
          ],
          rustHotspots: ['hinge', 'wheel', 'joint'],
          analysisFacts: [
            { icon: '⚙️', text: 'Engsel mengalami gesekan mekanis setiap kali gerbang dibuka-tutup', isCorrect: true },
            { icon: '💧', text: 'Roda rel selalu lembap karena kontak langsung dengan tanah', isCorrect: true },
            { icon: '⚡', text: 'Dua logam berbeda yang bersentuhan memicu korosi galvanik', isCorrect: true },
            { icon: '🔥', text: 'Suhu tinggi di siang hari membantu mengeringkan air secara alami', isCorrect: false }
          ],
          decisions: [
            { id: 'grease', icon: '🧈', name: 'Pelumas Gemuk Tahan Air',
              tags: ['Efektivitas: Sangat Tinggi', 'Biaya: Sangat Murah', 'Lingkungan: Ramah'], ok: true,
              why: 'Tepat! Gemuk kalsium/litium bersifat hidrofobik (menolak air) dan mengurangi gesekan mekanis. Mencegah kontak O₂ dan H₂O di celah engsel. Rutin 3-6 bulan. Mendukung SDG 12.' },
            { id: 'paint', icon: '🖌️', name: 'Cat Tebal di Celah Engsel',
              tags: ['Efektivitas: Merusak', 'Biaya: Rugi', 'Lingkungan: Serpihan Cat'], ok: false,
              why: 'Sangat salah! Cat mengering di celah engsel → engsel terkunci macet! Ketika dipaksa bergerak, cat rontok menjadi serpihan limbah dan engsel rusak total.' },
            { id: 'copper', icon: '🟡', name: 'Ganti Poros dengan Tembaga',
              tags: ['Efektivitas: Merusak', 'Biaya: Mahal', 'Kimia: Korosi Galvanik'], ok: false,
              why: 'Salah! E° Cu²⁺/Cu = +0,34V lebih tinggi dari Fe²⁺/Fe = -0,44V. Kontak tembaga-besi dalam larutan elektrolit → korosi galvanik masif! Rangka besi terkorosi jauh lebih cepat.' }
          ],
          sustainPillars: [
            { icon: '🎯', name: 'Efektivitas',
              q: 'Seberapa efektif pelumas menghentikan korosi pada engsel bergerak?',
              opts: ['Sangat efektif – melapisi celah mikro dan menolak air secara hidrofobik', 'Hanya efektif untuk permukaan diam, bukan komponen bergerak', 'Tidak efektif sama sekali pada logam yang sudah berkarat'], correct: 0 },
            { icon: '💰', name: 'Biaya',
              q: 'Bagaimana profil biaya pelumasan berkala dibanding ganti komponen?',
              opts: ['Sangat murah – sedikit pelumas untuk banyak manfaat', 'Sama mahalnya dengan mengganti seluruh engsel baru', 'Lebih mahal dari galvanisasi ulang seluruh gerbang'], correct: 0 },
            { icon: '⏱️', name: 'Ketahanan',
              q: 'Seberapa sering perlu melakukan pelumasan ulang?',
              opts: ['Tiap 3–6 bulan sekali sudah cukup', 'Harus dilakukan setiap hari', 'Sekali pakai seumur hidup, tidak perlu diulang'], correct: 0 },
            { icon: '🌿', name: 'Dampak Lingkungan',
              q: 'Apa dampak lingkungan dari pelumasan yang benar dan teratur?',
              opts: ['Sangat ramah – mencegah pembuangan komponen logam bekas', 'Menghasilkan limbah logam berat berbahaya', 'Merusak tanah dan air di sekitar gerbang sekolah'], correct: 0 }
          ],
          resultBefore: '⚙️ Gerbang Macet dan Berkarat', resultAfter: '✅ Gerbang Mulus dan Terlindungi',
          resultDesc: 'Pelumas gemuk membentuk film hidrofobik tipis di celah engsel dan roda. Film ini menolak molekul H₂O, mengurangi gesekan, dan menyumbat jalur masuk O₂ → reaksi korosi terhenti secara efektif.'
        }
      };

      /* ---- STATE VARIABLES ---- */
      var curAdvArea = null;
      var curAdvStep = 0;
      var advTotalScore = 0;
      var advTagged = {};
      var advMagOn = false;
      var adv3dRotX = 20;
      var adv3dRotY = -15;
      var advDecisionMade = false;
      var advSustainAnswers = {};
      var advPairSelected = { left: null, right: null };
      var advPairMatched = {};

      /* ---- PROGRESS (unchanged API, keeping original) ---- */
      function getAdvProgress() {
        try { return JSON.parse(localStorage.getItem('advProg') || '{}'); } catch (e) { return {}; }
      }
      function saveAdvProgress(pr) {
        try { localStorage.setItem('advProg', JSON.stringify(pr)); } catch (e) {}
      }
      function isAllAdvDone() {
        var pr = getAdvProgress();
        return !!(pr.garden && pr.field && pr.gate);
      }

      /* ---- HELPERS ---- */
      function advEsc(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      function advSetContent(id, h) { var el = document.getElementById(id); if (el) el.innerHTML = h; }
      function advSetText(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
      function advShowFb(type, h) {
        var fb = document.getElementById('advFeedbackBox');
        if (!fb) return;
        fb.className = 'adv-feedback-box show ' + type;
        fb.innerHTML = h;
        fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      function advHideFb() {
        var fb = document.getElementById('advFeedbackBox');
        if (fb) { fb.className = 'adv-feedback-box'; fb.innerHTML = ''; }
      }
      function advShowBtn(id, show) {
        var el = document.getElementById(id);
        if (!el) return;
        if (id === 'advCheckBtn') el.style.display = show ? '' : 'none';
        else el.hidden = !show;
      }
      function advUpdateScore() {
        advSetText('advScoreDisplay', '⭐ Poin: ' + advTotalScore);
      }

      /* ---- 3D CANVAS ---- */
      function adv3dSetup() {
        var canvas = document.getElementById('adv3dCanvas');
        if (!canvas) return;
        var wrap = canvas.parentElement;
        canvas.width = wrap.clientWidth || 500;
        canvas.height = Math.min(canvas.width * 0.5, 280);
        wrap.style.height = canvas.height + 'px';
      }

      function adv3dDraw() {
        var canvas = document.getElementById('adv3dCanvas');
        if (!canvas || !curAdvArea) return;
        var ctx = canvas.getContext('2d');
        var W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        var rx = adv3dRotX, ry = adv3dRotY;
        if (curAdvArea === 'garden') adv3dGarden(ctx, W, H, rx, ry);
        else if (curAdvArea === 'field') adv3dField(ctx, W, H, rx, ry);
        else if (curAdvArea === 'gate') adv3dGate(ctx, W, H, rx, ry);
      }

      function adv3dGarden(ctx, W, H, rx, ry) {
        var pX = ry * 1.2, pY = rx * 0.6;
        var sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
        sky.addColorStop(0, '#7ec8e3'); sky.addColorStop(1, '#c8e9f4');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.6);
        var gnd = ctx.createLinearGradient(0, H * 0.58, 0, H);
        gnd.addColorStop(0, '#5a9e3c'); gnd.addColorStop(1, '#3c7a28');
        ctx.fillStyle = gnd; ctx.fillRect(0, H * 0.58, W, H);
        var n = 8, bW = 13, fW = W * 0.78, sX = W * 0.11;
        var gndY = H * 0.63 - pY * 0.3, topY = H * 0.22 - pY * 0.5, midY = H * 0.45 - pY * 0.3;
        function gX(i) { return sX + (fW / (n - 1)) * i + pX * (i - n / 2) * 0.04; }
        ctx.beginPath(); ctx.moveTo(gX(0), topY); ctx.lineTo(gX(n - 1), topY + pX * 0.05);
        ctx.lineWidth = 10; ctx.strokeStyle = '#5a3a1a'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gX(0), midY); ctx.lineTo(gX(n - 1), midY + pX * 0.04);
        ctx.lineWidth = 8; ctx.strokeStyle = '#5a3a1a'; ctx.stroke();
        for (var i = 0; i < n; i++) {
          var bx = gX(i), isR = (i === 2 || i === 3 || i === 5);
          ctx.beginPath(); ctx.moveTo(bx, topY - 10); ctx.lineTo(bx, gndY);
          ctx.lineWidth = bW;
          if (isR) {
            var rg = ctx.createLinearGradient(bx - bW / 2, 0, bx + bW / 2, 0);
            rg.addColorStop(0, '#7c2d12'); rg.addColorStop(0.4, '#c2410c'); rg.addColorStop(1, '#9a3412');
            ctx.strokeStyle = rg;
          } else {
            var mg = ctx.createLinearGradient(bx - bW / 2, 0, bx + bW / 2, 0);
            mg.addColorStop(0, '#1e293b'); mg.addColorStop(0.4, '#475569'); mg.addColorStop(1, '#334155');
            ctx.strokeStyle = mg;
          }
          ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx, topY - 22); ctx.lineTo(bx - bW / 2, topY - 10);
          ctx.lineTo(bx + bW / 2, topY - 10); ctx.closePath();
          ctx.fillStyle = isR ? '#7c2d12' : '#1e293b'; ctx.fill();
          if (isR) {
            ctx.beginPath(); ctx.ellipse(bx, topY + (gndY - topY) * 0.4, bW * 0.8, 18, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(249,115,22,0.35)'; ctx.fill();
          }
        }
        ctx.fillStyle = '#3d2711'; ctx.fillRect(sX - 10, gndY - 4, fW + 20, 10);
        // Flowers
        [[sX + 30, gndY + 12], [sX + 90, gndY + 8], [W - sX - 50, gndY + 15]].forEach(function (f) {
          ctx.beginPath(); ctx.arc(f[0], f[1], 6, 0, Math.PI * 2); ctx.fillStyle = '#f9a8d4'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(f[0], f[1] + 6); ctx.lineTo(f[0], f[1] + 20);
          ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 2; ctx.stroke();
        });
        adv3dArc(ctx, W, H, ry);
      }

      function adv3dField(ctx, W, H, rx, ry) {
        var pX = ry * 1.2;
        var sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        sky.addColorStop(0, '#60a5fa'); sky.addColorStop(1, '#bae6fd');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.5);
        var gnd = ctx.createLinearGradient(0, H * 0.48, 0, H);
        gnd.addColorStop(0, '#4ade80'); gnd.addColorStop(0.5, '#22c55e'); gnd.addColorStop(1, '#15803d');
        ctx.fillStyle = gnd; ctx.fillRect(0, H * 0.48, W, H);
        var gY = H * 0.52, gpX = W * 0.18, gpW = W * 0.28, gpH = H * 0.42;
        var gpTop = gY - gpH;
        var rg2 = ctx.createLinearGradient(gpX, 0, gpX + 10, 0);
        rg2.addColorStop(0, '#7c2d12'); rg2.addColorStop(0.4, '#c2410c'); rg2.addColorStop(1, '#9a3412');
        ctx.lineWidth = 10;
        ctx.beginPath(); ctx.moveTo(gpX + pX * 0.1, gY); ctx.lineTo(gpX + pX * 0.1, gpTop); ctx.strokeStyle = rg2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gpX + gpW + pX * 0.1, gY); ctx.lineTo(gpX + gpW + pX * 0.1, gpTop); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gpX + pX * 0.1, gpTop); ctx.lineTo(gpX + gpW + pX * 0.1, gpTop); ctx.stroke();
        for (var ri = 0; ri < 4; ri++) {
          ctx.beginPath(); ctx.arc(gpX + Math.random() * gpW + pX * 0.1, gpTop + Math.random() * gpH * 0.7, 4 + Math.random() * 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(249,115,22,0.5)'; ctx.fill();
        }
        var gpX2 = W * 0.74;
        var mg2 = ctx.createLinearGradient(gpX2, 0, gpX2 + 12, 0);
        mg2.addColorStop(0, '#475569'); mg2.addColorStop(0.5, '#cbd5e1'); mg2.addColorStop(1, '#94a3b8');
        ctx.beginPath(); ctx.moveTo(gpX2, gY); ctx.lineTo(gpX2, gY - H * 0.5); ctx.lineWidth = 10; ctx.strokeStyle = mg2; ctx.stroke();
        ctx.fillStyle = '#1e3a5f'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('GALVANIS', gpX2, gY - H * 0.52);
        var bX = W * 0.46, bY = gY + H * 0.1;
        ctx.fillStyle = '#7c2d12'; ctx.fillRect(bX, bY - 8, W * 0.14, 10);
        ctx.fillStyle = '#5a3a1a'; ctx.fillRect(bX + 5, bY + 2, 10, 20); ctx.fillRect(bX + W * 0.14 - 15, bY + 2, 10, 20);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(W / 2, gY); ctx.lineTo(W / 2, H); ctx.stroke(); ctx.setLineDash([]);
        adv3dArc(ctx, W, H, ry);
      }

      function adv3dGate(ctx, W, H, rx, ry) {
        var pX = ry * 1.2;
        var sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
        sky.addColorStop(0, '#fbbf24'); sky.addColorStop(1, '#fde68a');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.55);
        ctx.fillStyle = '#d97706'; ctx.fillRect(0, H * 0.54, W, H);
        var gndY = H * 0.6, pW = 24, pLeft = W * 0.1, pRight = W * 0.88;
        [pLeft, pRight].forEach(function (px) {
          var pg = ctx.createLinearGradient(px, 0, px + pW, 0);
          pg.addColorStop(0, '#6b7280'); pg.addColorStop(0.4, '#d1d5db'); pg.addColorStop(1, '#6b7280');
          ctx.fillStyle = pg; ctx.fillRect(px + pX * 0.05, H * 0.08, pW, gndY - H * 0.08);
          ctx.fillStyle = '#374151'; ctx.fillRect(px - 3 + pX * 0.05, H * 0.06, pW + 6, 10);
        });
        var panW = (W * 0.75) / 2, panTop = H * 0.12, panBot = gndY - 14, panH = panBot - panTop, bars = 6;
        for (var half = 0; half < 2; half++) {
          var panX = pLeft + pW + 4 + half * panW + pX * (half === 0 ? 0.08 : 0.12);
          [panTop, panTop + panH * 0.33, panTop + panH * 0.66, panBot].forEach(function (ry2) {
            var r2 = ctx.createLinearGradient(panX, ry2, panX + panW, ry2);
            r2.addColorStop(0, '#1e293b'); r2.addColorStop(0.5, '#475569'); r2.addColorStop(1, '#1e293b');
            ctx.fillStyle = r2; ctx.fillRect(panX, ry2, panW, 8);
          });
          for (var b = 0; b < bars; b++) {
            var bx2 = panX + b * (panW / bars) + panW / bars / 2 - 5;
            var isR2 = (half === 0 && (b === 1 || b === 4)) || (half === 1 && b === 2);
            var vg = ctx.createLinearGradient(bx2, 0, bx2 + 10, 0);
            if (isR2) { vg.addColorStop(0, '#7c2d12'); vg.addColorStop(0.5, '#c2410c'); vg.addColorStop(1, '#9a3412'); }
            else { vg.addColorStop(0, '#1e293b'); vg.addColorStop(0.5, '#475569'); vg.addColorStop(1, '#334155'); }
            ctx.fillStyle = vg; ctx.fillRect(bx2, panTop, 10, panH);
          }
        }
        var rg3 = ctx.createLinearGradient(0, gndY - 12, 0, gndY + 2);
        rg3.addColorStop(0, '#d1d5db'); rg3.addColorStop(1, '#6b7280');
        ctx.fillStyle = rg3; ctx.fillRect(pLeft, gndY - 12, pRight - pLeft + pW, 14);
        var wX = pLeft + pW + panW + pX * 0.1, wY = gndY - 7;
        ctx.beginPath(); ctx.arc(wX, wY, 11, 0, Math.PI * 2);
        var wg = ctx.createRadialGradient(wX - 3, wY - 3, 2, wX, wY, 11);
        wg.addColorStop(0, '#d97706'); wg.addColorStop(0.5, '#92400e'); wg.addColorStop(1, '#451a03');
        ctx.fillStyle = wg; ctx.fill();
        ctx.beginPath(); ctx.arc(wX, wY, 5, 0, Math.PI * 2); ctx.fillStyle = '#1e293b'; ctx.fill();
        var hX = pLeft + pW + 4 + pX * 0.08;
        [panTop + panH * 0.2, panTop + panH * 0.6].forEach(function (hY) {
          var hg = ctx.createRadialGradient(hX, hY, 2, hX, hY, 10);
          hg.addColorStop(0, '#fbbf24'); hg.addColorStop(0.4, '#c2410c'); hg.addColorStop(1, '#7c2d12');
          ctx.beginPath(); ctx.arc(hX, hY, 10, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill();
          ctx.beginPath(); ctx.arc(hX, hY, 4, 0, Math.PI * 2); ctx.fillStyle = '#7c2d12'; ctx.fill();
        });
        adv3dArc(ctx, W, H, ry);
      }

      function adv3dArc(ctx, W, H, ry) {
        ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.arc(W * 0.5, H * 0.9, W * 0.42, Math.PI * 0.6, Math.PI * 2.4);
        ctx.stroke(); ctx.setLineDash([]); ctx.restore();
      }

      /* ---- MAGNIFIER ---- */
      function advInitMagnifier() {
        var wrap = document.getElementById('adv3dViewerWrap');
        var mag = document.getElementById('advMagnifier');
        var toggle = document.getElementById('advMagToggle');
        if (!wrap || !mag || !toggle) return;
        advMagOn = false;
        mag.classList.remove('visible');
        toggle.className = 'adv-mag-toggle';
        document.getElementById('advMagToggleLabel').textContent = 'OFF';
        toggle.onclick = function () {
          advMagOn = !advMagOn;
          document.getElementById('advMagToggleLabel').textContent = advMagOn ? 'ON' : 'OFF';
          toggle.classList.toggle('on', advMagOn);
          if (!advMagOn) mag.classList.remove('visible');
        };
        function handleMove(clientX, clientY) {
          if (!advMagOn) return;
          var rect = wrap.getBoundingClientRect();
          var px = ((clientX - rect.left) / rect.width) * 100;
          var py = ((clientY - rect.top) / rect.height) * 100;
          px = Math.max(5, Math.min(95, px));
          py = Math.max(5, Math.min(95, py));
          mag.style.left = px + '%'; mag.style.top = py + '%';
          mag.classList.add('visible');
          var area = ADV_AREAS[curAdvArea];
          var nearest = null, bestD = 9999;
          if (area && area.hotspots) {
            area.hotspots.forEach(function (hs) {
              var dx = hs.x - px, dy = hs.y - py, d = Math.sqrt(dx * dx + dy * dy);
              if (d < bestD) { bestD = d; nearest = hs; }
            });
            if (bestD > 20) nearest = null;
          }
          var glassEl = document.getElementById('advMagnifierGlass');
          if (glassEl) {
            if (nearest) {
              glassEl.innerHTML = nearest.magHtml || '<div style="width:100%;height:100%;background:#1e293b;"></div>';
            } else {
              glassEl.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:0.65rem;text-align:center;padding:6px;">Gerakkan ke area yang dicurigai…</div>';
            }
          }
        }
        wrap.addEventListener('mousemove', function (e) { handleMove(e.clientX, e.clientY); });
        wrap.addEventListener('touchmove', function (e) {
          e.preventDefault();
          if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });
      }

      /* ---- 3D ROTATION ---- */
      function advInit3dRotation() {
        var wrap = document.getElementById('adv3dViewerWrap');
        if (!wrap) return;
        var dragging = false, lastX = 0, lastY = 0;
        wrap.addEventListener('pointerdown', function (e) {
          if (advMagOn) return;
          dragging = true; lastX = e.clientX; lastY = e.clientY;
          wrap.setPointerCapture(e.pointerId);
        });
        wrap.addEventListener('pointermove', function (e) {
          if (!dragging || advMagOn) return;
          adv3dRotY += (e.clientX - lastX) * 0.4;
          adv3dRotX += (e.clientY - lastY) * 0.25;
          adv3dRotX = Math.max(-40, Math.min(50, adv3dRotX));
          lastX = e.clientX; lastY = e.clientY;
          adv3dDraw();
        });
        wrap.addEventListener('pointerup', function () { dragging = false; });
        wrap.addEventListener('pointercancel', function () { dragging = false; });
        wrap.addEventListener('touchstart', function (e) { if (e.touches.length === 1 && !advMagOn) dragging = true; }, { passive: true });
        wrap.addEventListener('touchend', function () { dragging = false; });
      }

      /* ---- HOTSPOT OVERLAY ---- */
      function advRenderHotspots(tagMode) {
        var overlay = document.getElementById('advHotspotOverlay');
        if (!overlay || !curAdvArea) return;
        var area = ADV_AREAS[curAdvArea];
        if (!area || !area.hotspots) return;
        overlay.innerHTML = '';
        overlay.style.pointerEvents = tagMode ? 'all' : 'none';
        area.hotspots.forEach(function (hs) {
          var size = 48;
          var div = document.createElement('div');
          div.className = 'adv-hotspot-area' + (tagMode ? ' ' + hs.type : '');
          if (advTagged[hs.id]) div.classList.add('tagged', advTagged[hs.id]);
          div.style.cssText = 'position:absolute;left:' + hs.x + '%;top:' + hs.y + '%;width:' + size + 'px;height:' + size + 'px;transform:translate(-50%,-50%);';
          div.innerHTML = '<span class="adv-hotspot-icon">' + (advTagged[hs.id] ? (advTagged[hs.id] === 'rust' ? '🔴' : '✅') : (tagMode ? '?' : '')) + '</span>';
          if (tagMode) {
            div.style.pointerEvents = 'all';
            div.onclick = function () {
              if (!advTagged[hs.id]) advTagged[hs.id] = 'rust';
              else if (advTagged[hs.id] === 'rust') advTagged[hs.id] = 'clean';
              else delete advTagged[hs.id];
              advRenderHotspots(tagMode);
              tone([440, 554]);
            };
          }
          overlay.appendChild(div);
        });
      }

      /* ---- STEP BAR ---- */
      function advRenderSteps() {
        var area = ADV_AREAS[curAdvArea];
        var bar = document.getElementById('advStepsBar');
        if (!bar || !area) return;
        bar.innerHTML = area.steps.map(function (s, i) {
          var cls = i < curAdvStep ? 'done' : (i === curAdvStep ? 'active' : '');
          return (i > 0 ? '<span class="adv-step-arrow">›</span>' : '') +
            '<span class="adv-step-pill ' + cls + '">' + s.label + '</span>';
        }).join('');
      }

      /* ---- RUN STEP ---- */
      function advRunStep(stepIdx) {
        var area = ADV_AREAS[curAdvArea];
        if (!area || !area.steps[stepIdx]) return;
        curAdvStep = stepIdx;
        var step = area.steps[stepIdx];
        advSetText('advActivityTitle', step.title);
        advHideFb();
        advRenderSteps();
        advShowBtn('advCheckBtn', false);
        advShowBtn('advNextStepBtn', true);
        advShowBtn('advFinishAreaBtn', false);
        advSetText('advNextStepBtn', 'Lanjut →');
        // Reset onclick
        document.getElementById('advNextStepBtn').onclick = function () { advRunStep(stepIdx + 1); };
        // Dispatch
        var fn = 'advStep_' + curAdvArea + '_' + step.id;
        if (typeof window[fn] === 'function') window[fn](area, step, stepIdx);
        else if (step.id === 'result') advShowResult(area);
        adv3dDraw();
      }

      /* ===========================================
         STEP HANDLERS – GARDEN
         =========================================== */
      window.advStep_garden_observe = function (area) {
        advRenderHotspots(false);
        advSetContent('advActivityContent', '');
        advSetText('advActivityInstruction', 'Seret objek untuk memutar pagar dari berbagai sudut. Aktifkan Kaca Pembesar dan gerakkan ke seluruh permukaan untuk memeriksa detail logam. Perhatikan warna, tekstur, dan kondisi tiap bagian pagar!');
        advSetText('advNextStepBtn', 'Siap Temukan Korosi →');
        document.getElementById('advNextStepBtn').onclick = function () { advTagged = {}; advRunStep(1); };
      };

      window.advStep_garden_find = function (area) {
        advRenderHotspots(true);
        advSetText('advActivityInstruction', 'Klik bagian pagar yang menurutmu mengalami KOROSI (tandai 🔴) dan yang MASIH BAIK (tandai ✅). Tekan lagi untuk mengganti tag. Gunakan Kaca Pembesar untuk membantu!');
        advSetContent('advActivityContent', '<p style="font-size:0.8rem;color:#5a2e04;margin:0;">Klik hotspot di objek untuk memberi tag. Tekan "Periksa Jawaban" setelah selesai.</p>');
        advShowBtn('advCheckBtn', true);
        document.getElementById('advCheckBtn').onclick = function () {
          var ok = 0;
          area.hotspots.forEach(function (hs) { if (advTagged[hs.id] === hs.type) ok++; });
          if (ok === area.hotspots.length) {
            advTotalScore += 20; advUpdateScore(); tone([523, 659, 784, 1046]);
            advShowFb('success', '<b>🎉 Luar Biasa!</b> Semua bagian diidentifikasi tepat! Sambungan jeruji dan batang bawah paling mudah korosi karena kontak langsung dengan air dan tanah basah — keduanya berfungsi sebagai elektrolit yang mempercepat reaksi redoks.');
            advShowBtn('advCheckBtn', false);
            advSetText('advNextStepBtn', 'Identifikasi Proses →');
            document.getElementById('advNextStepBtn').onclick = function () { advRunStep(2); };
          } else {
            tone([330, 262]);
            advShowFb('warning', '<b>⚠️ Belum Semua Tepat</b> (' + ok + '/' + area.hotspots.length + '). Gunakan Kaca Pembesar lebih teliti! Perhatikan warna kemerahan-cokelat dan tekstur kasar yang menandai korosi.');
          }
        };
        document.getElementById('advNextStepBtn').onclick = function () { advRunStep(2); };
      };

      window.advStep_garden_identify = function (area) {
        advRenderHotspots(false);
        var pairs = area.matchPairs;
        advPairSelected = { left: null, right: null };
        advPairMatched = {};
        advSetText('advActivityInstruction', 'Pasangkan setiap konsep di kiri dengan penjelasannya di kanan! Klik satu item di kiri, lalu klik pasangannya di kanan.');
        function renderPairs() {
          var lHtml = pairs.map(function (p, i) {
            var cls = advPairMatched[p.key] ? 'matched' : (advPairSelected.left === i ? 'selected' : '');
            return '<div class="adv-id-item ' + cls + '" data-side="L" data-idx="' + i + '">' + advEsc(p.left) + '</div>';
          }).join('');
          var rHtml = pairs.map(function (p, i) {
            var cls = advPairMatched[p.key] ? 'matched' : (advPairSelected.right === i ? 'selected' : '');
            return '<div class="adv-id-item ' + cls + '" data-side="R" data-idx="' + i + '">' + advEsc(p.right) + '</div>';
          }).join('');
          advSetContent('advPairsLeft', lHtml);
          advSetContent('advPairsRight', rHtml);
          document.querySelectorAll('.adv-id-item[data-side]').forEach(function (el) {
            if (el.classList.contains('matched')) return;
            el.onclick = function () {
              var side = el.dataset.side, idx = +el.dataset.idx;
              if (side === 'L') advPairSelected.left = idx; else advPairSelected.right = idx;
              if (advPairSelected.left !== null && advPairSelected.right !== null) {
                var lp = pairs[advPairSelected.left], rp = pairs[advPairSelected.right];
                if (lp.key === rp.key) { advPairMatched[lp.key] = true; advTotalScore += 5; advUpdateScore(); tone([554, 659]); }
                else { tone([330, 262]); }
                advPairSelected = { left: null, right: null };
                renderPairs();
                if (Object.keys(advPairMatched).length === pairs.length) {
                  advTotalScore += 10; advUpdateScore();
                  advShowFb('success', '<b>🧪 Sempurna!</b> Semua pasangan cocok! Korosi = reaksi elektrokimia: anoda (besi) → Fe → Fe²⁺ + 2e⁻. Katoda (oksigen) → O₂ + 4e⁻ + 2H₂O → 4OH⁻. Hasilnya: Fe₂O₃·nH₂O (karat merah).');
                  advSetText('advNextStepBtn', 'Pilih Tindakan →');
                  document.getElementById('advNextStepBtn').onclick = function () { advRunStep(3); };
                }
              } else renderPairs();
            };
          });
        }
        advSetContent('advActivityContent', '<div class="adv-id-pairs"><div class="adv-id-left" id="advPairsLeft"></div><div class="adv-id-right" id="advPairsRight"></div></div>');
        renderPairs();
        advShowBtn('advCheckBtn', false);
        advShowBtn('advNextStepBtn', false);
      };

      window.advStep_garden_decide = function (area) {
        advRenderHotspots(false);
        advDecisionMade = false;
        advSetText('advActivityInstruction', 'Pilih tindakan penanganan yang PALING TEPAT untuk pagar taman sekolah! Pertimbangkan efektivitas, biaya, dan dampak lingkungan.');
        advSetContent('advActivityContent', '<div class="adv-decision-visual-grid">' +
          area.decisions.map(function (d, i) {
            return '<div class="adv-dec-card" data-idx="' + i + '"><span class="adv-dec-visual">' + d.icon + '</span>' +
              '<span class="adv-dec-name">' + advEsc(d.name) + '</span>' +
              '<div style="margin-top:5px;">' + d.tags.map(function (t) {
                var c = t.includes('Efek') ? 'eff' : (t.includes('Biaya') ? 'cost' : 'env');
                return '<span class="adv-dec-tag ' + c + '">' + advEsc(t) + '</span>';
              }).join(' ') + '</div></div>';
          }).join('') + '</div>');
        advShowBtn('advCheckBtn', false); advShowBtn('advNextStepBtn', false);
        document.querySelectorAll('.adv-dec-card').forEach(function (card) {
          card.onclick = function () {
            if (advDecisionMade) return; advDecisionMade = true;
            var idx = +card.dataset.idx, dec = area.decisions[idx];
            document.querySelectorAll('.adv-dec-card').forEach(function (c) { c.classList.remove('selected'); });
            card.classList.add(dec.ok ? 'correct' : 'wrong');
            if (dec.ok) { advTotalScore += 25; advUpdateScore(); tone([523, 659, 784, 1046]); advShowFb('success', '<b>✅ ' + advEsc(dec.name) + ':</b> ' + advEsc(dec.why)); }
            else {
              tone([330, 262]); advShowFb('warning', '<b>⚠️ ' + advEsc(dec.name) + ':</b> ' + advEsc(dec.why));
              setTimeout(function () { document.querySelectorAll('.adv-dec-card').forEach(function (c, ci) { if (area.decisions[ci].ok) c.classList.add('correct'); }); }, 1200);
            }
            advShowBtn('advNextStepBtn', true); advSetText('advNextStepBtn', 'Lihat Hasil →');
            document.getElementById('advNextStepBtn').onclick = function () { advRunStep(4); };
          };
        });
      };

      window.advStep_garden_result = function (area) { advShowResult(area); };

      /* ===========================================
         STEP HANDLERS – FIELD
         =========================================== */
      window.advStep_field_observe = function (area) {
        advRenderHotspots(false);
        advSetContent('advActivityContent', '');
        advSetText('advActivityInstruction', 'Putar objek untuk mengamati peralatan lapangan dari berbagai sudut. Aktifkan Kaca Pembesar dan periksa kondisi tiang gawang, bangku besi, dan tiang galvanis. Catat perbedaan kondisi tiap objek!');
        advSetText('advNextStepBtn', 'Bandingkan Kondisi →');
        document.getElementById('advNextStepBtn').onclick = function () { advRunStep(1); };
      };

      window.advStep_field_compare = function (area) {
        advRenderHotspots(true);
        advSetText('advActivityInstruction', 'Gunakan Kaca Pembesar untuk memeriksa masing-masing objek. Perhatikan perbedaan kondisi dan faktor korosi pada tiap peralatan lapangan!');
        advSetContent('advActivityContent', '<div style="display:flex;flex-direction:column;gap:8px;">' +
          area.compareObjects.map(function (o) {
            var bars = '';
            for (var bi = 0; bi < 3; bi++) bars += '<span style="display:inline-block;width:16px;height:10px;border-radius:3px;margin-right:3px;background:' + (bi < o.level ? '#ef4444' : '#d1d5db') + ';"></span>';
            return '<div style="display:flex;align-items:center;gap:10px;background:#fff;border:2px solid #d0c2ad;border-radius:12px;padding:9px 12px;">' +
              '<span style="font-size:1.6rem;">' + o.icon + '</span>' +
              '<div style="flex:1;"><b style="font-size:0.85rem;">' + advEsc(o.name) + '</b><br>' +
              '<span style="font-size:0.76rem;color:#78350f;">Kondisi: ' + advEsc(o.kondisi) + '</span>' +
              '<div style="margin-top:3px;">' + bars + '<span style="font-size:0.72rem;color:#ef4444;margin-left:4px;">Tingkat korosi</span></div>' +
              '<div style="font-size:0.72rem;color:#5a2e04;margin-top:2px;">Faktor: ' + advEsc(o.faktor) + '</div></div></div>';
          }).join('') + '</div>');
        advShowBtn('advCheckBtn', false);
        advSetText('advNextStepBtn', 'Identifikasi Faktor →');
        document.getElementById('advNextStepBtn').onclick = function () { advRunStep(2); };
      };

      window.advStep_field_factors = function (area) {
        advSetText('advActivityInstruction', 'Pilih semua faktor yang MEMPERCEPAT korosi tiang gawang di lapangan terbuka. Hati-hati, ada yang bukan faktor utama!');
        advSetContent('advActivityContent',
          '<p style="font-size:0.8rem;color:#5a2e04;margin:0 0 8px;">Centang faktor-faktor yang mempercepat korosi tiang gawang:</p>' +
          '<div class="adv-drag-area">' +
          area.factorItems.map(function (item) {
            return '<label style="display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border:2px solid #d0c2ad;border-radius:999px;background:#fff;cursor:pointer;font-size:0.8rem;font-weight:800;">' +
              '<input type="checkbox" value="' + advEsc(item) + '" style="accent-color:#f59e0b;width:14px;height:14px;"> ' + advEsc(item) + '</label>';
          }).join('') + '</div>');
        advShowBtn('advCheckBtn', true);
        document.getElementById('advCheckBtn').onclick = function () {
          var checked = Array.from(document.querySelectorAll('.adv-drag-area input:checked')).map(function (cb) { return cb.value; });
          var cSet = new Set(area.factorCorrect), sSet = new Set(checked);
          var allOk = area.factorCorrect.every(function (c) { return sSet.has(c); });
          var noWrong = checked.every(function (c) { return cSet.has(c); });
          if (allOk && noWrong) {
            advTotalScore += 15; advUpdateScore(); tone([523, 659, 784]);
            advShowFb('success', '<b>🌦️ Tepat!</b> Air hujan/asam (elektrolit), sinar UV (merusak lapisan), kelembapan (menjaga elektrolit aktif), garam mineral (meningkatkan konduktivitas), dan benturan fisik (menghilangkan oksida pelindung) semuanya mempercepat korosi tiang gawang. Suhu tinggi di siang hari justru mengeringkan air sehingga menghambat korosi.');
            advShowBtn('advCheckBtn', false);
            advSetText('advNextStepBtn', 'Prediksi Dampak →');
            document.getElementById('advNextStepBtn').onclick = function () { advRunStep(3); };
          } else {
            tone([330, 262]);
            advShowFb('warning', '<b>⚠️ Belum Tepat.</b> Periksa ulang: apakah semua faktor yang dipilih benar-benar mempercepat korosi tiang di lapangan terbuka? Suhu tinggi di siang hari justru membantu mengeringkan air sehingga menghambat korosi.');
          }
        };
        document.getElementById('advNextStepBtn').onclick = function () { advRunStep(3); };
      };

      window.advStep_field_predict = function (area) {
        advSetText('advActivityInstruction', 'Berdasarkan pemahamanmu tentang faktor korosi, pilih SATU pernyataan yang paling BENAR:');
        advSetContent('advActivityContent', area.predictOptions.map(function (o, i) {
          return '<div class="adv-id-item" data-idx="' + i + '" style="text-align:left;padding:10px 14px;margin-bottom:7px;cursor:pointer;border-radius:12px;">' + advEsc(o.text) + '</div>';
        }).join(''));
        advShowBtn('advCheckBtn', false); advShowBtn('advNextStepBtn', false);
        document.querySelectorAll('.adv-id-item[data-idx]').forEach(function (el) {
          el.onclick = function () {
            var idx = +el.dataset.idx, opt = area.predictOptions[idx];
            document.querySelectorAll('.adv-id-item[data-idx]').forEach(function (e) { e.classList.remove('selected', 'matched', 'error'); });
            el.classList.add(opt.correct ? 'matched' : 'error');
            if (opt.correct) {
              advTotalScore += 10; advUpdateScore(); tone([523, 659, 784]);
              advShowFb('success', '<b>🔮 Prediksi Tepat!</b> Hujan lebih asam (pH rendah, [H⁺] tinggi) meningkatkan konduktivitas elektrolit dan mempercepat reaksi katodik: O₂ + 4H⁺ + 4e⁻ → 2H₂O, sehingga korosi pada tiang yang tidak terlindungi semakin masif.');
            } else {
              tone([330, 262]);
              advShowFb('warning', '<b>⚠️ Kurang Tepat.</b> Cat biasa adalah pelindung PASIF tanpa anoda korban — begitu retak, besi langsung korosi lagi. Lapisan Zn memang habis bertahap (anoda korban aktif) tetapi melindungi secara elektrokimia meski permukaannya tergores.');
            }
            advShowBtn('advNextStepBtn', true); advSetText('advNextStepBtn', 'Pilih Pencegahan →');
            document.getElementById('advNextStepBtn').onclick = function () { advRunStep(4); };
          };
        });
      };

      window.advStep_field_decide = function (area) {
        advDecisionMade = false;
        advRenderHotspots(false);
        advSetText('advActivityInstruction', 'Pilih metode pencegahan TERBAIK untuk tiang gawang di lapangan terbuka yang sering terbentur bola dan kena hujan langsung!');
        advSetContent('advActivityContent', '<div class="adv-decision-visual-grid">' +
          area.decisions.map(function (d, i) {
            return '<div class="adv-dec-card" data-idx="' + i + '"><span class="adv-dec-visual">' + d.icon + '</span>' +
              '<span class="adv-dec-name">' + advEsc(d.name) + '</span>' +
              '<div style="margin-top:5px;">' + d.tags.map(function (t) {
                var c = t.includes('Ketah') ? 'eff' : (t.includes('Biaya') ? 'cost' : 'env');
                return '<span class="adv-dec-tag ' + c + '">' + advEsc(t) + '</span>';
              }).join(' ') + '</div></div>';
          }).join('') + '</div>');
        advShowBtn('advCheckBtn', false); advShowBtn('advNextStepBtn', false);
        document.querySelectorAll('.adv-dec-card').forEach(function (card) {
          card.onclick = function () {
            if (advDecisionMade) return; advDecisionMade = true;
            var idx = +card.dataset.idx, dec = area.decisions[idx];
            document.querySelectorAll('.adv-dec-card').forEach(function (c) { c.classList.remove('selected'); });
            card.classList.add(dec.ok ? 'correct' : 'wrong');
            if (dec.ok) { advTotalScore += 25; advUpdateScore(); tone([523, 659, 784, 1046]); advShowFb('success', '<b>✅ ' + advEsc(dec.name) + ':</b> ' + advEsc(dec.why)); }
            else {
              tone([330, 262]); advShowFb('warning', '<b>⚠️ ' + advEsc(dec.name) + ':</b> ' + advEsc(dec.why));
              setTimeout(function () { document.querySelectorAll('.adv-dec-card').forEach(function (c, ci) { if (area.decisions[ci].ok) c.classList.add('correct'); }); }, 1200);
            }
            advShowBtn('advNextStepBtn', true); advSetText('advNextStepBtn', 'Lihat Hasil →');
            document.getElementById('advNextStepBtn').onclick = function () { advRunStep(5); };
          };
        });
      };

      window.advStep_field_result = function (area) { advShowResult(area); };

      /* ===========================================
         STEP HANDLERS – GATE
         =========================================== */
      window.advStep_gate_observe = function (area) {
        advRenderHotspots(false);
        advSetContent('advActivityContent', '');
        advSetText('advActivityInstruction', 'Putar dan amati gerbang geser sekolah dari berbagai sudut. Aktifkan Kaca Pembesar untuk memeriksa kondisi engsel, roda rel, sambungan las, dan panel besi secara mendetail. Mana bagian yang paling bermasalah?');
        advSetText('advNextStepBtn', 'Temukan Masalah →');
        document.getElementById('advNextStepBtn').onclick = function () { advTagged = {}; advRunStep(1); };
      };

      window.advStep_gate_find = function (area) {
        advRenderHotspots(true);
        advSetText('advActivityInstruction', 'Klik bagian gerbang yang menurutmu mengalami korosi (🔴) dan yang masih baik (✅). Gunakan Kaca Pembesar untuk memeriksa lebih dekat!');
        advSetContent('advActivityContent', '<p style="font-size:0.8rem;color:#5a2e04;margin:0 0 8px;">Klik hotspot untuk memberi tanda: 🔴 Berkarat / ✅ Masih Baik</p>');
        advShowBtn('advCheckBtn', true);
        document.getElementById('advCheckBtn').onclick = function () {
          var ok = 0;
          area.hotspots.forEach(function (hs) { if (advTagged[hs.id] === hs.type) ok++; });
          if (ok >= area.hotspots.length - 1) {
            advTotalScore += 20; advUpdateScore(); tone([523, 659, 784]);
            advShowFb('success', '<b>🎯 Hebat!</b> ' + ok + '/' + area.hotspots.length + ' bagian diidentifikasi dengan benar! Engsel, roda rel, dan sambungan las adalah tiga titik paling rentan karena gesekan mekanis + paparan air tanah + tegangan sisa pengelasan.');
            advShowBtn('advCheckBtn', false);
            advSetText('advNextStepBtn', 'Analisis Penyebab →');
            document.getElementById('advNextStepBtn').onclick = function () { advRunStep(2); };
          } else {
            tone([330, 262]);
            advShowFb('warning', '<b>⚠️ Masih Ada yang Keliru</b> (' + ok + '/' + area.hotspots.length + '). Periksa lebih teliti bagian yang sering bergerak dan yang langsung bersentuhan dengan tanah!');
          }
        };
        document.getElementById('advNextStepBtn').onclick = function () { advRunStep(2); };
      };

      window.advStep_gate_identify = function (area) {
        advRenderHotspots(false);
        var facts = area.analysisFacts;
        var selFacts = {};
        advSetText('advActivityInstruction', 'Dari pernyataan-pernyataan berikut, pilih yang BENAR-BENAR menyebabkan atau mempercepat korosi pada gerbang sekolah (bisa lebih dari satu):');
        function renderFacts() {
          var html = facts.map(function (f, i) {
            var cls = selFacts[i] ? (f.isCorrect ? 'matched' : 'error') : '';
            return '<div class="adv-id-item ' + cls + '" data-idx="' + i + '" style="text-align:left;padding:9px 12px;cursor:pointer;margin-bottom:6px;">' + f.icon + ' ' + advEsc(f.text) + '</div>';
          }).join('');
          document.getElementById('advFactsList').innerHTML = html;
          document.querySelectorAll('.adv-id-item[data-idx]').forEach(function (el) {
            el.onclick = function () { var idx = +el.dataset.idx; selFacts[idx] = !selFacts[idx]; renderFacts(); };
          });
        }
        advSetContent('advActivityContent', '<div id="advFactsList"></div>');
        renderFacts();
        advShowBtn('advCheckBtn', true);
        document.getElementById('advCheckBtn').onclick = function () {
          var cOk = 0, wrong = 0;
          facts.forEach(function (f, i) { if (f.isCorrect && selFacts[i]) cOk++; if (!f.isCorrect && selFacts[i]) wrong++; });
          var maxC = facts.filter(function (f) { return f.isCorrect; }).length;
          if (cOk === maxC && wrong === 0) {
            advTotalScore += 15; advUpdateScore(); tone([523, 659, 784]);
            advShowFb('success', '<b>🧪 Analisis Sempurna!</b> Gesekan mekanis menghilangkan lapisan oksida pelindung, kelembapan konstan di roda rel menyediakan elektrolit, dan dua logam berbeda (misalnya besi-tembaga) memicu korosi galvanik. Suhu tinggi di siang hari justru mengeringkan air → menghambat korosi.');
            advShowBtn('advCheckBtn', false);
            advSetText('advNextStepBtn', 'Pilih Tindakan →');
            document.getElementById('advNextStepBtn').onclick = function () { advRunStep(3); };
          } else {
            tone([330, 262]);
            advShowFb('warning', '<b>⚠️ Periksa Ulang.</b> Apakah semua penyebab sudah dipilih? Apakah ada yang bukan penyebab namun dipilih? Suhu tinggi membantu mengeringkan permukaan, bukan mempercepat korosi secara langsung.');
          }
        };
        document.getElementById('advNextStepBtn').onclick = function () { advRunStep(3); };
      };

      window.advStep_gate_decide = function (area) {
        advDecisionMade = false;
        advRenderHotspots(false);
        advSetText('advActivityInstruction', 'Pilih tindakan PALING TEPAT untuk mengatasi korosi pada engsel dan roda rel gerbang yang bergerak setiap hari!');
        advSetContent('advActivityContent', '<div class="adv-decision-visual-grid">' +
          area.decisions.map(function (d, i) {
            return '<div class="adv-dec-card" data-idx="' + i + '"><span class="adv-dec-visual">' + d.icon + '</span>' +
              '<span class="adv-dec-name">' + advEsc(d.name) + '</span>' +
              '<div style="margin-top:5px;">' + d.tags.map(function (t) {
                var c = t.includes('Efek') ? 'eff' : (t.includes('Biaya') ? 'cost' : 'env');
                return '<span class="adv-dec-tag ' + c + '">' + advEsc(t) + '</span>';
              }).join(' ') + '</div></div>';
          }).join('') + '</div>');
        advShowBtn('advCheckBtn', false); advShowBtn('advNextStepBtn', false);
        document.querySelectorAll('.adv-dec-card').forEach(function (card) {
          card.onclick = function () {
            if (advDecisionMade) return; advDecisionMade = true;
            var idx = +card.dataset.idx, dec = area.decisions[idx];
            document.querySelectorAll('.adv-dec-card').forEach(function (c) { c.classList.remove('selected'); });
            card.classList.add(dec.ok ? 'correct' : 'wrong');
            if (dec.ok) { advTotalScore += 25; advUpdateScore(); tone([523, 659, 784, 1046]); advShowFb('success', '<b>✅ ' + advEsc(dec.name) + ':</b> ' + advEsc(dec.why)); }
            else {
              tone([330, 262]); advShowFb('warning', '<b>⚠️ ' + advEsc(dec.name) + ':</b> ' + advEsc(dec.why));
              setTimeout(function () { document.querySelectorAll('.adv-dec-card').forEach(function (c, ci) { if (area.decisions[ci].ok) c.classList.add('correct'); }); }, 1200);
            }
            advShowBtn('advNextStepBtn', true); advSetText('advNextStepBtn', 'Pertimbangkan 4 Dimensi →');
            document.getElementById('advNextStepBtn').onclick = function () { advRunStep(4); };
          };
        });
      };

      window.advStep_gate_consider = function (area) {
        advSustainAnswers = {};
        var pillars = area.sustainPillars;
        advSetText('advActivityInstruction', 'Untuk setiap dimensi keberlanjutan, pilih pernyataan yang paling tepat menggambarkan keunggulan pelumasan gemuk tahan air:');
        function renderPillars() {
          var html = pillars.map(function (p, pi) {
            var answered = advSustainAnswers[pi] !== undefined;
            return '<div style="margin-bottom:14px;"><b style="font-size:0.85rem;">' + p.icon + ' ' + advEsc(p.name) + ':</b><br>' +
              '<div style="font-size:0.78rem;color:#5a2e04;margin:3px 0 5px;">' + advEsc(p.q) + '</div>' +
              p.opts.map(function (opt, oi) {
                var isAns = advSustainAnswers[pi] === oi;
                var cls = isAns ? (oi === p.correct ? 'matched' : 'error') : '';
                return '<div class="adv-id-item ' + cls + '" data-pi="' + pi + '" data-oi="' + oi + '" style="text-align:left;padding:7px 10px;margin-bottom:4px;cursor:' + (answered ? 'default' : 'pointer') + ';font-size:0.8rem;">' + advEsc(opt) + '</div>';
              }).join('') + '</div>';
          }).join('');
          document.getElementById('advPillarContent').innerHTML = html;
          document.querySelectorAll('.adv-id-item[data-pi]').forEach(function (el) {
            var pi = +el.dataset.pi;
            if (advSustainAnswers[pi] !== undefined) return;
            el.onclick = function () {
              var oi = +el.dataset.oi;
              advSustainAnswers[pi] = oi;
              if (oi === pillars[pi].correct) { advTotalScore += 5; advUpdateScore(); tone([554, 659]); }
              else tone([330, 262]);
              renderPillars();
              if (Object.keys(advSustainAnswers).length === pillars.length) {
                var allRight = pillars.every(function (p2, pi2) { return advSustainAnswers[pi2] === p2.correct; });
                if (allRight) advShowFb('success', '<b>♻️ Pemahaman Keberlanjutan Sempurna!</b> Pelumasan berkala adalah solusi 4 dimensi: sangat efektif untuk komponen bergerak, biaya murah, perlu diulang tiap 3-6 bulan, dan sangat ramah lingkungan dengan mencegah pembuangan komponen logam bekas. Mendukung SDG 12!');
                else advShowFb('info', '<b>💡 Semua Dimensi Dijawab.</b> Pelumasan gemuk kalsium/litium unggul di SEMUA dimensi: efektif menolak air secara hidrofobik, sangat murah, cukup 3-6 bulan sekali, dan mencegah limbah logam. Periksa jawaban yang masih merah.');
                advShowBtn('advNextStepBtn', true); advSetText('advNextStepBtn', 'Lihat Hasil →');
                document.getElementById('advNextStepBtn').onclick = function () { advRunStep(5); };
              }
            };
          });
        }
        advSetContent('advActivityContent', '<div id="advPillarContent"></div>');
        renderPillars();
        advShowBtn('advCheckBtn', false); advShowBtn('advNextStepBtn', false);
      };

      window.advStep_gate_result = function (area) { advShowResult(area); };

      /* ---- SHARED RESULT ---- */
      function advShowResult(area) {
        advRenderHotspots(false);
        advSetText('advActivityInstruction', 'Lihat perubahan kondisi setelah tindakan penanganan yang tepat diterapkan!');
        var scoreLabel = advTotalScore;
        advSetContent('advActivityContent',
          '<div class="adv-result-animation">' +
          '<span class="adv-result-icon">🏆</span>' +
          '<div class="adv-result-change">' +
          '<div class="adv-result-before"><div style="font-size:2rem;">' + area.resultBefore.split(' ')[0] + '</div><div>' + advEsc(area.resultBefore) + '</div></div>' +
          '<div class="adv-result-arrow">→</div>' +
          '<div class="adv-result-after"><div style="font-size:2rem;">' + area.resultAfter.split(' ')[0] + '</div><div>' + advEsc(area.resultAfter) + '</div></div>' +
          '</div>' +
          '<div style="font-size:0.84rem;color:#5a2e04;line-height:1.5;margin-top:10px;">' + advEsc(area.resultDesc) + '</div>' +
          '<div style="margin-top:12px;font-size:0.9rem;font-weight:800;color:#15803d;">⭐ Total Poin Area Ini: ' + scoreLabel + '</div>' +
          '</div>');
        advShowFb('success', '<b>🌟 Area Selesai!</b> Penerapan tindakan berhasil! Kembali ke peta untuk menjelajahi area berikutnya.');
        var pr = getAdvProgress(); pr[area.id] = true; saveAdvProgress(pr);
        setTimeout(function () {
          var capId = area.id.charAt(0).toUpperCase() + area.id.slice(1);
          var pinEl = document.getElementById('pin' + capId);
          var pinSt = document.getElementById('pin' + capId + 'Status');
          if (pinEl) pinEl.className = 'adv-pin-btn done';
          if (pinSt) pinSt.textContent = '✓ Aman';
        }, 300);
        advShowBtn('advCheckBtn', false); advShowBtn('advNextStepBtn', false);
        advShowBtn('advFinishAreaBtn', true);
        document.getElementById('advFinishAreaBtn').textContent = isAllAdvDone() ? '🏆 Lihat Kemenangan!' : '🗺️ Kembali ke Peta';
        document.getElementById('advFinishAreaBtn').onclick = function () { if (isAllAdvDone()) openAdvVictory(); else openAdvMap(); };
        tone([523, 659, 784, 1046, 1319]);
      }

      /* ---- MASTER openAdvArea ---- */
      function openAdvArea(areaKey) {
        curAdvArea = areaKey;
        curAdvStep = 0;
        advTotalScore = 0;
        advTagged = {};
        advSustainAnswers = {};
        advPairSelected = { left: null, right: null };
        advPairMatched = {};
        advDecisionMade = false;
        adv3dRotX = 20; adv3dRotY = -15;
        var area = ADV_AREAS[areaKey];
        if (!area) return;
        var pr = getAdvProgress();
        var isDone = !!pr[areaKey];
        advSetText('advPlayTitle', area.title);
        advUpdateScore();
        adv3dSetup();
        advInit3dRotation();
        advInitMagnifier();
        adv3dDraw();
        // Show hint then fade
        var hint = document.getElementById('advRotateHint');
        if (hint) { hint.style.animation = 'none'; void hint.offsetWidth; hint.style.animation = 'hintFade 3.5s ease-in-out forwards'; }
        if (isDone) { advRenderSteps(); advShowResult(area); }
        else advRunStep(0);
        show('advPlay');
      }

`;

// Perform the replacement using character positions
const before = html.substring(0, advAreasPos);
const after = html.substring(advVicPos); // keeps "\n      function openAdvVictory(" onwards intact
html = before + NEW_ENGINE + after;
console.log('Engine replaced. New size:', html.length);

// =====================================================
// PART 4: VERIFY and WRITE
// =====================================================
fs.writeFileSync('index.html', html, 'utf8');
console.log('Written! Now verifying...');

// Quick verify: count key markers
const h2 = fs.readFileSync('index.html', 'utf8');
console.log('openAdvArea count:', (h2.match(/function openAdvArea/g)||[]).length);
console.log('openAdvVictory count:', (h2.match(/function openAdvVictory/g)||[]).length);
console.log('ADV_AREAS count:', (h2.match(/var ADV_AREAS = \{/g)||[]).length);
console.log('style close count:', (h2.match(/<\/style>/g)||[]).length);
console.log('Final file size:', h2.length);
