import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import VerifyEmail from "../pages/VerifyEmail";
import AdminRoute from "./AdminRoute";
import AdminCurriculum from "../pages/AdminCurriculum";
import Home from "../pages/Home";
import ProgressOverview from "../pages/ProgressOverview";
import SubjectsProgress from "../pages/SubjectsProgress";
import SubjectDetail from "../pages/SubjectDetail";
import DifficultiesProgress from "../pages/DifficultiesProgress";
import DifficultyDetail from "../pages/DifficultyDetail";
import SectionsProgress from "../pages/SectionsProgress";
import SectionDetail from "../pages/SectionDetail";
import ProgressByChallenge from "../pages/ProgressByChallenge";



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/progress" element={<ProgressOverview />} />
      <Route path="/progress/subjects" element={<SubjectsProgress />} />
      <Route path="/progress/subjects/:subjectId" element={<SubjectDetail />} />
      <Route path="/progress/difficulties" element={<DifficultiesProgress />}/>
      <Route path="/progress/difficulties/:difficultyId" element={<DifficultyDetail />} />
      <Route path="/progress/sections" element={<SectionsProgress />} />
      <Route path="/progress/sections/:sectionId" element={<SectionDetail />} />
      <Route path="/progress/challenges" element={<ProgressByChallenge />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      /> 
      <Route path="/verify-email" element={<VerifyEmail />} />
       
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/curriculum"
        element={
         <AdminRoute>
            <AdminCurriculum />
         </AdminRoute>
        }
      />

    </Routes>
  );
}
