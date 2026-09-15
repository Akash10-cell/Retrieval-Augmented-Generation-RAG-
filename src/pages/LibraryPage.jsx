import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, HelpCircle, Wrench, Upload, Search, Trash2, Eye, CheckCircle2, Loader2, BarChart2 } from 'lucide-react';

export default function LibraryPage() {
  const [search, setSearch] = useState('');

  const documents = [
    { id: 1, title: 'Calculus_Chapter4.pdf', type: 'pdf', status: 'Processed', size: '2.4 MB', pages: '45 pages', summary: 'Short Summary: Derivatives and limits explained with step-by-step proofs.' },
    { id: 2, title: 'Numerical_Rules.jpg', type: 'image', status: 'Processing...', size: '2.1 MB', pages: '105x768', summary: 'Short Summary: Table of numerical iteration rules and Newton-Raphson methods.' },
    { id: 3, title: 'Org_Chapter 10.mp3', type: 'audio', status: 'Processed', size: '5.4 MB', pages: '45 min', summary: 'Short Summary: Lecture recording on Computer Architecture and memory hierarchy.' },
    { id: 4, title: 'Calculus2_chapter4.mp3', type: 'audio', status: 'Processed', size: '3.1 MB', pages: '28 min', summary: 'Short Summary: Multiple integrals and coordinate transformations.' },
    { id: 5, title: 'Org_BoothRule.jpg', type: 'image', status: 'Processing...', size: '1.2 MB', pages: '1920x1080', summary: 'Short Summary: Flowchart illustrating Booths multiplication algorithm.' },
    { id: 6, title: 'Simulation_read5.pdf', type: 'pdf', status: 'Processed', size: '4.8 MB', pages: '18 pages', summary: 'Short Summary: Stochastic queue models and discrete event logs.' }
  ];

  const filteredDocs = documents.filter(doc => doc.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#07111E] text-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0A1626] border-r border-cyan-950/60 p-5 flex flex-col justify-between hidden md:flex">
        <div className="space-y-6">
          <Link to="/" className="text-xl font-bold tracking-wider text-brand-accent block">
            2nd <span className="text-white">BR@IN</span>
            <span className="text-[10px] block text-gray-400 font-normal">AI Study Assistant</span>
          </Link>

          <Link
            to="/upload"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#122438] hover:bg-cyan-950 border border-cyan-800/40 rounded-xl text-xs font-semibold transition"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Materials</span>
          </Link>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold px-2">Navigation</span>
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-[#12253B] text-brand-accent rounded-lg text-xs font-semibold">
              <BookOpen className="w-4 h-4" /> My Library
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white rounded-lg text-xs font-medium">
              <HelpCircle className="w-4 h-4" /> Ask Questions
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white rounded-lg text-xs font-medium">
              <Wrench className="w-4 h-4" /> Study Tools
            </button>
          </div>

          {/* Recent Uploads Widget */}
          <div className="space-y-2 pt-4 border-t border-cyan-950/40">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold px-2">Recent Uploads</span>
            <div className="space-y-2">
              <div className="p-2 bg-[#0c1c2e] rounded-lg border border-cyan-950 text-[11px] flex justify-between items-center">
                <span className="truncate max-w-[120px] text-gray-300">Calculus_Ch4.pdf</span>
                <span className="text-[9px] text-green-400">20 min ago</span>
              </div>
              <div className="p-2 bg-[#0c1c2e] rounded-lg border border-cyan-950 text-[11px] flex justify-between items-center">
                <span className="truncate max-w-[120px] text-gray-300">Numerical_Rules.jpg</span>
                <span className="text-[9px] text-yellow-400">1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-accent">My Library</h1>
            <p className="text-xs text-gray-400">All your notes, PDFs, and files. Explained when you need them.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-[#0D1B2A] border border-cyan-950 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent"
              />
            </div>
            <select className="bg-[#0D1B2A] border border-cyan-950 text-xs rounded-xl px-3 py-2 text-gray-300 focus:outline-none">
              <option>Sort by: Recent</option>
              <option>Sort by: Name</option>
            </select>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="bg-[#D1B860] text-gray-950 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-xl">
          <div className="flex items-center gap-6">
            {/* Donut Chart Representation */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-8 border-yellow-700 border-t-red-600 border-r-blue-600 border-l-green-600"></div>
              <BarChart2 className="w-6 h-6 absolute text-gray-900" />
            </div>

            <div>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                Analytics
              </h3>
              <div className="text-xs space-y-1 mt-2 font-semibold">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-700"></span> Audio: 45%</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-600"></span> Images: 20%</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Text File: 25%</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600"></span> PDF: 10%</div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider block">Total Index</span>
            <span className="text-3xl font-black">6 Files</span>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#0B1A2C] border border-cyan-950 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-cyan-800/60 transition shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-200 truncate max-w-[180px]">{doc.title}</span>
                  </div>
                  {doc.status === 'Processed' ? (
                    <span className="flex items-center gap-1 text-[10px] text-green-400">
                      <CheckCircle2 className="w-3 h-3" /> Processed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-yellow-400 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2">
                  {doc.summary}
                </p>
                <div className="text-[10px] text-gray-500 mt-2 flex gap-3">
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.pages}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-cyan-950/60">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12253B] hover:bg-cyan-900/40 rounded-lg text-xs font-semibold text-cyan-300 transition">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button className="p-1.5 text-gray-500 hover:text-red-400 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}