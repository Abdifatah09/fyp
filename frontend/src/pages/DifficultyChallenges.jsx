import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { sectionService } from "../services/sectionService";
import { challengeService } from "../services/challengeService";
import { difficultyService } from "../services/difficultyService";

export default function DifficultyChallenges() {
  const { difficultyId } = useParams();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState(null);
  const [sections, setSections] = useState([]);
  const [challenges, setChallenges] = useState([]);

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

        const [allSections, allChallenges] = await Promise.all([
          sectionService.getAll(),
          challengeService.getAll(),
        ]);

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
        setErr("Failed to load challenges for this difficulty");
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
            return (
              <div key={sec.id} className="rounded-xl border p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">Section</p>
                    <h2 className="text-lg font-semibold">{sec.title}</h2>
                  </div>
                  <span className="text-sm text-gray-600">{list.length} challenges</span>
                </div>

                {list.length === 0 ? (
                  <p className="mt-4 text-sm text-gray-600">No challenges in this section yet.</p>
                ) : (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {list.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/challenges/${c.id}/solve`)}
                        className="text-left rounded-xl border p-4 hover:border-gray-400 transition"
                      >
                        <p className="text-xs uppercase tracking-wide text-gray-500">Challenge</p>
                        <h3 className="text-base font-semibold">{c.title}</h3>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                          {c.description}
                        </p>
                        <p className="mt-4 text-sm font-semibold text-blue-600">Open editor →</p>
                      </button>
                    ))}
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
