import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2">Welcome {user?.name || user?.email} 👋</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {["Courses", "Challenges", "Leaderboard"].map((x) => (
          <div key={x} className="border rounded-xl p-5">
            <h2 className="font-semibold">{x}</h2>
            <p className="text-sm mt-2 opacity-80">Placeholder (Sprint 2+)</p>
          </div>
        ))}
      </div>
    </div>
  );
}
