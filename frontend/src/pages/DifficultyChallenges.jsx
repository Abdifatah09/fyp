import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { sectionService } from "../services/sectionService";
import { challengeService } from "../services/challengeService";
import { difficultyService } from "../services/difficultyService";
import { progressService } from "../services/progressService";

export default function DifficultyChallenges() {
  const { difficultyId } = useParams();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState(null);
  const [sections, setSections] = useState([]);
  const [challenges, setChallenges] = useState([]);

  const [completedIds, setCompletedIds] = useState([]);
  const completedSet = useMemo(
    () => new Set((completedIds || []).map((x) => String(x))),
    [completedIds]
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // difficulty name (optional)
        let diff = null;
        try {
          if (difficultyService.getById) diff = await difficultyService.getById(difficultyId);
          else {
            const all = await difficultyService.getAll();
            diff = all.find((d) => String(d.id) === String(difficultyId)) || null;
          }
        } catch {}

        const [allSections, allChallenges, completed] = await Promise.all([
          sectionService.getAll(),
          challengeService.getAll(),
          progressService.getMyCompletedChallengeIds(), // <-- new
        ]);

        setCompletedIds(completed?.completedChallengeIds || []);

        const secs = (allSections || [])
          .filter((s) => String(s.difficultyId) === String(difficultyId))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        setDifficulty(diff);
        setSections(secs);

        // keep only challenges that belong to those sections
        const secIds = new Set(secs.map((s) => String(s.id)));
        const chals = (allChallenges || [])
          .filter((c) => secIds.has(String(c.sectionId)))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        setChallenges(chals);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load challenges for this difficulty");
      } finally {
        setLoading(false);
      }
    })();
  }, [difficultyId]);

  const challengesBySection = useMemo(() => {
    const map = new Map();
    for (const sec of sections) map.set(String(sec.id), []);
    for (const c of challenges) {
      const key = String(c.sectionId);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    }
    return map;
  }, [sections, challenges]);

  if (loading) return <div className="p-6 text-gray-600">Loading challenges...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {difficulty ? `Select a Challenge — ${difficulty.name}` : "Select a Challenge"}
          </h1>
          <p className="mt-2 text-gray-600">
            Pick a challenge to open the editor and submit your solution.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
        >
          Back
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-xl border p-6">
          <p className="font-semibold">No sections found</p>
          <p className="mt-1 text-sm text-gray-600">
            This difficulty doesn’t have sections yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((sec) => {
            const list = challengesBySection.get(String(sec.id)) || [];

            // section progress using completedSet
            const total = list.length;
            const done = list.filter((c) => completedSet.has(String(c.id))).length;
            const percent = total === 0 ? 0 : Math.round((done / total) * 100);

            return (
              <div key={sec.id} className="rounded-xl border p-5 bg-white">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Section</p>
                    <h2 className="text-lg font-semibold">{sec.title}</h2>

                    {/* Section progress */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        {done}/{total} completed
                      </span>
                      <span className="inline-flex items-center rounded-full border bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-700">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  <span className="text-sm text-gray-600">{list.length} challenges</span>
                </div>

                {list.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-600">No challenges in this section yet.</p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {list.map((c) => {
                      const isCompleted = completedSet.has(String(c.id));

                      return (
                        <button
                          key={c.id}
                          onClick={() => navigate(`/challenges/${c.id}/solve`)}
                          className={`relative text-left rounded-xl border p-4 transition ${
                            isCompleted
                              ? "border-green-200 bg-green-50 hover:border-green-300"
                              : "hover:border-gray-400 bg-white"
                          }`}
                        >
                          {/* top-right marker */}
                          {isCompleted && (
                            <span className="absolute top-3 right-3 inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                              ✅ Completed
                            </span>
                          )}

                          <p className="text-xs uppercase tracking-wide text-gray-500">Challenge</p>
                          <h3 className="text-base font-semibold">{c.title}</h3>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                            {c.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm font-semibold text-blue-600">
                              Open editor →
                            </p>

                            {!isCompleted ? (
                              <span className="text-xs font-semibold text-gray-500">
                                Not done
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-green-700">
                                Done
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}