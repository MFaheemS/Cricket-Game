# 2D Cricket Web Application

A single-player React cricket batting game for CS-4032 Assignment #02.

## React Requirement Compliance

This assignment is implemented using React (Vite + React runtime):

- Entry point mounts a React root in [src/main.jsx](src/main.jsx).
- Main game logic and UI are implemented as a React component in [src/App.jsx](src/App.jsx).
- State and rendering are managed with React hooks (`useState`, `useEffect`, `useMemo`, `useRef`).

## Rubric Coverage Checklist

### Game Logic and Probability (30)

- Aggressive batting distribution is defined and sums to 1.00.
- Defensive batting distribution is defined and sums to 1.00.
- Power-bar segments are proportional to probabilities.
- Slider timing maps directly to an outcome via cumulative probability mapping.

### UI / 2D Design and Animation (30)

- Side-view cricket field with visible batsman, bowler, wickets, and ball.
- Scoreboard shows runs, wickets, overs, and balls left with live updates.
- Batsman sprite animations are triggered by outcomes (idle/four/six/dot/out).
- Bowler sprite has idle and delivery sequences with timed ball release.
- Power bar has segmented outcomes, live moving slider, and visual distinction.

### JavaScript / React (20)

- Game flow uses modular helper functions for probability and animation logic.
- State handling tracks runs, wickets, balls, game phase, sprites, and ball states.

### Code Quality (10)

- Meaningful names for states/constants/helpers.
- Inline comments and structured constants for timing/probability behavior.
- GitHub commit quality requirement should be completed in repository history by student.

### Documentation (10)

- Include required screenshots in final report/PDF.
- Explain probability mapping (cumulative segment selection from slider position).
- Explain animation synchronization (bowler release frame, delivery, shot result).

### Bonus (Up to 10)

- Commentary system includes multiple contextual lines per outcome.
- UI polish includes themed controls, cards, and power-bar styling.

## Features

- 2 overs (12 balls) innings with 2 wickets.
- Side-view cricket scene (bowler to batsman) instead of top-down view.
- Uses uploaded sprite sheet (`cricketer_sprite.png`) for batsman action animations.
- Batting styles:
  - Aggressive: higher wicket probability and higher boundary probability.
  - Defensive: lower wicket probability and lower boundary probability.
- Probability-based power bar:
  - Outcomes: Wicket, 0, 1, 2, 3, 4, 6.
  - Segment widths are proportional to probabilities.
  - Slider position on click strictly determines outcome.
- Bowling animation (ball travels to batsman before each shot).
- Sprite-based batting animation on shot timing (Idle, Four, Six, Dot, Out states).
- Dynamic scoreboard and game over screen.
- Restart support for full state reset.
- Bonus commentary system with multiple lines per outcome.

## Probability Tables

### Aggressive

- Wicket: 0.24
- 0 runs: 0.14
- 1 run: 0.14
- 2 runs: 0.12
- 3 runs: 0.05
- 4 runs: 0.18
- 6 runs: 0.13
- Total: 1.00

### Defensive

- Wicket: 0.08
- 0 runs: 0.24
- 1 run: 0.30
- 2 runs: 0.18
- 3 runs: 0.07
- 4 runs: 0.10
- 6 runs: 0.03
- Total: 1.00

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
