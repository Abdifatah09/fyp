import React from "react";

export default function LeaderboardPreview({ rows = [] }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500">Leaderboard</p>
        <span className="text-xs text-gray-500">Top {rows.length || 0}</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600">No leaderboard data yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {rows.map((u, idx) => (
            <div key={u.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-100 border flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold">{u.name || "User"}</p>
                  <p className="text-xs text-gray-500">Lv. {u.level}</p>
                </div>
              </div>
              <p className="text-sm font-semibold">{u.xp} XP</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
