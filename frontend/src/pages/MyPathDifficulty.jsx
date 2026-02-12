import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { subscriptionService } from "../services/subscriptionService";
import { sectionService } from "../services/sectionService";
import { difficultyService } from "../services/difficultyService";

export default function MyPathDifficulty() {
  const { difficultyId } = useParams();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState(null);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // If you don't have these endpoints, it still works because we fall back
        // to fetching all sections + filtering by difficultyId.
        let diff = null;
        try {
          diff = await difficultyService.getById?.(difficultyId);
        } catch {}

        let secs = [];
        try {
          secs = await sectionService.getByDifficultyId?.(difficultyId);
        } catch {}

        // Fallbacks if your services only have getAll()
        if (!diff && difficultyService.getAll) {
          const allDiffs = await difficultyService.getAll();
          diff = allDiffs.find((d) => String(d.id) === String(difficultyId)) || null;
        }

        if ((!secs || secs.length === 0) && sectionService.getAll) {
          const allSecs = await sectionService.getAll();
          secs = allSecs.filter((s) => String(s.difficultyId) === String(difficultyId));
        }

        // sort sections nicely if you have an order/index field
        const sortedSecs = [...(secs || [])].sort((a, b) => {
          const ao = a.order ?? a.position ?? a.index ?? 0;
          const bo = b.order ?? b.position ?? b.index ?? 0;
          return ao - bo;
        });

        setDifficulty(diff);
        setSections(sortedSecs);
      } catch (e) {
        setErr("Failed to load your learning path.");
      } finally {
        setLoading(false);
      }
    })();
  }, [difficultyId]);

  const title = useMemo(() => {
    if (!difficulty) return "My Path";
    return `My Path — ${difficulty.name}`;
  }, [difficulty]);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading your path...</div>;
  }

  if (err) {
    return (
      <div className="p-6">
        <p className="text-red-600">{err}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-gray-600">
            Work through the sections in order. Your progress will show here once you
            wire in section completion.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
          >
            Back
          </button>

          <button
            onClick={async () => {
              try {
                await subscriptionService.unsubscribe(difficultyId);
                navigate("/dashboard");
              } catch {
                // keep it simple
              }
            }}
            className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
            title="Remove this difficulty from your subscriptions"
          >
            Unsubscribe
          </button>
        </div>
      </div>

      {/* Sections */}
      {sections.length === 0 ? (
        <div className="rounded-xl border p-6">
          <p className="font-semibold">No sections found</p>
          <p className="mt-1 text-sm text-gray-600">
            This difficulty doesn’t have sections yet (or the API endpoint is missing).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sections.map((sec, idx) => (
            <div key={sec.id} className="rounded-xl border p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Section {idx + 1}
                  </p>
                  <h3 className="text-lg font-semibold">{sec.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Section challenges and exercises
                  </p>
                </div>

                {/* placeholder progress pill */}
                <span className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold text-gray-600">
                  Not started
                </span>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => navigate(`/progress/sections/${sec.id}`)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Start / Continue
                </button>

                <button
                  onClick={() => navigate(`/progress/sections/${sec.id}`)}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
