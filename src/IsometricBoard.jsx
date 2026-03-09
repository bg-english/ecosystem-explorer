import { useEffect, useRef } from "react";
import { TEAM_COLORS, CT } from "./constants";

function IsometricBoard({ teams, currentTeamIdx, board, gridSize, hasImage }) {
  const canvasRef = useRef(null);
  const teamsRef  = useRef(teams);
  const curRef    = useRef(currentTeamIdx);
  useEffect(() => { teamsRef.current = teams; },         [teams]);
  useEffect(() => { curRef.current = currentTeamIdx; },  [currentTeamIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Hi-DPI / HD resolution fix ────────────────
    const DPR = window.devicePixelRatio || 1;
    const W_CSS = canvas.parentElement?.clientWidth  || 900;
    const H_CSS = canvas.parentElement?.clientHeight || 900;
    // Physical pixels — crisp on retina/4K/HD screens
    canvas.width  = W_CSS * DPR;
    canvas.height = H_CSS * DPR;
    canvas.style.width  = W_CSS + "px";
    canvas.style.height = H_CSS + "px";
    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext("2d");
    ctx.scale(DPR, DPR); // all drawing coords stay in CSS pixels
    // Re-alias W/H to CSS pixels for all drawing logic
    const CW = W_CSS, CH = H_CSS;

    const GRID    = gridSize || 9;
    const boardData = board || generateBoard(GRID * GRID);
    // Larger base tile — fills a big screen better
    const TW_base = 52;
    const TH_base = 26;
    const SH_base = 13;
    const ZRISE   = 0.45;
    const SPACING = 1.55;

    // spiral of GRID×GRID then slice to boardData length
    function spiralPath(n) {
      const p = []; let r1=0,r2=n-1,c1=0,c2=n-1;
      while(r1<=r2&&c1<=c2){
        for(let c=c1;c<=c2;c++)p.push([r1,c]); r1++;
        for(let r=r1;r<=r2;r++)p.push([r,c2]); c2--;
        if(r1<=r2){for(let c=c2;c>=c1;c--)p.push([r2,c]);r2--;}
        if(c1<=c2){for(let r=r2;r>=r1;r--)p.push([r,c1]);c1++;}
      }
      return p;
    }
    const PATH = spiralPath(GRID).slice(0, boardData.length);
    const N = PATH.length;

    // Flip so step 0 (START) is front-bottom
    const steps = PATH.map(([origRow, origCol], idx) => {
      const row = (GRID-1) - origRow;
      const col = (GRID-1) - origCol;
      const z   = idx * ZRISE;
      const sx  = (col - row) * TW_base * SPACING;
      const sy  = (col + row) * TH_base * SPACING - z;
      const cell = boardData[idx] || { type:"trivia" };
      const hue  = CT[cell.type]?.hue ?? 200;
      return { row, col, idx, hue, z, sx, sy, cell };
    });

    // Auto-fit — use CSS dimensions for layout
    const TITLE_H = 10, PAD = 32;
    const allX = steps.flatMap(s=>[s.sx-TW_base, s.sx+TW_base]);
    const allY = steps.flatMap(s=>[s.sy-TH_base-30, s.sy+TH_base+SH_base+4]);
    const minX=Math.min(...allX), maxX=Math.max(...allX);
    const minY=Math.min(...allY), maxY=Math.max(...allY);
    const availW = CW - PAD*2;
    const availH = CH - TITLE_H - PAD*2;
    const scale  = Math.min(availW/(maxX-minX), availH/(maxY-minY));
    const OX = PAD + (availW-(maxX-minX)*scale)/2 - minX*scale;
    const OY = TITLE_H + PAD + (availH-(maxY-minY)*scale)/2 - minY*scale;

    steps.forEach(s => {
      s.sx = s.sx*scale + OX;
      s.sy = s.sy*scale + OY;
    });
    const tw = TW_base*scale, th = TH_base*scale, sh = SH_base*scale;

    // Painter sort
    const drawOrder = [...steps].sort((a,b) => {
      const da = a.row+a.col, db = b.row+b.col;
      if(da!==db) return da-db;
      return a.idx-b.idx;
    });

    // ── Helpers ───────────────────────────────────
    const hsl = (h,s,l,a=1) => `hsla(${h},${s}%,${l}%,${a})`;

    function drawTile(s, glow, shimmer) {
      const {sx,sy,hue,idx,cell} = s;
      const h = hue;
      const isStart  = idx === 0;
      const isMeta   = idx === N-1;
      const glowMult = glow ? 1.15 : 1;

      // Right face
      ctx.beginPath();
      ctx.moveTo(sx+tw,sy); ctx.lineTo(sx,sy+th);
      ctx.lineTo(sx,sy+th+sh); ctx.lineTo(sx+tw,sy+sh);
      ctx.closePath();
      ctx.fillStyle = glow ? hsl(h,90,36) : hsl(h,80,25);
      ctx.fill();
      ctx.strokeStyle = hsl(h,60,10,.7); ctx.lineWidth=.6; ctx.stroke();

      // Left face
      ctx.beginPath();
      ctx.moveTo(sx-tw,sy); ctx.lineTo(sx,sy+th);
      ctx.lineTo(sx,sy+th+sh); ctx.lineTo(sx-tw,sy+sh);
      ctx.closePath();
      ctx.fillStyle = glow ? hsl(h,85,26) : hsl(h,75,17);
      ctx.fill();
      ctx.strokeStyle = hsl(h,60,8,.7); ctx.lineWidth=.6; ctx.stroke();

      // Top face
      ctx.beginPath();
      ctx.moveTo(sx,sy-th); ctx.lineTo(sx+tw,sy);
      ctx.lineTo(sx,sy+th); ctx.lineTo(sx-tw,sy);
      ctx.closePath();
      const g = ctx.createLinearGradient(sx-tw,sy-th,sx+tw,sy+th);
      if(glow) {
        g.addColorStop(0, hsl(h,100,92)); g.addColorStop(.5,hsl(h,100,74)); g.addColorStop(1,hsl(h,95,58));
      } else {
        g.addColorStop(0, hsl(h,95,72)); g.addColorStop(.5,hsl(h,100,60)); g.addColorStop(1,hsl(h,90,48));
      }
      ctx.fillStyle=g; ctx.fill();
      ctx.strokeStyle=hsl(h,60,22,.4); ctx.lineWidth=.6; ctx.stroke();

      // Sheen
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sx,sy-th); ctx.lineTo(sx+tw,sy);
      ctx.lineTo(sx,sy+th); ctx.lineTo(sx-tw,sy);
      ctx.closePath(); ctx.clip();
      ctx.beginPath();
      ctx.moveTo(sx-tw*.45, sy-th*.75);
      ctx.lineTo(sx+tw*.08, sy-th*.08);
      ctx.strokeStyle="rgba(255,255,255,.16)"; ctx.lineWidth=tw*.16; ctx.stroke();
      ctx.restore();

      // Icon + number
      const iconFontSize = Math.max(7, Math.round(tw*.35));
      const numFontSize  = Math.max(6, Math.round(tw*.28));
      ctx.save();
      ctx.textAlign="center"; ctx.textBaseline="middle";
      // icon
      ctx.font = `${iconFontSize}px serif`;
      ctx.fillText(CT[cell.type]?.icon ?? "❓", sx, sy - th*0.18);
      // step number
      ctx.font = `bold ${numFontSize}px Georgia,serif`;
      ctx.fillStyle="rgba(0,0,0,.55)";
      ctx.fillText(idx+1, sx+.5, sy+th*.45+.8);
      ctx.fillStyle="rgba(255,255,255,.92)";
      ctx.fillText(idx+1, sx, sy+th*.45);
      ctx.restore();
    }

    function drawStartBadge(s) {
      const {sx,sy} = s;
      const bx=sx, by=sy-th-16;
      ctx.save();
      ctx.shadowColor="rgba(74,222,128,.8)"; ctx.shadowBlur=16;
      ctx.beginPath(); ctx.roundRect(bx-30,by-9,60,18,9);
      ctx.fillStyle="rgba(22,163,74,.92)"; ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.font="bold 10px Georgia,serif";
      ctx.fillStyle="rgba(255,255,255,.98)";
      ctx.fillText("▶ START", bx, by);
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(bx,by+10); ctx.lineTo(bx,sy-th-2);
      ctx.strokeStyle="rgba(74,222,128,.6)"; ctx.lineWidth=1.5;
      ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);
    }

    function drawDiamond(s, frame) {
      const {sx,sy} = s;
      const pulse = .5+.5*Math.sin(frame*.045);
      const dcx=sx, dcy=sy-th-2;
      const r=(tw*.5)+pulse*(tw*.09);

      const aura=ctx.createRadialGradient(dcx,dcy,0,dcx,dcy,r*3.2);
      aura.addColorStop(0,`rgba(255,255,200,${.6+pulse*.22})`);
      aura.addColorStop(.25,"rgba(255,220,80,.2)");
      aura.addColorStop(.6,"rgba(200,160,50,.06)");
      aura.addColorStop(1,"rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(dcx,dcy,r*3.2,0,Math.PI*2);
      ctx.fillStyle=aura; ctx.fill();

      const F=[
        {pts:[[0,-1],[.55,-.3],[0,0]],l:240},
        {pts:[[0,-1],[-.55,-.3],[0,0]],l:195},
        {pts:[[.55,-.3],[1,.2],[0,.85],[0,0]],l:165},
        {pts:[[-.55,-.3],[-1,.2],[0,.85],[0,0]],l:135},
        {pts:[[1,.2],[0,.85],[0,0]],l:150},
        {pts:[[-.1,.2],[0,.85],[0,0]],l:115},
      ];
      F.forEach(({pts,l})=>{
        ctx.beginPath();
        pts.forEach(([px,py],i)=>{
          i===0?ctx.moveTo(dcx+px*r,dcy+py*r):ctx.lineTo(dcx+px*r,dcy+py*r);
        });
        ctx.closePath();
        const v=Math.min(255,l);
        ctx.fillStyle=`rgba(${v},${Math.min(255,v+40)},120,.94)`;
        ctx.fill();
        ctx.strokeStyle="rgba(255,255,200,.3)"; ctx.lineWidth=.5; ctx.stroke();
      });
      const sp=ctx.createRadialGradient(dcx,dcy-r*.35,0,dcx,dcy,r*.55);
      sp.addColorStop(0,"rgba(255,255,200,1)"); sp.addColorStop(1,"rgba(255,255,200,0)");
      ctx.beginPath(); ctx.arc(dcx,dcy-r*.3,r*.3,0,Math.PI*2);
      ctx.fillStyle=sp; ctx.fill();
      ctx.save();
      ctx.shadowColor="rgba(255,230,80,.9)"; ctx.shadowBlur=10;
      ctx.textAlign="center";
      ctx.font="bold 10px Georgia,serif";
      ctx.fillStyle="rgba(255,255,200,.97)";
      ctx.fillText("✦ GOAL", dcx, dcy-r-8);
      ctx.restore();
    }

    function drawTeamTokens(frame) {
      const curTeams = teamsRef.current;
      const activeIdx = curRef.current;

      // Group teams by position
      const byPos = {};
      curTeams.forEach((t,ti) => {
        const pos = t.position ?? 0;
        if (!byPos[pos]) byPos[pos] = [];
        byPos[pos].push({ t, ti });
      });

      Object.entries(byPos).forEach(([pos, group]) => {
        const s = steps[parseInt(pos)];
        if (!s) return;
        group.forEach(({ t, ti }, gi) => {
          const isActive = ti === activeIdx;
          const bounce = isActive ? Math.sin(frame * .07) * 3.5 : 0;
          const ox = (gi - (group.length-1)/2) * (tw*0.42);
          const cx = s.sx + ox;
          const cy = s.sy - th - 12 + bounce;
          const r  = Math.max(7, tw * 0.32);
          const col = TEAM_COLORS[t.colorIdx];

          // ── Drop shadow base ──
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(cx, s.sy - th - 2, r * 1.1, r * 0.45, 0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.fill();
          ctx.restore();

          // ── Pulse ring for active team ──
          if (isActive) {
            const pulse = 0.45 + 0.55 * Math.sin(frame * .075);
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r + 4 + pulse * 4, 0, Math.PI * 2);
            ctx.strokeStyle = `${col.bg}${Math.round(pulse * 200 + 30).toString(16).padStart(2,'0')}`;
            ctx.lineWidth = 2.2;
            ctx.stroke();
            // outer faint ring
            ctx.beginPath();
            ctx.arc(cx, cy, r + 9 + pulse * 5, 0, Math.PI * 2);
            ctx.strokeStyle = `${col.bg}${Math.round(pulse * 80).toString(16).padStart(2,'0')}`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
          }

          // ── Token body gradient ──
          ctx.save();
          if (isActive) {
            ctx.shadowColor = col.bg;
            ctx.shadowBlur  = 14;
          }
          const bodyGrad = ctx.createRadialGradient(cx - r*.25, cy - r*.25, r*.05, cx, cy, r);
          bodyGrad.addColorStop(0, col.light);
          bodyGrad.addColorStop(0.6, col.bg);
          bodyGrad.addColorStop(1, col.dark);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = bodyGrad;
          ctx.fill();
          ctx.restore();

          // ── Token rim ──
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = isActive ? "#fff" : "rgba(255,255,255,0.55)";
          ctx.lineWidth = isActive ? 2.2 : 1.4;
          ctx.stroke();

          // ── Sheen highlight ──
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.clip();
          const sheen = ctx.createRadialGradient(cx - r*.3, cy - r*.35, 0, cx, cy, r);
          sheen.addColorStop(0, "rgba(255,255,255,0.45)");
          sheen.addColorStop(0.5, "rgba(255,255,255,0.0)");
          ctx.fillStyle = sheen;
          ctx.fill();
          ctx.restore();

          // ── Letter ──
          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold ${Math.max(8, Math.round(r * 0.98))}px Cinzel,serif`;
          ctx.shadowColor = "rgba(0,0,0,0.6)";
          ctx.shadowBlur = 3;
          ctx.fillStyle = "#fff";
          ctx.fillText(String.fromCharCode(65 + t.id), cx, cy + 0.5);
          ctx.restore();

          // ── Team name label below token (active only) ──
          if (isActive) {
            const labelY = cy + r + 9;
            ctx.save();
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.font = `bold ${Math.max(7, Math.round(tw * 0.22))}px Cinzel,serif`;
            ctx.shadowColor = "rgba(0,0,0,0.85)";
            ctx.shadowBlur = 5;
            ctx.fillStyle = col.light;
            ctx.fillText(t.name.length > 10 ? t.name.slice(0, 9) + "…" : t.name, cx, labelY);
            ctx.restore();
          }
        });
      });
    }

    // ── Stars background ──────────────────────────
    const stars = Array.from({length:220}, () => ({
      x:Math.random()*CW, y:Math.random()*CH,
      r:Math.random()*1.6+0.3,
      a:Math.random()*.4+.06,
    }));

    // ── Legend ────────────────────────────────────
    function drawLegend() {
      const types = ["trivia","identify","foodchain","hangman","match","unscramble","wildcard"];
      const cols = 4, itemW = CW/cols, itemH = 20;
      const startX = 8, startY = CH - itemH*(Math.ceil(types.length/cols)) - 6;
      types.forEach((type, i) => {
        const col = i % cols, row = Math.floor(i / cols);
        const x = startX + col*itemW, y = startY + row*itemH;
        const c = CT[type];
        ctx.beginPath();
        ctx.arc(x+9, y+8, 7, 0, Math.PI*2);
        ctx.fillStyle = c.color; ctx.fill();
        ctx.save();
        ctx.font = "13px Georgia,serif";
        ctx.fillStyle = "rgba(210,210,210,.85)";
        ctx.textBaseline = "middle";
        ctx.fillText(`${c.icon} ${c.label}`, x+20, y+8.5);
        ctx.restore();
      });
    }

    // ── Render loop ───────────────────────────────
    let animId, frame=0, shimIdx=0, shimTimer=0;

    function drawActiveGlow(s, frame) {
      const curTeams = teamsRef.current;
      const activeIdx = curRef.current;
      const curTeam = curTeams[activeIdx];
      if (!curTeam) return;
      const pos = curTeam.position ?? 0;
      if (s.idx !== pos) return;
      const col = TEAM_COLORS[curTeam.colorIdx];
      const pulse = 0.5 + 0.5 * Math.sin(frame * .07);
      const {sx, sy} = s;
      // Glow halo on tile top face
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sx, sy-th); ctx.lineTo(sx+tw, sy);
      ctx.lineTo(sx, sy+th); ctx.lineTo(sx-tw, sy);
      ctx.closePath();
      ctx.strokeStyle = `${col.bg}${Math.round((0.5 + 0.5*pulse)*255).toString(16).padStart(2,'0')}`;
      ctx.lineWidth = 2.5 + pulse * 1.5;
      ctx.shadowColor = col.bg;
      ctx.shadowBlur = 12 + pulse * 10;
      ctx.stroke();
      ctx.restore();
    }

    function render() {
      frame++;
      shimTimer++;
      if(shimTimer>=6){ shimTimer=0; shimIdx=(shimIdx+1)%N; }

      // Canvas is transparent — background ecosystem shows through gaps between tiles
      ctx.clearRect(0,0,CW,CH);

      // Stars — only when no background image
      if (!hasImage) {
        stars.forEach(s => {
          ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
          ctx.fillStyle=`rgba(160,185,255,${s.a})`; ctx.fill();
        });
      }

      // Tiles (back to front, skip META)
      for(const s of drawOrder){
        if(s.idx===N-1) continue;
        drawTile(s, s.idx===shimIdx);
        drawActiveGlow(s, frame);
      }
      // META on top
      drawTile(steps[N-1], true);
      drawDiamond(steps[N-1], frame);

      // START badge
      drawStartBadge(steps[0]);

      // Team tokens (above tiles)
      drawTeamTokens(frame);

      // Legend
      drawLegend();

      animId = requestAnimationFrame(render);
    }
    render();
    return () => cancelAnimationFrame(animId);
  }, []); // mount once; team data via refs

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", touchAction: "pan-x pan-y" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", background: "transparent" }} />
    </div>
  );
}


export default IsometricBoard;
