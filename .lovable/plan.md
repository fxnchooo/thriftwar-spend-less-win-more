

# ThriftWar — Gamified Expense Tracker 🐷💰

## Branding & Design System
- **Color palette:** Mint Green (#4ADE80) for savings/positive, Coral Red (#F87171) for spending/danger, Off-white (#FAFAF9) background
- **Typography:** Inter font, clean and rounded feel
- **Style:** "Soft Pop" — large rounded corners, generous whitespace, playful but not childish
- **Mobile-first layout** styled to feel like a native app (max-width container, bottom nav bar)

## Mascot: Penny the Pig 🐷
- Large animated pig emoji/illustration as a central UI element
- **Happy state:** Bouncing animation when under budget or on app open
- **Sad state:** Shaking/crying animation when a high expense is logged
- **Prompting state:** Speech bubble asking "Do you really need this?" when guilt is high
- Powered by Framer Motion for smooth, springy animations

## Page 1: Dashboard (Home)
- **Daily Spend counter** — large, prominent number showing today's total
- **Streak counter** — "🔥 X days under budget" badge
- **Penny the Pig** — animated mascot reacting to spending status
- **Floating Action Button (FAB)** — large mint-green "+" button to add expenses
- Recent expenses list below

## Page 2: Add Expense Modal
- Opens from the FAB with a slide-up animation
- **Amount input** — large, focused number input
- **Category selector** — icon-based pills: 🍔 Food, 🚗 Transport, 🎭 "Useless Stuff"
- **Guilt Level slider** — playful slider from "No guilt" to "Maximum guilt"
- When guilt is high, Penny appears with a concerned face and speech bubble
- Submit adds to daily total and updates mascot state

## Page 3: Leaderboard (Competition)
- Friends ranked by **lowest spend** (winner on top)
- Mock users: Alfonso (Me) $12, Sarah $45, Mike $120
- Top spender (rank #1 lowest) gets a 👑 crown
- Bottom spender (highest) gets a 🤡 "Shame Badge"
- Each row shows avatar, name, amount, and rank indicator
- Subtle animations on rank changes

## Page 4: Consequences (Loser's Punishment Wheel)
- A fun spinning wheel with punishment options
- Punishments: "Buy coffee for the winner," "Post an embarrassing photo," "Cook dinner for the group"
- Tap to spin with Framer Motion rotation animation
- Result revealed with a dramatic animation and Penny reacting

## Navigation
- **Bottom tab bar** (mobile app style): Home, Leaderboard, Consequences
- Framer Motion page transitions between tabs
- Active tab highlighted in mint green

## Technical Approach
- Install Framer Motion for all animations
- All data uses mock data stored in local state, structured as types/interfaces ready for future Supabase integration
- Components organized cleanly for easy backend migration later

