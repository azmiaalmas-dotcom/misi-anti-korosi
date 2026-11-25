const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update HTML structure of #advMap
const oldMapSection = `    <!-- FINAL GAME: MAP -->
    <section class="screen adv-screen" id="advMap" aria-label="Peta Petualangan Sekolah" hidden>
      <div class="adv-head">
        <button class="circle" id="advMapBack" aria-label="Kembali ke halaman intro">
          <svg viewBox="0 0 24 24"><path d="M20 12H5M11 5l-7 7 7 7"/></svg>
        </button>
        <h2 class="adv-title-ribbon">🗺️ Peta Petualangan Sekolah</h2>
        <button class="circle sm" id="advMapMenu" aria-label="Menu Utama" title="Menu Utama">
          <svg viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>
        </button>
      </div>
      <div class="adv-card adv-map-card">
        <div class="adv-prog-bar-wrap">
          <div class="adv-prog-fill" id="advMapProgFill" style="width:0%"></div>
          <div class="adv-prog-label" id="advMapProgLabel">Progres: 0/3 Fasilitas Diselamatkan</div>
        </div>
        <div class="adv-map-hint">
          <span>💡</span> <b>Panduan Explorer:</b> Klik area di peta atau gunakan tombol panah untuk berkeliling. Dekati objek berkarat untuk mengamatinya dengan kaca pembesar!
        </div>
        <div class="adv-map-viewport" id="advMapViewport" tabindex="0" role="application" aria-label="Area Peta Sekolah Interaktif">
          <!-- Target Beacon for Touch / Click -->
          <div class="adv-target-beacon" id="advTargetBeacon" style="display:none"></div>
          <div id="advMapSvgHost" style="width:100%;height:100%"></div>

          <!-- Moving Explorer Character -->
          <div class="adv-map-player" id="advMapPlayer" style="left:48%;top:58%">
            <div class="adv-player-bubble" id="advPlayerBubble" hidden>
              <span id="advPlayerBubbleText">Ayo kita amati korosi!</span>
            </div>
            <div class="adv-player-sprite" id="advPlayerSprite"></div>
            <div class="adv-player-shadow"></div>
          </div>

          <!-- Pins for 3 Areas -->
          <button class="adv-pin-btn urgent" id="pinGarden" style="left:26%;top:64%" aria-label="Area 1: Taman Sekolah">
            <span class="adv-pin-icon">🌿</span>
            <span>Taman Sekolah</span>
            <span class="adv-pin-status" id="pinGardenStatus">Perlu Dicek</span>
          </button>
          <button class="adv-pin-btn urgent" id="pinField" style="left:52%;top:36%" aria-label="Area 2: Lapangan Sekolah">
            <span class="adv-pin-icon">⚽</span>
            <span>Lapangan Sekolah</span>
            <span class="adv-pin-status" id="pinFieldStatus">Perlu Dicek</span>
          </button>
          <button class="adv-pin-btn urgent" id="pinGate" style="left:76%;top:72%" aria-label="Area 3: Gerbang Sekolah">
            <span class="adv-pin-icon">🏫</span>
            <span>Gerbang Sekolah</span>
            <span class="adv-pin-status" id="pinGateStatus">Perlu Dicek</span>
          </button>

          <!-- Interactive Magnifying Glass Zoom Popup -->
          <div class="adv-lens-popup" id="advLensPopup" style="left:26%;top:64%" hidden>
            <div class="adv-lens-frame">
              <div class="adv-lens-glass" id="advLensGlass"></div>
              <div class="adv-lens-glare"></div>
              <div class="adv-lens-handle"></div>
            </div>
            <h4 class="adv-lens-title" id="advLensTitle">🔍 Kaca Pembesar Korosi</h4>
            <p class="adv-lens-desc" id="advLensDesc">Terdeteksi reaksi oksidasi redoks pada logam!</p>
            <button class="btn-yellow btn-small" id="advLensActionBtn" style="font-size:0.82rem;padding:6px 14px">
              Tindakan Penyelamatan 🛠️
            </button>
          </div>

          <!-- Quick Navigation Pills -->
          <div class="adv-tour-pills">
            <button class="adv-tour-btn" id="tourGardenBtn">🌿 Menuju Taman</button>
            <button class="adv-tour-btn" id="tourFieldBtn">⚽ Menuju Lapangan</button>
            <button class="adv-tour-btn" id="tourGateBtn">🏫 Menuju Gerbang</button>
          </div>

          <!-- Directional D-Pad Controls -->
          <div class="adv-map-controls">
            <button class="adv-dpad-btn" id="dpadUp" aria-label="Atas">▲</button>
            <div class="adv-dpad-row">
              <button class="adv-dpad-btn" id="dpadLeft" aria-label="Kiri">◀</button>
              <button class="adv-dpad-btn" id="dpadDown" aria-label="Bawah">▼</button>
              <button class="adv-dpad-btn" id="dpadRight" aria-label="Kanan">▶</button>
            </div>
          </div>
        </div>
      </div>
    </section>`;

const newMapSection = `    <!-- FINAL GAME: MAP -->
    <section class="screen adv-screen" id="advMap" aria-label="Peta Petualangan Sekolah" hidden>
      <div class="adv-head">
        <button class="circle" id="advMapBack" aria-label="Kembali ke halaman intro">
          <svg viewBox="0 0 24 24"><path d="M20 12H5M11 5l-7 7 7 7"/></svg>
        </button>
        <h2 class="adv-title-ribbon">🗺️ Peta Petualangan Sekolah</h2>
        <button class="circle sm" id="advMapMenu" aria-label="Menu Utama" title="Menu Utama">
          <svg viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>
        </button>
      </div>
      <div class="adv-card adv-map-card">
        <div class="adv-prog-bar-wrap">
          <div class="adv-prog-fill" id="advMapProgFill" style="width:0%"></div>
          <div class="adv-prog-label" id="advMapProgLabel">Progres: 0/3 Fasilitas Diselamatkan</div>
        </div>
        <div class="adv-map-hint">
          <span>💡</span> <b>Panduan:</b> Sentuh lokasi di peta atau gunakan tombol di bawah untuk menjelajah!
        </div>

        <!-- Clean Viewport: Map Artwork, Character & Pins Only (No Overlapping Bars) -->
        <div class="adv-map-viewport" id="advMapViewport" tabindex="0" role="application" aria-label="Area Peta Sekolah Interaktif">
          <!-- Target Beacon for Touch / Click -->
          <div class="adv-target-beacon" id="advTargetBeacon" style="display:none"></div>
          <div id="advMapSvgHost" style="width:100%;height:100%"></div>

          <!-- Moving Explorer Character -->
          <div class="adv-map-player" id="advMapPlayer" style="left:48%;top:58%">
            <div class="adv-player-bubble" id="advPlayerBubble" hidden>
              <span id="advPlayerBubbleText">Ayo kita amati korosi!</span>
            </div>
            <div class="adv-player-sprite" id="advPlayerSprite"></div>
            <div class="adv-player-shadow"></div>
          </div>

          <!-- Compact Pins for 3 Areas -->
          <button class="adv-pin-btn urgent" id="pinGarden" style="left:26%;top:64%" aria-label="Area 1: Taman Sekolah">
            <span class="adv-pin-icon">🌿</span>
            <span class="adv-pin-name">Taman</span>
            <span class="adv-pin-status" id="pinGardenStatus">⚠️ Karat!</span>
          </button>
          <button class="adv-pin-btn urgent" id="pinField" style="left:50%;top:34%" aria-label="Area 2: Lapangan Sekolah">
            <span class="adv-pin-icon">⚽</span>
            <span class="adv-pin-name">Lapangan</span>
            <span class="adv-pin-status" id="pinFieldStatus">⚠️ Karat!</span>
          </button>
          <button class="adv-pin-btn urgent" id="pinGate" style="left:76%;top:70%" aria-label="Area 3: Gerbang Sekolah">
            <span class="adv-pin-icon">🏫</span>
            <span class="adv-pin-name">Gerbang</span>
            <span class="adv-pin-status" id="pinGateStatus">⚠️ Karat!</span>
          </button>

          <!-- Interactive Magnifying Glass Zoom Popup -->
          <div class="adv-lens-popup" id="advLensPopup" style="left:26%;top:64%" hidden>
            <div class="adv-lens-frame">
              <div class="adv-lens-glass" id="advLensGlass"></div>
              <div class="adv-lens-glare"></div>
              <div class="adv-lens-handle"></div>
            </div>
            <h4 class="adv-lens-title" id="advLensTitle">🔍 Kaca Pembesar Korosi</h4>
            <p class="adv-lens-desc" id="advLensDesc">Terdeteksi reaksi oksidasi redoks pada logam!</p>
            <button class="btn-yellow btn-small" id="advLensActionBtn" style="font-size:0.82rem;padding:6px 14px">
              Tindakan Penyelamatan 🛠️
            </button>
          </div>
        </div>

        <!-- Clean Map Footer Bar (Organized Below Viewport: Zero Overlap) -->
        <div class="adv-map-footer-bar">
          <div class="adv-dest-nav">
            <span class="adv-dest-label">🚀 Kunjungi Cepat:</span>
            <div class="adv-dest-btns">
              <button class="adv-tour-btn" id="tourGardenBtn">🌿 Taman</button>
              <button class="adv-tour-btn" id="tourFieldBtn">⚽ Lapangan</button>
              <button class="adv-tour-btn" id="tourGateBtn">🏫 Gerbang</button>
            </div>
          </div>
          <div class="adv-map-controls" id="advDpadControls">
            <button class="adv-dpad-btn" id="dpadUp" aria-label="Atas">▲</button>
            <div class="adv-dpad-row">
              <button class="adv-dpad-btn" id="dpadLeft" aria-label="Kiri">◀</button>
              <button class="adv-dpad-btn" id="dpadDown" aria-label="Bawah">▼</button>
              <button class="adv-dpad-btn" id="dpadRight" aria-label="Kanan">▶</button>
            </div>
          </div>
        </div>
      </div>
    </section>`;

html = html.replace(oldMapSection, newMapSection);

// 2. Update JavaScript in updatePin
const oldUpdatePin = `function updatePin(elId, stId, isDone) {
          var b = $('#' + elId), s = $('#' + stId);
          if (isDone) {
            b.className = 'adv-pin-btn done';
            s.textContent = '✓ Aman & Terlindungi';
          } else {
            b.className = 'adv-pin-btn urgent';
            s.textContent = '⚠️ Butuh Penyelamatan!';
          }
        }`;

const newUpdatePin = `function updatePin(elId, stId, isDone) {
          var b = $('#' + elId), s = $('#' + stId);
          if (!b || !s) return;
          if (isDone) {
            b.className = 'adv-pin-btn done';
            s.textContent = '✓ Aman';
          } else {
            b.className = 'adv-pin-btn urgent';
            s.textContent = '⚠️ Karat!';
          }
        }`;

html = html.replace(oldUpdatePin, newUpdatePin);

// 3. Add CSS for footer bar and mobile responsive rules
const newFooterCSS = `
    /* Map Footer Bar (Cleanly separated below viewport) */
    .adv-map-footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 10px;
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #5a3a1a;
      border-radius: 14px;
      padding: 8px 12px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.12);
      box-sizing: border-box;
      width: 100%;
    }
    .adv-dest-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      flex: 1;
    }
    .adv-dest-label {
      font-size: 0.8rem;
      font-weight: 800;
      color: #5a2e04;
      white-space: nowrap;
    }
    .adv-dest-btns {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .adv-map-footer-bar .adv-map-controls {
      position: static !important;
      background: transparent !important;
      backdrop-filter: none !important;
      border: none !important;
      padding: 0 !important;
      box-shadow: none !important;
      flex-shrink: 0;
    }
    .adv-pin-name {
      font-weight: 800;
    }
`;

html = html.replace('  </style>', newFooterCSS + '\n  </style>');

// 4. Update the mobile @media (max-width: 768px) block to fix the mobile layout
const oldMobileMediaStart = '/* Enhanced Mobile Adaptations (Merapikan tampilan di HP) */\n    @media (max-width: 768px) {';
const replacementMobileCSS = `/* Enhanced Mobile Adaptations (Merapikan tampilan di HP) */
    @media (max-width: 768px) {
      .adv-screen {
        padding: 8px 6px !important;
        min-height: 100vh !important;
        justify-content: flex-start !important;
      }
      .adv-card {
        padding: 10px 8px !important;
        border-radius: 16px !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .adv-card.adv-map-card {
        padding: 8px !important;
        display: flex !important;
        flex-direction: column !important;
      }
      .adv-head {
        margin-bottom: 6px !important;
        gap: 6px !important;
      }
      .adv-title-ribbon {
        font-size: 0.95rem !important;
        padding: 4px 12px !important;
      }
      .adv-prog-bar-wrap {
        height: 18px !important;
        margin-bottom: 5px !important;
      }
      .adv-prog-label {
        font-size: 0.7rem !important;
        line-height: 18px !important;
      }
      .adv-map-hint {
        font-size: 0.69rem !important;
        padding: 3px 8px !important;
        margin-bottom: 6px !important;
        border-radius: 8px !important;
      }
      /* Map Viewport on mobile: generous height, zero clutter */
      .adv-map-viewport {
        height: clamp(250px, 46vh, 340px) !important;
        aspect-ratio: unset !important;
        max-height: none !important;
        border-radius: 12px !important;
      }
      /* Compact Pins: Never collide, never cut off */
      .adv-pin-btn {
        padding: 3px 6px !important;
        font-size: 0.72rem !important;
        border-radius: 10px !important;
        border-width: 2px !important;
        gap: 3px !important;
        box-shadow: 0 3px 0 #3d2711, 0 4px 8px rgba(0,0,0,.25) !important;
      }
      .adv-pin-icon {
        font-size: 0.92rem !important;
      }
      .adv-pin-name {
        font-size: 0.7rem !important;
      }
      .adv-pin-status {
        font-size: 0.6rem !important;
        padding: 1px 4px !important;
      }
      /* Moving Explorer on mobile */
      .adv-map-player {
        transform: translate(-50%, -85%) scale(0.8) !important;
      }
      /* Center Lens Popup in Mobile Viewport */
      .adv-lens-popup {
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 86% !important;
        max-width: 270px !important;
        padding: 10px !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.55), 0 0 0 999px rgba(0,0,0,0.38) !important;
        z-index: 100 !important;
      }
      .adv-lens-frame {
        width: 105px !important;
        height: 105px !important;
      }
      /* Clean Footer Bar below map */
      .adv-map-footer-bar {
        margin-top: 6px !important;
        padding: 5px 6px !important;
        gap: 6px !important;
      }
      .adv-dest-nav {
        gap: 3px !important;
      }
      .adv-dest-label {
        font-size: 0.68rem !important;
      }
      .adv-dest-btns {
        gap: 3px !important;
      }
      .adv-dest-btns .adv-tour-btn {
        padding: 2px 7px !important;
        font-size: 0.68rem !important;
        border-width: 1.5px !important;
      }
      .adv-dpad-btn {
        width: 26px !important;
        height: 26px !important;
        font-size: 0.74rem !important;
      }
      .adv-play-grid {
        grid-template-columns: 1fr !important;
        gap: 10px !important;
      }
      .adv-interactive-stage {
        aspect-ratio: 16/9 !important;
        max-height: 190px !important;
      }
      .adv-inspect-box {
        padding: 6px 8px !important;
        font-size: 0.78rem !important;
        margin-top: 6px !important;
      }
      .adv-four-pillars-bar {
        display: none !important;
      }
      .adv-opt-item {
        padding: 9px 10px !important;
        border-radius: 12px !important;
      }
      .adv-opt-grid-2x2 {
        grid-template-columns: 1fr !important;
        gap: 4px !important;
        margin-top: 6px !important;
        padding-top: 6px !important;
      }
      .m-card {
        padding: 4px 6px !important;
      }
      .m-val {
        font-size: 0.74rem !important;
      }
      .adv-vic-badges-grid {
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }
      .adv-vic-esd-card {
        font-size: 0.8rem !important;
        padding: 8px 10px !important;
      }
    }`;

const oldMediaPos = html.indexOf(oldMobileMediaStart);
if (oldMediaPos !== -1) {
  const oldMediaEnd = html.indexOf('  </style>', oldMediaPos);
  html = html.substring(0, oldMediaPos) + replacementMobileCSS + '\n' + html.substring(oldMediaEnd);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Mobile map layout, clean footer bar, and compact pins successfully updated in index.html!');
