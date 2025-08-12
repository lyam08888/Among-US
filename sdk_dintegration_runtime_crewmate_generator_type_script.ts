/*
 * Crewmate Runtime SDK (TypeScript)
 * ---------------------------------
 * Utilisez ce module pour intégrer le générateur directement DANS votre jeu,
 * sans exporter des PNG manuellement. Tout est dessiné sur un canvas (offscreen
 * ou non) et peut être uploadé en texture (WebGL) ou converti en ImageBitmap.
 *
 * Fonctionnalités :
 * - Rendu 2D vectoriel multi‑passes (soft/cel/metallic) issu de la V5.
 * - API simple : renderFrame, buildSpriteSheet, toImageBitmap.
 * - Types forts pour partager les presets joueur (JSON sérialisable).
 * - Aucune dépendance externe. Compatible navigateur & Node (via node-canvas).
 *
 * Exemples d’intégration (résumés, voir en bas du fichier) :
 * - Phaser 3 : textures.addCanvas + anims.create
 * - PixiJS : BaseTexture.from(canvas) + découpe en frames
 * - Godot 4 : HTTP (ou WebView) -> ImageTexture / SpriteFrames
 * - Unity : UnityWebRequest (service) OU WebView -> Texture2D + Sprite.Create
 */

// ---------------- Types partagés ----------------
export type Dir = 0 | 1 | 2 | 3; // bas, gauche, haut, droite
export type Anim = "idle" | "walk" | "inspect" | "point" | "wave" | "vent" | "ghost" | "dead";
export type LightStyle = "soft" | "cel3" | "cel5" | "metallic";
export type Accessory = "cap" | "flower" | "crown" | "toilet" | "antenna" | "halo" | "bandana" | "horns";

export interface Anatomy {
  tilt: number; belly: number; shoulder: number; heightMul: number; widthMul: number;
  footSquash: number; bagHeight: number; bagDepth: number;
}

export interface Decals {
  kind: "none" | "stripe" | "chevron" | "star" | "number" | "badge";
  color?: string; numberText?: string; badgeText?: string;
}

export interface CrewmateOptions {
  // couleurs & style
  body: string; outline: string; visor: string;
  lightStyle: LightStyle; keyAngle: number; keyIntensity: number; keyColor: string;
  rimColor: string; rimIntensity: number; outlineW: number;
  gloss: boolean; dithering: boolean; squash: boolean;
  // morpho & visière
  scale: number; // multiplié par 48px
  anatomy: Anatomy;
  visorW: number; visorH: number; visorTilt: number; visorOffsetX: number; visorOffsetY: number;
  // déco & accessoire
  decals: Decals; accessory: Accessory | null;
}

export interface FrameState { anim: Anim; frame: number; dir: Dir; }

export interface SheetConfig {
  frames: number; // frames par direction
  dirs: 1 | 4;
  ssaa?: 1 | 2 | 4; // super‑échantillonnage (x4 recommandé)
}

export interface SpriteSheet { canvas: HTMLCanvasElement; frameW: number; frameH: number; cols: number; rows: number; }

// ---------------- Utils Canvas ----------------
function makeCanvas(w: number, h: number) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function withAlpha(hex: string, a = 0.6) { const { r, g, b } = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
function hexToRgb(hex: string) { const m = hex.replace('#', ''); const n = parseInt(m, 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ---------------- Géométrie V5 (extrait) ----------------
function beanBodyPath(base: number, A: Anatomy) {
  const w = base * 1.15 * A.widthMul; const h = base * 1.30 * A.heightMul; const t = A.tilt;
  const p = new Path2D();
  const L = (x: number, y: number) => { const xr = x * Math.cos(t) - y * Math.sin(t); const yr = x * Math.sin(t) + y * Math.cos(t); return { x: xr, y: yr }; };
  const a = L(-0.22 * w, -0.50 * h);
  const b = L( 0.32 * w, -0.26 * h);
  const c = L( 0.30 * w,  0.16 * h + A.belly * 0.08 * h);
  const d = L(-0.18 * w,  0.40 * h);
  const e = L(-0.28 * w, -0.05 * h - A.shoulder * 0.10 * h);
  p.moveTo(a.x, a.y);
  p.bezierCurveTo( lerp(a.x,b.x,0.35), lerp(a.y,b.y,0.35), lerp(a.x,b.x,0.80), lerp(a.y,b.y,0.65), b.x, b.y );
  p.bezierCurveTo( lerp(b.x,c.x,0.30), lerp(b.y,c.y,0.15), lerp(b.x,c.x,0.85), lerp(b.y,c.y,0.85), c.x, c.y );
  p.bezierCurveTo( lerp(c.x,d.x,0.20), lerp(c.y,d.y,0.10), lerp(c.x,d.x,0.75), lerp(c.y,d.y,0.85), d.x, d.y );
  p.bezierCurveTo( lerp(d.x,e.x,0.20), lerp(d.y,e.y,0.25), lerp(d.x,e.x,0.85), lerp(d.y,e.y,0.80), e.x, e.y );
  p.bezierCurveTo( lerp(e.x,a.x,0.30), lerp(e.y,a.y,0.10), lerp(e.x,a.x,0.85), lerp(e.y,a.y,0.85), a.x, a.y );
  return p;
}
function backpackPath(base: number, A: Anatomy) {
  const w = base * 1.15 * A.widthMul; const h = base * 1.30 * A.heightMul; const d = A.bagDepth; const by = -0.10 * h + A.bagHeight * 0.20 * h;
  const p = new Path2D();
  p.moveTo(-0.28 * w, by);
  p.lineTo(-0.28 * w - 0.22 * w * d, by + 0.02 * h);
  p.bezierCurveTo(-0.30 * w - 0.26 * w * d, by + 0.16 * h, -0.26 * w - 0.24 * w * d, by + 0.32 * h, -0.44 * w, by + 0.34 * h);
  p.bezierCurveTo(-0.36 * w, by + 0.36 * h, -0.30 * w, by + 0.14 * h, -0.30 * w, by);
  p.closePath(); return p; }
function visorPath(base: number, o: CrewmateOptions) { const vx = o.visorOffsetX * base, vy = o.visorOffsetY * base; const p = new Path2D(); p.ellipse(vx + 0.08 * base, vy - 0.10 * base, o.visorW * base, o.visorH * base, o.visorTilt, 0, Math.PI * 2); return p; }

// ---------------- Rendu d’une frame ----------------
export function renderFrameToCanvas(canvas: HTMLCanvasElement, opts: CrewmateOptions, state: FrameState) {
  const base = 48 * opts.scale; const ctx = canvas.getContext('2d')!; const frameW = Math.ceil(base * 1.7), frameH = Math.ceil(base * 1.6);
  canvas.width = frameW; canvas.height = frameH; ctx.imageSmoothingEnabled = true; ctx.clearRect(0,0,frameW,frameH);
  const o = { ...opts };
  drawCrewmate(ctx, frameW/2, frameH/2, o, state);
  return { frameW, frameH };
}

// ---------------- Spritesheet (multi‑frames) ----------------
export function buildSpriteSheet(opts: CrewmateOptions, cfg: SheetConfig): SpriteSheet {
  const ss = cfg.ssaa ?? 1; const base = 48 * opts.scale * ss; const frameW = Math.ceil(base * 1.7); const frameH = Math.ceil(base * 1.6);
  const rows = cfg.dirs === 4 ? 4 : 1; const cols = cfg.frames; const big = makeCanvas(frameW * cols, frameH * rows); const b = big.getContext('2d')!; b.imageSmoothingEnabled = true;
  for (let r = 0; r < rows; r++) {
    for (let f = 0; f < cols; f++) {
      const c = makeCanvas(frameW, frameH); const x = c.getContext('2d')!; const bob = (opts.squash || opts.dithering) ? f / cols : 0;
      drawCrewmate(x, frameW/2, frameH/2, opts, { anim: 'walk', frame: f, dir: (rows === 1 ? 3 : (r as Dir)) });
      b.drawImage(c, frameW * f, frameH * r);
    }
  }
  // downsample si SSAA>1
  const outW = Math.round(frameW / ss), outH = Math.round(frameH / ss); const out = makeCanvas(outW * cols, outH * rows); const octx = out.getContext('2d')!; octx.imageSmoothingEnabled = true; octx.drawImage(big, 0,0, frameW*cols, frameH*rows, 0,0, outW*cols, outH*rows);
  return { canvas: out, frameW: outW, frameH: outH, cols, rows };
}

export async function toImageBitmap(sheet: SpriteSheet): Promise<ImageBitmap> {
  // Utile pour PixiJS / WebGL : upload rapide en texture
  return await createImageBitmap(sheet.canvas);
}

// ---------------- Dessin interne (proche V5) ----------------
function drawCrewmate(ctx: CanvasRenderingContext2D, x: number, y: number, o: CrewmateOptions, state: FrameState) {
  const base = 48 * o.scale; ctx.save(); ctx.translate(x, y);
  if (state.dir === 1) ctx.scale(-1, 1); // flip gauche
  const bob = state.anim === 'walk' ? (state.frame / 12) : 0; const bobY = Math.sin(bob * Math.PI * 2) * base * 0.06; ctx.translate(0, bobY);

  // Sol
  ctx.fillStyle = withAlpha('#000', 0.28); ctx.beginPath(); ctx.ellipse(0, base*0.78, base*0.34, base*0.14, 0, 0, Math.PI*2); ctx.fill();

  const body = beanBodyPath(base, o.anatomy); const pack = backpackPath(base, o.anatomy); const visor = visorPath(base, o);
  const keyRad = (o.keyAngle % 360) * Math.PI / 180; const lx = Math.cos(keyRad), ly = Math.sin(keyRad);

  // BASE
  ctx.save(); if (o.lightStyle === 'soft') {
    const g = ctx.createLinearGradient(-base, -base, base, base); g.addColorStop(0, shade(o.body, +0.10)); g.addColorStop(0.5, o.body); g.addColorStop(1, shade(o.body, -0.10)); ctx.fillStyle = g; ctx.fill(body);
  } else {
    ctx.fillStyle = shade(o.body, +0.05); ctx.fill(body); ctx.save(); ctx.clip(body); const tones = o.lightStyle === 'cel3' ? [0.18, 0.00, -0.20] : [0.22, 0.10, -0.04, -0.16, -0.28]; tones.forEach((t, i) => { ctx.fillStyle = withAlpha(shade(o.body, t), 0.95); ctx.beginPath(); ctx.ellipse(lx * base * 0.10, -ly * base * 0.12, base * (0.46 - 0.06 * i), base * (0.30 - 0.05 * i), (i % 2 ? 0.10 : -0.12), 0, Math.PI * 2); ctx.fill(); }); ctx.restore(); }
  const pb = ctx.createLinearGradient(-base * 2, 0, 0, 0); pb.addColorStop(0, shade(o.body, -0.08)); pb.addColorStop(1, shade(o.body, +0.04)); ctx.fillStyle = pb; ctx.fill(pack); ctx.restore();

  // SHADOW wrap + under visor
  ctx.save(); ctx.clip(body); const s = ctx.createRadialGradient(lx*base*0.10, -ly*base*0.12, base*0.06, lx*base*0.10, -ly*base*0.12, base*0.70); s.addColorStop(0, withAlpha('#000', 0)); s.addColorStop(1, withAlpha('#000', 0.25)); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = s; ctx.fillRect(-base*4, -base*4, base*8, base*8); const u = ctx.createLinearGradient(0, -base*0.02, 0, base*0.30); u.addColorStop(0, withAlpha('#000', 0.22)); u.addColorStop(1, withAlpha('#000', 0)); ctx.fillStyle = u; ctx.fillRect(-base*2, -base*0.02, base*4, base*0.50); ctx.restore();

  // RIM
  ctx.save(); ctx.strokeStyle = withAlpha(o.rimColor, o.rimIntensity); ctx.lineWidth = Math.max(1, base * 0.026 * o.outlineW); ctx.stroke(body); ctx.restore();

  // Visière
  drawVisor(ctx, base, visor, o);

  // OUTLINE
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = o.outline; ctx.lineWidth = Math.max(1, base * 0.040 * o.outlineW); ctx.stroke(body); ctx.stroke(pack); ctx.strokeStyle = withAlpha('#000', 0.22); ctx.lineWidth = Math.max(1, base * 0.018 * o.outlineW); ctx.stroke(body); ctx.restore();

  // Pieds
  const step = state.anim === 'walk' ? Math.sin(bob * Math.PI * 2) * base * 0.075 : 0; drawFoot(ctx, base * 0.06 + step, base * 0.78, o, base); drawFoot(ctx, -base * 0.16 - step, base * 0.78, o, base);

  // Décals
  if (o.decals?.kind && o.decals.kind !== 'none') { ctx.save(); ctx.clip(body); ctx.fillStyle = withAlpha(o.decals.color || '#ffffff', 0.92); switch (o.decals.kind) { case 'stripe': ctx.rotate(-0.20); ctx.fillRect(-base*0.70, -base*0.02, base*1.10, base*0.06); break; case 'chevron': ctx.rotate(-0.16); ctx.beginPath(); ctx.moveTo(-base*0.34, -base*0.06); ctx.lineTo(0, base*0.06); ctx.lineTo(base*0.34, -base*0.06); ctx.closePath(); ctx.fill(); break; case 'star': drawStar(ctx, base*0.10, -base*0.12, base*0.10); break; case 'number': ctx.fillStyle = withAlpha('#fff', 0.95); ctx.font = `bold ${Math.floor(base*0.24)}px Inter,Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.decals.numberText || '07', base * 0.02, 0); break; case 'badge': const txt = o.decals.badgeText || 'CREW'; ctx.font = `600 ${Math.floor(base*0.12)}px Inter,Arial`; const w = ctx.measureText(txt).width; const padX = base*0.10, padY = base*0.06; ctx.fillStyle = withAlpha('#111827', 0.65); ctx.strokeStyle = withAlpha('#fff', 0.25); ctx.lineWidth = 1; ctx.fillRect(-w/2 - padX/2, -base*0.26, w + padX, padY); ctx.strokeRect(-w/2 - padX/2, -base*0.26, w + padX, padY); ctx.fillStyle = withAlpha('#fff', 0.9); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, -base*0.26 + padY/2); break; } ctx.restore(); }

  // Accessoire
  if (o.accessory) drawAccessory(ctx, 0, -base * 0.78 * o.anatomy.heightMul, base, o);

  ctx.restore();

  function shade(hex: string, dl: number) { const { r, g, b } = hexToRgb(hex); const t = dl > 0 ? 255 : 0; const a = Math.min(1, Math.abs(dl)); const rr = Math.round(lerp(r, t, a)), gg = Math.round(lerp(g, t, a)), bb = Math.round(lerp(b, t, a)); return `#${[rr, gg, bb].map(v => v.toString(16).padStart(2, '0')).join('')}`; }
}

function drawVisor(ctx: CanvasRenderingContext2D, base: number, visor: Path2D, o: CrewmateOptions) {
  const vG = ctx.createLinearGradient(-base*0.30, -base*0.30, base*0.30, base*0.30); vG.addColorStop(0, tint(o.visor, +0.06)); vG.addColorStop(1, tint(o.visor, -0.08)); ctx.fillStyle = vG; ctx.fill(visor);
  ctx.save(); ctx.clip(visor); const vig = ctx.createRadialGradient(base*0.16, -base*0.18, base*0.02, base*0.12, -base*0.06, base*0.30); vig.addColorStop(0, withAlpha('#fff', 0.45)); vig.addColorStop(1, withAlpha('#000', 0)); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = vig; ctx.fillRect(-base, -base, base*2, base*2); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = withAlpha('#fff', 0.12); ctx.rotate(o.visorTilt - 0.04); ctx.fillRect(-base*0.04, -base*0.06, base*0.30, base*0.014); ctx.rotate(0.16); ctx.fillRect(-base*0.02, base*0.00, base*0.24, base*0.012); ctx.restore(); ctx.strokeStyle = withAlpha('#ffffff', 0.35); ctx.lineWidth = base * 0.012; ctx.stroke(visor);
  function tint(hex: string, dl: number) { const { r, g, b } = hexToRgb(hex); const t = dl > 0 ? 255 : 0; const a = Math.min(1, Math.abs(dl)); const rr = Math.round(lerp(r, t, a)), gg = Math.round(lerp(g, t, a)), bb = Math.round(lerp(b, t, a)); return `#${[rr, gg, bb].map(v => v.toString(16).padStart(2, '0')).join('')}`; }
}

function drawAccessory(ctx: CanvasRenderingContext2D, x: number, y: number, base: number, o: CrewmateOptions) { ctx.save(); ctx.translate(x, y); ctx.strokeStyle = o.outline; ctx.lineWidth = Math.max(1, base*0.035*o.outlineW); const path = (fn: () => void) => { ctx.beginPath(); fn(); ctx.fill(); ctx.stroke(); };
  switch (o.accessory) { case 'cap': ctx.fillStyle = withAlpha(o.body, 0.95); path(() => { ctx.moveTo(-base*0.18,0); ctx.quadraticCurveTo(0,-base*0.12, base*0.22,0); ctx.lineTo(base*0.27, base*0.02); ctx.quadraticCurveTo(0, base*0.06, -base*0.22, base*0.02); ctx.closePath(); }); break; case 'flower': ctx.fillStyle = '#ff66b3'; for (let i = 0; i < 6; i++) { ctx.rotate((Math.PI * 2) / 6); path(() => { ctx.ellipse(0, 0, base*0.06, base*0.02, 0, 0, Math.PI*2); }); } ctx.fillStyle = '#ffd166'; path(() => { ctx.arc(0, 0, base*0.03, 0, Math.PI*2); }); break; case 'crown': ctx.fillStyle = '#ffd166'; path(() => { ctx.moveTo(-base*0.16,0); ctx.lineTo(-base*0.06,-base*0.12); ctx.lineTo(0,0); ctx.lineTo(base*0.06,-base*0.12); ctx.lineTo(base*0.16,0); ctx.closePath(); }); break; case 'toilet': ctx.fillStyle = '#e6edf0'; path(() => { ctx.ellipse(0,0, base*0.16, base*0.06, 0, 0, Math.PI*2); ctx.rect(-base*0.04,-base*0.02, base*0.08, base*0.06); }); break; case 'antenna': path(() => { ctx.moveTo(0,0); ctx.quadraticCurveTo(0,-base*0.12, -base*0.12, -base*0.16); }); ctx.fillStyle = '#ff6b6b'; path(() => { ctx.arc(-base*0.12,-base*0.16, base*0.03, 0, Math.PI*2); }); break; case 'halo': ctx.fillStyle = withAlpha('#ffd166', 0.92); path(() => { ctx.ellipse(0,-base*0.02, base*0.22, base*0.07, 0, 0, Math.PI*2); }); break; case 'bandana': ctx.fillStyle = '#ef4444'; path(() => { ctx.moveTo(-base*0.15,0); ctx.lineTo(base*0.15,0); ctx.lineTo(0, base*0.06); ctx.closePath(); }); break; case 'horns': ctx.fillStyle = '#b45309'; path(() => { ctx.moveTo(-base*0.10,0); ctx.quadraticCurveTo(-base*0.15,-base*0.10, -base*0.06,-base*0.12); ctx.quadraticCurveTo(-base*0.08,-base*0.02, -base*0.02, 0); ctx.moveTo(base*0.10,0); ctx.quadraticCurveTo(base*0.15,-base*0.10, base*0.06,-base*0.12); ctx.quadraticCurveTo(base*0.08,-base*0.02, base*0.02, 0); }); break; }
  ctx.restore(); }

function drawFoot(ctx: CanvasRenderingContext2D, x: number, y: number, o: CrewmateOptions, base: number) { ctx.save(); ctx.translate(x, y); const sole = new Path2D(); const a = o.anatomy.footSquash; sole.ellipse(0,0, base*(0.12 + a*0.03), base*(0.085 - a*0.02), 0, 0, Math.PI*2); ctx.fillStyle = shade(o.body, -0.02); ctx.fill(sole); ctx.strokeStyle = o.outline; ctx.lineWidth = Math.max(1, base*0.03*o.outlineW); ctx.stroke(sole); ctx.beginPath(); ctx.ellipse(base*0.06, -base*0.01, base*0.04, base*0.02, 0, 0, Math.PI*2); ctx.fillStyle = shade(o.body, +0.04); ctx.fill(); ctx.restore(); function shade(hex: string, dl: number) { const { r, g, b } = hexToRgb(hex); const t = dl > 0 ? 255 : 0; const aa = Math.min(1, Math.abs(dl)); const rr = Math.round(lerp(r, t, aa)), gg = Math.round(lerp(g, t, aa)), bb = Math.round(lerp(b, t, aa)); return `#${[rr, gg, bb].map(v => v.toString(16).padStart(2, '0')).join('')}`; } }

// ---------------- Helpers presets ----------------
export const Presets = {
  Classic(): CrewmateOptions { return basePreset({}); },
  Slim(): CrewmateOptions { return basePreset({ anatomy: { heightMul: 1.06, widthMul: 0.92, belly: 0.06, shoulder: 0.06 }, visorW: 0.22, visorH: 0.16, visorTilt: -0.12 }); },
  Chunky(): CrewmateOptions { return basePreset({ anatomy: { heightMul: 0.98, widthMul: 1.10, belly: 0.24, shoulder: 0.14 }, visorW: 0.26, visorH: 0.18, visorTilt: -0.18 }); },
  Heroic(): CrewmateOptions { return basePreset({ anatomy: { heightMul: 1.04, widthMul: 1.04, shoulder: 0.18, tilt: -0.07 }, visorW: 0.25, visorH: 0.17, visorTilt: -0.16 }); }
};

function basePreset(over: Partial<CrewmateOptions & { anatomy: Partial<Anatomy> }>): CrewmateOptions {
  const anatomy: Anatomy = { tilt: -0.04, belly: 0.15, shoulder: 0.10, heightMul: 1.00, widthMul: 1.00, footSquash: 0.10, bagHeight: 0.10, bagDepth: 1.10, ...(over.anatomy || {}) };
  return {
    body: '#c51111', outline: '#0f172a', visor: '#8fd3ff', lightStyle: 'soft', keyAngle: 315, keyIntensity: 0.85, keyColor: '#ffffff', rimColor: '#c7d2fe', rimIntensity: 0.65, outlineW: 1.0,
    gloss: true, dithering: true, squash: true, scale: 2.8, anatomy,
    visorW: over['visorW'] as any ?? 0.24, visorH: over['visorH'] as any ?? 0.17, visorTilt: over['visorTilt'] as any ?? -0.15, visorOffsetX: 0.00, visorOffsetY: 0.00,
    decals: { kind: 'none' }, accessory: 'halo'
  };
}

/* ------------------- Exemples d’intégration -------------------

PHASER 3 (web) – dynamic texture
---------------------------------
import { buildSpriteSheet, Presets } from './crewmate-runtime';

const opts = Presets.Classic();
const sheet = buildSpriteSheet(opts, { frames: 12, dirs: 4, ssaa: 2 });
this.textures.addCanvas('crewmate_hd', sheet.canvas); // clé texture

// Créez les animations à partir de la grille
this.anims.create({ key: 'walk_right', frames: this.anims.generateFrameNumbers('crewmate_hd', { start: 0, end: 11 }), frameRate: 12, repeat: -1 });
// Pour les autres directions, utilisez start/end = row*cols ...

// Sprite
this.add.sprite(200, 200, 'crewmate_hd').play('walk_right');


PIXIJS (web)
-------------
import { buildSpriteSheet, Presets } from './crewmate-runtime';
const { canvas, frameW, frameH, cols, rows } = buildSpriteSheet(Presets.Slim(), { frames: 12, dirs: 4, ssaa: 2 });
const base = PIXI.BaseTexture.from(canvas);
const textures: PIXI.Texture[] = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    textures.push(new PIXI.Texture({ baseTexture: base, frame: new PIXI.Rectangle(c * frameW, r * frameH, frameW, frameH) }));
  }
}
const sprite = new PIXI.AnimatedSprite(textures.slice(0, cols)); // 1ère direction
sprite.animationSpeed = 12/60; sprite.play(); app.stage.addChild(sprite);


GODOT 4 (desktop/mobile) – via service HTTP
-------------------------------------------
// Idée : exposez une petite route /generate qui renvoie { png, meta };
// Godot charge l’image et crée les frames.
var http := HTTPRequest.new(); add_child(http);
http.request("https://mon-service/generate?preset=Classic&frames=12&dirs=4&ssaa=2");
func _on_http_request_completed(result, response_code, headers, body):
  var img := Image.new(); img.load_png_from_buffer(body);
  var tex := ImageTexture.create_from_image(img);
  var sf := SpriteFrames.new();
  # boucle pour découper frameW/frameH selon meta renvoyée


UNITY (desktop/mobile) – via service HTTP
-----------------------------------------
using UnityEngine; using UnityEngine.Networking;
IEnumerator LoadCrewmate() {
  var req = UnityWebRequestTexture.GetTexture("https://mon-service/generate?p=Classic&f=12&d=4");
  yield return req.SendWebRequest();
  var tex = DownloadHandlerTexture.GetContent(req);
  // Découpez en Sprites avec Sprite.Create(rect)
}

NOTE : Pour une intégration 100% offline dans Unity/Godot, on peut porter ce rendu
2D en C# / GDScript (ou utiliser une WebView locale et récupérer un PNG en mémoire),
mais la voie la plus simple et portable reste le micro‑service HTTP ou le rendu
in‑engine sur Canvas (Phaser/Pixi/JS).

*/
