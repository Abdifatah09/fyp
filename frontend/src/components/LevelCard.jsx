import React, { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

function rankIcon(rank) {
  const r = String(rank || "").toLowerCase();
  if (r === "master") return "👑";
  if (r === "diamond") return "🔥";
  if (r === "platinum") return "💎";
  if (r === "gold") return "🥇";
  if (r === "silver") return "🥈";
  if (r === "bronze") return "🥉";
  return "🏷️";
}

function fmtInt(n) {
  try {
    return Number(n || 0).toLocaleString();
  } catch {
    return String(n || 0);
  }
}

export default function LevelCard({ stats }) {
  const { xp = 0, level = 1, nextLevelXp = 100, rank } = stats || {};

  const pct = useMemo(() => {
    const denom = Math.max(Number(nextLevelXp) || 1, 1);
    return Math.min(100, Math.max(0, Math.round((Number(xp) / denom) * 100)));
  }, [xp, nextLevelXp]);

  // Count-up XP animation
  const xpMotion = useMotionValue(0);
  const [xpDisplay, setXpDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(xpMotion, Number(xp) || 0, {
      duration: 0.6,
      ease: "easeOut",
    });

    const unsub = xpMotion.on("change", (v) => setXpDisplay(Math.round(v)));

    return () => {
      controls.stop();
      unsub();
    };
  }, [xp, xpMotion]);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Level</p>

          {/* Level pop on change */}
          <motion.h3
            key={level}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="text-2xl font-bold"
          >
            Lv. {level}
          </motion.h3>

          {/* Rank */}
          {rank && (
            <motion.p
              key={rank}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mt-1 text-sm font-semibold text-gray-800"
            >
              {rankIcon(rank)} {rank}
            </motion.p>
          )}

          {/* XP count-up */}
          <p className="mt-1 text-sm text-gray-600">
            {fmtInt(xpDisplay)} XP • Next: {fmtInt(nextLevelXp)} XP
          </p>
        </div>

        {/* Percent pill pop on change */}
        <motion.div
          key={pct}
          initial={{ scale: 0.96, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-xl border px-3 py-2 text-sm font-semibold bg-gray-50"
        >
          {pct}%
        </motion.div>
      </div>

      {/* Animated progress bar */}
      <div className="mt-4 h-3 w-full rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-blue-600"
        />
      </div>
    </motion.div>
  );
}