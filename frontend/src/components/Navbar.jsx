import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="border-b p-4 flex items-center justify-between">
      <Link className="font-semibold" to="/">
        Home
      </Link>

      <div className="flex gap-3 items-center">
        {user ? (
          <>
            <Link className="underline" to="/dashboard">Dashboard</Link>
            <Link className="underline" to="/profile">Profile</Link>
            <button className="underline" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="underline" to="/login">Login</Link>
            <Link className="underline" to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
