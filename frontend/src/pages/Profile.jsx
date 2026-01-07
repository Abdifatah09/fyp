import React, { useEffect, useMemo, useState } from "react";
import { profileService } from "../services/profileService";
import { authService } from "../services/authService";

const GENDER_OPTIONS = [
  { value: "", label: "Select..." },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function validate(values) {
  const errors = {};
  if (!values.firstName?.trim()) errors.firstName = "First name is required";
  if (!values.lastName?.trim()) errors.lastName = "Last name is required";

  if (values.username && values.username.length < 3) {
    errors.username = "Username must be at least 3 characters";
  }
  if (values.bio && values.bio.length > 250) {
    errors.bio = "Bio must be 250 characters or less";
  }
  if (values.dob && isNaN(Date.parse(values.dob))) {
    errors.dob = "Date of birth must be a valid date";
  }
  return errors;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    dob: "",
    gender: "",
    bio: "",
    avatarUri: "",
  });

  const errors = useMemo(() => validate(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setServerError("");

        const meData = await authService.me();
        const meUser = meData?.user ?? meData;
        const uid = meUser?.id;

        if (!uid) throw new Error("No userId returned from /auth/me");
        if (!mounted) return;
        setUserId(uid);

        const profData = await profileService.me();
        const p = profData?.profile ?? profData;

        if (!mounted) return;

        setProfile(p);

        setForm({
          firstName: p?.firstName ?? "",
          lastName: p?.lastName ?? "",
          username: p?.username ?? "",
          dob: p?.dob ? String(p.dob).slice(0, 10) : "",
          gender: p?.gender ?? "",
          bio: p?.bio ?? "",
          avatarUri: p?.avatarUri ?? "",
        });
      } catch (err) {
        if (!mounted) return;

        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load profile";

        setServerError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setSuccessMsg("");
    setServerError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSuccessMsg("");
    setServerError("");

    const currentErrors = validate(form);
    if (Object.keys(currentErrors).length) return;

    if (!userId) {
      setServerError("Missing userId. Please login again.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim() || null,
        dob: form.dob || null,
        gender: form.gender || null,
        bio: form.bio?.trim() || null,
        avatarUri: form.avatarUri?.trim() || null,
      };

      const updated = await profileService.updateByUserId(userId, payload);
      const updatedProfile = updated?.profile ?? updated;

      setProfile(updatedProfile);
      setSuccessMsg("Profile updated successfully ✅");
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  function resetToSaved() {
    setSuccessMsg("");
    setServerError("");
    setForm({
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      username: profile?.username ?? "",
      dob: profile?.dob ? String(profile.dob).slice(0, 10) : "",
      gender: profile?.gender ?? "",
      bio: profile?.bio ?? "",
      avatarUri: profile?.avatarUri ?? "",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Edit Profile</h1>
            <p className="text-gray-600 mt-1">
              Update your personal information.
            </p>
          </div>

          <div className="w-16 h-16 rounded-full bg-gray-100 border overflow-hidden flex items-center justify-center">
            {form.avatarUri ? (
              <img
                src={form.avatarUri}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <span className="text-gray-500 text-sm">No photo</span>
            )}
          </div>
        </div>

        {(serverError || successMsg) && (
          <div className="mt-4">
            {serverError && (
              <div className="p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
                {serverError}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-md bg-green-50 text-green-700 border border-green-200">
                {successMsg}
              </div>
            )}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              error={errors.firstName}
              required
            />
            <Field
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              error={errors.lastName}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Username"
              name="username"
              value={form.username}
              onChange={onChange}
              error={errors.username}
              placeholder="e.g. abdifatah09"
            />
            <Field
              label="Date of birth"
              name="dob"
              value={form.dob}
              onChange={onChange}
              error={errors.dob}
              type="date"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={onChange}
                className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Avatar URL"
              name="avatarUri"
              value={form.avatarUri}
              onChange={onChange}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio <span className="text-gray-500">(max 250)</span>
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={onChange}
              rows={4}
              className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Write a short bio..."
            />
            <div className="flex justify-between mt-1 text-sm">
              <span className="text-red-600">{errors.bio || ""}</span>
              <span className="text-gray-500">{form.bio.length}/250</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || hasErrors}
              className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>

            <button
              type="button"
              onClick={resetToSaved}
              className="px-4 py-2 rounded-md border"
            >
              Reset
            </button>
          </div>

          {hasErrors && (
            <p className="text-sm text-gray-600">
              Fix the highlighted fields to save.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10 ${
          error ? "border-red-400" : ""
        }`}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
