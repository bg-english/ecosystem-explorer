import { useState, useEffect } from "react";
import { CT, ROLES, TEAM_COLORS, SFX } from "./constants";
import { ECOSYSTEMS } from "./ecosystems";

function WowFactsModal({ fact, ecosystem, context, onDone }) {
  const eco = ECOSYSTEMS[ecosystem.id];
  const [phase, setPhase] = useState("in");
  useEffect(() => {
    const t = setTimeout(() => setPhase("ready"), 800);
    if (context === "victory") SFX.victory();
    else SFX.wow();
    return () => clearTimeout(t);
  }, []);

  const contextLabel = context === "restoration"
    ? "🌿 Garden Restored!"
    : context === "victory"
    ? "🏆 Ecosystem Complete!"
    : "🕸️ Food Web Mastered!";

  const contextColor = context === "victory" ? "#fde047"
    : context === "restoration" ? "#4ade80"
    : "#fb923c";

  return (
    <div style={{
      position:"fixed", inset:0,
      background:`radial-gradient(ellipse at 50% 0%, ${eco.glow}18 0%, rgba(0,0,0,0.94) 55%)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:250, padding:"1.5rem",
      animation:"slowFade 0.35s ease",
    }}>
      {/* Subtle eco-color ambient dots */}
      {[0,1,2,3].map(i=>(
        <div key={i} style={{
          position:"absolute",
          left:`${[15,80,25,72][i]}%`, top:`${[10,15,85,80][i]}%`,
          width:200,height:200,borderRadius:"50%",
          background:`radial-gradient(ellipse, ${eco.glow}10 0%, transparent 70%)`,
          pointerEvents:"none",
        }}/>
      ))}

      <div style={{
        maxWidth:"54rem", width:"100%",
        display:"flex", flexDirection:"column", alignItems:"center",
        gap:"1.4rem", position:"relative", zIndex:1,
      }}>
        {/* Header */}
        <div style={{textAlign:"center", animation:"fadeUp 0.55s ease"}}>
          <div style={{fontSize:"3.2rem", marginBottom:"0.4rem", animation:"float 3s ease-in-out infinite", filter:`drop-shadow(0 0 24px ${eco.glow})`}}>
            {eco.emoji}
          </div>
          <div style={{
            fontFamily:"'Cinzel Decorative',serif",
            fontSize:"clamp(1rem,3vw,1.6rem)",
            color:"#fde047",
            letterSpacing:"0.12em",
            textShadow:"0 0 32px rgba(253,224,71,0.65)",
            marginBottom:"0.3rem",
          }}>WOW FACT!</div>
          <div style={{
            display:"inline-flex",alignItems:"center",gap:"0.5rem",
            background:`${contextColor}18`,
            border:`1px solid ${contextColor}40`,
            borderRadius:"2rem",
            padding:"0.25rem 0.9rem",
          }}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.7rem",color:contextColor,letterSpacing:"0.2em"}}>{contextLabel.toUpperCase()}</span>
            <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.25)"}}>·</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.7rem",color:eco.color,letterSpacing:"0.15em",opacity:0.8}}>{eco.name.toUpperCase()}</span>
          </div>
        </div>

        {/* Two panels */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",width:"100%"}}>
          {/* Science panel */}
          <div style={{
            background:"rgba(14,30,50,0.8)",
            border:"1.5px solid rgba(56,189,248,0.3)",
            borderRadius:"1.3rem",padding:"1.6rem 1.4rem",
            backdropFilter:"blur(8px)",
            animation:"wowPanelIn 0.5s cubic-bezier(0.34,1.3,0.64,1) 0.1s both",
            boxShadow:"0 4px 24px rgba(56,189,248,0.08), inset 0 1px 0 rgba(56,189,248,0.1)",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"1rem"}}>
              <div style={{width:"2.2rem",height:"2.2rem",borderRadius:"0.6rem",background:"rgba(56,189,248,0.12)",border:"1.5px solid rgba(56,189,248,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0}}>🔬</div>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",color:"rgba(56,189,248,0.65)",letterSpacing:"0.22em"}}>SCIENCE FACT</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.88rem",color:"#38bdf8",fontWeight:700}}>Did you know?</div>
              </div>
            </div>
            <p style={{color:"rgba(255,255,255,0.9)",fontSize:"0.92rem",lineHeight:1.8,fontFamily:"'Libre Baskerville',serif",margin:0}}>
              {fact.science}
            </p>
          </div>

          {/* Faith panel */}
          <div style={{
            background:"rgba(30,24,5,0.8)",
            border:"1.5px solid rgba(253,224,71,0.25)",
            borderRadius:"1.3rem",padding:"1.6rem 1.4rem",
            backdropFilter:"blur(8px)",
            animation:"wowPanelIn 0.5s cubic-bezier(0.34,1.3,0.64,1) 0.28s both",
            boxShadow:"0 4px 24px rgba(253,224,71,0.06), inset 0 1px 0 rgba(253,224,71,0.08)",
          }}>
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"1rem"}}>
              <div style={{width:"2.2rem",height:"2.2rem",borderRadius:"0.6rem",background:"rgba(253,224,71,0.08)",border:"1.5px solid rgba(253,224,71,0.28)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",flexShrink:0}}>✝️</div>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",color:"rgba(253,224,71,0.65)",letterSpacing:"0.22em"}}>FAITH CONNECTION</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.88rem",color:"#fde047",fontWeight:700}}>God's Design</div>
              </div>
            </div>
            <p style={{color:"rgba(255,245,200,0.9)",fontSize:"0.92rem",lineHeight:1.8,fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",margin:0}}>
              {fact.faith}
            </p>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDone}
          style={{
            padding:"0.85rem 3rem",
            background:`linear-gradient(135deg,${eco.glow}28,${eco.color}18)`,
            border:`1.5px solid ${eco.glow}55`,
            borderRadius:"0.85rem",
            color:eco.color,
            fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:"0.9rem",
            cursor:"pointer",letterSpacing:"0.12em",
            boxShadow:`0 0 24px ${eco.glow}22`,
            animation:"fadeUp 0.5s ease 0.55s both",
            transition:"all 0.2s",
          }}
        >✨ Amazing! Continue →</button>
      </div>
    </div>
  );
}

// ── CHALLENGE MODAL ────────────────────────────────
function ChallengeModal({ cell, ecosystem, team, pendingOrganism, onResult, challenge }) {
  const eco=ECOSYSTEMS[ecosystem.id];
  const ct=CT[cell.type];
  const [result,setResult]=useState(null);
  const [splash,setSplash]=useState(true);

  useEffect(()=>{
    const t=setTimeout(()=>setSplash(false), 1400);
    return ()=>clearTimeout(t);
  },[]);

  // Fire sound as soon as result is known (before the result screen renders)
  useEffect(()=>{
    if(result===null) return;
    if(result){
      if(cell.type==="foodweb") SFX.foodweb();
      else SFX.correct();
    } else {
      SFX.incorrect();
    }
  },[result]);

  // ── Splash screen ────────────────────────────────
  if(splash){
    return(
      <div style={{
        position:"fixed",inset:0,zIndex:200,
        background:`radial-gradient(ellipse at 50% 40%, ${ct.bg} 0%, rgba(2,4,7,0.97) 70%)`,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        animation:"splashOut 0.35s ease-in 1s both",
      }}>
        {/* Color burst ring */}
        <div style={{
          position:"absolute",width:"min(60vw,360px)",height:"min(60vw,360px)",
          borderRadius:"50%",
          border:`2px solid ${ct.color}55`,
          boxShadow:`0 0 60px ${ct.color}44, inset 0 0 60px ${ct.color}22`,
          animation:"lightBurst 0.4s ease both",
        }} />
        <div style={{fontSize:"5rem",animation:"splashIconIn 0.45s cubic-bezier(0.34,1.5,0.64,1) both",filter:`drop-shadow(0 0 28px ${ct.color})`}}>{ct.icon}</div>
        <div style={{
          fontFamily:"'Cinzel Decorative',serif",
          fontSize:"clamp(1.1rem,3vw,1.8rem)",
          color:ct.color,
          letterSpacing:"0.15em",
          textShadow:`0 0 30px ${ct.color}88`,
          marginTop:"1rem",
          animation:"splashLabelIn 0.45s ease 0.1s both",
        }}>{ct.label}</div>
        <div style={{
          fontFamily:"'Cinzel',serif",
          fontSize:"0.68rem",
          color:"rgba(255,255,255,0.35)",
          letterSpacing:"0.25em",
          marginTop:"0.5rem",
          animation:"fadeUp 0.4s ease 0.18s both",
        }}>{team.name.toUpperCase()}</div>
      </div>
    );
  }

  if(result!==null){
    const org=pendingOrganism;
    return(
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:"1.5rem"}}>
        <div style={{background:"#0a0f1a",border:`2px solid ${result?"#22c55e":"#ef4444"}`,borderRadius:"1.3rem",padding:"2.2rem 2rem",maxWidth:"30rem",width:"100%",textAlign:"center",animation:"popIn 0.5s ease",boxShadow:`0 0 50px ${result?"rgba(34,197,94,0.3)":"rgba(239,68,68,0.3)"}`}}>
          <div style={{fontSize:"3.5rem",marginBottom:"0.5rem"}}>{result?"🎉":"😞"}</div>
          <h3 style={{fontFamily:"'Cinzel',serif",fontSize:"1.5rem",color:result?"#4ade80":"#f87171",marginBottom:"0.5rem"}}>{result?"Correct!":"No point this time"}</h3>
          {result&&org&&(
            <div style={{background:"rgba(34,197,94,0.1)",border:"1px solid #22c55e44",borderRadius:"0.9rem",padding:"1rem 1.2rem",margin:"1rem 0",animation:"popIn 0.5s ease 0.2s both"}}>
              <div style={{fontSize:"0.75rem",color:"#4ade80",letterSpacing:"0.2em",marginBottom:"0.4rem"}}>✨ ORGANISMO DESBLOQUEADO</div>
              <div style={{fontSize:"2.8rem",marginBottom:"0.3rem"}}>{org.emoji}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"1rem",color:"#fff",fontWeight:700}}>{org.name}</div>
              <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.5)",marginTop:"0.3rem"}}>{org.role}</div>
            </div>
          )}
          {result&&!org&&<p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.9rem"}}>You already have all organisms</p>}
          {!result&&<p style={{color:"rgba(255,255,255,0.5)",fontSize:"0.9rem"}}>Turn passes to the next team</p>}
          <button onClick={()=>onResult(result,result?org:null)} style={{marginTop:"1.2rem",padding:"0.85rem 2.4rem",background:result?"linear-gradient(135deg,#16a34a,#15803d)":"rgba(255,255,255,0.08)",border:"none",borderRadius:"0.8rem",color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:"0.9rem",cursor:"pointer",letterSpacing:"0.1em"}}>Continue →</button>
        </div>
      </div>
    );
  }
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:"1.5rem"}}>
      <div style={{background:"#090e18",border:`1.5px solid ${ct.color}44`,borderRadius:"1.4rem",padding:"0",maxWidth:"46rem",width:"100%",boxShadow:`0 0 60px ${ct.color}18, 0 24px 60px rgba(0,0,0,0.7)`,maxHeight:"90vh",overflowY:"auto",animation:"fadeUp 0.3s ease"}}>

        {/* ── Header ── */}
        <div style={{padding:"1.2rem 1.5rem 1rem",borderBottom:`1px solid rgba(255,255,255,0.07)`}}>
          {/* Row 1: type badge + team + prize */}
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem",marginBottom:"0.75rem"}}>
            <div style={{width:"2.6rem",height:"2.6rem",borderRadius:"0.65rem",background:ct.bg,border:`1.5px solid ${ct.color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.25rem",flexShrink:0}}>{ct.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.78rem",color:ct.color,letterSpacing:"0.12em",fontWeight:700}}>{ct.label}</div>
              <div style={{fontSize:"0.75rem",color:TEAM_COLORS[team.colorIdx].light,marginTop:1,display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:TEAM_COLORS[team.colorIdx].bg,display:"inline-block",boxShadow:`0 0 5px ${TEAM_COLORS[team.colorIdx].bg}`}}/>
                {team.name}
              </div>
            </div>
            {pendingOrganism&&(
              <div style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.28)",borderRadius:"0.6rem",padding:"0.3rem 0.7rem",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <span style={{fontSize:16}}>{pendingOrganism.emoji}</span>
                <div>
                  <div style={{fontSize:"0.58rem",color:"rgba(74,222,128,0.6)",letterSpacing:"0.15em",fontFamily:"'Cinzel',serif"}}>PRIZE</div>
                  <div style={{fontSize:"0.72rem",color:"#4ade80",fontFamily:"'Cinzel',serif",fontWeight:700,whiteSpace:"nowrap"}}>{pendingOrganism.name}</div>
                </div>
              </div>
            )}
          </div>
          {/* Row 2: Guardian badge (only if role exists) */}
          {(()=>{
            const r=ROLES.find(ro=>ro.challenge===cell.type);
            if(!r)return null;
            const assignedPlayer=(team.roleAssignments||{})[r.id]||"";
            return(
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${r.color}10`,border:`1px solid ${r.color}30`,borderRadius:"0.6rem",padding:"0.25rem 0.7rem"}}>
                <span style={{fontSize:15}}>{r.emoji}</span>
                <div>
                  <span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",letterSpacing:"0.15em",fontFamily:"'Cinzel',serif"}}>GUARDIAN · </span>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",color:r.color,fontWeight:700}}>{r.name}</span>
                  {assignedPlayer&&<span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)",marginLeft:6}}>— {assignedPlayer}</span>}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Challenge content ── */}
        <div style={{padding:"1.4rem 1.5rem"}}>
          {cell.type==="trivia"&&<TriviaChallenge data={challenge} onResult={setResult} timeLimit={30} />}
          {cell.type==="foodchain"&&<TriviaChallenge data={{...challenge,exp:"That's how energy flows in this food chain!"}} onResult={setResult} timeLimit={45} />}
          {cell.type==="identify"&&<IdentifyChallenge data={challenge} onResult={setResult} timeLimit={30} />}
          {cell.type==="hangman"&&<HangmanChallenge data={challenge} onResult={setResult} timeLimit={60} />}
          {cell.type==="match"&&<MatchChallenge data={challenge} onResult={setResult} timeLimit={30} />}
          {cell.type==="unscramble"&&<UnscrambleChallenge data={challenge} onResult={setResult} timeLimit={45} />}
          {cell.type==="truefalse"&&<TrueFalseChallenge data={challenge} onResult={setResult} timeLimit={20} />}
          {cell.type==="foodweb"&&<FoodWebChallenge ecosystem={ecosystem} onResult={setResult} />}
        </div>
      </div>
    </div>
  );
}

// ── WILDCARD MODAL ─────────────────────────────────
function WildcardModal({ cell, resolved, teams, curIdx, onDone }) {
  useEffect(()=>{ SFX.wildcard(); },[]);

  // Build rich description based on precomputed resolved info
  const freeDesc = resolved?.org
    ? `You earned: ${resolved.org.emoji} ${resolved.org.name}!`
    : "All organisms already collected!";
  const stealDesc = resolved?.org
    ? `You steal ${resolved.org.emoji} ${resolved.org.name} from ${resolved.fromTeam?.name || "another team"}!`
    : "No organisms to steal yet.";

  const effects={
    advance:{icon:"⏩",title:"Move Forward!",desc:`Move forward ${cell.val} extra space${cell.val>1?"s":""}!`,color:"#4ade80"},
    back:   {icon:"⏪",title:"Move Back!",   desc:`Go back ${cell.val} space${cell.val>1?"s":""}!`,color:"#f87171"},
    skip:   {icon:"⏭️",title:"Lose a Turn!", desc:"You skip your next turn.",color:"#fbbf24"},
    free:   {icon:"🎁",title:"Free Organism!",desc:freeDesc,color:"#c084fc"},
    steal:  {icon:"🦅",title:"Steal an Organism!",desc:stealDesc,color:"#fb923c"},
    double: {icon:"✨",title:"Double Reward!",desc:"Your next correct answer earns 2 organisms!",color:"#38bdf8"},
  };
  const fx=effects[cell.fx]||{icon:"⚡",title:"Wildcard",desc:"Special effect",color:"#e879f9"};

  // Show organism card for free/steal when resolved
  const showOrgCard = (cell.fx==="free"||cell.fx==="steal") && resolved?.org;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
      <div style={{background:"#0a0f1a",border:`2px solid ${fx.color}55`,borderRadius:"1.3rem",padding:"2.6rem 2.2rem",maxWidth:"30rem",width:"90%",textAlign:"center",animation:"popIn 0.5s ease",boxShadow:`0 0 60px ${fx.color}33`}}>
        <div style={{fontSize:"4rem",marginBottom:"0.5rem"}}>{fx.icon}</div>
        <h3 style={{fontFamily:"'Cinzel',serif",fontSize:"1.5rem",color:fx.color,marginBottom:"0.55rem"}}>{fx.title}</h3>
        <p style={{color:"rgba(255,255,255,0.65)",fontSize:"0.95rem",lineHeight:1.5,marginBottom:showOrgCard?"1rem":"0"}}>{fx.desc}</p>
        {showOrgCard&&(
          <div style={{background:`${fx.color}12`,border:`1px solid ${fx.color}44`,borderRadius:"0.9rem",padding:"0.9rem 1.1rem",display:"flex",alignItems:"center",gap:"0.9rem",textAlign:"left",margin:"0 auto",maxWidth:"22rem"}}>
            <span style={{fontSize:"2.4rem",flexShrink:0}}>{resolved.org.emoji}</span>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.95rem",color:"#fff",fontWeight:700}}>{resolved.org.name}</div>
              {resolved.org.role&&<div style={{fontSize:"0.78rem",color:`${fx.color}cc`,marginTop:2}}>{resolved.org.role}</div>}
              {cell.fx==="steal"&&resolved.fromTeam&&(
                <div style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.4)",marginTop:3}}>from {resolved.fromTeam.name}</div>
              )}
            </div>
          </div>
        )}
        <button onClick={onDone} style={{marginTop:"1.5rem",padding:"0.85rem 2.2rem",background:`${fx.color}33`,border:`1.5px solid ${fx.color}55`,borderRadius:"0.8rem",color:"#fff",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:"0.9rem",cursor:"pointer",letterSpacing:"0.1em"}}>Continue →</button>
      </div>
    </div>
  );
}

// ── TEAM PANEL ─────────────────────────────────────
function TeamPanel({ teams, currentTeamIdx, ecosystem, compact }) {
  const eco=ECOSYSTEMS[ecosystem.id];
  if(compact){
    // Mobile: horizontal scrollable list of team mini-cards
    return(
      <div style={{display:"flex",flexDirection:"row",gap:"0.5rem",overflowX:"auto",overflowY:"hidden",paddingBottom:"0.2rem",maxHeight:"100%"}}>
        {teams.map((team,i)=>{
          const isA=i===currentTeamIdx,tc=TEAM_COLORS[team.colorIdx],col=team.organisms||[],total=eco.organisms.length,pct=Math.round((col.length/total)*100);
          return(
            <div key={team.id} style={{
              background:isA?`${tc.bg}22`:"rgba(255,255,255,0.04)",
              border:`1.5px solid ${isA?tc.bg:"rgba(255,255,255,0.08)"}`,
              borderRadius:"0.75rem",
              padding:"0.5rem 0.65rem",
              flexShrink:0,
              minWidth:"7rem",
              boxShadow:isA?`0 0 16px ${tc.bg}55`:"none",
              transition:"all 0.3s",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:"0.35rem",marginBottom:"0.3rem"}}>
                <div style={{width:"0.55rem",height:"0.55rem",borderRadius:"50%",background:tc.bg,flexShrink:0}}/>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.65rem",color:isA?tc.light:"rgba(255,255,255,0.6)",fontWeight:isA?700:400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{team.name}</span>
                {isA&&<span style={{fontSize:"0.5rem",color:tc.light,animation:"shimmer 1.8s ease-in-out infinite"}}>▶</span>}
              </div>
              <div style={{height:"0.25rem",background:"rgba(255,255,255,0.08)",borderRadius:"0.2rem",overflow:"hidden",marginBottom:"0.3rem"}}>
                <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${tc.bg},${tc.light})`,borderRadius:"0.2rem",transition:"width 0.6s ease"}}/>
              </div>
              <div style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.4)",fontFamily:"'Cinzel',serif"}}>{col.length}/{total} · Sq {team.position+1}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.15rem",marginTop:"0.3rem"}}>
                {eco.organisms.slice(0,8).map(org=>{
                  const has=col.find(c=>c.id===org.id);
                  return <span key={org.id} style={{fontSize:"0.7rem",opacity:has?1:0.18,transition:"opacity 0.4s"}}>{org.emoji}</span>;
                })}
                {eco.organisms.length>8&&<span style={{fontSize:"0.55rem",color:"rgba(255,255,255,0.25)"}}>+{eco.organisms.length-8}</span>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return(
    <div style={{display:"flex",flexDirection:"column",gap:"0.7rem",overflowY:"auto",maxHeight:"100%"}}>
      {teams.map((team,i)=>{
        const isA=i===currentTeamIdx,tc=TEAM_COLORS[team.colorIdx],col=team.organisms||[],total=eco.organisms.length,pct=Math.round((col.length/total)*100);
        const roles=team.roleAssignments||{};
        const activeRoleEntries=Object.entries(roles).filter(([,v])=>v?.trim());
        return(
          <div key={team.id} style={{
            background:isA?`${tc.bg}18`:"rgba(255,255,255,0.03)",
            border:`1.5px solid ${isA?tc.bg:"rgba(255,255,255,0.06)"}`,
            borderRadius:"0.9rem",
            padding:"0.85rem 0.9rem",
            transition:"all 0.35s ease",
            boxShadow:isA?`0 0 22px ${tc.bg}50,inset 0 0 14px ${tc.bg}0a`:"none",
          }}>
            {/* Header row */}
            <div style={{display:"flex",alignItems:"center",gap:"0.55rem",marginBottom:"0.45rem"}}>
              <div style={{
                width:"0.7rem",height:"0.7rem",borderRadius:"50%",
                background:tc.bg,
                boxShadow:isA?`0 0 8px ${tc.bg},0 0 16px ${tc.bg}66`:`0 0 4px ${tc.bg}`,
                transition:"box-shadow 0.3s",
              }} />
              <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.8rem",color:isA?tc.light:"rgba(255,255,255,0.7)",fontWeight:isA?700:400,flex:1}}>{team.name}</span>
              {isA&&<span style={{fontSize:"0.58rem",background:`linear-gradient(90deg,${tc.bg},${tc.dark})`,color:"#fff",borderRadius:"0.4rem",padding:"0.15rem 0.55rem",letterSpacing:"0.1em",fontFamily:"'Cinzel',serif",boxShadow:`0 2px 8px ${tc.bg}55`,animation:"shimmer 1.8s ease-in-out infinite"}}>▶ TURN</span>}
              {team.skipNext&&<span style={{fontSize:"0.58rem",background:"#7f1d1d",color:"#fca5a5",borderRadius:"0.4rem",padding:"0.15rem 0.5rem",fontFamily:"'Cinzel',serif"}}>SKIP</span>}
              {team.doubleNext&&<span style={{fontSize:"0.58rem",background:"#1e3a8a",color:"#93c5fd",borderRadius:"0.4rem",padding:"0.15rem 0.5rem",fontFamily:"'Cinzel',serif"}}>×2</span>}
            </div>

            {/* Progress bar + stats */}
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.4rem"}}>
              <div style={{flex:1,height:"0.32rem",background:"rgba(255,255,255,0.07)",borderRadius:"0.2rem",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${tc.bg},${tc.light})`,borderRadius:"0.2rem",transition:"width 0.6s cubic-bezier(0.34,1.56,0.64,1)"}} />
              </div>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.6rem",color:pct>0?tc.light:"rgba(255,255,255,0.25)",fontWeight:700,minWidth:"2.2rem",textAlign:"right"}}>{col.length}/{total}</span>
            </div>
            <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.28)",marginBottom:"0.5rem"}}>
              Square {team.position+1} · {pct}% collected
            </div>

            {/* Role badges (compact) */}
            {activeRoleEntries.length>0&&(
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem",marginBottom:"0.55rem"}}>
                {activeRoleEntries.map(([roleId,player])=>{
                  const role=ROLES.find(r=>r.id===roleId);
                  if(!role)return null;
                  return(
                    <div key={roleId} title={`${role.name}: ${player}`} style={{
                      display:"flex",alignItems:"center",gap:"0.25rem",
                      background:`${role.color}12`,
                      border:`1px solid ${role.color}30`,
                      borderRadius:"0.4rem",
                      padding:"0.12rem 0.45rem",
                    }}>
                      <span style={{fontSize:"0.75rem"}}>{role.emoji}</span>
                      <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.55rem",color:role.color,fontWeight:700,maxWidth:"3.5rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{player}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Organism grid */}
            <div style={{display:"flex",flexWrap:"wrap",gap:"0.22rem"}}>
              {eco.organisms.map(org=>{
                const has=col.find(c=>c.id===org.id);
                return(
                  <div key={org.id} title={has?`${org.name} (${org.role})`:org.name} style={{
                    width:"1.75rem",height:"1.75rem",
                    borderRadius:"0.4rem",
                    background:has?`${tc.bg}18`:"rgba(255,255,255,0.025)",
                    border:`1px solid ${has?tc.bg+"55":"rgba(255,255,255,0.05)"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:"0.95rem",
                    opacity:has?1:0.18,
                    transition:"all 0.4s ease",
                    boxShadow:has?`0 0 8px ${tc.bg}44`:"none",
                    animation:has?"popIn 0.4s ease":undefined,
                  }}>{org.emoji}</div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── DICE ───────────────────────────────────────────
const DICE_DOTS = {
  1: [[50,50]],
  2: [[28,28],[72,72]],
  3: [[28,28],[50,50],[72,72]],
  4: [[28,28],[72,28],[28,72],[72,72]],
  5: [[28,28],[72,28],[50,50],[28,72],[72,72]],
  6: [[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]],
};
function Dice({ value, rolling, teamColor }) {
  const dots = value ? DICE_DOTS[value] : null;
  const color = teamColor || "rgba(255,255,255,0.15)";
  return (
    <div style={{
      width:"5rem", height:"5rem",
      borderRadius:"1rem",
      background: value
        ? "linear-gradient(145deg,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.05) 100%)"
        : "rgba(255,255,255,0.06)",
      border:`2px solid ${value ? color+"bb" : "rgba(255,255,255,0.15)"}`,
      boxShadow: value
        ? `0 4px 28px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.18),0 0 20px ${color}55`
        : "0 4px 16px rgba(0,0,0,0.3)",
      position:"relative",
      flexShrink:0,
      animation: rolling ? "diceRoll 0.18s linear infinite" : value ? "popIn 0.3s ease" : undefined,
      transition:"border-color 0.3s,box-shadow 0.3s",
      willChange:"transform",
      transformOrigin:"center center",
    }}>
      {!dots ? (
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",opacity:0.35}}>🎲</div>
      ) : (
        dots.map(([x,y],i) => (
          <div key={i} style={{
            position:"absolute",
            left:`${x}%`, top:`${y}%`,
            transform:"translate(-50%,-50%)",
            width:"0.75rem", height:"0.75rem",
            borderRadius:"50%",
            background:"#fff",
            boxShadow:`0 1px 4px rgba(0,0,0,0.7),0 0 8px ${color}99`,
          }} />
        ))
      )}
    </div>
  );
}

// ── GAME SCREEN ─────────────────────────────────────

export { WowFactsModal, ChallengeModal, WildcardModal, TeamPanel, DICE_DOTS, Dice };
