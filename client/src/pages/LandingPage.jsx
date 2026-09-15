import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="page-landing min-h-screen bg-[#06101E] text-white flex flex-col items-center px-4 pb-20">
      {/* Hero Section */}
      <section className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-16">
        {/* Glow Brain Illustration Box */}
        <div className="flex justify-center items-center relative">
          <div className="w-80 h-80 rounded-full bg-cyan-500/10 absolute blur-3xl -z-0"></div>
          <div className="w-72 h-72 border border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0e2238] to-[#081524] shadow-2xl relative z-10">
            <span className="text-6xl animate-pulse">🧠</span>
            <div className="mt-4 text-center">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">AI Neural Core</span>
              <p className="text-xs text-gray-400 mt-1">Ready for indexing & citation extraction</p>
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="italic font-serif font-light text-cyan-300">Your</span> <br />
            <span className="text-brand-accent">Second Brain</span> <br />
            <span className="text-white text-3xl md:text-4xl font-semibold">for studying</span>
          </h1>

          <p className="text-gray-300 text-sm leading-relaxed max-w-md">
            Upload your study materials, ask questions & get answers with exact citations directly from your files.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-gray-200">
              <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
              <span>Works with PDFs, images, and Docx.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-200">
              <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
              <span>Simple answers you can trust.</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-200">
              <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
              <span>Every answer has a clear source.</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block bg-gradient-to-r from-gray-200 to-gray-400 text-gray-900 font-bold px-8 py-2.5 rounded-full hover:brightness-110 shadow-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Card Section */}
      <section className="max-w-3xl w-full bg-[#0B1A2C] border border-cyan-950/60 rounded-2xl p-8 space-y-8 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-brand-accent">Why Second Brain?</h2>
          <p className="text-xs text-gray-300 max-w-lg mx-auto">
            Second Brain helps you understand and organize your content in one place. Instead of searching and reading for hours, just upload your materials and ask.
          </p>
        </div>

        <div className="text-center space-y-3">
          <h3 className="text-sm font-semibold tracking-wider text-brand-accent border-b border-brand-accent/30 inline-block pb-1">
            You'll get :
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-200">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-accent" /> Clear summaries</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-accent" /> Ready-to-use flashcards</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-brand-accent" /> Accurate answers with sources</span>
          </div>
        </div>

        {/* How It Works Card */}
        <div className="bg-[#D9DFE8] text-gray-900 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="md:col-span-1 border-r-0 md:border-r border-gray-400/40 pr-4">
            <h4 className="text-xl font-bold">How it works :</h4>
            <span className="text-xs text-gray-600 italic">(Very simple)</span>
          </div>
          <ol className="md:col-span-2 space-y-2 text-xs font-semibold text-gray-800 list-decimal pl-4">
            <li>Upload your files (PDF, image, or Docx)</li>
            <li>We read and understand your content</li>
            <li>Ask any question</li>
            <li>Get answers with links to the original file</li>
          </ol>
        </div>

        {/* Trust & Confidence */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-1 text-xs text-brand-accent border-b border-brand-accent/30 pb-0.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Trust & Confidence
          </div>
          <p className="text-[11px] text-gray-400 max-w-md mx-auto">
            Second Brain uses only your uploaded files. No random answers. Every answer shows exactly where it comes from.
          </p>
        </div>
      </section>
    </div>
  );
}