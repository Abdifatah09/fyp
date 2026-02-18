import React from "react";

export default function StreakCard({ stats }) {
  const streak = stats?.streakCount ?? 0;
  const last = stats?.lastActiveDate || "—";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">Streak</p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <h3 className="text-2xl font-bold">🔥 {streak}</h3>
          <p className="mt-1 text-sm text-gray-600">Last active: {last}</p>
        </div>
        <span className="text-xs font-semibold rounded-full px-3 py-1 border bg-gray-50">
          Daily
        </span>
      </div>
    </div>
  );
}
