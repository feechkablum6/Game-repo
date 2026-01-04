(() => {
  // =====================
  // Utils
  // =====================
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist2 = (ax, ay, bx, by) => {
    const dx = ax - bx, dy = ay - by;
    return dx * dx + dy * dy;
  };
  const fmt = (n) => Math.floor(n).toString();
  const now = () => performance.now();

  // =====================
  // Canvas + DPI
  // =====================
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    game.onResize();
  }
  window.addEventListener("resize", resize);

  // =====================
  // SVG Assets (generated here)
  // =====================
  function svgToImg(svg) {
    const img = new Image();
    const encoded = encodeURIComponent(svg)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    img.src = `data:image/svg+xml;charset=utf-8,${encoded}`;
    return img;
  }

  const SVG = {
    tilePath: (accent="#1a2a3f") => `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <rect x="2" y="2" width="60" height="60" rx="12" fill="${accent}" stroke="#2a3b55" stroke-width="3"/>
        <path d="M14 34h36" stroke="#86a6c9" stroke-opacity="0.25" stroke-width="6" stroke-linecap="round"/>
        <path d="M20 22h24" stroke="#86a6c9" stroke-opacity="0.18" stroke-width="5" stroke-linecap="round"/>
        <circle cx="18" cy="46" r="3.5" fill="#86a6c9" fill-opacity="0.22"/>
        <circle cx="44" cy="44" r="4" fill="#86a6c9" fill-opacity="0.18"/>
      </svg>
    `,

    tileGrass: () => `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <rect x="2" y="2" width="60" height="60" rx="12" fill="#0f1b14" stroke="#21412d" stroke-width="3"/>
        <path d="M14 44c6-10 12-10 18 0" stroke="#4bd27e" stroke-opacity="0.25" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M28 46c4-8 10-8 14 0" stroke="#4bd27e" stroke-opacity="0.18" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="45" cy="22" r="4" fill="#4bd27e" fill-opacity="0.10"/>
      </svg>
    `,

    towerArcher: (variant=0) => `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${variant===0 ? "#63e6ff" : (variant===1 ? "#b6ff63" : "#ffda63")}"/>
            <stop offset="1" stop-color="#0b0f14"/>
          </linearGradient>
        </defs>
        <rect x="6" y="8" width="52" height="50" rx="14" fill="#101a26" stroke="#2a3b55" stroke-width="3"/>
        <path d="M18 46c10-18 18-18 28 0" stroke="url(#g)" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M24 26l16 0" stroke="#e9eef6" stroke-opacity="0.55" stroke-width="4" stroke-linecap="round"/>
        <path d="M42 22l8 8" stroke="#e9eef6" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round"/>
        <circle cx="20" cy="22" r="3.5" fill="#e9eef6" fill-opacity="0.35"/>
      </svg>
    `,

    towerMage: (variant=0) => `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <defs>
          <radialGradient id="r" cx="50%" cy="40%" r="60%">
            <stop offset="0" stop-color="${variant===0 ? "#a77bff" : (variant===1 ? "#63d3ff" : "#ff6b9f")}"/>
            <stop offset="1" stop-color="#0b0f14"/>
          </radialGradient>
        </defs>
        <rect x="6" y="8" width="52" height="50" rx="14" fill="#101a26" stroke="#2a3b55" stroke-width="3"/>
        <circle cx="32" cy="34" r="15" fill="url(#r)" stroke="#e9eef6" stroke-opacity="0.25" stroke-width="2"/>
        <path d="M20 46h24" stroke="#e9eef6" stroke-opacity="0.45" stroke-width="4" stroke-linecap="round"/>
        <path d="M32 18l0 8" stroke="#e9eef6" stroke-opacity="0.35" stroke-width="3" stroke-linecap="round"/>
        <circle cx="32" cy="16" r="3.2" fill="#e9eef6" fill-opacity="0.22"/>
      </svg>
    `,

    towerCannon: (variant=0) => `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
        <defs>
          <linearGradient id="c" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="${variant===0 ? "#ffb86b" : (variant===1 ? "#ff6b6b" : "#63ffd1")}"/>
            <stop offset="1" stop-color="#0b0f14"/>
          </linearGradient>
        </defs>
        <rect x="6" y="8" width="52" height="50" rx="14" fill="#101a26" stroke="#2a3b55" stroke-width="3"/>
        <rect x="18" y="28" width="28" height="10" rx="5" fill="url(#c)" stroke="#e9eef6" stroke-opacity="0.22" stroke-width="2"/>
        <rect x="34" y="24" width="18" height="6" rx="3" fill="#e9eef6" fill-opacity="0.30"/>
        <circle cx="24" cy="46" r="6" fill="#e9eef6" fill-opacity="0.18"/>
        <circle cx="40" cy="46" r="6" fill="#e9eef6" fill-opacity="0.18"/>
      </svg>
    `,

    enemy: (type=0) => {
      // 0 grunt,1 runner,2 brute,3 shield,4 boss
      const color = ["#7dd3fc","#7cff9b","#ffd27d","#b0b7ff","#ff7d9a"][type] || "#7dd3fc";
      const eye = ["#0b0f14","#0b0f14","#0b0f14","#0b0f14","#0b0f14"][type];
      const stroke = ["#2a3b55","#24553a","#5a4a24","#3a3f6a","#6a2f3a"][type];
      const horn = type===2 || type===4;
      const shield = type===3 || type===4;
      return `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
          <rect x="10" y="12" width="44" height="44" rx="18" fill="${color}" fill-opacity="0.18" stroke="${stroke}" stroke-width="3"/>
          <circle cx="28" cy="34" r="5" fill="${eye}" fill-opacity="0.65"/>
          <circle cx="40" cy="34" r="5" fill="${eye}" fill-opacity="0.65"/>
          <path d="M26 44c4 5 8 5 12 0" stroke="${color}" stroke-opacity="0.55" stroke-width="4" fill="none" stroke-linecap="round"/>
          ${horn ? `<path d="M18 20l8-8" stroke="${color}" stroke-opacity="0.65" stroke-width="4" stroke-linecap="round"/>
                   <path d="M46 20l-8-8" stroke="${color}" stroke-opacity="0.65" stroke-width="4" stroke-linecap="round"/>` : ``}
          ${shield ? `<path d="M32 18c10 6 14 12 10 24-3 10-10 14-10 14s-7-4-10-14c-4-12 0-18 10-24z"
                      fill="${color}" fill-opacity="0.08" stroke="${color}" stroke-opacity="0.35" stroke-width="3"/>` : ``}
        </svg>
      `;
    }
  };

  const images = {
    grass: svgToImg(SVG.tileGrass()),
    path: svgToImg(SVG.tilePath()),
    // towers: base + evolved variants
    archer0: svgToImg(SVG.towerArcher(0)),
    archer1: svgToImg(SVG.towerArcher(1)), // evo A
    archer2: svgToImg(SVG.towerArcher(2)), // evo B
    mage0: svgToImg(SVG.towerMage(0)),
    mage1: svgToImg(SVG.towerMage(1)),
    mage2: svgToImg(SVG.towerMage(2)),
    cannon0: svgToImg(SVG.towerCannon(0)),
    cannon1: svgToImg(SVG.towerCannon(1)),
    cannon2: svgToImg(SVG.towerCannon(2)),
    e0: svgToImg(SVG.enemy(0)),
    e1: svgToImg(SVG.enemy(1)),
    e2: svgToImg(SVG.enemy(2)),
    e3: svgToImg(SVG.enemy(3)),
    e4: svgToImg(SVG.enemy(4)),
  };

  // =====================
  // Game Config
  // =====================
  const CFG = {
    gridW: 14,
    gridH: 10,
    // UI safe areas (top HUD & bottom panel)
    topPad: 120,
    bottomPad: 220,

    startGold: 240,
    startLives: 20,

    // build costs
    costs: { archer: 70, mage: 95, cannon: 120 },

    // upgrade costs multiplier
    upgradeBase: 55,
    upgradeMul: 1.35,

    // sell return
    sellReturn: 0.65,

    // evolve at lvl >= 3
    evolveLevel: 3,

    // difficulty scaling
    waveHpMul: 1.14,
    waveSpeedMul: 1.04,
    waveArmorMul: 1.06,

    // spawn pacing
    baseSpawnGap: 0.7, // seconds

    // visuals
    gridLine: "rgba(255,255,255,0.05)",
    rangeColor: "rgba(91,214,255,0.12)"
  };

  // =====================
  // Map + Path
  // =====================
  // Path is list of grid cells enemies traverse in order
  const PATH = [
    [0,4],[1,4],[2,4],[3,4],
    [3,3],[3,2],[4,2],[5,2],[6,2],[7,2],
    [7,3],[7,4],[7,5],[8,5],[9,5],[10,5],
    [10,4],[10,3],[11,3],[12,3],[13,3]
  ];

  function isPathCell(x,y){
    for (const [px,py] of PATH) if(px===x && py===y) return true;
    return false;
  }

  // =====================
  // Entities
  // =====================
  const DamageType = {
    PHYS: "phys",
    MAGIC: "magic",
    BLAST: "blast"
  };

  function makeTower(kind, gx, gy) {
    // base stats
    const base = {
      archer: { dmg: 16, cd: 0.55, range: 2.9, type: DamageType.PHYS, projSpd: 9, pierce: 0, splash: 0, slow: 0, burn: 0 },
      mage:   { dmg: 12, cd: 0.75, range: 2.7, type: DamageType.MAGIC, projSpd: 8, pierce: 0, splash: 0, slow: 0.0, burn: 0.0 },
      cannon: { dmg: 22, cd: 1.15, range: 2.6, type: DamageType.BLAST, projSpd: 7, pierce: 0, splash: 0.75, slow: 0, burn: 0 }
    }[kind];

    return {
      id: Math.random().toString(16).slice(2),
      kind,
      evo: 0,      // 0 none, 1 A, 2 B
      lvl: 1,
      gx, gy,
      cdLeft: 0,
      spent: CFG.costs[kind],
      ...structuredClone(base),
      // per tower special counters
      crit: 0.06,  // grows with lvl
      critMul: 1.8,
    };
  }

  function applyUpgrade(t) {
    t.lvl += 1;
    // generic scaling
    t.dmg *= 1.18;
    t.range += 0.10;
    t.cd *= 0.95;
    t.crit = clamp(t.crit + 0.02, 0, 0.35);
    t.spent += upgradeCost(t);
  }

  function upgradeCost(t) {
    return Math.floor(CFG.upgradeBase * Math.pow(CFG.upgradeMul, t.lvl - 1));
  }

  function evolveA(t) {
    t.evo = 1;
    if (t.kind === "archer") {
      // Rapid: высокая скорострельность + яд (DoT как "кровотечение")
      t.cd *= 0.72;
      t.dmg *= 0.92;
      t.pierce += 1;
      t.burn = 2.8; // DoT/sec
      t.range += 0.15;
    } else if (t.kind === "mage") {
      // Frost: контроль
      t.slow = 0.34; // slow factor
      t.cd *= 0.92;
      t.range += 0.25;
      t.dmg *= 1.05;
    } else if (t.kind === "cannon") {
      // Mortar: больше сплеша
      t.splash *= 1.45;
      t.cd *= 1.08;
      t.dmg *= 1.08;
      t.range += 0.20;
    }
  }

  function evolveB(t) {
    t.evo = 2;
    if (t.kind === "archer") {
      // Sniper: большой урон, больше дальность, медленнее
      t.dmg *= 1.65;
      t.cd *= 1.25;
      t.range += 0.70;
      t.critMul = 2.4;
      t.crit = clamp(t.crit + 0.06, 0, 0.5);
    } else if (t.kind === "mage") {
      // Blaze: огонь + взрыв магии
      t.burn = 6.0;
      t.dmg *= 1.22;
      t.cd *= 1.06;
      t.splash = 0.55; // маленький AoE
      t.range += 0.10;
    } else if (t.kind === "cannon") {
      // Rail: пробитие (линейно) — имитация через высокий pierce
      t.pierce += 3;
      t.dmg *= 1.35;
      t.cd *= 1.12;
      t.splash = 0; // без сплеша
      t.range += 0.35;
    }
  }

  function enemyTemplate(type, wave) {
    // base per type
    const base = [
      { name:"Гад",    hp: 52,  spd: 1.10, gold: 10, armor: 0.06, img: images.e0 },
      { name:"Бегун",  hp: 38,  spd: 1.55, gold: 9,  armor: 0.04, img: images.e1 },
      { name:"Бугай",  hp: 110, spd: 0.85, gold: 15, armor: 0.10, img: images.e2 },
      { name:"Щит",    hp: 85,  spd: 1.00, gold: 14, armor: 0.22, img: images.e3 },
      { name:"БОСС",   hp: 520, spd: 0.80, gold: 60, armor: 0.28, img: images.e4 },
    ][type];

    const hpMul = Math.pow(CFG.waveHpMul, wave - 1);
    const spdMul = Math.pow(CFG.waveSpeedMul, wave - 1);
    const arMul  = Math.pow(CFG.waveArmorMul, wave - 1);

    return {
      type,
      name: base.name,
      maxHp: base.hp * hpMul * (type === 4 ? 1.15 : 1.0),
      hp: base.hp * hpMul * (type === 4 ? 1.15 : 1.0),
      spd: base.spd * spdMul,
      armor: clamp(base.armor * arMul, 0, 0.75),
      gold: Math.floor(base.gold * (1 + (wave - 1) * 0.03)),
      img: base.img,
      // path tracking
      pathI: 0,
      t: 0, // progress between PATH[pathI] and PATH[pathI+1]
      // status
      slowLeft: 0,
      slowFactor: 0,
      burnLeft: 0,
      burnDps: 0,
    };
  }

  function makeProjectile(x, y, tx, ty, spd, dmg, type, opts) {
    const dx = tx - x, dy = ty - y;
    const d = Math.max(0.001, Math.hypot(dx, dy));
    return {
      x, y,
      vx: (dx / d) * spd,
      vy: (dy / d) * spd,
      dmg,
      type,
      life: 2.2,
      pierce: opts.pierce || 0,
      splash: opts.splash || 0,
      slow: opts.slow || 0,
      burn: opts.burn || 0,
      hitIds: new Set()
    };
  }

  // =====================
  // UI
  // =====================
  const elGold  = document.getElementById("statGold");
  const elLives = document.getElementById("statLives");
  const elWave  = document.getElementById("statWave");
  const btnNext = document.getElementById("btnNext");
  const btnPause = document.getElementById("btnPause");
  const btnSpeed = document.getElementById("btnSpeed");
  const autoWave = document.getElementById("autoWave");

  const buildButtons = document.querySelectorAll("[data-build]");
  const buildCancel = document.getElementById("buildCancel");

  const costArcher = document.getElementById("costArcher");
  const costMage = document.getElementById("costMage");
  const costCannon = document.getElementById("costCannon");

  const panel = document.getElementById("panel");
  const panelTitle = document.getElementById("panelTitle");
  const panelStats = document.getElementById("panelStats");
  const btnUpgrade = document.getElementById("btnUpgrade");
  const btnEvolveA = document.getElementById("btnEvolveA");
  const btnEvolveB = document.getElementById("btnEvolveB");
  const btnSell = document.getElementById("btnSell");
  const toast = document.getElementById("toast");

  function showToast(text, ms=900){
    toast.textContent = text;
    toast.classList.remove("hidden");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=>toast.classList.add("hidden"), ms);
  }

  // =====================
  // Game
  // =====================
  const game = {
    // board geometry
    cell: 44,
    offX: 0,
    offY: 0,

    // state
    gold: CFG.startGold,
    lives: CFG.startLives,
    wave: 1,
    running: true,
    speed: 1,

    buildMode: null, // "archer"|"mage"|"cannon"|null
    selectedTowerId: null,

    towers: [],
    enemies: [],
    projs: [],

    waveActive: false,
    spawnQ: [],
    spawnTimer: 0,

    onResize() {
      // fit grid into available vertical space with padding
      const w = window.innerWidth;
      const h = window.innerHeight;

      const usableH = Math.max(320, h - 20);
      const maxCellW = Math.floor(w / CFG.gridW);
      const maxCellH = Math.floor((usableH) / CFG.gridH);

      // prefer smaller to fit
      this.cell = clamp(Math.min(maxCellW, maxCellH), 28, 58);

      const gridPxW = this.cell * CFG.gridW;
      const gridPxH = this.cell * CFG.gridH;

      // center-ish, but keep visible with HUD
      this.offX = Math.floor((w - gridPxW) / 2);
      // push grid a bit up to leave room for panel
      const topSafe = 64;
      const bottomSafe = 210;
      const freeH = h - topSafe - bottomSafe;
      const y0 = topSafe + Math.floor((freeH - gridPxH) / 2);
      this.offY = clamp(y0, topSafe, Math.max(topSafe, h - bottomSafe - gridPxH));

      this.render(true);
    },

    reset() {
      this.gold = CFG.startGold;
      this.lives = CFG.startLives;
      this.wave = 1;
      this.running = true;
      this.speed = 1;
      this.buildMode = null;
      this.selectedTowerId = null;
      this.towers = [];
      this.enemies = [];
      this.projs = [];
      this.waveActive = false;
      this.spawnQ = [];
      this.spawnTimer = 0;
      hidePanel();
      this.updateHud();
      this.render(true);
      showToast("Новая игра");
    },

    updateHud() {
      elGold.textContent = `💰 ${fmt(this.gold)}`;
      elLives.textContent = `❤️ ${fmt(this.lives)}`;
      elWave.textContent = `🌊 ${fmt(this.wave)}`;
      btnSpeed.textContent = this.speed === 1 ? "x1" : "x2";

      costArcher.textContent = `Цена: ${CFG.costs.archer}`;
      costMage.textContent = `Цена: ${CFG.costs.mage}`;
      costCannon.textContent = `Цена: ${CFG.costs.cannon}`;

      btnNext.textContent = this.waveActive ? "ВОЛНА ИДЁТ…" : "СТАРТ ВОЛНЫ";
      btnNext.disabled = this.waveActive;
    },

    gridFromScreen(px, py) {
      const gx = Math.floor((px - this.offX) / this.cell);
      const gy = Math.floor((py - this.offY) / this.cell);
      if (gx < 0 || gy < 0 || gx >= CFG.gridW || gy >= CFG.gridH) return null;
      return { gx, gy };
    },

    towerAt(gx, gy) {
      return this.towers.find(t => t.gx === gx && t.gy === gy) || null;
    },

    startWave() {
      if (this.waveActive) return;

      // wave composition (becomes meaner)
      const w = this.wave;
      const count = Math.floor(8 + w * 2.2);
      const q = [];

      for (let i = 0; i < count; i++) {
        // weighted types
        let type = 0;
        const r = Math.random();
        if (w >= 2 && r < 0.25) type = 1;              // runner
        if (w >= 3 && r < 0.18) type = 2;              // brute
        if (w >= 4 && r < 0.22) type = 3;              // shield
        q.push(enemyTemplate(type, w));
      }

      // boss every 5 waves
      if (w % 5 === 0) {
        q.push(enemyTemplate(4, w));
      }

      this.spawnQ = q;
      this.spawnTimer = 0.2;
      this.waveActive = true;
      this.updateHud();
      showToast(`Волна ${w}`);
    },

    endWaveIfDone() {
      if (this.waveActive) {
        if (this.spawnQ.length === 0 && this.enemies.length === 0) {
          this.waveActive = false;
          this.wave += 1;
          this.updateHud();
          showToast(`Волна пройдена. Следующая: ${this.wave}`);
          if (autoWave.checked) {
            // небольшой автостарт (без async обещаний)
            setTimeout(() => { if (!this.waveActive && this.lives > 0) this.startWave(); }, 600);
          }
        }
      }
    },

    // =====================
    // Simulation
    // =====================
    update(dt) {
      if (!this.running) return;

      dt *= this.speed;

      // spawn
      if (this.waveActive && this.spawnQ.length > 0) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          const e = this.spawnQ.shift();
          this.enemies.push(e);

          // gap gets tighter with wave
          const gap = clamp(CFG.baseSpawnGap * Math.pow(0.985, this.wave - 1), 0.28, 0.8);
          this.spawnTimer = gap;
        }
      }

      // enemies move
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];

        // statuses tick
        if (e.slowLeft > 0) e.slowLeft -= dt;
        if (e.burnLeft > 0) {
          e.burnLeft -= dt;
          e.hp -= e.burnDps * dt;
        }

        const slow = (e.slowLeft > 0) ? (1 - clamp(e.slowFactor, 0, 0.75)) : 1;
        const spd = e.spd * slow;

        // advance along path
        const p0 = PATH[e.pathI];
        const p1 = PATH[e.pathI + 1];

        if (!p1) {
          // reached end
          this.enemies.splice(i, 1);
          this.lives -= 1;
          if (this.lives <= 0) {
            this.lives = 0;
            this.updateHud();
            showToast("Поражение");
            this.running = false;
          } else {
            this.updateHud();
            showToast("-1 жизнь");
          }
          continue;
        }

        e.t += (spd * dt) / 1.0; // 1 cell per second at spd=1
        while (e.t >= 1 && e.pathI < PATH.length - 2) {
          e.t -= 1;
          e.pathI += 1;
        }

        if (e.hp <= 0) {
          this.enemies.splice(i, 1);
          this.gold += e.gold;
          this.updateHud();
        }
      }

      // towers attack
      for (const t of this.towers) {
        t.cdLeft -= dt;
        if (t.cdLeft > 0) continue;

        // choose target: first in range with highest pathI (closest to exit)
        const tx = this.offX + (t.gx + 0.5) * this.cell;
        const ty = this.offY + (t.gy + 0.5) * this.cell;
        const r2 = (t.range * this.cell) ** 2;

        let best = null;
        let bestScore = -1;
        for (const e of this.enemies) {
          const [ex, ey] = this.enemyPosPx(e);
          if (dist2(tx, ty, ex, ey) <= r2) {
            const score = e.pathI + e.t;
            if (score > bestScore) {
              bestScore = score;
              best = e;
            }
          }
        }
        if (!best) continue;

        // fire
        const [ex, ey] = this.enemyPosPx(best);

        // crit
        let dmg = t.dmg;
        if (Math.random() < t.crit) dmg *= t.critMul;

        this.projs.push(makeProjectile(
          tx, ty, ex, ey,
          t.projSpd * this.cell * 0.18,
          dmg,
          t.type,
          { pierce: t.pierce, splash: t.splash, slow: t.slow, burn: t.burn }
        ));

        t.cdLeft = t.cd;
      }

      // projectiles
      for (let i = this.projs.length - 1; i >= 0; i--) {
        const p = this.projs[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.life <= 0) {
          this.projs.splice(i, 1);
          continue;
        }

        // hit test
        const hitR = 10;
        let hitAny = false;

        for (const e of this.enemies) {
          const eid = e._id || (e._id = Math.random().toString(16).slice(2));
          if (p.hitIds.has(eid)) continue;

          const [ex, ey] = this.enemyPosPx(e);
          if (dist2(p.x, p.y, ex, ey) <= hitR * hitR) {
            hitAny = true;
            p.hitIds.add(eid);

            // apply damage
            this.applyDamage(e, p.dmg, p.type);

            // status
            if (p.slow > 0) {
              e.slowLeft = Math.max(e.slowLeft, 0.9);
              e.slowFactor = Math.max(e.slowFactor, p.slow);
            }
            if (p.burn > 0) {
              e.burnLeft = Math.max(e.burnLeft, 1.4);
              e.burnDps = Math.max(e.burnDps, p.burn);
            }

            // splash
            if (p.splash > 0) {
              const rad = p.splash * this.cell * 0.55;
              const rad2 = rad * rad;
              for (const e2 of this.enemies) {
                const [x2,y2] = this.enemyPosPx(e2);
                if (dist2(ex, ey, x2, y2) <= rad2) {
                  this.applyDamage(e2, p.dmg * 0.55, p.type);
                }
              }
            }

            // pierce logic
            if (p.pierce > 0) {
              p.pierce -= 1;
            } else {
              // remove projectile
              this.projs.splice(i, 1);
            }
            break;
          }
        }

        // if no hit, continue
        if (!hitAny) continue;
      }

      this.endWaveIfDone();
    },

    applyDamage(e, dmg, type) {
      // armor reduces phys/blast; magic partially ignores
      let m = 1.0;
      if (type === DamageType.PHYS || type === DamageType.BLAST) {
        m = 1 - e.armor;
      } else if (type === DamageType.MAGIC) {
        m = 1 - (e.armor * 0.45);
      }
      e.hp -= Math.max(1, dmg * m);
    },

    enemyPosPx(e) {
      const [x0,y0] = PATH[e.pathI];
      const [x1,y1] = PATH[e.pathI+1] || PATH[e.pathI];
      const gx = lerp(x0, x1, clamp(e.t, 0, 1));
      const gy = lerp(y0, y1, clamp(e.t, 0, 1));
      const px = this.offX + (gx + 0.5) * this.cell;
      const py = this.offY + (gy + 0.5) * this.cell;
      return [px, py];
    },

    // =====================
    // Rendering
    // =====================
    render(force=false) {
      // background
      ctx.fillStyle = "#0b0f14";
      ctx.fillRect(0,0,window.innerWidth,window.innerHeight);

      // draw grid tiles
      for (let y=0; y<CFG.gridH; y++){
        for (let x=0; x<CFG.gridW; x++){
          const px = this.offX + x*this.cell;
          const py = this.offY + y*this.cell;
          const img = isPathCell(x,y) ? images.path : images.grass;
          ctx.drawImage(img, px+1, py+1, this.cell-2, this.cell-2);

          // subtle grid line
          ctx.strokeStyle = CFG.gridLine;
          ctx.strokeRect(px, py, this.cell, this.cell);
        }
      }

      // highlight build mode / selected cell
      if (this.buildMode) {
        // hint: draw path cells darker overlay
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        for (const [x,y] of PATH) {
          ctx.fillRect(this.offX + x*this.cell, this.offY + y*this.cell, this.cell, this.cell);
        }
      }

      // range circle for selected tower
      const st = this.selectedTowerId ? this.towers.find(t=>t.id===this.selectedTowerId) : null;
      if (st) {
        const cx = this.offX + (st.gx + 0.5) * this.cell;
        const cy = this.offY + (st.gy + 0.5) * this.cell;
        ctx.beginPath();
        ctx.arc(cx, cy, st.range * this.cell, 0, Math.PI*2);
        ctx.fillStyle = CFG.rangeColor;
        ctx.fill();
      }

      // towers
      for (const t of this.towers) {
        const px = this.offX + t.gx*this.cell;
        const py = this.offY + t.gy*this.cell;
        const img = this.towerImg(t);
        ctx.drawImage(img, px+3, py+3, this.cell-6, this.cell-6);

        // lvl badge
        ctx.fillStyle = "rgba(0,0,0,0.50)";
        ctx.beginPath();
        ctx.roundRect(px+6, py+6, 28, 18, 8);
        ctx.fill();
        ctx.fillStyle = "#e9eef6";
        ctx.font = "800 12px system-ui";
        ctx.fillText("Lv"+t.lvl, px+12, py+19);
      }

      // enemies
      for (const e of this.enemies) {
        const [ex, ey] = this.enemyPosPx(e);
        const s = this.cell*0.78;
        ctx.drawImage(e.img, ex - s/2, ey - s/2, s, s);

        // hp bar
        const w = this.cell*0.72;
        const h = 6;
        const x = ex - w/2;
        const y = ey - s/2 - 10;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 3); ctx.fill();
        const hp = clamp(e.hp / e.maxHp, 0, 1);
        ctx.fillStyle = "rgba(91,214,255,0.85)";
        ctx.beginPath(); ctx.roundRect(x, y, w*hp, h, 3); ctx.fill();

        // status pips
        if (e.slowLeft > 0) {
          ctx.fillStyle = "rgba(99,211,255,0.8)";
          ctx.beginPath(); ctx.arc(x + w + 8, y + 3, 3, 0, Math.PI*2); ctx.fill();
        }
        if (e.burnLeft > 0) {
          ctx.fillStyle = "rgba(255,107,159,0.8)";
          ctx.beginPath(); ctx.arc(x + w + 18, y + 3, 3, 0, Math.PI*2); ctx.fill();
        }
      }

      // projectiles
      for (const p of this.projs) {
        ctx.fillStyle = p.type === DamageType.MAGIC ? "rgba(167,123,255,0.85)"
                    : p.type === DamageType.BLAST ? "rgba(255,184,107,0.85)"
                    : "rgba(99,230,255,0.85)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.2, 0, Math.PI*2);
        ctx.fill();
      }

      // message overlay when lost
      if (!this.running && this.lives <= 0) {
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
        ctx.fillStyle = "#e9eef6";
        ctx.textAlign = "center";
        ctx.font = "900 28px system-ui";
        ctx.fillText("Поражение", window.innerWidth/2, window.innerHeight/2 - 10);
        ctx.font = "800 14px system-ui";
        ctx.fillStyle = "rgba(233,238,246,0.8)";
        ctx.fillText("Обнови страницу, чтобы начать заново", window.innerWidth/2, window.innerHeight/2 + 18);
        ctx.textAlign = "left";
      }
    },

    towerImg(t) {
      if (t.kind === "archer") return t.evo===1 ? images.archer1 : (t.evo===2 ? images.archer2 : images.archer0);
      if (t.kind === "mage")   return t.evo===1 ? images.mage1   : (t.evo===2 ? images.mage2   : images.mage0);
      return t.evo===1 ? images.cannon1 : (t.evo===2 ? images.cannon2 : images.cannon0);
    }
  };

  // =====================
  // Panel logic
  // =====================
  function hidePanel(){
    panel.classList.add("hidden");
    game.selectedTowerId = null;
  }

  function showPanel(t){
    panel.classList.remove("hidden");
    game.selectedTowerId = t.id;

    const kindName = t.kind === "archer" ? "Лучник"
                  : t.kind === "mage" ? "Маг"
                  : "Пушка";

    const evoName =
      (t.evo===0) ? " (без эволюции)"
    : (t.evo===1) ? " (эволюция A)"
    : " (эволюция B)";

    panelTitle.textContent = `${kindName}${evoName}`;

    const upCost = upgradeCost(t);
    const sell = Math.floor(t.spent * CFG.sellReturn);

    const typeName = t.type === DamageType.PHYS ? "Физ"
                  : t.type === DamageType.MAGIC ? "Маг"
                  : "Взрыв";

    panelStats.innerHTML =
      `Уровень: <b>${t.lvl}</b><br>` +
      `Урон: <b>${fmt(t.dmg)}</b> | Тип: <b>${typeName}</b><br>` +
      `Скоростр.: <b>${(1/t.cd).toFixed(2)}</b>/с | Дальность: <b>${t.range.toFixed(2)}</b><br>` +
      `Крит: <b>${Math.round(t.crit*100)}%</b> ×${t.critMul.toFixed(1)}<br>` +
      (t.splash>0 ? `Сплэш: <b>${t.splash.toFixed(2)}</b><br>` : ``) +
      (t.pierce>0 ? `Пробитие: <b>${t.pierce}</b><br>` : ``) +
      (t.slow>0 ? `Замедление: <b>${Math.round(t.slow*100)}%</b><br>` : ``) +
      (t.burn>0 ? `DoT: <b>${t.burn.toFixed(1)}</b>/с<br>` : ``) +
      `<br>Улучшить: <b>${upCost}</b> | Продать: <b>${sell}</b>`;

    // buttons
    btnUpgrade.textContent = `⬆️ Улучшить (${upCost})`;
    btnUpgrade.disabled = game.gold < upCost || t.evo !== 0 && t.lvl >= 9 ? false : false;

    const canEvolve = (t.evo === 0 && t.lvl >= CFG.evolveLevel);
    btnEvolveA.classList.toggle("hidden", !canEvolve);
    btnEvolveB.classList.toggle("hidden", !canEvolve);

    if (canEvolve) {
      btnEvolveA.textContent = evolveLabel(t, "A");
      btnEvolveB.textContent = evolveLabel(t, "B");
    }

    btnSell.textContent = `🪙 Продать (+${sell})`;
  }

  function evolveLabel(t, which) {
    const k = t.kind;
    if (k==="archer") return which==="A" ? "🧬 A: Rapid + DoT + пробитие" : "🧬 B: Sniper + урон + дальность";
    if (k==="mage")   return which==="A" ? "🧬 A: Frost (замедление)" : "🧬 B: Blaze (огонь + AoE)";
    return which==="A" ? "🧬 A: Mortar (сплэш+)" : "🧬 B: Rail (пробитие+)";
  }

  // =====================
  // Input (touch/mouse)
  // =====================
  function pointerPos(ev){
    const rect = canvas.getBoundingClientRect();
    const x = (ev.clientX - rect.left);
    const y = (ev.clientY - rect.top);
    return {x,y};
  }

  canvas.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    const {x,y} = pointerPos(ev);
    const g = game.gridFromScreen(x,y);
    if (!g) { hidePanel(); return; }

    const t = game.towerAt(g.gx, g.gy);

    if (t) {
      showPanel(t);
      return;
    }

    // empty cell
    hidePanel();

    if (!game.buildMode) return;

    // cannot build on path
    if (isPathCell(g.gx, g.gy)) { showToast("Нельзя на дороге"); return; }

    const cost = CFG.costs[game.buildMode];
    if (game.gold < cost) { showToast("Не хватает золота"); return; }

    // place
    const nt = makeTower(game.buildMode, g.gx, g.gy);
    game.towers.push(nt);
    game.gold -= cost;
    game.updateHud();
    showToast("Построено");
  }, { passive:false });

  // build selection
  buildButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      game.buildMode = btn.dataset.build;
      showToast(`Режим: ${game.buildMode}`);
      hidePanel();
    });
  });
  buildCancel.addEventListener("click", () => {
    game.buildMode = null;
    showToast("Строительство: выкл");
  });

  // wave + pause + speed
  btnNext.addEventListener("click", () => game.startWave());
  btnPause.addEventListener("click", () => {
    game.running = !game.running;
    btnPause.textContent = game.running ? "⏸" : "▶️";
    showToast(game.running ? "Продолжить" : "Пауза");
  });
  btnSpeed.addEventListener("click", () => {
    game.speed = (game.speed === 1) ? 2 : 1;
    game.updateHud();
    showToast(game.speed === 2 ? "Скорость x2" : "Скорость x1");
  });

  // panel actions
  btnUpgrade.addEventListener("click", () => {
    const t = game.towers.find(tt => tt.id === game.selectedTowerId);
    if (!t) return;
    const c = upgradeCost(t);
    if (game.gold < c) { showToast("Не хватает золота"); return; }
    game.gold -= c;
    applyUpgrade(t);
    game.updateHud();
    showPanel(t);
    showToast("Улучшено");
  });

  btnEvolveA.addEventListener("click", () => {
    const t = game.towers.find(tt => tt.id === game.selectedTowerId);
    if (!t || t.evo !== 0 || t.lvl < CFG.evolveLevel) return;
    evolveA(t);
    showPanel(t);
    showToast("Эволюция A");
  });

  btnEvolveB.addEventListener("click", () => {
    const t = game.towers.find(tt => tt.id === game.selectedTowerId);
    if (!t || t.evo !== 0 || t.lvl < CFG.evolveLevel) return;
    evolveB(t);
    showPanel(t);
    showToast("Эволюция B");
  });

  btnSell.addEventListener("click", () => {
    const idx = game.towers.findIndex(tt => tt.id === game.selectedTowerId);
    if (idx < 0) return;
    const t = game.towers[idx];
    const sell = Math.floor(t.spent * CFG.sellReturn);
    game.gold += sell;
    game.towers.splice(idx, 1);
    game.updateHud();
    hidePanel();
    showToast(`Продано +${sell}`);
  });

  // =====================
  // Main loop
  // =====================
  let last = now();
  function tick() {
    const t = now();
    const dt = clamp((t - last) / 1000, 0, 0.05);
    last = t;

    game.update(dt);
    game.render();

    requestAnimationFrame(tick);
  }

  // kickstart
  function init() {
    // roundRect polyfill for older Safari
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r){
        r = Math.min(r, w/2, h/2);
        this.beginPath();
        this.moveTo(x+r, y);
        this.arcTo(x+w, y, x+w, y+h, r);
        this.arcTo(x+w, y+h, x, y+h, r);
        this.arcTo(x, y+h, x, y, r);
        this.arcTo(x, y, x+w, y, r);
        this.closePath();
        return this;
      };
    }

    game.updateHud();
    resize();

    // стартовый сетап: немного золота, но уже весело
    // (можешь убрать, если хочешь "чистый" старт)
    // game.towers.push(makeTower("archer", 2, 6));
    // game.towers.push(makeTower("mage", 5, 6));
    // game.towers.push(makeTower("cannon", 9, 2));

    tick();
  }

  init();

})();