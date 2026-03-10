import { useEffect, useRef, useState } from "react";
import { TEAM_COLORS, CT } from "./constants";

// ── Hex spiral path generator ─────────────────────────────────────────────
// Generates axial [q, r] coordinates for N tiles arranged as a hex spiral
// from the outermost ring inward. Center (0,0) is always the last tile (goal).
function generateHexSpiral(totalTiles) {
  // Axial directions clockwise: E, NE, NW, W, SW, SE
  const DIRS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
  const START_DIR = 4; // SW = scale from center gives bottom-left start

  // Find max ring needed
  let maxRing = 1;
  while (3 * maxRing * (maxRing + 1) < totalTiles - 1) maxRing++;

  // Generate all ring positions from outermost inward
  const ringPositions = [];
  for (let ring = maxRing; ring >= 1; ring--) {
    let q = DIRS[START_DIR][0] * ring;
    let r = DIRS[START_DIR][1] * ring;
    for (let side = 0; side < 6; side++) {
      const dir = DIRS[(START_DIR + 2 + side) % 6];
      for (let step = 0; step < ring; step++) {
        ringPositions.push([q, r]);
        q += dir[0];
        r += dir[1];
      }
    }
  }

  // Build final path: fill (totalTiles-1) positions from outer rings, then center
  const path = ringPositions.slice(0, totalTiles - 1);
  path.push([0, 0]); // center = goal, always last
  return path;
}

// Pointy-top hex → screen pixel (size = hex circumradius)
function hexToPixel(q, r, size) {
  return {
    x: size * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r),
    y: size * (3 / 2 * r),
  };
}

// 6 corners of a pointy-top hex centered at (cx, cy) with circumradius r
function hexCorners(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 6 + (Math.PI / 3) * i;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
}

// ─────────────────────────────────────────────────────────────────────────────

function IsometricBoard({ teams, currentTeamIdx, board, gridSize, hasImage }) {
  const canvasRef = useRef(null);
  const teamsRef  = useRef(teams);
  const curRef    = useRef(currentTeamIdx);
  useEffect(() => { teamsRef.current = teams; },        [teams]);
  useEffect(() => { curRef.current = currentTeamIdx; }, [currentTeamIdx]);

  // ── Resize tracking ────────────────────────────────
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (!container) return;
    const measure = () => setContainerSize({ w: container.clientWidth, h: container.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ── Main draw effect ───────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerSize.w || !containerSize.h) return;

    // Hi-DPI setup
    const DPR   = window.devicePixelRatio || 1;
    const CW    = containerSize.w;
    const CH    = containerSize.h;
    canvas.width  = CW * DPR;
    canvas.height = CH * DPR;
    canvas.style.width  = CW + "px";
    canvas.style.height = CH + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(DPR, DPR);

    const boardData = board || [];
    const N = boardData.length;
    if (N === 0) return;

    // ── Build spiral path & screen positions ──────────
    const hexPath = generateHexSpiral(N);

    // Adaptive padding: shrinks on small screens so tiles always fit
    const PAD = Math.max(14, Math.min(36, Math.min(CW, CH) * 0.045));
    // Reserve bottom space for the legend (2 rows × 20px + margin)
    const LEGEND_H = 48;

    // Compute positions at size=1 for auto-fit
    const raw = hexPath.map(([q, r]) => hexToPixel(q, r, 1));
    const allX = raw.map(p => p.x), allY = raw.map(p => p.y);
    const minX = Math.min(...allX), maxX = Math.max(...allX);
    const minY = Math.min(...allY), maxY = Math.max(...allY);
    const scale = Math.min(
      (CW - PAD * 2) / (maxX - minX),
      (CH - PAD * 2 - LEGEND_H) / (maxY - minY)   // ← reserve legend space
    );
    const hexR = scale; // circumradius in px
    const OX = PAD + (CW - PAD * 2 - (maxX - minX) * scale) / 2 - minX * scale;
    // Shift board up so it doesn't sit on top of the legend
    const boardH = (maxY - minY) * scale;
    const OY = PAD + (CH - PAD * 2 - LEGEND_H - boardH) / 2 - minY * scale;

    // Final steps with screen coords
    const steps = hexPath.map(([q, r], idx) => {
      const p = hexToPixel(q, r, scale);
      return {
        idx, q, r,
        cx: p.x + OX,
        cy: p.y + OY,
        cell: boardData[idx] || { type: "trivia" },
      };
    });

    // ── Draw helpers ───────────────────────────────────

    function hexPath2d(cx, cy, r) {
      const c = hexCorners(cx, cy, r);
      const p = new Path2D();
      p.moveTo(c[0].x, c[0].y);
      for (let i = 1; i < 6; i++) p.lineTo(c[i].x, c[i].y);
      p.closePath();
      return p;
    }

    // Glowing path connections between consecutive tiles
    function drawConnections() {
      ctx.save();
      ctx.lineWidth  = Math.max(1, hexR * 0.18);
      ctx.setLineDash([hexR * 0.22, hexR * 0.32]);
      for (let i = 0; i < N - 1; i++) {
        const a = steps[i], b = steps[i + 1];
        const grad = ctx.createLinearGradient(a.cx, a.cy, b.cx, b.cy);
        const hueA = CT[a.cell.type]?.hue ?? 200;
        const hueB = CT[b.cell.type]?.hue ?? 200;
        grad.addColorStop(0, `hsla(${hueA},80%,70%,0.35)`);
        grad.addColorStop(1, `hsla(${hueB},80%,70%,0.35)`);
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(a.cx, a.cy);
        ctx.lineTo(b.cx, b.cy);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Regular challenge tile
    function drawTile(s, shimmer) {
      const { cx, cy, idx, cell } = s;
      const h    = CT[cell.type]?.hue ?? 200;
      const r    = hexR * 0.86;
      const path = hexPath2d(cx, cy, r);

      // Glow halo when shimmer
      if (shimmer) {
        ctx.save();
        ctx.shadowColor = `hsla(${h},100%,70%,0.9)`;
        ctx.shadowBlur  = hexR * 0.7;
        ctx.fillStyle   = `hsla(${h},90%,65%,0.15)`;
        ctx.fill(path);
        ctx.restore();
      }

      // Face fill
      const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, 0, cx, cy, r);
      g.addColorStop(0, shimmer ? `hsla(${h},100%,88%,1)` : `hsla(${h},85%,76%,1)`);
      g.addColorStop(0.55, shimmer ? `hsla(${h},95%,64%,1)` : `hsla(${h},80%,56%,1)`);
      g.addColorStop(1,   shimmer ? `hsla(${h},90%,42%,1)` : `hsla(${h},75%,36%,1)`);
      ctx.fillStyle = g;
      ctx.fill(path);

      // Rim
      ctx.save();
      ctx.strokeStyle = shimmer
        ? `hsla(${h},100%,90%,0.95)`
        : `hsla(${h},60%,22%,0.55)`;
      ctx.lineWidth = shimmer ? 2 : 0.7;
      ctx.stroke(path);
      ctx.restore();

      // Sheen
      ctx.save();
      ctx.clip(path);
      const sheen = ctx.createLinearGradient(cx - r, cy - r, cx + r * 0.3, cy + r * 0.3);
      sheen.addColorStop(0, "rgba(255,255,255,0.22)");
      sheen.addColorStop(0.5, "rgba(255,255,255,0.0)");
      ctx.fillStyle = sheen;
      ctx.fill(path);
      ctx.restore();

      // Icon & number
      const iconSz = Math.max(8, Math.round(hexR * 0.48));
      const numSz  = Math.max(6, Math.round(hexR * 0.30));
      ctx.save();
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.font         = `${iconSz}px serif`;
      ctx.fillText(CT[cell.type]?.icon ?? "❓", cx, cy - hexR * 0.14);
      ctx.font         = `bold ${numSz}px Georgia,serif`;
      ctx.fillStyle    = "rgba(0,0,0,0.5)";
      ctx.fillText(idx + 1, cx + 0.5, cy + hexR * 0.42 + 0.8);
      ctx.fillStyle    = "rgba(255,255,255,0.95)";
      ctx.fillText(idx + 1, cx, cy + hexR * 0.42);
      ctx.restore();
    }

    // Goal tile (center) with pulsing gold aura
    function drawGoalTile(s, frame) {
      const { cx, cy } = s;
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.045);
      const r     = hexR * 0.86;
      const path  = hexPath2d(cx, cy, r);

      // Aura
      const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3.5);
      aura.addColorStop(0, `rgba(255,220,80,${0.55 + pulse * 0.25})`);
      aura.addColorStop(0.35, "rgba(255,180,40,0.12)");
      aura.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();

      // Face
      const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
      g.addColorStop(0,   `rgba(255,245,170,${0.95 + pulse * 0.05})`);
      g.addColorStop(0.5, "rgba(255,200,55,0.98)");
      g.addColorStop(1,   "rgba(195,135,15,0.98)");
      ctx.fillStyle = g;
      ctx.fill(path);

      ctx.save();
      ctx.strokeStyle = `rgba(255,235,100,${0.7 + pulse * 0.3})`;
      ctx.lineWidth   = 2 + pulse * 1.5;
      ctx.shadowColor = "rgba(255,200,0,0.8)";
      ctx.shadowBlur  = 12 + pulse * 8;
      ctx.stroke(path);
      ctx.restore();

      // Label
      ctx.save();
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.font         = `bold ${Math.max(8, Math.round(hexR * 0.40))}px Georgia,serif`;
      ctx.shadowColor  = "rgba(255,200,0,0.9)";
      ctx.shadowBlur   = 10;
      ctx.fillStyle    = "rgba(70,35,0,0.95)";
      ctx.fillText("✦ GOAL", cx, cy);
      ctx.restore();
    }

    // START badge above tile 0
    function drawStartBadge(s) {
      const { cx, cy } = s;
      const by = cy - hexR - 14;
      ctx.save();
      ctx.shadowColor = "rgba(74,222,128,0.8)";
      ctx.shadowBlur  = 16;
      ctx.beginPath();
      ctx.roundRect(cx - 30, by - 9, 60, 18, 9);
      ctx.fillStyle = "rgba(22,163,74,0.92)";
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.font         = "bold 10px Georgia,serif";
      ctx.fillStyle    = "rgba(255,255,255,0.98)";
      ctx.fillText("▶ START", cx, by);
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(cx, by + 9);
      ctx.lineTo(cx, cy - hexR - 2);
      ctx.strokeStyle = "rgba(74,222,128,0.6)";
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Active team tile glow
    function drawActiveGlow(s, frame) {
      const curTeams  = teamsRef.current;
      const activeIdx = curRef.current;
      const curTeam   = curTeams[activeIdx];
      if (!curTeam) return;
      if (s.idx !== (curTeam.position ?? 0)) return;
      const col   = TEAM_COLORS[curTeam.colorIdx];
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.07);
      const path  = hexPath2d(s.cx, s.cy, hexR * 0.86);
      ctx.save();
      ctx.strokeStyle = `${col.bg}${Math.round((0.5 + 0.5 * pulse) * 255).toString(16).padStart(2, "0")}`;
      ctx.lineWidth   = 2.5 + pulse * 1.5;
      ctx.shadowColor = col.bg;
      ctx.shadowBlur  = 12 + pulse * 10;
      ctx.stroke(path);
      ctx.restore();
    }

    // Team tokens (unchanged logic from original)
    function drawTeamTokens(frame) {
      const curTeams  = teamsRef.current;
      const activeIdx = curRef.current;

      const byPos = {};
      curTeams.forEach((t, ti) => {
        const pos = t.position ?? 0;
        if (!byPos[pos]) byPos[pos] = [];
        byPos[pos].push({ t, ti });
      });

      Object.entries(byPos).forEach(([pos, group]) => {
        const s = steps[parseInt(pos)];
        if (!s) return;
        group.forEach(({ t, ti }, gi) => {
          const isActive = ti === activeIdx;
          const bounce   = isActive ? Math.sin(frame * 0.07) * 3.5 : 0;
          const ox  = (gi - (group.length - 1) / 2) * (hexR * 0.42);
          const cx  = s.cx + ox;
          const cy  = s.cy - hexR * 0.58 + bounce;
          const r   = Math.max(7, hexR * 0.32);
          const col = TEAM_COLORS[t.colorIdx];

          // Shadow
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(cx, s.cy - hexR * 0.08, r * 1.1, r * 0.42, 0, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0,0,0,0.42)";
          ctx.fill();
          ctx.restore();

          // Pulse rings (active)
          if (isActive) {
            const pulse = 0.45 + 0.55 * Math.sin(frame * 0.075);
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, r + 4 + pulse * 4, 0, Math.PI * 2);
            ctx.strokeStyle = `${col.bg}${Math.round(pulse * 200 + 30).toString(16).padStart(2, "0")}`;
            ctx.lineWidth = 2.2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(cx, cy, r + 9 + pulse * 5, 0, Math.PI * 2);
            ctx.strokeStyle = `${col.bg}${Math.round(pulse * 80).toString(16).padStart(2, "0")}`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
          }

          // Body
          ctx.save();
          if (isActive) { ctx.shadowColor = col.bg; ctx.shadowBlur = 14; }
          const bodyGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.05, cx, cy, r);
          bodyGrad.addColorStop(0, col.light);
          bodyGrad.addColorStop(0.6, col.bg);
          bodyGrad.addColorStop(1, col.dark);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = bodyGrad;
          ctx.fill();
          ctx.restore();

          // Rim
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = isActive ? "#fff" : "rgba(255,255,255,0.55)";
          ctx.lineWidth   = isActive ? 2.2 : 1.4;
          ctx.stroke();

          // Sheen
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.clip();
          const sheen = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, 0, cx, cy, r);
          sheen.addColorStop(0, "rgba(255,255,255,0.45)");
          sheen.addColorStop(0.5, "rgba(255,255,255,0)");
          ctx.fillStyle = sheen;
          ctx.fill();
          ctx.restore();

          // Letter
          ctx.save();
          ctx.textAlign    = "center";
          ctx.textBaseline = "middle";
          ctx.font         = `bold ${Math.max(8, Math.round(r * 0.98))}px Cinzel,serif`;
          ctx.shadowColor  = "rgba(0,0,0,0.6)";
          ctx.shadowBlur   = 3;
          ctx.fillStyle    = "#fff";
          ctx.fillText(String.fromCharCode(65 + t.id), cx, cy + 0.5);
          ctx.restore();

          // Name label (active only)
          if (isActive) {
            ctx.save();
            ctx.textAlign    = "center";
            ctx.textBaseline = "top";
            ctx.font         = `bold ${Math.max(7, Math.round(hexR * 0.22))}px Cinzel,serif`;
            ctx.shadowColor  = "rgba(0,0,0,0.85)";
            ctx.shadowBlur   = 5;
            ctx.fillStyle    = col.light;
            const label = t.name.length > 10 ? t.name.slice(0, 9) + "…" : t.name;
            ctx.fillText(label, cx, cy + r + 5);
            ctx.restore();
          }
        });
      });
    }

    // Legend
    function drawLegend() {
      const types  = ["trivia","identify","foodchain","hangman","match","unscramble","wildcard"];
      const cols   = 4;
      const itemW  = Math.min(CW / cols, 118);
      const itemH  = 20;
      const rows   = Math.ceil(types.length / cols);
      const legendH = rows * itemH + 10;
      const startY = CH - legendH;
      const totalW = cols * itemW;
      const startX = (CW - totalW) / 2;

      // Semi-transparent background panel
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.roundRect(startX - 8, startY - 4, totalW + 16, legendH + 6, 8);
      ctx.fill();
      ctx.restore();

      types.forEach((type, i) => {
        const col  = i % cols, row = Math.floor(i / cols);
        const x = startX + col * itemW, y = startY + row * itemH + 6;
        const c = CT[type];
        ctx.beginPath();
        ctx.arc(x + 7, y + 7, 5, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();
        ctx.save();
        ctx.font         = `${Math.max(9, Math.min(12, CW * 0.022))}px Georgia,serif`;
        ctx.fillStyle    = "rgba(220,220,220,0.88)";
        ctx.textBaseline = "middle";
        ctx.fillText(`${c.icon} ${c.label}`, x + 16, y + 7.5);
        ctx.restore();
      });
    }

    // Stars (only when no ecosystem background image)
    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * CW, y: Math.random() * CH,
      r: Math.random() * 1.6 + 0.3,
      a: Math.random() * 0.4 + 0.06,
    }));

    // ── Render loop ────────────────────────────────────
    let animId, frame = 0, shimIdx = 0, shimTimer = 0;

    function render() {
      frame++;
      shimTimer++;
      if (shimTimer >= 6) { shimTimer = 0; shimIdx = (shimIdx + 1) % N; }

      ctx.clearRect(0, 0, CW, CH);

      // Stars (space background — only when no image)
      if (!hasImage) {
        stars.forEach(s => {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(160,185,255,${s.a})`;
          ctx.fill();
        });
      }

      // Path connections
      drawConnections();

      // All tiles except goal
      for (let i = 0; i < N - 1; i++) {
        drawTile(steps[i], i === shimIdx);
        drawActiveGlow(steps[i], frame);
      }

      // Goal tile on top
      drawGoalTile(steps[N - 1], frame);

      // START badge
      drawStartBadge(steps[0]);

      // Team tokens (above everything)
      drawTeamTokens(frame);

      // Legend
      drawLegend();

      animId = requestAnimationFrame(render);
    }

    render();
    return () => cancelAnimationFrame(animId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerSize, board, gridSize, hasImage]);

  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", touchAction: "pan-x pan-y" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block", background: "transparent" }}
      />
    </div>
  );
}

export default IsometricBoard;
