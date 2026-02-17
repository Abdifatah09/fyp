import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { subscriptionService } from "../services/subscriptionService";
import { sectionService } from "../services/sectionService";
import { difficultyService } from "../services/difficultyService";

export default function MyPathDifficulty() {
  const params = useParams();
  const { difficultyId } = useParams();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState(null);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // debug info visible on screen

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      if (!difficultyId) {
        setErr("No difficultyId in URL params. Check your route param name.");
        setLoading(false);
        return;
      }

      try {
        // 1) Load all difficulties (since you don't have getById)
        const diffs = await difficultyService.getAll();
        const diff =
          (diffs || []).find((d) => String(d.id) === String(difficultyId)) || null;

        // 2) Load sections for this difficulty
        const secsUrl = `/sections?difficultyId=${difficultyId}`;
        const secs = await sectionService.getByDifficulty(difficultyId);

        const sortedSecs = [...(secs || [])].sort((a, b) => {
          const ao = a.order ?? a.position ?? a.index ?? 0;
          const bo = b.order ?? b.position ?? b.index ?? 0;
          return ao - bo;
        });

        setDifficulty(diff);
        setSections(sortedSecs);

      } catch (e) {
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load your learning path.";
        setErr(msg);

        setDebug((d) => ({
          ...d,
          difficultyId,
          diffsLoaded: false,
          secsLoaded: false,
        }));
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

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="mt-2 text-gray-600">
            Work through the sections in order.
          </p>
          {!difficulty && (
            <p className="mt-2 text-sm text-amber-700">
              Difficulty not found in /difficulties for id: {difficultyId}
            </p>
          )}
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
              } catch (e) {
                setErr(e?.response?.data?.message || "Failed to unsubscribe.");
              }
            }}
            className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50 transition"
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
            If this is unexpected, check the Debug panel above (URL + API counts).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sections.map((sec, idx) => (
            <div key={sec.id} className="rounded-xl border p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Section {idx + 1}
              </p>
              <h3 className="text-lg font-semibold">{sec.title}</h3>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => navigate(`/my-path/difficulty/${difficultyId}/solve/`)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-semibold hover:bg-blue-700 transition"
                >
                  Start / Continue
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
