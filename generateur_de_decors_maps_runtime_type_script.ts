/*
 * Procedural Environment Generator – Among‑style (TypeScript)
 * -----------------------------------------------------------
 * Génère TOUT l’environnement en runtime pour un jeu web (Phaser 3 / PixiJS) :
 *  - Layout de salles + corridors connectés (MST) sur une grille
 *  - Carving des sols, génération des murs/portes automatiquement
 *  - Placement de props (tables, consoles, caisses), tasks, vents, spawn points
 *  - Grille de collision & grille de navigation (pathfind)
 *  - Export direct en Tilemap (Phaser) ou données brutes (PixiJS)
 *
 * Aucun asset requis : indices de tuiles (0=void,1=floor,2=wall,3=door,4=vent)
 * Vous pouvez mapper ces indices à un tileset perso.
 */

// ---------------- Types ----------------
export type Vec2 = { x:number; y:number };
export type Rect = { x:number; y:number; w:number; h:number };

export interface Theme {
  name:string;
  floorTile:number; wallTile:number; doorTile:number; ventTile:number; decoTiles?: number[];
}

export interface PropDef { id:string; w:number; h:number; kind:'table'|'console'|'crate'|'chair'|'plant'|'light'; tile:number; blocking:boolean; nearWall?:boolean }

export interface LevelConfig {
  seed:string;
  width:number;   // en tuiles
  height:number;  // en tuiles
  tileSize:number;// px
  roomCount:number;
  roomMin:Vec2;   // min w/h
  roomMax:Vec2;   // max w/h
  corridorWidth:number; // tuiles
  doorChance:number;    // 0..1 portes supplémentaires
  theme:Theme;
  props: { density:number; defs:PropDef[] };
  tasks: { count:number };
  vents: { pairs:number };
  ensureLoop:boolean; // ajoute une boucle pour éviter un seul chemin
}

export interface Entity { id:string; pos:Vec2; rot?:number; meta?:Record<string,any> }

export interface LevelData {
  config:LevelConfig;
  floor:number[][];   // 2D array d'indices (voir Theme)
  walls:number[][];
  doors:number[][];
  vents:number[][];
  collision:boolean[][]; // true=solide
  nav:boolean[][];       // true=walkable
  rooms:Rect[];
  corridors:Rect[];
  spawns:Vec2[];
  entities:{ props:Entity[]; tasks:Entity[]; vents:Entity[] };
  meta:{ mstEdges:[number,number][] };
}

// ---------------- RNG ----------------
function mulberry32(seed:number){return function(){let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function hashString(s:string){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}

// ---------------- Helpers grille ----------------
function makeGrid<T>(w:number,h:number,val:T):T[][]{return Array.from({length:h},()=>Array.from({length:w},()=>val))}
function rectsOverlap(a:Rect,b:Rect,pad=0){return !(a.x+a.w+pad<=b.x||b.x+b.w+pad<=a.x||a.y+a.h+pad<=b.y||b.y+b.h+pad<=a.y)}
function clamp(v:number,a:number,b:number){return Math.max(a,Math.min(b,v))}

// ---------------- Génération des salles ----------------
function generateRooms(cfg:LevelConfig, rnd:()=>number):Rect[]{
  const rooms:Rect[]=[]
  let tries=0; const maxTries=cfg.roomCount*20
  while(rooms.length<cfg.roomCount && tries++<maxTries){
    const w=Math.floor(cfg.roomMin.x + rnd()*(cfg.roomMax.x-cfg.roomMin.x))
    const h=Math.floor(cfg.roomMin.y + rnd()*(cfg.roomMax.y-cfg.roomMin.y))
    const x=Math.floor(2 + rnd()*(cfg.width-w-4))
    const y=Math.floor(2 + rnd()*(cfg.height-h-4))
    const r:Rect={x,y,w,h}
    if(!rooms.some(o=>rectsOverlap(o,r,2))) rooms.push(r)
  }
  return rooms
}

// ---------------- Graphe & corridors ----------------
function center(r:Rect):Vec2{ return {x:Math.floor(r.x+r.w/2), y:Math.floor(r.y+r.h/2)} }

function distance(a:Vec2,b:Vec2){const dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy)}

function buildMST(rooms:Rect[]):[number,number][]{
  // Kruskal simple sur graphe complet des centres
  type Edge={a:number;b:number;w:number}
  const edges:Edge[]=[]
  for(let i=0;i<rooms.length;i++) for(let j=i+1;j<rooms.length;j++) edges.push({a:i,b:j,w:distance(center(rooms[i]),center(rooms[j]))})
  edges.sort((x,y)=>x.w-y.w)
  const parent=Array.from(rooms,(_,i)=>i)
  const find=(x:number)=> parent[x]===x?x:(parent[x]=find(parent[x]))
  const join=(a:number,b:number)=> parent[find(a)]=find(b)
  const mst:[number,number][]=[]
  for(const e of edges){ if(find(e.a)!==find(e.b)){ join(e.a,e.b); mst.push([e.a,e.b]) } }
  return mst
}

function carveCorridor(grid:number[][], a:Vec2, b:Vec2, width:number, tile:number){
  // L‑shape simple (d’abord x puis y ou inverse aléatoire)
  const rnd=Math.random()
  const horizFirst=rnd<0.5
  const mid:Vec2 = horizFirst? {x:b.x, y:a.y} : {x:a.x, y:b.y}
  const carveLine=(p:Vec2,q:Vec2)=>{
    const dx=Math.sign(q.x-p.x), dy=Math.sign(q.y-p.y)
    let x=p.x, y=p.y
    while(x!==q.x || y!==q.y){
      for(let ox=-(width>>1); ox<=(width>>1); ox++) for(let oy=-(width>>1); oy<=(width>>1); oy++){
        const gx=x+ox, gy=y+oy; if(grid[gy]&&grid[gy][gx]!==undefined) grid[gy][gx]=tile
      }
      if(x!==q.x) x+=dx; else if(y!==q.y) y+=dy
    }
    for(let ox=-(width>>1); ox<=(width>>1); ox++) for(let oy=-(width>>1); oy<=(width>>1); oy++){
      const gx=q.x+ox, gy=q.y+oy; if(grid[gy]&&grid[gy][gx]!==undefined) grid[gy][gx]=tile
    }
  }
  carveLine(a,mid); carveLine(mid,b)
}

// ---------------- Construction du tilemap ----------------
export function generateLevel(cfg:LevelConfig):LevelData{
  const rnd=mulberry32(hashString(cfg.seed)||1)
  const W=cfg.width, H=cfg.height
  const floor=makeGrid<number>(W,H,0)
  // 1) Salles
  const rooms=generateRooms(cfg,rnd)
  rooms.forEach(r=>{ for(let y=r.y;y<r.y+r.h;y++) for(let x=r.x;x<r.x+r.w;x++) floor[y][x]=cfg.theme.floorTile })
  // 2) Corridors via MST (+ boucle optionnelle)
  const mst=buildMST(rooms)
  mst.forEach(([i,j])=> carveCorridor(floor, center(rooms[i]), center(rooms[j]), cfg.corridorWidth, cfg.theme.floorTile))
  if(cfg.ensureLoop && rooms.length>=3){ // connecte deux salles non adjacentes
    const extra=[...mst]
    const allPairs:number[][]=[]; for(let i=0;i<rooms.length;i++) for(let j=i+2;j<rooms.length;j++) allPairs.push([i,j])
    if(allPairs.length){ const [i,j]=allPairs[Math.floor(rnd()*allPairs.length)] as [number,number]; carveCorridor(floor, center(rooms[i]), center(rooms[j]), cfg.corridorWidth, cfg.theme.floorTile) }
  }
  // 3) Murs: contour des cases floor
  const walls=makeGrid<number>(W,H,0)
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]]
  for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++) if(floor[y][x]===cfg.theme.floorTile){
    for(const [dx,dy] of dirs){ const nx=x+dx, ny=y+dy; if(floor[ny][nx]===0) walls[ny][nx]=cfg.theme.wallTile }
  }
  // 4) Portes: là où un mur sépare deux sols
  const doors=makeGrid<number>(W,H,0)
  for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++){
    if(walls[y][x]!==0){
      const a=floor[y][x-1]===cfg.theme.floorTile && floor[y][x+1]===cfg.theme.floorTile
      const b=floor[y-1][x]===cfg.theme.floorTile && floor[y+1][x]===cfg.theme.floorTile
      if(a||b){ if(Math.random()<0.65 || Math.random()<cfg.doorChance){ doors[y][x]=cfg.theme.doorTile; walls[y][x]=0 } }
    }
  }
  // 5) Vents: place des paires dans des recoins de salles
  const vents=makeGrid<number>(W,H,0)
  const ventEntities:Entity[]=[]
  const roomIdx=rooms.map((r,i)=>i)
  for(let p=0;p<cfg.vents.pairs;p++){
    if(roomIdx.length<2) break
    const i=Math.floor(rnd()*roomIdx.length); const a=roomIdx.splice(i,1)[0]
    const j=Math.floor(rnd()*roomIdx.length); const b=roomIdx.splice(j,1)[0]
    const pa=pickVentSpot(rooms[a],floor), pb=pickVentSpot(rooms[b],floor)
    if(pa && pb){ vents[pa.y][pa.x]=cfg.theme.ventTile; vents[pb.y][pb.x]=cfg.theme.ventTile; ventEntities.push({id:'vent',pos:toPx(pa,cfg)}, {id:'vent',pos:toPx(pb,cfg)}, {id:'vent_link',pos:toPx({x:0,y:0},cfg),meta:{a:pa,b:pb}}) }
  }

  // 6) Props & tasks placement (simple occupancy)
  const occ=makeGrid<boolean>(W,H,false)
  for(let y=0;y<H;y++) for(let x=0;x<W;x++) if(floor[y][x]===cfg.theme.floorTile) occ[y][x]=false; else occ[y][x]=true
  const props:Entity[]=[]
  const defs=cfg.props.defs
  const target= Math.floor(cfg.props.density * rooms.reduce((s,r)=>s+r.w*r.h,0))
  let placed=0, safety=0
  while(placed<target && safety++<target*20){
    const def=defs[Math.floor(rnd()*defs.length)]
    const room=rooms[Math.floor(rnd()*rooms.length)]
    const x=room.x+1+Math.floor(rnd()*(Math.max(1,room.w-def.w-2)))
    const y=room.y+1+Math.floor(rnd()*(Math.max(1,room.h-def.h-2)))
    if(def.nearWall && !isNearWall(x,y,def, walls)) continue
    if(placeRect(occ,{x,y,w:def.w,h:def.h})){
      for(let yy=y;yy<y+def.h;yy++) for(let xx=x;xx<x+def.w;xx++) floor[yy][xx]=def.tile
      props.push({id:def.id,pos:toPx({x:x+def.w/2,y:y+def.h/2},cfg),meta:{w:def.w,h:def.h,tile:def.tile,blocking:def.blocking}})
      placed++
    }
  }
  // Tasks: petits interactifs le long des murs
  const tasks:Entity[]=[]
  const tCount=cfg.tasks.count
  let tSafety=0
  while(tasks.length<tCount && tSafety++<tCount*30){
    const r=rooms[Math.floor(rnd()*rooms.length)]
    const x=r.x+1+Math.floor(rnd()*(r.w-2)); const y=r.y+1+Math.floor(rnd()*(r.h-2))
    if(walls[y][x]!==0 && floor[y][x]===0){ // mur nu -> porte tâche
      doors[y][x]=cfg.theme.doorTile // visuel borne murale
      tasks.push({id:'task',pos:toPx({x,y},cfg),meta:{kind:'panel'}})
    }
  }

  // 7) Collision & nav grid
  const collision=makeGrid<boolean>(W,H,false)
  const nav=makeGrid<boolean>(W,H,false)
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const isWall = walls[y][x]!==0
    const isDoor = doors[y][x]!==0
    const isFloor = floor[y][x]!==0
    collision[y][x] = isWall && !isDoor
    nav[y][x] = isFloor || isDoor
  }

  // 8) Spawns: au centre de quelques salles
  const spawns=rooms.slice(0,Math.min(4,rooms.length)).map(r=> toPx(center(r),cfg))

  return { config:cfg, floor, walls, doors, vents, collision, nav, rooms, corridors:[], spawns, entities:{ props, tasks, vents:ventEntities }, meta:{ mstEdges:mst } }
}

function isNearWall(x:number,y:number,def:PropDef,walls:number[][]){
  for(let yy=y-1; yy<y+def.h+1; yy++) for(let xx=x-1; xx<x+def.w+1; xx++) if(walls[yy]&&walls[yy][xx]) return true
  return false
}

function placeRect(occ:boolean[][], r:Rect){
  for(let y=r.y; y<r.y+r.h; y++) for(let x=r.x; x<r.x+r.w; x++) if(occ[y]?.[x]) return false
  for(let y=r.y; y<r.y+r.h; y++) for(let x=r.x; x<r.x+r.w; x++) occ[y][x]=true
  return true
}

function pickVentSpot(room:Rect,floor:number[][]):Vec2|null{
  // Cherche un coin interne
  for(let tries=0; tries<50; tries++){
    const x=room.x+1+Math.floor(Math.random()*(room.w-2))
    const y=room.y+1+Math.floor(Math.random()*(room.h-2))
    if(floor[y][x]!==0 && floor[y][x+1]!==0 && floor[y+1]?.[x]!==0) return {x,y}
  }
  return null
}

function toPx(t:Vec2, cfg:LevelConfig):Vec2{ return { x: Math.floor((t.x+0.5)*cfg.tileSize), y: Math.floor((t.y+0.5)*cfg.tileSize) } }

// ---------------- Exports vers Phaser / Pixi ----------------
export function toPhaserTilemap(scene:any, lvl:LevelData, key:string){
  // Fusionne les couches en un seul array de tuiles prioritaires (walls>doors>vents>floor)
  const W=lvl.config.width, H=lvl.config.height
  const grid=makeGrid<number>(W,H,0)
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const v = lvl.vents[y][x]||0
    const d = lvl.doors[y][x]||0
    const w = lvl.walls[y][x]||0
    const f = lvl.floor[y][x]||0
    grid[y][x]= f; if(v) grid[y][x]=v; if(d) grid[y][x]=d; if(w) grid[y][x]=w
  }
  const map=scene.make.tilemap({ data:grid, tileWidth:lvl.config.tileSize, tileHeight:lvl.config.tileSize })
  // NOTE: vous devez avoir créé un tileset avec les indices correspondants
  // par ex. un spritesheet où l'index 1=floor, 2=wall, 3=door, 4=vent
  const tileset = map.addTilesetImage(key)
  const layer = map.createLayer(0, tileset, 0, 0)
  // Collision sur murs
  layer.setCollision([lvl.config.theme.wallTile])
  return { map, layer }
}

export function toPixiContainers(app:any, lvl:LevelData, textures:Record<number, any>){
  const c=new (app as any).Container()
  for(let y=0;y<lvl.config.height;y++) for(let x=0;x<lvl.config.width;x++){
    const idx= lvl.walls[y][x]||lvl.doors[y][x]||lvl.vents[y][x]||lvl.floor[y][x]
    if(!idx) continue
    const spr = new (app as any).Sprite(textures[idx])
    spr.x = x*lvl.config.tileSize; spr.y = y*lvl.config.tileSize
    c.addChild(spr)
  }
  return c
}

// ---------------- Mini‑map debug (optionnel) ----------------
export function drawMiniMap(canvas:HTMLCanvasElement, lvl:LevelData){
  canvas.width=lvl.config.width; canvas.height=lvl.config.height
  const ctx=canvas.getContext('2d')!
  const col=(i:number)=> i===0?'#000000': i===1?'#374151': i===2?'#9CA3AF': i===3?'#60A5FA': i===4?'#34D399':'#F59E0B'
  for(let y=0;y<lvl.config.height;y++) for(let x=0;x<lvl.config.width;x++){
    const idx= lvl.walls[y][x]||lvl.doors[y][x]||lvl.vents[y][x]||lvl.floor[y][x]
    ctx.fillStyle=col(idx); ctx.fillRect(x,y,1,1)
  }
  // centres de salles
  ctx.fillStyle='#10B981'; lvl.rooms.forEach(r=>{const c=center(r); ctx.fillRect(c.x-1,c.y-1,3,3)})
}

// ---------------- Presets utiles ----------------
export const THEMES={
  Skeld: { name:'Skeld', floorTile:1, wallTile:2, doorTile:3, ventTile:4, decoTiles:[5,6,7] } as Theme,
  Mira:  { name:'Mira',  floorTile:1, wallTile:2, doorTile:3, ventTile:4, decoTiles:[8,9] } as Theme,
}

export const DEFAULT_PROPS:PropDef[]=[
  {id:'table',  w:3,h:2,kind:'table',  tile:5, blocking:true},
  {id:'console',w:2,h:1,kind:'console',tile:6, blocking:true, nearWall:true},
  {id:'crate',  w:1,h:1,kind:'crate',  tile:7, blocking:true},
  {id:'chair',  w:1,h:1,kind:'chair',  tile:8, blocking:false},
  {id:'plant',  w:1,h:1,kind:'plant',  tile:9, blocking:false},
  {id:'light',  w:1,h:1,kind:'light',  tile:10,blocking:false}
]

export function defaultConfig(seed:string):LevelConfig{
  return {
    seed,
    width:96, height:64, tileSize:32,
    roomCount:10,
    roomMin:{x:6,y:5}, roomMax:{x:14,y:10},
    corridorWidth:2,
    doorChance:0.3,
    theme:THEMES.Skeld,
    props:{ density:0.06, defs:DEFAULT_PROPS },
    tasks:{ count:12 },
    vents:{ pairs:3 },
    ensureLoop:true
  }
}

/* -------------------- Exemple d’utilisation (Phaser 3) --------------------
import Phaser from 'phaser'
import { generateLevel, defaultConfig, toPhaserTilemap } from './env-gen'

class MyScene extends Phaser.Scene{
  preload(){ this.load.image('tiles','/tileset.png') }
  create(){
    const lvl = generateLevel(defaultConfig('seed-xyz'))
    const { map, layer } = toPhaserTilemap(this, lvl, 'tiles')
    // collisions
    this.physics.world.setBounds(0,0,map.widthInPixels,map.heightInPixels)
    // spawns
    const spawn=lvl.spawns[0]; const player=this.physics.add.sprite(spawn.x,spawn.y,'player')
    // props/entities : utilisez lvl.entities.props / tasks / vents
  }
}

new Phaser.Game({ type:Phaser.AUTO, width:1280, height:720, scene:[MyScene], physics:{ default:'arcade' } })

-------------------- Exemple (PixiJS) --------------------
import { Application, Texture } from 'pixi.js'
import { generateLevel, defaultConfig, toPixiContainers } from './env-gen'

const app=new Application({ width:1280, height:720, background:'#0b1020' })
document.body.appendChild(app.view as any)
// map textures num->Texture
const textures:Record<number,Texture>={ /* 1->floor,2->wall,3->door,4->vent,5..deco */ }
const lvl=generateLevel(defaultConfig('seed-xyz'))
const container=toPixiContainers(app, lvl, textures)
app.stage.addChild(container)
*/
