import { useEffect, useMemo, useRef, useState } from "react";

const TOTAL_OVERS = 2;
const BALLS_PER_OVER = 6;
const TOTAL_BALLS = TOTAL_OVERS * BALLS_PER_OVER;
const MAX_WICKETS = 2;
const DELIVERY_DURATION_MS = 820;
const SHOT_ANIMATION_DURATION_MS = 1050;

const SPRITE_SHEET = "/cricketer_sprite.png";
const SPRITE_SHEET_WIDTH = 2000;
const SPRITE_SHEET_HEIGHT = 1116;
const SPRITE_COLUMNS = 8;
const SPRITE_ROWS = 5;
const SPRITE_FRAME_WIDTH = SPRITE_SHEET_WIDTH / SPRITE_COLUMNS;
const SPRITE_FRAME_HEIGHT = SPRITE_SHEET_HEIGHT / SPRITE_ROWS;
const SPRITE_SCALE = 0.62;

const BOWLER_SPRITE_SHEET = "/bowler_sprite_blue.png";
const BOWLER_SHEET_WIDTH = 2000;
const BOWLER_SHEET_HEIGHT = 1116;
const BOWLER_COLUMNS = 8;
const BOWLER_ROWS = 2;
const BOWLER_FRAME_WIDTH = BOWLER_SHEET_WIDTH / BOWLER_COLUMNS;
const BOWLER_FRAME_HEIGHT = BOWLER_SHEET_HEIGHT / BOWLER_ROWS;
const BOWLER_SCALE = 0.62;
const BOWLER_BOWL_FPS = 12;
const BOWLER_IDLE_FPS = 8;
const BOWLER_BALL_RELEASE_FRAME = 5;
const BOWLER_BALL_RELEASE_DELAY_MS = Math.round((BOWLER_BALL_RELEASE_FRAME / BOWLER_BOWL_FPS) * 1000);
const BALL_CONTACT_DELAY_MS = BOWLER_BALL_RELEASE_DELAY_MS + DELIVERY_DURATION_MS;

const ACTION_ROW = {
  idle: 0,
  four: 1,
  six: 2,
  dot: 3,
  out: 4
};

const ACTION_FRAME_SEQUENCE = {
  idle: [0, 1, 2, 3, 4, 5, 6, 7],
  four: [0, 1, 2, 3, 4, 5, 6, 7],
  six: [0, 1, 2, 3, 4, 5, 6, 7],
  dot: [0, 1, 2, 3, 4, 5, 6, 7],
  out: [0, 1, 2, 3, 4, 5, 6, 7]
};

const BOWLER_ROW = {
  idle: 0,
  bowl: 1
};

const BOWLER_FRAME_SEQUENCE = {
  idle: [0, 1, 2, 3, 4, 5, 6, 7],
  bowl: [0, 1, 2, 3, 4, 5, 6, 7]
};

const PROBABILITIES = {
  Aggressive: [
    { outcome: "W", probability: 0.24, label: "Wicket", color: "#9b2226" },
    { outcome: 0, probability: 0.14, label: "Dot", color: "#8ca89e" },
    { outcome: 1, probability: 0.14, label: "1", color: "#4f6f60" },
    { outcome: 2, probability: 0.12, label: "2", color: "#1f7a45" },
    { outcome: 3, probability: 0.05, label: "3", color: "#2a9d5b" },
    { outcome: 4, probability: 0.18, label: "4", color: "#0a5c36" },
    { outcome: 6, probability: 0.13, label: "6", color: "#0b8f4a" }
  ],
  Defensive: [
    { outcome: "W", probability: 0.08, label: "Wicket", color: "#9b2226" },
    { outcome: 0, probability: 0.24, label: "Dot", color: "#8ca89e" },
    { outcome: 1, probability: 0.3, label: "1", color: "#4f6f60" },
    { outcome: 2, probability: 0.18, label: "2", color: "#1f7a45" },
    { outcome: 3, probability: 0.07, label: "3", color: "#2a9d5b" },
    { outcome: 4, probability: 0.1, label: "4", color: "#0a5c36" },
    { outcome: 6, probability: 0.03, label: "6", color: "#0b8f4a" }
  ]
};

const COMMENTARY = {
  W: [
    "Timber. The stumps are rattled.",
    "Huge swing and a top edge. Caught out.",
    "The bowler wins the duel with a perfect line."
  ],
  0: [
    "Solid defense. No run.",
    "Tucked into the gap but straight to fielder.",
    "Beaten for pace. Dot ball."
  ],
  1: [
    "Quick single taken with sharp running.",
    "Soft hands and they steal one.",
    "Worked into the leg side for a run."
  ],
  2: [
    "Placed well. They come back for two.",
    "Strong push through covers and two added.",
    "Good running between the wickets. Two runs."
  ],
  3: [
    "Excellent placement. Three all the way.",
    "Threaded the field and hustled for three.",
    "Long chase for the fielders. Three runs."
  ],
  4: [
    "Cracked through the off side. Four.",
    "Pure timing and it races to the rope.",
    "Classic boundary shot for four."
  ],
  6: [
    "What a hit. Massive six into the stands.",
    "Clean strike. Maximum.",
    "Launches it over long on for six."
  ]
};

function oversText(ballsBowled) {
  return `${Math.floor(ballsBowled / BALLS_PER_OVER)}.${ballsBowled % BALLS_PER_OVER}`;
}

function getOutcomeFromSlider(sliderPosition, segments) {
  let cumulative = 0;

  for (const segment of segments) {
    cumulative += segment.probability;
    if (sliderPosition <= cumulative) {
      return segment.outcome;
    }
  }

  return segments[segments.length - 1].outcome;
}

function getRandomCommentary(outcome) {
  const pool = COMMENTARY[String(outcome)] || ["Ball completed."];
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function getActionFromOutcome(outcome) {
  if (outcome === "W") {
    return "out";
  }

  if (Number(outcome) === 6) {
    return "six";
  }

  if (Number(outcome) === 4) {
    return "four";
  }

  return "dot";
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function getBallFlightFromOutcome(outcome, depthLane, sliderValue) {
  const isFrontLane = depthLane === "front";
  const laneMultiplier = isFrontLane ? 1 : 0.9;
  const sliderBias = sliderValue - 0.5;
  const sliderBoost = sliderBias * 12;

  if (outcome === "W") {
    return {};
  }

  const preferRight = Math.random() < 0.42;

  if (Number(outcome) === 6) {
    const skyRocket = Math.random() < 0.45;
    const peakValue = (skyRocket ? randomRange(104, 128) : randomRange(66, 86)) * laneMultiplier;
    const endValue = (skyRocket ? randomRange(72, 96) : randomRange(38, 54)) * laneMultiplier;
    const midX = preferRight ? randomRange(48, 70) + sliderBoost : randomRange(2, 12) + sliderBoost;
    const endX = preferRight ? randomRange(96, 120) : randomRange(-28, -12);

    return {
      "--shot-mid-x": `${midX.toFixed(1)}%`,
      "--shot-end-x": `${endX.toFixed(1)}%`,
      "--shot-peak": `${peakValue.toFixed(1)}%`,
      "--shot-end": `${endValue.toFixed(1)}%`
    };
  }

  if (Number(outcome) === 4) {
    const sharpLift = Math.random() < 0.2;
    const peakValue = (sharpLift ? randomRange(64, 84) : randomRange(46, 62)) * laneMultiplier;
    const endValue = randomRange(28, 40) * laneMultiplier;
    const midX = preferRight ? randomRange(40, 58) + sliderBoost : randomRange(5, 18) + sliderBoost;
    const endX = preferRight ? randomRange(76, 104) : randomRange(-22, -8);

    return {
      "--shot-mid-x": `${midX.toFixed(1)}%`,
      "--shot-end-x": `${endX.toFixed(1)}%`,
      "--shot-peak": `${peakValue.toFixed(1)}%`,
      "--shot-end": `${endValue.toFixed(1)}%`
    };
  }

  const skiedSingle = Math.random() < 0.12;
  const peakValue = (skiedSingle ? randomRange(56, 76) : randomRange(30, 44)) * laneMultiplier;
  const endValue = randomRange(20, 28) * laneMultiplier;
  const midX = preferRight ? randomRange(34, 50) + sliderBoost : randomRange(8, 20) + sliderBoost;
  const endX = preferRight ? randomRange(50, 88) : randomRange(-16, -2);

  return {
    "--shot-mid-x": `${midX.toFixed(1)}%`,
    "--shot-end-x": `${endX.toFixed(1)}%`,
    "--shot-peak": `${peakValue.toFixed(1)}%`,
    "--shot-end": `${endValue.toFixed(1)}%`
  };
}

export default function App() {
  const [battingStyle, setBattingStyle] = useState("Aggressive");
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [ballsBowled, setBallsBowled] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [sliderDirection, setSliderDirection] = useState(1);
  const [phase, setPhase] = useState("ready");
  const [lastOutcome, setLastOutcome] = useState("-");
  const [commentary, setCommentary] = useState("Pick a style, watch the slider, and play your shot.");
  const [playerAction, setPlayerAction] = useState("idle");
  const [frameStep, setFrameStep] = useState(0);
  const [bowlerAction, setBowlerAction] = useState("idle");
  const [bowlerFrameStep, setBowlerFrameStep] = useState(0);
  const [ballInstance, setBallInstance] = useState(0);
  const [ballMode, setBallMode] = useState("idle");
  const [ballDepthLane, setBallDepthLane] = useState("front");
  const [ballFlightStyle, setBallFlightStyle] = useState({});
  const [isBattingStumpBroken, setIsBattingStumpBroken] = useState(false);
  const resolveTimeoutRef = useRef(null);
  const readyTimeoutRef = useRef(null);
  const resetActionTimeoutRef = useRef(null);
  const stumpBreakTimeoutRef = useRef(null);
  const releaseBallTimeoutRef = useRef(null);
  const resetBowlerTimeoutRef = useRef(null);

  const probabilities = useMemo(() => PROBABILITIES[battingStyle], [battingStyle]);

  const gameOver = ballsBowled >= TOTAL_BALLS || wickets >= MAX_WICKETS;

  useEffect(() => {
    if (gameOver) {
      setPhase("gameOver");
    }
  }, [gameOver]);

  useEffect(() => {
    const sequence = ACTION_FRAME_SEQUENCE[playerAction] || ACTION_FRAME_SEQUENCE.idle;
    const frameDelay = playerAction === "idle" ? 145 : 90;

    setFrameStep(0);

    const frameTicker = setInterval(() => {
      setFrameStep((step) => {
        if (playerAction === "out") {
          return Math.min(step + 1, sequence.length - 1);
        }
        return (step + 1) % sequence.length;
      });
    }, frameDelay);

    return () => clearInterval(frameTicker);
  }, [playerAction]);

  useEffect(() => {
    const sequence = BOWLER_FRAME_SEQUENCE[bowlerAction] || BOWLER_FRAME_SEQUENCE.idle;
    const frameDelay = bowlerAction === "bowl" ? Math.round(1000 / BOWLER_BOWL_FPS) : Math.round(1000 / BOWLER_IDLE_FPS);

    setBowlerFrameStep(0);

    const frameTicker = setInterval(() => {
      setBowlerFrameStep((step) => {
        if (bowlerAction === "bowl") {
          return Math.min(step + 1, sequence.length - 1);
        }
        return (step + 1) % sequence.length;
      });
    }, frameDelay);

    return () => clearInterval(frameTicker);
  }, [bowlerAction]);

  useEffect(() => {
    if (phase === "gameOver") {
      return undefined;
    }

    const ticker = setInterval(() => {
      setSliderPosition((prev) => {
        let next = prev + 0.0075 * sliderDirection;

        if (next >= 1) {
          next = 1;
          setSliderDirection(-1);
        } else if (next <= 0) {
          next = 0;
          setSliderDirection(1);
        }

        return next;
      });
    }, 16);

    return () => clearInterval(ticker);
  }, [phase, sliderDirection]);

  useEffect(
    () => () => {
      if (resolveTimeoutRef.current) {
        clearTimeout(resolveTimeoutRef.current);
      }
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
      }
      if (resetActionTimeoutRef.current) {
        clearTimeout(resetActionTimeoutRef.current);
      }
      if (stumpBreakTimeoutRef.current) {
        clearTimeout(stumpBreakTimeoutRef.current);
      }
      if (releaseBallTimeoutRef.current) {
        clearTimeout(releaseBallTimeoutRef.current);
      }
      if (resetBowlerTimeoutRef.current) {
        clearTimeout(resetBowlerTimeoutRef.current);
      }
    },
    []
  );

  const spriteStyle = useMemo(() => {
    const sequence = ACTION_FRAME_SEQUENCE[playerAction] || ACTION_FRAME_SEQUENCE.idle;
    const frameIndex = sequence[Math.min(frameStep, sequence.length - 1)] || 0;
    const row = ACTION_ROW[playerAction] ?? ACTION_ROW.idle;
    const frameX = frameIndex * SPRITE_FRAME_WIDTH * SPRITE_SCALE;
    const frameY = row * SPRITE_FRAME_HEIGHT * SPRITE_SCALE;

    return {
      width: `${SPRITE_FRAME_WIDTH * SPRITE_SCALE}px`,
      height: `${SPRITE_FRAME_HEIGHT * SPRITE_SCALE}px`,
      backgroundImage: `url("${SPRITE_SHEET}")`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${SPRITE_SHEET_WIDTH * SPRITE_SCALE}px ${SPRITE_SHEET_HEIGHT * SPRITE_SCALE}px`,
      backgroundPosition: `-${frameX}px -${frameY}px`
    };
  }, [frameStep, playerAction]);

  const bowlerSpriteStyle = useMemo(() => {
    const sequence = BOWLER_FRAME_SEQUENCE[bowlerAction] || BOWLER_FRAME_SEQUENCE.idle;
    const frameIndex = sequence[Math.min(bowlerFrameStep, sequence.length - 1)] || 0;
    const row = BOWLER_ROW[bowlerAction] ?? BOWLER_ROW.idle;
    const frameX = frameIndex * BOWLER_FRAME_WIDTH * BOWLER_SCALE;
    const frameY = row * BOWLER_FRAME_HEIGHT * BOWLER_SCALE;

    return {
      width: `${BOWLER_FRAME_WIDTH * BOWLER_SCALE}px`,
      height: `${BOWLER_FRAME_HEIGHT * BOWLER_SCALE}px`,
      backgroundImage: `url("${BOWLER_SPRITE_SHEET}")`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${BOWLER_SHEET_WIDTH * BOWLER_SCALE}px ${BOWLER_SHEET_HEIGHT * BOWLER_SCALE}px`,
      backgroundPosition: `-${frameX}px -${frameY}px`
    };
  }, [bowlerAction, bowlerFrameStep]);

  const playShot = () => {
    if (phase !== "ready" || gameOver) {
      return;
    }

    setPhase("bowling");
    setPlayerAction("idle");
    setBowlerAction("bowl");
    setBallMode("idle");
    setBallDepthLane("front");
    setBallFlightStyle({});
    setIsBattingStumpBroken(false);

    releaseBallTimeoutRef.current = setTimeout(() => {
      setBallMode("delivery");
      setBallDepthLane("front");
      setBallFlightStyle({});
      setBallInstance((value) => value + 1);
    }, BOWLER_BALL_RELEASE_DELAY_MS);

    resetBowlerTimeoutRef.current = setTimeout(() => {
      setBowlerAction("idle");
    }, Math.round((BOWLER_FRAME_SEQUENCE.bowl.length / BOWLER_BOWL_FPS) * 1000));

    resolveTimeoutRef.current = setTimeout(() => {
      const outcome = getOutcomeFromSlider(sliderPosition, probabilities);
      const isWicket = outcome === "W";
      const runValue = isWicket ? 0 : Number(outcome);
      const nextBalls = ballsBowled + 1;
      const nextWickets = wickets + (isWicket ? 1 : 0);
      const willGameEnd = nextBalls >= TOTAL_BALLS || nextWickets >= MAX_WICKETS;
      const depthLane = isWicket ? "front" : Math.floor(sliderPosition * 1000) % 2 === 0 ? "front" : "back";

      setRuns((value) => value + runValue);
      setWickets((value) => value + (isWicket ? 1 : 0));
      setBallsBowled((value) => value + 1);
      setLastOutcome(outcome);
      setCommentary(getRandomCommentary(outcome));
      setPlayerAction(getActionFromOutcome(outcome));
      setBallDepthLane(depthLane);
      setBallFlightStyle(getBallFlightFromOutcome(outcome, depthLane, sliderPosition));
      setPhase("result");

      if (isWicket) {
        setBallMode("shot-out");
        stumpBreakTimeoutRef.current = setTimeout(() => {
          setIsBattingStumpBroken(true);
        }, 150);
      } else if (Number(outcome) === 6) {
        setBallMode("shot-six");
      } else if (Number(outcome) === 4) {
        setBallMode("shot-four");
      } else {
        setBallMode("shot-ground");
      }

      if (!willGameEnd) {
        resetActionTimeoutRef.current = setTimeout(() => {
          setPlayerAction("idle");
        }, 700);
      }

      readyTimeoutRef.current = setTimeout(() => {
        setPhase((current) => {
          if (current === "gameOver") {
            return current;
          }
          setBallMode("idle");
          setBallDepthLane("front");
          setBallFlightStyle({});
          setIsBattingStumpBroken(false);
          return "ready";
        });
      }, SHOT_ANIMATION_DURATION_MS);
    }, BALL_CONTACT_DELAY_MS);
  };

  const restartGame = () => {
    if (resolveTimeoutRef.current) {
      clearTimeout(resolveTimeoutRef.current);
    }
    if (readyTimeoutRef.current) {
      clearTimeout(readyTimeoutRef.current);
    }
    if (resetActionTimeoutRef.current) {
      clearTimeout(resetActionTimeoutRef.current);
    }
    if (stumpBreakTimeoutRef.current) {
      clearTimeout(stumpBreakTimeoutRef.current);
    }
    if (releaseBallTimeoutRef.current) {
      clearTimeout(releaseBallTimeoutRef.current);
    }
    if (resetBowlerTimeoutRef.current) {
      clearTimeout(resetBowlerTimeoutRef.current);
    }

    setBattingStyle("Aggressive");
    setRuns(0);
    setWickets(0);
    setBallsBowled(0);
    setSliderPosition(0);
    setSliderDirection(1);
    setPhase("ready");
    setLastOutcome("-");
    setCommentary("Pick a style, watch the slider, and play your shot.");
    setPlayerAction("idle");
    setFrameStep(0);
    setBowlerAction("idle");
    setBowlerFrameStep(0);
    setBallMode("idle");
    setBallDepthLane("front");
    setBallFlightStyle({});
    setIsBattingStumpBroken(false);
    setBallInstance((value) => value + 1);
  };

  const ballsRemaining = TOTAL_BALLS - ballsBowled;

  return (
    <div className="page-shell">
      <header className="game-header">
        <div>
          <h1>2D Cricket Power Bar Challenge</h1>
          <p>CS-4032 Assignment #02</p>
        </div>
        <button className="restart-btn" onClick={restartGame}>
          Restart Game
        </button>
      </header>

      <main className="game-layout">
        <section className="score-card">
          <h2>Scoreboard</h2>
          <div className="score-grid">
            <article>
              <span>Runs</span>
              <strong>{runs}</strong>
            </article>
            <article>
              <span>Wickets</span>
              <strong>
                {wickets}/{MAX_WICKETS}
              </strong>
            </article>
            <article>
              <span>Overs</span>
              <strong>
                {oversText(ballsBowled)} / {TOTAL_OVERS}.0
              </strong>
            </article>
            <article>
              <span>Balls Left</span>
              <strong>{Math.max(0, ballsRemaining)}</strong>
            </article>
          </div>

          <div className="style-selector">
            <p>Batting Style</p>
            <div className="style-buttons" role="group" aria-label="Batting style">
              {Object.keys(PROBABILITIES).map((style) => (
                <button
                  key={style}
                  className={battingStyle === style ? "active" : ""}
                  onClick={() => setBattingStyle(style)}
                  disabled={phase === "bowling" || gameOver}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="outcome-strip">
            <span>Last Ball</span>
            <strong>{lastOutcome === "W" ? "WICKET" : lastOutcome}</strong>
          </div>
        </section>

        <section className="ground-panel">
          <div className="ground">
            <div className="horizon"></div>
            <div className="pitch-strip"></div>

            <div className={`wicket wicket-batsman ${isBattingStumpBroken ? "broken" : ""}`}>
              <span className="stump stump-1"></span>
              <span className="stump stump-2"></span>
              <span className="stump stump-3"></span>
              <span className="bail bail-1"></span>
              <span className="bail bail-2"></span>
            </div>

            <div className="batsman-sprite" style={spriteStyle} aria-label={`Batsman ${playerAction} animation`}></div>

            <div className="bowler-sprite" style={bowlerSpriteStyle} aria-label={`Bowler ${bowlerAction} animation`}></div>

            <div className="wicket wicket-bowler">
              <span className="stump stump-1"></span>
              <span className="stump stump-2"></span>
              <span className="stump stump-3"></span>
              <span className="bail bail-1"></span>
              <span className="bail bail-2"></span>
            </div>

            <div key={ballInstance} className={`ball ${ballMode} depth-${ballDepthLane}`} style={ballFlightStyle}></div>
          </div>

          <p className="commentary" aria-live="polite">
            {commentary}
          </p>
        </section>
      </main>

      <section className="powerbar-section">
        <div className="powerbar-head">
          <h3>Probability Power Bar ({battingStyle})</h3>
          <button className="shot-btn" onClick={playShot} disabled={phase !== "ready" || gameOver}>
            {phase === "bowling" ? "Ball in play..." : "Play Shot"}
          </button>
        </div>

        <div className="powerbar-wrapper">
          <div className="powerbar">
            {probabilities.map((segment) => (
              <div
                key={`${battingStyle}-${segment.outcome}`}
                className="segment"
                style={{ width: `${segment.probability * 100}%`, background: segment.color }}
                title={`${segment.label}: ${segment.probability.toFixed(2)}`}
              >
                <span>{segment.outcome === "W" ? "W" : segment.outcome}</span>
              </div>
            ))}
          </div>
          <div className="slider" style={{ left: `${sliderPosition * 100}%` }}></div>
        </div>

        <div className="legend">
          {probabilities.map((segment) => (
            <span key={`legend-${battingStyle}-${segment.outcome}`}>
              {segment.label}: {segment.probability.toFixed(2)}
            </span>
          ))}
        </div>
      </section>

      {gameOver && (
        <section className="game-over">
          <h2>Innings Complete</h2>
          <p>
            Final Score: {runs}/{wickets}
          </p>
          <p>
            Overs Played: {oversText(ballsBowled)}
          </p>
        </section>
      )}
    </div>
  );
}
