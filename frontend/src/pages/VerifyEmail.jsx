import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const {
    pendingVerifyEmail,
    verifyEmail,
    clearPendingVerifyEmail,
    setPendingVerifyEmail,
  } = useAuth();

  const [email, setEmail] = useState(pendingVerifyEmail || "");
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (pendingVerifyEmail && pendingVerifyEmail !== email) {
      setEmail(pendingVerifyEmail);
    }
  }, [pendingVerifyEmail]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    const finalEmail = (email || "").trim();
    const finalCode = (code || "").trim();

    if (!finalEmail) {
      setErr("Missing email. Please register again.");
      return;
    }

    if (finalCode.length !== 6) {
      setErr("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      setPendingVerifyEmail(finalEmail);
      await verifyEmail({ email: finalEmail, code: finalCode });
      setSuccess("Email verified! Redirecting to login...");
      clearPendingVerifyEmail();
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      setErr(error?.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-1">Verify your email</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter the 6-digit code we sent to your email address.
        </p>

        {err && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {success && (
          <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="w-full border rounded-lg p-3 bg-gray-50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              If this is wrong, correct it and verify again.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Verification code
            </label>
            <input
              inputMode="numeric"
              className="w-full border rounded-lg p-3 tracking-widest text-center text-lg"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              maxLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Code expires in about 10 minutes.
            </p>
          </div>

          <button
            className="w-full rounded-lg p-3 font-medium bg-black text-white disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Verifying..." : "Verify email"}
          </button>

          <div className="flex items-center justify-between text-sm pt-1">
            <Link className="underline text-gray-700" to="/register">
              Back to register
            </Link>
            <Link className="underline text-gray-700" to="/login">
              Go to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
