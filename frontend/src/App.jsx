import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { ResumeUploadPage } from './pages/ResumeUploadPage';
import { JobListingPage } from './pages/JobListingPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { RecommendedJobsPage } from './pages/RecommendedJobsPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { PostJobPage } from './pages/PostJobPage';
import { ManageJobsPage } from './pages/ManageJobsPage';
import { ApplicantsPage } from './pages/ApplicantsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage initialRole="student" />} />
            <Route path="register/student" element={<RegisterPage initialRole="student" />} />
            <Route path="register/recruiter" element={<RegisterPage initialRole="recruiter" />} />
            <Route path="jobs" element={<JobListingPage />} />
            <Route path="jobs/:id" element={<JobDetailPage />} />

            {/* Student Protected Routes */}
            <Route
              path="student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/resume-upload"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ResumeUploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/recommendations"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <RecommendedJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="student/applications"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <MyApplicationsPage />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Protected Routes */}
            <Route
              path="recruiter/dashboard"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruiter/post-job"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <PostJobPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruiter/jobs"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <ManageJobsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="recruiter/jobs/:id/applicants"
              element={
                <ProtectedRoute allowedRoles={['recruiter']}>
                  <ApplicantsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
