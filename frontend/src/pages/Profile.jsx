import { useEffect, useState } from "react";
import { api } from "../services/api"; 
import { profileService } from "../services/profileService"; 

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);

  const [isNewProfile, setIsNewProfile] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    dob: "",
    gender: "",
    bio: "",
    avatarUri: "",
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      try {

        const meRes = await api.get("/auth/me");
        const meUserId = meRes?.data?.user?.id ?? meRes?.data?.id;

        if (!meUserId) {
          throw new Error("Could not find userId from /auth/me response.");
        }
        if (!mounted) return;
        setUserId(meUserId);

        let profData;
        try {
          profData = await profileService.me();
          if (!mounted) return;
          setIsNewProfile(false);
        } catch (err) {
          const status = err?.response?.status;
          const message = err?.response?.data?.message || "";

          const notFound =
            status === 404 ||
            /not found/i.test(message) ||
            /no profile/i.test(message);

          if (!notFound) throw err;

          profData = await profileService.create({
            firstName: "",
            lastName: "",
            username: null,
            dob: null,
            gender: null,
            bio: null,
            avatarUri: null,
          });

          if (!mounted) return;
          setIsNewProfile(true);
        }

        const resolvedProfile = profData?.profile ?? profData;

        if (!mounted) return;
        setProfile(resolvedProfile);

        setForm({
          firstName: resolvedProfile?.firstName ?? "",
          lastName: resolvedProfile?.lastName ?? "",
          username: resolvedProfile?.username ?? "",
          dob: resolvedProfile?.dob ? String(resolvedProfile.dob).slice(0, 10) : "",
          gender: resolvedProfile?.gender ?? "",
          bio: resolvedProfile?.bio ?? "",
          avatarUri: resolvedProfile?.avatarUri ?? "",
        });
      } catch (e) {
        console.error(e);
        if (!mounted) return;

        const msg =
          e?.response?.data?.message ||
          e?.message ||
          "Something went wrong loading your profile.";
        setError(msg);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!userId) {
      setError("Missing userId. Please refresh and try again.");
      return;
    }

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username?.trim() || null,
        dob: form.dob || null,
        gender: form.gender || null,
        bio: form.bio?.trim() || null,
        avatarUri: form.avatarUri?.trim() || null,
      };

      const updated = await profileService.updateByUserId(userId, payload);
      const resolvedProfile = updated?.profile ?? updated;

      setProfile(resolvedProfile);

      setIsNewProfile(false);
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to save profile. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-600">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {isNewProfile ? "Create Profile" : "Update Profile"}
        </h1>
        <p className="text-sm text-gray-600">
          {isNewProfile
            ? "Complete your details to finish creating your profile."
            : "Update your profile details below."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              className="w-full border rounded-lg p-2"
              placeholder="First name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              className="w-full border rounded-lg p-2"
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            className="w-full border rounded-lg p-2"
            placeholder="username (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={form.dob}
              onChange={onChange}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={onChange}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={onChange}
            className="w-full border rounded-lg p-2 min-h-[110px]"
            placeholder="Write something about yourself…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Avatar URL</label>
          <input
            name="avatarUri"
            value={form.avatarUri}
            onChange={onChange}
            className="w-full border rounded-lg p-2"
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">
            {profile?.id ? `Profile ID: ${profile.id}` : ""}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : isNewProfile
              ? "Create"
              : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
