import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { progressService } from "../services/progressService";

export default function SectionDetail() {
  const { sectionId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressService
      .getSectionDetail(sectionId)
      .then(setData)
      .catch((e) => setErr(e?.message || "Failed to load section detail"))
      .finally(() => setLoading(false));
  }, [sectionId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!data) return <div className="p-6">No data.</div>;

  const { section, totals, completed, remaining } = data;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Section: {section?.name}</h1>
        <p className="text-gray-600 text-sm">
          {totals.completedChallenges}/{totals.totalChallenges} complete • {totals.completionPercent}% •{" "}
          {totals.isFinished ? "Finished" : "In progress"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-3 text-green-700">Completed Challenges</h2>
          {completed?.length ? (
            <ul className="space-y-2">
              {completed.map((c) => (
                <li key={c.id} className="border rounded-lg p-3 text-sm">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-gray-500">Challenge ID: {c.id}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">None completed yet.</div>
          )}
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-3 text-red-700">Remaining Challenges</h2>
          {remaining?.length ? (
            <ul className="space-y-2">
              {remaining.map((c) => (
                <li key={c.id} className="border rounded-lg p-3 text-sm">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-gray-500">Challenge ID: {c.id}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">Nothing remaining 🎉</div>
          )}
        </div>
      </div>
    </div>
  );
}
