import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, animate, useMotionValue } from "framer-motion";

function fmtInt(n) {
  try {
    return Number(n || 0).toLocaleString();
  } catch {
    return String(n || 0);
  }
}

export default function StreakCard({ stats }) {
  const streak = Number(stats?.streakCount ?? 0);
  const last = stats?.lastActiveDate || "—";

  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  const prevStreakRef = useRef(streak);
  const streakIncreased = useMemo(() => streak > (prevStreakRef.current ?? 0), [streak]);

  useEffect(() => {
    const controls = animate(mv, streak, { duration: 0.5, ease: "easeOut" });
    const unsub = mv.on("change", (v) => setDisplay(Math.round(v)));

    return () => {
      controls.stop();
      unsub();
    };
  }, [streak, mv]);

  useEffect(() => {
    prevStreakRef.current = streak;
  }, [streak]);

  const flamePulse = streakIncreased
    ? { scale: [1, 1.22, 1], rotate: [0, -6, 0] }
    : { scale: [1, 1.08, 1] };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <p className="text-xs uppercase tracking-wide text-gray-500">Streak</p>

      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <motion.span
              key={streak}
              animate={flamePulse}
              transition={{
                duration: streakIncreased ? 0.45 : 1.6,
                ease: "easeInOut",
                repeat: streakIncreased ? 0 : Infinity,
                repeatDelay: streakIncreased ? 0 : 1.2,
              }}
              className="text-2xl"
              aria-hidden
            >
              🔥
            </motion.span>

            <motion.h3
              key={`streak-${streak}`}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-2xl font-bold"
            >
              {fmtInt(display)}
            </motion.h3>
          </div>

          <p className="mt-1 text-sm text-gray-600">Last active: {last}</p>

          {streak > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {streak >= 7 ? "💪 Week streak!" : streak >= 3 ? "🚀 Keep it going!" : "Start building your streak"}
            </p>
          )}
        </div>

        <motion.span
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-xs font-semibold rounded-full px-3 py-1 border bg-gray-50"
        >
          Daily
        </motion.span>
      </div>
    </motion.div>
  );
}