import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { achievementService } from "../services/achievementService";

function iconFor(a) {
  const key = String(a?.key || "").toLowerCase();
  const name = String(a?.name || "").toLowerCase();
  const icon = String(a?.icon || "").toLowerCase();


  if (key.includes("streak") || name.includes("streak")) return "🔥";
  if (key.includes("level") || name.includes("level")) return "⭐";
  if (key.includes("submit") || name.includes("submit")) return "📩";
  if (key.includes("win") || name.includes("complete") || name.includes("correct")) return "🏆";
  return "🎖️";
}

function formatDate(d) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return String(d);
  }
}

export default function Achievements() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const totalXpFromAchievements = useMemo(() => {
    return (rows || []).reduce((sum, a) => sum + Number(a?.xpReward || 0), 0);
  }, [rows]);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await achievementService.me(); 
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load achievements");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="mt-2 h-4 w-72 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-10 w-28 bg-gray-200 rounded-xl animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gray-200 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
                    <div className="mt-2 h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto rounded-2xl border bg-white p-6">
          <p className="text-red-600 font-semibold">{err}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Achievements</h1>
              <p className="mt-2 text-gray-600">
                Your unlocked achievements and rewards.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-800">
                  🎯 Unlocked: {rows.length}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-800">
                  ✨ Achievement XP: {totalXpFromAchievements}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
            >
              Back
            </button>
          </div>
        </div>

        {/* Content */}
        {rows.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="font-semibold">No achievements yet</p>
            <p className="mt-1 text-sm text-gray-600">
              Complete challenges to unlock achievements and earn extra XP.
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((a) => (
              <div key={a.id || a.key} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-2xl border bg-gray-50 flex items-center justify-center text-2xl">
                    {iconFor(a)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-bold leading-tight">{a.name}</h3>
                      {Number(a.xpReward || 0) > 0 && (
                        <span className="shrink-0 inline-flex items-center rounded-full border bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border-green-200">
                          +{a.xpReward} XP
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                      {a.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {a.key && (
                        <span className="inline-flex items-center rounded-full border bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                          {a.key}
                        </span>
                      )}

                      {a.earnedAt && (
                        <span className="inline-flex items-center rounded-full border bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                          Earned: {formatDate(a.earnedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
