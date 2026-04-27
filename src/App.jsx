import React, { useEffect, useMemo, useState } from "react";

const storageKey = "aava-progress-v1";

const defaultProgress = {
  completed: 0,
  starsEarned: 0,
  moodHistory: [],
  modules: {},
  weakAreas: {},
};

const activityFallbacks = {
  emotion: "ইমোশন গেম",
  story: "সোশ্যাল স্টোরি",
  trace: "বাংলা ট্রেসিং",
  aac: "AAC বোর্ড",
  activity: "Activity",
};

const aacItems = [
  ["💧", "আমি পানি চাই"],
  ["🍚", "আমি খাবার চাই"],
  ["🤗", "আলিঙ্গন চাই"],
  ["🛑", "বিরতি চাই"],
  ["☁", "আমি শান্ত হতে চাই"],
  ["🎲", "আমি খেলতে চাই"],
];

const defaultSetupAnswers = {
  age: "4-6",
  level: "Level 1",
  speech: "yes",
  therapy: "yes",
  play: "alone",
};

const setupSteps = [
  { id: "name", eyebrow: "প্রথম সেটআপ", title: "শিশুর নাম লিখুন", text: "নামের মাধ্যমে আভা প্রতিদিনের অভিজ্ঞতা সাজাবে।" },
  {
    id: "age",
    title: "শিশুর বয়স কত?",
    text: "বয়স অনুযায়ী mode এবং activity সাজানো হবে।",
    options: [
      ["1-3", "🧸", "১-৩ বছর", "অনুভব"],
      ["4-6", "🧩", "৪-৬ বছর", "বিকাশ"],
      ["7-9", "📘", "৭-৯ বছর", "স্বাধীনতা"],
    ],
  },
  {
    id: "level",
    title: "অটিজমের স্তর",
    text: "সহায়তার ধরন বুঝতে এটি ব্যবহার হবে।",
    rows: [
      ["Level 1", "🧩", "Level 1", "সামান্য সহায়তা লাগে"],
      ["Level 2", "🧩", "Level 2", "মাঝারি সহায়তা লাগে"],
      ["Level 3", "🧩", "Level 3", "বেশি সহায়তা লাগে"],
    ],
  },
  { id: "challenge", title: "কোথায় বেশি সহায়তা দরকার?", text: "একাধিক বিষয় বেছে নেওয়া যাবে।", checks: ["💬 Speech", "🖐 Motor Skills", "🤝 Social", "🌧 Sensory", "💙 Emotional"] },
  {
    id: "speech",
    title: "শিশু কি কথা বলতে পারে?",
    icon: "•••",
    rows: [
      ["yes", "🙂", "হ্যাঁ"],
      ["no", "😐", "না"],
      ["some", "🥺", "কিছু কিছু শব্দ"],
    ],
  },
  {
    id: "therapy",
    title: "আগে কোনো থেরাপি নেওয়া হয়েছে?",
    icon: "📋",
    options: [
      ["yes", "", "হ্যাঁ", ""],
      ["no", "", "না", ""],
    ],
  },
  {
    id: "play",
    title: "প্লে মোড",
    text: "আজ কীভাবে ব্যবহার করবে?",
    options: [
      ["alone", "👧", "শিশু একা", ""],
      ["caregiver", "👩‍👧", "কেয়ারগিভারের সাথে", ""],
    ],
  },
];

const modes = {
  "1-3": {
    label: "অনুভব",
    age: "১-৩ বছর",
    goal: "Screen familiarity, touch response, parent-guided bonding.",
    focus: "বুদবুদ ধরো",
    hero: "🫧",
    activities: [
      ["✨", "Sound Touch", "স্ক্রিন ছুঁলে জোনাকি আর নরম পিয়ানো"],
      ["🫧", "বুদবুদ খেলা", "বড় bubble tap করলে আলতোভাবে ফাটবে"],
      ["🎨", "রঙের ছোঁয়া", "লাল, নীল, হলুদ বড় আকারে"],
      ["অ", "স্বরবর্ণ দর্শন", "অক্ষর নিজে নাচবে ও উচ্চারণ হবে"],
    ],
    guide: "এখন শিশুকে হাত দিয়ে বুদবুদ ধরতে বলুন এবং সাথে ‘ফাটো ফাটো’ বলুন।",
  },
  "4-6": {
    label: "বিকাশ",
    age: "৪-৬ বছর",
    goal: "Learning, emotion recognition, social communication.",
    focus: "এই মুখটি কী অনুভব করছে?",
    hero: "☺",
    activities: [
      ["✍", "বাংলা ট্রেসিং", "অ থেকে ঔ এবং ১ থেকে ১০"],
      ["◉", "ইমোশন গেম", "খুশি, কষ্ট, ভয়, অবাক চিনো"],
      ["☘", "সোশ্যাল স্টোরি", "হ্যালো বলা ও সহজ সিদ্ধান্ত"],
      ["▣", "AAC বোর্ড", "ছবিতে tap করে প্রয়োজন বলো"],
      ["◌", "মেমরি কার্ড", "জোড়া মিলিয়ে স্মৃতি অনুশীলন"],
      ["△", "আকার চেনা", "Circle, square, triangle sort"],
    ],
    guide: "আজ পরিচিত emotion card দিয়ে শুরু করুন। ভুল হলে কোনো শব্দ নেই, ঠিক হলে star।",
  },
  "7-9": {
    label: "স্বাধীনতা",
    age: "৭-৯ বছর",
    goal: "Daily life skills, routine, reasoning, social thinking.",
    focus: "বাইরে বৃষ্টি হচ্ছে, কী পরবে?",
    hero: "☔",
    activities: [
      ["☑", "Routine Maker", "ব্রাশ → গোসল → নাস্তা সাজাও"],
      ["🧥", "Dressing Puzzle", "আবহাওয়া দেখে পোশাক বেছে নাও"],
      ["🍎", "Food Sorting", "Healthy আর unhealthy আলাদা করো"],
      ["🛡", "Safety Rules", "রাস্তা ও অপরিচিত মানুষ নিয়ে সিদ্ধান্ত"],
      ["ব", "শব্দ গঠন", "ব + ক = বক"],
      ["➕", "সংখ্যার জগত", "১ থেকে ১০০ এবং ছোট যোগ-বিয়োগ"],
    ],
    guide: "আজ daily routine puzzle দিয়ে শুরু করুন, তারপর একটিমাত্র reasoning question দিন।",
  },
};

function loadInitialState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved) return null;
    return {
      ...saved,
      progress: {
        ...defaultProgress,
        ...(saved.progress || {}),
        moodHistory: Array.isArray(saved.progress?.moodHistory) ? saved.progress.moodHistory : [],
        modules: saved.progress?.modules || {},
        weakAreas: saved.progress?.weakAreas || {},
      },
    };
  } catch {
    return null;
  }
}

function App() {
  const saved = loadInitialState();
  const [screen, setScreen] = useState(saved?.screen || "welcome");
  const [previousScreen, setPreviousScreen] = useState("welcome");
  const [setupIndex, setSetupIndex] = useState(saved?.setupIndex || 0);
  const [childName, setChildName] = useState(saved?.childName || "সিমা");
  const [ageBand, setAgeBand] = useState(saved?.ageBand || "4-6");
  const [setupAnswers, setSetupAnswers] = useState({
    ...defaultSetupAnswers,
    ...(saved?.setupAnswers || {}),
    age: saved?.setupAnswers?.age || saved?.ageBand || "4-6",
  });
  const [mood, setMood] = useState(saved?.mood || "");
  const [stars, setStars] = useState(saved?.stars || 5);
  const [fontScale, setFontScale] = useState(saved?.fontScale || 1);
  const [language, setLanguage] = useState(saved?.language || "bn");
  const [attempts, setAttempts] = useState(saved?.attempts || 0);
  const [hintVisible, setHintVisible] = useState(saved?.hintVisible || false);
  const [sessionNotice, setSessionNotice] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(saved?.selectedActivity || null);
  const [progress, setProgress] = useState(saved?.progress || defaultProgress);

  const mode = modes[ageBand];
  const setup = setupSteps[setupIndex];
  const showCalm = !["welcome", "setup", "ready", "mood", "calm"].includes(screen);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ screen, setupIndex, childName, ageBand, setupAnswers, mood, stars, fontScale, language, attempts, hintVisible, selectedActivity, progress }));
  }, [screen, setupIndex, childName, ageBand, setupAnswers, mood, stars, fontScale, language, attempts, hintVisible, selectedActivity, progress]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSessionNotice(true), 15000);
    return () => window.clearTimeout(timer);
  }, []);

  const moodCopy = useMemo(() => {
    if (mood === "মন খারাপ") return "আজ শুধু শান্ত activity, কোনো চাপ নেই।";
    if (mood === "মাঝামাঝি") return "আজ পরিচিত সহজ activity দিয়ে শুরু করি।";
    return "আজ নতুন কিছু ধীরে ধীরে চেষ্টা করি।";
  }, [mood]);

  function go(next) {
    if (screen !== "calm") setPreviousScreen(screen);
    setScreen(next);
  }

  function nextSetup() {
    if (setupIndex < setupSteps.length - 1) setSetupIndex(setupIndex + 1);
    else go("ready");
  }

  function chooseSetupValue(value) {
    setSetupAnswers((current) => ({
      ...current,
      [setup.id]: value,
    }));
    if (setup.id === "age") setAgeBand(value);
  }

  function restartSetup() {
    setSetupIndex(0);
    setHintVisible(false);
    setAttempts(0);
    go("setup");
  }

  function reward(amount, next = "reward", labelOverride = "") {
    setStars((value) => value + amount);
    recordActivity(labelOverride || selectedActivity?.label || activityFallbacks[screen] || "Activity", amount, true);
    setAttempts(0);
    setHintVisible(false);
    go(next);
  }

  function softMiss() {
    const label = selectedActivity?.label || activityFallbacks[screen] || "ইমোশন গেম";
    setProgress((value) => ({
      ...value,
      weakAreas: {
        ...value.weakAreas,
        [label]: (value.weakAreas?.[label] || 0) + 1,
      },
    }));
    setAttempts((value) => {
      const next = value + 1;
      if (next >= 3) setHintVisible(true);
      return next;
    });
  }

  function chooseMood(value) {
    setMood(value);
    setProgress((current) => ({
      ...current,
      moodHistory: [...(current.moodHistory || []).slice(-6), { mood: value, date: new Date().toISOString() }],
    }));
    go("home");
  }

  function openActivity(activity) {
    const [icon, label, description] = activity;
    setSelectedActivity({ icon, label, description, mode: mode.label });
    if (label.includes("AAC")) go("aac");
    else if (label.includes("ইমোশন")) go("emotion");
    else if (label.includes("স্টোরি")) go("story");
    else if (label.includes("ট্রেসিং")) go("trace");
    else go("activity");
  }

  function recordActivity(label, amount, completed) {
    setProgress((current) => {
      const module = current.modules?.[label] || { count: 0, stars: 0 };
      return {
        ...current,
        completed: (current.completed || 0) + (completed ? 1 : 0),
        starsEarned: (current.starsEarned || 0) + amount,
        modules: {
          ...current.modules,
          [label]: {
            count: module.count + 1,
            stars: module.stars + amount,
          },
        },
      };
    });
  }

  return (
    <main className="app-shell" style={{ "--font-scale": fontScale }} aria-label="আভা অ্যাপ প্রোটোটাইপ">
      <section className="phone">
        <StatusBar />
        {showCalm && <button className="language-chip" type="button" onClick={() => setLanguage(language === "bn" ? "en" : "bn")}>{language === "bn" ? "EN" : "বাংলা"}</button>}
        {showCalm && <button className="cloud-button" type="button" onClick={() => go("calm")} aria-label="Calm down"><span>☁</span></button>}
        {sessionNotice && showCalm && <div className="session-notice"><span>☁</span><p>৫ মিনিট পরে বিরতি। ধীরে শেষ করি।</p><button type="button" onClick={() => setSessionNotice(false)}>ঠিক আছে</button></div>}

        {screen === "welcome" && <Welcome onStart={() => go("setup")} />}
        {screen === "setup" && (
          <SetupScreen
            setup={setup}
            setupIndex={setupIndex}
            childName={childName}
            setChildName={setChildName}
            ageBand={ageBand}
            setupAnswers={setupAnswers}
            chooseSetupValue={chooseSetupValue}
            nextSetup={nextSetup}
            back={() => (setupIndex > 0 ? setSetupIndex(setupIndex - 1) : go("welcome"))}
          />
        )}
        {screen === "ready" && <Ready childName={childName} onNext={() => go("mood")} />}
        {screen === "mood" && <MoodScreen chooseMood={chooseMood} />}
        {screen === "home" && <Home childName={childName} mode={mode} moodCopy={moodCopy} stars={stars} language={language} restartSetup={restartSetup} go={go} openActivity={openActivity} />}
        {screen === "mode" && <ModeMenu mode={mode} setAgeBand={setAgeBand} ageBand={ageBand} go={go} openActivity={openActivity} />}
        {screen === "activity" && <Activity activity={selectedActivity} mode={mode} reward={reward} go={go} />}
        {screen === "emotion" && <Emotion reward={reward} softMiss={softMiss} hintVisible={hintVisible} attempts={attempts} go={go} />}
        {screen === "story" && <Story reward={reward} softMiss={softMiss} hintVisible={hintVisible} go={go} />}
        {screen === "trace" && <Trace reward={reward} go={go} />}
        {screen === "aac" && <Aac recordActivity={recordActivity} go={go} />}
        {screen === "calm" && <Calm close={() => setScreen(previousScreen || "home")} />}
        {screen === "reward" && <Reward stars={stars} go={go} />}
        {screen === "customize" && <Customize go={go} />}
        {screen === "parent" && <ParentDashboard childName={childName} mood={mood} mode={mode} progress={progress} fontScale={fontScale} setFontScale={setFontScale} language={language} setLanguage={setLanguage} restartSetup={restartSetup} go={go} />}
        {screen === "therapist" && <TherapistMode childName={childName} go={go} />}
      </section>
    </main>
  );
}

function Screen({ children }) {
  return <div className="screen active">{children}</div>;
}

function StatusBar() {
  return <div className="status-bar" aria-hidden="true"><span>9:41</span><span>●●● Wi-Fi ▰</span></div>;
}

function Welcome({ onStart }) {
  return (
    <Screen>
      <div className="stars" />
      <div className="welcome-center">
        <p className="eyebrow">নিরাপদ ডিজিটাল জগত</p>
        <h1>আভা</h1>
        <p className="subtitle">(Aava)</p>
        <div className="sleep-cloud" aria-hidden="true">☁</div>
        <p className="welcome-copy">শান্ত, সহজ, শিশুবান্ধব শেখার সঙ্গী</p>
      </div>
      <button className="primary-button" type="button" onClick={onStart}>শুরু করুন</button>
    </Screen>
  );
}

function SetupScreen({ setup, setupIndex, childName, setChildName, ageBand, setupAnswers, chooseSetupValue, nextSetup, back }) {
  const selectedValue = setup.id === "age" ? ageBand : setupAnswers[setup.id];
  return (
    <Screen>
      <button className="ghost-back" type="button" onClick={back}>‹</button>
      <div className="progress-dots" aria-hidden="true">{[0, 1, 2].map((dot) => <span key={dot} className={dot <= Math.min(setupIndex, 2) ? "filled" : ""} />)}</div>
      <div className={`screen-head ${setup.icon ? "centered" : ""}`}>
        {setup.eyebrow && <p className="eyebrow">{setup.eyebrow}</p>}
        {setup.icon && <div className="big-bubble">{setup.icon}</div>}
        <h2>{setup.title}</h2>
        {setup.text && <p>{setup.text}</p>}
      </div>
      {setup.id === "name" && <><label className="field-label" htmlFor="childName">নাম</label><input id="childName" className="text-input" value={childName} onChange={(event) => setChildName(event.target.value)} /></>}
      {setup.options && <div className={setup.id === "play" ? "choice-stack" : "two-actions setup-options"}>{setup.options.map(([value, icon, label, meta]) => <button className={`${setup.id === "play" ? "wide-illustration" : "choice-card"} ${selectedValue === value ? "selected" : ""}`} type="button" key={label} onClick={() => chooseSetupValue(value)} aria-pressed={selectedValue === value}>{icon && <span className="choice-icon">{icon}</span>}<strong>{label}</strong>{meta && <small>{meta}</small>}</button>)}</div>}
      {setup.rows && <div className="choice-stack compact">{setup.rows.map(([value, icon, label, meta]) => <button className={`choice-row ${selectedValue === value ? "selected" : ""}`} type="button" key={value} onClick={() => chooseSetupValue(value)} aria-pressed={selectedValue === value}><span>{icon}</span><strong>{label}</strong>{meta && <small>{meta}</small>}</button>)}</div>}
      {setup.checks && <div className="check-list">{setup.checks.map((item, index) => <label key={item}><span>{item}</span><input type="checkbox" defaultChecked={index !== 3} /></label>)}</div>}
      <button className="primary-button bottom" type="button" onClick={nextSetup}>পরবর্তী</button>
    </Screen>
  );
}

function Ready({ childName, onNext }) {
  return <Screen><div className="celebrate"><div className="child-character" aria-hidden="true">👧</div><h2>আভা প্রস্তুত!</h2><p>আজকে {childName || "সিমা"} এর জন্য আমরা এখান থেকে শুরু করছি।</p></div><button className="primary-button bottom" type="button" onClick={onNext}>চলুন শুরু করি</button></Screen>;
}

function MoodScreen({ chooseMood }) {
  const moods = [["happy", "😊", "ভালো আছি"], ["neutral", "😐", "মাঝামাঝি"], ["sad", "😔", "মন খারাপ"]];
  return <Screen><div className="screen-head centered mood-head"><h2>আজ তুমি কেমন অনুভব করছো?</h2><p>তোমার অনুভূতি জানলে আভা কোমলভাবে দিন সাজাবে।</p></div><div className="mood-column">{moods.map(([kind, face, label]) => <button className={`mood-face ${kind}`} type="button" key={label} onClick={() => chooseMood(label)}><span>{face}</span><strong>{label}</strong></button>)}</div></Screen>;
}

function Home({ childName, mode, moodCopy, stars, language, restartSetup, go, openActivity }) {
  return (
    <Screen>
      <div className="home-top"><div><p className="eyebrow">আজকের পরিকল্পনা</p><h2>হ্যালো, {childName || "সিমা"}!</h2><p>{moodCopy}</p></div><div className="star-pill">★ {stars}</div></div>
      <div className="offline-strip"><span>●</span>{language === "bn" ? "Offline ready · progress এই ডিভাইসে রাখা হচ্ছে" : "Offline ready · progress is saved on this device"}<button type="button" onClick={restartSetup}>Setup</button></div>
      <div className="path-panel"><div className="mode-kicker"><span>{mode.label}</span><small>{mode.age}</small></div><h3>{mode.goal}</h3><div className="path-line">{mode.activities.slice(0, 3).map((activity) => <button type="button" key={activity[1]} onClick={() => openActivity(activity)}>{activity[0]} {activity[1]}</button>)}</div></div>
      <div className="activity-focus"><p className="eyebrow">আজকের focus</p><div className="emotion-card"><div className="face-art">{mode.hero}</div><p>{mode.focus}</p><div className="pill-row"><button type="button" onClick={() => openActivity(mode.activities[0])}>শুরু</button><button type="button" onClick={() => go("mode")}>সব activity</button></div></div></div>
      <TabBar active="home" go={go} />
    </Screen>
  );
}

function ModeMenu({ mode, setAgeBand, ageBand, go, openActivity }) {
  return (
    <Screen>
      <button className="ghost-back" type="button" onClick={() => go("home")}>‹</button>
      <div className="screen-head"><p className="eyebrow">{mode.label} · {mode.age}</p><h2>আজকের মেনু</h2><p>{mode.guide}</p></div>
      <div className="mode-switch">{Object.entries(modes).map(([key, item]) => <button className={ageBand === key ? "active" : ""} type="button" key={key} onClick={() => setAgeBand(key)}>{item.label}</button>)}</div>
      <div className="module-grid">{mode.activities.map((activity) => <button type="button" key={activity[1]} onClick={() => openActivity(activity)}><span>{activity[0]}</span>{activity[1]}</button>)}</div>
      <button className="secondary-button bottom" type="button" onClick={() => go("home")}>হোমে ফিরুন</button>
    </Screen>
  );
}

function Activity({ activity, mode, reward, go }) {
  const current = activity || { icon: mode.hero, label: mode.focus, description: mode.guide };
  if (current.label.includes("বুদবুদ")) return <BubbleActivity activity={current} reward={reward} go={go} />;
  if (current.label.includes("রঙ")) return <ColorActivity activity={current} reward={reward} go={go} />;
  if (current.label.includes("মেমরি")) return <MemoryActivity activity={current} reward={reward} go={go} />;
  if (current.label.includes("Routine")) return <RoutineActivity activity={current} reward={reward} go={go} />;
  if (current.label.includes("Dressing")) return <ChoiceActivity activity={current} question="বৃষ্টি হলে কী পরবে?" options={["টি-শার্ট", "রেইনকোট", "স্যান্ডেল"]} correct="রেইনকোট" reward={reward} go={go} />;
  if (current.label.includes("Food")) return <ChoiceActivity activity={current} question="কোনটি healthy?" options={["চিপস", "আপেল", "সফট ড্রিংক"]} correct="আপেল" reward={reward} go={go} />;
  if (current.label.includes("Safety")) return <ChoiceActivity activity={current} question="রাস্তা পার হওয়ার আগে কী করবে?" options={["দৌড়াই", "দুই পাশে দেখি", "চোখ বন্ধ করি"]} correct="দুই পাশে দেখি" reward={reward} go={go} />;
  return <ActivityShell title={current.label} subtitle={current.description || mode.guide} back={() => go("home")}><div className="story-scene mode-scene"><span>{current.icon || mode.hero}</span></div><button className="primary-button bottom" type="button" onClick={() => reward(3)}>শেষ করেছি</button></ActivityShell>;
}

function BubbleActivity({ activity, reward, go }) {
  const [popped, setPopped] = useState([]);
  const bubbles = ["b1", "b2", "b3", "b4", "b5"];
  const complete = popped.length >= bubbles.length;
  return (
    <ActivityShell title={activity.label} subtitle={activity.description} guide="শিশুকে বলুন: ‘একটা bubble ধরো’। হাত ধরে না টেনে, শুধু screen-এর দিকে আলতো ইঙ্গিত করুন। সব bubble শেষ হলে শান্তভাবে বলুন ‘শেষ’।" back={() => go("home")}>
      <div className="bubble-play">
        {bubbles.map((id, index) => <button className={`bubble bubble-${index + 1} ${popped.includes(id) ? "popped" : ""}`} type="button" key={id} onClick={() => setPopped((items) => items.includes(id) ? items : [...items, id])}>🫧</button>)}
      </div>
      <div className="activity-meter">{popped.length}/{bubbles.length} bubble</div>
      <button className="primary-button bottom" type="button" disabled={!complete} onClick={() => reward(5)}>{complete ? "দারুণ, শেষ" : "সব bubble ধরো"}</button>
    </ActivityShell>
  );
}

function ColorActivity({ activity, reward, go }) {
  const [chosen, setChosen] = useState("");
  const colors = [["লাল", "#d98a9a"], ["নীল", "#8ea9c8"], ["হলুদ", "#ffd36f"]];
  return (
    <ActivityShell title={activity.label} subtitle={activity.description} guide="একবারে একটি রং বলুন। যেমন ‘লাল কোথায়?’ শিশু tap করলে রংটির নাম ধীরে repeat করুন। ভুল tap করলে কিছু বলার দরকার নেই, আবার রং দেখান।" back={() => go("home")}>
      <div className="color-touch">{colors.map(([label, color]) => <button className={chosen === label ? "selected" : ""} style={{ background: color }} type="button" key={label} onClick={() => setChosen(label)}><span>{label}</span></button>)}</div>
      <div className="speech-output">{chosen ? `${chosen} রং` : "একটি রং ছুঁয়ে দেখো"}</div>
      <button className="primary-button bottom" type="button" disabled={!chosen} onClick={() => reward(3)}>শেষ করেছি</button>
    </ActivityShell>
  );
}

function MemoryActivity({ activity, reward, go }) {
  const cards = ["😊", "☁", "😊", "☁"];
  const [open, setOpen] = useState([]);
  const [matched, setMatched] = useState([]);
  function pick(index) {
    if (open.includes(index) || matched.includes(index)) return;
    const next = [...open, index].slice(-2);
    setOpen(next);
    if (next.length === 2 && cards[next[0]] === cards[next[1]]) setMatched((items) => [...items, ...next]);
    if (next.length === 2 && cards[next[0]] !== cards[next[1]]) window.setTimeout(() => setOpen([]), 450);
  }
  return (
    <ActivityShell title={activity.label} subtitle={activity.description} guide="শিশুকে বলুন দুইটি card খুলে দেখতে। মিল হলে ‘একই’ বলুন, না মিললে কোনো negative শব্দ নয়। চাইলে parent আগে এক pair দেখিয়ে model করতে পারেন।" back={() => go("home")}>
      <div className="memory-grid">{cards.map((card, index) => <button type="button" key={`${card}-${index}`} onClick={() => pick(index)}>{open.includes(index) || matched.includes(index) ? card : "✦"}</button>)}</div>
      <div className="activity-meter">{matched.length / 2}/2 pair</div>
      <button className="primary-button bottom" type="button" disabled={matched.length < cards.length} onClick={() => reward(5)}>শেষ করেছি</button>
    </ActivityShell>
  );
}

function RoutineActivity({ activity, reward, go }) {
  const steps = ["ব্রাশ", "গোসল", "নাস্তা"];
  const [done, setDone] = useState([]);
  return (
    <ActivityShell title={activity.label} subtitle={activity.description} guide="বাসার real routine-এর সাথে মিলিয়ে বলুন: ‘আগে ব্রাশ, তারপর গোসল, তারপর নাস্তা’। প্রতিটি step শেষে child-এর real-life কাজের ছবি দেখালে আরও ভালো।" back={() => go("home")}>
      <div className="routine-track">{steps.map((step, index) => <button className={done.includes(step) ? "done" : ""} type="button" key={step} onClick={() => done.length === index && setDone([...done, step])}><span>{index + 1}</span>{step}</button>)}</div>
      <div className="activity-meter">{done.length}/3 step</div>
      <button className="primary-button bottom" type="button" disabled={done.length < 3} onClick={() => reward(5)}>রুটিন শেষ</button>
    </ActivityShell>
  );
}

function ChoiceActivity({ activity, question, options, correct, reward, go }) {
  const [picked, setPicked] = useState("");
  return (
    <ActivityShell title={activity.label} subtitle={activity.description} guide="প্রশ্নটি ধীরে পড়ুন, তারপর প্রতিটি option দেখিয়ে নাম বলুন। শিশুকে সময় দিন। ভুল হলে ‘না’ বলবেন না, শুধু প্রশ্নটি আবার সহজ করে বলুন।" back={() => go("home")}>
      <div className="choice-question"><span>{activity.icon}</span><h3>{question}</h3></div>
      <div className="story-options">{options.map((option) => <button type="button" key={option} onClick={() => setPicked(option)}>{option}</button>)}</div>
      {picked && <div className="helper-hint">{picked === correct ? "ঠিক হয়েছে। খুব ভালো!" : "আবার ধীরে ভাবি।"}</div>}
      <button className="primary-button bottom" type="button" disabled={picked !== correct} onClick={() => reward(5)}>শেষ করেছি</button>
    </ActivityShell>
  );
}

function Emotion({ reward, softMiss, hintVisible, attempts, go }) {
  return (
    <ActivityShell title="ইমোশন গেম" subtitle="কোন মুখটি খুশি?" guide="মুখের পুরো detail explain করবেন না। শুধু চোখ আর হাসির দিকে ইঙ্গিত করুন। বলুন: ‘হাসি আছে, তাই খুশি’। real human face ব্যবহার না করাই ভালো।" back={() => go("home")}>
      <div className="portrait-card"><div className="simple-face">😊</div></div>
      {hintVisible && <div className="helper-hint">চোখ আর হাসিটা দেখো। যে মুখে নরম হাসি আছে সেটাই খুশি।</div>}
      <div className="emotion-options">
        <button type="button" onClick={() => reward(5)}>🙂</button>
        <button type="button" onClick={softMiss}>😔</button>
        <button type="button" onClick={softMiss}>😨</button>
        <button type="button" onClick={softMiss}>😮</button>
      </div>
      <div className="mini-reward">{attempts >= 3 ? "Hint চালু হয়েছে" : "★ +5"}</div>
    </ActivityShell>
  );
}

function Story({ reward, softMiss, hintVisible, go }) {
  return (
    <ActivityShell title="সোশ্যাল স্টোরি" subtitle="কাউকে দেখলে হ্যালো বলতে হয়" guide="প্রথমে scene দেখান, তারপর নিজে model করুন: হাত নেড়ে ‘হ্যালো’। শিশুকে repeat করতে চাপ দেবেন না; শুধু option বেছে নিতে বলুন।" back={() => go("home")}>
      <div className="story-scene"><span>👦</span><span>👋</span><span>👧</span></div>
      <p className="story-copy">রুহান আরিফকে দেখে, হাসিমুখে হ্যালো বললে সবাই খুশি হয়।</p>
      {hintVisible && <div className="helper-hint">নরমভাবে হাত নেড়ে “হ্যালো” বলা যায়।</div>}
      <div className="story-options">
        <button type="button" onClick={softMiss}>চুপ থাকি</button>
        <button type="button" onClick={() => reward(3)}>হ্যালো বলি</button>
        <button type="button" onClick={softMiss}>দূরে যাই</button>
      </div>
    </ActivityShell>
  );
}

function Trace({ reward, go }) {
  return <ActivityShell title="জাদুকরী আঙুল" subtitle="অক্ষর ছুঁয়ে ধীরে ধীরে আঁকো" guide="শিশুর আঙুল ধরে টানবেন না। আগে parent নিজে বাতাসে ‘অ’ আঁকুন, তারপর child-কে screen-এ চেষ্টা করতে দিন। perfect tracing দরকার নেই।" back={() => go("home")}><div className="trace-board"><span>অ</span><div className="trace-glow" /></div><button className="primary-button bottom" type="button" onClick={() => reward(4)}>শেষ করেছি</button></ActivityShell>;
}

function Aac({ recordActivity, go }) {
  const [phrase, setPhrase] = useState("ছবিতে tap করলে বাক্য এখানে দেখা যাবে।");
  return (
    <ActivityShell title="AAC বোর্ড" subtitle="ছবিতে tap করে প্রয়োজন বলা যাবে।" guide="শিশু card tap করলে বাক্যটি parent উচ্চারণ করুন। যেমন ‘আমি পানি চাই’। এরপর সম্ভব হলে real পানি দিন, যাতে symbol আর বাস্তব প্রয়োজনের connection তৈরি হয়।" back={() => go("mode")}>
      <div className="speech-output">{phrase}</div>
      <div className="aac-grid">{aacItems.map(([icon, label]) => <button type="button" key={label} onClick={() => { setPhrase(label); recordActivity("AAC বোর্ড", 0, false); }}>{icon}<span>{label}</span></button>)}</div>
    </ActivityShell>
  );
}

function Calm({ close }) {
  return <Screen><button className="ghost-back close" type="button" onClick={close}>×</button><div className="rain-lines" aria-hidden="true" /><div className="calm-content"><h2>চল, একটু শান্ত হই</h2><p>শ্বাস নাও... ধীরে ছাড়ো...</p><div className="breathing-balloon" /><div className="timer">04:59</div><div className="sound-row"><button>🌧 বৃষ্টি</button><button>〰 বাতাস</button><button>♫ সুর</button></div></div></Screen>;
}

function Reward({ stars, go }) {
  return <Screen><div className="reward-center"><h2>দারুণ হয়েছে!</h2><p>তুমি star পেয়েছো</p><div className="giant-star">★</div><strong>+10</strong><div className="total-star">মোট star {stars + 31}</div></div><div className="two-actions bottom-row"><button className="primary-button" type="button" onClick={() => go("customize")}>চরিত্র সাজাও</button><button className="home-icon" type="button" onClick={() => go("home")}>⌂</button></div></Screen>;
}

function Customize({ go }) {
  return <Screen><button className="ghost-back" type="button" onClick={() => go("reward")}>‹</button><div className="screen-head centered"><h2>তোমার চরিত্র সাজাও</h2></div><div className="avatar-preview">👦</div><div className="custom-tabs"><button className="active">চুল</button><button>পোশাক</button><button>ব্যাকগ্রাউন্ড</button></div><div className="closet-row"><button>👕</button><button>👚</button><button>🧥</button><button>🎒</button></div><button className="primary-button bottom" type="button" onClick={() => go("home")}>সংরক্ষণ</button></Screen>;
}

function ActivityShell({ title, subtitle, guide, back, children }) {
  const [guideOpen, setGuideOpen] = useState(false);
  return (
    <Screen>
      <button className="ghost-back" type="button" onClick={back}>‹</button>
      <div className="screen-head centered">
        <h2>{title}</h2>
        <p>{subtitle}</p>
        {guide && <button className="parent-guide-trigger" type="button" onClick={() => setGuideOpen(true)}>Parent guide</button>}
      </div>
      {children}
      {guideOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Parent guide">
          <div className="parent-guide-modal">
            <div className="modal-cloud">☁</div>
            <h3>Parent guide</h3>
            <p>{guide}</p>
            <button className="primary-button" type="button" onClick={() => setGuideOpen(false)}>বুঝেছি</button>
          </div>
        </div>
      )}
    </Screen>
  );
}

function TabBar({ active, go }) {
  const tabs = [["home", "⌂", "হোম"], ["mode", "▦", "মোড"], ["reward", "★", "রিওয়ার্ড"], ["parent", "▤", "প্যারেন্ট"]];
  return <nav className="tabbar" aria-label="প্রধান নেভিগেশন">{tabs.map(([id, icon, label]) => <button className={active === id ? "active" : ""} type="button" key={id} onClick={() => go(id)}>{icon}<span>{label}</span></button>)}</nav>;
}

function ParentDashboard({ childName, mood, mode, progress, fontScale, setFontScale, language, setLanguage, restartSetup, go }) {
  const moduleEntries = Object.entries(progress.modules || {}).slice(-4);
  const weakEntries = Object.entries(progress.weakAreas || {}).sort((a, b) => b[1] - a[1]).slice(0, 2);
  const recentMoods = (progress.moodHistory || []).slice(-4);
  return (
    <Screen>
      <button className="ghost-back" type="button" onClick={() => go("home")}>‹</button>
      <div className="dashboard-head"><div><p className="eyebrow">Parent Dashboard</p><h2>সাপ্তাহিক অগ্রগতি</h2></div><button className="small-chip" type="button" onClick={() => go("therapist")}>Therapist</button></div>
      <div className="stat-row"><div><strong>{progress.completed}</strong><span>Complete</span></div><div><strong>{progress.starsEarned}</strong><span>Earned star</span></div></div>
      <div className="mood-history">{recentMoods.length ? recentMoods.map((item, index) => <span key={`${item.date}-${index}`}>{item.mood}</span>) : <><span>🙂 সোম</span><span>😐 মঙ্গল</span><span>{mood || "🙂"} আজ</span><span>☁ calm</span></>}</div>
      <div className="chart-card"><h3>Module progress</h3>{moduleEntries.length ? <div className="module-list">{moduleEntries.map(([label, item]) => <div key={label}><span>{label}</span><strong>{item.count}x · ★ {item.stars}</strong></div>)}</div> : <div className="empty-state">এখনো activity complete হয়নি।</div>}</div>
      <div className="insight-card"><h3>Home practice</h3><p>{weakEntries.length ? `${childName} ${weakEntries[0][0]}-এ একটু help চাইছে। familiar hint দিয়ে ৫ মিনিট practice করুন।` : `${childName} এর জন্য ${mode.label} mode-এ ৫ মিনিট “${mode.activities[0][1]}” অনুশীলন রাখুন।`}</p></div>
      <div className="setting-card"><label htmlFor="fontSize">Font size</label><input id="fontSize" type="range" min="0.95" max="1.16" step="0.01" value={fontScale} onChange={(event) => setFontScale(Number(event.target.value))} /></div>
      <div className="setting-card setting-row"><span>Language</span><button type="button" onClick={() => setLanguage(language === "bn" ? "en" : "bn")}>{language === "bn" ? "বাংলা" : "English"}</button></div>
      <button className="secondary-button setup-again" type="button" onClick={restartSetup}>Setup আবার করুন</button>
      <TabBar active="parent" go={go} />
    </Screen>
  );
}

function TherapistMode({ childName, go }) {
  return <Screen><button className="ghost-back" type="button" onClick={() => go("parent")}>‹</button><div className="screen-head"><p className="eyebrow">Therapist Mode</p><h2>{childName} · রিপোর্ট</h2></div><div className="task-list">{["ইমোশন গেম 8/10", "সোশ্যাল স্টোরি 6/10", "Eye Contact 7/10", "AAC Board 5/10"].map((item) => <div key={item}><span>{item.slice(0, -4)}</span><strong>{item.slice(-4)}</strong></div>)}</div><label className="field-label" htmlFor="note">Session note</label><textarea id="note" className="text-input textarea" defaultValue="আজ calm screen দ্রুত কাজে এসেছে। পরের সেশনে পরিচিত emotion card আগে দিন।" /><button className="primary-button bottom" type="button" onClick={() => go("parent")}>Parent-কে পাঠান</button></Screen>;
}

export default App;
