import React from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

export default function LeaderboardPreview({ rows = [] }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="rounded-2xl border bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500">Leaderboard</p>
        <span className="text-xs text-gray-500">Top {rows.length || 0}</span>
      </div>

      {rows.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-gray-600"
        >
          No leaderboard data yet.
        </motion.p>
      ) : (
        <motion.div
          variants={list}
          initial="hidden"
          animate="show"
          className="mt-4 space-y-2"
          layout
        >
          <AnimatePresence initial={false}>
            {rows.map((u, idx) => {
              const hasRank = Boolean(u.rank);
              const key = u.id || `${u.name || "user"}-${idx}`;

              return (
                <motion.div
                  key={key}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  layout
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between rounded-xl px-2 py-2"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      layout
                      className="h-8 w-8 rounded-full bg-gray-100 border flex items-center justify-center text-sm font-bold"
                      initial={{ scale: 0.95, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {idx + 1}
                    </motion.div>

                    <div>
                      <p className="text-sm font-semibold">
                        {u.name || "User"}

                        {hasRank && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="ml-2 inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700"
                          >
                            <span>{rankIcon(u.rank)}</span>
                            <span>{u.rank}</span>
                          </motion.span>
                        )}
                      </p>

                      <p className="text-xs text-gray-500">Lv. {fmtInt(u.level)}</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold">{fmtInt(u.xp)} XP</p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}