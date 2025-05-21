# Speedwich: A Sandwich-Making Web Game

**Speedwich** is an interactive browser-based game where players build custom sandwiches by clicking ingredients, completing orders, and racing against the clock to earn coins.

---

## Gameplay Overview

- Players receive **random sandwich orders** displayed at the top.
- Ingredients (like bread, tomato, ham, mayo, etc.) are laid out visually on a kitchen counter.
- Clicking an ingredient adds it to the sandwich stack.
- Hovering over the sandwich lifts it to preview the full stack.
- Players must match the order as closely as possible before submitting.
- Submitting correct orders awards **coins** and feedback.
- The game runs on a **2-minute timer**.
- When time's up, a popup displays total coins and completed orders.

---

## Demo

<img src="demo/demo_video.gif" alt="Speedwich gameplay demo" width="800"/>


---

## Features

- Animated ingredient stacking
- Real-time scoring and feedback
- Score saving and leaderboard tracking
- Viewable top player rankings after each game
- Undo functionality
- Pause/resume system with timer handling
- Randomized order generation with visual order sheets

---

## Technologies Used

- **HTML5** + **CSS3** for structure and responsive layout
- **Vanilla JavaScript** for interactivity
- Lightweight and framework-free

---

## Known Issues

**Image selection and drag behavior:**  
  Ingredient images may become selectable or draggable during gameplay.  
  Tried:
  - `user-select: none`
  - `-webkit-user-drag: none`
  - `draggable="false"` on all `<img>` tags  
  But some browsers still allow image selection overlays or ghost drags.
