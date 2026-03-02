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

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: "1", name: "Alfonso", avatar: "A", totalSpent: 12, isMe: true },
  { id: "2", name: "Sarah", avatar: "S", totalSpent: 45, isMe: false },
  { id: "3", name: "Mike", avatar: "M", totalSpent: 120, isMe: false },
];

export const PUNISHMENTS: Punishment[] = [
  { id: "1", text: "Buy coffee for the winner", emoji: "☕" },
  { id: "2", text: "Post an embarrassing photo", emoji: "📸" },
  { id: "3", text: "Cook dinner for the group", emoji: "🍳" },
  { id: "4", text: "Do 50 push-ups on video", emoji: "💪" },
  { id: "5", text: "Wear a silly hat all day", emoji: "🎩" },
  { id: "6", text: "Sing karaoke in public", emoji: "🎤" },
];
