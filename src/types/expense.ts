export type ExpenseCategory = "food" | "transport" | "shopping" | "entertainment" | "health" | "useless";

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  guiltLevel: number; // 0-100
  note?: string;
  createdAt: Date;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  totalSpent: number;
  isMe: boolean;
}

export interface Punishment {
  id: string;
  text: string;
  emoji: string;
}

export const CATEGORIES: { value: ExpenseCategory; label: string; emoji: string }[] = [
  { value: "food", label: "Food", emoji: "🍔" },
  { value: "transport", label: "Transport", emoji: "🚗" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "entertainment", label: "Fun", emoji: "🎬" },
  { value: "health", label: "Health", emoji: "💊" },
  { value: "useless", label: "Useless", emoji: "🎭" },
];

// Broader, more "real-life" categories for the personal/solo tracker
export const PERSONAL_CATEGORIES: { value: string; label: string; emoji: string }[] = [
  { value: "food", label: "Food", emoji: "🍔" },
  { value: "transport", label: "Transport", emoji: "🚗" },
  { value: "rent", label: "Rent", emoji: "🏠" },
  { value: "subscriptions", label: "Subscriptions", emoji: "🔁" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "entertainment", label: "Fun", emoji: "🎬" },
  { value: "health", label: "Health", emoji: "💊" },
  { value: "travel", label: "Travel", emoji: "✈️" },
  { value: "other", label: "Other", emoji: "💼" },
];

export const PAYMENT_METHODS: { value: "card" | "cash" | "transfer" | "other"; label: string; emoji: string }[] = [
  { value: "card", label: "Card", emoji: "💳" },
  { value: "cash", label: "Cash", emoji: "💵" },
  { value: "transfer", label: "Transfer", emoji: "🏦" },
  { value: "other", label: "Other", emoji: "📝" },
];

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: "1", name: "Alfonso", avatar: "A", totalSpent: 12, isMe: true },
  { id: "2", name: "Sarah", avatar: "S", totalSpent: 45, isMe: false },
  { id: "3", name: "Mike", avatar: "M", totalSpent: 120, isMe: false },
];

export const PUNISHMENTS: Punishment[] = [
  { id: "1", text: "Buy coffee for the winner all week", emoji: "☕" },
  { id: "2", text: "Post an embarrassing selfie to the group chat", emoji: "📸" },
  { id: "3", text: "Cook dinner for the winner", emoji: "🍳" },
  { id: "4", text: "Do 50 push-ups on video", emoji: "💪" },
  { id: "5", text: "Wear a silly hat for a full day", emoji: "🎩" },
  { id: "6", text: "Sing karaoke in public", emoji: "🎤" },
  { id: "7", text: "Change your profile pic to whatever the winner picks", emoji: "🖼️" },
  { id: "8", text: "Send a voice note rapping your apology", emoji: "🎙️" },
  { id: "9", text: "No takeout for the next 7 days", emoji: "🥡" },
  { id: "10", text: "Pay the next group tab", emoji: "💸" },
  { id: "11", text: "Write a haiku about your overspending", emoji: "✍️" },
  { id: "12", text: "Cold shower, 60 seconds, on video", emoji: "🥶" },
  { id: "13", text: "Walk instead of Uber for a whole day", emoji: "🚶" },
  { id: "14", text: "Eat the group's choice of weird food", emoji: "🌶️" },
  { id: "15", text: "Wear sunglasses indoors for 24h", emoji: "🕶️" },
  { id: "16", text: "Tell a stranger your weekly total", emoji: "🫣" },
];
