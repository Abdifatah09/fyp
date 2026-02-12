import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { subjectService } from "../services/subjectService";
import { difficultyService } from "../services/difficultyService";
import { subscriptionService } from "../services/subscriptionService";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [difficulties, setDifficulties] = useState([]);

  const [subs, setSubs] = useState([]);
  const [activeSubjectId, setActiveSubjectId] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const subscribedDifficultyIds = useMemo(() => {
    // supports either API response:
    // - join rows: sub.Difficulty.id
    // - direct difficulties: sub.id
    return new Set(subs.map((s) => String(s?.Difficulty?.id || s?.id)));
  }, [subs]);

  const difficultiesForActiveSubject = useMemo(() => {
    if (!activeSubjectId) return [];
    return difficulties.filter((d) => String(d.subjectId) === String(activeSubjectId));
  }, [difficulties, activeSubjectId]);

  const loadEverything = async () => {
    try {
      setErr("");
      setLoading(true);

      const [subsData, subjectsData, diffsData] = await Promise.all([
        subscriptionService.mine(),
        subjectService.getAll(),
        difficultyService.getAll(),
      ]);

      setSubs(subsData || []);
      setSubjects(subjectsData || []);
      setDifficulties(diffsData || []);

      // auto pick first subject
      const firstSubj = (subjectsData || [])[0];
      if (firstSubj) setActiveSubjectId(firstSubj.id);
    } catch (e) {
      setErr("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = async (difficultyId) => {
    try {
      await subscriptionService.subscribe(difficultyId);
      // refresh subs list (simple + reliable)
      const fresh = await subscriptionService.mine();
      setSubs(fresh || []);
    } catch {
      setErr("Failed to subscribe. Please try again.");
    }
  };

  const handleUnsubscribe = async (difficultyId) => {
    try {
      await subscriptionService.unsubscribe(difficultyId);
      const fresh = await subscriptionService.mine();
      setSubs(fresh || []);
    } catch {
      setErr("Failed to unsubscribe. Please try again.");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2">Welcome {user?.name || user?.email} 👋</p>
        {err && <p className="mt-2 text-red-600">{err}</p>}
      </div>

      {/* My Subscriptions */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold">My Subscriptions</h2>
          <button
            onClick={loadEverything}
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </div>

        {subs.length === 0 ? (
          <div className="rounded-xl border p-5">
            <p className="font-medium">No subscriptions yet</p>
            <p className="text-sm text-gray-600 mt-1">
              Subscribe to a difficulty below and it will show up here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {subs.map((sub) => {
              const difficulty = sub.Difficulty || sub;
              const subject = difficulty?.subject;

              return (
                <div key={sub.id || difficulty.id} className="border rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {subject?.name || "Subject"}
                  </p>
                  <h3 className="text-lg font-semibold">{difficulty?.name}</h3>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => navigate(`/my-path/difficulty/${difficulty.id}`)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Continue
                    </button>
                    <button
                      onClick={() => handleUnsubscribe(difficulty.id)}
                      className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                    >
                      Unsubscribe
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Browse & Subscribe */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Browse & Subscribe</h2>

        {/* Subject picker */}
        <div className="flex flex-wrap gap-3">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSubjectId(s.id)}
              className={`rounded-lg px-4 py-2 border font-semibold transition ${
                String(activeSubjectId) === String(s.id)
                  ? "bg-slate-900 text-white border-slate-900"
                  : "hover:bg-gray-50"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Difficulties for selected subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {difficultiesForActiveSubject.map((d) => {
            const isSubbed = subscribedDifficultyIds.has(String(d.id));

            return (
              <div key={d.id} className="border rounded-xl p-5">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Difficulty
                </p>
                <h3 className="text-lg font-semibold">{d.name}</h3>

                <div className="mt-4 flex gap-3">
                  {isSubbed ? (
                    <>
                      <button
                        onClick={() => navigate(`/my-path/difficulty/${d.id}`)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleUnsubscribe(d.id)}
                        className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                      >
                        Unsubscribe
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(d.id)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white text-sm font-semibold hover:bg-green-700 transition"
                    >
                      Subscribe
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
