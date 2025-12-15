import React, { useState } from "react";
import { authService } from "../services/authService";
import { Link } from "react-router-dom";
import { isValidEmail } from "../utils/validators";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});


  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setResetToken("");
    setLoading(true);

    const errors = {};

    if (!email) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    setFieldErrors({});

    try {
      const data = await authService.forgotPassword({ email });
      setMsg(data.message || "If the email exists, a reset token has been created.");

      if (data.resetToken) setResetToken(data.resetToken);
    } catch (error) {
      setErr(error?.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Forgot password</h1>
        <p className="text-sm opacity-80 mb-4">
          Enter your email and we’ll generate a reset token (MVP).
        </p>

        {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
        {msg && <div className="mb-3 text-sm text-green-700">{msg}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            className="w-full border rounded-lg p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
          <button className="w-full border rounded-lg p-3 font-medium" disabled={loading}>
            {loading ? "Sending..." : "Generate reset token"}
          </button>
        </form>

        {resetToken && (
          <div className="mt-4 border rounded-lg p-3">
            <p className="text-sm font-medium mb-2">Reset token (MVP)</p>
            <code className="text-xs break-all">{resetToken}</code>
            <p className="text-xs opacity-70 mt-2">
              Copy this token and go to Reset Password page.
            </p>
          </div>
        )}

        <p className="text-sm mt-4">
          <Link className="underline" to="/reset-password">
            Go to Reset Password
          </Link>
          {" · "}
          <Link className="underline" to="/login">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
