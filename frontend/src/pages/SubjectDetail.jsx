import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { progressService } from "../services/progressService";

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // ✅ use your service (api.js already attaches Authorization header)
        const res = await progressService.getSubjectDetail(subjectId);
        setData(res);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Failed to load subject details");
      } finally {
        setLoading(false);
      }
    })();
  }, [subjectId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!data) return <div className="p-6">No data.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Subject: {data.subject?.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-gray-500">Total Difficulties</div>
          <div className="text-2xl font-semibold">{data.totals.totalDifficulties}</div>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-gray-500">Finished</div>
          <div className="text-2xl font-semibold text-green-600">
            {data.totals.finishedDifficulties}
          </div>
        </div>
        <div className="rounded-xl border p-4 bg-white">
          <div className="text-sm text-gray-500">Remaining</div>
          <div className="text-2xl font-semibold text-red-600">
            {data.totals.remainingDifficulties}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {(data.perDifficulty || []).map((d) => (
          <div key={d.difficultyId} className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{d.difficultyName}</h2>
              <span className={d.isFinished ? "text-green-600 font-semibold" : "text-gray-600"}>
                {d.isFinished ? "Finished" : "In progress"}
              </span>
            </div>

            <div className="text-sm text-gray-500 mt-1">
              Finished sections: {d.finishedSections}/{d.totalSections}
            </div>

            <div className="mt-3 space-y-2">
              {(d.sections || []).map((s) => (
                <div
                  key={s.sectionId}
                  className="border rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="text-sm">
                    <div className="font-medium">{s.sectionTitle}</div>
                    <div className="text-gray-500">
                      {s.completedChallenges}/{s.totalChallenges} challenges • {s.completionPercent}%
                    </div>
                  </div>
                  <div className={s.isFinished ? "text-green-600 font-semibold" : "text-gray-600"}>
                    {s.isFinished ? "Finished" : "In progress"}
                  </div>
                </div>
              ))}

              {(d.sections || []).length === 0 && (
                <div className="text-sm text-gray-500">No sections in this difficulty.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
