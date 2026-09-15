import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, CheckSquare, Square } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const { user, login, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/library', { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (isLogin) {
      if (!login(email, password)) {
        setError('No account found with those credentials. Sign up first or check your details.');
        return;
      }
    } else {
      if (!signup(username, email, password)) {
        setError('An account with this email already exists. Please log in.');
        return;
      }
    }
    navigate('/upload');
  };

  return (
    <div className="page-auth min-h-screen bg-[#07111E] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-[#0a1626] border border-cyan-900/40 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Form Area */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-gradient-to-b from-[#0B1A2C] to-[#07121F]">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-brand-accent">
              {isLogin ? 'Welcome back!' : 'Hello! Let’s get started'}
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              {isLogin ? 'Log in to your Second Brain' : 'Create your Second Brain and study smarter'}
            </p>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-900/30 p-2 rounded mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="Enter User name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#122438] border border-cyan-900/50 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-accent"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#122438] border border-cyan-900/50 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#122438] border border-cyan-900/50 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-accent"
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  placeholder="password confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#122438] border border-cyan-900/50 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-brand-accent"
                />
              </div>
            )}

            <div className="flex items-center gap-2 cursor-pointer pt-1" onClick={() => setRememberMe(!rememberMe)}>
              {rememberMe ? <CheckSquare className="w-3.5 h-3.5 text-brand-accent" /> : <Square className="w-3.5 h-3.5 text-gray-500" />}
              <span className="text-[11px] text-gray-300 select-none">Remember me</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#E6C665] text-[#07111E] border border-[#F4D979] hover:bg-white hover:border-white font-bold rounded-xl text-xs shadow-[0_4px_14px_rgba(230,198,101,0.2)] transition duration-150"
            >
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <p className="text-[11px] text-gray-400 mt-6 text-center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-accent underline font-semibold ml-1 cursor-pointer"
            >
              {isLogin ? 'Signup' : 'Login'}
            </button>
          </p>
        </div>

        {/* Right Graphic Preview */}
        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-[#071322] relative border-l border-cyan-950/40">
          <div className="w-64 h-64 rounded-full bg-cyan-500/10 absolute blur-2xl"></div>
          <div className="relative z-10 text-center space-y-4">
            <span className="text-7xl drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]">🧠</span>
            <div className="bg-[#0b1b2d] p-4 rounded-xl border border-cyan-800/40 text-left max-w-xs space-y-2">
              <div className="h-2 w-24 bg-cyan-400 rounded"></div>
              <div className="h-2 w-40 bg-gray-600 rounded"></div>
              <div className="h-2 w-32 bg-gray-600 rounded"></div>
            </div>
            <p className="text-xs text-gray-400 font-medium">Synced with your local vector library</p>
          </div>
        </div>

      </div>
    </div>
  );
}