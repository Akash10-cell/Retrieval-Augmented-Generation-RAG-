import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-brand-dark/80 backdrop-blur sticky top-0 z-50 border-b border-gray-800">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wider">
        <BrainCircuit className="text-brand-accent w-7 h-7" />
        <span className="text-white font-extrabold">2nd</span>
        <span className="text-brand-accent font-black tracking-widest">BR<span className="text-cyan-400">@</span>IN</span>
      </Link>

      <nav className="flex items-center gap-6 text-sm font-medium text-gray-300">
        <Link to="/library" className="hover:text-brand-accent transition">My Library</Link>
        <Link to="/upload" className="text-brand-accent font-semibold hover:underline">Upload Material</Link>
        <Link to="/chat" className="hover:text-brand-accent transition">ChatBot</Link>
        <Link to="/about" className="hover:text-brand-accent transition">About us</Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 border border-gray-700 px-2 py-1 rounded">Hi, {user.name}</span>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="text-xs bg-red-600/20 text-red-400 hover:bg-red-600/40 px-3 py-1.5 rounded transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-brand-accent/20 border border-brand-accent text-brand-accent px-4 py-1.5 rounded-full hover:bg-brand-accent hover:text-black transition"
          >
            Login / SignUp
          </Link>
        )}
      </nav>
    </header>
  );
}