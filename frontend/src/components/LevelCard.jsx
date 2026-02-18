import React, { useMemo } from "react";

export default function LevelCard({ stats }) {
  const { xp = 0, level = 1, nextLevelXp = 100 } = stats || {};

  const pct = useMemo(() => {
    const denom = Math.max(nextLevelXp, 1);
    return Math.min(100, Math.max(0, Math.round((xp / denom) * 100)));
  }, [xp, nextLevelXp]);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Level</p>
          <h3 className="text-2xl font-bold">Lv. {level}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {xp} XP • Next: {nextLevelXp} XP
          </p>
        </div>

        <div className="rounded-xl border px-3 py-2 text-sm font-semibold bg-gray-50">
          {pct}%
        </div>
      </div>

      <div className="mt-4 h-3 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
