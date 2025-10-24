import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
// import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import ExamsPage from "./pages/ExamsPage";
import ExamPlayerPage from "./pages/ExamPlayerPage";
import ExamResultPage from "./pages/ExamResultPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import AssignmentPlayerPage from "./pages/AssignmentPlayerPage";
import AssignmentResultPage from "./pages/AssignmentResultPage";
import NotesPage from "./pages/NotesPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import ManageCoursesPage from "./pages/ManageCoursesPage";
import AdminCourseDetailPage from "./pages/AdminCourseDetailPage";
import AdminExamDetailPage from "./pages/AdminExamDetailPage";
import AdminAssignmentDetailPage from "./pages/AdminAssignmentDetailPage"; // Added import
import SubscriptionsPage from "./pages/SubscriptionsPage"; // Added import

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/courses/manage" element={
              <ProtectedRoute>
                <ManageCoursesPage />
              </ProtectedRoute>
            } />
            <Route path="/courses/new" element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            } />
            <Route path="/courses/subscribed" element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            } />
            <Route path="/courses/free" element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            } />
            <Route path="/courses/:id" element={
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/courses/:id" element={
              <ProtectedRoute>
                <AdminCourseDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/exams/:id" element={
              <ProtectedRoute>
                <AdminExamDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/assignments/:id" element={
              <ProtectedRoute>
                <AdminAssignmentDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/subscriptions" element={
              <ProtectedRoute>
                <SubscriptionsPage />
              </ProtectedRoute>
            } />
            <Route path="/exams/:id/take" element={
              <ProtectedRoute>
                <ExamPlayerPage />
              </ProtectedRoute>
            } />
            <Route path="/exams/:id/result" element={
              <ProtectedRoute>
                <ExamResultPage />
              </ProtectedRoute>
            } />
            <Route path="/exams/*" element={
              <ProtectedRoute>
                <ExamsPage />
              </ProtectedRoute>
            } />
            <Route path="/assignments/:id/take" element={
              <ProtectedRoute>
                <AssignmentPlayerPage />
              </ProtectedRoute>
            } />
            <Route path="/assignments/:id/result" element={
              <ProtectedRoute>
                <AssignmentResultPage />
              </ProtectedRoute>
            } />
            <Route path="/assignments" element={
              <ProtectedRoute>
                <AssignmentsPage />
              </ProtectedRoute>
            } />
            <Route path="/notes" element={
              <ProtectedRoute>
                <NotesPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;