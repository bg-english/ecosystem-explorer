import { useState, useEffect, useRef, useMemo } from "react";
import { TEAM_COLORS, SFX, WOW_FACTS, generateBoard } from "./constants";
import { ECOSYSTEMS } from "./ecosystems";
import { ECO_IMAGES, shuffle, pick } from "./utils";
import IsometricBoard from "./IsometricBoard";
import { WowFactsModal, ChallengeModal, WildcardModal, TeamPanel, Dice } from "./Modals";
import { FoodWebChallenge } from "./Challenges";

function GameScreen({ ecosystem, initTeams, firstTeamIdx, onEnd }) {
  const eco=ECOSYSTEMS[ecosystem.id];
  const N_BOARD = eco.boardSize;
  const board = useMemo(() => generateBoard(N_BOARD), [N_BOARD]);
  const [teams,setTeams]=useState(()=>initTeams.map(t=>({...t,position:0,organisms:[],skipNext:false,doubleNext:false})));
  const [curIdx,setCurIdx]=useState(firstTeamIdx);
  const [phase,setPhase]=useState("idle");
  const [diceVal,setDiceVal]=useState(null);
  const [rolling,setRolling]=useState(false);
  const [activeCell,setActiveCell]=useState(null);
  const [wildcardResolved,setWildcardResolved]=useState(null); // precomputed steal/free info
  const [pendingOrg,setPendingOrg]=useState(null);
  const [turn,setTurn]=useState(1);
  const [narrativePopup, setNarrativePopup] = useState(null);
  const [revealedChapters, setRevealedChapters] = useState(new Set([0]));
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers,   setTotalAnswers]   = useState(0);
  // ── Responsive ────────────────────────────────────
  const [bpWidth, setBpWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const handler = () => setBpWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const isMobile  = bpWidth < 768;   // phones + small tablets (portrait)
  const isXS      = bpWidth < 480;   // small phones (iPhone SE, Galaxy S)
  const isTablet  = bpWidth >= 768 && bpWidth < 1024; // iPad portrait, mid tablets
  // ── Collapse Emergency System ──────────────────────
  const [collapseCount, setCollapseCount]       = useState(0);
  const [collapseEmergency, setCollapseEmergency] = useState(null);
  // collapseEmergency: { queue:[teamIdx,...], qIdx:int, trigIdx:int, alertShown:bool } | null
  const [ecosystemDestroyed, setEcosystemDestroyed] = useState(false);
  const [muted, setMuted] = useState(false);
  const toggleMute = () => { const next = !muted; setMuted(next); SFX.setEnabled(!next); };
  const wasCollapsedRef  = useRef(false);
  const collapseCountRef = useRef(0);
  const wowCallbackRef   = useRef(null);
  const [wowModal, setWowModal] = useState(null);
  // wowModal: { fact:{science,faith}, context:"foodweb"|"restoration"|"victory" } | null
  const curTeam=teams[curIdx];
  const tc=TEAM_COLORS[curTeam?.colorIdx||0];

  // ── Ecosystem Health ─────────────────────────────────
  const healthPct = totalAnswers === 0 ? 100 : Math.round((correctAnswers / totalAnswers) * 100);
  const healthStatus = healthPct >= 80
    ? { label:"Thriving",  icon:"🌟", color:"#4ade80", msg:"The Garden is flourishing. The gourd is growing.",        state:"thriving"  }
    : healthPct >= 60
    ? { label:"Stable",    icon:"🌿", color:"#86efac", msg:"The Garden holds on. But the gourd needs care.",          state:"stable"    }
    : healthPct >= 40
    ? { label:"Stressed",  icon:"⚠️", color:"#fbbf24", msg:"The gourds are withering. The chains are breaking.",      state:"stressed"  }
    : { label:"Collapsed", icon:"🥀", color:"#f87171", msg:"The Garden has lost its guardian. The Builder must rise.", state:"collapsed" };
  const isCollapsed = healthStatus.state === "collapsed";

  // ── Collapse Emergency Trigger ────────────────────
  useEffect(()=>{
    if(isCollapsed && !wasCollapsedRef.current && !collapseEmergency && !ecosystemDestroyed){
      wasCollapsedRef.current = true;
      const newCount = collapseCountRef.current + 1;
      collapseCountRef.current = newCount;
      setCollapseCount(newCount);
      SFX.collapse();
      if(newCount > 2){
        setEcosystemDestroyed(true);
        return;
      }
      // Build queue: all teams except the one that caused collapse, in turn order
      const queue=[];
      for(let i=1;i<teams.length;i++) queue.push((curIdx+i)%teams.length);
      setCollapseEmergency({ queue, qIdx:0, trigIdx:curIdx, alertShown:false });
    } else if(!isCollapsed && wasCollapsedRef.current){
      wasCollapsedRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[isCollapsed]);

  // ── Non-repeating question queues (one shuffled deck per challenge type) ──
  const queues = useRef({});
  const pickFresh = (type) => {
    const pool = eco.challenges[type];
    if (!pool || pool.length === 0) return null;
    if (!queues.current[type] || queues.current[type].length === 0) {
      queues.current[type] = shuffle([...Array(pool.length).keys()]);
    }
    const idx = queues.current[type].pop();
    return pool[idx];
  };

  // Show a random WOW fact for the current ecosystem, then run callback on dismiss
  const showWow = (context, callback) => {
    const facts = WOW_FACTS[ecosystem.id] || [];
    if (facts.length === 0) { callback(); return; }
    const fact = facts[Math.floor(Math.random() * facts.length)];
    wowCallbackRef.current = callback;
    setWowModal({ fact, context });
  };

  const handleWowDone = () => {
    setWowModal(null);
    const cb = wowCallbackRef.current;
    wowCallbackRef.current = null;
    if (cb) cb();
  };

  const [activeChallenge, setActiveChallenge] = useState(null);

  const getUncollected=team=>{const ids=team.organisms.map(o=>o.id);return eco.organisms.filter(o=>!ids.includes(o.id));};

  const rollDice=()=>{
    if(phase!=="idle")return;
    setRolling(true);setPhase("rolling");
    let ticks=0;
    const iv=setInterval(()=>{
      SFX.tick();
      setDiceVal(Math.floor(Math.random()*6)+1);ticks++;
      if(ticks>10){clearInterval(iv);const v=Math.floor(Math.random()*6)+1;setDiceVal(v);setRolling(false);SFX.diceResult();setTimeout(()=>moveTeam(v),300);}
    },100);
  };

  const moveTeam=steps=>{
    const team=teams[curIdx];
    const newPos=Math.min(team.position+steps,N_BOARD-1);
    setTeams(prev=>{const u=[...prev];u[curIdx]={...u[curIdx],position:newPos};return u;});
    // Chapter narrative
    const chapterIdx=Math.floor(newPos/6);
    if(!revealedChapters.has(chapterIdx)){
      const chapter=eco.chapters?.[chapterIdx];
      if(chapter){
        setRevealedChapters(prev=>new Set([...prev,chapterIdx]));
        setNarrativePopup(chapter);
        setTimeout(()=>setNarrativePopup(null),4500);
      }
    }
    const cell=board[newPos];
    setTimeout(()=>{
      if(cell.type==="center"){showWow("victory", ()=>setPhase("center"));}
      else if(cell.type==="wildcard"){
          // precompute steal/free so modal can show organism name
          let resolved=null;
          if(cell.fx==="free"){
            const uncol=getUncollected(teams[curIdx]);
            if(uncol.length>0){const org=pick(uncol);resolved={org};}
          } else if(cell.fx==="steal"){
            let richIdx=-1;
            teams.forEach((t,i)=>{if(i!==curIdx&&(richIdx===-1||t.organisms.length>teams[richIdx].organisms.length))richIdx=i;});
            if(richIdx!==-1&&teams[richIdx].organisms.length>0){
              const org=teams[richIdx].organisms[teams[richIdx].organisms.length-1];
              resolved={org,fromTeamIdx:richIdx};
            }
          }
          setWildcardResolved(resolved);
          setActiveCell(cell);setPhase("wildcard");
        }
      else if(cell.type==="start"){nextTurn();}
      else{
          // foodweb: fall back to trivia if The Builder is not assigned on this team
          let effectiveCell=cell;
          if(cell.type==="foodweb"&&!(teams[curIdx].roleAssignments||{}).builder){effectiveCell={...cell,type:"trivia"};}
          const uncol=getUncollected(teams[curIdx]);
          setPendingOrg(uncol.length>0?pick(uncol):null);
          setActiveChallenge(effectiveCell.type==="foodweb"?null:pickFresh(effectiveCell.type));
          setActiveCell(effectiveCell);
          setPhase("challenge");
        }
    },500);
  };

  const handleWildcardDone=()=>{
    const cell=activeCell;if(!cell){nextTurn();return;}
    const res=wildcardResolved;
    if(cell.fx==="advance")setTeams(p=>{const u=[...p];u[curIdx]={...u[curIdx],position:Math.min(u[curIdx].position+cell.val,N_BOARD-1)};return u;});
    else if(cell.fx==="back")setTeams(p=>{const u=[...p];u[curIdx]={...u[curIdx],position:Math.max(0,u[curIdx].position-cell.val)};return u;});
    else if(cell.fx==="skip")setTeams(p=>{const u=[...p];u[curIdx]={...u[curIdx],skipNext:true};return u;});
    else if(cell.fx==="free"&&res?.org)setTeams(p=>{const u=[...p];u[curIdx]={...u[curIdx],organisms:[...u[curIdx].organisms,res.org]};return u;});
    else if(cell.fx==="steal"&&res?.org&&res?.fromTeamIdx!=null){setTeams(p=>{const u=[...p];u[curIdx]={...u[curIdx],organisms:[...u[curIdx].organisms,res.org]};u[res.fromTeamIdx]={...u[res.fromTeamIdx],organisms:u[res.fromTeamIdx].organisms.filter(o=>o.id!==res.org.id)};return u;});}
    else if(cell.fx==="double")setTeams(p=>{const u=[...p];u[curIdx]={...u[curIdx],doubleNext:true};return u;});
    setActiveCell(null);setWildcardResolved(null);nextTurn();
  };

  const handleChallengeResult=(won,org)=>{
    setTotalAnswers(c=>c+1);
    const isFoodweb = activeCell?.type === "foodweb";
    if(won&&org){
      setCorrectAnswers(c=>c+1);
      const isDouble=teams[curIdx].doubleNext;
      setTeams(p=>{const u=[...p];const newOrgs=[...u[curIdx].organisms];if(!newOrgs.find(o=>o.id===org.id))newOrgs.push(org);if(isDouble){const u2=eco.organisms.filter(o=>!newOrgs.find(n=>n.id===o.id));if(u2.length>0)newOrgs.push(pick(u2));}u[curIdx]={...u[curIdx],organisms:newOrgs,doubleNext:false};return u;});
    } else {
      // Reset doubleNext even on loss — otherwise the bonus persists forever
      if(teams[curIdx].doubleNext) setTeams(p=>{const u=[...p];u[curIdx]={...u[curIdx],doubleNext:false};return u;});
    }
    setPendingOrg(null);setActiveCell(null);
    if(won && isFoodweb){
      showWow("foodweb", ()=>nextTurn());
    } else {
      nextTurn();
    }
  };

  const nextTurn=()=>{
    setPhase("idle");setDiceVal(null);setTurn(t=>t+1);
    let next=(curIdx+1)%teams.length;
    while(teams[next]?.skipNext){setTeams(p=>{const u=[...p];u[next]={...u[next],skipNext:false};return u;});next=(next+1)%teams.length;}
    setCurIdx(next);
  };

  if(ecosystemDestroyed) return <EcosystemDestroyedScreen ecosystem={ecosystem} teams={teams} onRestart={onEnd} />;
  if(phase==="center")return <VictoryScreen teams={teams} ecosystem={ecosystem} winner={teams[curIdx]} onRestart={onEnd} />;

  // Revealed ecosystem elements (unique per chapter)
  const revealedElements = [...revealedChapters]
    .sort((a,b)=>a-b)
    .map(i=>eco.chapters?.[i])
    .filter(Boolean)
    .filter(c=>c.element!=="🌑");

  return(
    <div style={{height:"100vh",background:eco.bg,fontFamily:"'Libre Baskerville',serif",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Top bar */}
      <div style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${isCollapsed?"rgba(239,68,68,0.35)":"rgba(255,255,255,0.06)"}`,padding:isXS?"0.3rem 0.5rem":isMobile?"0.4rem 0.65rem":"0.65rem 1.2rem",display:"flex",alignItems:"center",gap:isXS?"0.3rem":isMobile?"0.45rem":"0.85rem",flexShrink:0,transition:"border-color 0.5s",flexWrap:"nowrap",minHeight:"unset",overflow:"hidden"}}>
        <span style={{fontSize:isMobile?"1.2rem":"1.6rem"}}>{eco.emoji}</span>
        <div style={{minWidth:0}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:isXS?"0.65rem":isMobile?"0.78rem":"1rem",color:"#fff",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:isXS?"70px":isMobile?"120px":"unset"}}>{eco.name}</div>
          <div style={{fontSize:isMobile?"0.55rem":"0.65rem",color:"rgba(255,255,255,0.4)",letterSpacing:"0.1em"}}>Turn {turn} · {curTeam?.position+1}/{N_BOARD}</div>
        </div>
        {/* Revealed elements strip — hide on very small screens */}
        {!isMobile&&<div style={{display:"flex",gap:"0.35rem",marginLeft:"0.9rem",flexWrap:"wrap",maxWidth:"10rem"}}>
          {revealedElements.map((ch,i)=>(
            <span key={i} title={ch.title} style={{fontSize:"1.2rem",animation:"popIn 0.4s ease",filter:`drop-shadow(0 0 6px ${eco.glow})`}}>{ch.element}</span>
          ))}
        </div>}

        {/* ── ECOSYSTEM HEALTH WIDGET ── */}
        {totalAnswers > 0 && (
          <div title={healthStatus.msg} style={{display:"flex",alignItems:"center",gap:"0.55rem",background:`${healthStatus.color}10`,border:`1px solid ${healthStatus.color}35`,borderRadius:"0.75rem",padding:"0.3rem 0.75rem",flexShrink:0,transition:"all 0.6s ease",boxShadow:isCollapsed?`0 0 14px rgba(239,68,68,0.35)`:"none"}}>
            <span style={{fontSize:"1.1rem",animation:isCollapsed?"chaosFloat 1.5s ease-in-out infinite":"none"}}>{healthStatus.icon}</span>
            {!isMobile&&<div>
              <div style={{display:"flex",alignItems:"center",gap:"0.45rem"}}>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.68rem",color:healthStatus.color,fontWeight:700,letterSpacing:"0.08em"}}>{healthStatus.label}</span>
                <span style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.45)"}}>{healthPct}%</span>
              </div>
              {/* Health bar */}
              <div style={{width:"5.5rem",height:"0.28rem",background:"rgba(255,255,255,0.08)",borderRadius:"0.2rem",marginTop:"0.2rem",overflow:"hidden"}}>
                <div style={{height:"100%",width:`${healthPct}%`,background:`linear-gradient(90deg,${healthPct<40?"#ef4444":healthPct<60?"#fbbf24":"#4ade80"},${healthStatus.color})`,borderRadius:"0.2rem",transition:"width 0.8s ease, background 0.8s ease"}} />
              </div>
            </div>}
            {isMobile&&<span style={{fontFamily:"'Cinzel',serif",fontSize:"0.65rem",color:healthStatus.color,fontWeight:700}}>{healthPct}%</span>}
            {!isMobile&&<span style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.25)"}}>{correctAnswers}/{totalAnswers}</span>}
          </div>
        )}

        <div style={{marginLeft:"auto",display:"flex",gap:"0.5rem",alignItems:"center"}}>
          {!isMobile&&<><div style={{width:"0.7rem",height:"0.7rem",borderRadius:"50%",background:tc.bg,boxShadow:`0 0 8px ${tc.bg}`}} />
          <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.9rem",color:tc.light,whiteSpace:"nowrap",maxWidth:"8rem",overflow:"hidden",textOverflow:"ellipsis"}}>{curTeam?.name}</span>
          <span style={{fontSize:"0.75rem",color:"rgba(255,255,255,0.35)"}}>playing</span></>}
        </div>
        <button onClick={onEnd} style={{padding:"0.35rem 0.75rem",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"0.5rem",color:"rgba(255,255,255,0.5)",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",cursor:"pointer",flexShrink:0}}>Exit</button>
        <button onClick={toggleMute} title={muted?"Unmute sounds":"Mute sounds"} style={{padding:"0.35rem 0.65rem",background:muted?"rgba(239,68,68,0.12)":"rgba(255,255,255,0.06)",border:`1px solid ${muted?"rgba(239,68,68,0.3)":"rgba(255,255,255,0.1)"}`,borderRadius:"0.5rem",color:muted?"#f87171":"rgba(255,255,255,0.5)",fontSize:"0.85rem",cursor:"pointer",transition:"all 0.2s",flexShrink:0}}>{muted?"🔇":"🔊"}</button>
      </div>

      {/* ── COLLAPSE BANNER ── */}
      {isCollapsed && (
        <div style={{background:"linear-gradient(90deg,rgba(127,29,29,0.9),rgba(69,10,10,0.9))",borderBottom:"1px solid rgba(239,68,68,0.4)",padding:"0.5rem 1.4rem",display:"flex",alignItems:"center",gap:"0.7rem",animation:"fadeUp 0.5s ease",flexShrink:0}}>
          <span style={{fontSize:"1.3rem",animation:"chaosFloat 1.2s ease-in-out infinite"}}>🥀</span>
          <div style={{flex:1}}>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"0.75rem",color:"#fca5a5",fontWeight:700,letterSpacing:"0.08em"}}>
              ECOSYSTEM COLLAPSE {collapseCount > 0 ? `(${collapseCount}/2)` : ""}
            </span>
            <span style={{fontSize:"0.72rem",color:"rgba(255,200,200,0.65)",marginLeft:"0.75rem"}}>{healthStatus.msg}</span>
          </div>
          {collapseEmergency ? (
            <div style={{background:"rgba(251,146,60,0.18)",border:"1.5px solid rgba(251,146,60,0.5)",borderRadius:"0.6rem",padding:"0.3rem 0.85rem",display:"flex",alignItems:"center",gap:"0.5rem",animation:"chaosFloat 1.5s ease-in-out infinite"}}>
              <span style={{fontSize:"1rem"}}>🏗️</span>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.62rem",color:"#fb923c",fontWeight:700,letterSpacing:"0.06em"}}>
                EMERGENCY ACTIVE — Builder {collapseEmergency.qIdx + 1}/{collapseEmergency.queue.length}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Chapter narrative popup */}
      {narrativePopup&&(
        <div style={{position:"fixed",top:"clamp(56px,10vh,72px)",left:"50%",transform:"translateX(-50%)",zIndex:150,maxWidth:"min(540px,96%)",width:"92%",background:"rgba(0,0,0,0.92)",border:`1px solid ${eco.glow}55`,borderRadius:18,overflow:"hidden",boxShadow:`0 0 40px ${eco.glow}44`,animation:"narrativeSlide 0.5s ease",backdropFilter:"blur(14px)"}}>
          {narrativePopup.img&&(
            <div style={{position:"relative",height:120,overflow:"hidden"}}>
              <img
                src={narrativePopup.img}
                alt={narrativePopup.title}
                onError={e=>{e.target.style.display="none";}}
                style={{width:"100%",height:"100%",objectFit:"cover",filter:`saturate(1.2) brightness(0.75) hue-rotate(${eco.glow==="transparent"?0:0}deg)`}}
              />
              <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.85) 100%)`}}/>
              <div style={{position:"absolute",bottom:10,left:16,fontFamily:"'Cinzel',serif",fontSize:13,color:eco.color,letterSpacing:"0.15em",fontWeight:700,textShadow:"0 1px 6px rgba(0,0,0,0.9)"}}>{narrativePopup.title}</div>
              <div style={{position:"absolute",top:8,right:10,fontSize:24,filter:`drop-shadow(0 0 8px ${eco.glow})`}}>{narrativePopup.element}</div>
            </div>
          )}
          <div style={{padding:"14px 20px",display:"flex",alignItems:"flex-start",gap:12}}>
            {!narrativePopup.img&&<span style={{fontSize:28,filter:`drop-shadow(0 0 8px ${eco.glow})`,flexShrink:0,marginTop:2}}>{narrativePopup.element}</span>}
            <div>
              {!narrativePopup.img&&<div style={{fontFamily:"'Cinzel',serif",fontSize:11,color:eco.color,letterSpacing:"0.2em",marginBottom:5}}>{narrativePopup.title}</div>}
              <div style={{fontSize:13,color:"rgba(255,245,210,0.9)",lineHeight:1.6,fontStyle:"italic"}}>{narrativePopup.narrative}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{flex:1,display:"flex",overflow:"hidden",flexDirection:isMobile?"column":"row"}}>
        {/* Board area */}
        <div style={{flex:1,position:"relative",overflow:"hidden",minHeight:isMobile?"0":"unset"}}>

          {/* ── ECOSYSTEM BACKGROUND: organisms appear as they're collected ── */}
          <div style={{position:"absolute",inset:0,zIndex:0,overflow:"hidden"}}>
            {/* Ecosystem background image or gradient fallback */}
            {ECO_IMAGES[eco.id] ? (
              <img
                src={ECO_IMAGES[eco.id]}
                alt=""
                style={{
                  position:"absolute",inset:0,width:"100%",height:"100%",
                  objectFit:"cover",
                  filter:"brightness(0.82) saturate(1.1)",
                }}
              />
            ) : (
              <div style={{position:"absolute",inset:0,background:eco.bg}} />
            )}
            {/* Dark center vignette so board tiles in center read clearly */}
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.55) 25%, rgba(0,0,0,0.1) 75%)",pointerEvents:"none"}} />
          </div>

          <div style={{position:"absolute",inset:0,zIndex:1}}>
            <IsometricBoard teams={teams} currentTeamIdx={curIdx} board={board} gridSize={eco.gridSize} hasImage={!!ECO_IMAGES[eco.id]} />
          </div>
        </div>

        {/* Right sidebar / Mobile bottom panel */}
        <div style={{
          width: isMobile ? "100%" : isTablet ? "14rem" : "18rem",
          height: isMobile ? "auto" : undefined,
          maxHeight: isMobile ? (isXS ? "32vh" : "36vh") : undefined,
          background:"rgba(0,0,0,0.5)",
          borderLeft: isMobile ? "none" : "1px solid rgba(255,255,255,0.07)",
          borderTop: isMobile ? "1px solid rgba(255,255,255,0.1)" : "none",
          padding: isMobile ? "0.5rem 0.65rem" : isTablet ? "0.75rem 0.75rem" : "1rem 0.9rem",
          overflowY:"auto",
          flexShrink:0,
          display:"flex",
          flexDirection: isMobile ? "row" : "column",
          gap: isMobile ? "0.75rem" : undefined,
          alignItems: isMobile ? "flex-start" : undefined,
        }}>
          {/* Teams section */}
          <div style={{flex:1,minWidth:0,display:"flex",flexDirection:"column"}}>
            {!isMobile&&<div style={{fontSize:"0.6rem",letterSpacing:"0.28em",color:"rgba(255,255,255,0.28)",marginBottom:"0.8rem",display:"flex",alignItems:"center",gap:"0.5rem"}}>
              <span>TEAMS</span>
              <div style={{flex:1,height:1,background:"rgba(255,255,255,0.08)"}}/>
              <span style={{fontSize:"0.58rem",color:eco.color,opacity:0.7}}>{eco.name.toUpperCase()}</span>
            </div>}
            <div style={{flex:1,overflow:"hidden"}}>
              <TeamPanel teams={teams} currentTeamIdx={curIdx} ecosystem={ecosystem} compact={isMobile} />
            </div>
          </div>

          {/* ── Dice panel ── */}
          <div style={{
            marginTop: isMobile ? 0 : "0.9rem",
            paddingTop: isMobile ? 0 : "0.9rem",
            borderTop: isMobile ? "none" : "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
            width: isMobile ? "auto" : undefined,
            minWidth: isMobile ? "140px" : undefined,
          }}>
            {/* Turn info */}
            <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:tc.bg,boxShadow:`0 0 7px ${tc.bg}`,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:isMobile?"0.7rem":"0.8rem",color:tc.light,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{curTeam?.name}</div>
                {!isMobile&&curTeam?.players?.length>0&&<div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.35)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{curTeam.players.join(" · ")}</div>}
              </div>
              {diceVal&&<div style={{textAlign:"center",animation:"fadeUp 0.3s ease",flexShrink:0}}>
                <div style={{fontSize:"0.52rem",color:"rgba(255,255,255,0.35)",letterSpacing:"0.15em",marginBottom:1}}>ROLLED</div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"1.6rem",color:tc.light,fontWeight:700,lineHeight:1,textShadow:`0 0 14px ${tc.bg}`}}>{diceVal}</div>
              </div>}
            </div>
            {/* Dice + button row */}
            <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
              <div style={{width:isXS?"3.2rem":isMobile?"4rem":"5rem",height:isXS?"3.2rem":isMobile?"4rem":"5rem",flexShrink:0,position:"relative",isolation:"isolate"}}>
                <Dice value={diceVal} rolling={rolling} teamColor={tc.bg} />
              </div>
              <button onClick={rollDice} disabled={phase!=="idle"} style={{
                flex:1,padding:isMobile?"0.5rem 0":"0.65rem 0",
                background:phase==="idle"?`linear-gradient(135deg,${tc.bg},${tc.dark})`:"rgba(255,255,255,0.05)",
                border:"none",borderRadius:"0.7rem",
                color:phase==="idle"?"#fff":"rgba(255,255,255,0.3)",
                fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:isXS?"0.65rem":isMobile?"0.75rem":"0.85rem",
                cursor:phase==="idle"?"pointer":"not-allowed",
                letterSpacing:"0.08em",
                boxShadow:phase==="idle"?`0 4px 18px ${tc.bg}66`:"none",
                transition:"all 0.25s",
                whiteSpace:"nowrap",
              }}>
                {phase==="idle"?"🎲 Roll":phase==="rolling"?"Rolling…":"Wait…"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {phase==="challenge"&&activeCell&&<ChallengeModal cell={activeCell} ecosystem={ecosystem} team={curTeam} pendingOrganism={pendingOrg} onResult={handleChallengeResult} challenge={activeChallenge} />}
      {phase==="wildcard"&&activeCell&&<WildcardModal cell={activeCell} resolved={wildcardResolved} teams={teams} curIdx={curIdx} onDone={handleWildcardDone} />}
      {wowModal&&<WowFactsModal fact={wowModal.fact} ecosystem={ecosystem} context={wowModal.context} onDone={handleWowDone} />}

      {/* ── RESTORATION MODAL ── */}
      {/* ── COLLAPSE EMERGENCY MODAL ── */}
      {collapseEmergency && (()=>{
        const ce = collapseEmergency;
        const activeTeamIdx = ce.queue[ce.qIdx];
        const activeTeam = teams[activeTeamIdx];
        const builderName = (activeTeam?.roleAssignments||{}).builder || "The Builder";
        const tc2 = TEAM_COLORS[activeTeam?.colorIdx||0];

        const handleBuilderResult = (won) => {
          if(won){
            // Restore health to ~66% (Stable)
            setCorrectAnswers(prev=>Math.max(prev, Math.round(totalAnswers*0.66)));
            // Bonus organism for winning team
            const uncol = eco.organisms.filter(o=>!activeTeam.organisms.find(x=>x.id===o.id));
            if(uncol.length>0){
              const org=pick(uncol);
              setTeams(p=>{const u=[...p];u[activeTeamIdx]={...u[activeTeamIdx],organisms:[...u[activeTeamIdx].organisms,org]};return u;});
            }
            // Winning team plays next (bonus turn)
            setCurIdx(activeTeamIdx);
            setPhase("idle");
            setCollapseEmergency(null);
            showWow("restoration", ()=>{});
          } else {
            const nextQIdx = ce.qIdx + 1;
            if(nextQIdx >= ce.queue.length){
              // All builders failed → ecosystem destroyed
              setEcosystemDestroyed(true);
              setCollapseEmergency(null);
            } else {
              setCollapseEmergency({...ce, qIdx: nextQIdx, alertShown: false});
            }
          }
        };

        if(!ce.alertShown){
          // Phase 1: Dramatic ALL-PLAYERS alert
          return(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:"clamp(0.75rem,3vw,1.5rem)",overflowY:"auto"}}>
              <div style={{maxWidth:"36rem",width:"100%",textAlign:"center",animation:"popIn 0.5s ease"}}>
                <div style={{fontSize:"4rem",animation:"chaosFloat 1s ease-in-out infinite",marginBottom:"1rem"}}>🚨</div>
                <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"1.4rem",color:"#f87171",letterSpacing:"0.1em",marginBottom:"0.5rem",textShadow:"0 0 30px rgba(248,113,113,0.8)"}}>
                  ECOSYSTEM EMERGENCY
                </div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.85rem",color:"rgba(255,255,255,0.5)",letterSpacing:"0.15em",marginBottom:"2rem"}}>
                  ALL PLAYERS — ATTENTION REQUIRED
                </div>
                <div style={{background:"rgba(127,29,29,0.4)",border:"1px solid rgba(248,113,113,0.35)",borderRadius:"1rem",padding:"1.2rem",marginBottom:"2rem"}}>
                  <p style={{color:"rgba(255,220,220,0.85)",fontFamily:"'Libre Baskerville',serif",fontSize:"0.9rem",lineHeight:1.7,margin:0}}>
                    The ecosystem is collapsing! <strong style={{color:"#f87171"}}>All Builders</strong> must attempt to restore it — 
                    starting with <strong style={{color:tc2.light}}>{activeTeam?.name}</strong>'s Builder.
                    If all Builders fail, the ecosystem will be destroyed.
                  </p>
                </div>
                {/* Queue preview */}
                <div style={{display:"flex",gap:"0.6rem",justifyContent:"center",marginBottom:"2rem",flexWrap:"wrap"}}>
                  {ce.queue.map((tIdx,i)=>{
                    const t=teams[tIdx]; const tc3=TEAM_COLORS[t?.colorIdx||0];
                    return(
                      <div key={tIdx} style={{background:i===0?`${tc3.bg}30`:"rgba(255,255,255,0.05)",border:`1.5px solid ${i===0?tc3.bg:"rgba(255,255,255,0.12)"}`,borderRadius:"0.6rem",padding:"0.4rem 0.8rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                        <span style={{fontSize:"1rem"}}>🏗️</span>
                        <div>
                          <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.65rem",color:i===0?tc3.light:"rgba(255,255,255,0.5)",fontWeight:700}}>{t?.name}</div>
                          <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.35)"}}>{(t?.roleAssignments||{}).builder||"Builder"}</div>
                        </div>
                        {i===0&&<span style={{fontSize:"0.7rem",color:tc3.light,fontFamily:"'Cinzel',serif",fontWeight:700,marginLeft:2}}>▶ FIRST</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.7rem",color:"rgba(255,255,255,0.3)",marginBottom:"1.5rem",letterSpacing:"0.1em"}}>
                  COLLAPSE {collapseCount}/2
                </div>
                <button
                  onClick={()=>setCollapseEmergency({...ce, alertShown:true})}
                  style={{padding:"0.9rem 2.5rem",background:"linear-gradient(135deg,rgba(251,146,60,0.4),rgba(234,88,12,0.5))",border:"2px solid rgba(251,146,60,0.7)",borderRadius:"0.85rem",color:"#fb923c",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:"0.95rem",cursor:"pointer",letterSpacing:"0.1em",boxShadow:"0 0 30px rgba(251,146,60,0.3)"}}>
                  🏗️ {activeTeam?.name} — Begin Restoration
                </button>
              </div>
            </div>
          );
        }

        // Phase 2: Builder challenge
        return(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:"clamp(0.75rem,3vw,1.5rem)",overflowY:"auto"}}>
            <div style={{background:"#0a0f1a",border:`2px solid ${tc2.bg}66`,borderRadius:"1.3rem",padding:"clamp(1rem,3vw,1.8rem)",maxWidth:"48rem",width:"100%",boxShadow:`0 0 60px ${tc2.bg}33`,maxHeight:"92dvh",overflowY:"auto"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.9rem",marginBottom:"1.2rem"}}>
                <div style={{width:"3rem",height:"3rem",borderRadius:"0.8rem",background:"#1a0800",border:"2px solid rgba(251,146,60,0.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem"}}>🕸️</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:"1rem",color:"#fb923c",letterSpacing:"0.1em",fontWeight:700}}>EMERGENCY RESTORATION</div>
                  <div style={{fontSize:"0.8rem",color:"rgba(255,255,255,0.45)"}}>Nehemiah 2:18 — "Rise up and build"</div>
                </div>
                <div style={{background:`${tc2.bg}22`,border:`1px solid ${tc2.bg}55`,borderRadius:"0.7rem",padding:"0.3rem 0.7rem",display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:"0.6rem",height:"0.6rem",borderRadius:"50%",background:tc2.bg}} />
                  <div>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:"0.72rem",color:tc2.light,fontWeight:700}}>{activeTeam?.name}</div>
                    <div style={{fontSize:"0.63rem",color:"rgba(255,255,255,0.5)"}}>👤 {builderName}</div>
                    <div style={{fontSize:"0.58rem",color:"rgba(255,180,100,0.6)"}}>Builder {ce.qIdx+1} of {ce.queue.length}</div>
                  </div>
                </div>
              </div>
              <FoodWebChallenge ecosystem={ecosystem} isRestoration={true} onResult={handleBuilderResult} />
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── ECOSYSTEM DESTROYED ──────────────────────────────

export default GameScreen;
