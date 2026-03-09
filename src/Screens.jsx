import { useState, useEffect, useRef, useMemo } from "react";
import { TEAM_COLORS, ROLES } from "./constants";
import { ECOSYSTEMS } from "./ecosystems";
import { GENESIS_Q } from "./utils";

function GenesisScreen({ teams, onStart }) {
  const [phase, setPhase] = useState(0); // 0=chaos 1=text 2=light 3=question
  const [activeTeams, setActiveTeams] = useState(teams);
  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [spinPhase, setSpinPhase] = useState("spin");
  const [sel, setSel] = useState(null);
  const spinDegRef = useRef(0);

  const chaosSymbols = ["✦","◆","▲","●","◉","⬟","⬡","⟐","⋆","✧","◈","⬢","⬣"];
  const chaosParticles = useMemo(()=>Array.from({length:60}).map((_,i)=>({
    left:`${(i*17.3)%100}%`, top:`${(i*13.7)%100}%`,
    sz: Math.round(8 + (i*7)%14),
    dur:`${3+(i*3)%5}s`, delay:`${(i*0.9)%4}s`,
    sym: chaosSymbols[i%chaosSymbols.length],
  })),[]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 3200);
    const t3 = setTimeout(() => setPhase(3), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const doSpin = () => {
    if (spinning || spinPhase !== "spin") return;
    setSpinning(true); setChosen(null);
    const n = activeTeams.length;
    const winIdx = Math.floor(Math.random() * n);
    const sd = 360 / n;
    const totalRot = spinDegRef.current + 1800 + (360 - (winIdx * sd + sd / 2)) - (spinDegRef.current % 360);
    spinDegRef.current = totalRot;
    setDeg(totalRot);
    setTimeout(() => {
      setSpinning(false);
      setChosen(activeTeams[winIdx]);
      setSpinPhase("question");
    }, 4200);
  };

  const answer = (idx) => {
    if (sel !== null) return;
    setSel(idx);
    if (idx === GENESIS_Q.a) {
      // Correct — find this team's original index and start game
      setTimeout(() => {
        const origIdx = teams.findIndex(t => t.id === chosen.id);
        onStart(origIdx >= 0 ? origIdx : 0);
      }, 1600);
    } else {
      // Wrong — remove from wheel and spin again
      setTimeout(() => {
        const remaining = activeTeams.filter(t => t.id !== chosen.id);
        const next = remaining.length > 0 ? remaining : [...teams]; // reset if all wrong
        setActiveTeams(next);
        setChosen(null); setSel(null); setSpinPhase("spin");
      }, 2000);
    }
  };

  const n = activeTeams.length;
  const conicParts = activeTeams.map((t, i) => `${TEAM_COLORS[t.colorIdx].bg} ${(i/n)*100}% ${((i+1)/n)*100}%`).join(", ");

  return (
    <div style={{minHeight:"100vh",background:"#000",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",fontFamily:"'Libre Baskerville',serif",overflow:"hidden auto",position:"relative",paddingBottom:40}}>
      {/* Chaos particles — memoized */}
      {chaosParticles.map((p,i)=>(
        <div key={i} style={{position:"fixed",left:p.left,top:p.top,fontSize:p.sz,color:"rgba(100,100,150,1)",animation:`chaosFloat ${p.dur} ease-in-out ${p.delay} infinite`,pointerEvents:"none",opacity:phase<2?1:0,transition:"opacity 2s ease"}}>
          {p.sym}
        </div>
      ))}
      {/* Light burst */}
      {phase>=2&&(
        <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 50% 40%, rgba(255,245,200,0.18) 0%, rgba(255,220,100,0.06) 40%, transparent 70%)",animation:"lightBurst 2s ease forwards",pointerEvents:"none"}} />
      )}

      {/* ── GENESIS TEXT ── */}
      <div style={{textAlign:"center",zIndex:10,padding:"60px 32px 0",maxWidth:700,width:"100%"}}>
        {phase>=1&&(
          <div style={{animation:"genesisReveal 2s ease forwards"}}>
            <div style={{fontSize:11,letterSpacing:"0.5em",color:"rgba(200,180,120,0.6)",marginBottom:24,textTransform:"uppercase"}}>Genesis 1:1</div>
            <p style={{fontSize:22,color:"rgba(255,245,210,0.92)",lineHeight:1.8,fontStyle:"italic",textShadow:"0 0 40px rgba(255,220,100,0.3)",marginBottom:8}}>
              "In the beginning God created<br/>the heavens and the earth."
            </p>
            <p style={{fontSize:14,color:"rgba(180,160,100,0.7)",lineHeight:1.7,marginTop:16}}>
              The earth was formless and empty,<br/>darkness was over the surface of the deep.
            </p>
          </div>
        )}
        {phase>=2&&(
          <div style={{marginTop:28,animation:"fadeUp 1.5s ease forwards"}}>
            <div style={{fontSize:36,marginBottom:4,animation:"float 3s ease-in-out infinite"}}>✨</div>
            <p style={{fontSize:13,color:"rgba(255,245,200,0.5)",letterSpacing:"0.3em",textTransform:"uppercase"}}>
              And God said — "Let there be light"
            </p>
          </div>
        )}
      </div>

      {/* ── QUESTION + SPINNER (phase 3) ── */}
      {phase>=3&&(
        <div style={{zIndex:10,width:"100%",maxWidth:560,padding:"0 20px",marginTop:36,animation:"fadeUp 0.8s ease"}}>
          {/* Divider */}
          <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(200,160,60,0.4),transparent)",marginBottom:32}} />

          {/* Question */}
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontSize:11,letterSpacing:"0.4em",color:"rgba(200,180,120,0.5)",marginBottom:10,textTransform:"uppercase"}}>Opening Question</div>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:19,color:"rgba(255,245,200,0.95)",lineHeight:1.5,fontWeight:700,margin:0}}>
              {GENESIS_Q.q}
            </p>
          </div>

          {/* Spinner */}
          {spinPhase==="spin"&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,marginBottom:24}}>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",letterSpacing:"0.2em"}}>
                {activeTeams.length < teams.length ? `Remaining teams: ${activeTeams.map(t=>t.name).join(", ")}` : "Spin the wheel to decide who answers"}
              </div>
              <div style={{position:"relative"}}>
                {/* Pointer */}
                <div style={{
                  position:"absolute",top:-20,left:"50%",transform:"translateX(-50%)",
                  zIndex:10,
                  width:0,height:0,
                  borderLeft:"10px solid transparent",
                  borderRight:"10px solid transparent",
                  borderTop:"22px solid rgba(255,220,100,0.95)",
                  filter:"drop-shadow(0 2px 8px rgba(255,220,100,0.7))",
                }} />
                <div style={{width:240,height:240,borderRadius:"50%",background:`conic-gradient(${conicParts})`,transform:`rotate(${deg}deg)`,transition:spinning?"transform 4.2s cubic-bezier(0.17,0.67,0.12,1)":"none",border:"3px solid rgba(255,255,255,0.15)",position:"relative",boxShadow:"0 0 40px rgba(200,160,60,0.2), 0 0 80px rgba(200,160,60,0.08)"}}>
                  {activeTeams.map((t,i)=>{
                    const angle=(i/n+0.5/n)*360-90, rad=angle*Math.PI/180;
                    return(
                      <div key={t.id} style={{position:"absolute",left:120+85*Math.cos(rad),top:120+85*Math.sin(rad),transform:"translate(-50%,-50%)",pointerEvents:"none",textAlign:"center"}}>
                        <div style={{fontFamily:"'Cinzel',serif",fontSize:9,fontWeight:700,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.9)",whiteSpace:"nowrap",maxWidth:60,overflow:"hidden",textOverflow:"ellipsis"}}>{t.name}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:44,height:44,borderRadius:"50%",background:"#050508",border:"2px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,zIndex:5}}>📖</div>
              </div>
              <button onClick={doSpin} disabled={spinning} style={{
                padding:"13px 48px",
                background:spinning?"rgba(255,255,255,0.04)":"linear-gradient(135deg,rgba(200,160,60,0.35),rgba(255,220,100,0.25))",
                border:`1.5px solid ${spinning?"rgba(255,255,255,0.1)":"rgba(200,160,60,0.5)"}`,
                borderRadius:12,
                color:spinning?"rgba(255,255,255,0.3)":"rgba(255,245,200,0.95)",
                fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13,
                cursor:spinning?"not-allowed":"pointer",
                letterSpacing:"0.15em",
                boxShadow:spinning?"none":"0 0 24px rgba(200,160,60,0.25)",
                transition:"all 0.25s",
              }}>
                {spinning?"Spinning…":"⚡ SPIN"}
              </button>
            </div>
          )}

          {/* Answer phase */}
          {spinPhase==="question"&&chosen&&(
            <div style={{animation:"fadeUp 0.5s ease"}}>
              <div style={{textAlign:"center",marginBottom:16}}>
                <div style={{display:"inline-flex",alignItems:"center",gap:10,background:`rgba(0,0,0,0.4)`,border:`1px solid ${TEAM_COLORS[chosen.colorIdx].bg}44`,borderRadius:12,padding:"10px 20px"}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:TEAM_COLORS[chosen.colorIdx].bg,boxShadow:`0 0 8px ${TEAM_COLORS[chosen.colorIdx].bg}`}} />
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:14,color:TEAM_COLORS[chosen.colorIdx].light,fontWeight:700}}>{chosen.name}</span>
                  <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>answers</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                {GENESIS_Q.opts.map((opt,i)=>{
                  let bg="rgba(255,255,255,0.07)",border="1px solid rgba(255,255,255,0.12)",color="rgba(255,255,255,0.85)";
                  if(sel!==null){
                    if(i===GENESIS_Q.a){bg="rgba(22,163,74,0.25)";border="1.5px solid #22c55e";color="#4ade80";}
                    else if(i===sel){bg="rgba(239,68,68,0.2)";border="1.5px solid #ef4444";color="#f87171";}
                  }
                  return(
                    <button key={i} onClick={()=>answer(i)} style={{background:bg,border,borderRadius:12,padding:"14px 16px",color,fontFamily:"'Libre Baskerville',serif",fontSize:14,cursor:sel!==null?"default":"pointer",transition:"all 0.2s",textAlign:"center"}}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {sel===GENESIS_Q.a&&(
                <div style={{textAlign:"center",animation:"popIn 0.4s ease"}}>
                  <div style={{fontSize:13,color:"#4ade80",fontStyle:"italic",marginBottom:4}}>✓ Correct!</div>
                  <div style={{fontSize:11,color:"rgba(200,180,120,0.6)"}}>{GENESIS_Q.ref}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:6,letterSpacing:"0.2em"}}>STARTING EXPLORATION…</div>
                </div>
              )}
              {sel!==null&&sel!==GENESIS_Q.a&&(
                <div style={{textAlign:"center",animation:"popIn 0.4s ease"}}>
                  <div style={{fontSize:13,color:"#f87171",marginBottom:4}}>✗ Incorrect — {chosen.name} loses their turn</div>
                  <div style={{fontSize:11,color:"rgba(200,180,120,0.5)"}}>{GENESIS_Q.ref}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:6,letterSpacing:"0.2em"}}>GIRANDO DE NUEVO…</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ROLES SCREEN ────────────────────────────────────
function RolesScreen({ teams, onDone }) {
  const maxSize = Math.max(...teams.map(t=>(t.players||[]).filter(p=>p.trim()).length), 5);
  const activeRoles = ROLES.filter(r=>r.minTeam<=maxSize);
  // idx: -1=intro, 0..n-1=role cards, n=summary, n+1=assign
  const SUMMARY_IDX = activeRoles.length;
  const ASSIGN_IDX  = activeRoles.length + 1;
  const [idx, setIdx] = useState(-1);
  const isIntro   = idx === -1;
  const isSummary = idx === SUMMARY_IDX;
  const isAssign  = idx === ASSIGN_IDX;
  const role      = (!isIntro && !isSummary && !isAssign) ? activeRoles[idx] : null;

  // ── Responsive ─────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 700);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 700);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  // assignments[teamId][roleId] = playerName
  const [assignments, setAssignments] = useState(()=>{
    const a={};
    teams.forEach(t=>{a[t.id]={};});
    return a;
  });
  const [activeTeamTab, setActiveTeamTab] = useState(teams[0]?.id??0);

  const setAssignment=(teamId,roleId,player)=>{
    setAssignments(prev=>({...prev,[teamId]:{...prev[teamId],[roleId]:player}}));
  };

  const [showError, setShowError] = useState(false);
  const [errorTeams, setErrorTeams] = useState([]);

  const teamIsComplete = (t) =>
    activeRoles.every(r => (assignments[t.id]||{})[r.id]?.trim());

  const incompleteTeams = teams.filter(t => !teamIsComplete(t));

  const handleDone=()=>{
    if(incompleteTeams.length > 0){
      setErrorTeams(incompleteTeams.map(t=>t.name));
      setShowError(true);
      setActiveTeamTab(incompleteTeams[0].id);
      return;
    }
    const updatedTeams=teams.map(t=>({...t,roleAssignments:assignments[t.id]||{}}));
    onDone(updatedTeams);
  };

  const teamForTab = teams.find(t=>t.id===activeTeamTab)||teams[0];
  const teamPlayers = (teamForTab?.players||[]).filter(p=>p.trim());
  const teamAssignments = assignments[teamForTab?.id]||{};

  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 30% 20%,#0d1a0e,#020407 60%)",fontFamily:"'Libre Baskerville',serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px",position:"relative",overflow:"hidden"}}>
      {Array.from({length:30}).map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${(i*37)%100}%`,top:`${(i*53)%100}%`,width:2,height:2,borderRadius:"50%",background:"#fff",opacity:0.2,animation:`twinkle ${2+i%3}s ease-in-out ${i%4}s infinite`,pointerEvents:"none"}} />
      ))}

      {/* ── INTRO ── */}
      {isIntro&&(
        <div style={{textAlign:"center",maxWidth:640,animation:"fadeUp 0.7s ease"}}>
          <div style={{fontSize:52,marginBottom:12,animation:"float 3s ease-in-out infinite",filter:"drop-shadow(0 0 20px rgba(74,222,128,0.5))"}}>⚜️</div>
          <div style={{fontSize:11,color:"#4ade80",letterSpacing:"0.3em",marginBottom:8}}>GUARDIANS OF THE GARDEN</div>
          <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:22,color:"#fff",marginBottom:16,textShadow:"0 0 30px rgba(74,222,128,0.4)"}}>The Guardian Roles</h2>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:14,lineHeight:1.8,marginBottom:14}}>
            Each Guardian carries a unique mission — inspired by a figure from Scripture — and owns a specific type of challenge on the board.
          </p>
          <div style={{background:"rgba(253,224,71,0.06)",border:"1px solid rgba(253,224,71,0.2)",borderRadius:14,padding:"14px 18px",marginBottom:28,display:"flex",alignItems:"flex-start",gap:12}}>
            <span style={{fontSize:22,flexShrink:0}}>🎖️</span>
            <p style={{color:"rgba(255,255,255,0.65)",fontSize:13,lineHeight:1.7,margin:0,textAlign:"left"}}>
              Your teacher will give each student a <strong style={{color:"#fde047"}}>Guardian Medal</strong> with their role.<br/>
              As each role is presented, listen carefully for yours. You will own that challenge type for the entire game.
            </p>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:32}}>
            {activeRoles.map(r=>(
              <div key={r.id} style={{background:`${r.color}15`,border:`1px solid ${r.color}40`,borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{r.emoji}</span>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:r.color}}>{r.name}</span>
              </div>
            ))}
          </div>
          <button onClick={()=>setIdx(0)} style={{padding:"13px 40px",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:12,color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:"0.1em",boxShadow:"0 6px 20px rgba(22,163,74,0.4)"}}>
            Meet the Guardians →
          </button>
        </div>
      )}

      {/* ── ROLE CARD ── */}
      {role&&(
        <div style={{width:"100%",maxWidth:920,animation:"fadeUp 0.45s ease"}}>
          <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:18}}>
            {activeRoles.map((_,i)=>(
              <div key={i} onClick={()=>setIdx(i)}
                style={{height:8,borderRadius:4,background:i===idx?activeRoles[i].color:i<idx?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.06)",width:i===idx?28:8,transition:"all 0.3s",cursor:"pointer"}} />
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"300px 1fr",gap:0,background:"rgba(0,0,0,0.45)",border:`2px solid ${role.color}30`,borderRadius:20,overflow:"hidden",boxShadow:`0 0 60px ${role.color}15`}}>
            <div style={{position:"relative",minHeight:isMobile?200:460}}>
              <img src={role.img} alt={role.biblical}
                onError={e=>{e.target.style.display="none";const fb=e.target.parentNode.querySelector(".img-fallback");if(fb)fb.style.display="flex";}}
                style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",filter:"brightness(0.82) saturate(1.15)",display:"block"}} />
              <div className="img-fallback" style={{display:"none",position:"absolute",inset:0,background:`radial-gradient(ellipse at center,${role.color}25,#000)`,alignItems:"center",justifyContent:"center",fontSize:90}}>{role.emoji}</div>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,transparent 55%,rgba(0,0,0,0.6) 100%)"}} />
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 40%)"}} />
              <div style={{position:"absolute",bottom:18,left:16,right:8}}>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:"0.25em",marginBottom:3}}>INSPIRED BY</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"#fff",fontWeight:700,textShadow:"0 1px 6px rgba(0,0,0,0.9)"}}>{role.biblical}</div>
                <div style={{fontSize:11,color:role.color,fontStyle:"italic",marginTop:3}}>{role.ref}</div>
              </div>
            </div>
            <div style={{padding:"28px 26px 24px 22px",display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.28em",marginBottom:6}}>GUARDIAN {idx+1} OF {activeRoles.length}</div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:5}}>
                  <span style={{fontSize:38,filter:`drop-shadow(0 0 12px ${role.color}88)`}}>{role.emoji}</span>
                  <div>
                    <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:20,color:role.color,margin:0,textShadow:`0 0 20px ${role.color}55`}}>{role.name}</h2>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:"0.18em",marginTop:3}}>{role.sciRole.toUpperCase()}</div>
                  </div>
                </div>
              </div>
              <div style={{background:"rgba(255,255,255,0.03)",borderLeft:`3px solid ${role.color}70`,borderRadius:"0 10px 10px 0",padding:"12px 16px"}}>
                <p style={{fontStyle:"italic",color:"rgba(255,245,200,0.88)",fontSize:13,lineHeight:1.75,margin:0}}>{role.scripture}</p>
                <p style={{fontSize:11,color:role.color,margin:"7px 0 0",letterSpacing:"0.08em"}}>— {role.ref}</p>
              </div>
              <div style={{background:`${role.color}10`,border:`1.5px solid ${role.color}28`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{fontSize:22}}>{role.challengeIcon}</span>
                  <div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.38)",letterSpacing:"0.2em"}}>THIS GUARDIAN OWNS</div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:15,color:role.color,fontWeight:700}}>{role.challengeLabel}</div>
                  </div>
                </div>
                <p style={{color:"rgba(255,255,255,0.7)",fontSize:12,lineHeight:1.65,margin:0}}>{role.howToPlay}</p>
              </div>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <span style={{fontSize:16,flexShrink:0,marginTop:1}}>🌱</span>
                <div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.32)",letterSpacing:"0.2em",marginBottom:3}}>VIRTUE TO DEVELOP</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.8)",fontStyle:"italic"}}>{role.virtue}</div>
                </div>
              </div>
              {role.minTeam>5&&(
                <div style={{background:"rgba(253,224,71,0.07)",border:"1px solid rgba(253,224,71,0.18)",borderRadius:10,padding:"8px 13px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14}}>🔓</span>
                  <span style={{fontSize:11,color:"#fde047"}}>Unlocked in teams of <strong>{role.minTeam}+</strong> students</span>
                </div>
              )}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:14}}>
            <button onClick={()=>setIdx(i=>i-1)} style={{padding:"11px 24px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.55)",fontFamily:"'Cinzel',serif",fontSize:12,cursor:"pointer"}}>← Back</button>
            <button onClick={()=>setIdx(i=>i+1)} style={{padding:"11px 30px",background:`linear-gradient(135deg,${role.color}99,${role.color}66)`,border:`1px solid ${role.color}44`,borderRadius:10,color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:12,cursor:"pointer",letterSpacing:"0.08em",boxShadow:`0 4px 16px ${role.color}33`}}>
              {idx<activeRoles.length-1?"Next Guardian →":"See Summary →"}
            </button>
          </div>
        </div>
      )}

      {/* ── SUMMARY ── */}
      {isSummary&&(
        <div style={{width:"100%",maxWidth:820,animation:"fadeUp 0.5s ease"}}>
          <div style={{textAlign:"center",marginBottom:22}}>
            <div style={{fontSize:9,color:"#4ade80",letterSpacing:"0.3em",marginBottom:6}}>ALL GUARDIANS</div>
            <h3 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:"#fff",margin:0,textShadow:"0 0 20px rgba(74,222,128,0.3)"}}>Guardian Summary</h3>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:6}}>Tap any card to review a role before assigning</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:10,marginBottom:24}}>
            {activeRoles.map((r,i)=>(
              <div key={r.id} onClick={()=>setIdx(i)}
                style={{background:`${r.color}0d`,border:`1.5px solid ${r.color}30`,borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"all 0.2s",display:"flex",gap:12,alignItems:"center"}}>
                <span style={{fontSize:30,flexShrink:0,filter:`drop-shadow(0 0 8px ${r.color}66)`}}>{r.emoji}</span>
                <div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:r.color,fontWeight:700}}>{r.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.42)",marginTop:2}}>{r.challengeIcon} {r.challengeLabel}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",marginTop:1,fontStyle:"italic"}}>{r.biblical}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center"}}>
            <button onClick={()=>setIdx(ASSIGN_IDX)} style={{padding:"14px 48px",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:14,color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:14,cursor:"pointer",letterSpacing:"0.12em",boxShadow:"0 8px 30px rgba(124,58,237,0.5)"}}>
              Assign Players to Roles →
            </button>
          </div>
        </div>
      )}

      {/* ── ASSIGN ── */}
      {isAssign&&(
        <div style={{width:"100%",maxWidth:860,animation:"fadeUp 0.5s ease"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:9,color:"#a78bfa",letterSpacing:"0.3em",marginBottom:6}}>STEP: ASSIGN GUARDIANS</div>
            <h3 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:"#fff",margin:0}}>Who is each Guardian?</h3>
            <p style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:6}}>Assign one player per role for each team</p>
          </div>

          {/* Team tabs */}
          {teams.length>1&&(
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:18}}>
              {teams.map(t=>{
                const tc=TEAM_COLORS[t.colorIdx];
                const isActive=t.id===activeTeamTab;
                return(
                  <button key={t.id} onClick={()=>setActiveTeamTab(t.id)}
                    style={{padding:"8px 18px",background:isActive?`${tc.bg}33`:"rgba(255,255,255,0.04)",border:`2px solid ${isActive?tc.bg:"rgba(255,255,255,0.1)"}`,borderRadius:10,color:isActive?tc.light:"rgba(255,255,255,0.5)",fontFamily:"'Cinzel',serif",fontSize:11,cursor:"pointer",transition:"all 0.2s",fontWeight:isActive?700:400}}>
                    <span style={{marginRight:6}}>●</span>{t.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Role assignment grid */}
          <div style={{background:"rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,padding:"20px 18px",marginBottom:20}}>
            {teamPlayers.length===0?(
              <p style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:13}}>No players registered for this team.</p>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {activeRoles.map(r=>{
                  const assigned=teamAssignments[r.id]||"";
                  return(
                    <div key={r.id} style={{display:"grid",gridTemplateColumns:"44px 1fr 1fr",gap:12,alignItems:"center",background:assigned?`${r.color}0d`:"rgba(255,255,255,0.02)",border:`1.5px solid ${assigned?r.color+"40":"rgba(255,255,255,0.06)"}`,borderRadius:12,padding:"10px 14px",transition:"all 0.25s"}}>
                      {/* Role */}
                      <span style={{fontSize:26,textAlign:"center",filter:assigned?`drop-shadow(0 0 8px ${r.color}88)`:"none"}}>{r.emoji}</span>
                      <div>
                        <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:assigned?r.color:"rgba(255,255,255,0.6)",fontWeight:700}}>{r.name}</div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginTop:1}}>{r.challengeIcon} {r.challengeLabel}</div>
                      </div>
                      {/* Player selector */}
                      <select
                        value={assigned}
                        onChange={e=>setAssignment(teamForTab.id,r.id,e.target.value)}
                        style={{background:"rgba(0,0,0,0.5)",border:`1.5px solid ${assigned?r.color+"55":"rgba(255,255,255,0.12)"}`,borderRadius:9,padding:"8px 10px",color:assigned?"#fff":"rgba(255,255,255,0.4)",fontFamily:"'Cinzel',serif",fontSize:12,cursor:"pointer",outline:"none",width:"100%"}}>
                        <option value="">— Select player —</option>
                        {teamPlayers.map(p=>(
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error notification */}
          {showError&&(
            <div style={{background:"rgba(239,68,68,0.12)",border:"1.5px solid rgba(239,68,68,0.5)",borderRadius:14,padding:"14px 18px",marginBottom:16,animation:"popIn 0.35s ease",display:"flex",gap:12,alignItems:"flex-start"}}>
              <span style={{fontSize:22,flexShrink:0}}>⚠️</span>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"#f87171",fontWeight:700,marginBottom:4}}>All roles must be assigned before starting</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>
                  {errorTeams.length===1
                    ? <><strong style={{color:"#fca5a5"}}>{errorTeams[0]}</strong> still has unassigned roles. Please complete the assignment above.</>
                    : <>The following teams still have unassigned roles: <strong style={{color:"#fca5a5"}}>{errorTeams.join(", ")}</strong>. Use the tabs above to complete each team.</>
                  }
                </div>
                <div style={{marginTop:8,display:"flex",gap:6,flexWrap:"wrap"}}>
                  {teams.map(t=>{
                    const complete=teamIsComplete(t);
                    const tc=TEAM_COLORS[t.colorIdx];
                    return(
                      <div key={t.id} onClick={()=>{setActiveTeamTab(t.id);setShowError(false);}}
                        style={{display:"flex",alignItems:"center",gap:5,background:complete?"rgba(34,197,94,0.12)":"rgba(239,68,68,0.1)",border:`1px solid ${complete?"rgba(34,197,94,0.4)":"rgba(239,68,68,0.35)"}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",fontSize:11,color:complete?"#4ade80":"#f87171"}}>
                        <span>{complete?"✓":"✗"}</span>
                        <span style={{fontFamily:"'Cinzel',serif",color:complete?"#4ade80":tc.light}}>{t.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={()=>{setIdx(SUMMARY_IDX);setShowError(false);}} style={{padding:"11px 24px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.5)",fontFamily:"'Cinzel',serif",fontSize:12,cursor:"pointer"}}>← Back</button>
            <button onClick={handleDone} style={{padding:"13px 44px",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:12,color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:"0.1em",boxShadow:"0 6px 24px rgba(22,163,74,0.45)"}}>
              🚀 Begin the Adventure
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


// ── WELCOME SCREEN ──────────────────────────────────
function WelcomeScreen({ onEnter }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 150),   // quote
      setTimeout(() => setStep(2), 600),   // leaf emoji
      setTimeout(() => setStep(3), 1000),  // tagline + title
      setTimeout(() => setStep(4), 1500),  // divider + subtitle
      setTimeout(() => setStep(5), 2100),  // button
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const vis = (minStep, delay="0s") => ({
    opacity: step >= minStep ? 1 : 0,
    transform: step >= minStep ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
    transition: `opacity 0.7s ease ${delay}, transform 0.7s cubic-bezier(0.34,1.3,0.64,1) ${delay}`,
  });

  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 30%,#071a0e 0%,#020407 65%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Libre Baskerville',serif",padding:"32px 20px",position:"relative",overflow:"hidden"}}>
      {/* Stars */}
      {Array.from({length:60}).map((_,i)=>(
        <div key={i} style={{position:"absolute",left:`${(i*43+7)%100}%`,top:`${(i*61+11)%100}%`,width:i%7===0?3:i%3===0?2:1,height:i%7===0?3:i%3===0?2:1,borderRadius:"50%",background:"#fff",opacity:i%3===0?0.4:0.15,animation:`twinkle ${2+i%4}s ease-in-out ${(i%5)*0.8}s infinite`,pointerEvents:"none"}} />
      ))}
      {/* Subtle green top/bottom accents */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,rgba(74,222,128,0.5),rgba(253,224,71,0.35),rgba(74,222,128,0.5),transparent)"}} />
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"2px",background:"linear-gradient(90deg,transparent,rgba(74,222,128,0.5),rgba(253,224,71,0.35),rgba(74,222,128,0.5),transparent)"}} />
      {/* Ambient glow behind center content */}
      <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:"50vw",height:"50vh",background:"radial-gradient(ellipse,rgba(74,222,128,0.06) 0%,transparent 70%)",pointerEvents:"none"}} />

      <div style={{textAlign:"center",maxWidth:600,display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>

        {/* Scripture quote */}
        <div style={{...vis(1),marginBottom:32,padding:"18px 24px",background:"rgba(253,224,71,0.04)",border:"1px solid rgba(253,224,71,0.16)",borderRadius:16,maxWidth:480,backdropFilter:"blur(4px)"}}>
          <p style={{fontStyle:"italic",color:"rgba(255,245,200,0.85)",fontSize:13,lineHeight:1.9,margin:0}}>
            "Then the Lord God provided a gourd and made it grow up over Jonah to give shade over his head and to deliver him from his discomfort. And Jonah was very glad about the gourd."
          </p>
          <p style={{fontSize:11,color:"rgba(253,224,71,0.65)",marginTop:10,letterSpacing:"0.12em",margin:"10px 0 0"}}>— Jonah 4:6</p>
        </div>

        {/* Leaf emoji */}
        <div style={{...vis(2),fontSize:52,marginBottom:12,filter:"drop-shadow(0 0 32px rgba(74,222,128,0.65))",animation:step>=2?"float 4s ease-in-out infinite":"none",display:"block"}}>🌿</div>

        {/* Tagline + title */}
        <div style={{...vis(3)}}>
          <div style={{fontSize:10,color:"#4ade80",letterSpacing:"0.45em",marginBottom:10,fontFamily:"'Cinzel',serif"}}>7TH GRADE SCIENCE · ECOSYSTEMS</div>
          <h1 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(22px,3.8vw,34px)",color:"#fff",letterSpacing:"0.06em",textShadow:"0 0 48px rgba(74,222,128,0.5)",marginBottom:0,lineHeight:1.25}}>
            GUARDIANS<br/>OF THE GARDEN
          </h1>
        </div>

        {/* Divider + subtitle */}
        <div style={{...vis(4),width:"100%",display:"flex",flexDirection:"column",alignItems:"center",marginTop:16}}>
          <div style={{width:70,height:1.5,background:"linear-gradient(90deg,transparent,#4ade80,#fde04788,transparent)",margin:"0 auto 18px"}} />
          <p style={{color:"rgba(255,255,255,0.42)",fontSize:13,lineHeight:1.85,maxWidth:400,margin:0}}>
            Every organism is a gourd — placed by God with deliberate purpose, sustaining life in ways we don't notice until it's gone.
          </p>
        </div>

        {/* CTA button */}
        <div style={{...vis(5),marginTop:32}}>
          <button
            onClick={onEnter}
            style={{
              padding:"15px 54px",
              background:"linear-gradient(135deg,#16a34a,#15803d)",
              border:"none",borderRadius:14,
              color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:14,
              cursor:"pointer",letterSpacing:"0.12em",
              animation:step>=5?"pulseGlow 2.4s ease-in-out infinite":"none",
            }}
          >
            Enter the Garden →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── NARRATIVE SCREEN ─────────────────────────────────
function NarrativeScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const STORY = [
    {t:"In the beginning, God looked at everything He had made — and it was very good.",b:true},
    {t:"Deserts, rainforests, oceans, savannas — each one a living masterpiece. Not random. Not accidental. Each organism placed with precision: producers capturing sunlight, consumers transferring energy, decomposers returning life to the soil. Every food chain a sentence in God's language. Every ecosystem a chapter of His story."},
    {t:"But something has gone wrong.",b:true},
    {t:"The gourds are withering.",i:true},
    {t:"Seven ecosystems across the Earth are under threat — not just from pollution or climate change, but from something deeper: the loss of wonder. The moment humans stopped seeing creation as sacred, they stopped protecting it."},
    {t:"You have been chosen as Guardians of the Garden.",b:true},
    {t:"Your mission is not just scientific. It is moral. It is spiritual. To restore each ecosystem, your team must do two things: understand the science deeply enough to see how it works, and grow enough as human beings to deserve the responsibility of caring for it."},
    {t:"Because God is watching, just as He watched Jonah. And He is asking the same question He asked then:",i:true},
    {t:"Should I not be concerned about this ecosystem — where thousands of creatures live, who cannot save themselves without a Guardian?",b:true,i:true},
  ];
  const TABLE = [
    {science:"Every organism occupies a trophic level and has a function in energy flow.",bridge:"Remove one organism → the whole chain collapses.",spirit:"Every person, every act of stewardship, every moral choice — matters to the whole."},
    {science:"Producers capture energy. Without them, no life is possible.",bridge:"The gourd was a producer. Its absence devastated Jonah.",spirit:"Small, quiet acts of goodness — like the gourd — are often the most powerful."},
    {science:"Biodiversity makes ecosystems resilient. Less diversity = more fragility.",bridge:"One withered plant changed Jonah's entire experience of the world.",spirit:"Our moral and spiritual health directly affects the world around us — always."},
  ];
  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 40% 20%,#071a0e,#020407 70%)",fontFamily:"'Libre Baskerville',serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"48px 20px 60px"}}>
      {Array.from({length:30}).map((_,i)=>(
        <div key={i} style={{position:"fixed",left:`${(i*37)%100}%`,top:`${(i*61)%100}%`,width:2,height:2,borderRadius:"50%",background:"#fff",opacity:0.15,animation:`twinkle ${2+i%3}s ease-in-out ${i%4}s infinite`,pointerEvents:"none",zIndex:0}} />
      ))}
      <button onClick={onDone} style={{position:"absolute",top:16,right:20,background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"rgba(255,255,255,0.35)",fontFamily:"'Cinzel',serif",fontSize:11,padding:"6px 14px",cursor:"pointer",letterSpacing:"0.1em",zIndex:10}} title="Skip narrative">Skip →</button>
      <div style={{display:"flex",gap:8,marginBottom:22,alignItems:"center"}}>
        {["The Story","The Why"].map((label,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div onClick={()=>{ if(i<step) setStep(i); }} style={{display:"flex",alignItems:"center",gap:6,cursor:i<step?"pointer":"default",opacity:i<=step?1:0.4,transition:"all 0.3s"}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:i<=step?"#22c55e":"rgba(255,255,255,0.08)",border:`2px solid ${i<=step?"#22c55e":"rgba(255,255,255,0.15)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i<=step?"#fff":"rgba(255,255,255,0.3)",fontFamily:"'Cinzel',serif"}}>{i+1}</div>
              <span style={{fontSize:11,color:i<=step?"#86efac":"rgba(255,255,255,0.3)",letterSpacing:"0.1em",fontFamily:"'Cinzel',serif"}}>{label}</span>
            </div>
            {i<1&&<div style={{width:28,height:1,background:"rgba(255,255,255,0.1)"}} />}
          </div>
        ))}
      </div>
      {step===0&&(
        <div style={{maxWidth:640,width:"100%",animation:"slowFade 0.6s ease"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:11,color:"#4ade80",letterSpacing:"0.3em",marginBottom:6}}>THE OPENING NARRATIVE</div>
            <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:"#fff",marginBottom:0}}>The Garden is in Danger</h2>
          </div>
          <div style={{background:"rgba(0,0,0,0.4)",border:"1px solid rgba(74,222,128,0.15)",borderRadius:20,padding:"24px 26px",maxHeight:"52vh",overflowY:"auto",marginBottom:18}}>
            {STORY.map((p,i)=>(
              <p key={i} style={{
                color:p.b&&p.i?"rgba(255,245,200,0.95)":p.b?"#fff":p.i?"rgba(255,245,200,0.85)":"rgba(255,255,255,0.72)",
                fontSize:p.b&&!p.i?15:13,fontWeight:p.b?700:400,fontStyle:p.i?"italic":"normal",
                lineHeight:1.9,marginBottom:16,
                animation:`staggerIn 0.55s cubic-bezier(0.34,1.2,0.64,1) ${i*0.1}s both`,
                borderLeft: p.b&&p.i ? "2px solid rgba(253,224,71,0.35)" : p.b ? "2px solid rgba(74,222,128,0.3)" : "none",
                paddingLeft: p.b ? "12px" : "0",
              }}>{p.t}</p>
            ))}
          </div>
          <div style={{textAlign:"right"}}>
            <button onClick={()=>setStep(1)} style={{padding:"12px 36px",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:12,color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:"0.1em",boxShadow:"0 6px 20px rgba(22,163,74,0.4)"}}>The Why →</button>
          </div>
        </div>
      )}
      {step===1&&(
        <div style={{maxWidth:860,width:"100%",animation:"slowFade 0.6s ease"}}>
          <div style={{textAlign:"center",marginBottom:18}}>
            <div style={{fontSize:11,color:"#fbbf24",letterSpacing:"0.3em",marginBottom:6}}>WHY THIS GAME EXISTS</div>
            <h2 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:"#fff",marginBottom:8}}>The Gourd of Jonah</h2>
            <p style={{color:"rgba(255,255,255,0.45)",fontSize:12,maxWidth:500,margin:"0 auto",lineHeight:1.7}}>The most profound lesson of Jonah comes not from the whale — but from a single plant. Every organism in every ecosystem is a gourd: placed by God with deliberate purpose.</p>
          </div>
          <div style={{background:"rgba(253,224,71,0.05)",border:"1px solid rgba(253,224,71,0.2)",borderRadius:14,padding:"14px 20px",marginBottom:18,textAlign:"center"}}>
            <p style={{fontStyle:"italic",color:"rgba(255,245,200,0.85)",fontSize:13,lineHeight:1.8,margin:0}}>"You had compassion on the plant for which you did not work… And should I not have compassion on Nineveh, the great city, in which there are more than 120,000 persons — and also many animals?"</p>
            <p style={{fontSize:11,color:"rgba(253,224,71,0.7)",marginTop:8,letterSpacing:"0.08em"}}>— Jonah 4:10–11</p>
          </div>
          <div style={{borderRadius:16,overflow:"hidden",border:"1px solid rgba(255,255,255,0.07)",marginBottom:20,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
            <div style={{minWidth:520}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:"rgba(0,0,0,0.5)"}}>
              {[{label:"🔬 Scientific Truth",color:"#38bdf8"},{label:"🌿 The Bridge",color:"#4ade80"},{label:"✝️ Spiritual Truth",color:"#fbbf24"}].map((h,i)=>(
                <div key={i} style={{padding:"12px 16px",borderRight:i<2?"1px solid rgba(255,255,255,0.07)":"none",textAlign:"center"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:h.color,letterSpacing:"0.12em",fontWeight:700}}>{h.label}</div>
                </div>
              ))}
            </div>
            {TABLE.map((row,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",background:i%2===0?"rgba(255,255,255,0.02)":"rgba(0,0,0,0.2)",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{padding:"13px 16px",borderRight:"1px solid rgba(255,255,255,0.05)",fontSize:12,color:"rgba(147,197,253,0.85)",lineHeight:1.65}}>{row.science}</div>
                <div style={{padding:"13px 16px",borderRight:"1px solid rgba(255,255,255,0.05)",fontSize:12,color:"rgba(134,239,172,0.85)",lineHeight:1.65,fontStyle:"italic"}}>{row.bridge}</div>
                <div style={{padding:"13px 16px",fontSize:12,color:"rgba(253,224,71,0.8)",lineHeight:1.65}}>{row.spirit}</div>
              </div>
            ))}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <button onClick={()=>setStep(0)} style={{padding:"11px 24px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"rgba(255,255,255,0.5)",fontFamily:"'Cinzel',serif",fontSize:12,cursor:"pointer"}}>← Back</button>
            <button onClick={onDone} style={{padding:"13px 44px",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:12,color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13,cursor:"pointer",letterSpacing:"0.1em",boxShadow:"0 6px 24px rgba(22,163,74,0.45)"}}>
              🛡️ Choose Your Ecosystem →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SetupScreen({ onStart }) {
  const [step, setStep] = useState(0);
  const [eco, setEco] = useState(null);
  const [numTeams, setNumTeams] = useState(2);
  const [teams, setTeams] = useState([]);
  const [editing, setEditing] = useState({ idx:0, name:"Team 1", players:[""] });
  const ecoList = Object.values(ECOSYSTEMS).sort((a,b)=>a.difficulty-b.difficulty);
  const diffColors = {1:"#4ade80",2:"#86efac",3:"#fbbf24",4:"#f97316",5:"#f87171"};
  const diffIcons  = {1:"🌱",2:"🌿",3:"🌳",4:"⚡",5:"🔥"};

  // ── Responsive ─────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const stars = useMemo(()=>Array.from({length:44}).map((_,i)=>({
    left:`${(i*43+7)%100}%`, top:`${(i*61+11)%100}%`,
    sz: i%9===0?3:i%4===0?2:1.5,
    op: i%3===0?0.4:0.18,
    dur:`${2+i%4}s`, delay:`${(i%5)*0.9}s`,
  })),[]);

  const initTeams = n => {
    const t = Array.from({length:n},(_,i)=>({id:i,name:`Team ${i+1}`,players:[""],colorIdx:i}));
    setTeams(t); setEditing({idx:0,name:t[0].name,players:[""]}); setNumTeams(n);
  };
  const saveEditing = () => {
    const cleaned = editing.players.filter(p=>p.trim());
    setTeams(prev=>prev.map((t,i)=>i===editing.idx?{...t,name:editing.name||t.name,players:cleaned.length?cleaned:t.players}:t));
  };
  const canProceed = step===0?eco:step===1?numTeams>=2:teams.every(t=>t.players.filter(p=>p.trim()).length>0);

  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 30% 20%,#0d1a0e,#020407 60%)",fontFamily:"'Libre Baskerville',serif",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",position:"relative",overflow:"hidden"}}>
      {stars.map((s,i)=>(
        <div key={i} style={{position:"absolute",left:s.left,top:s.top,width:s.sz,height:s.sz,borderRadius:"50%",background:"#fff",opacity:s.op,animation:`twinkle ${s.dur} ease-in-out ${s.delay} infinite`,pointerEvents:"none"}} />
      ))}
      <div style={{textAlign:"center",marginBottom:36,animation:"fadeUp 0.7s ease"}}>
        <div style={{fontSize:56,marginBottom:8,animation:"float 3s ease-in-out infinite",filter:"drop-shadow(0 0 20px rgba(34,197,94,0.5))"}}>🌍</div>
        <h1 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:24,color:"#fff",letterSpacing:"0.08em",textShadow:"0 0 30px rgba(74,222,128,0.4)"}}>GUARDIANS OF THE GARDEN</h1>
        <div style={{fontSize:11,color:"#4ade80",letterSpacing:"0.3em",marginTop:4}}>BOARD GAME · 36–72 SQUARES · 7TH GRADE</div>
      </div>
      {/* Step indicator */}
      <div style={{display:"flex",gap:8,marginBottom:32}}>
        {["Ecosystem","Teams","Players"].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:i<=step?"#22c55e":"rgba(255,255,255,0.08)",border:`2px solid ${i<=step?"#22c55e":"rgba(255,255,255,0.15)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:i<=step?"#fff":"rgba(255,255,255,0.3)",fontFamily:"'Cinzel',serif",transition:"all 0.4s"}}>{i<step?"✓":i+1}</div>
            <span style={{fontSize:11,color:i<=step?"#86efac":"rgba(255,255,255,0.3)",letterSpacing:"0.1em",transition:"color 0.4s"}}>{s}</span>
            {i<2&&<div style={{width:24,height:1,background:"rgba(255,255,255,0.1)"}} />}
          </div>
        ))}
      </div>
      {step===0&&(
        <div style={{width:"100%",maxWidth:960,animation:"fadeUp 0.5s ease"}}>
          <p style={{textAlign:"center",color:"rgba(255,255,255,0.4)",marginBottom:24,fontSize:13,letterSpacing:"0.05em"}}>Choose the ecosystem your class will explore</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>
            {ecoList.map(e=>{
              const sel=eco?.id===e.id;
              return(
                <div key={e.id} onClick={()=>setEco(e)} style={{
                  background:sel?`${e.color}18`:"rgba(255,255,255,0.03)",
                  border:`2px solid ${sel?e.color:"rgba(255,255,255,0.07)"}`,
                  borderRadius:18,padding:"20px 20px 16px",cursor:"pointer",
                  transition:"all 0.25s cubic-bezier(0.34,1.3,0.64,1)",
                  boxShadow:sel?`0 0 28px ${e.color}44, inset 0 0 20px ${e.color}08`:"none",
                  transform:sel?"scale(1.02)":"scale(1)",
                }}>
                  {/* Top row */}
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{
                        width:50,height:50,borderRadius:14,
                        background:`${e.color}18`,
                        border:`1.5px solid ${e.color}44`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:26,
                        boxShadow:sel?`0 0 16px ${e.color}55`:"none",
                        transition:"box-shadow 0.3s",
                      }}>{e.emoji}</div>
                      <div>
                        <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:"#fff",fontWeight:700,marginBottom:5}}>{e.name}</div>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <span style={{fontSize:11}}>{diffIcons[e.difficulty]}</span>
                          <span style={{fontSize:10,color:diffColors[e.difficulty]||"#a5f3fc",fontFamily:"'Cinzel',serif",letterSpacing:"0.05em"}}>{e.diffLabel}</span>
                        </div>
                      </div>
                    </div>
                    {sel&&<div style={{width:20,height:20,borderRadius:"50%",background:"#22c55e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700,flexShrink:0,animation:"popIn 0.3s ease"}}>✓</div>}
                  </div>
                  {/* Stats row */}
                  <div style={{display:"flex",gap:10,marginBottom:10}}>
                    {[
                      {label:"Organisms", val:e.organisms.length},
                      {label:"Squares",   val:e.boardSize},
                    ].map(stat=>(
                      <div key={stat.label} style={{flex:1,background:"rgba(0,0,0,0.25)",borderRadius:8,padding:"6px 10px",textAlign:"center"}}>
                        <div style={{fontFamily:"'Cinzel',serif",fontSize:15,color:e.color,fontWeight:700}}>{stat.val}</div>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em"}}>{stat.label.toUpperCase()}</div>
                      </div>
                    ))}
                    <div style={{flex:2,background:"rgba(0,0,0,0.25)",borderRadius:8,padding:"6px 10px",textAlign:"center"}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:"rgba(255,255,255,0.55)",marginTop:2}}>
                        {e.difficulty<=2?"Basic chains":e.difficulty<=3?"Moderate chains":e.difficulty<=4?"Complex chains":"Expert chains"}
                      </div>
                    </div>
                  </div>
                  {/* Organism emoji strip */}
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {e.organisms.slice(0,8).map(org=>(
                      <span key={org.id} style={{fontSize:14,opacity:sel?0.9:0.4,transition:"opacity 0.3s"}}>{org.emoji}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {step===1&&(
        <div style={{width:"100%",maxWidth:500,animation:"fadeUp 0.5s ease",textAlign:"center"}}>
          <p style={{color:"rgba(255,255,255,0.45)",marginBottom:28,fontSize:13,letterSpacing:"0.05em"}}>How many teams are playing?</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            {[2,3,4,5,6].map(n=>{
              const sel=numTeams===n;
              return(
                <div key={n} onClick={()=>initTeams(n)} style={{
                  width:84,height:84,borderRadius:18,cursor:"pointer",
                  background:sel?`rgba(34,197,94,0.2)`:"rgba(255,255,255,0.04)",
                  border:`2px solid ${sel?"#22c55e":"rgba(255,255,255,0.09)"}`,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  transition:"all 0.2s cubic-bezier(0.34,1.4,0.64,1)",
                  transform:sel?"scale(1.08)":"scale(1)",
                  boxShadow:sel?"0 0 20px rgba(34,197,94,0.35)":"none",
                }}>
                  <span style={{fontFamily:"'Cinzel Decorative',serif",fontSize:30,color:sel?"#4ade80":"rgba(255,255,255,0.55)",fontWeight:700,lineHeight:1}}>{n}</span>
                  <span style={{fontSize:9,color:sel?"rgba(134,239,172,0.8)":"rgba(255,255,255,0.3)",letterSpacing:"0.15em",marginTop:4,fontFamily:"'Cinzel',serif"}}>TEAM{n>1?"S":""}</span>
                </div>
              );
            })}
          </div>
          <div style={{marginTop:24,display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
            {teams.map((t,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${TEAM_COLORS[i].bg}44`,borderRadius:10,padding:"7px 14px",animation:"popIn 0.3s ease"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:TEAM_COLORS[i].bg,boxShadow:`0 0 6px ${TEAM_COLORS[i].bg}`}} />
                <span style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontFamily:"'Cinzel',serif"}}>{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {step===2&&(
        <div style={{width:"100%",maxWidth:700,animation:"fadeUp 0.5s ease"}}>
          <p style={{textAlign:"center",color:"rgba(255,255,255,0.5)",marginBottom:20,fontSize:13}}>Enter team name and members (max 7)</p>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"220px 1fr",gap:16}}>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {teams.map((t,i)=>(
                <div key={i} onClick={()=>{saveEditing();setEditing({idx:i,name:t.name,players:[...t.players,""].slice(0,7)});}}
                  style={{background:editing.idx===i?`${TEAM_COLORS[i].bg}22`:"rgba(255,255,255,0.04)",border:`2px solid ${editing.idx===i?TEAM_COLORS[i].bg:"rgba(255,255,255,0.08)"}`,borderRadius:12,padding:"12px 14px",cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:14,height:14,borderRadius:"50%",background:TEAM_COLORS[i].bg}} />
                    <span style={{fontFamily:"'Cinzel',serif",fontSize:12,color:"#fff"}}>{t.name}</span>
                  </div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginTop:4}}>{t.players.filter(p=>p.trim()).length} jugadores</div>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:TEAM_COLORS[editing.idx].bg}} />
                <input value={editing.name} onChange={e=>setEditing(p=>({...p,name:e.target.value.toUpperCase()}))}
                  style={{flex:1,background:"rgba(255,255,255,0.08)",border:`1px solid ${TEAM_COLORS[editing.idx].bg}55`,borderRadius:8,padding:"8px 12px",color:"#fff",fontFamily:"'Cinzel',serif",fontSize:13,outline:"none"}} placeholder="Team name..." />
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:"0.15em",marginBottom:10}}>PLAYERS (max 7)</div>
              {Array.from({length:7}).map((_,i)=>(
                <input key={i} value={editing.players[i]||""} onChange={e=>{const p=[...(editing.players||[])];p[i]=e.target.value.toUpperCase();setEditing(prev=>({...prev,players:p}));}}
                  style={{width:"100%",background:i<4?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,${i<4?0.12:0.06})`,borderRadius:8,padding:"8px 12px",color:"#fff",fontFamily:"'Libre Baskerville',serif",fontSize:13,outline:"none",marginBottom:6}}
                  placeholder={`Jugador ${i+1}${i>=4?" (opcional)":""}`} />
              ))}
              <button onClick={saveEditing} style={{width:"100%",marginTop:8,padding:"10px",background:`${TEAM_COLORS[editing.idx].bg}33`,border:`1px solid ${TEAM_COLORS[editing.idx].bg}55`,borderRadius:10,color:"#fff",fontFamily:"'Cinzel',serif",fontSize:12,cursor:"pointer",letterSpacing:"0.1em"}}>✓ Save Team</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:14,marginTop:32}}>
        {step>0&&<button onClick={()=>{saveEditing();setStep(s=>s-1);}} style={{padding:"13px 28px",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,color:"rgba(255,255,255,0.7)",fontFamily:"'Cinzel',serif",fontSize:13,cursor:"pointer"}}>← Back</button>}
        <button onClick={()=>{if(!canProceed)return;if(step===2){saveEditing();setTimeout(()=>onStart(eco,teams.map(t=>({...t,players:t.players.filter(p=>p.trim())}))),50);}else{if(step===1&&teams.length===0)initTeams(numTeams);setStep(s=>s+1);}}}
          style={{padding:"13px 36px",background:canProceed?"linear-gradient(135deg,#16a34a,#15803d)":"rgba(255,255,255,0.06)",border:"none",borderRadius:12,color:canProceed?"#fff":"rgba(255,255,255,0.3)",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:13,cursor:canProceed?"pointer":"not-allowed",letterSpacing:"0.1em",boxShadow:canProceed?"0 6px 20px rgba(22,163,74,0.4)":"none"}}>
          {step===2?"🚀 Launch Game!":"Next →"}
        </button>
      </div>
    </div>
  );
}

// ── SPINNER ────────────────────────────────────────
function SpinnerScreen({ teams, onDone }) {
  const [spinning, setSpinning] = useState(false);
  const [deg, setDeg] = useState(0);
  const [winner, setWinner] = useState(null);
  const n = teams.length;
  const spin = () => {
    if(spinning||winner!==null)return; setSpinning(true);
    const winIdx=Math.floor(Math.random()*n);
    const sd=360/n;
    const totalRot=deg+1800+(360-(winIdx*sd+sd/2))-(deg%360);
    setDeg(totalRot);
    setTimeout(()=>{setSpinning(false);setWinner(winIdx);},4200);
  };
  const conicParts=teams.map((t,i)=>`${TEAM_COLORS[t.colorIdx].bg} ${(i/n)*100}% ${((i+1)/n)*100}%`).join(", ");
  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 30%,#0d1a0e,#020407)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Libre Baskerville',serif",padding:20}}>
      <div style={{fontSize:12,color:"#4ade80",letterSpacing:"0.3em",marginBottom:12}}>SPIN ORDER</div>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:26,color:"#fff",marginBottom:4}}>Who goes first?</h2>
      <p style={{color:"rgba(255,255,255,0.4)",fontSize:13,marginBottom:40}}>Spin to decide who goes first</p>
      <div style={{position:"relative",marginBottom:40}}>
        <div style={{position:"absolute",top:-18,left:"50%",transform:"translateX(-50%)",zIndex:10,fontSize:28}}>▼</div>
        <div style={{width:300,height:300,borderRadius:"50%",background:`conic-gradient(${conicParts})`,transform:`rotate(${deg}deg)`,transition:spinning?"transform 4.2s cubic-bezier(0.17,0.67,0.12,1)":"none",border:"4px solid rgba(255,255,255,0.2)",position:"relative"}}>
          {teams.map((t,i)=>{
            const angle=(i/n+0.5/n)*360-90,rad=angle*Math.PI/180;
            return(<div key={i} style={{position:"absolute",left:150+110*Math.cos(rad),top:150+110*Math.sin(rad),transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:10,fontWeight:700,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.8)",whiteSpace:"nowrap"}}>{t.name}</div>
            </div>);
          })}
        </div>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:50,height:50,borderRadius:"50%",background:"#0a0f1a",border:"3px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,zIndex:5}}>🌍</div>
      </div>
      {winner!==null?(
        <div style={{textAlign:"center",animation:"popIn 0.6s ease"}}>
          <div style={{fontSize:18,color:"rgba(255,255,255,0.6)",marginBottom:8}}>The first team is…!</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:32,color:TEAM_COLORS[teams[winner].colorIdx].light,fontWeight:700}}>{teams[winner].name}</div>
          <div style={{color:"rgba(255,255,255,0.5)",fontSize:13,marginTop:8}}>{teams[winner].players.join(" · ")}</div>
          <button onClick={()=>onDone(winner)} style={{marginTop:24,padding:"14px 40px",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:12,color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:14,cursor:"pointer",letterSpacing:"0.1em",boxShadow:"0 6px 25px rgba(22,163,74,0.5)"}}>Start the game! →</button>
        </div>
      ):(
        <button onClick={spin} disabled={spinning} style={{padding:"16px 50px",background:spinning?"rgba(255,255,255,0.05)":"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",borderRadius:14,color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:15,cursor:spinning?"not-allowed":"pointer",letterSpacing:"0.12em",boxShadow:spinning?"none":"0 8px 30px rgba(124,58,237,0.5)"}}>
          {spinning?"Spinning…":"⚡ SPIN"}
        </button>
      )}
    </div>
  );
}

// ── CHALLENGE COMPONENTS ───────────────────────────

// ── TIMER BAR ──────────────────────────────────────

export { GenesisScreen, RolesScreen, WelcomeScreen, NarrativeScreen, SetupScreen, SpinnerScreen };
