import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, X, Plus, BrainCircuit, Send, Image, Pencil, Globe } from 'lucide-react';
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
    <div className="upload-page min-h-screen bg-[#07111E] text-white flex flex-col items-center px-4">
      <main className="upload-workspace w-full max-w-3xl">
        <div className="upload-welcome text-center">
          <div className="upload-welcome-icon"><BrainCircuit className="w-5 h-5" /></div>
          <h1 className="text-3xl font-semibold tracking-tight">Ready when you are.</h1>
          <p className="text-sm text-gray-400 mt-2">Add a document, ask a question, and build your Second Brain.</p>
        </div>

        {/* Chat-style composer and drop target */}
        <div
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          className="upload-composer"
        >
          <div className="upload-composer-row">
            <label htmlFor="file-upload" className="upload-icon-button" title="Attach a document" aria-label="Attach a document">
              <Plus className="w-5 h-5" />
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.docx"
              onChange={handleFileInput}
              className="sr-only"
            />
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask anything about your document"
              rows={1}
              className="upload-question"
            />
            <span className="upload-mode"><BrainCircuit className="w-4 h-4" /> Think</span>
            <button
              onClick={handleUploadSubmit}
              disabled={isProcessing}
              className="upload-send"
              title="Ask and add document"
              aria-label="Ask and add document"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="upload-composer-hint">
            <UploadCloud className="w-4 h-4" />
            <span>Drop a file here or click <label htmlFor="file-upload" className="text-cyan-400 cursor-pointer">+</label> to browse</span>
          </div>
        </div>

        {uploadError && <p className="upload-error">{uploadError}</p>}

        {/* Uploaded File Pill */}
        {selectedFile && (
          <div className="upload-file-chip">
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

        <div className="upload-shortcuts">
          <span><Image className="w-4 h-4" /> First upload your document</span>
          <span><Pencil className="w-4 h-4" /> Write your instruction...!</span>
          <span><Globe className="w-4 h-4" /> Get the best response</span>
        </div>

        {/* Footnote */}
        <div className="upload-footnote">
          <span>Private and secure</span>
          <span>Used only to build your Second Brain</span>
          <span>You can delete files anytime</span>
        </div>

      </main>
    </div>
  );
}