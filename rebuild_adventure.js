/**
 * KOROSI ADVENTURE – REVISI BESAR GAMEPLAY AREA 1, 2, & 3
 * =========================================================
 * Script ini mengganti mekanisme play area sepenuhnya.
 * Yang DIPERTAHANKAN:
 *  - Navigasi peta (openAdvMap, startAdvGameLoop, walkToAreaHotspot, updatePin)
 *  - Sistem progres (getAdvProgress, saveAdvProgress, isAllAdvDone)
 *  - openAdvVictory, openAdvIntro
 *  - Semua alur masuk/keluar area (openAdvArea dipanggil dari peta)
 *  - Level 1, 2, 3 kuis
 * Yang DIGANTI:
 *  - Isi HTML #advPlay (struktur 3D + magnifier + multi-step activity)
 *  - openAdvArea function (multi-step state machine)
 *  - advApplyAction (diganti per-area handler)
 *  - renderAdvScene (diganti per-area 3D SVG renderer)
 *  - advLensDetailSVG (diganti moveable magnifier system)
 *  - ADV_AREAS data (diperluas dengan activity steps)
 */

const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// ============================================================
// BAGIAN 1: CSS BARU untuk sistem 3D + Magnifier
// ============================================================
const NEW_CSS = `
    /* ===================================================
       KOROSI ADVENTURE – 3D VIEWER + MAGNIFIER SYSTEM
       =================================================== */

    /* Full-screen area layout */
    #advPlay.adv-screen {
      padding: 8px 10px;
    }
    .adv-play-full {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 900px;
      gap: 10px;
      flex: 1;
    }

    /* Step tracker pills */
    .adv-steps-bar {
      display: flex;
      align-items: center;
      gap: 4px;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 2px;
    }
    .adv-step-pill {
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 800;
      border: 2px solid #c9a06a;
      background: #fff8ee;
      color: #7c4a1a;
      transition: background 0.2s, color 0.2s;
    }
    .adv-step-pill.active {
      background: #f29400;
      color: #fff;
      border-color: #a85f00;
    }
    .adv-step-pill.done {
      background: #22c55e;
      color: #fff;
      border-color: #15803d;
    }
    .adv-step-arrow {
      color: #c9a06a;
      font-size: 0.75rem;
    }

    /* 3D Viewer Container */
    .adv-3d-viewer-wrap {
      position: relative;
      width: 100%;
      background: linear-gradient(160deg, #1e3a5f 0%, #0f1f36 60%, #122240 100%);
      border-radius: 18px;
      border: 3px solid #5a3a1a;
      box-shadow: 0 8px 0 #3e2710, 0 12px 24px rgba(0,0,0,0.3);
      overflow: hidden;
      flex-shrink: 0;
      cursor: grab;
      touch-action: none;
      user-select: none;
    }
    .adv-3d-viewer-wrap:active { cursor: grabbing; }
    .adv-3d-canvas {
      display: block;
      width: 100%;
    }

    /* Rotation hint */
    .adv-rotate-hint {
      position: absolute;
      top: 8px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.6);
      color: #fde047;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 999px;
      pointer-events: none;
      animation: hintFade 3s ease-in-out forwards;
      white-space: nowrap;
    }
    @keyframes hintFade {
      0%,60%{opacity:1} 100%{opacity:0}
    }

    /* Moveable Magnifier */
    .adv-mag-wrap {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 20;
    }
    .adv-magnifier {
      position: absolute;
      width: 110px; height: 110px;
      border-radius: 50%;
      border: 5px solid #d4a366;
      box-shadow: 0 0 0 2px #7c4a1a, 0 6px 18px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.6);
      background: radial-gradient(circle at 35% 35%, #1e3a5f, #0a1428);
      overflow: hidden;
      pointer-events: none;
      transform: translate(-50%, -50%);
      display: none;
    }
    .adv-magnifier.visible { display: block; }
    .adv-magnifier-glass {
      width: 100%; height: 100%;
      position: relative;
    }
    .adv-magnifier-glare {
      position: absolute; inset: 0; border-radius: 50%;
      background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
      pointer-events: none;
    }
    .adv-magnifier-handle {
      position: absolute;
      bottom: -18px; right: -14px;
      width: 14px; height: 42px;
      background: linear-gradient(180deg, #d97706, #92400e);
      border-radius: 6px; transform: rotate(-40deg);
      border: 2px solid #451a03;
      box-shadow: 2px 3px 5px rgba(0,0,0,0.4);
    }

    /* Hotspot clickable areas on 3D object */
    .adv-hotspot-area {
      position: absolute;
      border-radius: 50%;
      border: 2.5px dashed rgba(255,255,255,0.5);
      background: rgba(255,255,255,0.08);
      cursor: pointer;
      pointer-events: all;
      transition: background 0.2s, border-color 0.2s;
      animation: advHotspotPulseGlow 2.2s infinite ease-in-out;
      display: flex; align-items: center; justify-content: center;
    }
    .adv-hotspot-area.rust { border-color: rgba(249,115,22,0.6); background: rgba(249,115,22,0.12); }
    .adv-hotspot-area.rust:hover { background: rgba(249,115,22,0.3); }
    .adv-hotspot-area.clean { border-color: rgba(74,222,128,0.5); background: rgba(74,222,128,0.1); }
    .adv-hotspot-area.clean:hover { background: rgba(74,222,128,0.25); }
    .adv-hotspot-area.tagged { border-style: solid; }
    .adv-hotspot-area.tagged.rust { border-color: #f97316; background: rgba(249,115,22,0.35); }
    .adv-hotspot-area.tagged.clean { border-color: #22c55e; background: rgba(34,197,94,0.25); }
    @keyframes advHotspotPulseGlow {
      0%,100%{box-shadow: 0 0 0 0 rgba(249,115,22,0.4);}
      50%{box-shadow: 0 0 0 7px rgba(249,115,22,0);}
    }
    .adv-hotspot-icon {
      font-size: 1.1rem;
      pointer-events: none;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));
    }

    /* Magnifier toggle + instruction bar */
    .adv-viewer-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 2px;
    }
    .adv-mag-toggle {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #fff8ee;
      border: 2px solid #d97706;
      border-radius: 999px;
      padding: 4px 12px;
      font-size: 0.78rem;
      font-weight: 800;
      color: #92400e;
      cursor: pointer;
      transition: background 0.2s;
      box-shadow: 0 2px 0 #b45309;
    }
    .adv-mag-toggle:active { transform: translateY(1px); box-shadow: none; }
    .adv-mag-toggle.on { background: #fef3c7; border-color: #f59e0b; }
    .adv-view-hint-text {
      font-size: 0.75rem;
      color: #78350f;
      font-weight: 700;
    }

    /* Activity panel below viewer */
    .adv-activity-panel {
      background: #fffdf5;
      border: 3px solid #5a3a1a;
      border-radius: 18px;
      box-shadow: 0 6px 0 #3e2710;
      padding: 14px 16px;
      flex: 1;
    }
    .adv-activity-title {
      font-family: var(--font-display);
      font-size: 1.0rem;
      color: #3f1e00;
      margin: 0 0 10px 0;
    }
    .adv-activity-instruction {
      font-size: 0.84rem;
      color: #5a2e04;
      line-height: 1.5;
      margin-bottom: 10px;
      background: #fef9ee;
      border-left: 4px solid #f59e0b;
      padding: 7px 10px;
      border-radius: 0 8px 8px 0;
    }

    /* Hotspot tagging result grid */
    .adv-tag-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 8px;
      margin-bottom: 10px;
    }
    .adv-tag-chip {
      border: 2px solid #d0c2ad;
      border-radius: 10px;
      padding: 7px 10px;
      font-size: 0.78rem;
      font-weight: 800;
      color: #3b1900;
      background: #fff;
      text-align: center;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      position: relative;
    }
    .adv-tag-chip:hover { background: #fff8ee; border-color: #f59e0b; }
    .adv-tag-chip.selected-rust { background: #fff1e6; border-color: #f97316; color: #c2410c; }
    .adv-tag-chip.selected-clean { background: #f0fdf4; border-color: #22c55e; color: #15803d; }
    .adv-tag-chip .chip-icon { font-size: 1.1rem; display: block; margin-bottom: 3px; }

    /* Identification activity  */
    .adv-id-pairs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    .adv-id-left, .adv-id-right {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .adv-id-item {
      border: 2px solid #d0c2ad;
      border-radius: 10px;
      padding: 7px 10px;
      font-size: 0.8rem;
      font-weight: 700;
      background: #fff;
      text-align: center;
      min-height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.15s;
    }
    .adv-id-item.selected { background: #fef3c7; border-color: #f59e0b; }
    .adv-id-item.matched { background: #f0fdf4; border-color: #22c55e; color: #15803d; cursor: default; }
    .adv-id-item.error { background: #fef2f2; border-color: #ef4444; }

    /* Decision visual cards */
    .adv-decision-visual-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
      margin-bottom: 12px;
    }
    .adv-dec-card {
      border: 3px solid #d0c2ad;
      border-radius: 14px;
      padding: 10px 8px;
      background: #fff;
      text-align: center;
      cursor: pointer;
      transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
      box-shadow: 0 4px 0 #c9a06a;
    }
    .adv-dec-card:hover { transform: translateY(-3px); border-color: #f59e0b; }
    .adv-dec-card.selected { border-color: #2563eb; background: #eff6ff; box-shadow: 0 4px 0 #1d4ed8; }
    .adv-dec-card.correct { border-color: #22c55e; background: #f0fdf4; box-shadow: 0 4px 0 #15803d; }
    .adv-dec-card.wrong { border-color: #ef4444; background: #fef2f2; box-shadow: 0 4px 0 #b91c1c; }
    .adv-dec-visual {
      font-size: 2.4rem;
      display: block;
      margin-bottom: 6px;
    }
    .adv-dec-name {
      font-size: 0.78rem;
      font-weight: 800;
      color: #3b1900;
      line-height: 1.3;
    }
    .adv-dec-tag {
      display: inline-block;
      margin-top: 5px;
      font-size: 0.65rem;
      padding: 1px 7px;
      border-radius: 999px;
      font-weight: 800;
    }
    .adv-dec-tag.eff { background: #e0f2fe; color: #0369a1; }
    .adv-dec-tag.cost { background: #fef3c7; color: #b45309; }
    .adv-dec-tag.env { background: #dcfce7; color: #15803d; }

    /* Drag and drop */
    .adv-drag-area {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
      min-height: 48px;
    }
    .adv-drag-item {
      padding: 6px 12px;
      border: 2px solid #d0c2ad;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: grab;
      background: #fff;
      transition: background 0.15s;
      touch-action: none;
    }
    .adv-drag-item:active { cursor: grabbing; opacity: 0.7; }
    .adv-drop-zone {
      min-height: 52px;
      border: 2.5px dashed #d0c2ad;
      border-radius: 12px;
      padding: 6px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: flex-start;
      align-content: flex-start;
      transition: border-color 0.2s, background 0.2s;
    }
    .adv-drop-zone.drag-over { border-color: #f59e0b; background: #fffbeb; }
    .adv-drop-zone.correct { border-color: #22c55e; background: #f0fdf4; }
    .adv-drop-zone.wrong { border-color: #ef4444; background: #fef2f2; }

    /* Feedback box */
    .adv-feedback-box {
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 0.84rem;
      line-height: 1.5;
      display: none;
      margin-bottom: 10px;
    }
    .adv-feedback-box.show { display: block; }
    .adv-feedback-box.success {
      background: #f0fdf4; border: 2px solid #22c55e; color: #14532d;
    }
    .adv-feedback-box.warning {
      background: #fff7ed; border: 2px solid #f97316; color: #7c2d12;
    }
    .adv-feedback-box.info {
      background: #eff6ff; border: 2px solid #60a5fa; color: #1e40af;
    }

    /* Result animation */
    .adv-result-animation {
      text-align: center;
      padding: 16px;
      animation: advResultPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes advResultPop {
      from { transform: scale(0.6); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .adv-result-icon { font-size: 3rem; display: block; margin-bottom: 8px; }
    .adv-result-title { font-family: var(--font-display); font-size: 1.2rem; color: #2b1c0a; margin-bottom: 6px; }
    .adv-result-desc { font-size: 0.84rem; color: #5a2e04; line-height: 1.5; }
    .adv-result-change {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin: 14px 0;
      flex-wrap: wrap;
    }
    .adv-result-before, .adv-result-after {
      text-align: center;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .adv-result-arrow { font-size: 1.5rem; color: #22c55e; }

    /* Progress / nav bar at bottom */
    .adv-nav-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .adv-id-pairs { grid-template-columns: 1fr; }
      .adv-decision-visual-grid { grid-template-columns: repeat(2, 1fr); }
      .adv-magnifier { width: 90px; height: 90px; }
      .adv-activity-panel { padding: 10px 12px; }
      .adv-3d-viewer-wrap { border-radius: 14px; }
    }
`;

// Insert new CSS before </style>
html = html.replace('  </style>', NEW_CSS + '\n  </style>');

// ============================================================
// BAGIAN 2: Ganti HTML #advPlay section sepenuhnya
// ============================================================
const OLD_ADV_PLAY_START = '<section class="screen adv-screen" id="advPlay"';
const OLD_ADV_PLAY_END = '</section>\n\n    <!-- FINAL GAME: VICTORY';

const advPlayStart = html.indexOf(OLD_ADV_PLAY_START);
const advPlayEnd = html.indexOf(OLD_ADV_PLAY_END, advPlayStart);
if (advPlayStart === -1 || advPlayEnd === -1) {
  console.error('Cannot find #advPlay section!');
  process.exit(1);
}

const NEW_ADV_PLAY_HTML = `<section class="screen adv-screen" id="advPlay" aria-label="Eksplorasi Area" hidden>
      <div class="adv-head">
        <button class="circle" id="advPlayBack" aria-label="Kembali ke peta petualangan">
          <svg viewBox="0 0 24 24"><path d="M20 12H5M11 5l-7 7 7 7"/></svg>
        </button>
        <h2 class="adv-title-ribbon" id="advPlayTitle">Area 1: Taman Sekolah</h2>
        <span class="spacer"></span>
      </div>

      <!-- Step tracker -->
      <div class="adv-steps-bar" id="advStepsBar"></div>

      <div class="adv-play-full">
        <!-- 3D Viewer -->
        <div class="adv-viewer-toolbar">
          <button class="adv-mag-toggle" id="advMagToggle">🔍 Kaca Pembesar <span id="advMagToggleLabel">OFF</span></button>
          <span class="adv-view-hint-text" id="advViewHint">↔ Seret untuk memutar objek</span>
        </div>
        <div class="adv-3d-viewer-wrap" id="adv3dViewerWrap">
          <canvas class="adv-3d-canvas" id="adv3dCanvas"></canvas>
          <div class="adv-rotate-hint" id="advRotateHint">↔ Seret / geser untuk memutar dan amati objek dari berbagai sudut!</div>
          <!-- Hotspot overlay -->
          <div id="advHotspotOverlay" style="position:absolute;inset:0;pointer-events:none;"></div>
          <!-- Moveable Magnifier -->
          <div class="adv-mag-wrap" id="advMagWrap">
            <div class="adv-magnifier" id="advMagnifier">
              <div class="adv-magnifier-glass" id="advMagnifierGlass"></div>
              <div class="adv-magnifier-glare"></div>
              <div class="adv-magnifier-handle"></div>
            </div>
          </div>
        </div>

        <!-- Activity Panel -->
        <div class="adv-activity-panel" id="advActivityPanel">
          <h3 class="adv-activity-title" id="advActivityTitle">🔎 Langkah 1: Amati Objek</h3>
          <div class="adv-activity-instruction" id="advActivityInstruction">
            Putar objek dari berbagai sudut dan aktifkan Kaca Pembesar untuk memeriksa permukaan logam secara detail.
          </div>
          <div id="advActivityContent"></div>
          <div class="adv-feedback-box" id="advFeedbackBox"></div>
          <div class="adv-nav-row">
            <span id="advScoreDisplay" style="font-size:0.8rem;font-weight:800;color:#78350f;">⭐ Poin: 0</span>
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

html = html.substring(0, advPlayStart) + NEW_ADV_PLAY_HTML + html.substring(advPlayEnd);

// ============================================================
// BAGIAN 3: Data areas + multi-step activity system
// ============================================================

// Find and replace ADV_AREAS + all related functions
const ADV_AREAS_START = html.indexOf('var ADV_AREAS = {');
const ADV_AREAS_END_MARKER = 'var curAdvArea = null';
const ADV_AREAS_END = html.indexOf(ADV_AREAS_END_MARKER, ADV_AREAS_START);

if (ADV_AREAS_START === -1 || ADV_AREAS_END === -1) {
  console.error('Cannot find ADV_AREAS!');
  process.exit(1);
}

// Find end of old functions to replace (up to openAdvVictory)
const OPEN_ADV_VIC_START = html.indexOf('function openAdvVictory');
const OPEN_ADV_VIC_END = html.indexOf('\n      init();', OPEN_ADV_VIC_START);
if (OPEN_ADV_VIC_END === -1) {
  console.error('Cannot find end of openAdvVictory!');
  process.exit(1);
}

const NEW_ADV_ENGINE = `var ADV_AREAS = {
        garden: {
          id: 'garden', title: 'Area 1: Taman Sekolah', obj: 'Pagar Besi Hias Taman',
          color: '#4a7c3a',
          steps: [
            { id: 'observe',    label: '🔎 Amati',     title: '🔎 Langkah 1: Amati Pagar Besi' },
            { id: 'find',       label: '🎯 Temukan',   title: '🎯 Langkah 2: Temukan Bagian Berkarat' },
            { id: 'identify',   label: '🧪 Identifikasi', title: '🧪 Langkah 3: Identifikasi Proses Korosi' },
            { id: 'decide',     label: '⚖️ Putuskan',  title: '⚖️ Langkah 4: Pilih Tindakan Penanganan' },
            { id: 'result',     label: '✅ Hasil',      title: '✅ Hasil Tindakan' }
          ],
          hotspots: [
            { id: 'joint',  label: 'Sambungan Jeruji', x: 42, y: 55, type: 'rust',  
              magnifyHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #7c2d12 0%, #9a3412 40%, #c2410c 70%, #78350f 100%);display:flex;align-items:center;justify-content:center;font-size:2.2rem;">🟫</div>',
              desc: 'Sambungan dan las jeruji paling mudah korosi karena air menggenang di celah, mempercepat reaksi: Fe → Fe²⁺ + 2e⁻ (oksidasi)' },
            { id: 'lower',  label: 'Batang Bawah', x: 28, y: 72, type: 'rust',  
              magnifyHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle at 40% 40%, #ea580c 0%, #9a3412 50%, #7c2d12 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟤</div>',
              desc: 'Batang bawah langsung kontak dengan tanah basah (elektrolit). Air+garam tanah → larutan konduktif → korosi galvanik dipercepat.' },
            { id: 'upper',  label: 'Batang Atas', x: 60, y: 25, type: 'clean', 
              magnifyHtml: '<div style="width:100%;height:100%;background:linear-gradient(135deg, #1e293b 0%, #475569 50%, #94a3b8 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🩶</div>',
              desc: 'Batang atas jauh dari tanah dan air. Permukaan logam masih bersih. Besi belum mengalami oksidasi signifikan di bagian ini.' },
            { id: 'paint',  label: 'Area Bercat', x: 75, y: 45, type: 'clean', 
              magnifyHtml: '<div style="width:100%;height:100%;background:linear-gradient(135deg, #15803d 0%, #16a34a 50%, #86efac 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟢</div>',
              desc: 'Bagian bercat masih terlindungi. Cat membentuk barrier fisik yang mencegah O₂ dan H₂O bersentuhan langsung dengan permukaan besi.' }
          ],
          rustHotspots: ['joint', 'lower'],
          matchPairs: [
            { left: '🌧️ Air hujan & tanah basah', right: 'Elektrolit yang mempercepat korosi', key: 'A' },
            { left: '🔴 Warna merah-cokelat', right: 'Fe₂O₃·nH₂O (karat besi)', key: 'B' },
            { left: '⚡ Oksidasi besi', right: 'Fe → Fe²⁺ + 2e⁻', key: 'C' },
            { left: '💚 Cat pelindung', right: 'Barrier fisik hambat O₂ & H₂O', key: 'D' }
          ],
          decisions: [
            { id: 'primer', icon: '🖌️', name: 'Cat Primer Anti-Karat', tags: ['Efektivitas: Tinggi', 'Biaya: Ekonomis', 'Lingkungan: Ramah'], ok: true,
              why: 'Tepat! Cat primer membentuk lapisan isolasi fisik yang mencegah O₂ dan H₂O bersentuhan dengan besi. Formulasi low-VOC aman bagi tanaman di taman sekolah. (SDG 9 & 12)' },
            { id: 'chrome', icon: '✨', name: 'Pelapisan Krom Industri', tags: ['Efektivitas: Sangat Tinggi', 'Biaya: Sangat Mahal', 'Lingkungan: Berbahaya'], ok: false,
              why: 'Kurang tepat. Pelapisan krom menghasilkan limbah cair Cr⁶⁺ yang berbahaya bagi tanah dan akar tanaman di sekitar taman sekolah. Bertentangan SDG 12.' },
            { id: 'pvc', icon: '🧴', name: 'Selubung Plastik PVC', tags: ['Efektivitas: Sedang', 'Biaya: Sedang', 'Lingkungan: Mikroplastik'], ok: false,
              why: 'Kurang tepat. PVC getas kena sinar UV. Air hujan merembes ke balik plastik, karat tumbuh tersembunyi dari dalam. Limbah mikroplastik mencemari tanah.' }
          ],
          resultBefore: '🟫 Pagar Berkarat', resultAfter: '✅ Pagar Terlindungi',
          resultDesc: 'Cat primer membentuk lapisan barrier fisik antara besi dan lingkungan. Reaksi oksidasi Fe → Fe²⁺ + 2e⁻ terhenti karena O₂ dan H₂O tidak dapat mencapai permukaan logam.'
        },

        field: {
          id: 'field', title: 'Area 2: Lapangan Sekolah', obj: 'Peralatan Logam Lapangan',
          color: '#3b82f6',
          steps: [
            { id: 'observe',  label: '🔎 Amati',    title: '🔎 Langkah 1: Amati Peralatan Lapangan' },
            { id: 'compare',  label: '⚖️ Bandingkan', title: '⚖️ Langkah 2: Bandingkan Kondisi Objek' },
            { id: 'factors',  label: '🌦️ Faktor',   title: '🌦️ Langkah 3: Identifikasi Faktor Korosi' },
            { id: 'predict',  label: '🔮 Prediksi',  title: '🔮 Langkah 4: Prediksi Dampak Lingkungan' },
            { id: 'decide',   label: '⚖️ Putuskan',  title: '⚖️ Langkah 5: Pilih Pencegahan Terbaik' },
            { id: 'result',   label: '✅ Hasil',      title: '✅ Hasil Tindakan' }
          ],
          hotspots: [
            { id: 'goalpost', label: 'Tiang Gawang (Luar)', x: 38, y: 30, type: 'rust',
              magnifyHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #9a3412 0%, #c2410c 40%, #78350f 80%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟫</div>',
              desc: 'Tiang gawang di lapangan terbuka terkena hujan asam dan sinar UV terus-menerus. Pitting corrosion: lubang-lubang kecil terbentuk akibat serangan ion agresif.' },
            { id: 'bench',   label: 'Bangku Besi (Teduh)', x: 72, y: 62, type: 'rust',
              magnifyHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #b45309 0%, #d97706 40%, #ca8a04 80%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟡</div>',
              desc: 'Bangku di area teduh korosi lebih lambat, namun kelembapan tinggi dan kurang sinar matahari membuat permukaan tetap lembap → korosi merayap perlahan.' },
            { id: 'painted', label: 'Tiang Galvanis', x: 55, y: 45, type: 'clean',
              magnifyHtml: '<div style="width:100%;height:100%;background:linear-gradient(135deg, #94a3b8 0%, #cbd5e1 50%, #e2e8f0 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🩶</div>',
              desc: 'Tiang yang telah digalvanisasi dengan Zn terlindungi. Zn (-0,76V) mengorbankan diri sebagai anoda korban untuk besi (-0,44V). Tidak ada korosi meskipun tergores.' }
          ],
          rustHotspots: ['goalpost', 'bench'],
          compareObjects: [
            { name: 'Tiang Gawang', icon: '⚽', kondisi: 'Korosi Parah', faktor: 'Hujan langsung, UV, benturan bola', level: 3 },
            { name: 'Bangku Besi', icon: '🪑', kondisi: 'Korosi Sedang', faktor: 'Kelembapan tinggi, teduh', level: 2 },
            { name: 'Tiang Galvanis', icon: '🏳️', kondisi: 'Baik (Terlindungi)', faktor: 'Lapisan Zn anoda korban', level: 0 }
          ],
          factorDrag: {
            items: ['🌧️ Hujan Asam', '☀️ Sinar UV', '💨 Kelembapan', '🧂 Garam Mineral', '💥 Benturan Fisik', '🌡️ Suhu Tinggi'],
            correct: ['🌧️ Hujan Asam', '☀️ Sinar UV', '💨 Kelembapan', '🧂 Garam Mineral', '💥 Benturan Fisik'],
            distractor: ['🌡️ Suhu Tinggi'],
            hint: 'Seret faktor-faktor yang dapat MEMPERCEPAT korosi tiang gawang di lapangan terbuka ke kotak "Faktor Penyebab"!'
          },
          predictOptions: [
            { text: 'Jika hujan makin asam, korosi pada tiang gawang yang tidak terlindungi akan makin cepat karena ion H⁺ dari hujan asam meningkatkan konduktivitas elektrolit.', correct: true },
            { text: 'Jika tiang gawang dicat biasa, korosi akan berhenti sepenuhnya tanpa perawatan rutin karena cat menutup semua pori besi.', correct: false },
            { text: 'Tiang galvanis tidak perlu perawatan apapun karena lapisan Zn tidak akan habis sama sekali.', correct: false }
          ],
          decisions: [
            { id: 'galvanize', icon: '🔩', name: 'Galvanisasi Celup Panas', tags: ['Ketahanan: 15–20 Th', 'Biaya: Hemat Panjang', 'Lingkungan: Berkelanjutan'], ok: true,
              why: 'Tepat! E° Zn²⁺/Zn = -0,76V lebih negatif dari Fe²⁺/Fe = -0,44V. Seng mengorbankan diri sebagai anoda korban, melindungi besi meski tergores benturan bola. Tahan 15-20 tahun tanpa perawatan. (SDG 9 & 12)' },
            { id: 'epoxy', icon: '🖌️', name: 'Cat Epoksi Tugas Berat', tags: ['Ketahanan: 2–3 Th', 'Biaya: Boros Berkala', 'Lingkungan: Limbah Thinner'], ok: false,
              why: 'Kurang tepat. Epoksi tidak memiliki proteksi anoda korban. Benturan bola meretakkan lapisan, air merembes → undercutting corrosion. Harus dicat ulang tiap 2-3 tahun.' },
            { id: 'stainless', icon: '✨', name: 'Ganti Stainless Steel', tags: ['Ketahanan: Sangat Tinggi', 'Biaya: 5× Lipat', 'Lingkungan: Jejak C Masif'], ok: false,
              why: 'Kurang tepat. Biaya 5× lipat anggaran sekolah. Embodied carbon peleburan Ni-Cr masif, tidak proporsional untuk tiang olahraga sekolah. Kontra SDG 12.' }
          ],
          resultBefore: '🟫 Tiang Berkarat', resultAfter: '✅ Tiang Terlindungi 20 Th',
          resultDesc: 'Galvanisasi menciptakan proteksi katodik aktif. Zn (anoda korban) mengoksidasi diri lebih dulu: Zn → Zn²⁺ + 2e⁻, mengalirkan elektron ke besi dan mencegah besi teroksidasi.'
        },

        gate: {
          id: 'gate', title: 'Area 3: Gerbang Sekolah', obj: 'Gerbang Geser Sekolah',
          color: '#8b5cf6',
          steps: [
            { id: 'observe',   label: '🔎 Amati',    title: '🔎 Langkah 1: Amati Gerbang Sekolah' },
            { id: 'find',      label: '🎯 Temukan',  title: '🎯 Langkah 2: Temukan Bagian Bermasalah' },
            { id: 'identify',  label: '🧪 Analisis', title: '🧪 Langkah 3: Analisis Kondisi & Penyebab' },
            { id: 'decide',    label: '⚖️ Putuskan', title: '⚖️ Langkah 4: Pilih Tindakan Penyelamatan' },
            { id: 'consider',  label: '♻️ Pertimbangkan', title: '♻️ Langkah 5: Pertimbangkan 4 Dimensi' },
            { id: 'result',    label: '✅ Hasil',     title: '✅ Hasil Penyelamatan' }
          ],
          hotspots: [
            { id: 'hinge', label: 'Engsel Pintu', x: 22, y: 48, type: 'rust',
              magnifyHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #7c2d12 0%, #9a3412 35%, #c2410c 65%, #92400e 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟫</div>',
              desc: 'Engsel terus bergesekan saat gerbang dibuka-tutup. Gesekan menghilangkan lapisan oksida pelindung → permukaan besi baru terus terekspos → korosi dipercepat.' },
            { id: 'wheel', label: 'Roda Rel Bawah', x: 50, y: 82, type: 'rust',
              magnifyHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #ca8a04 0%, #b45309 40%, #9a3412 80%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🟤</div>',
              desc: 'Roda rel langsung di atas tanah, selalu terkena air, genangan, dan partikel abrasif. Kombinasi gesekan mekanis + elektrolit air tanah → korosi paling parah.' },
            { id: 'joint', label: 'Sambungan Besi', x: 70, y: 38, type: 'rust',
              magnifyHtml: '<div style="width:100%;height:100%;background:radial-gradient(circle, #78350f 0%, #9a3412 45%, #c2410c 85%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🔴</div>',
              desc: 'Sambungan las memiliki tegangan sisa (residual stress) dari proses pengelasan. Stres mekanis ini mempercepat korosi intergranular di area sambungan.' },
            { id: 'panel', label: 'Panel Tengah', x: 45, y: 30, type: 'clean',
              magnifyHtml: '<div style="width:100%;height:100%;background:linear-gradient(135deg, #1e293b 0%, #475569 50%, #94a3b8 100%);display:flex;align-items:center;justify-content:center;font-size:2rem;">🩶</div>',
              desc: 'Panel tengah masih dalam kondisi baik karena catnya belum terkelupas. Tidak terkena gesekan mekanis dan memiliki aliran udara yang baik.' }
          ],
          rustHotspots: ['hinge', 'wheel', 'joint'],
          analysisFacts: [
            { icon: '⚙️', text: 'Engsel mengalami gesekan mekanis setiap hari', type: 'mechanical' },
            { icon: '💧', text: 'Roda rel selalu lembap karena kontak dengan tanah', type: 'chemical' },
            { icon: '⚡', text: 'Dua logam berbeda yang bersentuhan memicu korosi galvanik', type: 'galvanic' },
            { icon: '🔥', text: 'Suhu tinggi di siang hari membantu mengeringkan air secara alami', type: 'neutral' }
          ],
          decisions: [
            { id: 'grease', icon: '🧈', name: 'Pelumas Gemuk Tahan Air', tags: ['Efektivitas: Sangat Tinggi', 'Biaya: Murah', 'Lingkungan: Ramah'], ok: true,
              why: 'Tepat! Gemuk kalsium/litium bersifat hidrofobik (menolak air) dan mengurangi gesekan mekanis. Mencegah kontak O₂+H₂O dengan logam di celah engsel. Rutin 3-6 bulan. (SDG 12)' },
            { id: 'paint', icon: '🖌️', name: 'Cat Tebal di Celah Engsel', tags: ['Efektivitas: Merusak', 'Biaya: Rugi', 'Lingkungan: Serpihan Cat'], ok: false,
              why: 'Sangat salah! Cat mengering di celah engsel → engsel terkunci macet! Ketika dipaksa bergerak, cat rontok menjadi serpihan limbah dan engsel rusak total.' },
            { id: 'copper', icon: '🟡', name: 'Ganti Poros dengan Tembaga', tags: ['Efektivitas: Merusak', 'Biaya: Mahal', 'Kimia: Korosi Galvanik'], ok: false,
              why: 'Salah! E° Cu²⁺/Cu = +0,34V >> E° Fe²⁺/Fe = -0,44V. Kontak tembaga-besi dalam larutan elektrolit → korosi galvanik masif! Rangka besi terkorosi jauh lebih cepat.' }
          ],
          sustainability: {
            pillars: [
              { icon: '🎯', name: 'Efektivitas', question: 'Seberapa efektif pelumas menghentikan korosi pada engsel bergerak?',
                options: ['Sangat efektif – melapisi celah mikro dan menolak air', 'Hanya efektif untuk permukaan diam', 'Tidak efektif sama sekali'],
                correct: 0 },
              { icon: '💰', name: 'Biaya', question: 'Bagaimana profil biaya pelumasan berkala dibanding ganti komponen?',
                options: ['Sangat murah – sedikit pelumas untuk banyak manfaat', 'Sama mahalnya dengan ganti engsel baru', 'Lebih mahal dari galvanisasi'],
                correct: 0 },
              { icon: '⏱️', name: 'Ketahanan', question: 'Berapa lama sekali-sekali perlu dilakukan pelumasan ulang?',
                options: ['Tiap 3–6 bulan sekali', 'Setiap hari', 'Sekali seumur hidup komponen'],
                correct: 0 },
              { icon: '🌿', name: 'Lingkungan', question: 'Apa dampak lingkungan dari pelumasan yang benar?',
                options: ['Sangat ramah – mencegah pembuangan komponen logam bekas', 'Menghasilkan limbah logam berat', 'Merusak tanah di sekitar gerbang'],
                correct: 0 }
            ]
          },
          resultBefore: '⚙️ Gerbang Macet & Berkarat', resultAfter: '✅ Gerbang Mulus & Terlindungi',
          resultDesc: 'Pelumas gemuk membentuk film hidrofobik tipis di celah engsel dan roda. Film ini menolak molekul H₂O, mengurangi gesekan, dan menyumbat jalur masuk O₂ → reaksi korosi terhenti.'
        }
      };

      /* ---- STATE ---- */
      var curAdvArea = null;
      var curAdvStep = 0;
      var curAdvStepScore = 0;
      var advTotalScore = 0;
      var advTagged = {}; // { hotspotId: 'rust'|'clean' }
      var advMagOn = false;
      var advMagPosX = 50, advMagPosY = 50; // percent
      var adv3dRotX = 20, adv3dRotY = -15;
      var advDragStart = null;
      var advSustainAnswers = {}; // for gate area pillar quiz
      var advDecisionMade = false;

      /* ---- PROGRESS (unchanged API) ---- */
      function getAdvProgress() {
        try { return JSON.parse(localStorage.getItem('advProg') || '{}'); } catch(e) { return {}; }
      }
      function saveAdvProgress(pr) {
        try { localStorage.setItem('advProg', JSON.stringify(pr)); } catch(e) {}
      }
      function isAllAdvDone() {
        var pr = getAdvProgress();
        return !!(pr.garden && pr.field && pr.gate);
      }

      /* ---- HELPERS ---- */
      function esc(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      }
      function setContent(id, html) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = html;
      }
      function setText(id, txt) {
        var el = document.getElementById(id);
        if (el) el.textContent = txt;
      }
      function showFeedback(type, html) {
        var fb = document.getElementById('advFeedbackBox');
        if (!fb) return;
        fb.className = 'adv-feedback-box show ' + type;
        fb.innerHTML = html;
        fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      function hideFeedback() {
        var fb = document.getElementById('advFeedbackBox');
        if (fb) { fb.className = 'adv-feedback-box'; fb.innerHTML = ''; }
      }
      function showBtn(id, show) {
        var el = document.getElementById(id);
        if (el) el.hidden = !show;
      }

      /* ---- 3D CANVAS RENDERER ---- */
      var advAnimFrame = null;
      function adv3dDraw(areaKey) {
        var canvas = document.getElementById('adv3dCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        var rx = adv3dRotX, ry = adv3dRotY;

        if (areaKey === 'garden') adv3dDrawFence(ctx, W, H, rx, ry);
        else if (areaKey === 'field') adv3dDrawField(ctx, W, H, rx, ry);
        else if (areaKey === 'gate') adv3dDrawGate(ctx, W, H, rx, ry);
      }

      function adv3dSetup() {
        var canvas = document.getElementById('adv3dCanvas');
        if (!canvas) return;
        var wrap = canvas.parentElement;
        canvas.width = wrap.clientWidth || 500;
        canvas.height = Math.min(canvas.width * 0.52, 300);
        wrap.style.height = canvas.height + 'px';
      }

      /* ---- 3D SCENE: GARDEN FENCE ---- */
      function adv3dDrawFence(ctx, W, H, rx, ry) {
        // Sky + ground gradient
        var sky = ctx.createLinearGradient(0, 0, 0, H * 0.6);
        sky.addColorStop(0, '#7ec8e3'); sky.addColorStop(1, '#c8e9f4');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.6);
        var grd = ctx.createLinearGradient(0, H * 0.58, 0, H);
        grd.addColorStop(0, '#5a9e3c'); grd.addColorStop(1, '#3c7a28');
        ctx.fillStyle = grd; ctx.fillRect(0, H * 0.58, W, H);

        // Perspective shift with rotation
        var pShiftX = ry * 1.2; // ry controls left-right perspective
        var pShiftY = rx * 0.8; // rx controls up-down tilt

        // Draw fence posts (vertical bars)
        var numBars = 8;
        var barW = 14;
        var totalFenceW = W * 0.78;
        var startX = W * 0.11;
        var groundY = H * 0.63 - pShiftY * 0.3;
        var topRailY = H * 0.22 - pShiftY * 0.5;
        var midRailY = H * 0.45 - pShiftY * 0.3;

        // Calculate perspective warp based on rotation
        function getX(i) {
          var base = startX + (totalFenceW / (numBars - 1)) * i;
          var persp = pShiftX * (i - numBars/2) * 0.04;
          return base + persp;
        }

        // Top rail
        ctx.beginPath();
        ctx.moveTo(getX(0), topRailY);
        ctx.lineTo(getX(numBars - 1), topRailY + pShiftX * 0.05);
        ctx.lineWidth = 10; ctx.strokeStyle = '#5a3a1a'; ctx.stroke();
        // Top rail top highlight
        ctx.beginPath();
        ctx.moveTo(getX(0), topRailY - 2);
        ctx.lineTo(getX(numBars - 1), topRailY - 2 + pShiftX * 0.05);
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.stroke();

        // Mid rail
        ctx.beginPath();
        ctx.moveTo(getX(0), midRailY);
        ctx.lineTo(getX(numBars - 1), midRailY + pShiftX * 0.04);
        ctx.lineWidth = 8; ctx.strokeStyle = '#5a3a1a'; ctx.stroke();

        // Vertical bars
        for (var i = 0; i < numBars; i++) {
          var bx = getX(i);
          var bTop = topRailY - 10;
          var bBot = groundY;
          var isRust = (i === 2 || i === 3 || i === 5); // specific bars are rusty

          // Shadow
          ctx.beginPath();
          ctx.moveTo(bx + 3, bTop); ctx.lineTo(bx + 3, bBot);
          ctx.lineWidth = barW + 4;
          ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.stroke();

          // Bar body
          ctx.beginPath();
          ctx.moveTo(bx, bTop); ctx.lineTo(bx, bBot);
          ctx.lineWidth = barW;

          if (isRust) {
            var rustGrad = ctx.createLinearGradient(bx - barW/2, 0, bx + barW/2, 0);
            rustGrad.addColorStop(0, '#7c2d12');
            rustGrad.addColorStop(0.3, '#c2410c');
            rustGrad.addColorStop(0.7, '#9a3412');
            rustGrad.addColorStop(1, '#451a03');
            ctx.strokeStyle = rustGrad;
          } else {
            var metalGrad = ctx.createLinearGradient(bx - barW/2, 0, bx + barW/2, 0);
            metalGrad.addColorStop(0, '#1e293b');
            metalGrad.addColorStop(0.3, '#475569');
            metalGrad.addColorStop(0.6, '#94a3b8');
            metalGrad.addColorStop(1, '#334155');
            ctx.strokeStyle = metalGrad;
          }
          ctx.stroke();

          // Pointy top
          ctx.beginPath();
          ctx.moveTo(bx, bTop - 12);
          ctx.lineTo(bx - barW/2, bTop);
          ctx.lineTo(bx + barW/2, bTop);
          ctx.closePath();
          ctx.fillStyle = isRust ? '#7c2d12' : '#1e293b';
          ctx.fill();

          // Rust blotch overlay
          if (isRust) {
            var blotchY = bTop + (bBot - bTop) * 0.4;
            ctx.beginPath();
            ctx.ellipse(bx, blotchY, barW * 0.8, 20, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(249,115,22,0.35)';
            ctx.fill();
          }
        }

        // Bottom base plate
        ctx.fillStyle = '#3d2711';
        ctx.fillRect(startX - 10, groundY - 4, totalFenceW + 20, 12);

        // Some flowers near fence (decorative)
        var flowers = [[startX + 30, groundY + 12], [startX + 90, groundY + 8], [W - startX - 50, groundY + 15]];
        flowers.forEach(function(f) {
          ctx.beginPath(); ctx.arc(f[0], f[1], 6, 0, Math.PI * 2);
          ctx.fillStyle = '#f9a8d4'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(f[0], f[1] + 6); ctx.lineTo(f[0], f[1] + 20);
          ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 2; ctx.stroke();
        });

        // Rotation indicator arc
        drawRotationArc(ctx, W, H, ry);
      }

      /* ---- 3D SCENE: FIELD ---- */
      function adv3dDrawField(ctx, W, H, rx, ry) {
        // Sky
        var sky = ctx.createLinearGradient(0, 0, 0, H * 0.5);
        sky.addColorStop(0, '#60a5fa'); sky.addColorStop(1, '#bae6fd');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.5);
        // Field
        var grd = ctx.createLinearGradient(0, H * 0.48, 0, H);
        grd.addColorStop(0, '#4ade80'); grd.addColorStop(0.5, '#22c55e'); grd.addColorStop(1, '#15803d');
        ctx.fillStyle = grd; ctx.fillRect(0, H * 0.48, W, H);

        var pShiftX = ry * 1.2;
        var gY = H * 0.52;

        // Goal post
        var gpX = W * 0.22, gpW = W * 0.26;
        var gpH = H * 0.42, gpTop = gY - gpH;
        ctx.lineWidth = 10;

        // Rust tones for goalpost
        var gpGrad = ctx.createLinearGradient(gpX, 0, gpX + 10, 0);
        gpGrad.addColorStop(0, '#7c2d12'); gpGrad.addColorStop(0.4, '#c2410c');
        gpGrad.addColorStop(1, '#9a3412');

        // Left post
        ctx.beginPath(); ctx.moveTo(gpX + pShiftX*0.1, gY); ctx.lineTo(gpX + pShiftX*0.1, gpTop);
        ctx.strokeStyle = gpGrad; ctx.stroke();
        // Right post
        ctx.beginPath(); ctx.moveTo(gpX + gpW + pShiftX*0.1, gY); ctx.lineTo(gpX + gpW + pShiftX*0.1, gpTop);
        ctx.stroke();
        // Crossbar
        ctx.beginPath(); ctx.moveTo(gpX + pShiftX*0.1, gpTop); ctx.lineTo(gpX + gpW + pShiftX*0.1, gpTop);
        ctx.strokeStyle = gpGrad; ctx.stroke();

        // Rust spots on goalpost
        for (var i = 0; i < 5; i++) {
          var rx2 = gpX + Math.random() * gpW * 0.8 + pShiftX*0.1;
          var ry2 = gpTop + Math.random() * gpH * 0.7;
          ctx.beginPath(); ctx.arc(rx2, ry2, 5 + Math.random()*6, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(249,115,22,0.5)'; ctx.fill();
        }

        // Galvanized pole (right side, clean/silver)
        var gpX2 = W * 0.72;
        var metalGrad = ctx.createLinearGradient(gpX2, 0, gpX2 + 12, 0);
        metalGrad.addColorStop(0, '#475569'); metalGrad.addColorStop(0.5, '#cbd5e1');
        metalGrad.addColorStop(1, '#94a3b8');
        ctx.beginPath(); ctx.moveTo(gpX2, gY); ctx.lineTo(gpX2, gY - H*0.52);
        ctx.lineWidth = 10; ctx.strokeStyle = metalGrad; ctx.stroke();
        // "GALVANIS" label
        ctx.fillStyle = '#1e3a5f'; ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center'; ctx.fillText('GALVANIS', gpX2, gY - H*0.52 - 8);

        // Bench (center)
        var bX = W*0.44, bY = gY + H*0.1;
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(bX, bY - 8, W*0.18, 10);
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(bX + 5, bY + 2, 10, 20);
        ctx.fillRect(bX + W*0.18 - 15, bY + 2, 10, 20);

        // Field lines
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(W/2, gY); ctx.lineTo(W/2, H);
        ctx.stroke(); ctx.setLineDash([]);

        drawRotationArc(ctx, W, H, ry);
      }

      /* ---- 3D SCENE: GATE ---- */
      function adv3dDrawGate(ctx, W, H, rx, ry) {
        // Sky + ground
        var sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
        sky.addColorStop(0, '#fbbf24'); sky.addColorStop(1, '#fde68a');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.55);
        // Ground
        ctx.fillStyle = '#d97706';
        ctx.fillRect(0, H * 0.54, W, H);

        var pShiftX = ry * 1.2;
        var gndY = H * 0.6;

        // Gate frame / wall pillars
        var pW = 24, pLeft = W * 0.1, pRight = W * 0.88;
        [pLeft, pRight].forEach(function(px) {
          var pg = ctx.createLinearGradient(px, 0, px + pW, 0);
          pg.addColorStop(0, '#6b7280'); pg.addColorStop(0.4, '#d1d5db'); pg.addColorStop(1, '#6b7280');
          ctx.fillStyle = pg;
          ctx.fillRect(px + pShiftX*0.05, H*0.08, pW, gndY - H*0.08);
          // Top cap
          ctx.fillStyle = '#374151';
          ctx.fillRect(px - 3 + pShiftX*0.05, H*0.06, pW + 6, 10);
        });

        // Gate panels (sliding gate, 2 halves)
        var panelW = (W * 0.75) / 2;
        var panelTop = H * 0.12;
        var panelBot = gndY - 14;
        var panelH = panelBot - panelTop;

        // Panel color (dark metal with rust)
        var bars = 6;
        var barSpacing = panelW / bars;

        for (var half = 0; half < 2; half++) {
          var panX = pLeft + pW + 4 + half * panelW + pShiftX * (half === 0 ? 0.08 : 0.12);

          // Horizontal rails
          [panelTop, panelTop + panelH * 0.33, panelTop + panelH * 0.66, panelBot].forEach(function(ry3) {
            var rg = ctx.createLinearGradient(panX, ry3, panX + panelW, ry3);
            rg.addColorStop(0, '#1e293b'); rg.addColorStop(0.5, '#475569'); rg.addColorStop(1, '#1e293b');
            ctx.fillStyle = rg;
            ctx.fillRect(panX, ry3, panelW, 8);
          });

          // Vertical pickets
          for (var b = 0; b < bars; b++) {
            var bx2 = panX + b * barSpacing + barSpacing/2 - 5;
            var isRusty = (half === 0 && (b === 1 || b === 4)) || (half === 1 && b === 2);
            var vg = ctx.createLinearGradient(bx2, 0, bx2 + 10, 0);
            if (isRusty) {
              vg.addColorStop(0, '#7c2d12'); vg.addColorStop(0.4, '#c2410c'); vg.addColorStop(1, '#9a3412');
            } else {
              vg.addColorStop(0, '#1e293b'); vg.addColorStop(0.4, '#475569'); vg.addColorStop(1, '#334155');
            }
            ctx.fillStyle = vg;
            ctx.fillRect(bx2, panelTop, 10, panelH);
          }
        }

        // Rail at bottom
        var railGrad = ctx.createLinearGradient(0, gndY - 12, 0, gndY + 2);
        railGrad.addColorStop(0, '#d1d5db'); railGrad.addColorStop(1, '#6b7280');
        ctx.fillStyle = railGrad;
        ctx.fillRect(pLeft, gndY - 12, pRight - pLeft + pW, 14);

        // Wheel (bottom)
        var wheelX = pLeft + pW + panelW + pShiftX * 0.1;
        var wheelY = gndY - 7;
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, 11, 0, Math.PI * 2);
        var wg = ctx.createRadialGradient(wheelX - 3, wheelY - 3, 2, wheelX, wheelY, 11);
        wg.addColorStop(0, '#d97706'); wg.addColorStop(0.5, '#92400e'); wg.addColorStop(1, '#451a03');
        ctx.fillStyle = wg; ctx.fill();
        ctx.beginPath(); ctx.arc(wheelX, wheelY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b'; ctx.fill();

        // Hinge (left panel left side)
        var hingeX = pLeft + pW + 4 + pShiftX * 0.08;
        [panelTop + panelH * 0.2, panelTop + panelH * 0.6].forEach(function(hy) {
          var hg = ctx.createRadialGradient(hingeX, hy, 2, hingeX, hy, 10);
          hg.addColorStop(0, '#fbbf24'); hg.addColorStop(0.4, '#c2410c'); hg.addColorStop(1, '#7c2d12');
          ctx.beginPath(); ctx.arc(hingeX, hy, 10, 0, Math.PI * 2);
          ctx.fillStyle = hg; ctx.fill();
          ctx.beginPath(); ctx.arc(hingeX, hy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#7c2d12'; ctx.fill();
        });

        drawRotationArc(ctx, W, H, ry);
      }

      function drawRotationArc(ctx, W, H, ry) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#fde047'; ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.9, W * 0.42, Math.PI * 0.6, Math.PI * 2.4);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      /* ---- MAGNIFIER DETAIL HTML per area ---- */
      function getMagHtml(areaKey, nearestHotspot) {
        if (!nearestHotspot) {
          return '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:0.65rem;text-align:center;padding:4px;">Gerakkan ke area yang dicurigai</div>';
        }
        return nearestHotspot.magnifyHtml || '<div style="width:100%;height:100%;background:#1e293b;"></div>';
      }

      /* ---- FIND NEAREST HOTSPOT ---- */
      function findNearestHotspot(areaKey, pct_x, pct_y) {
        var area = ADV_AREAS[areaKey];
        if (!area || !area.hotspots) return null;
        var best = null, bestDist = 9999;
        area.hotspots.forEach(function(hs) {
          var dx = hs.x - pct_x, dy = hs.y - pct_y;
          var d = Math.sqrt(dx*dx + dy*dy);
          if (d < bestDist) { bestDist = d; best = hs; }
        });
        return bestDist < 20 ? best : null;
      }

      /* ---- MAGNIFIER CONTROLLER ---- */
      function initMagnifier(areaKey) {
        var wrap = document.getElementById('adv3dViewerWrap');
        var mag = document.getElementById('advMagnifier');
        var toggle = document.getElementById('advMagToggle');
        if (!wrap || !mag || !toggle) return;

        advMagOn = false;
        mag.classList.remove('visible');

        toggle.onclick = function() {
          advMagOn = !advMagOn;
          document.getElementById('advMagToggleLabel').textContent = advMagOn ? 'ON' : 'OFF';
          toggle.classList.toggle('on', advMagOn);
          if (!advMagOn) mag.classList.remove('visible');
          else mag.classList.add('visible');
        };

        function moveMag(e) {
          if (!advMagOn) return;
          var rect = wrap.getBoundingClientRect();
          var clientX = e.touches ? e.touches[0].clientX : e.clientX;
          var clientY = e.touches ? e.touches[0].clientY : e.clientY;
          var px = ((clientX - rect.left) / rect.width) * 100;
          var py = ((clientY - rect.top) / rect.height) * 100;
          advMagPosX = Math.max(5, Math.min(95, px));
          advMagPosY = Math.max(5, Math.min(95, py));
          mag.style.left = advMagPosX + '%';
          mag.style.top = advMagPosY + '%';
          mag.classList.add('visible');
          // Update magnifier glass content
          var nearest = findNearestHotspot(areaKey, advMagPosX, advMagPosY);
          document.getElementById('advMagnifierGlass').innerHTML = getMagHtml(areaKey, nearest);
        }

        wrap.addEventListener('pointermove', function(e) {
          if (e.pointerType === 'touch') return; // handled by touchmove
          moveMag(e);
        });
        wrap.addEventListener('touchmove', function(e) {
          e.preventDefault();
          moveMag(e);
        }, { passive: false });
      }

      /* ---- 3D ROTATION CONTROLLER ---- */
      function init3dRotation(areaKey) {
        var wrap = document.getElementById('adv3dViewerWrap');
        if (!wrap) return;
        var dragging = false, lastX = 0, lastY = 0;

        wrap.addEventListener('pointerdown', function(e) {
          if (advMagOn) return; // magnifier mode: don't rotate
          dragging = true;
          lastX = e.clientX; lastY = e.clientY;
          wrap.setPointerCapture(e.pointerId);
        });
        wrap.addEventListener('pointermove', function(e) {
          if (!dragging || advMagOn) return;
          var dx = e.clientX - lastX, dy = e.clientY - lastY;
          adv3dRotY += dx * 0.4;
          adv3dRotX += dy * 0.25;
          adv3dRotX = Math.max(-40, Math.min(50, adv3dRotX));
          lastX = e.clientX; lastY = e.clientY;
          adv3dDraw(areaKey);
        });
        wrap.addEventListener('pointerup', function() { dragging = false; });
        wrap.addEventListener('pointercancel', function() { dragging = false; });

        // Touch pinch-to-zoom placeholder (fires redraw)
        wrap.addEventListener('touchstart', function(e) { if (e.touches.length === 1 && !advMagOn) dragging = true; }, { passive: true });
        wrap.addEventListener('touchmove', function(e) {
          if (!dragging || advMagOn) return;
          if (e.touches.length !== 1) return;
          // handled via pointer events on most modern browsers
        }, { passive: true });
        wrap.addEventListener('touchend', function() { dragging = false; });
      }

      /* ---- HOTSPOT OVERLAY ---- */
      function renderHotspotOverlay(areaKey, visibleAll, tagMode) {
        var overlay = document.getElementById('advHotspotOverlay');
        var wrap = document.getElementById('adv3dViewerWrap');
        if (!overlay || !wrap) return;
        var area = ADV_AREAS[areaKey];
        if (!area || !area.hotspots) return;

        overlay.innerHTML = '';
        overlay.style.pointerEvents = tagMode ? 'all' : 'none';

        area.hotspots.forEach(function(hs) {
          var size = 48;
          var div = document.createElement('div');
          div.className = 'adv-hotspot-area' + (tagMode ? ' ' + hs.type : '');
          if (advTagged[hs.id]) div.classList.add('tagged', advTagged[hs.id]);
          div.style.cssText = 'position:absolute;left:' + hs.x + '%;top:' + hs.y + '%;width:' + size + 'px;height:' + size + 'px;transform:translate(-50%,-50%);';
          div.innerHTML = '<span class="adv-hotspot-icon">' + (advTagged[hs.id] ? (advTagged[hs.id] === 'rust' ? '🔴' : '✅') : (tagMode ? '?' : '')) + '</span>';

          if (tagMode) {
            div.style.pointerEvents = 'all';
            div.onclick = function() {
              // Toggle: untagged → rust → clean → untagged
              if (!advTagged[hs.id]) advTagged[hs.id] = 'rust';
              else if (advTagged[hs.id] === 'rust') advTagged[hs.id] = 'clean';
              else delete advTagged[hs.id];
              renderHotspotOverlay(areaKey, visibleAll, tagMode);
              tone([440, 554]);
            };
          }
          overlay.appendChild(div);
        });
      }

      /* ---- STEP TRACKER ---- */
      function renderStepsBar(areaKey, currentStep) {
        var area = ADV_AREAS[areaKey];
        var bar = document.getElementById('advStepsBar');
        if (!bar || !area) return;
        bar.innerHTML = area.steps.map(function(s, i) {
          var cls = i < currentStep ? 'done' : (i === currentStep ? 'active' : '');
          return (i > 0 ? '<span class="adv-step-arrow">›</span>' : '') +
            '<span class="adv-step-pill ' + cls + '">' + s.label + '</span>';
        }).join('');
      }

      /* ---- UPDATE SCORE DISPLAY ---- */
      function updateScoreDisplay() {
        var el = document.getElementById('advScoreDisplay');
        if (el) el.textContent = '⭐ Poin: ' + advTotalScore;
      }

      /* ---- MASTER STEP CONTROLLER ---- */
      function runAdvStep(areaKey, stepIdx) {
        var area = ADV_AREAS[areaKey];
        if (!area) return;
        curAdvStep = stepIdx;
        var step = area.steps[stepIdx];
        if (!step) return;

        setText('advActivityTitle', step.title);
        hideFeedback();
        renderStepsBar(areaKey, stepIdx);

        // Buttons default
        showBtn('advCheckBtn', false);
        showBtn('advNextStepBtn', true);
        showBtn('advFinishAreaBtn', false);
        setText('advNextStepBtn', 'Lanjut →');
        document.getElementById('advNextStepBtn').onclick = function() {
          runAdvStep(areaKey, stepIdx + 1);
        };

        // Dispatch to per-area, per-step handler
        var fn = 'advStep_' + areaKey + '_' + step.id;
        if (typeof window[fn] === 'function') {
          window[fn](area, step, stepIdx);
        } else {
          // Fallback: result or unknown
          if (step.id === 'result') {
            advShowResult(area);
          } else {
            setContent('advActivityContent', '<p style="color:#78350f;font-size:0.85rem;">Langkah ini sedang dipersiapkan.</p>');
          }
        }
        adv3dDraw(areaKey);
      }

      /* ============================================================
         AREA 1 – GARDEN STEPS
         ============================================================ */
      window.advStep_garden_observe = function(area) {
        renderHotspotOverlay('garden', false, false);
        setContent('advActivityContent', '');
        setText('advActivityInstruction',
          'Seret objek untuk memutar pagar dari berbagai sudut. Aktifkan Kaca Pembesar dan gerakkan ke seluruh permukaan untuk memeriksa detail logam. Perhatikan warna, tekstur, dan kondisi tiap bagian pagar!');
        showBtn('advNextStepBtn', true);
        setText('advNextStepBtn', 'Siap Temukan Korosi →');
        document.getElementById('advNextStepBtn').onclick = function() {
          advTagged = {};
          runAdvStep('garden', 1);
        };
      };

      window.advStep_garden_find = function(area) {
        renderHotspotOverlay('garden', true, true);
        setText('advActivityInstruction',
          'Klik bagian pagar yang menurutmu mengalami KOROSI (tandai 🔴) dan yang MASIH BAIK (tandai ✅). Gunakan Kaca Pembesar untuk membantu pengamatan!');
        setContent('advActivityContent',
          '<p style="font-size:0.8rem;color:#5a2e04;margin:0 0 8px;">Klik hotspot di objek untuk memberi tag: 🔴 Berkarat / ✅ Baik</p>' +
          '<div id="advTagResult"></div>');
        showBtn('advCheckBtn', true);
        document.getElementById('advCheckBtn').onclick = function() {
          var correct = 0, total = area.hotspots.length;
          area.hotspots.forEach(function(hs) {
            if (advTagged[hs.id] === hs.type) correct++;
          });
          if (correct === total) {
            advTotalScore += 20; updateScoreDisplay(); tone([523,659,784,1046]);
            showFeedback('success', '<b>🎉 Luar Biasa!</b> Semua bagian berhasil diidentifikasi dengan tepat! <br>Sambungan jeruji dan batang bawah memang paling mudah korosi karena kontak langsung dengan air dan tanah basah (elektrolit).');
            showBtn('advCheckBtn', false);
            showBtn('advNextStepBtn', true);
            setText('advNextStepBtn', 'Identifikasi Proses →');
            document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('garden', 2); };
          } else {
            tone([330,262]);
            showFeedback('warning', '<b>⚠️ Belum Semua Tepat</b> (' + correct + '/' + total + ' benar).<br>Gunakan Kaca Pembesar lebih teliti! Perhatikan warna kemerahan-cokelat dan tekstur kasar yang menandai korosi.');
          }
        };
        document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('garden', 2); };
      };

      window.advStep_garden_identify = function(area) {
        renderHotspotOverlay('garden', false, false);
        var pairs = area.matchPairs;
        var selectedLeft = null, selectedRight = null;
        var matched = {};

        function renderPairs() {
          var leftHtml = pairs.map(function(p, i) {
            var cls = matched[p.key] ? 'adv-id-item matched' : (selectedLeft === i ? 'adv-id-item selected' : 'adv-id-item');
            return '<div class="' + cls + '" data-side="left" data-idx="' + i + '">' + esc(p.left) + '</div>';
          }).join('');
          var rightHtml = pairs.map(function(p, i) {
            var cls = matched[p.key] ? 'adv-id-item matched' : (selectedRight === i ? 'adv-id-item selected' : 'adv-id-item');
            return '<div class="' + cls + '" data-side="right" data-idx="' + i + '">' + esc(p.right) + '</div>';
          }).join('');
          document.getElementById('advPairsLeft').innerHTML = leftHtml;
          document.getElementById('advPairsRight').innerHTML = rightHtml;
          attachPairClicks();
        }

        function attachPairClicks() {
          document.querySelectorAll('.adv-id-item').forEach(function(el) {
            if (el.classList.contains('matched')) return;
            el.onclick = function() {
              var side = el.dataset.side, idx = +el.dataset.idx;
              if (side === 'left') selectedLeft = idx;
              else selectedRight = idx;
              if (selectedLeft !== null && selectedRight !== null) {
                // Check match
                var lp = pairs[selectedLeft], rp = pairs[selectedRight];
                if (lp.key === rp.key) {
                  matched[lp.key] = true;
                  advTotalScore += 5; updateScoreDisplay(); tone([554,659]);
                } else {
                  tone([330,262]);
                }
                selectedLeft = null; selectedRight = null;
                renderPairs();
                if (Object.keys(matched).length === pairs.length) {
                  advTotalScore += 10; updateScoreDisplay();
                  showFeedback('success', '<b>🧪 Sempurna!</b> Semua pasangan cocok! Korosi adalah reaksi elektrokimia: besi (anoda) melepas elektron → Fe → Fe²⁺ + 2e⁻, sementara oksigen (katoda) menerima elektron → O₂ + 4e⁻ + 2H₂O → 4OH⁻. Hasilnya: Fe₂O₃·nH₂O (karat merah).');
                  showBtn('advNextStepBtn', true);
                  setText('advNextStepBtn', 'Pilih Tindakan →');
                  document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('garden', 3); };
                }
              } else renderPairs();
            };
          });
        }

        setText('advActivityInstruction', 'Pasangkan setiap konsep di kiri dengan penjelasannya di kanan! Klik satu item di kiri, lalu klik pasangannya di kanan.');
        setContent('advActivityContent',
          '<div class="adv-id-pairs"><div class="adv-id-left" id="advPairsLeft"></div><div class="adv-id-right" id="advPairsRight"></div></div>');
        renderPairs();
        showBtn('advCheckBtn', false);
        showBtn('advNextStepBtn', false);
      };

      window.advStep_garden_decide = function(area) {
        renderHotspotOverlay('garden', false, false);
        advDecisionMade = false;
        setText('advActivityInstruction', 'Pilih tindakan penanganan yang PALING TEPAT untuk pagar taman sekolah! Pertimbangkan efektivitas, biaya, dan dampak lingkungan.');
        var html = '<div class="adv-decision-visual-grid">' +
          area.decisions.map(function(d, i) {
            var tagsHtml = d.tags.map(function(t) {
              var cls = t.includes('Efek') ? 'eff' : (t.includes('Biaya') ? 'cost' : 'env');
              return '<span class="adv-dec-tag ' + cls + '">' + esc(t) + '</span>';
            }).join(' ');
            return '<div class="adv-dec-card" data-idx="' + i + '">' +
              '<span class="adv-dec-visual">' + d.icon + '</span>' +
              '<span class="adv-dec-name">' + esc(d.name) + '</span>' +
              '<div style="margin-top:5px;">' + tagsHtml + '</div></div>';
          }).join('') + '</div>';
        setContent('advActivityContent', html);
        showBtn('advCheckBtn', false);
        showBtn('advNextStepBtn', false);

        document.querySelectorAll('.adv-dec-card').forEach(function(card) {
          card.onclick = function() {
            if (advDecisionMade) return;
            advDecisionMade = true;
            var idx = +card.dataset.idx;
            var dec = area.decisions[idx];
            document.querySelectorAll('.adv-dec-card').forEach(function(c) { c.classList.remove('selected'); });
            card.classList.add(dec.ok ? 'correct' : 'wrong');
            if (dec.ok) {
              advTotalScore += 25; updateScoreDisplay(); tone([523,659,784,1046]);
              showFeedback('success', '<b>✅ ' + esc(dec.name) + ':</b> ' + esc(dec.why));
            } else {
              tone([330,262]);
              showFeedback('warning', '<b>⚠️ ' + esc(dec.name) + ':</b> ' + esc(dec.why));
              // Show correct after wrong
              setTimeout(function() {
                document.querySelectorAll('.adv-dec-card').forEach(function(c, ci) {
                  if (area.decisions[ci].ok) c.classList.add('correct');
                });
              }, 1200);
            }
            showBtn('advNextStepBtn', true);
            setText('advNextStepBtn', 'Lihat Hasil →');
            document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('garden', 4); };
          };
        });
      };

      window.advStep_garden_result = function(area) {
        advShowResult(area);
      };

      /* ============================================================
         AREA 2 – FIELD STEPS
         ============================================================ */
      window.advStep_field_observe = function(area) {
        renderHotspotOverlay('field', false, false);
        setContent('advActivityContent', '');
        setText('advActivityInstruction', 'Putar objek untuk mengamati peralatan lapangan dari berbagai sudut. Aktifkan Kaca Pembesar dan periksa kondisi tiang gawang, bangku besi, dan tiang galvanis. Catat perbedaan kondisi tiap objek!');
        showBtn('advNextStepBtn', true);
        setText('advNextStepBtn', 'Bandingkan Objek →');
        document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('field', 1); };
      };

      window.advStep_field_compare = function(area) {
        renderHotspotOverlay('field', true, false);
        setText('advActivityInstruction', 'Gunakan Kaca Pembesar untuk memeriksa masing-masing objek. Cocokkan setiap objek dengan kondisi dan faktor korosinya!');
        var objs = area.compareObjects;
        var html = '<div style="display:flex;flex-direction:column;gap:8px;">' +
          objs.map(function(o) {
            var bars = '';
            for (var i = 0; i < 3; i++) bars += '<span style="display:inline-block;width:16px;height:10px;border-radius:3px;margin-right:3px;background:' + (i < o.level ? '#ef4444' : '#d1d5db') + ';"></span>';
            return '<div style="display:flex;align-items:center;gap:10px;background:#fff;border:2px solid #d0c2ad;border-radius:12px;padding:9px 12px;">' +
              '<span style="font-size:1.6rem;">' + o.icon + '</span>' +
              '<div style="flex:1;">' +
              '<b style="font-size:0.85rem;">' + esc(o.name) + '</b><br>' +
              '<span style="font-size:0.76rem;color:#78350f;">Kondisi: ' + esc(o.kondisi) + '</span>' +
              '<div style="margin-top:3px;">' + bars + '<span style="font-size:0.72rem;color:#ef4444;margin-left:4px;">Tingkat korosi</span></div>' +
              '<div style="font-size:0.72rem;color:#5a2e04;margin-top:2px;">Faktor: ' + esc(o.faktor) + '</div>' +
              '</div></div>';
          }).join('') +
          '</div>';
        setContent('advActivityContent', html);
        showBtn('advCheckBtn', false);
        showBtn('advNextStepBtn', true);
        setText('advNextStepBtn', 'Identifikasi Faktor →');
        document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('field', 2); };
      };

      window.advStep_field_factors = function(area) {
        var fd = area.factorDrag;
        setText('advActivityInstruction', fd.hint);

        // Simple checkbox-based factor selection (works on all devices)
        var html = '<p style="font-size:0.8rem;color:#5a2e04;margin:0 0 8px;">Pilih faktor-faktor yang MEMPERCEPAT korosi tiang gawang di lapangan terbuka:</p>' +
          '<div class="adv-drag-area">' +
          fd.items.map(function(item) {
            return '<label style="display:inline-flex;align-items:center;gap:5px;padding:6px 10px;border:2px solid #d0c2ad;border-radius:999px;background:#fff;cursor:pointer;font-size:0.78rem;font-weight:800;">' +
              '<input type="checkbox" value="' + esc(item) + '" style="accent-color:#f59e0b;width:14px;height:14px;"> ' + esc(item) + '</label>';
          }).join('') +
          '</div>';
        setContent('advActivityContent', html);

        showBtn('advCheckBtn', true);
        document.getElementById('advCheckBtn').onclick = function() {
          var checked = Array.from(document.querySelectorAll('.adv-drag-area input[type=checkbox]:checked')).map(function(cb) { return cb.value; });
          var correctSet = new Set(fd.correct);
          var selectedSet = new Set(checked);
          var allCorrect = fd.correct.every(function(c) { return selectedSet.has(c); });
          var noDistractor = fd.distractor.every(function(d) { return !selectedSet.has(d); });
          if (allCorrect && noDistractor && checked.length === fd.correct.length) {
            advTotalScore += 15; updateScoreDisplay(); tone([523,659,784]);
            showFeedback('success', '<b>🌦️ Tepat!</b> Kelima faktor tersebut mempercepat korosi: air hujan/asam (elektrolit), UV (memecah lapisan pelindung), kelembapan (menjaga elektrolit), garam mineral (meningkatkan konduktivitas), dan benturan fisik (menghilangkan lapisan oksida). Suhu tinggi sendiri tidak secara langsung mempercepat korosi besi di lapangan terbuka.');
            showBtn('advCheckBtn', false);
            showBtn('advNextStepBtn', true);
            setText('advNextStepBtn', 'Prediksi Dampak →');
            document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('field', 3); };
          } else {
            tone([330,262]);
            showFeedback('warning', '<b>⚠️ Belum Tepat.</b> Periksa ulang: apakah semua faktor yang kamu pilih benar-benar mempercepat korosi tiang gawang di lapangan terbuka? Suhu tinggi di siang hari justru membantu mengeringkan air sehingga menghambat korosi.');
          }
        };
        document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('field', 3); };
      };

      window.advStep_field_predict = function(area) {
        setText('advActivityInstruction', 'Berdasarkan pemahamanmu tentang faktor korosi, prediksi pernyataan mana yang BENAR:');
        var opts = area.predictOptions;
        var html = opts.map(function(o, i) {
          return '<div class="adv-id-item" data-idx="' + i + '" style="text-align:left;padding:10px 14px;margin-bottom:7px;cursor:pointer;border-radius:12px;">' +
            '<span style="font-size:0.85rem;">' + esc(o.text) + '</span></div>';
        }).join('');
        setContent('advActivityContent', html);
        showBtn('advCheckBtn', false);
        showBtn('advNextStepBtn', false);

        document.querySelectorAll('.adv-id-item[data-idx]').forEach(function(el) {
          el.onclick = function() {
            var idx = +el.dataset.idx;
            var opt = opts[idx];
            document.querySelectorAll('.adv-id-item[data-idx]').forEach(function(e) { e.classList.remove('selected','matched','error'); });
            el.classList.add(opt.correct ? 'matched' : 'error');
            if (opt.correct) {
              advTotalScore += 10; updateScoreDisplay(); tone([523,659,784]);
              showFeedback('success', '<b>🔮 Prediksi Tepat!</b> Hujan asam yang lebih asam (pH rendah, [H⁺] tinggi) meningkatkan konduktivitas elektrolit dan mempercepat reaksi katodik: O₂ + 4H⁺ + 4e⁻ → 2H₂O, sehingga korosi pada tiang yang tidak terlindungi semakin masif.');
            } else {
              tone([330,262]);
              showFeedback('warning', '<b>⚠️ Kurang Tepat.</b> Perhatikan: cat biasa adalah pelindung pasif tanpa anoda korban, sehingga begitu retak, besi akan korosi lagi. Lapisan Zn memang habis secara bertahap (anoda korban) dan perlu dipantau kondisinya setelah beberapa dekade.');
            }
            showBtn('advNextStepBtn', true);
            setText('advNextStepBtn', 'Pilih Pencegahan →');
            document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('field', 4); };
          };
        });
      };

      window.advStep_field_decide = function(area) {
        advDecisionMade = false;
        renderHotspotOverlay('field', false, false);
        setText('advActivityInstruction', 'Pilih metode pencegahan TERBAIK untuk tiang gawang di lapangan terbuka yang sering terbentur bola dan kena hujan langsung!');
        var html = '<div class="adv-decision-visual-grid">' +
          area.decisions.map(function(d, i) {
            var tagsHtml = d.tags.map(function(t) {
              var cls = t.includes('Ketah') ? 'eff' : (t.includes('Biaya') ? 'cost' : 'env');
              return '<span class="adv-dec-tag ' + cls + '">' + esc(t) + '</span>';
            }).join(' ');
            return '<div class="adv-dec-card" data-idx="' + i + '">' +
              '<span class="adv-dec-visual">' + d.icon + '</span>' +
              '<span class="adv-dec-name">' + esc(d.name) + '</span>' +
              '<div style="margin-top:5px;">' + tagsHtml + '</div></div>';
          }).join('') + '</div>';
        setContent('advActivityContent', html);
        showBtn('advCheckBtn', false);
        showBtn('advNextStepBtn', false);

        document.querySelectorAll('.adv-dec-card').forEach(function(card) {
          card.onclick = function() {
            if (advDecisionMade) return;
            advDecisionMade = true;
            var idx = +card.dataset.idx;
            var dec = area.decisions[idx];
            document.querySelectorAll('.adv-dec-card').forEach(function(c) { c.classList.remove('selected'); });
            card.classList.add(dec.ok ? 'correct' : 'wrong');
            if (dec.ok) {
              advTotalScore += 25; updateScoreDisplay(); tone([523,659,784,1046]);
              showFeedback('success', '<b>✅ ' + esc(dec.name) + ':</b> ' + esc(dec.why));
            } else {
              tone([330,262]);
              showFeedback('warning', '<b>⚠️ ' + esc(dec.name) + ':</b> ' + esc(dec.why));
              setTimeout(function() {
                document.querySelectorAll('.adv-dec-card').forEach(function(c, ci) {
                  if (area.decisions[ci].ok) c.classList.add('correct');
                });
              }, 1200);
            }
            showBtn('advNextStepBtn', true);
            setText('advNextStepBtn', 'Lihat Hasil →');
            document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('field', 5); };
          };
        });
      };

      window.advStep_field_result = function(area) { advShowResult(area); };

      /* ============================================================
         AREA 3 – GATE STEPS
         ============================================================ */
      window.advStep_gate_observe = function(area) {
        renderHotspotOverlay('gate', false, false);
        setContent('advActivityContent', '');
        setText('advActivityInstruction', 'Putar dan amati gerbang geser sekolah dari berbagai sudut. Aktifkan Kaca Pembesar untuk memeriksa kondisi engsel, roda rel, sambungan las, dan panel besi secara mendetail. Mana bagian yang paling bermasalah?');
        showBtn('advNextStepBtn', true);
        setText('advNextStepBtn', 'Temukan Masalah →');
        document.getElementById('advNextStepBtn').onclick = function() {
          advTagged = {};
          runAdvStep('gate', 1);
        };
      };

      window.advStep_gate_find = function(area) {
        renderHotspotOverlay('gate', true, true);
        setText('advActivityInstruction', 'Klik bagian gerbang yang menurutmu mengalami korosi (🔴) dan yang masih baik (✅). Gunakan Kaca Pembesar untuk memeriksa lebih dekat!');
        setContent('advActivityContent', '<p style="font-size:0.8rem;color:#5a2e04;margin:0 0 8px;">Klik hotspot untuk memberi tanda: 🔴 Berkarat / ✅ Masih Baik</p>');
        showBtn('advCheckBtn', true);
        document.getElementById('advCheckBtn').onclick = function() {
          var correct = 0, total = area.hotspots.length;
          area.hotspots.forEach(function(hs) { if (advTagged[hs.id] === hs.type) correct++; });
          if (correct >= total - 1) {
            advTotalScore += 20; updateScoreDisplay(); tone([523,659,784]);
            showFeedback('success', '<b>🎯 Hebat!</b> ' + correct + '/' + total + ' bagian diidentifikasi dengan benar! Engsel, roda rel, dan sambungan las adalah tiga titik paling rentan korosi karena gesekan mekanis + paparan air tanah + tegangan sisa pengelasan.');
            showBtn('advCheckBtn', false);
            showBtn('advNextStepBtn', true);
            setText('advNextStepBtn', 'Analisis Penyebab →');
            document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('gate', 2); };
          } else {
            tone([330,262]);
            showFeedback('warning', '<b>⚠️ Masih Ada yang Keliru</b> (' + correct + '/' + total + '). Gunakan Kaca Pembesar lebih teliti! Periksa bagian yang sering bergerak dan yang langsung bersentuhan dengan tanah.');
          }
        };
        document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('gate', 2); };
      };

      window.advStep_gate_identify = function(area) {
        renderHotspotOverlay('gate', false, false);
        var facts = area.analysisFacts;
        var selected = {};
        setText('advActivityInstruction', 'Dari pernyataan-pernyataan di bawah, pilih yang BENAR-BENAR menyebabkan atau mempercepat korosi pada gerbang sekolah (bisa lebih dari satu):');

        function renderFacts() {
          var html = facts.map(function(f, i) {
            var isSelected = selected[i];
            var isNeutral = f.type === 'neutral';
            return '<div class="adv-id-item' + (isSelected ? (isNeutral ? ' error' : ' matched') : '') + '" data-idx="' + i + '" style="text-align:left;padding:9px 12px;cursor:pointer;margin-bottom:6px;">' +
              f.icon + ' ' + esc(f.text) + '</div>';
          }).join('');
          document.getElementById('advFactsList').innerHTML = html;
          document.querySelectorAll('.adv-id-item[data-idx]').forEach(function(el) {
            el.onclick = function() {
              var idx = +el.dataset.idx;
              selected[idx] = !selected[idx];
              renderFacts();
            };
          });
        }

        setContent('advActivityContent', '<div id="advFactsList"></div>');
        renderFacts();

        showBtn('advCheckBtn', true);
        document.getElementById('advCheckBtn').onclick = function() {
          var correctCount = 0, wrongCount = 0;
          facts.forEach(function(f, i) {
            if (f.type !== 'neutral' && selected[i]) correctCount++;
            if (f.type === 'neutral' && selected[i]) wrongCount++;
          });
          var maxCorrect = facts.filter(function(f) { return f.type !== 'neutral'; }).length;
          if (correctCount === maxCorrect && wrongCount === 0) {
            advTotalScore += 15; updateScoreDisplay(); tone([523,659,784]);
            showFeedback('success', '<b>🧪 Analisis Sempurna!</b> Gesekan mekanis menghilangkan lapisan oksida pelindung, kelembapan konstan di roda rel menyediakan elektrolit, dan dua logam berbeda (besi+tembaga misalnya) memicu korosi galvanik. Suhu tinggi di siang hari justru mengeringkan air → menghambat korosi.');
            showBtn('advCheckBtn', false);
            showBtn('advNextStepBtn', true);
            setText('advNextStepBtn', 'Pilih Tindakan →');
            document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('gate', 3); };
          } else {
            tone([330,262]);
            showFeedback('warning', '<b>⚠️ Periksa Ulang.</b> Apakah semua penyebab sudah dipilih? Apakah ada yang bukan penyebab namun dipilih? Suhu tinggi membantu mengeringkan permukaan, bukan mempercepat korosi secara langsung.');
          }
        };
        document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('gate', 3); };
      };

      window.advStep_gate_decide = function(area) {
        advDecisionMade = false;
        renderHotspotOverlay('gate', false, false);
        setText('advActivityInstruction', 'Pilih tindakan PALING TEPAT untuk mengatasi korosi pada engsel dan roda rel gerbang yang bergerak setiap hari!');
        var html = '<div class="adv-decision-visual-grid">' +
          area.decisions.map(function(d, i) {
            var tagsHtml = d.tags.map(function(t) {
              var cls = t.includes('Efek') ? 'eff' : (t.includes('Biaya') ? 'cost' : 'env');
              return '<span class="adv-dec-tag ' + cls + '">' + esc(t) + '</span>';
            }).join(' ');
            return '<div class="adv-dec-card" data-idx="' + i + '">' +
              '<span class="adv-dec-visual">' + d.icon + '</span>' +
              '<span class="adv-dec-name">' + esc(d.name) + '</span>' +
              '<div style="margin-top:5px;">' + tagsHtml + '</div></div>';
          }).join('') + '</div>';
        setContent('advActivityContent', html);
        showBtn('advCheckBtn', false);
        showBtn('advNextStepBtn', false);

        document.querySelectorAll('.adv-dec-card').forEach(function(card) {
          card.onclick = function() {
            if (advDecisionMade) return;
            advDecisionMade = true;
            var idx = +card.dataset.idx;
            var dec = area.decisions[idx];
            document.querySelectorAll('.adv-dec-card').forEach(function(c) { c.classList.remove('selected'); });
            card.classList.add(dec.ok ? 'correct' : 'wrong');
            if (dec.ok) {
              advTotalScore += 25; updateScoreDisplay(); tone([523,659,784,1046]);
              showFeedback('success', '<b>✅ ' + esc(dec.name) + ':</b> ' + esc(dec.why));
            } else {
              tone([330,262]);
              showFeedback('warning', '<b>⚠️ ' + esc(dec.name) + ':</b> ' + esc(dec.why));
              setTimeout(function() {
                document.querySelectorAll('.adv-dec-card').forEach(function(c, ci) {
                  if (area.decisions[ci].ok) c.classList.add('correct');
                });
              }, 1200);
            }
            showBtn('advNextStepBtn', true);
            setText('advNextStepBtn', 'Pertimbangkan 4 Dimensi →');
            document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('gate', 4); };
          };
        });
      };

      window.advStep_gate_consider = function(area) {
        var pillars = area.sustainability.pillars;
        advSustainAnswers = {};
        setText('advActivityInstruction', 'Untuk setiap dimensi keberlanjutan, pilih pernyataan yang paling tepat menggambarkan keunggulan pelumasan gemuk:');

        function renderPillars() {
          var html = pillars.map(function(p, pi) {
            var answered = advSustainAnswers[pi] !== undefined;
            var optHtml = p.options.map(function(opt, oi) {
              var isSelected = advSustainAnswers[pi] === oi;
              var cls = isSelected ? (oi === p.correct ? 'matched' : 'error') : '';
              return '<div class="adv-id-item ' + cls + '" data-pi="' + pi + '" data-oi="' + oi + '" style="text-align:left;padding:7px 10px;margin-bottom:4px;cursor:' + (answered ? 'default' : 'pointer') + ';font-size:0.8rem;">' + esc(opt) + '</div>';
            }).join('');
            return '<div style="margin-bottom:14px;">' +
              '<b style="font-size:0.85rem;">' + p.icon + ' ' + esc(p.name) + ':</b><br>' +
              '<div style="font-size:0.78rem;color:#5a2e04;margin:3px 0 5px;">' + esc(p.question) + '</div>' +
              optHtml + '</div>';
          }).join('');
          document.getElementById('advPillarContent').innerHTML = html;

          document.querySelectorAll('.adv-id-item[data-pi]').forEach(function(el) {
            if (el.classList.contains('matched') || el.classList.contains('error')) return;
            var pi = +el.dataset.pi;
            if (advSustainAnswers[pi] !== undefined) return;
            el.onclick = function() {
              var oi = +el.dataset.oi;
              advSustainAnswers[pi] = oi;
              if (oi === pillars[pi].correct) {
                advTotalScore += 5; updateScoreDisplay(); tone([554,659]);
              } else { tone([330,262]); }
              renderPillars();
              if (Object.keys(advSustainAnswers).length === pillars.length) {
                var allRight = pillars.every(function(p, pi2) { return advSustainAnswers[pi2] === p.correct; });
                if (allRight) {
                  showFeedback('success', '<b>♻️ Pemahaman Keberlanjutan Sempurna!</b> Pelumasan berkala adalah solusi 4 dimensi: sangat efektif untuk komponen bergerak, biaya murah, perlu diulang tiap 3-6 bulan, dan sangat ramah lingkungan dengan mencegah pembuangan komponen logam bekas. (SDG 12)');
                } else {
                  showFeedback('info', '<b>💡 Semua Dimensi Dijawab.</b> Beberapa jawaban kurang tepat. Pelumasan gemuk kalsium/litium memiliki keunggulan di SEMUA dimensi: efektif menolak air, sangat murah, cukup 3-6 bulan sekali, dan mencegah limbah logam.');
                }
                showBtn('advNextStepBtn', true);
                setText('advNextStepBtn', 'Lihat Hasil →');
                document.getElementById('advNextStepBtn').onclick = function() { runAdvStep('gate', 5); };
              }
            };
          });
        }

        setContent('advActivityContent', '<div id="advPillarContent"></div>');
        renderPillars();
        showBtn('advCheckBtn', false);
        showBtn('advNextStepBtn', false);
      };

      window.advStep_gate_result = function(area) { advShowResult(area); };

      /* ---- SHARED RESULT SCREEN ---- */
      function advShowResult(area) {
        renderHotspotOverlay(area.id, false, false);
        setText('advActivityInstruction', 'Lihat perubahan kondisi setelah tindakan penanganan yang tepat diterapkan!');

        var html = '<div class="adv-result-animation">' +
          '<span class="adv-result-icon">🏆</span>' +
          '<div class="adv-result-change">' +
          '<div class="adv-result-before"><div style="font-size:2rem;">' + (area.resultBefore.split(' ')[0]) + '</div><div>' + esc(area.resultBefore) + '</div></div>' +
          '<div class="adv-result-arrow">→</div>' +
          '<div class="adv-result-after"><div style="font-size:2rem;">' + (area.resultAfter.split(' ')[0]) + '</div><div>' + esc(area.resultAfter) + '</div></div>' +
          '</div>' +
          '<div class="adv-result-desc">' + esc(area.resultDesc) + '</div>' +
          '<div style="margin-top:12px;font-size:0.85rem;font-weight:800;color:#15803d;">⭐ Total Poin Area Ini: +' + advTotalScore + '</div>' +
          '</div>';
        setContent('advActivityContent', html);
        showFeedback('success', '<b>🌟 Area Selesai!</b> Penerapan tindakan berhasil! Skor kamu: <b>' + advTotalScore + ' poin</b>. Kembali ke peta untuk menjelajahi area berikutnya.');

        // Mark area as done
        var pr = getAdvProgress();
        pr[area.id] = true;
        saveAdvProgress(pr);

        // Update pin on map
        setTimeout(function() {
          var pinEl = document.getElementById('pin' + area.id.charAt(0).toUpperCase() + area.id.slice(1));
          var pinSt = document.getElementById('pin' + area.id.charAt(0).toUpperCase() + area.id.slice(1) + 'Status');
          if (pinEl) pinEl.className = 'adv-pin-btn done';
          if (pinSt) pinSt.textContent = '✓ Aman';
        }, 300);

        showBtn('advCheckBtn', false);
        showBtn('advNextStepBtn', false);
        showBtn('advFinishAreaBtn', true);
        document.getElementById('advFinishAreaBtn').onclick = function() {
          if (isAllAdvDone()) openAdvVictory();
          else openAdvMap();
        };
        document.getElementById('advFinishAreaBtn').textContent = isAllAdvDone() ? '🏆 Lihat Kemenangan!' : '🗺️ Kembali ke Peta';

        tone([523,659,784,1046,1319]);
      }

      /* ---- MASTER openAdvArea (replaces old version) ---- */
      function openAdvArea(areaKey) {
        curAdvArea = areaKey;
        curAdvStep = 0;
        advTotalScore = 0;
        advTagged = {};
        advSustainAnswers = {};
        advDecisionMade = false;
        adv3dRotX = 20; adv3dRotY = -15;

        var area = ADV_AREAS[areaKey];
        if (!area) return;

        var pr = getAdvProgress();
        var isDone = !!pr[areaKey];

        setText('advPlayTitle', area.title);
        updateScoreDisplay();

        // Setup canvas dimensions
        adv3dSetup();

        // Init controls
        init3dRotation(areaKey);
        initMagnifier(areaKey);

        // Initial draw
        adv3dDraw(areaKey);

        // If already done, show result directly
        if (isDone) {
          renderStepsBar(areaKey, area.steps.length);
          advShowResult(area);
        } else {
          runAdvStep(areaKey, 0);
        }

        show('advPlay');
      }

      function openAdvVictory() {`;

// Now find the old function boundaries to replace
// Replace everything from ADV_AREAS down to (but NOT including) openAdvVictory function body
const oldBlock = html.substring(ADV_AREAS_START, OPEN_ADV_VIC_START);
html = html.replace(oldBlock, NEW_ADV_ENGINE + '\n');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Done! Wrote', html.length, 'chars to index.html');
