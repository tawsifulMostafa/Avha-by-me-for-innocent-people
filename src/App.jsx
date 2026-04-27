import React, { useEffect, useMemo, useState } from "react";

const storageKey = "aava-v1-mvp";

const moodOptions = [
  { id: "good", label: "ভালো আছি", emoji: "😊", note: "আজ একটু নতুন জিনিসও চেষ্টা করা যাবে।" },
  { id: "okay", label: "মাঝামাঝি", emoji: "😐", note: "আজ পরিচিত ধাপে ধাপে খেলি।" },
  { id: "sad", label: "মন খারাপ", emoji: "😔", note: "আজ সহজ, শান্ত, পরিচিত পছন্দ রাখা হবে।" },
];

const defaultSetup = {
  childName: "",
  speech: "some",
  focus: "communication",
  playMode: "caregiver",
};

const requestGuides = {
  water: "শিশু ছবি বাছলে বাক্যটি জোরে পড়ুন: ‘আমি পানি চাই’। তারপর সম্ভব হলে সত্যি পানি দেখান বা দিন।",
  food: "খাবারের ছবি বাছলে ‘আমি খাবার চাই’ বলুন। নাশতা বা খাবারের সময়ের সাথে মিলিয়ে practice করুন।",
  break: "বিরতি কার্ড বাছলে সঙ্গে সঙ্গে ৩০ সেকেন্ড quiet break দিন, যাতে card আর real break-এর সম্পর্ক তৈরি হয়।",
  play: "খেলতে চাই card বাছলে child-এর পছন্দের toy বা simple play option দেখান।",
};

const requestObjects = {
  water: { label: "পানি", icon: "💧" },
  food: { label: "খাবার", icon: "🍚" },
  break: { label: "বিরতি", icon: "☁" },
  play: { label: "খেলা", icon: "🧩" },
};

const requestSets = {
  easy: [
    { id: "water", icon: "💧", label: "পানি", sentence: "আমি পানি চাই", match: ["water", "food"] },
    { id: "break", icon: "☁", label: "বিরতি", sentence: "আমি বিরতি চাই", match: ["break", "play"] },
  ],
  medium: [
    { id: "water", icon: "💧", label: "পানি", sentence: "আমি পানি চাই", match: ["water", "food"] },
    { id: "food", icon: "🍚", label: "খাবার", sentence: "আমি খাবার চাই", match: ["food", "water"] },
    { id: "break", icon: "☁", label: "বিরতি", sentence: "আমি বিরতি চাই", match: ["break", "play"] },
  ],
  broad: [
    { id: "water", icon: "💧", label: "পানি", sentence: "আমি পানি চাই", match: ["water", "food"] },
    { id: "food", icon: "🍚", label: "খাবার", sentence: "আমি খাবার চাই", match: ["food", "water"] },
    { id: "break", icon: "☁", label: "বিরতি", sentence: "আমি বিরতি চাই", match: ["break", "play"] },
    { id: "play", icon: "🧩", label: "খেলা", sentence: "আমি খেলতে চাই", match: ["play", "break"] },
  ],
};

const emotionSets = {
  easy: {
    scene: "🙂",
    sceneLabel: "নরম হাসি",
    correct: "happy",
    choices: [
      { id: "happy", icon: "🙂", label: "খুশি" },
      { id: "sad", icon: "😢", label: "কষ্ট" },
    ],
    hint: "হাসিটা দেখো। যে মুখে নরম হাসি আছে সে খুশি।",
    guide: "মুখের সব detail ব্যাখ্যা না করে শুধু হাসি বা চোখের দিকে ইঙ্গিত করুন। child answer না দিলে নিজে model করে আবার জিজ্ঞেস করুন।",
    success: "খুশি মুখ চেনা গেল।",
  },
  medium: {
    scene: "😢",
    sceneLabel: "চোখে জল",
    correct: "sad",
    choices: [
      { id: "happy", icon: "🙂", label: "খুশি" },
      { id: "sad", icon: "😢", label: "কষ্ট" },
      { id: "scared", icon: "😨", label: "ভয়" },
    ],
    hint: "চোখে জল আছে। তাই এই মুখ কষ্ট পাচ্ছে।",
    guide: "বলুন ‘চোখে জল মানে কষ্ট লাগছে’। child যদি confuse হয়, দুইটা choice-এ নামিয়ে আনুন।",
    success: "কষ্টের মুখ চেনা গেল।",
  },
  broad: {
    scene: "😨",
    sceneLabel: "চমকে গেছে",
    correct: "scared",
    choices: [
      { id: "happy", icon: "🙂", label: "খুশি" },
      { id: "sad", icon: "😢", label: "কষ্ট" },
      { id: "scared", icon: "😨", label: "ভয়" },
    ],
    hint: "চোখ বড় হয়ে গেছে। সে ভয় পেয়েছে।",
    guide: "একবার choice গুলো দেখিয়ে নাম বলুন। child answer করার আগে আপনি ভয় পাওয়া face একটু enact করতে পারেন।",
    success: "ভয়ের মুখ চেনা গেল।",
  },
};

const socialSets = {
  easy: {
    sceneTitle: "কেউ হাত নেড়ে hello বলছে",
    sceneVisual: ["👦", "👋", "👧"],
    correct: "say-hello",
    choices: [
      { id: "say-hello", icon: "👋", label: "হ্যালো বলি" },
      { id: "walk-away", icon: "🚶", label: "চলে যাই" },
    ],
    hint: "যখন কেউ hello বলে, তখন নরম করে hello বললে ভালো লাগে।",
    guide: "আপনি আগে নিজে হাত নেড়ে ‘হ্যালো’ model করুন। child শুধু picture বাছলেও চলবে। repeat করতে চাপ দেবেন না।",
    success: "হ্যালো মানুষকে স্বাগত মনে করায়।",
  },
  medium: {
    sceneTitle: "বন্ধু কাঁদছে",
    sceneVisual: ["🧒", "😢", "🧸"],
    correct: "offer-toy",
    choices: [
      { id: "offer-toy", icon: "🧸", label: "খেলনা দিই" },
      { id: "laugh", icon: "😆", label: "হাসি" },
      { id: "leave", icon: "🚶", label: "চলে যাই" },
    ],
    hint: "বন্ধু কাঁদলে নরমভাবে সাহায্য করা যায়।",
    guide: "বলুন ‘কাঁদলে আমরা help করি’। toy বা tissue এর মতো concrete help দেখালে child সহজে বুঝবে।",
    success: "সাহায্য করলে বন্ধু একটু ভালো বোধ করতে পারে।",
  },
  broad: {
    sceneTitle: "দুইজন মিলে পালা করে খেলছে",
    sceneVisual: ["🧒", "🎲", "🧒"],
    correct: "wait-turn",
    choices: [
      { id: "grab", icon: "✋", label: "ছিনিয়ে নিই" },
      { id: "wait-turn", icon: "⏳", label: "অপেক্ষা করি" },
      { id: "cry", icon: "😢", label: "কাঁদি" },
    ],
    hint: "পালা করে খেললে সবার খেলতে সুযোগ হয়।",
    guide: "একটা real toy নিয়ে ‘এখন আমার পালা, পরে তোমার পালা’ এই model করে তারপর choice দেখান।",
    success: "অপেক্ষা করলে পালা করে খেলা যায়।",
  },
};

function loadSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved) return null;
    return saved;
  } catch {
    return null;
  }
}

function getMoodMeta(moodId) {
  return moodOptions.find((item) => item.id === moodId) || moodOptions[1];
}

function pickDifficulty(moodId) {
  if (moodId === "sad") return "easy";
  if (moodId === "good") return "broad";
  return "medium";
}

function buildDailyPlan(setup, moodId) {
  const difficulty = pickDifficulty(moodId);
  const games = {
    request: {
      id: "request",
      title: "চাই বলি",
      icon: "💬",
      purpose: "ছবি বেছে প্রয়োজন বলা",
      parentGuide: "শিশু card বাছলে বাক্যটি parent বলবেন এবং সম্ভব হলে বাস্তব জিনিসটি দেখাবেন।",
      data: requestSets[difficulty],
    },
    emotion: {
      id: "emotion",
      title: "মুখ চিনো",
      icon: "🙂",
      purpose: "মুখ দেখে অনুভূতি চেনা",
      parentGuide: emotionSets[difficulty].guide,
      data: emotionSets[difficulty],
    },
    social: {
      id: "social",
      title: "কি করা ভালো",
      icon: "🤝",
      purpose: "সহজ social response বেছে নেওয়া",
      parentGuide: socialSets[difficulty].guide,
      data: socialSets[difficulty],
    },
  };

  let order = ["request", "emotion", "social"];
  const reasonParts = [];

  if (setup.speech !== "talks") {
    order = ["request", "emotion", "social"];
    reasonParts.push("আজ চাওয়া-বলার practice আগে");
  } else if (setup.focus === "emotion") {
    order = ["emotion", "request", "social"];
    reasonParts.push("আজ মুখ-চেনা practice আগে");
  } else if (setup.focus === "social") {
    order = ["social", "request", "emotion"];
    reasonParts.push("আজ social response আগে");
  } else {
    reasonParts.push("আজ চাওয়া-বলার practice আগে");
  }

  if (moodId === "sad") {
    reasonParts.push("সহজ choice আর ইঙ্গিত আগে");
  } else if (moodId === "good") {
    reasonParts.push("একটু বেশি choice রাখা হয়েছে");
  } else {
    reasonParts.push("পরিচিত ধাপে practice");
  }

  return {
    reason: reasonParts.join(" · "),
    caregiverNote: setup.playMode === "caregiver" ? "প্রতিটি game-এর আগে ছোট parent guide দেখা যাবে।" : "শিশু ছবি দেখে নিজেই বেছে নিতে পারবে।",
    games: order.map((id, index) => ({
      ...games[id],
      order: index + 1,
      promptLevel: setup.playMode === "caregiver" ? "guided" : "independent",
    })),
  };
}

function buildHomeSuggestion(sessionResults) {
  if (!sessionResults.length) {
    return "আজ একটি চাই-card real life-এও ব্যবহার করে দেখুন।";
  }
  const easiest = [...sessionResults]
    .sort((a, b) => a.attemptCount - b.attemptCount || Number(a.hintUsed) - Number(b.hintUsed))[0];

  if (easiest?.gameId === "request") {
    return "আজ পানি বা বিরতি card real life-এও ব্যবহার করুন।";
  }
  if (easiest?.gameId === "emotion") {
    return "আজ mirror বা simple face picture দিয়ে খুশি-কষ্ট practice করুন।";
  }
  return "আজ hello বা turn-taking real play-এ model করে দেখান।";
}

function buildSummary(sessionResults, moodId) {
  const moodMeta = getMoodMeta(moodId);
  const hintGames = sessionResults.filter((item) => item.hintUsed).map((item) => item.title);
  const easiest = sessionResults.length
    ? [...sessionResults].sort((a, b) => a.attemptCount - b.attemptCount || Number(a.hintUsed) - Number(b.hintUsed))[0]
    : null;

  return {
    mood: moodMeta,
    completed: sessionResults.filter((item) => item.success).length,
    hintGames,
    easiest,
    suggestion: buildHomeSuggestion(sessionResults),
  };
}

function App() {
  const saved = loadSavedState();
  const [screen, setScreen] = useState(saved?.screen || "setup");
  const [setup, setSetup] = useState(saved?.setup || defaultSetup);
  const [moodId, setMoodId] = useState(saved?.moodId || "");
  const [activeGameIndex, setActiveGameIndex] = useState(saved?.activeGameIndex || 0);
  const [sessionResults, setSessionResults] = useState(saved?.sessionResults || []);
  const [recentSessions, setRecentSessions] = useState(saved?.recentSessions || []);
  const [guideOpen, setGuideOpen] = useState(false);

  const plan = useMemo(() => buildDailyPlan(setup, moodId || "okay"), [setup, moodId]);
  const activeGame = plan.games[activeGameIndex] || null;
  const summary = useMemo(() => buildSummary(sessionResults, moodId || "okay"), [sessionResults, moodId]);

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        screen,
        setup,
        moodId,
        activeGameIndex,
        sessionResults,
        recentSessions,
      }),
    );
  }, [screen, setup, moodId, activeGameIndex, sessionResults, recentSessions]);

  function updateSetup(field, value) {
    setSetup((current) => ({ ...current, [field]: value }));
  }

  function startMood() {
    setScreen("mood");
  }

  function chooseMood(nextMoodId) {
    setMoodId(nextMoodId);
    setSessionResults([]);
    setActiveGameIndex(0);
    setScreen("home");
  }

  function openGame(index = 0) {
    setActiveGameIndex(index);
    setGuideOpen(false);
    setScreen("game");
  }

  function saveGameResult(result) {
    setSessionResults((current) => {
      const next = [...current];
      next[result.order - 1] = result;
      return next;
    });
    if (result.order >= 3) {
      setRecentSessions((current) => [
        {
          date: new Date().toISOString(),
          moodId,
          setup,
          results: [...sessionResults.slice(0, result.order - 1), result],
        },
        ...current,
      ].slice(0, 10));
      setScreen("finish");
      return;
    }
    setActiveGameIndex(result.order);
    setScreen("home");
  }

  function restartDay() {
    setMoodId("");
    setSessionResults([]);
    setActiveGameIndex(0);
    setScreen("mood");
  }

  function resetAll() {
    localStorage.removeItem(storageKey);
    setSetup(defaultSetup);
    setMoodId("");
    setActiveGameIndex(0);
    setSessionResults([]);
    setRecentSessions([]);
    setGuideOpen(false);
    setScreen("setup");
  }

  return (
    <div className="app-shell">
      <div className="phone">
        <div className="status-bar">
          <span>9:41</span>
          <span>আভা</span>
        </div>

        {screen === "setup" && (
          <SetupScreen setup={setup} updateSetup={updateSetup} startMood={startMood} />
        )}

        {screen === "mood" && (
          <MoodScreen childName={setup.childName || "তোমার শিশু"} chooseMood={chooseMood} />
        )}

        {screen === "home" && (
          <HomeScreen
            setup={setup}
            moodId={moodId}
            plan={plan}
            sessionResults={sessionResults}
            openGame={openGame}
            openSummary={() => setScreen("summary")}
            restartDay={restartDay}
          />
        )}

        {screen === "game" && activeGame && (
          <GameScreen
            game={activeGame}
            moodId={moodId}
            onComplete={saveGameResult}
            onBack={() => setScreen("home")}
            guideOpen={guideOpen}
            setGuideOpen={setGuideOpen}
          />
        )}

        {screen === "finish" && (
          <FinishScreen
            childName={setup.childName || "আজকের সঙ্গী"}
            completed={summary.completed}
            goSummary={() => setScreen("summary")}
          />
        )}

        {screen === "summary" && (
          <SummaryScreen
            setup={setup}
            summary={summary}
            sessionResults={sessionResults}
            restartDay={restartDay}
            resetAll={resetAll}
            goHome={() => setScreen("home")}
          />
        )}
      </div>
    </div>
  );
}

function SetupScreen({ setup, updateSetup, startMood }) {
  const ready = setup.childName.trim().length > 0;

  return (
    <Screen>
      <div className="screen-head">
        <p className="eyebrow">৪-৬ বছর · ছবি-ভিত্তিক</p>
        <h1 className="brand-title">আভা</h1>
        <p className="subtitle">শান্ত, সহজ, ছবি দিয়ে বোঝা যায় এমন ৩টা ছোট শেখার game।</p>
      </div>

      <label className="field-label" htmlFor="childName">শিশুর নাম</label>
      <input
        id="childName"
        className="text-input"
        value={setup.childName}
        onChange={(event) => updateSetup("childName", event.target.value)}
        placeholder="নাম লিখুন"
      />

      <div className="compact-note">এই version শুধু ৪-৬ বছরের জন্য</div>

      <QuestionBlock title="কথা বলা">
        <ChoiceRow
          selected={setup.speech}
          onSelect={(value) => updateSetup("speech", value)}
          options={[
            { id: "talks", title: "কথা বলে", text: "ছোট শব্দ বা সহজ বাক্য" },
            { id: "some", title: "কিছু শব্দ", text: "ছবি সহায়তা ভালো কাজ করে" },
            { id: "not-yet", title: "এখনও না", text: "AAC আগে দরকার" },
          ]}
        />
      </QuestionBlock>

      <QuestionBlock title="আজ কোন practice বেশি দরকার?">
        <ChoiceRow
          selected={setup.focus}
          onSelect={(value) => updateSetup("focus", value)}
          options={[
            { id: "communication", title: "চাই বলা", text: "request আর AAC" },
            { id: "emotion", title: "মুখ চেনা", text: "emotion matching" },
            { id: "social", title: "social response", text: "hello, help, turn" },
          ]}
        />
      </QuestionBlock>

      <QuestionBlock title="আজ কে পাশে থাকবে?">
        <ChoiceRow
          selected={setup.playMode}
          onSelect={(value) => updateSetup("playMode", value)}
          options={[
            { id: "caregiver", title: "caregiver সাথে", text: "guide দেখা যাবে" },
            { id: "alone", title: "শিশু নিজে", text: "ছবি বেছে খেলবে" },
          ]}
        />
      </QuestionBlock>

      <button className="primary-button bottom" type="button" onClick={startMood} disabled={!ready}>
        mood check-in এ যাই
      </button>
    </Screen>
  );
}

function QuestionBlock({ title, children }) {
  return (
    <section className="question-block">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ChoiceRow({ options, selected, onSelect }) {
  return (
    <div className="choice-list">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`choice-panel ${selected === option.id ? "selected" : ""}`}
          onClick={() => onSelect(option.id)}
          aria-pressed={selected === option.id}
        >
          <strong>{option.title}</strong>
          <span>{option.text}</span>
        </button>
      ))}
    </div>
  );
}

function MoodScreen({ childName, chooseMood }) {
  return (
    <Screen>
      <div className="screen-head centered mood-head">
        <h2>আজ {childName} কেমন আছে?</h2>
        <p>একটা মুখ বেছে নাও</p>
      </div>
      <div className="mood-column">
        {moodOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`mood-face ${option.id}`}
            onClick={() => chooseMood(option.id)}
          >
            <span>{option.emoji}</span>
            <strong>{option.label}</strong>
          </button>
        ))}
      </div>
    </Screen>
  );
}

function HomeScreen({ setup, moodId, plan, sessionResults, openGame, openSummary, restartDay }) {
  const moodMeta = getMoodMeta(moodId);
  const nextIndex = sessionResults.length;
  const nextGame = plan.games[nextIndex] || null;

  return (
    <Screen>
      <div className="home-top">
        <div>
          <p className="eyebrow">{moodMeta.label}</p>
          <h2>{setup.childName || "আজকের plan"}</h2>
          <p className="subtitle">{plan.reason}</p>
        </div>
        <button className="small-chip" type="button" onClick={restartDay}>Mood</button>
      </div>

      <div className="care-strip">
        <strong>{plan.games[0].title} আগে</strong>
        <span>{plan.caregiverNote}</span>
      </div>

      <div className="today-pack">
        <p className="pack-label">আজকের ৩টা game</p>
        <div className="pack-row">
          {plan.games.map((game, index) => {
            const done = Boolean(sessionResults[index]?.success);
            const current = nextIndex === index;
            return (
              <button
                key={game.id}
                type="button"
                className={`pack-chip ${done ? "done" : ""} ${current ? "current" : ""}`}
                onClick={() => openGame(index)}
              >
                <span>{game.icon}</span>
                <strong>{game.title}</strong>
              </button>
            );
          })}
        </div>
      </div>

      {nextGame ? (
        <button className="hero-card" type="button" onClick={() => openGame(nextIndex)}>
          <div className="hero-icon">{nextGame.icon}</div>
          <div>
            <strong>{nextGame.title}</strong>
            <span>{nextGame.purpose}</span>
          </div>
        </button>
      ) : (
        <div className="hero-card finished" role="status">
          <div className="hero-icon">⭐</div>
          <div>
            <strong>আজকের ৩টা game শেষ</strong>
            <span>Parent summary দেখো</span>
          </div>
        </div>
      )}

      <div className="home-actions bottom-stack">
        <button className="primary-button" type="button" onClick={() => (nextGame ? openGame(nextIndex) : openSummary())}>
          {nextGame ? "এখন শুরু করি" : "summary দেখি"}
        </button>
        <button className="secondary-button" type="button" onClick={openSummary}>
          parent summary
        </button>
      </div>
    </Screen>
  );
}

function GameScreen({ game, moodId, onComplete, onBack, guideOpen, setGuideOpen }) {
  return (
    <Screen>
      <button className="ghost-back" type="button" onClick={onBack}>‹</button>
      <div className="screen-head centered activity-head">
          <p className="eyebrow">খেলা {game.order} / ৩</p>
          <h2>{game.title}</h2>
          <p>{game.purpose}</p>
          <button className="parent-guide-trigger" type="button" onClick={() => setGuideOpen(true)}>
            Parent guide
        </button>
      </div>

      {game.id === "request" && <RequestBuilderGame game={game} moodId={moodId} onComplete={onComplete} />}
      {game.id === "emotion" && <EmotionMatchGame game={game} moodId={moodId} onComplete={onComplete} />}
      {game.id === "social" && <SocialResponseGame game={game} moodId={moodId} onComplete={onComplete} />}

      {guideOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Parent guide">
          <div className="parent-guide-modal">
            <div className="modal-cloud">☁</div>
            <h3>Parent guide</h3>
            <p>{game.parentGuide}</p>
            <button className="primary-button" type="button" onClick={() => setGuideOpen(false)}>
              বুঝেছি
            </button>
          </div>
        </div>
      )}
    </Screen>
  );
}

function RequestBuilderGame({ game, moodId, onComplete }) {
  const needsMatch = moodId !== "sad";
  const [selected, setSelected] = useState(null);
  const [matchChoice, setMatchChoice] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  const cards = game.data;
  const hintThreshold = moodId === "sad" ? 1 : 2;

  function selectCard(card) {
    setSelected(card);
    setAttemptCount((value) => value + 1);
  }

  function chooseMatch(optionId) {
    const nextAttempts = attemptCount + 1;
    setMatchChoice(optionId);
    setAttemptCount(nextAttempts);
    if (optionId !== selected.id && nextAttempts >= hintThreshold) {
      setHintUsed(true);
    }
  }

  const done = selected && (!needsMatch || matchChoice === selected.id);
  const promptLevel = hintUsed ? "prompted" : game.promptLevel;

  return (
    <div className="game-body">
      {!selected && (
        <>
          <div className="prompt-card">
            <div className="prompt-emoji">💬</div>
            <strong>কি চাই?</strong>
            <span>একটা ছবি বেছে নাও</span>
          </div>
          <div className="picture-grid">
            {cards.map((card) => (
              <button key={card.id} type="button" className="picture-choice" onClick={() => selectCard(card)}>
                <div className="picture-icon">{card.icon}</div>
                <strong>{card.label}</strong>
              </button>
            ))}
          </div>
        </>
      )}

      {selected && (
        <>
          <div className="sentence-strip">{selected.sentence}</div>
          {needsMatch ? (
            <>
              <div className="prompt-card small">
                <strong>কোন জিনিসটা মিলে?</strong>
                <span>একটা বেছে নাও</span>
              </div>
              <div className="picture-grid two">
                {selected.match.map((itemId) => {
                  const item = requestObjects[itemId];
                  return (
                    <button
                      key={itemId}
                      type="button"
                      className={`picture-choice ${matchChoice === itemId ? "selected" : ""}`}
                      onClick={() => chooseMatch(itemId)}
                    >
                      <div className="picture-icon">{item.icon}</div>
                      <strong>{item.label}</strong>
                    </button>
                  );
                })}
              </div>
              {matchChoice && matchChoice !== selected.id && (
                <div className="hint-box">{requestGuides[selected.id]}</div>
              )}
            </>
          ) : (
            <div className="hint-box success-tone">আজ শুধু picture দিয়ে request বলাই যথেষ্ট।</div>
          )}
        </>
      )}

      <button
        className="primary-button bottom"
        type="button"
        disabled={!done}
        onClick={() =>
          onComplete({
            order: game.order,
            gameId: game.id,
            title: game.title,
            attemptCount,
            hintUsed,
            promptLevel,
            selectedAnswer: selected?.id || "",
            success: true,
          })
        }
      >
        শেষ করেছি
      </button>
    </div>
  );
}

function EmotionMatchGame({ game, moodId, onComplete }) {
  const hintThreshold = moodId === "sad" ? 1 : 2;
  const [picked, setPicked] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  function choose(optionId) {
    const nextAttempts = attemptCount + 1;
    setPicked(optionId);
    setAttemptCount(nextAttempts);
    if (optionId !== game.data.correct && nextAttempts >= hintThreshold) {
      setHintUsed(true);
    }
  }

  const success = picked === game.data.correct;

  return (
    <div className="game-body">
      <div className="illustration-card">
        <div className="big-face">{game.data.scene}</div>
        <strong>{game.data.sceneLabel}</strong>
      </div>

      {hintUsed && <div className="hint-box">{game.data.hint}</div>}

      <div className={`picture-grid ${game.data.choices.length === 2 ? "two" : "three"}`}>
        {game.data.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={`picture-choice ${picked === choice.id ? "selected" : ""}`}
            onClick={() => choose(choice.id)}
          >
            <div className="picture-icon">{choice.icon}</div>
            <strong>{choice.label}</strong>
          </button>
        ))}
      </div>

      {success && <div className="hint-box success-tone">{game.data.success}</div>}

      <button
        className="primary-button bottom"
        type="button"
        disabled={!success}
        onClick={() =>
          onComplete({
            order: game.order,
            gameId: game.id,
            title: game.title,
            attemptCount,
            hintUsed,
            promptLevel: hintUsed ? "prompted" : game.promptLevel,
            selectedAnswer: picked,
            success: true,
          })
        }
      >
        শেষ করেছি
      </button>
    </div>
  );
}

function SocialResponseGame({ game, moodId, onComplete }) {
  const hintThreshold = moodId === "sad" ? 1 : 2;
  const [picked, setPicked] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);

  function choose(optionId) {
    const nextAttempts = attemptCount + 1;
    setPicked(optionId);
    setAttemptCount(nextAttempts);
    if (optionId !== game.data.correct && nextAttempts >= hintThreshold) {
      setHintUsed(true);
    }
  }

  const success = picked === game.data.correct;

  return (
    <div className="game-body">
      <div className="scene-card">
        <div className="scene-people">
          {game.data.sceneVisual.map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
        </div>
        <strong>{game.data.sceneTitle}</strong>
      </div>

      {hintUsed && <div className="hint-box">{game.data.hint}</div>}

      <div className={`picture-grid ${game.data.choices.length === 2 ? "two" : "three"}`}>
        {game.data.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={`picture-choice ${picked === choice.id ? "selected" : ""}`}
            onClick={() => choose(choice.id)}
          >
            <div className="picture-icon">{choice.icon}</div>
            <strong>{choice.label}</strong>
          </button>
        ))}
      </div>

      {success && <div className="hint-box success-tone">{game.data.success}</div>}

      <button
        className="primary-button bottom"
        type="button"
        disabled={!success}
        onClick={() =>
          onComplete({
            order: game.order,
            gameId: game.id,
            title: game.title,
            attemptCount,
            hintUsed,
            promptLevel: hintUsed ? "prompted" : game.promptLevel,
            selectedAnswer: picked,
            success: true,
          })
        }
      >
        শেষ করেছি
      </button>
    </div>
  );
}

function FinishScreen({ childName, completed, goSummary }) {
  return (
    <Screen>
      <div className="reward-center">
        <div className="giant-star">⭐</div>
        <h2>দারুণ হয়েছে</h2>
        <p>{childName} আজ {completed}/3 game শেষ করেছে</p>
      </div>
      <button className="primary-button bottom" type="button" onClick={goSummary}>
        parent summary
      </button>
    </Screen>
  );
}

function SummaryScreen({ setup, summary, sessionResults, restartDay, resetAll, goHome }) {
  return (
    <Screen>
      <div className="screen-head">
        <p className="eyebrow">Parent summary</p>
        <h2>{setup.childName || "আজকের session"}</h2>
        <p className="subtitle">আজকের ৩টা game কেমন গেল তার ছোট summary</p>
      </div>

      <div className="summary-card">
        <div>
          <strong>আজকের mood</strong>
          <span>{summary.mood.emoji} {summary.mood.label}</span>
        </div>
        <div>
          <strong>Complete</strong>
          <span>{summary.completed}/3</span>
        </div>
      </div>

      <div className="summary-block">
        <h3>কোন game-এ hint লেগেছে</h3>
        <p>{summary.hintGames.length ? summary.hintGames.join(", ") : "আজ hint ছাড়াই করা গেছে।"}</p>
      </div>

      <div className="summary-block">
        <h3>সবচেয়ে সহজ ছিল</h3>
        <p>{summary.easiest ? `${summary.easiest.title} · ${summary.easiest.attemptCount} বারেই` : "এখনও game শেষ হয়নি।"}</p>
      </div>

      <div className="summary-block">
        <h3>আজকের home suggestion</h3>
        <p>{summary.suggestion}</p>
      </div>

      <div className="result-list">
        {sessionResults.map((result) => (
          <div key={`${result.gameId}-${result.order}`} className="result-row">
            <strong>{result.title}</strong>
            <span>{result.attemptCount} বার · {result.hintUsed ? "hint" : "no hint"}</span>
          </div>
        ))}
      </div>

      <div className="two-actions bottom-row">
        <button className="primary-button" type="button" onClick={restartDay}>নতুন mood দিয়ে শুরু</button>
        <button className="secondary-button" type="button" onClick={goHome}>আজকের plan</button>
      </div>
      <button className="ghost-reset" type="button" onClick={resetAll}>সব reset</button>
    </Screen>
  );
}

function Screen({ children }) {
  return <section className="screen active">{children}</section>;
}

export default App;
