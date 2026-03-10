import { useState, useEffect, useMemo, Component } from "react";
import { TEAM_COLORS } from "./constants";
import { ECOSYSTEMS } from "./ecosystems";
import { GS } from "./utils";
import { GenesisScreen, RolesScreen, WelcomeScreen, NarrativeScreen, SetupScreen, SpinnerScreen } from "./Screens";
import GameScreen from "./GameScreen";

// ── ERROR BOUNDARY ──────────────────────────────────
// Catches any unhandled React crash and shows a recovery screen
// instead of leaving the user on a black screen.
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidCatch(e, info) { console.error("[Ecosystem Explorer] Crash:", e, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 30%,#0d1a0e,#020407)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Libre Baskerville',serif",gap:18,padding:24,textAlign:"center"}}>
          <div style={{fontSize:52,filter:"drop-shadow(0 0 24px rgba(239,68,68,0.6))"}}>⚠️</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(18px,4vw,26px)",color:"#f87171",textShadow:"0 0 30px rgba(248,113,113,0.5)"}}>
            Something Went Wrong
          </div>
          <p style={{color:"rgba(255,255,255,0.45)",fontSize:13,maxWidth:360,lineHeight:1.7,margin:0}}>
            An unexpected error occurred. Your progress may have been lost, but the game is ready to restart.
          </p>
          {this.state.error?.message && (
            <code style={{fontSize:11,color:"rgba(255,100,100,0.55)",background:"rgba(255,0,0,0.06)",border:"1px solid rgba(255,0,0,0.15)",borderRadius:8,padding:"6px 14px",maxWidth:400,wordBreak:"break-word"}}>
              {this.state.error.message}
            </code>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{marginTop:8,padding:"13px 40px",background:"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:14,color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:14,cursor:"pointer",letterSpacing:"0.1em",boxShadow:"0 6px 24px rgba(22,163,74,0.45)"}}
          >
            🌍 Restart Game
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function EcosystemDestroyedScreen({ ecosystem, teams, onRestart }) {
  const eco = ECOSYSTEMS[ecosystem.id];
  const [entered, setEntered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(()=>{ const t=setTimeout(()=>setEntered(true),80); return()=>clearTimeout(t); },[]);
  useEffect(()=>{ const h=()=>setIsMobile(window.innerWidth<640); window.addEventListener("resize",h); return()=>window.removeEventListener("resize",h); },[]);

  const embers = useMemo(()=>Array.from({length:28}).map((_,i)=>({
    left:`${(i*37+3)%100}%`,
    botStart:`${(i*19)%40}%`,
    sz: 8 + (i*5)%16,
    dur:`${4+(i*3)%5}s`,
    delay:`${(i*0.7)%5}s`,
    sym:["🥀","💀","🌑","🖤","🍂","🔥","💔"][i%7],
  })),[]);

  const vis = (delay="0s") => ({
    opacity: entered ? 1 : 0,
    transform: entered ? "translateY(0)" : "translateY(20px)",
    transition:`opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}`,
  });

  return (
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 25%,#1a0003 0%,#0a0000 45%,#020407 100%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Libre Baskerville',serif",padding:"clamp(16px,4vw,24px)",position:"relative",overflow:"hidden"}}>
      {/* Rising embers */}
      {embers.map((e,i)=>(
        <div key={i} style={{
          position:"absolute",left:e.left,bottom:e.botStart,
          fontSize:e.sz,
          animation:`destroyedEmber ${e.dur} ease-in ${e.delay} infinite`,
          pointerEvents:"none",userSelect:"none",
        }}>{e.sym}</div>
      ))}
      {/* Red ambient vignette */}
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 30%, rgba(127,0,0,0.18) 0%, transparent 65%)",pointerEvents:"none"}} />

      {/* Main icon */}
      <div style={{...vis("0s"),fontSize:"5.5rem",marginBottom:"1rem",filter:"drop-shadow(0 0 40px rgba(239,68,68,0.7))"}}>
        <span style={{display:"inline-block",animation:"destroyedShake 0.5s ease 0.4s both, chaosFloat 3s ease-in-out 1s infinite"}}>🥀</span>
      </div>

      {/* Title */}
      <div style={{...vis("0.15s"),fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.2rem,5vw,2rem)",color:"#f87171",letterSpacing:"0.08em",textAlign:"center",textShadow:"0 0 50px rgba(248,113,113,0.8), 0 0 20px rgba(248,113,113,0.4)",marginBottom:"0.4rem"}}>
        The Ecosystem Was Destroyed
      </div>
      <div style={{...vis("0.2s"),fontFamily:"'Cinzel',serif",fontSize:"0.78rem",color:"rgba(255,180,180,0.4)",letterSpacing:"0.28em",marginBottom:"2rem"}}>
        {eco.name.toUpperCase()} · ALL BUILDERS HAVE FALLEN
      </div>

      {/* Scripture */}
      <div style={{...vis("0.3s"),maxWidth:"32rem",width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"1.2rem",padding:"clamp(1rem,3vw,1.6rem) clamp(1rem,4vw,2rem)",marginBottom:"1.8rem",textAlign:"center",backdropFilter:"blur(4px)"}}>
        <div style={{fontSize:"1.5rem",marginBottom:"0.7rem"}}>✝️</div>
        <p style={{fontStyle:"italic",color:"rgba(255,230,200,0.85)",fontSize:"0.98rem",lineHeight:1.85,margin:"0 0 0.8rem 0",fontFamily:"'Libre Baskerville',serif"}}>
          "No nos cansemos de hacer el bien, porque a su debido tiempo cosecharemos si no nos damos por vencidos."
        </p>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",color:"rgba(255,200,150,0.4)",letterSpacing:"0.18em"}}>
          GÁLATAS 6:9
        </div>
      </div>

      {/* Encouragement */}
      <p style={{...vis("0.38s"),color:"rgba(255,180,180,0.5)",fontSize:"0.88rem",textAlign:"center",maxWidth:"28rem",lineHeight:1.75,marginBottom:"2rem"}}>
        El ecosistema fue destruido... pero cada acto de cuidado importa.{" "}
        <strong style={{color:"rgba(255,180,100,0.8)"}}>El bien siempre es más fuerte</strong> — ¡vuelve a intentarlo!
      </p>

      {/* Teams summary */}
      <div style={{...vis("0.45s"),width:"100%",maxWidth:480,display:"flex",flexDirection:"column",gap:8,marginBottom:"2rem"}}>
        {[...teams].sort((a,b)=>b.organisms.length-a.organisms.length).map((team,i)=>{
          const tc=TEAM_COLORS[team.colorIdx];
          return(
            <div key={team.id} style={{
              background:"rgba(255,255,255,0.03)",
              border:`1px solid ${tc.bg}25`,
              borderRadius:10,padding:"10px 14px",
              display:"flex",alignItems:"center",gap:10,
              animation:`rankSlideIn 0.4s ease ${i*0.08}s both`,
            }}>
              <div style={{width:8,height:8,borderRadius:"50%",background:tc.bg,flexShrink:0}} />
              <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.8rem",color:"rgba(255,255,255,0.55)",flex:1}}>{team.name}</span>
              <div style={{display:"flex",gap:3}}>
                {team.organisms.slice(0,5).map(o=><span key={o.id} style={{fontSize:13}}>{o.emoji}</span>)}
                {team.organisms.length>5&&<span style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginLeft:2}}>+{team.organisms.length-5}</span>}
              </div>
              <span style={{fontSize:"0.72rem",color:"rgba(255,255,255,0.28)",marginLeft:4}}>{team.organisms.length} saved</span>
            </div>
          );
        })}
      </div>

      <div style={vis("0.55s")}>
        <button onClick={onRestart} style={{padding:"clamp(10px,2.5vw,13px) clamp(24px,8vw,44px)",background:"linear-gradient(135deg,rgba(185,28,28,0.55),rgba(127,29,29,0.75))",border:"1.5px solid rgba(248,113,113,0.4)",borderRadius:14,color:"#fca5a5",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:"0.95rem",cursor:"pointer",letterSpacing:"0.1em",boxShadow:"0 8px 30px rgba(127,29,29,0.45)"}}>
          🌍 Try Again
        </button>
      </div>
    </div>
  );
}

// ── VICTORY ─────────────────────────────────────────
function VictoryScreen({ teams, ecosystem, winner, onRestart }) {
  const eco=ECOSYSTEMS[ecosystem.id];
  const sorted=[...teams].sort((a,b)=>b.organisms.length-a.organisms.length);

  // Fixed particles — memoized so they don't re-randomize on every render
  const particles = useMemo(()=>
    Array.from({length:48}).map((_,i)=>({
      left:`${(i*43+7)%100}%`,
      top:`${(i*61+11)%100}%`,
      size: 10 + (i*7)%22,
      dur: `${2+i%3}s`,
      delay: `${(i*0.7)%5}s`,
      icon:["🎉","⭐","🌟","✨","🏆","🌿","🎊","💫"][i%8],
    })),
  []);

  return(
    <div style={{minHeight:"100vh",background:eco.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Libre Baskerville',serif",padding:"clamp(16px,4vw,24px)",position:"relative",overflow:"hidden"}}>
      {particles.map((p,i)=>(
        <div key={i} style={{position:"absolute",left:p.left,top:p.top,fontSize:p.size,opacity:0.22,animation:`victoryFloat ${p.dur} ease-in-out ${p.delay} infinite`,pointerEvents:"none",userSelect:"none"}}>{p.icon}</div>
      ))}

      {/* Ambient glow */}
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translateX(-50%)",width:"70vw",height:"50vh",background:`radial-gradient(ellipse, ${eco.glow}18 0%, transparent 70%)`,pointerEvents:"none"}} />

      {/* Header */}
      <div style={{textAlign:"center",marginBottom:"clamp(16px,4vw,28px)",animation:"victoryTitle 0.75s cubic-bezier(0.34,1.3,0.64,1) both"}}>
        <div style={{fontSize:10,letterSpacing:"0.45em",color:eco.color,marginBottom:10,fontFamily:"'Cinzel',serif"}}>GAME COMPLETE</div>
        <div style={{fontSize:56,marginBottom:8,animation:"float 2.5s ease-in-out infinite",filter:`drop-shadow(0 0 32px ${eco.glow})`}}>{eco.emoji}</div>
        <h1 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(22px,4vw,34px)",color:"#fff",textShadow:`0 0 48px ${eco.color}88`,marginBottom:6,textAlign:"center"}}>{sorted[0].name} Wins!</h1>
        <p style={{color:"rgba(255,255,255,0.42)",fontSize:13}}>{winner?.name} reached the center of the board</p>
      </div>

      {/* Leaderboard */}
      <div style={{width:"100%",maxWidth:580,display:"flex",flexDirection:"column",gap:8,marginBottom:"clamp(18px,4vw,32px)",padding:"0 clamp(0px,2vw,0px)"}}>
        {sorted.map((team,i)=>{
          const tc=TEAM_COLORS[team.colorIdx],pct=Math.round((team.organisms.length/eco.organisms.length)*100);
          const medals=["🥇","🥈","🥉"];
          return(
            <div key={team.id} style={{
              background:i===0?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.04)",
              border:`2px solid ${i===0?tc.bg:"rgba(255,255,255,0.07)"}`,
              borderRadius:14,padding:"clamp(9px,2vw,13px) clamp(10px,3vw,16px)",
              display:"flex",alignItems:"center",gap:12,
              boxShadow:i===0?`0 0 24px ${tc.bg}55`:"none",
              animation:`rankSlideIn 0.5s cubic-bezier(0.34,1.2,0.64,1) ${i*0.12}s both`,
            }}>
              <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:i<3?22:14,fontFamily:"'Cinzel',serif",fontWeight:700,color:i<3?"#fff":"rgba(255,255,255,0.4)",background:i===0?"rgba(253,224,71,0.2)":i===1?"rgba(200,200,200,0.12)":i===2?"rgba(180,120,50,0.15)":"rgba(255,255,255,0.06)",border:`1px solid ${i===0?"rgba(253,224,71,0.4)":i===1?"rgba(200,200,200,0.25)":i===2?"rgba(180,120,50,0.3)":"rgba(255,255,255,0.1)"}`,flexShrink:0}}>
                {i<3?medals[i]:i+1}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <div style={{width:9,height:9,borderRadius:"50%",background:tc.bg,boxShadow:`0 0 6px ${tc.bg}`,flexShrink:0}} />
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"#fff",fontWeight:700}}>{team.name}</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginLeft:2}}>{team.players?.join(", ")}</span>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,0.07)",borderRadius:2,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${tc.bg},${tc.light})`,borderRadius:2,transition:"width 1s ease"}} />
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,alignItems:"center"}}>
                  {team.organisms.map(org=><span key={org.id} style={{fontSize:15}}>{org.emoji}</span>)}
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginLeft:4}}>{team.organisms.length}/{eco.organisms.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onRestart}
        style={{
          padding:"clamp(10px,3vw,14px) clamp(24px,8vw,44px)",
          background:"linear-gradient(135deg,#16a34a,#15803d)",
          border:"none",borderRadius:14,
          color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:14,
          cursor:"pointer",letterSpacing:"0.1em",
          boxShadow:"0 8px 30px rgba(22,163,74,0.5)",
          animation:"pulseGlow 2.4s ease-in-out 1.2s infinite",
        }}
      >🌍 Play Again</button>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState("welcome");
  const [ecosystem,setEcosystem]=useState(null);
  const [gameTeams,setGameTeams]=useState([]);
  const [firstTeam,setFirstTeam]=useState(0);
  const handleSetupDone=(eco,teams)=>{setEcosystem(eco);setGameTeams(teams);setScreen("roles");};
  const handleRolesDone=(teamsWithRoles)=>{setGameTeams(teamsWithRoles);setScreen("genesis");};
  const handleNarrativeDone=()=>{setScreen("setup");};
  const handleGenesisDone=idx=>{setFirstTeam(idx);setScreen("game");};
  const handleRestart=()=>{setScreen("welcome");setEcosystem(null);setGameTeams([]);setFirstTeam(0);};
  return(
    <ErrorBoundary>
      <style>{GS}</style>
      {screen==="welcome"&&<WelcomeScreen onEnter={()=>setScreen("narrative")} />}
      {screen==="narrative"&&<NarrativeScreen onDone={handleNarrativeDone} />}
      {screen==="setup"&&<SetupScreen onStart={handleSetupDone} />}
      {screen==="roles"&&gameTeams.length>0&&<RolesScreen teams={gameTeams} onDone={handleRolesDone} />}
      {screen==="genesis"&&gameTeams.length>0&&<GenesisScreen teams={gameTeams} ecosystem={ecosystem} onStart={handleGenesisDone} />}
      {screen==="game"&&ecosystem&&<GameScreen ecosystem={ecosystem} initTeams={gameTeams} firstTeamIdx={firstTeam} onEnd={handleRestart} />}
    </ErrorBoundary>
  );
}
