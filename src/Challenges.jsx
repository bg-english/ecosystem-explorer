import { useState, useEffect, useRef, useMemo } from "react";
import { shuffle } from "./utils";
import { ECOSYSTEMS } from "./ecosystems";

function TimerBar({ timeLimit, onExpire, paused }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const expiredRef = useRef(false);
  const pausedRef  = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const iv = setInterval(() => {
      if (pausedRef.current) return;
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(iv);
          if (!expiredRef.current) { expiredRef.current = true; onExpire(); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const pct = timeLeft / timeLimit;
  const color = pct > 0.5 ? "#4ade80" : pct > 0.25 ? "#fbbf24" : "#f87171";
  const urgent = pct <= 0.25;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", fontFamily:"'Cinzel',serif" }}>TIME</span>
        <span style={{
          fontFamily:"'Cinzel',serif", fontSize:13, fontWeight:700,
          color, animation: urgent ? "chaosFloat 0.6s ease-in-out infinite" : "none",
        }}>{timeLeft}s</span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pct*100}%`,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          borderRadius:2,
          transition:"width 0.9s linear, background 0.5s",
          boxShadow: urgent ? `0 0 8px ${color}` : "none",
        }} />
      </div>
    </div>
  );
}

function TriviaChallenge({ data, onResult, timeLimit=30 }) {
  const [sel,setSel]=useState(null);
  const [answered,setAnswered]=useState(false);
  const submit=idx=>{if(answered)return;setSel(idx);setAnswered(true);setTimeout(()=>onResult(idx===data.a),1500);};
  const handleExpire=()=>{if(!answered){setAnswered(true);setSel(-1);setTimeout(()=>onResult(false),1200);}};
  const LETTERS=["A","B","C","D"];
  return(
    <div>
      <TimerBar timeLimit={timeLimit} onExpire={handleExpire} paused={answered} />
      <p style={{fontSize:16,color:"rgba(255,255,255,0.95)",lineHeight:1.65,fontFamily:"'Libre Baskerville',serif",fontWeight:700,marginBottom:20,padding:"0 2px"}}>{data.q}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {data.opts.map((opt,i)=>{
          const isCorrect=answered&&i===data.a;
          const isWrong=answered&&i===sel&&i!==data.a;
          const idle=!answered;
          return(
            <button key={i} onClick={()=>submit(i)} style={{
              background:isCorrect?"rgba(22,163,74,0.22)":isWrong?"rgba(239,68,68,0.18)":"rgba(255,255,255,0.05)",
              border:`1.5px solid ${isCorrect?"#22c55e":isWrong?"#ef4444":"rgba(255,255,255,0.1)"}`,
              borderRadius:12,padding:"12px 14px",
              color:isCorrect?"#4ade80":isWrong?"#f87171":"rgba(255,255,255,0.85)",
              fontFamily:"'Libre Baskerville',serif",fontSize:13.5,
              textAlign:"left",cursor:answered?"default":"pointer",
              transition:"all 0.18s",
              display:"flex",gap:11,alignItems:"center",
              boxShadow:isCorrect?"0 0 14px rgba(34,197,94,0.2)":isWrong?"0 0 10px rgba(239,68,68,0.15)":"none",
            }}>
              <span style={{
                minWidth:26,height:26,borderRadius:8,flexShrink:0,
                background:isCorrect?"rgba(34,197,94,0.25)":isWrong?"rgba(239,68,68,0.25)":"rgba(255,255,255,0.1)",
                border:`1px solid ${isCorrect?"rgba(34,197,94,0.5)":isWrong?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.15)"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontFamily:"'Cinzel',serif",fontWeight:700,
                color:isCorrect?"#4ade80":isWrong?"#f87171":"rgba(255,255,255,0.5)",
              }}>{LETTERS[i]}</span>
              <span style={{lineHeight:1.4}}>{opt}</span>
            </button>
          );
        })}
      </div>
      {answered&&<div style={{marginTop:14,padding:"11px 15px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.65,fontFamily:"'Libre Baskerville',serif"}}>💡 {data.exp||"Well answered!"}</div>}
    </div>
  );
}

function IdentifyChallenge({ data, onResult, timeLimit=30 }) {
  const [sel,setSel]=useState(null);
  const [answered,setAnswered]=useState(false);
  const [imgFailed,setImgFailed]=useState(false);
  const submit=opt=>{if(answered)return;setSel(opt);setAnswered(true);setTimeout(()=>onResult(opt===data.answer),1500);};
  const handleExpire=()=>{if(!answered){setAnswered(true);setSel(null);setTimeout(()=>onResult(false),1200);}};
  const showPhoto=data.img&&!imgFailed;
  return(
    <div>
      <div style={{textAlign:"center",marginBottom:16}}>
        {showPhoto?(
          <div style={{position:"relative",marginBottom:10,borderRadius:14,overflow:"hidden",height:160,background:"rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.12)"}}>
            <img
              src={data.img}
              alt="organism"
              onError={()=>setImgFailed(true)}
              style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.92,filter:"saturate(1.15) contrast(1.05)"}}
            />
            <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.55) 0%,transparent 55%)"}}/>
            <div style={{position:"absolute",bottom:8,right:10,fontSize:22,filter:"drop-shadow(0 1px 4px rgba(0,0,0,0.8))"}}>{data.emoji}</div>
          </div>
        ):(
          <div style={{fontSize:52,marginBottom:8,animation:"float 2s ease-in-out infinite"}}>{data.emoji}</div>
        )}
        <div style={{background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px 16px",fontSize:14,color:"rgba(255,255,255,0.9)",lineHeight:1.6,fontStyle:"italic"}}>"{data.clue}"</div>
        <div style={{marginTop:10}}><TimerBar timeLimit={timeLimit} onExpire={handleExpire} paused={answered} /></div>
        <div style={{marginTop:8,fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:"0.2em"}}>WHICH ORGANISM AM I?</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {data.opts.map((opt,i)=>{
          let bg="rgba(255,255,255,0.07)",border="1px solid rgba(255,255,255,0.12)",color="rgba(255,255,255,0.85)";
          if(answered){if(opt===data.answer){bg="rgba(22,163,74,0.25)";border="1.5px solid #22c55e";color="#4ade80";}else if(opt===sel){bg="rgba(239,68,68,0.2)";border="1.5px solid #ef4444";color="#f87171";}}
          return <button key={i} onClick={()=>submit(opt)} style={{background:bg,border,borderRadius:12,padding:"13px 15px",color,fontFamily:"'Libre Baskerville',serif",fontSize:14,cursor:answered?"default":"pointer"}}>{opt}</button>;
        })}
      </div>
    </div>
  );
}

function TrueFalseChallenge({ data, onResult, timeLimit=20 }) {
  const [sel,setSel]=useState(null);
  const [answered,setAnswered]=useState(false);
  const submit=val=>{
    if(answered)return;
    setSel(val);setAnswered(true);
    const correct=val===data.answer;
    setTimeout(()=>onResult(correct),1400);
  };
  const handleExpire=()=>{if(!answered){setAnswered(true);setSel(null);setTimeout(()=>onResult(false),1200);}};
  const isTrue=sel===true,isFalse=sel===false;
  const showTrue=answered&&data.answer===true,showFalse=answered&&data.answer===false;
  return(
    <div>
      <TimerBar timeLimit={timeLimit} onExpire={handleExpire} paused={answered} />
      <p style={{fontSize:16,color:"#fff",lineHeight:1.6,fontFamily:"'Libre Baskerville',serif",marginBottom:22,textAlign:"center",padding:"0 8px"}}>{data.statement}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
        <button onClick={()=>submit(true)} style={{
          padding:"22px 10px",borderRadius:14,fontSize:22,fontFamily:"'Cinzel',serif",fontWeight:700,cursor:answered?"default":"pointer",transition:"all 0.2s",
          background:answered?(data.answer===true?"rgba(22,163,74,0.3)":(sel===true?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.05)")):"rgba(22,163,74,0.12)",
          border:answered?(data.answer===true?"2px solid #22c55e":(sel===true?"2px solid #ef4444":"1px solid rgba(255,255,255,0.1)")):"2px solid rgba(22,163,74,0.4)",
          color:answered?(data.answer===true?"#4ade80":(sel===true?"#f87171":"rgba(255,255,255,0.4)")):"#4ade80",
          transform:sel===true&&!answered?"scale(1.04)":"scale(1)",
        }}>✅ TRUE</button>
        <button onClick={()=>submit(false)} style={{
          padding:"22px 10px",borderRadius:14,fontSize:22,fontFamily:"'Cinzel',serif",fontWeight:700,cursor:answered?"default":"pointer",transition:"all 0.2s",
          background:answered?(data.answer===false?"rgba(22,163,74,0.3)":(sel===false?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.05)")):"rgba(239,68,68,0.12)",
          border:answered?(data.answer===false?"2px solid #22c55e":(sel===false?"2px solid #ef4444":"1px solid rgba(255,255,255,0.1)")):"2px solid rgba(239,68,68,0.4)",
          color:answered?(data.answer===false?"#4ade80":(sel===false?"#f87171":"rgba(255,255,255,0.4)")):"#f87171",
          transform:sel===false&&!answered?"scale(1.04)":"scale(1)",
        }}>❌ FALSE</button>
      </div>
      {answered&&data.correction&&!data.answer&&<div style={{padding:"11px 16px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,fontSize:13,color:"rgba(252,165,165,0.9)",lineHeight:1.6}}>🔎 {data.correction}</div>}
      {answered&&data.answer&&<div style={{padding:"11px 16px",background:"rgba(22,163,74,0.1)",border:"1px solid rgba(22,163,74,0.3)",borderRadius:10,fontSize:13,color:"rgba(134,239,172,0.9)",lineHeight:1.6}}>✓ That's correct!</div>}
    </div>
  );
}

function HangmanChallenge({ data, onResult, timeLimit=60 }) {
  const [guessed,setGuessed]=useState(new Set());
  const word=data.word.toUpperCase();
  const wrong=[...guessed].filter(l=>!word.includes(l));
  const solved=word.split("").every(l=>l===" "||guessed.has(l));
  const failed=wrong.length>=6;
  const done=useRef(false);
  useEffect(()=>{if((solved||failed)&&!done.current){done.current=true;setTimeout(()=>onResult(solved),800);}},[solved,failed]);
  const handleExpire=()=>{if(!done.current&&!solved&&!failed){done.current=true;setTimeout(()=>onResult(false),800);}};
  const parts=["🗿","🎭","🦷","💀","👻","☠️"];
  return(
    <div>
      <TimerBar timeLimit={timeLimit} onExpire={handleExpire} paused={solved||failed} />
      <p style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,0.55)",marginBottom:6,fontStyle:"italic"}}>Hint: {data.clue}</p>
      <div style={{textAlign:"center",fontSize:"clamp(16px,5vw,28px)",fontFamily:"'Cinzel',serif",marginBottom:14,letterSpacing:"0.15em",overflowWrap:"break-word",wordBreak:"break-all"}}>
        {word.split("").map((l,i)=>(
          <span key={i} style={{display:"inline-block",minWidth:"clamp(18px,4vw,28px)",marginRight:2,borderBottom:l===" "?"none":"2px solid rgba(255,255,255,0.4)",color:guessed.has(l)?"#4ade80":"transparent"}}>{guessed.has(l)||l===" "?l:"_"}</span>
        ))}
      </div>
      <div style={{textAlign:"center",marginBottom:14}}>
        {parts.map((p,i)=><span key={i} style={{fontSize:20,opacity:i<wrong.length?1:0.1}}>{p}</span>)}
        <span style={{marginLeft:10,fontFamily:"'Cinzel',serif",fontSize:12,color:wrong.length>=4?"#f87171":"rgba(255,255,255,0.5)"}}>{wrong.length}/6</span>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:5,justifyContent:"center"}}>
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l=>(
          <button key={l} disabled={guessed.has(l)||solved||failed} onClick={()=>setGuessed(prev=>new Set([...prev,l]))}
            style={{width:"clamp(26px,6vw,32px)",height:"clamp(26px,6vw,32px)",borderRadius:7,background:guessed.has(l)?(word.includes(l)?"rgba(22,163,74,0.3)":"rgba(239,68,68,0.2)"):"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",color:guessed.has(l)?(word.includes(l)?"#4ade80":"#f87171"):"rgba(255,255,255,0.8)",fontFamily:"'Cinzel',serif",fontSize:"clamp(9px,2.2vw,11px)",fontWeight:700,cursor:guessed.has(l)||solved||failed?"default":"pointer"}}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchChallenge({ data, onResult, timeLimit=30 }) {
  const terms=data.pairs.map(p=>p.term);
  const defs=useMemo(()=>shuffle(data.pairs.map(p=>p.def)),[]);
  const [selTerm,setSelTerm]=useState(null);
  const [matched,setMatched]=useState({});
  const [errors,setErrors]=useState(0);
  const done=useRef(false);
  const [isDone,setIsDone]=useState(false);
  const finish=(result)=>{if(done.current)return;done.current=true;setIsDone(true);setTimeout(()=>onResult(result),600);};
  const handleDef=def=>{
    if(!selTerm||done.current)return;
    const correct=data.pairs.find(p=>p.term===selTerm)?.def;
    if(def===correct){const newM={...matched,[selTerm]:def};setMatched(newM);setSelTerm(null);if(Object.keys(newM).length===data.pairs.length)finish(true);}
    else{const e=errors+1;setErrors(e);setSelTerm(null);if(e>=3)finish(false);}
  };
  const handleExpire=()=>finish(false);
  return(
    <div>
      <TimerBar timeLimit={timeLimit} onExpire={handleExpire} paused={isDone} />
      <p style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.5)",marginBottom:14}}>Click a TERM → then its DEFINITION · {errors}/3 errors</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(255,255,255,0.35)",marginBottom:4,textAlign:"center"}}>CONCEPTS</div>
          {terms.map(t=>{const isM=matched[t];return(
            <button key={t} disabled={!!isM} onClick={()=>setSelTerm(selTerm===t?null:t)}
              style={{padding:"11px 13px",background:isM?"rgba(22,163,74,0.2)":selTerm===t?"rgba(124,58,237,0.3)":"rgba(255,255,255,0.06)",border:`1.5px solid ${isM?"#22c55e":selTerm===t?"#a78bfa":"rgba(255,255,255,0.1)"}`,borderRadius:10,color:isM?"#4ade80":selTerm===t?"#c4b5fd":"rgba(255,255,255,0.8)",fontFamily:"'Cinzel',serif",fontSize:11,cursor:isM?"default":"pointer",textAlign:"left"}}>
              {isM?"✓ ":""}{t}
            </button>
          );})}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(255,255,255,0.35)",marginBottom:4,textAlign:"center"}}>DEFINITIONS</div>
          {defs.map(d=>{const isM=Object.values(matched).includes(d);return(
            <button key={d} disabled={isM||!selTerm} onClick={()=>handleDef(d)}
              style={{padding:"11px 13px",background:isM?"rgba(22,163,74,0.15)":selTerm?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:10,color:isM?"rgba(74,222,128,0.7)":"rgba(255,255,255,0.75)",fontFamily:"'Libre Baskerville',serif",fontSize:11,cursor:isM||!selTerm?"default":"pointer",textAlign:"left"}}>
              {isM?"✓ ":""}{d}
            </button>
          );})}
        </div>
      </div>
    </div>
  );
}

function UnscrambleChallenge({ data, onResult, timeLimit=45 }) {
  const [bank,setBank]=useState(()=>shuffle(data.words));
  const [answer,setAnswer]=useState([]);
  const [checked,setChecked]=useState(false);
  const [correct,setCorrect]=useState(false);
  const addWord=(w,i)=>{if(checked)return;setAnswer(p=>[...p,w]);setBank(p=>p.filter((_,idx)=>idx!==i));};
  const removeWord=i=>{if(checked)return;setBank(p=>[...p,answer[i]]);setAnswer(p=>p.filter((_,idx)=>idx!==i));};
  const check=()=>{const ok=answer.join(" ").toLowerCase()===data.ans.toLowerCase();setCorrect(ok);setChecked(true);setTimeout(()=>onResult(ok),1200);};
  const handleExpire=()=>{if(!checked){setChecked(true);setCorrect(false);setTimeout(()=>onResult(false),1200);}};
  return(
    <div>
      <TimerBar timeLimit={timeLimit} onExpire={handleExpire} paused={checked} />
      <p style={{textAlign:"center",fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:4,fontStyle:"italic"}}>Hint: {data.hint}</p>
      <p style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:14}}>Click the words to build the sentence in order</p>
      <div style={{minHeight:50,background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"10px 14px",display:"flex",flexWrap:"wrap",gap:6,marginBottom:10,alignItems:"center"}}>
        {answer.length===0&&<span style={{color:"rgba(255,255,255,0.2)",fontSize:12}}>Your answer here…</span>}
        {answer.map((w,i)=><button key={i} onClick={()=>removeWord(i)} style={{background:"rgba(124,58,237,0.3)",border:"1px solid #a78bfa55",borderRadius:8,padding:"5px 10px",color:"#c4b5fd",fontFamily:"'Libre Baskerville',serif",fontSize:13,cursor:"pointer"}}>{w}</button>)}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
        {bank.map((w,i)=><button key={i} onClick={()=>addWord(w,i)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"5px 11px",color:"rgba(255,255,255,0.85)",fontFamily:"'Libre Baskerville',serif",fontSize:13,cursor:"pointer"}}>{w}</button>)}
      </div>
      {!checked&&<button onClick={check} disabled={answer.length!==data.words.length} style={{width:"100%",padding:"12px",background:answer.length===data.words.length?"linear-gradient(135deg,#7c3aed,#6d28d9)":"rgba(255,255,255,0.05)",border:"none",borderRadius:10,color:answer.length===data.words.length?"#fff":"rgba(255,255,255,0.3)",fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,cursor:answer.length===data.words.length?"pointer":"not-allowed",letterSpacing:"0.1em"}}>✓ Check Order</button>}
      {checked&&<div style={{textAlign:"center",fontSize:16,fontFamily:"'Cinzel',serif",color:correct?"#4ade80":"#f87171",animation:"popIn 0.4s ease"}}>{correct?"✓ Correct!":"✗ Incorrect"}</div>}
    </div>
  );
}

// ── FOOD WEB CHALLENGE ─────────────────────────────
function FoodWebChallenge({ ecosystem, onResult, isRestoration }) {
  const eco = ECOSYSTEMS[ecosystem.id];
  const TROPHIC = [
    { label:"Producer",           icon:"🌿", color:"#4ade80", desc:"Makes its own food from sunlight" },
    { label:"Primary Consumer",   icon:"🐛", color:"#fbbf24", desc:"Eats producers directly" },
    { label:"Secondary Consumer", icon:"🦎", color:"#fb923c", desc:"Eats primary consumers" },
    { label:"Tertiary Consumer",  icon:"🦅", color:"#f87171", desc:"Top predator" },
    { label:"Decomposer",         icon:"🦠", color:"#a78bfa", desc:"Breaks down dead organic matter" },
  ];

  const [shuffledOrgs] = useState(() => shuffle([...eco.organisms]));
  const [placements, setPlacements] = useState({});
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [submitted, setSubmitted] = useState(false);
  const [resultInfo, setResultInfo] = useState(null);

  const placementsRef = useRef({});
  const submittedRef = useRef(false);

  const doSubmit = (pl) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);
    setSelected(null);
    const finalPl = pl !== undefined ? pl : placementsRef.current;
    const correct = eco.organisms.filter(o => finalPl[o.id] === o.role).length;
    const total = eco.organisms.length;
    const pct = correct / total;
    const won = pct >= 0.5;
    setResultInfo({ correct, total, pct, won });
    setTimeout(() => onResult(won), 2500);
  };

  useEffect(() => {
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(iv); doSubmit(placementsRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const updatePlacement = (orgId, levelLabel) => {
    const newPl = { ...placementsRef.current, [orgId]: levelLabel };
    placementsRef.current = newPl;
    setPlacements(newPl);
    setSelected(null);
  };

  const removePlacement = (orgId) => {
    if (submitted) return;
    const newPl = { ...placementsRef.current };
    delete newPl[orgId];
    placementsRef.current = newPl;
    setPlacements(newPl);
  };

  const unplaced = shuffledOrgs.filter(o => !placements[o.id]);
  const allPlaced = unplaced.length === 0;

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,gap:10}}>
        <p style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.4,margin:0}}>
          {isRestoration
            ? "🌱 Restore the Garden — place each organism in its correct trophic level"
            : "Select an organism → tap its trophic level to place it · Click placed organisms to remove"}
        </p>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,flexShrink:0,color:timeLeft<=20?"#f87171":"#fb923c",animation:timeLeft<=20?"chaosFloat 0.7s ease-in-out infinite":"none"}}>
          ⏱ {timeLeft}s
        </div>
      </div>

      {!submitted && (
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,letterSpacing:"0.2em",color:"rgba(255,255,255,0.35)",marginBottom:6}}>
            ORGANISMS TO PLACE ({unplaced.length} remaining)
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,minHeight:36}}>
            {unplaced.map(org=>(
              <button key={org.id} onClick={()=>setSelected(prev=>prev===org.id?null:org.id)} style={{
                padding:"6px 11px",borderRadius:10,cursor:"pointer",
                background:selected===org.id?"rgba(251,146,60,0.28)":"rgba(255,255,255,0.07)",
                border:"1.5px solid "+(selected===org.id?"#fb923c":"rgba(255,255,255,0.12)"),
                color:"#fff",fontSize:13,
                transform:selected===org.id?"scale(1.06)":"scale(1)",
                transition:"all 0.15s",
                display:"flex",alignItems:"center",gap:6,
                boxShadow:selected===org.id?"0 0 10px rgba(251,146,60,0.35)":"none",
              }}>
                <span>{org.emoji}</span>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:selected===org.id?"#fdba74":"rgba(255,255,255,0.75)"}}>{org.name}</span>
              </button>
            ))}
            {allPlaced&&<span style={{fontSize:12,color:"#4ade80",animation:"popIn 0.4s ease",display:"flex",alignItems:"center",gap:5}}>✓ All placed! Submit when ready.</span>}
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
        {TROPHIC.map(level=>{
          const orgsHere = eco.organisms.filter(o=>placements[o.id]===level.label);
          const isClickable = !!selected && !submitted;
          return(
            <div key={level.label} onClick={()=>{if(isClickable&&selected)updatePlacement(selected,level.label);}}
              style={{
                background:isClickable?level.color+"10":"rgba(0,0,0,0.2)",
                border:"1.5px solid "+(isClickable?level.color+"55":"rgba(255,255,255,0.08)"),
                borderRadius:10,padding:"8px 12px",
                cursor:isClickable?"pointer":"default",
                transition:"all 0.18s",
                display:"flex",alignItems:"center",gap:10,
                minHeight:42,
                boxShadow:isClickable?"0 0 8px "+level.color+"22":"none",
              }}>
              <div style={{display:"flex",alignItems:"center",gap:6,minWidth:"clamp(100px,30%,175px)",flexShrink:0}}>
                <span style={{fontSize:15}}>{level.icon}</span>
                <div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:level.color,fontWeight:700,letterSpacing:"0.05em"}}>{level.label}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.28)"}}>{level.desc}</div>
                </div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,flex:1}}>
                {orgsHere.map(org=>{
                  const correct=submitted&&org.role===level.label;
                  const wrong=submitted&&org.role!==level.label;
                  return(
                    <div key={org.id} onClick={e=>{e.stopPropagation();removePlacement(org.id);}} style={{
                      padding:"4px 8px",borderRadius:7,
                      background:correct?"rgba(34,197,94,0.22)":wrong?"rgba(239,68,68,0.22)":"rgba(255,255,255,0.1)",
                      border:"1px solid "+(correct?"rgba(34,197,94,0.33)":wrong?"rgba(239,68,68,0.33)":"rgba(255,255,255,0.18)"),
                      fontSize:12,color:"#fff",
                      cursor:submitted?"default":"pointer",
                      display:"flex",alignItems:"center",gap:4,
                      animation:"popIn 0.3s ease",
                    }}>
                      <span>{org.emoji}</span>
                      <span style={{fontSize:10,fontFamily:"'Cinzel',serif",color:correct?"#4ade80":wrong?"#f87171":"rgba(255,255,255,0.8)"}}>{org.name}</span>
                      {correct&&<span style={{color:"#4ade80",fontSize:11}}>✓</span>}
                      {wrong&&<span style={{color:"#f87171",fontSize:11}}>✗</span>}
                      {!submitted&&<span style={{color:"rgba(255,255,255,0.2)",fontSize:9,marginLeft:1}}>×</span>}
                    </div>
                  );
                })}
                {orgsHere.length===0&&isClickable&&(
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.18)",fontStyle:"italic"}}>← place here</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {submitted && eco.organisms.filter(o=>placements[o.id]!==o.role).length>0 && (
        <div style={{marginBottom:10,display:"flex",flexWrap:"wrap",gap:5}}>
          <div style={{width:"100%",fontSize:9,letterSpacing:"0.15em",color:"rgba(255,255,255,0.3)",marginBottom:3}}>CORRECTIONS</div>
          {eco.organisms.filter(o=>placements[o.id]!==o.role).map(o=>(
            <div key={o.id} style={{fontSize:11,color:"rgba(255,200,100,0.85)",background:"rgba(255,150,0,0.1)",border:"1px solid rgba(255,150,0,0.25)",borderRadius:7,padding:"3px 8px"}}>
              {o.emoji} {o.name} → <span style={{color:"#fb923c",fontWeight:700}}>{o.role}</span>
            </div>
          ))}
        </div>
      )}

      {resultInfo && (
        <div style={{
          textAlign:"center",padding:"12px 16px",marginBottom:10,
          background:resultInfo.won?"rgba(34,197,94,0.1)":"rgba(239,68,68,0.1)",
          border:"1.5px solid "+(resultInfo.won?"rgba(34,197,94,0.33)":"rgba(239,68,68,0.33)"),
          borderRadius:10,animation:"popIn 0.5s ease",
        }}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:resultInfo.won?"#4ade80":"#f87171",fontWeight:700,marginBottom:6}}>
            {resultInfo.won
              ? ("🌿 "+resultInfo.correct+"/"+resultInfo.total+" correct — "+(isRestoration?"Garden Restored!":"Web Complete!"))
              : ("🥀 "+resultInfo.correct+"/"+resultInfo.total+" correct — "+(isRestoration?"Garden Still Struggling":"Web Needs Work"))}
          </div>
          <div style={{width:"100%",height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:Math.round(resultInfo.pct*100)+"%",background:resultInfo.won?"#4ade80":"#f87171",borderRadius:3,transition:"width 1.2s ease"}} />
          </div>
        </div>
      )}

      {!submitted && (
        <button onClick={()=>doSubmit()} style={{
          width:"100%",padding:"12px",
          background:allPlaced?"linear-gradient(135deg,#fb923c,#ea580c)":"rgba(255,255,255,0.05)",
          border:"none",borderRadius:10,
          color:allPlaced?"#fff":"rgba(255,255,255,0.3)",
          fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:700,letterSpacing:"0.1em",
          cursor:allPlaced?"pointer":"not-allowed",
          boxShadow:allPlaced?"0 4px 20px rgba(251,146,60,0.4)":"none",
          transition:"all 0.2s",
        }}>
          🕸️ {allPlaced?"Submit Food Web":"Place All Organisms to Submit"}
        </button>
      )}
    </div>
  );
}

// ── WOW FACTS MODAL ────────────────────────────────

export { TimerBar, TriviaChallenge, IdentifyChallenge, TrueFalseChallenge, HangmanChallenge, MatchChallenge, UnscrambleChallenge, FoodWebChallenge };
