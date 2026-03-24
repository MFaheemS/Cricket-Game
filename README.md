# 2D Cricket Web Application

A single-player React cricket batting game for CS-4032 Assignment #02.

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
