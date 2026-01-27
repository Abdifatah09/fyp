import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { subjectService } from "../services/subjectService";
import { difficultyService } from "../services/difficultyService";
import { sectionService } from "../services/sectionService";
import { challengeService } from "../services/challengeService";

/* =======================
   Stable form controls
   (prevents focus loss)
   ======================= */

function Input({ label, value, onChange, ...rest }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-800 mb-1">{label}</div>
      <input
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
        value={value}
        onChange={onChange}
        {...rest}
      />
    </label>
  );
}

function Textarea({ label, value, onChange, ...rest }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-800 mb-1">{label}</div>
      <textarea
        className="w-full min-h-[120px] rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
        value={value}
        onChange={onChange}
        {...rest}
      />
    </label>
  );
}

function Select({ label, value, onChange, children, ...rest }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-800 mb-1">{label}</div>
      <select
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
        value={value}
        onChange={onChange}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

/* =======================
   Helpers
   ======================= */

const EMPTY_SUBJECT = { name: "", description: "" };
const EMPTY_DIFFICULTY = { name: "Beginner" };
const EMPTY_SECTION = { title: "", description: "", order: 1 };
const EMPTY_CHALLENGE = {
  title: "",
  description: "",
  instructions: "",
  starterCode: "",
  solution: "",
  order: 1,
};

function cls(...parts) {
  return parts.filter(Boolean).join(" ");
}

/* =======================
   Page
   ======================= */

export default function AdminCurriculum() {
  const navigate = useNavigate();
  const { user, isReady } = useAuth();

  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  // Lists
  const [subjects, setSubjects] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [sections, setSections] = useState([]);
  const [challenges, setChallenges] = useState([]);

  // Selection
  const [selected, setSelected] = useState({
    subject: null,
    difficulty: null,
    section: null,
    challenge: null,
  });

  // Editor
  const [mode, setMode] = useState("idle"); // idle | view | create | edit
  const [entity, setEntity] = useState(null); // subject | difficulty | section | challenge
  const [form, setForm] = useState({});

  // UI
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  /* ---------- Guard ---------- */
  useEffect(() => {
    if (!isReady) return;
    if (!user) navigate("/login");
    else if (user.role !== "admin") navigate("/");
  }, [isReady, user, navigate]);

  /* ---------- Load subjects ---------- */
  useEffect(() => {
    if (!isReady || !isAdmin) return;
    void loadSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, isAdmin]);

  async function loadSubjects() {
    try {
      setError("");
      const data = await subjectService.getAll();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load subjects");
    }
  }

  async function loadDifficulties(subjectId) {
    try {
      setError("");
      const data = await difficultyService.getBySubject(subjectId);
      setDifficulties(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load difficulties");
    }
  }

  async function loadSections(difficultyId) {
    try {
      setError("");
      const data = await sectionService.getByDifficulty(difficultyId);
      setSections(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load sections");
    }
  }

  async function loadChallenges(sectionId) {
    try {
      setError("");
      const data = await challengeService.getBySection(sectionId);
      setChallenges(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load challenges");
    }
  }

  /* ---------- Selection ---------- */

  async function selectSubject(s) {
    setSelected({ subject: s, difficulty: null, section: null, challenge: null });
    setDifficulties([]);
    setSections([]);
    setChallenges([]);
    setEntity("subject");
    setMode("view");
    setForm(s || {});
    if (s?.id) await loadDifficulties(s.id);
  }

  async function selectDifficulty(d) {
    setSelected((p) => ({ ...p, difficulty: d, section: null, challenge: null }));
    setSections([]);
    setChallenges([]);
    setEntity("difficulty");
    setMode("view");
    setForm(d || {});
    if (d?.id) await loadSections(d.id);
  }

  async function selectSection(sec) {
    setSelected((p) => ({ ...p, section: sec, challenge: null }));
    setChallenges([]);
    setEntity("section");
    setMode("view");
    setForm(sec || {});
    if (sec?.id) await loadChallenges(sec.id);
  }

  function selectChallenge(c) {
    setSelected((p) => ({ ...p, challenge: c }));
    setEntity("challenge");
    setMode("view");
    setForm(c || {});
  }

  /* ---------- Create/Edit ---------- */

  function startCreate(type) {
    setError("");
    setMode("create");
    setEntity(type);

    if (type === "subject") setForm({ ...EMPTY_SUBJECT });
    if (type === "difficulty") setForm({ ...EMPTY_DIFFICULTY });
    if (type === "section") setForm({ ...EMPTY_SECTION });
    if (type === "challenge") setForm({ ...EMPTY_CHALLENGE });
  }

  function startEdit() {
    if (!entity) return;
    setError("");
    setMode("edit");
  }

  function cancel() {
    setError("");
    setMode(entity ? "view" : "idle");
    // restore selected into form
    if (entity === "subject") setForm(selected.subject || {});
    if (entity === "difficulty") setForm(selected.difficulty || {});
    if (entity === "section") setForm(selected.section || {});
    if (entity === "challenge") setForm(selected.challenge || {});
  }

  async function save() {
    setBusy(true);
    setError("");

    try {
      if (entity === "subject") {
        if (mode === "create") await subjectService.create(form);
        if (mode === "edit") await subjectService.update(selected.subject.id, form);
        await loadSubjects();
        setMode("idle");
        setEntity(null);
        setForm({});
        setSelected({ subject: null, difficulty: null, section: null, challenge: null });
        setDifficulties([]); setSections([]); setChallenges([]);
      }

      if (entity === "difficulty") {
        const subjectId = selected.subject?.id;
        if (!subjectId) throw new Error("Select a subject first.");
        const payload = { ...form, subjectId };

        if (mode === "create") await difficultyService.create(payload);
        if (mode === "edit") await difficultyService.update(selected.difficulty.id, payload);

        await loadDifficulties(subjectId);
        setMode("view");
      }

      if (entity === "section") {
        const difficultyId = selected.difficulty?.id;
        if (!difficultyId) throw new Error("Select a difficulty first.");
        const payload = { ...form, difficultyId, order: Number(form.order) || 1 };

        if (mode === "create") await sectionService.create(payload);
        if (mode === "edit") await sectionService.update(selected.section.id, payload);

        await loadSections(difficultyId);
        setMode("view");
      }

      if (entity === "challenge") {
        const sectionId = selected.section?.id;
        if (!sectionId) throw new Error("Select a section first.");
        const payload = { ...form, sectionId, order: Number(form.order) || 1 };

        // Challenge model fields: title, description, instructions, starterCode, solution, order, sectionId
        // (aligned with your Sequelize model)
        if (mode === "create") await challengeService.create(payload);
        if (mode === "edit") await challengeService.update(selected.challenge.id, payload);

        await loadChallenges(sectionId);
        setMode("view");
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeSelected() {
    const ok = window.confirm("Delete this item? This cannot be undone.");
    if (!ok) return;

    setBusy(true);
    setError("");

    try {
      if (entity === "subject" && selected.subject?.id) {
        await subjectService.remove(selected.subject.id);
        await loadSubjects();
        setSelected({ subject: null, difficulty: null, section: null, challenge: null });
        setDifficulties([]); setSections([]); setChallenges([]);
        setEntity(null);
        setMode("idle");
        setForm({});
      }

      if (entity === "difficulty" && selected.difficulty?.id) {
        await difficultyService.remove(selected.difficulty.id);
        await loadDifficulties(selected.subject.id);
        setSelected((p) => ({ ...p, difficulty: null, section: null, challenge: null }));
        setSections([]); setChallenges([]);
        setEntity("subject");
        setMode("view");
        setForm(selected.subject || {});
      }

      if (entity === "section" && selected.section?.id) {
        await sectionService.remove(selected.section.id);
        await loadSections(selected.difficulty.id);
        setSelected((p) => ({ ...p, section: null, challenge: null }));
        setChallenges([]);
        setEntity("difficulty");
        setMode("view");
        setForm(selected.difficulty || {});
      }

      if (entity === "challenge" && selected.challenge?.id) {
        await challengeService.remove(selected.challenge.id);
        await loadChallenges(selected.section.id);
        setSelected((p) => ({ ...p, challenge: null }));
        setEntity("section");
        setMode("view");
        setForm(selected.section || {});
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  /* ---------- Render guard ---------- */
  if (!isReady) return null;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-12 gap-6">
        {/* LEFT: Tree */}
        <aside className="col-span-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Curriculum</h2>
              <button
                className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                onClick={() => startCreate("subject")}
                disabled={busy}
              >
                + Subject
              </button>
            </div>

            <div className="space-y-2">
              {subjects.length === 0 ? (
                <div className="text-sm text-gray-500">No subjects yet.</div>
              ) : (
                subjects.map((s) => (
                  <div key={s.id} className="rounded-lg border border-gray-100">
                    <button
                      className={cls(
                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium",
                        selected.subject?.id === s.id ? "bg-gray-100" : "hover:bg-gray-50"
                      )}
                      onClick={() => selectSubject(s)}
                    >
                      {s.name}
                    </button>

                    {/* Difficulties list (only when subject selected) */}
                    {selected.subject?.id === s.id && (
                      <div className="px-3 pb-3">
                        <div className="flex gap-2 mb-2">
                          <button
                            className="text-xs px-2 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                            onClick={() => startCreate("difficulty")}
                            disabled={busy || !selected.subject}
                          >
                            + Difficulty
                          </button>
                        </div>

                        {difficulties.length === 0 ? (
                          <div className="text-xs text-gray-500">No difficulties.</div>
                        ) : (
                          <div className="space-y-1">
                            {difficulties.map((d) => (
                              <div key={d.id} className="pl-2 border-l border-gray-200">
                                <button
                                  className={cls(
                                    "w-full text-left px-2 py-1.5 rounded text-sm",
                                    selected.difficulty?.id === d.id ? "bg-gray-100" : "hover:bg-gray-50"
                                  )}
                                  onClick={() => selectDifficulty(d)}
                                >
                                  {d.name}
                                </button>

                                {/* Sections list (only when difficulty selected) */}
                                {selected.difficulty?.id === d.id && (
                                  <div className="pl-2 pt-1">
                                    <div className="flex gap-2 mb-2">
                                      <button
                                        className="text-xs px-2 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                                        onClick={() => startCreate("section")}
                                        disabled={busy || !selected.difficulty}
                                      >
                                        + Section
                                      </button>
                                    </div>

                                    {sections.length === 0 ? (
                                      <div className="text-xs text-gray-500">No sections.</div>
                                    ) : (
                                      <div className="space-y-1">
                                        {sections
                                          .slice()
                                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                          .map((sec) => (
                                            <div key={sec.id} className="pl-2 border-l border-gray-200">
                                              <button
                                                className={cls(
                                                  "w-full text-left px-2 py-1.5 rounded text-sm",
                                                  selected.section?.id === sec.id ? "bg-gray-100" : "hover:bg-gray-50"
                                                )}
                                                onClick={() => selectSection(sec)}
                                              >
                                                {sec.title}
                                                <span className="ml-2 text-xs text-gray-500">#{sec.order}</span>
                                              </button>

                                              {/* Challenges list (only when section selected) */}
                                              {selected.section?.id === sec.id && (
                                                <div className="pl-2 pt-1">
                                                  <div className="flex gap-2 mb-2">
                                                    <button
                                                      className="text-xs px-2 py-1 rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                                                      onClick={() => startCreate("challenge")}
                                                      disabled={busy || !selected.section}
                                                    >
                                                      + Challenge
                                                    </button>
                                                  </div>

                                                  {challenges.length === 0 ? (
                                                    <div className="text-xs text-gray-500">No challenges.</div>
                                                  ) : (
                                                    <div className="space-y-1">
                                                      {challenges
                                                        .slice()
                                                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                                                        .map((c) => (
                                                          <button
                                                            key={c.id}
                                                            className={cls(
                                                              "w-full text-left px-2 py-1.5 rounded text-sm",
                                                              selected.challenge?.id === c.id
                                                                ? "bg-gray-100"
                                                                : "hover:bg-gray-50"
                                                            )}
                                                            onClick={() => selectChallenge(c)}
                                                          >
                                                            {c.title}
                                                            <span className="ml-2 text-xs text-gray-500">#{c.order}</span>
                                                          </button>
                                                        ))}
                                                    </div>
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
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* RIGHT: Editor */}
        <section className="col-span-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Editor</h2>
                <p className="text-sm text-gray-500">
                  {mode === "idle" && "Select an item from the left, or create one to begin."}
                  {mode === "view" && entity && `Viewing ${entity}.`}
                  {mode === "create" && entity && `Creating ${entity}...`}
                  {mode === "edit" && entity && `Editing ${entity}...`}
                </p>
              </div>

              <div className="flex gap-2">
                {mode === "view" && entity && (
                  <>
                    <button
                      className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
                      onClick={startEdit}
                      disabled={busy}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm hover:bg-red-50 disabled:opacity-50"
                      onClick={removeSelected}
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </>
                )}

                {(mode === "create" || mode === "edit") && (
                  <>
                    <button
                      className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
                      onClick={cancel}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
                      onClick={save}
                      disabled={busy}
                    >
                      {busy ? "Saving..." : "Save"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="mt-6">
              {mode === "idle" ? (
                <div className="text-sm text-gray-500">
                  Nothing selected yet. Start by selecting a subject (or create one).
                </div>
              ) : (
                <EditorFields
                  entity={entity}
                  mode={mode}
                  form={form}
                  setForm={setForm}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* =======================
   Editor Fields
   (stable inputs)
   ======================= */

function EditorFields({ entity, mode, form, setForm }) {
  const readOnly = mode === "view";

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  if (entity === "subject") {
    return (
      <div className="space-y-4">
        <Input label="Name" value={form?.name ?? ""} onChange={set("name")} disabled={readOnly} />
        <Textarea
          label="Description"
          value={form?.description ?? ""}
          onChange={set("description")}
          disabled={readOnly}
          placeholder="Optional subject description..."
        />
      </div>
    );
  }

  if (entity === "difficulty") {
    return (
      <div className="space-y-4">
        <Select label="Name" value={form?.name ?? "Beginner"} onChange={set("name")} disabled={readOnly}>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </Select>
        <p className="text-xs text-gray-500">
          Difficulty is created *within* the selected subject.
        </p>
      </div>
    );
  }

  if (entity === "section") {
    return (
      <div className="space-y-4">
        <Input label="Title" value={form?.title ?? ""} onChange={set("title")} disabled={readOnly} />
        <Textarea
          label="Description"
          value={form?.description ?? ""}
          onChange={set("description")}
          disabled={readOnly}
          placeholder="Optional section overview..."
        />
        <Input
          label="Order"
          type="number"
          value={form?.order ?? 1}
          onChange={set("order")}
          disabled={readOnly}
        />
      </div>
    );
  }

  // Challenge fields aligned with your model:
  // title, description, instructions, starterCode, solution, order, sectionId
  if (entity === "challenge") {
    return (
      <div className="space-y-4">
        <Input label="Title" value={form?.title ?? ""} onChange={set("title")} disabled={readOnly} />
        <Textarea label="Description" value={form?.description ?? ""} onChange={set("description")} disabled={readOnly} />
        <Textarea
          label="Instructions"
          value={form?.instructions ?? ""}
          onChange={set("instructions")}
          disabled={readOnly}
          placeholder="How the user should solve it, rules, constraints..."
        />
        <Textarea
          label="Starter Code"
          value={form?.starterCode ?? ""}
          onChange={set("starterCode")}
          disabled={readOnly}
          placeholder="Optional starter template shown in the editor..."
        />
        <Textarea
          label="Solution"
          value={form?.solution ?? ""}
          onChange={set("solution")}
          disabled={readOnly}
          placeholder="Optional reference solution (admin only)..."
        />
        <Input
          label="Order"
          type="number"
          value={form?.order ?? 1}
          onChange={set("order")}
          disabled={readOnly}
        />
        <p className="text-xs text-gray-500">
          This challenge is created inside the selected section.
        </p>
      </div>
    );
  }

  return <div className="text-sm text-gray-500">Select something to edit.</div>;
}
