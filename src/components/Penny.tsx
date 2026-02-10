import { motion } from "framer-motion";

type PennyState = "happy" | "sad" | "prompting";

interface PennyProps {
  state: PennyState;
  message?: string;
}

const happyAnimation = {
  y: [0, -12, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    repeatDelay: 1.5,
    ease: "easeInOut" as const,
  },
};

const sadAnimation = {
  x: [-4, 4, -4, 4, 0],
  rotate: [-2, 2, -2, 2, 0],
  transition: {
    duration: 0.4,
    repeat: Infinity,
    repeatDelay: 2,
  },
};

const promptingAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 1.2,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

const getAnimation = (state: PennyState) => {
  switch (state) {
    case "happy": return happyAnimation;
    case "sad": return sadAnimation;
    case "prompting": return promptingAnimation;
  }
};

const getFace = (state: PennyState) => {
  switch (state) {
    case "happy": return "🐷";
    case "sad": return "😢🐷";
    case "prompting": return "🤔🐷";
  }
};

const Penny = ({ state, message }: PennyProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative rounded-2xl bg-card px-4 py-2 text-sm font-medium text-card-foreground shadow-md"
        >
          {message}
          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-card" />
        </motion.div>
      )}
      <motion.div
        animate={getAnimation(state)}
        className="text-7xl select-none"
      >
        {getFace(state)}
      </motion.div>
    </div>
  );
};

export default Penny;
