import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { subjectService } from "../services/subjectService";
import { difficultyService } from "../services/difficultyService";
import { sectionService } from "../services/sectionService";
import { challengeService } from "../services/challengeService";

export default function Home() {
  const [subjects, setSubjects] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [sectionChallenges, setSectionChallenges] = useState({}); 

  const [error, setError] = useState("");
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoadingSubjects(true);
        const data = await subjectService.getAll();
        setSubjects(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load subjects");
      } finally {
        setLoadingSubjects(false);
      }
    })();
  }, []);

  async function onSelectSubject(subject) {
    setSelectedSubject(subject);
    setSelectedDifficulty(null);
    setDifficulties([]);
    setSections([]);
    setExpandedSectionId(null);
    setSectionChallenges({});
    setError("");

    try {
      const data = await difficultyService.getBySubject(subject.id);
      setDifficulties(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load difficulties");
    }
  }

  async function onSelectDifficulty(diff) {
    setSelectedDifficulty(diff);
    setSections([]);
    setExpandedSectionId(null);
    setSectionChallenges({});
    setError("");

    try {
      const data = await sectionService.getByDifficulty(diff.id);
      setSections(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load sections");
    }
  }

  async function toggleSection(sectionId) {
    const next = expandedSectionId === sectionId ? null : sectionId;
    setExpandedSectionId(next);

    // collapsed
    if (!next) return;

    // already loaded
    if (sectionChallenges[sectionId]) return;

    try {
      const data = await challengeService.getBySection(sectionId);
      setSectionChallenges((prev) => ({
        ...prev,
        [sectionId]: Array.isArray(data) ? data : [],
      }));
    } catch {
      setError("Failed to load challenges");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Browse Curriculum</h1>
      <p className="text-sm text-gray-500 mt-1">
        Pick a subject and difficulty to start learning.
      </p>

      {error && (
        <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* SUBJECTS */}
      <div className="mt-6 bg-white border rounded-xl p-4">
        <h2 className="font-semibold text-gray-900">Subjects</h2>

        {loadingSubjects ? (
          <div className="text-sm text-gray-500 mt-3">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="text-sm text-gray-500 mt-3">No subjects available yet.</div>
        ) : (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSubject(s)}
                className={`text-left border rounded-xl p-4 hover:bg-gray-50 ${
                  selectedSubject?.id === s.id ? "border-gray-900" : "border-gray-200"
                }`}
              >
                <div className="font-medium text-gray-900">{s.name}</div>
                {s.description && (
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {s.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DIFFICULTIES */}
      {selectedSubject && (
        <div className="mt-6 bg-white border rounded-xl p-4">
          <h2 className="font-semibold text-gray-900">Difficulty</h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {difficulties.length === 0 ? (
              <div className="text-sm text-gray-500">No difficulties for this subject yet.</div>
            ) : (
              difficulties.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelectDifficulty(d)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    selectedDifficulty?.id === d.id
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {d.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTIONS + CHALLENGES */}
      {selectedDifficulty && (
        <div className="mt-6 bg-white border rounded-xl p-4">
          <h2 className="font-semibold text-gray-900">Sections</h2>

          {sections.length === 0 ? (
            <div className="text-sm text-gray-500 mt-3">No sections yet.</div>
          ) : (
            <div className="mt-3 space-y-2">
              {sections
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((sec) => (
                  <div key={sec.id} className="border rounded-xl">
                    <button
                      onClick={() => toggleSection(sec.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 rounded-xl"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {sec.title}{" "}
                          <span className="text-xs text-gray-500">#{sec.order}</span>
                        </div>
                        {sec.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {sec.description}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {expandedSectionId === sec.id ? "Hide" : "View"}
                      </div>
                    </button>

                    {expandedSectionId === sec.id && (
                      <div className="px-4 pb-4">
                        <div className="text-sm text-gray-500 mb-2">Challenges</div>

                        {!sectionChallenges[sec.id] ? (
                          <div className="text-sm text-gray-500">Loading challenges...</div>
                        ) : sectionChallenges[sec.id].length === 0 ? (
                          <div className="text-sm text-gray-500">No challenges yet.</div>
                        ) : (
                          <ul className="space-y-2">
                            {sectionChallenges[sec.id]
                              .slice()
                              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                              .map((c) => (
                                <li
                                  key={c.id}
                                  className="flex items-center justify-between border rounded-lg px-3 py-2"
                                >
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {c.title}{" "}
                                      <span className="text-xs text-gray-500">#{c.order}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 line-clamp-1">
                                      {c.description}
                                    </div>
                                  </div>

                                  <Link
                                    to={`/challenges/${c.id}`}
                                    className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                                  >
                                    Open
                                  </Link>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
