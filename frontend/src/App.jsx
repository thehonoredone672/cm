import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Profile/Profile";
import Skills from "./pages/Skills/Skills";
import Interests from "./pages/Interests/Interests";
import Matches from "./pages/Matches/Matches";
import ReceivedInvites from "./pages/Invites/ReceivedInvites";
import SentInvites from "./pages/Invites/SentInvites";
import Chat from "./pages/Chat/Chat";
import TeamsList from "./pages/Teams/TeamsList";
import TeamDetails from "./pages/Teams/TeamDetails";
import ProblemList from "./pages/Problems/ProblemList";
import ProblemDetails from "./pages/Problems/ProblemDetails";
import ProblemSolve from "./pages/Problems/ProblemSolve";
import AdminProblems from "./pages/Problems/AdminProblems";
import Ecosystem from "./pages/Ecosystem/Ecosystem";
import AdminDashboard from "./pages/Admin/AdminDashboard";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/skills"
          element={
              <ProtectedRoute>
                  <MainLayout>
                      <Skills/>
                  </MainLayout>
              </ProtectedRoute>
          }
        />

        <Route
          path="/interests"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Interests />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Matches />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invites/received"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ReceivedInvites />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invites/sent"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SentInvites />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Chat />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TeamsList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TeamDetails />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProblemList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProblemDetails />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems/:id/solve"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProblemSolve />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems/admin"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminProblems />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ecosystem"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Ecosystem />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
