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

      </Routes>
    </BrowserRouter>
  );
}

export default App;
