# 2D Cricket Web Application - Report (PDF Submission Template)

Course: CS-4032  
Assignment: #02  
Student Name: ____________________  
Registration No: ____________________  
Submission Date: ____________________

---

## 1. Required Screenshots (With Sticky Note)

Instruction: Replace each placeholder image path with your own screenshot file.  
Each screenshot must visibly include a sticky note annotation (digital or physical) with a short label.

### Screenshot 1: Main Game UI (Initial State)
Sticky Note text example: "Initial UI - Before first ball"

![Screenshot 1 - Main UI](screenshots/s1-main-ui.png)

### Screenshot 2: Power Bar + Slider Timing Moment
Sticky Note text example: "Slider position determines outcome"

![Screenshot 2 - Power Bar Timing](screenshots/s2-powerbar-timing.png)

### Screenshot 3: Bowler Delivery + Ball In Flight
Sticky Note text example: "Bowler release and delivery animation"

![Screenshot 3 - Delivery Animation](screenshots/s3-delivery.png)

### Screenshot 4: Batting Outcome Animation (Four or Six)
Sticky Note text example: "Batsman shot animation + ball arc"

![Screenshot 4 - Shot Animation](screenshots/s4-shot-arc.png)

### Screenshot 5: Wicket / Out Animation
Sticky Note text example: "Out sequence and stump break"

![Screenshot 5 - Wicket Animation](screenshots/s5-wicket-out.png)

### Screenshot 6: Final Score / Innings Complete Screen
Sticky Note text example: "Final result screen"

![Screenshot 6 - Game Over](screenshots/s6-game-over.png)

---

## 2. Probability Mapping Explanation

The game uses a segmented probability bar where each segment represents one possible ball outcome:

- Wicket (W)
- 0 runs
- 1 run
- 2 runs
- 3 runs
- 4 runs
- 6 runs

Two batting styles are provided:

- Aggressive: higher wicket chance, higher boundary chance
- Defensive: lower wicket chance, safer scoring profile

### How mapping works

1. A slider moves continuously in the range [0, 1].
2. When the player clicks Play Shot, the current slider value is captured.
3. The selected batting style provides an ordered probability list that sums to 1.00.
4. The algorithm scans cumulative ranges from left to right:
   - cumulative += probability of each segment
   - first segment where sliderValue <= cumulative is selected
5. That selected segment becomes the final outcome for the ball.

This is a deterministic mapping at click time: the slider position directly maps to one probability interval.

### Example (Aggressive style)

If cumulative ranges are:

- W: 0.00 to 0.24
- 0: 0.24 to 0.38
- 1: 0.38 to 0.52
- 2: 0.52 to 0.64
- 3: 0.64 to 0.69
- 4: 0.69 to 0.87
- 6: 0.87 to 1.00

Then a slider value of 0.73 maps to outcome 4, while 0.91 maps to 6.

---

## 3. Animation System Explanation

The game synchronizes three animation layers:

- Bowler sprite animation
- Ball movement animation
- Batsman sprite animation

### 3.1 Bowler animation and ball release

- Bowler switches from idle to bowl action.
- Ball is released at a configured release frame delay.
- Delivery animation moves ball from bowler side to batsman contact point.

### 3.2 Outcome resolution timing

- Outcome is resolved only after:
  - release delay + delivery travel duration
- This ensures the result appears at visual contact timing near the batsman.

### 3.3 Batsman action animation

- Outcome maps to batsman action row:
  - W -> out
  - 6 -> six
  - 4 -> four
  - others -> dot/defensive action
- Sprite frames are advanced with per-action frame delay.
- Out animation is allowed to complete (including final-frame hold) before reset.

### 3.4 Ball post-hit trajectories

- Ball motion after contact uses arc keyframes (multi-point path), not abrupt turns.
- Four/six/ground outcomes share a smooth arc pattern with different peak/end values.
- Wicket/out ball deflection uses a short curved movement to maintain visual continuity.

### 3.5 Additional visual events

- On wicket outcome, batting stumps transition to broken state shortly after contact.
- Commentary text and scoreboard update in sync with resolved outcome.

---

## 4. Short Conclusion

This implementation combines probability-based game logic with synchronized sprite and ball animations.  
The power bar guarantees clear outcome mapping from slider timing, while animation sequencing provides readable cricket events (delivery, contact, shot arc, and wicket effects).

---

## 5. Export To PDF

1. Open this file preview in VS Code.
2. Ensure all screenshot paths are valid and images are visible.
3. Print/Export as PDF.
4. Name file: `CS4032_Assignment02_Report_<YourRegNo>.pdf`.
