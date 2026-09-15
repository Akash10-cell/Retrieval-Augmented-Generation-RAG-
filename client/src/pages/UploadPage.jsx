import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, X } from 'lucide-react';
import { askAboutDocument, storeDocument } from '../lib/api';
import { saveRagResult } from '../lib/storage';
import { useAuth } from '../context/AuthContext';

export default function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [question, setQuestion] = useState('');

  const handleFileSelection = (file) => {
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setSelectedFile(null);
      setUploadError('That file is larger than the 20 MB limit. Please choose a smaller file.');
      return;
    }

    setSelectedFile({
      file,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    });
    setUploadError('');
  };

  const handleFileInput = (event) => {
    handleFileSelection(event.target.files[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFileSelection(event.dataTransfer.files[0]);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setUploadError('Choose a file before asking a question.');
      return;
    }

    if (!question.trim()) {
      setUploadError('Enter a question about the selected material.');
      return;
    }

    setIsProcessing(true);
    setUploadError('');

    try {
      const storedDocument = await storeDocument(selectedFile.file, user.email);
      const result = await askAboutDocument(selectedFile.file, question.trim());
      saveRagResult(user.email, {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.file.type || 'document',
        storageId: storedDocument.id,
        question: question.trim(),
        result,
      });
      setIsProcessing(false);
      navigate('/library', { state: { result, fileName: selectedFile.name } });
    } catch (error) {
      setIsProcessing(false);
      setUploadError(error.message || 'Unable to connect to the RAG backend.');
    }
  };

  return (
    <div className="min-h-screen bg-[#07111E] text-white flex flex-col items-center py-10 px-4">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Upload your study materials</h1>
          <p className="text-xs text-gray-400">Upload a supported document and ask the RAG pipeline a question.</p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          className="border border-dashed border-cyan-800/80 rounded-2xl p-8 bg-[#091728]/60 flex flex-col items-center justify-center space-y-4"
        >
          {/* File category icons */}
          <div className="flex gap-3">
            <span className="p-3 bg-red-900/30 border border-red-500/40 rounded-xl text-red-400 text-xs">PDF</span>
            <span className="p-3 bg-green-900/30 border border-green-500/40 rounded-xl text-green-400 text-xs">IMG</span>
            <span className="p-3 bg-blue-900/30 border border-blue-500/40 rounded-xl text-blue-400 text-xs">DOC</span>
          </div>

          <UploadCloud className="w-10 h-10 text-cyan-400 animate-bounce" />
          
          <div className="text-center">
            <p className="text-xs font-semibold">Drag & drop your file here</p>
            <label htmlFor="file-upload" className="text-xs text-cyan-400 font-medium underline cursor-pointer">or click to browse</label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
              onChange={handleFileInput}
              className="sr-only"
            />
            <span className="text-[10px] text-gray-500 block mt-1">Max size: 20MB. PDF, DOCX, TXT, PNG, and JPG.</span>
          </div>

          {/* Format pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['Text files', 'DOCX', 'Images (PNG, JPG)', 'PDF'].map((fmt, i) => (
              <span key={i} className="text-[11px] bg-[#112338] border border-cyan-900/60 px-3 py-1 rounded-lg text-gray-300">
                {fmt}
              </span>
            ))}
          </div>
        </div>

        {uploadError && <p className="text-xs text-red-300 bg-red-900/30 border border-red-500/30 rounded-lg p-3">{uploadError}</p>}

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

        <div className="space-y-2">
          <label htmlFor="question" className="text-[11px] text-gray-300 block">Question for the RAG pipeline</label>
          <textarea
            id="question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="What is the main idea of this document?"
            rows={3}
            className="w-full bg-[#0E2034] border border-cyan-900/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent resize-y"
          />
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