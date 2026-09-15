import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, X, Sparkles, BookOpen, Lightbulb, HelpCircle, Quote } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState({ name: 'Screenshot (69).png', size: '397.6 KB' });
  const [options, setOptions] = useState({
    summary: false,
    flashcards: true,
    explain: true,
    qa: false,
    sources: true,
  });
  const [course, setCourse] = useState('');
  const [tags, setTags] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleOption = (key) => setOptions((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleUploadSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/library');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#07111E] text-white flex flex-col items-center py-10 px-4">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Upload your study materials</h1>
          <p className="text-xs text-gray-400">PDFs, images, audio, or text - we'll turn them into knowledge.</p>
        </div>

        {/* Drag & Drop Zone */}
        <div className="border border-dashed border-cyan-800/80 rounded-2xl p-8 bg-[#091728]/60 flex flex-col items-center justify-center space-y-4">
          {/* File category icons */}
          <div className="flex gap-3">
            <span className="p-3 bg-red-900/30 border border-red-500/40 rounded-xl text-red-400 text-xs">PDF</span>
            <span className="p-3 bg-yellow-900/30 border border-yellow-500/40 rounded-xl text-yellow-400 text-xs">AUDIO</span>
            <span className="p-3 bg-green-900/30 border border-green-500/40 rounded-xl text-green-400 text-xs">IMG</span>
            <span className="p-3 bg-blue-900/30 border border-blue-500/40 rounded-xl text-blue-400 text-xs">DOC</span>
          </div>

          <UploadCloud className="w-10 h-10 text-cyan-400 animate-bounce" />
          
          <div className="text-center">
            <p className="text-xs font-semibold">Drag & drop your files here</p>
            <p className="text-xs text-cyan-400 font-medium underline cursor-pointer">or Click to browse</p>
            <span className="text-[10px] text-gray-500 block mt-1">Max size: 20MB per file. Multiple files supported.</span>
          </div>

          {/* Format pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['Text files', 'Audio (MP3, WAV)', 'Images (PNG, JPG)', 'PDF'].map((fmt, i) => (
              <span key={i} className="text-[11px] bg-[#112338] border border-cyan-900/60 px-3 py-1 rounded-lg text-gray-300">
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {/* Uploaded File Pill */}
        {selectedFile && (
          <div className="bg-white text-gray-900 rounded-xl p-3 flex items-center justify-between shadow">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-green-600" />
              <div>
                <p className="text-xs font-bold">{selectedFile.name}</p>
                <p className="text-[10px] text-gray-500">{selectedFile.size}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Processing Options Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-brand-accent tracking-wider uppercase border-b border-brand-accent/40 inline-block pb-0.5">
            Processing Options
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'summary', title: 'Generate summary', desc: 'AI-powered overview of key points', icon: BookOpen },
              { id: 'flashcards', title: 'Create flashcards', desc: 'Automatic Q&A cards for studying', icon: Sparkles },
              { id: 'explain', title: 'Explain concepts', desc: 'Break down complex topics', icon: Lightbulb },
              { id: 'qa', title: 'Answer Question', desc: 'Ask questions about this material', icon: HelpCircle },
              { id: 'sources', title: 'Sources included', desc: 'Show sources for answers', icon: Quote },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    options[opt.id]
                      ? 'bg-white text-gray-900 border-white'
                      : 'bg-[#0E2034] text-gray-300 border-cyan-900/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={options[opt.id] || false}
                    onChange={() => {}}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.title}</span>
                    </div>
                    <p className={`text-[10px] ${options[opt.id] ? 'text-gray-600' : 'text-gray-400'}`}>{opt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Organization / Course Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-brand-accent tracking-wider uppercase border-b border-brand-accent/40 inline-block pb-0.5">
            Organization (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-300 block mb-1">Subject / Course</label>
              <input
                type="text"
                placeholder="Select or type a course name"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full bg-[#0E2034] border border-cyan-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-300 block mb-1">Tags</label>
              <input
                type="text"
                placeholder="Add keywords to find this later"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-[#0E2034] border border-cyan-900/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-accent"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-2 space-y-2">
          <button
            onClick={handleUploadSubmit}
            disabled={isProcessing}
            className="w-full py-3 bg-[#BE9E44] hover:bg-brand-accent text-gray-950 font-bold rounded-xl text-sm transition shadow-lg disabled:opacity-50"
          >
            {isProcessing ? 'Vectorizing and Indexing Material...' : 'Add To Your Library'}
          </button>
          <span className="text-[10px] text-yellow-300 block">» Results will be generated automatically</span>
        </div>

        {/* Footnote */}
        <div className="flex justify-between text-[9px] text-gray-400 border-t border-gray-800 pt-3">
          <span>🔒 Private and secure</span>
          <span>🧠 Used only to build your Second Brain</span>
          <span>🗑️ You can delete files anytime</span>
        </div>

      </div>
    </div>
  );
}