import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import UploadPage from './pages/UploadPage';
import LibraryPage from './pages/LibraryPage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-[#07111E] text-white flex flex-col">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
                <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
                {/* Fallback to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;