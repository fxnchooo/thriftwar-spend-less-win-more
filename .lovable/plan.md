## UX Enhancements for Long-Term Retention

After auditing the full flow (lobby → dashboard → solo → leaderboard → wheel → settings), here are the highest-leverage UX changes — ordered by retention impact. Nothing here changes the core mechanics; it amplifies the loops that already exist so people come back daily and weekly.

---

### 1. Daily streak loop (the #1 retention driver)
Right now nothing pulls a user back tomorrow. Add a lightweight **streak** built around the existing "log an expense (or a $0 no-spend day)" action.

- Persistent `currentStreak` + `longestStreak` per user (localStorage first, optional sync later).
- A **"No-spend day"** button on Home and Solo — taps as a $0 entry, counts for the streak, fuels celebration.
- Streak chip in the Home greeting row (`🔥 7-day streak`) replacing the static name badge.
- Milestone confetti + Mascot reaction at 3 / 7 / 14 / 30 days.

### 2. End-of-week ritual moment
The weekly showdown is the strongest hook but it's silent. Make Sunday/Monday a **ritual**:

- A dismissible **"Week wrapped"** card on Home that appears Sun evening → Mon morning showing: your rank, delta vs last week, winner, and a single CTA "Spin the wheel".
- Auto-route to Wheel tab on first open of the new week if a spin is pending.
- Snapshot last week's leaderboard into a tiny **history strip** ("Last 4 weeks: 🥇🥈🥇🥉") on the Leaderboard page — visible progress = stickiness.

### 3. Frictionless logging (reduce the cost of the core action)
Logging is the daily atomic action; every saved second compounds.

- **Quick-add chips** on Dashboard and Solo: tap "☕ $5" or "🍔 $12" to log a recent-favorite in one tap (derived from user's top 3 categories + median amount).
- Default the AddExpenseModal amount field to focused + numeric keypad (already partially there) and remember last-used category per user.
- Optional **swipe-to-delete** on expense rows on Solo (cleaner than the dual edit/trash buttons).

### 4. Mid-week pulse + nudges (the "come back Wednesday" problem)
- Mascot copy on Home becomes **context-aware by weekday**: Mon "Fresh week, fresh wallet"; Wed "Halfway check — you're #2"; Fri "One push to lock #1"; Sun "Spin night 🎡".
- An optional **opt-in browser notification** ("Remind me to log daily at 9pm") gated behind a single toggle in Profile — no permission prompts on launch.

### 5. Social pressure amplifiers (group cohesion)
- **Live position deltas** on Leaderboard: `▲2 since yesterday` next to each player. Movement is the dopamine, not the absolute number.
- **Reactions** on expense entries in "Today's Group Expenses": tap to drop 🤡 / 😱 / 👏 (lightweight, no comments). Snitch Mode already exists in spirit — this formalizes it.
- **Group activity feed** mini-section on Home: "Sara logged $40 brunch · 2h ago · 3 🤡 reactions".

### 6. Onboarding & empty-state polish
- The lobby is already good; add a **30-second interactive tour** (3 hotspots: log expense → see rank → spin wheel) the first time `groups.length > 0`.
- Empty Today's Expenses gets a **"Log your first $0 day"** primary action — converts the empty state into a streak start.
- Solo Tracker empty state already has a CTA — extend it with one **sample entry preview** so the layout doesn't feel barren.

### 7. Small UX papercuts
- `BottomNav` "Profile" tab actually routes to `GroupSettings` — rename to "Group" or split profile vs group settings.
- `usePersonalExpenses` budget stored in localStorage means budget vanishes across devices; cheap win to move to `profiles` table.
- Wheel: the result card should include a **"Mark as paid 🍻"** button that posts a tiny celebration to the group feed → closes the loop.
- Currency symbol formatting is inconsistent (some `.toFixed(0)`, some `.toFixed(2)`); standardize: integers in summaries, 2-decimal in line items.

---

### Recommended phasing

| Phase | Scope | Why first |
|---|---|---|
| **A — Retention core** | Streaks + No-spend day + Week-wrapped card | Direct daily/weekly hooks; small surface area |
| **B — Logging speed** | Quick-add chips + remembered defaults + swipe-delete | Halves friction on the most-repeated action |
| **C — Social** | Reactions, deltas, group activity feed | Compounds once core loops are sticky |
| **D — Polish** | Onboarding tour, profile/group split, currency formatting | Quality bar lift, lower urgency |

---

### Out of scope (intentionally)
- No changes to wheel mechanics, punishment list, or competition rules — those just landed.
- No backend schema changes beyond optionally persisting streaks + daily budget to `profiles` in Phase A.
- No new auth, payments, or AI integrations.

If approved, I'd start with **Phase A** as a single focused implementation, then check in before B.