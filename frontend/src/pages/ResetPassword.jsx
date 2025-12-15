import React, { useState } from "react";
import { authService } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import { isValidEmail, validatePassword } from "../utils/validators";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    const errors = {};

    if (!email) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

    const pwErrors = validatePassword(newPassword, { min: 8 });
    if (!newPassword) errors.newPassword = "Password is required.";
    else if (pwErrors.length) errors.newPassword = pwErrors[0];

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    setFieldErrors({});

    try {
      const data = await authService.resetPassword({ email, resetToken, newPassword });
      setMsg(data.message || "Password reset successful. You can now log in.");
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      setErr(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Reset password</h1>
        <p className="text-sm opacity-80 mb-4">
          Paste your reset token and set a new password.
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

          <input
            className="w-full border rounded-lg p-3"
            placeholder="Reset token"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-3"
            placeholder="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}

          <button className="w-full border rounded-lg p-3 font-medium" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="text-sm mt-4">
          <Link className="underline" to="/forgot-password">
            Need a token?
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
