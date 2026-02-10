import React from "react";
import { NavLink } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand */}
          <div>
            <h3 className="font-semibold text-lg">HackPath</h3>
            <p className="mt-3 text-sm text-white/70">
              A structured learning platform to guide students through coding
              challenges from beginner to advanced.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide">
              Platform
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <NavLink to="/" className="text-white/70 hover:text-white">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/dashboard" className="text-white/70 hover:text-white">
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/progress" className="text-white/70 hover:text-white">
                  Progress
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide">
              Account
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <NavLink to="/login" className="text-white/70 hover:text-white">
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className="text-white/70 hover:text-white">
                  Register
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className="text-white/70 hover:text-white">
                  Profile
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide">
              Project
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>Final Year Project</li>
              <li>University Coursework</li>
              <li>Educational Use Only</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wide">
             My Personal Links
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li> <a href="https://github.com/Abdifatah09">GitHub : Abdifatah09</a></li>
              <li> <a href="https://www.linkedin.com/in/abdifatah-abdi-mohamed-a419b92a2/">LinkedIn</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/50 text-center">
          © {new Date().getFullYear()} HackPath. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
