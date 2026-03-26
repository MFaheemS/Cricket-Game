<div align="center">

# Super Cricket

**A browser-based 2D cricket game with probability-based outcomes, sprite animation, and dynamic commentary.**

![Game Banner](screenshots/aggressive-batting.png)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-1B4332?style=for-the-badge)](https://your-demo-link.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Animations-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

</div>

---

## What Is This?

Super Cricket is a playable 2D cricket game that runs in the browser. You choose a batting style and time shots using a moving power bar. Ball outcomes come from a probability map tied to slider position.

It highlights game logic design, sprite synchronization, deterministic outcome mapping, and clean UI in vanilla JavaScript.

---

## Features

- **Skill-based timing** via a segmented probability bar
- **Two batting styles**: Aggressive and Defensive
- **Layered sprite animation** for bowler, ball, and batsman
- **Live scoreboard** with runs, wickets, overs, and last-ball result
- **Dynamic commentary** based on outcomes
- **Innings complete screen** with replay option

---

## Screenshots

### Aggressive Batting — Power Bar in Action
> Higher boundary probability, higher wicket risk. The bar is wider in the red and green zones.

![Aggressive Batting](screenshots/aggressive-batting.png)

---

### Defensive Batting — Safe Scoring Profile
> Wicket probability drops to 8%. The bar is dominated by the 1-run segment — perfect for rotating strike.

![Defensive Batting](screenshots/defensive-batting.png)

---

### Mid-Delivery — Ball in Flight
> The ball travels frame-by-frame from the bowler hand to the bat. Outcome resolves only at contact.

![Ball Delivery](screenshots/ball-delivery.png)

---

### Innings Complete Screen
> Final score modal with total runs, wickets, and overs played.

![Game Over](screenshots/game-over.png)

---

## How the Probability Engine Works

The power bar is divided into **7 segments**, each sized proportionally to its outcome weight:

| Outcome | Aggressive | Defensive |
|---------|-----------|-----------|
| Wicket  | 0.24      | 0.08      |
| Dot (0) | 0.14      | 0.24      |
| 1 run   | 0.14      | 0.30      |
| 2 runs  | 0.12      | 0.18      |
| 3 runs  | 0.05      | 0.07      |
| 4 runs  | 0.18      | 0.10      |
| 6 runs  | 0.13      | 0.03      |

When the player clicks **Play Shot**, the slider position `s ∈ [0, 1]` is frozen. The engine scans cumulative ranges and returns the first outcome where `s ≤ cumulative`. Outcomes are deterministic at click time.

```js
function resolveOutcome(sliderValue, probabilities) {
  let cumulative = 0;
  for (const [outcome, prob] of Object.entries(probabilities)) {
    cumulative += prob;
    if (sliderValue <= cumulative) return outcome;
  }
}
```

---

## Animation Architecture

Three independent layers are synchronised per delivery:

```
[Bowler sprite]  →  release frame offset  →  [Ball in flight]
                                                      ↓
                                          contact point reached
                                                      ↓
                                          [Outcome resolves]
                                                      ↓
                                          [Batsman sprite row switches]
                                          [Commentary + scoreboard update]
```

- **Bowler** switches from idle to bowl on delivery start
- **Ball** releases at a frame offset, travels to bat, then follows outcome-based arc animation
- **Batsman** switches sprite row by outcome (`out`, `six`, `four`, `defensive`)
- **Stumps** switch to broken state on wicket at contact timing

---

## Getting Started

```bash
git clone https://github.com/your-username/super-cricket.git
cd super-cricket
# Open index.html in any modern browser — no build step required
open index.html
```

No Node.js, npm, or bundler required.

---

## Project Structure

```
super-cricket/
├── index.html              # Entry point
├── style.css               # Game UI styling
├── game.js                 # Core game loop & outcome engine
├── animations.js           # Sprite + ball animation controller
├── commentary.js           # Commentary text mapping
├── assets/
│   ├── sprites/            # Bowler, batsman, stumps sprite sheets
│   ├── backgrounds/        # Stadium background layers
│   └── sounds/             # (optional) crowd and bat sounds
└── screenshots/            # README preview images
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Rendering | HTML5 Canvas / DOM sprites |
| Game Logic | Vanilla JavaScript (ES6+) |
| Animations | CSS keyframes + JS frame stepping |
| Styling | CSS3 with custom properties |
| Build | None — zero dependencies |

---

## Key Engineering Decisions

**Why deterministic probability instead of `Math.random()`?**
Deterministic mapping preserves player agency and rewards timing.

**Why vanilla JS instead of a game engine?**
It keeps the project lightweight, runnable anywhere, and easy to inspect.

**Why synchronise animations to outcome resolution?**
Resolving outcomes at contact timing keeps visuals and scoring in sync.

---

## License

MIT — free to use, fork, and build on.

---

<div align="center">

Made with care and a love for cricket

</div>
