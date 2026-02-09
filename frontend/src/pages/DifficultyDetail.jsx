import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { progressService } from "../services/progressService";

export default function DifficultyDetail() {
  const { difficultyId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressService
      .getDifficultyDetail(difficultyId)
      .then(setData)
      .catch((e) => setErr(e?.message || "Failed to load difficulty detail"))
      .finally(() => setLoading(false));
  }, [difficultyId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!data) return <div className="p-6">No data.</div>;

  const { difficulty, totals, perSection } = data;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Difficulty: {difficulty?.name}</h1>
        <p className="text-gray-600 text-sm">
          Finished sections: {totals.finishedSections}/{totals.totalSections}
        </p>
      </div>

      <div className="space-y-2">
        {perSection.map((s) => (
          <div key={s.sectionId} className="rounded-xl border bg-white p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{s.sectionName}</div>
              <div className="text-sm text-gray-500">
                {s.completedChallenges}/{s.totalChallenges} • {s.completionPercent}%
              </div>
            </div>
            <div className={s.isFinished ? "text-green-600 font-semibold" : "text-gray-600"}>
              {s.isFinished ? "Finished" : "In progress"}
            </div>
          </div>
        ))}

        {perSection.length === 0 && (
          <div className="text-sm text-gray-500">No sections found for this difficulty.</div>
        )}
      </div>
    </div>
  );
}
