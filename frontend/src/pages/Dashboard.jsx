import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { subjectService } from "../services/subjectService";
import { difficultyService } from "../services/difficultyService";
import { subscriptionService } from "../services/subscriptionService";

import { gamificationService } from "../services/gamificationService";
import { leaderboardService } from "../services/leaderboardService";

import LevelCard from "../components/LevelCard";
import StreakCard from "../components/StreakCard";
import LeaderboardPreview from "../components/LeaderboardPreview";

import { motion, AnimatePresence } from "framer-motion";

const page = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.25 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.06 * i, ease: "easeOut" },
  }),
};

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [subs, setSubs] = useState([]);

  // gamification
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  const [activeSubjectId, setActiveSubjectId] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const subscribedDifficultyIds = useMemo(() => {
    return new Set(subs.map((s) => String(s?.Difficulty?.id || s?.id)));
  }, [subs]);

  const difficultiesForActiveSubject = useMemo(() => {
    if (!activeSubjectId) return [];
    return difficulties.filter(
      (d) => String(d.subjectId) === String(activeSubjectId)
    );
  }, [difficulties, activeSubjectId]);

  const loadEverything = async () => {
    try {
      setErr("");
      setLoading(true);

      const [subsData, subjectsData, diffsData, statsData, lbData] =
        await Promise.all([
          subscriptionService.mine(),
          subjectService.getAll(),
          difficultyService.getAll(),
          gamificationService.me(),
          leaderboardService.global(5),
        ]);

      setSubs(subsData || []);
      setSubjects(subjectsData || []);
      setDifficulties(diffsData || []);
      setStats(statsData || null);
      setLeaderboard(lbData || []);

      // auto pick first subject (only if none selected)
      const firstSubj = (subjectsData || [])[0];
      if (!activeSubjectId && firstSubj) setActiveSubjectId(firstSubj.id);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSubscriptionsOnly = async () => {
    try {
      const fresh = await subscriptionService.mine();
      setSubs(fresh || []);
    } catch {
      setErr("Failed to refresh subscriptions.");
    }
  };

  const handleSubscribe = async (difficultyId) => {
    try {
      await subscriptionService.subscribe(difficultyId);
      await refreshSubscriptionsOnly();
    } catch {
      setErr("Failed to subscribe. Please try again.");
    }
  };

  const handleUnsubscribe = async (difficultyId) => {
    try {
      await subscriptionService.unsubscribe(difficultyId);
      await refreshSubscriptionsOnly();
    } catch {
      setErr("Failed to unsubscribe. Please try again.");
    }
  };

  const rankMeta = useMemo(() => {
    const r = stats?.rank || "Bronze";
    const map = {
      Bronze: { icon: "🥉", cls: "bg-amber-50 text-amber-800 border-amber-200" },
      Silver: { icon: "🥈", cls: "bg-slate-50 text-slate-800 border-slate-200" },
      Gold: { icon: "🥇", cls: "bg-yellow-50 text-yellow-800 border-yellow-200" },
      Platinum: { icon: "💎", cls: "bg-indigo-50 text-indigo-800 border-indigo-200" },
      Diamond: { icon: "🔥", cls: "bg-rose-50 text-rose-800 border-rose-200" },
      Master: { icon: "👑", cls: "bg-purple-50 text-purple-800 border-purple-200" },
    };
    return map[r] || { icon: "🏷️", cls: "bg-gray-50 text-gray-800 border-gray-200" };
  }, [stats?.rank]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  }

  return (
    <motion.div
      variants={page}
      initial="hidden"
      animate="show"
      className="p-6 space-y-10"
    >
      {/* Header */}
      <div>
        <motion.h1 variants={fadeUp} custom={0} initial="hidden" animate="show" className="text-2xl font-semibold">
          Dashboard
        </motion.h1>

        <motion.p variants={fadeUp} custom={1} initial="hidden" animate="show" className="mt-2">
          Welcome {user?.name || user?.email} 👋
        </motion.p>

        <AnimatePresence>
          {err && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mt-2 text-red-600"
            >
              {err}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stats?.rank && (
            <motion.div
              key={stats.rank}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={`mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 ${rankMeta.cls}`}
            >
              <span className="text-lg leading-none">{rankMeta.icon}</span>
              <span className="text-sm font-semibold">Rank:</span>
              <span className="text-sm font-bold">{stats.rank}</span>
              <span className="text-xs opacity-80">
                • Level {stats.level} • {stats.xp} XP
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gamification Cards */}
      <motion.section
        variants={listStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.div variants={itemFade} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <LevelCard stats={stats} />
        </motion.div>

        <motion.div variants={itemFade} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <StreakCard stats={stats} />
        </motion.div>

        <motion.div variants={itemFade} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
          <LeaderboardPreview rows={leaderboard} />
        </motion.div>
      </motion.section>

      {/* My Subscriptions */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <motion.h2 variants={fadeUp} custom={2} initial="hidden" animate="show" className="text-xl font-semibold">
            My Subscriptions
          </motion.h2>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadEverything}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Refresh
          </motion.button>
        </div>

        {subs.length === 0 ? (
          <motion.div
            variants={itemFade}
            initial="hidden"
            animate="show"
            className="rounded-xl border p-5 bg-white"
          >
            <p className="font-medium">No subscriptions yet</p>
            <p className="text-sm text-gray-600 mt-1">
              Subscribe to a difficulty below and it will show up here.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={listStagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {subs.map((sub) => {
              const difficulty = sub.Difficulty || sub;
              const subject = difficulty?.subject;

              return (
                <motion.div
                  key={sub.id || difficulty.id}
                  variants={itemFade}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.15 }}
                  className="border rounded-xl p-5 bg-white"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {subject?.name || "Subject"}
                  </p>
                  <h3 className="text-lg font-semibold">{difficulty?.name}</h3>

                  <div className="mt-4 flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        navigate(`/my-path/difficulty/${difficulty.id}`)
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Continue
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUnsubscribe(difficulty.id)}
                      className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                    >
                      Unsubscribe
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Browse & Subscribe */}
      <section className="space-y-4">
        <motion.h2 variants={fadeUp} custom={3} initial="hidden" animate="show" className="text-xl font-semibold">
          Browse & Subscribe
        </motion.h2>

        {/* Subject picker */}
        <div className="flex flex-wrap gap-3">
          {subjects.map((s) => (
            <motion.button
              key={s.id}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSubjectId(s.id)}
              className={`rounded-lg px-4 py-2 border font-semibold transition ${
                String(activeSubjectId) === String(s.id)
                  ? "bg-slate-900 text-white border-slate-900"
                  : "hover:bg-gray-50"
              }`}
            >
              {s.name}
            </motion.button>
          ))}
        </div>

        {/* Difficulties for selected subject */}
        <motion.div
          variants={listStagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {difficultiesForActiveSubject.map((d) => {
            const isSubbed = subscribedDifficultyIds.has(String(d.id));

            return (
              <motion.div
                key={d.id}
                variants={itemFade}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                className="border rounded-xl p-5 bg-white"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Difficulty
                </p>
                <h3 className="text-lg font-semibold">{d.name}</h3>

                <div className="mt-4 flex gap-3">
                  {isSubbed ? (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/my-path/difficulty/${d.id}`)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        Open
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleUnsubscribe(d.id)}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                      >
                        Unsubscribe
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSubscribe(d.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white text-sm font-semibold hover:bg-green-700 transition"
                    >
                      Subscribe
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </motion.div>
  );
}