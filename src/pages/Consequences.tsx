import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { PUNISHMENTS } from "@/types/expense";
import Penny from "@/components/Penny";
import { Button } from "@/components/ui/button";

const Consequences = () => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const spinCount = useRef(0);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const randomIndex = Math.floor(Math.random() * PUNISHMENTS.length);
    const segmentAngle = 360 / PUNISHMENTS.length;
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const targetRotation = extraSpins * 360 + randomIndex * segmentAngle;

    spinCount.current += 1;
    setRotation((prev) => prev + targetRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(`${PUNISHMENTS[randomIndex].emoji} ${PUNISHMENTS[randomIndex].text}`);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-24 pt-8">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-foreground">Consequences</h1>
        <p className="text-sm text-muted-foreground">Spin the wheel of shame! 🎡</p>
      </div>

      {/* Wheel */}
      <div className="relative flex items-center justify-center">
        {/* Pointer */}
        <div className="absolute -top-2 z-10 text-2xl">▼</div>

        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3, ease: [0.17, 0.67, 0.12, 0.99] }}
          className="flex h-64 w-64 items-center justify-center rounded-full border-4 border-primary/20 bg-card shadow-xl"
        >
          {PUNISHMENTS.map((p, i) => {
            const angle = (i * 360) / PUNISHMENTS.length;
            return (
              <div
                key={p.id}
                className="absolute text-2xl"
                style={{
                  transform: `rotate(${angle}deg) translateY(-80px)`,
                }}
              >
                {p.emoji}
              </div>
            );
          })}
          <span className="text-4xl">🎰</span>
        </motion.div>
      </div>

      {/* Spin button */}
      <Button
        onClick={handleSpin}
        disabled={spinning}
        className="h-14 w-full max-w-xs rounded-2xl bg-primary text-lg font-bold text-primary-foreground hover:bg-primary/90"
      >
        {spinning ? "Spinning... 🌀" : "Spin the Wheel! 🎡"}
      </Button>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-3xl bg-card p-6 shadow-lg"
        >
          <p className="text-center text-lg font-bold text-foreground">{result}</p>
          <Penny state="happy" message="Justice is served! 😈" />
        </motion.div>
      )}

      {!result && !spinning && (
        <Penny state="happy" message="Who's the loser this week? 👀" />
      )}
    </div>
  );
};

export default Consequences;
