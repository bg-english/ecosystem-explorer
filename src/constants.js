const TEAM_COLORS = [
  { bg: "#ef4444", light: "#fca5a5", dark: "#7f1d1d" },
  { bg: "#3b82f6", light: "#93c5fd", dark: "#1e3a8a" },
  { bg: "#22c55e", light: "#86efac", dark: "#14532d" },
  { bg: "#a855f7", light: "#d8b4fe", dark: "#581c87" },
  { bg: "#f97316", light: "#fdba74", dark: "#7c2d12" },
  { bg: "#eab308", light: "#fde047", dark: "#713f12" },
];

const CT = {
  start:      { icon: "🚀", color: "#4ade80",  bg: "#052e16", label: "START",     hue: 130 },
  center:     { icon: "🏆", color: "#fde047",  bg: "#3a1a00", label: "GOAL",       hue: 50  },
  trivia:     { icon: "❓", color: "#38bdf8",  bg: "#071428", label: "TRIVIA",     hue: 200 },
  identify:   { icon: "🔍", color: "#c084fc",  bg: "#140828", label: "IDENTIFY", hue: 270 },
  foodchain:  { icon: "🍽️", color: "#fb923c",  bg: "#1a0800", label: "FOOD CHAIN",     hue: 30  },
  hangman:    { icon: "🔤", color: "#f472b6",  bg: "#1a0010", label: "WORD",    hue: 320 },
  match:      { icon: "🔗", color: "#34d399",  bg: "#001a10", label: "MATCH",       hue: 155 },
  unscramble: { icon: "🧩", color: "#fbbf24",  bg: "#141000", label: "UNSCRAMBLE",    hue: 45  },
  truefalse:  { icon: "✅", color: "#a3e635",  bg: "#0f1a00", label: "TRUE / FALSE",  hue: 80  },
  foodweb:    { icon: "🕸️", color: "#fb923c",  bg: "#1a0800", label: "FOOD WEB",     hue: 30  },
  wildcard:   { icon: "⚡", color: "#e879f9",  bg: "#180028", label: "WILDCARD",    hue: 290 },
};

// ── GUARDIAN ROLES ──────────────────────────────────
const ROLES = [
  {
    id:"seer", name:"The Seer", emoji:"👁️", minTeam:5,
    biblical:"The Prophet Daniel", ref:"Daniel 1:17",
    scripture:'"God gave them knowledge and understanding in all kinds of literature and learning."',
    challenge:"foodchain", challengeLabel:"Food Chain", challengeIcon:"🍽️",
    virtue:"Understanding — seeing the connections others miss",
    sciRole:"Systems Ecologist",
    color:"#38bdf8",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Daniel_Hermitage.jpg/300px-Daniel_Hermitage.jpg",
    howToPlay:"When the team lands on a 🍽️ Food Chain square, everyone may discuss for 45 seconds — but The Seer gives the final answer. Their authority is earned through understanding, not position.",
  },
  {
    id:"namer", name:"The Namer", emoji:"📖", minTeam:5,
    biblical:"Adam in the Garden", ref:"Genesis 2:19",
    scripture:'"Whatever the man called each living creature, that was its name."',
    challenge:"match", challengeLabel:"Matching", challengeIcon:"🔗",
    virtue:"Attention — truly seeing what is there",
    sciRole:"Taxonomist / Botanist",
    color:"#c084fc",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Sistine_Chapel_ceiling%2C_Michelangelo%27s_%27The_Creation_of_Adam%27.jpg/400px-Sistine_Chapel_ceiling%2C_Michelangelo%27s_%27The_Creation_of_Adam%27.jpg",
    howToPlay:"On 🔗 Matching squares, The Namer answers independently — no team discussion. 30 seconds. If incorrect, one second attempt for 5 points.",
  },
  {
    id:"seeker", name:"The Seeker", emoji:"🔍", minTeam:5,
    biblical:"The Wise Men (The Magi)", ref:"Matthew 2:1–2",
    scripture:'"We saw his star and have come to worship him."',
    challenge:"unscramble", challengeLabel:"Unscramble", challengeIcon:"🧩",
    virtue:"Faith — trusting the answer exists",
    sciRole:"Field Naturalist / Explorer",
    color:"#fbbf24",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Adoracion_de_los_Reyes_Magos_%28Velazquez%29.jpg/400px-Adoracion_de_los_Reyes_Magos_%28Velazquez%29.jpg",
    howToPlay:"On 🧩 Unscramble squares, The Seeker works alone for 45 seconds. They may ask ONE teammate for a single letter hint — but using it reduces the score to half.",
  },
  {
    id:"keeper", name:"The Keeper", emoji:"🛡️", minTeam:5,
    biblical:"Noah", ref:"Genesis 6:19",
    scripture:'"Bring into the ark two of all living creatures to keep them alive with you."',
    challenge:"trivia", challengeLabel:"Multiple Choice", challengeIcon:"❓",
    virtue:"Discernment — choosing wisely under pressure",
    sciRole:"Conservation Ecologist",
    color:"#34d399",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/The_Deluge_-_Francis_Danby.jpg/400px-The_Deluge_-_Francis_Danby.jpg",
    howToPlay:"On ❓ Multiple Choice squares, the team consults for 30 seconds — then The Keeper commits to a final answer. No changing minds after the Keeper speaks.",
  },
  {
    id:"witness", name:"The Witness", emoji:"⚖️", minTeam:5,
    biblical:"King Solomon", ref:"1 Kings 3:9",
    scripture:'"Give your servant a discerning heart to distinguish between right and wrong."',
    challenge:"truefalse", challengeLabel:"True or False", challengeIcon:"✅",
    virtue:"Courage — naming falsehood and speaking truth",
    sciRole:"Science Communicator / Ethicist",
    color:"#a3e635",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Tissot_Solomon.jpg/300px-Tissot_Solomon.jpg",
    howToPlay:"On ✅ True/False squares, The Witness declares TRUE or FALSE in 20 seconds. If FALSE, they must give the correct version in 30 more seconds for full points.",
  },
  {
    id:"builder", name:"The Builder", emoji:"🏗️", minTeam:3,
    biblical:"Nehemiah", ref:"Nehemiah 2:18",
    scripture:'"Rise up and build, for the hand of God is good upon us."',
    challenge:"foodweb", challengeLabel:"Food Web Construction", challengeIcon:"🕸️",
    virtue:"Perseverance — rebuilding what is broken",
    sciRole:"Food Web Architect",
    color:"#fb923c",
    img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Nehemia_1860_Holman.jpg/300px-Nehemia_1860_Holman.jpg",
    howToPlay:"On 🕸️ Food Web squares, The Builder arranges organisms into correct trophic levels within 90 seconds. If the ecosystem Collapses — only The Builder can restore it.",
  },
];

// Maps challenge type → role id (for badge display in challenges)
const CHALLENGE_ROLE = {
  foodchain:"seer", match:"namer", unscramble:"seeker",
  trivia:"keeper", truefalse:"witness", foodweb:"builder",
};

// ── SOUND EFFECTS (Web Audio API — no external files) ──
const SFX = (() => {
  let _ctx = null;
  let _enabled = true;

  const ctx = () => {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === "suspended") _ctx.resume();
    return _ctx;
  };

  // Generic oscillator with exponential decay
  const osc = (ac, freq, type, gain, start, dur, freqEnd) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, start + dur);
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.start(start); o.stop(start + dur + 0.02);
  };

  // White-noise burst (for dice thud)
  const noise = (ac, gain, start, dur) => {
    const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const g = ac.createGain(); g.gain.setValueAtTime(gain, start);
    src.connect(g); g.connect(ac.destination);
    src.start(start);
  };

  return {
    setEnabled(v) { _enabled = v; },

    // 🎲 Single tick during dice roll animation
    tick() {
      if (!_enabled) return;
      try {
        const ac = ctx(), t = ac.currentTime;
        osc(ac, 180 + Math.random() * 320, "square", 0.04, t, 0.03);
      } catch(e) {}
    },

    // 🎲 Dice lands
    diceResult() {
      if (!_enabled) return;
      try {
        const ac = ctx(), t = ac.currentTime;
        noise(ac, 0.28, t, 0.08);
        osc(ac, 280, "sine", 0.18, t + 0.04, 0.28);
      } catch(e) {}
    },

    // ✅ Correct answer
    correct() {
      if (!_enabled) return;
      try {
        const ac = ctx(), t = ac.currentTime;
        [523, 659, 784].forEach((f, i) => osc(ac, f, "sine", 0.13, t + i * 0.1, 0.45));
      } catch(e) {}
    },

    // ❌ Wrong answer
    incorrect() {
      if (!_enabled) return;
      try {
        const ac = ctx(), t = ac.currentTime;
        osc(ac, 220, "sawtooth", 0.1, t, 0.16);
        osc(ac, 175, "sawtooth", 0.08, t + 0.14, 0.3);
      } catch(e) {}
    },

    // 🕸️ FoodWeb challenge won
    foodweb() {
      if (!_enabled) return;
      try {
        const ac = ctx(), t = ac.currentTime;
        [392, 523, 659, 784, 1047].forEach((f, i) => osc(ac, f, "sine", 0.12, t + i * 0.08, 0.5));
      } catch(e) {}
    },

    // 🌟 WOW Facts modal opens
    wow() {
      if (!_enabled) return;
      try {
        const ac = ctx(), t = ac.currentTime;
        [1047, 1319, 1568, 2093].forEach((f, i) => osc(ac, f, "sine", 0.07, t + i * 0.13, 0.7));
      } catch(e) {}
    },

    // ⚡ Wildcard
    wildcard() {
      if (!_enabled) return;
      try {
        const ac = ctx(), t = ac.currentTime;
        osc(ac, 880, "sawtooth", 0.13, t, 0.35, 220);
        osc(ac, 440, "square", 0.06, t + 0.1, 0.25, 110);
      } catch(e) {}
    },

    // 🏆 Victory
    victory() {
      if (!_enabled) return;
      try {
        const ac = ctx(), t = ac.currentTime;
        const mel = [523, 659, 784, 659, 784, 1047, 1047];
        mel.forEach((f, i) => osc(ac, f, "sine", 0.14, t + i * 0.13, i === mel.length - 1 ? 1.0 : 0.4));
      } catch(e) {}
    },

    // 🥀 Ecosystem Collapse warning
    collapse() {
      if (!_enabled) return;
      try {
        const ac = ctx(), t = ac.currentTime;
        osc(ac, 130, "sawtooth", 0.11, t, 0.55);
        osc(ac, 104, "sawtooth", 0.09, t + 0.18, 0.7);
        osc(ac, 82,  "sine",     0.14, t + 0.45, 1.1);
      } catch(e) {}
    },
  };
})();

// ── WOW FACTS (7 science+faith pairs per ecosystem) ────
const WOW_FACTS = {
  desert: [
    { science:"The saguaro cactus can store up to 200 gallons of water after a single rainstorm, then slowly release it over months.", faith:"God provides hidden reserves in the driest places — just as He gave Elijah water and bread in the wilderness." },
    { science:"Kangaroo rats never drink water. They extract all the moisture they need from the seeds they eat through their own metabolism.", faith:"God designed creatures to need nothing beyond what He already placed in their environment. His provision is built in." },
    { science:"Rattlesnakes detect prey using heat-sensing pit organs so precise they can feel temperature differences of just 0.003°C.", faith:"God gave every creature exactly the tools it needs for its calling — from rattlesnakes to prophets." },
    { science:"Desert soil bacteria can lie completely dormant for decades, then fully revive within hours of the first rainfall.", faith:"What looks dead in God's creation is rarely truly gone — revival waits for the right season." },
    { science:"The Gila woodpecker carves cavities in saguaro cacti that later become homes for over 25 other species — including owls and hawks.", faith:"One act of faithful work, done for your own survival, can create shelter for generations of others." },
    { science:"Deserts cover 33% of Earth's land surface and harbor over 4,000 unique species — all precisely adapted.", faith:"Even in the harshest conditions, God placed life — because He wills that every corner of creation flourish." },
    { science:"Desert food chains are typically only 3 levels long — making them fragile but astonishingly energy-efficient.", faith:"Simple, faithful systems can be the most powerful. A few devoted stewards can guard an entire ecosystem." },
  ],
  tropical: [
    { science:"Tropical rainforests produce 20% of the world's oxygen despite covering only 6% of Earth's surface.", faith:"The most life-giving places are often hidden and overlooked. God's most powerful work rarely happens in the spotlight." },
    { science:"A single hectare of Amazon rainforest can contain up to 40,000 different plant species — more variety than entire continents.", faith:"God's creativity is boundless. He never runs out of new forms of beauty — and He made you one of them." },
    { science:"The Brazil nut tree can only be pollinated by one specific orchid bee. Remove that bee, and the entire tree species goes extinct.", faith:"Every small creature in God's design is irreplaceable. Nothing — and no one — is throwaway." },
    { science:"The rainforest floor receives less than 2% of sunlight, yet supports thousands of species through nutrient recycling.", faith:"God sustains life even in the deepest darkness. No corner of His creation is ever abandoned." },
    { science:"Trees in rainforests share nutrients with struggling neighbors through underground fungal networks — a literal underground economy of care.", faith:"Godly communities support their weakest members. This pattern of care is written into creation itself." },
    { science:"The harpy eagle holds territories up to 100 km² — not out of greed, but to keep prey populations in balance for the whole ecosystem.", faith:"Authority in God's design is not for pride. It is given for service — to maintain balance for everyone else." },
    { science:"Rainforest soils are surprisingly poor in nutrients. Almost all nutrients are locked inside living organisms, not the ground.", faith:"True wealth in God's kingdom lives in relationships, not stored reserves. The treasure is in the living." },
  ],
  savanna: [
    { science:"The annual wildebeest migration involves 1.5 million animals traveling over 800 km — the largest land migration on Earth.", faith:"God built obedience to seasonal rhythms into entire species. All of creation moves in time with its Maker." },
    { science:"African elephants dig waterholes with their tusks during drought, creating water sources that sustain dozens of other species.", faith:"God calls His people to create abundance for others — to dig wells that others will drink from long after you're gone." },
    { science:"Lions sleep up to 20 hours a day, conserving energy for the critical 4% of time spent hunting.", faith:"Sabbath rest is written into creation. Even the apex predator was designed to stop, rest, and be still." },
    { science:"Acacia trees release toxic tannins when grazed, then send airborne chemical signals warning neighboring trees to do the same.", faith:"Creation has language. God built communication and warning systems into every organism — even trees look out for each other." },
    { science:"Dung beetles navigate at night using the Milky Way as a star map — rolling dung balls in a perfectly straight line.", faith:"God embedded stellar navigation into a creature smaller than your thumbnail. His signature of wonder is everywhere." },
    { science:"The savanna loses up to 90% of its plant biomass to fire every 3–5 years, yet regenerates completely each time.", faith:"God designed destruction as part of renewal. Fire makes room for new growth — loss is not the end of the story." },
    { science:"Termites weighing less than a gram build mounds over 9 meters tall — 300 times their own body height.", faith:"God uses the smallest creatures for the greatest structural work. Never underestimate who He chooses to build with." },
  ],
  ocean: [
    { science:"The ocean produces over 50% of Earth's oxygen — more than all land forests combined — mostly from invisible phytoplankton.", faith:"The unseen, deep places sustain all life on Earth. God works powerfully in hiddenness." },
    { science:"Blue whales communicate through low-frequency calls detectable across 1,000 km of open ocean.", faith:"God designed the capacity for connection across impossible distances — in blue whales and in prayer." },
    { science:"A single phytoplankton cell, invisible to the naked eye, produces the oxygen for every other breath you take.", faith:"The smallest invisible organism keeps you alive. God's care for you is built into the microscopic world." },
    { science:"Hydrothermal vents 3,000 meters underwater support entire ecosystems with no sunlight — powered entirely by chemical energy.", faith:"God provides alternative energy sources in places where normal light cannot reach. He is never without a plan." },
    { science:"Sea otters wrap themselves in kelp before sleeping so they don't drift away — and mothers hold their pups' paws while floating.", faith:"God built tender, parental care into animal behavior. Creation overflows with images of His love for us." },
    { science:"The ocean food web contains over 12 trophic levels — the most complex feeding structure of any ecosystem on Earth.", faith:"God loves complexity. His creation is never simple, never repetitive, and never exhausted." },
    { science:"Coral reefs occupy just 1% of the ocean floor, yet support 25% of all known marine species.", faith:"Small, dense communities of faithful stewards can sustain disproportionate abundance for the world around them." },
  ],
  arctic: [
    { science:"Arctic permafrost stores twice as much carbon as is currently present in Earth's entire atmosphere.", faith:"God designed the frozen north as a planetary vault — a safeguard hidden in creation's architecture for all life." },
    { science:"Arctic wolves can survive over 5 months between successful hunts during polar winters, with no guaranteed meal.", faith:"God equips His people to endure long seasons of scarcity without losing their strength or their purpose." },
    { science:"Lemming populations boom and crash in precise 3–5 year cycles, regulating the entire Arctic food web automatically.", faith:"God built self-correcting rhythms into creation. He is the God of cycles, and His design always restores balance." },
    { science:"Polar bears can smell a seal through 3 feet of solid ice and detect prey from up to 20 miles away.", faith:"God gave every hunter what it needs to find its purpose — and He designed creation so purpose can always be found." },
    { science:"Arctic foxes grow a completely white coat in winter and brown fur in summer — camouflage engineered for every season.", faith:"Faithfulness looks different in every season of life. God designed adaptability as a form of faithful obedience." },
    { science:"The midnight sun means Arctic producers photosynthesize continuously for 24 hours during summer, creating enormous energy pulses.", faith:"There are seasons of abundant light — seasons to work without ceasing — and God designs them with perfect precision." },
    { science:"Only the top 50 cm of Arctic soil thaws each summer, yet this thin layer supports over 1,700 plant species.", faith:"In the thinnest soil, with the shortest season, God placed 1,700 forms of life. His generosity knows no constraint." },
  ],
  wetland: [
    { science:"Wetlands filter up to 80% of water pollutants before water reaches rivers and lakes — acting as Earth's kidneys.", faith:"God built a purification system into creation. Before water reaches the city, He already cleaned it." },
    { science:"A single acre of wetland can absorb and store up to 1.5 million gallons of floodwater, protecting entire cities downstream.", faith:"Small, unimpressive-looking places hold back destruction for thousands of people. Never despise hidden servants." },
    { science:"Frogs absorb water and oxygen directly through their skin, making them the most pollution-sensitive indicator species on Earth.", faith:"God designed the most sensitive creatures to be the first warning of danger — the canary in the garden." },
    { science:"Beaver dams raise water tables, create wetlands, and directly benefit over 43 other species — all from one builder's instinct.", faith:"One faithful builder changes the landscape for generations. What you build in obedience outlasts you." },
    { science:"Dragonflies predate dinosaurs by 100 million years and are still the most efficient hunters on Earth — with a 95% success rate.", faith:"Some of God's best designs have been working faithfully for 300 million years. Faithfulness endures." },
    { science:"Water lilies seal their flowers at night to protect pollen from dew, then reopen at dawn — every single day.", faith:"Creation knows when to close and when to open. Wisdom about timing is written into every flower." },
    { science:"Freshwater makes up only 2.5% of Earth's water, yet supports 10% of all known species.", faith:"God does extraordinary things with scarce resources. Scarcity in His hands becomes abundance." },
  ],
  reef: [
    { science:"Coral is actually an animal, not a plant — a tiny polyp that builds a limestone skeleton over thousands of years.", faith:"What looks like rock is alive. God hides extraordinary life in the most unexpected, overlooked forms." },
    { science:"The Great Barrier Reef is the largest living structure on Earth and is visible from space.", faith:"God's most faithful builders create structures visible from the heavens. Faithful work has cosmic scale." },
    { science:"Parrotfish eat coral and excrete the remains as white sand — entire tropical beaches are literally made from fish waste.", faith:"God built a recycling system into creation where even waste becomes beauty. Nothing is wasted in His economy." },
    { science:"Coral's vibrant color comes from symbiotic algae living inside its tissue. Bleaching happens when stress drives the algae away.", faith:"Beauty and health in God's creation depend on right relationship. Lose the relationship, lose the color." },
    { science:"A reef 1,000 years old was built by polyps just 2 mm long — patience and faithfulness multiplied by uncountable generations.", faith:"God's greatest works are built slowly, invisibly, one small faithful act at a time. Your small acts matter eternally." },
    { science:"Clownfish are immune to anemone stings through a special mucus layer — a protection uniquely designed for one specific partnership.", faith:"God prepares some creatures — and some people — for one specific partnership. Unique protection for unique callings." },
    { science:"Scientists have discovered over 800 new coral reef species in the last decade alone — and estimate 91% of ocean species remain unknown.", faith:"God's creation still holds secrets. Wonder is not something we exhaust — it is something we grow deeper into." },
  ],
};

// Dynamic board generator — length varies by ecosystem (multiples of 6)
function generateBoard(size) {
  // 9-tile chapter: trivia, identify, foodchain, hangman, match, unscramble, truefalse, foodweb, wildcard
  const chPat = ["trivia","identify","foodchain","hangman","match","unscramble","truefalse","foodweb"];
  const wcSeq = [
    {fx:"advance",val:2},{fx:"back",val:2},{fx:"skip",val:1},{fx:"free",val:1},
    {fx:"steal",val:1},{fx:"double",val:1},{fx:"advance",val:3},{fx:"back",val:3},
    {fx:"double",val:1},{fx:"free",val:1},{fx:"advance",val:2},{fx:"skip",val:1},
  ];
  let wcI = 0;
  const b = [{type:"start"}];
  for (let i = 1; i < size - 1; i++) {
    const posInChapter = (i - 1) % 9;
    if (posInChapter === 8) {
      const wc = wcSeq[wcI % wcSeq.length]; wcI++;
      b.push({type:"wildcard", fx:wc.fx, val:wc.val});
    } else {
      b.push({type: chPat[posInChapter]});
    }
  }
  b.push({type:"center"});
  return b;
}


export { TEAM_COLORS, CT, ROLES, CHALLENGE_ROLE, SFX, WOW_FACTS, generateBoard };
