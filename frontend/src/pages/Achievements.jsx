import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { achievementService } from "../services/achievementService";
import { badgeService } from "../services/badgeService";

function iconFor(item) {
  const key = String(item?.key || "").toLowerCase();
  const name = String(item?.name || "").toLowerCase();

  if (key.includes("streak") || name.includes("streak")) return "🔥";
  if (key.includes("level") || name.includes("level")) return "⭐";
  if (key.includes("submit") || name.includes("submit")) return "📩";
  if (
    key.includes("win") ||
    name.includes("complete") ||
    name.includes("correct") ||
    key.includes("perfect")
  )
    return "🏆";
  return "🎖️";
}

function formatDate(d) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(d);
  }
}

function fmtInt(n) {
  try {
    return Number(n || 0).toLocaleString();
  } catch {
    return String(n || 0);
  }
}

function sumXp(list) {
  return (list || []).reduce((sum, x) => sum + Number(x?.xpReward || 0), 0);
}

export default function Achievements() {
  const navigate = useNavigate();

  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI state
  const [tab, setTab] = useState("achievements"); // achievements | badges
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | xpHigh | xpLow | alpha

  const totalAchievementXp = useMemo(() => sumXp(achievements), [achievements]);
  const totalBadgeXp = useMemo(() => sumXp(badges), [badges]);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        const a = await achievementService.me();
        setAchievements(Array.isArray(a) ? a : []);

        const b = await badgeService.me();
        setBadges(Array.isArray(b) ? b : []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load achievements/badges");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeList = tab === "achievements" ? achievements : badges;

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = Array.isArray(activeList) ? [...activeList] : [];

    if (q) {
      list = list.filter((x) => {
        const name = String(x?.name || "").toLowerCase();
        const desc = String(x?.description || "").toLowerCase();
        const key = String(x?.key || "").toLowerCase();
        return name.includes(q) || desc.includes(q) || key.includes(q);
      });
    }

    const dateVal = (x) => {
      const d = x?.earnedAt || x?.createdAt;
      const t = d ? new Date(d).getTime() : 0;
      return Number.isFinite(t) ? t : 0;
    };

    if (sort === "newest") list.sort((a, b) => dateVal(b) - dateVal(a));
    if (sort === "oldest") list.sort((a, b) => dateVal(a) - dateVal(b));
    if (sort === "xpHigh") list.sort((a, b) => Number(b?.xpReward || 0) - Number(a?.xpReward || 0));
    if (sort === "xpLow") list.sort((a, b) => Number(a?.xpReward || 0) - Number(b?.xpReward || 0));
    if (sort === "alpha") list.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || "")));

    return list;
  }, [activeList, query, sort]);

  const StatCard = ({ title, value, sub, icon }) => (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          {sub && <p className="mt-1 text-sm text-gray-600">{sub}</p>}
        </div>
        <div className="h-11 w-11 rounded-2xl border bg-gray-50 flex items-center justify-center text-xl">
          {icon}
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, hint }) => {
    const active = tab === id;
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        className={`group rounded-xl border px-4 py-2 text-left transition ${
          active ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold">{label}</span>
          <span
            className={`text-xs font-semibold ${
              active ? "text-white/80" : "text-gray-500"
            }`}
          >
            {hint}
          </span>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="h-9 w-72 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="mt-3 h-8 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="mt-2 h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="h-10 w-full bg-gray-200 rounded-xl animate-pulse" />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-2xl border p-4 bg-gray-50 animate-pulse">
                  <div className="h-10 w-10 rounded-2xl bg-gray-200" />
                  <div className="mt-3 h-4 w-3/4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
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

  const emptyText =
    tab === "achievements"
      ? "No achievements yet"
      : "No badges yet";

  const emptySub =
    tab === "achievements"
      ? "Big milestones will appear here as you progress."
      : "Collect badges by completing challenges and getting perfect solves.";

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Rewards
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Achievements unlocked"
            value={fmtInt(achievements.length)}
            sub={`Total XP: ${fmtInt(totalAchievementXp)}`}
            icon="🏆"
          />
          <StatCard
            title="Badges collected"
            value={fmtInt(badges.length)}
            sub={`Total XP: ${fmtInt(totalBadgeXp)}`}
            icon="🎖️"
          />
          <StatCard
            title="Total rewards"
            value={fmtInt(achievements.length + badges.length)}
            sub={`XP from rewards: ${fmtInt(totalAchievementXp + totalBadgeXp)}`}
            icon="✨"
          />
          <StatCard
            title="Tip"
            value={tab === "achievements" ? "Milestones" : "Collection"}
            sub={tab === "achievements" ? "Less frequent, bigger rewards." : "More frequent, smaller wins."}
            icon="💡"
          />
        </div>

        {/* Tabs + tools */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <TabButton
                id="achievements"
                label="Achievements"
                hint={`${fmtInt(achievements.length)} unlocked`}
              />
              <TabButton
                id="badges"
                label="Badges"
                hint={`${fmtInt(badges.length)} collected`}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${tab}...`}
                  className="w-full sm:w-72 rounded-xl border px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
                <span className="pointer-events-none absolute right-3 top-2.5 text-gray-400">
                  🔎
                </span>
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border px-3 py-2 text-sm font-semibold bg-white hover:bg-gray-50 transition"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="xpHigh">XP: High → Low</option>
                <option value="xpLow">XP: Low → High</option>
                <option value="alpha">A → Z</option>
              </select>
            </div>
          </div>

          {/* Content */}
          {filteredSorted.length === 0 ? (
            <div className="mt-5 rounded-2xl border bg-gray-50 p-6">
              <p className="font-bold text-slate-900">{emptyText}</p>
              <p className="mt-1 text-sm text-gray-600">{emptySub}</p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>
            </div>
          ) : tab === "badges" ? (
            // Badge wall: compact tiles
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {filteredSorted.map((b) => (
                <div
                  key={b.id || b.key}
                  className="rounded-2xl border bg-white p-4 hover:shadow-sm transition"
                  title={`${b.name}${b.earnedAt ? ` • Earned: ${formatDate(b.earnedAt)}` : ""}`}
                >
                  <div className="h-12 w-12 rounded-2xl border bg-gray-50 flex items-center justify-center text-2xl">
                    {iconFor(b)}
                  </div>
                  <p className="mt-3 font-bold text-sm leading-tight text-slate-900 line-clamp-2">
                    {b.name}
                  </p>
                  {b.earnedAt && (
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(b.earnedAt)}
                    </p>
                  )}
                  {Number(b.xpReward || 0) > 0 && (
                    <span className="mt-2 inline-flex items-center rounded-full border bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                      +{b.xpReward} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Achievements: bigger cards with detail
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSorted.map((a) => (
                <div
                  key={a.id || a.key}
                  className="rounded-2xl border bg-white p-5 shadow-sm hover:shadow transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-2xl border bg-gray-50 flex items-center justify-center text-2xl">
                      {iconFor(a)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-extrabold leading-tight text-slate-900">
                          {a.name}
                        </h3>
                        {Number(a.xpReward || 0) > 0 && (
                          <span className="shrink-0 inline-flex items-center rounded-full border bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border-green-200">
                            +{a.xpReward} XP
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-600">{a.description}</p>

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

        <div className="h-6" />
      </div>
    </div>
  );
}