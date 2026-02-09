import { useEffect, useState } from "react";
import { progressService } from "../services/progressService";

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export default function ProgressOverview() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    progressService
      .getMyProgress()
      .then(setData)
      .catch((e) => setErr(e?.message || "Failed to load progress"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!data) return <div className="p-6">No data.</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progress Overview</h1>
        <p className="text-gray-600 text-sm">Your overall attempts and completion.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Attempts" value={data.totalAttempts} />
        <StatCard label="Total Correct" value={data.totalCorrect} />
        <StatCard label="Accuracy" value={`${data.accuracy}%`} />
        <StatCard label="Completed Challenges" value={data.completedChallenges} />
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold mb-3">Recent Attempts</h2>

        {Array.isArray(data.recentAttempts) && data.recentAttempts.length > 0 ? (
          <ul className="space-y-2">
            {data.recentAttempts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">Challenge ID: {a.challengeId}</div>
                  <div className="text-gray-500">
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className={a.isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {a.isCorrect ? "Correct" : "Incorrect"}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No attempts yet.</div>
        )}
      </div>
    </div>
  );
}
