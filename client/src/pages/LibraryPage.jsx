import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, HelpCircle, Wrench, Upload, Search, Trash2, Eye, CheckCircle2, Loader2, BarChart2, MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addConversation, deleteUserDocument, getUserData } from '../lib/storage';
import { askAboutDocument, deleteStoredDocument, getDocumentDownloadUrl, getStoredDocumentFile } from '../lib/api';

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const { state } = useLocation();
  const { user } = useAuth();
  const userData = getUserData(user.email);
  const [documents, setDocuments] = useState(userData.documents);
  const [conversations, setConversations] = useState(userData.conversations);
  const [activeDocument, setActiveDocument] = useState(null);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [conversationError, setConversationError] = useState('');

  const filteredDocs = documents.filter(doc => doc.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (document) => {
    if (document.storageId) {
      try {
        await deleteStoredDocument(document.storageId, user.email);
      } catch {
        return;
      }
    }

    deleteUserDocument(user.email, document.id);
    setDocuments((currentDocuments) => currentDocuments.filter((item) => item.id !== document.id));
    setConversations((currentConversations) => currentConversations.filter((item) => item.documentId !== document.id));
    if (activeDocument?.id === document.id) {
      setActiveDocument(null);
    }
  };

  const handleContinue = (document) => {
    setActiveDocument(document);
    setQuestion('');
    setConversationError('');
  };

  const handleAsk = async (event) => {
    event.preventDefault();
    if (!activeDocument || !question.trim()) return;

    setIsAsking(true);
    setConversationError('');
    try {
      const file = await getStoredDocumentFile(activeDocument.storageId, user.email, activeDocument.title);
      const result = await askAboutDocument(file, question.trim());
      const conversation = addConversation(user.email, {
        documentId: activeDocument.id,
        fileName: activeDocument.title,
        question: question.trim(),
        result,
      });
      setConversations((currentConversations) => [conversation, ...currentConversations]);
      setQuestion('');
    } catch (error) {
      setConversationError(error.message || 'Unable to continue this conversation.');
    } finally {
      setIsAsking(false);
    }
  };

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
              {documents.slice(0, 2).map((document) => (
                <div key={document.id} className="p-2 bg-[#0c1c2e] rounded-lg border border-cyan-950 text-[11px] flex justify-between items-center">
                  <span className="truncate max-w-[120px] text-gray-300">{document.title}</span>
                  <span className="text-[9px] text-green-400">Saved</span>
                </div>
              ))}
              {documents.length === 0 && <span className="text-[11px] text-gray-500 px-2">No uploads yet</span>}
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

        {state?.result && (
          <section className="bg-[#0B1A2C] border border-cyan-800/70 rounded-2xl p-5 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-cyan-400">RAG answer</p>
              <h2 className="text-sm font-bold text-white mt-1">{state.fileName}</h2>
            </div>
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{state.result.answer}</p>
            {state.result.citations?.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-gray-500">Sources</p>
                {state.result.citations.map((citation) => (
                  <p key={citation.chunk_id} className="text-[11px] text-gray-400 border-l-2 border-cyan-700 pl-3">
                    {citation.text_snippet}
                  </p>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Analytics Card */}
        <div className="analytics-card text-gray-950 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-xl">
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
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-700"></span> Docx: 45%</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-600"></span> Images: 20%</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Text File: 25%</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600"></span> PDF: 10%</div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider block">Total Index</span>
            <span className="text-3xl font-black">{documents.length} Files</span>
          </div>
        </div>

        {conversations.length > 0 && (
          <section className="bg-[#0B1A2C] border border-cyan-950 rounded-2xl p-5 space-y-3">
            <div>
              <h2 className="text-sm font-bold text-white">Conversation history</h2>
              <p className="text-[11px] text-gray-400">Saved for this account</p>
            </div>
            {conversations.slice(0, 5).map((conversation) => (
              <div key={conversation.id} className="border-t border-cyan-950/60 pt-3 space-y-1">
                <p className="text-[11px] text-cyan-300">{conversation.fileName}</p>
                <p className="conversation-question text-xs"><span className="font-semibold">Q:</span> {conversation.question}</p>
                <p className="conversation-answer text-xs"><span className="font-semibold">A:</span> {conversation.answer}</p>
              </div>
            ))}
          </section>
        )}

        {activeDocument && (
          <section className="bg-[#0B1A2C] border border-cyan-700 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-cyan-400">Continue conversation</p>
                <h2 className="text-sm font-bold text-white mt-1">{activeDocument.title}</h2>
              </div>
              <button onClick={() => setActiveDocument(null)} className="text-gray-500 hover:text-white" aria-label="Close conversation">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3">
              {conversations.filter((conversation) => conversation.documentId === activeDocument.id).map((conversation) => (
                <div key={conversation.id} className="border-t border-cyan-950/60 pt-3 space-y-1">
                  <p className="conversation-question text-xs"><span className="font-semibold">Q:</span> {conversation.question}</p>
                  <p className="conversation-answer text-xs whitespace-pre-wrap"><span className="font-semibold">A:</span> {conversation.answer}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a follow-up question..."
                disabled={isAsking}
                className="flex-1 bg-[#0E2034] border border-cyan-900/60 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-accent disabled:opacity-60"
              />
              <button type="submit" disabled={isAsking || !question.trim()} className="px-3 rounded-xl bg-[#D1B860] text-gray-950 disabled:opacity-40" aria-label="Send question">
                {isAsking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            {conversationError && <p className="text-xs text-red-300">{conversationError}</p>}
          </section>
        )}

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
                <button
                  onClick={() => doc.storageId && window.open(getDocumentDownloadUrl(doc.storageId, user.email), '_blank', 'noopener,noreferrer')}
                  disabled={!doc.storageId}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12253B] hover:bg-cyan-900/40 rounded-lg text-xs font-semibold text-cyan-300 transition disabled:opacity-40"
                >
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button
                  onClick={() => handleContinue(doc)}
                  disabled={!doc.storageId}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#12253B] hover:bg-cyan-900/40 rounded-lg text-xs font-semibold text-cyan-300 transition disabled:opacity-40"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Chat
                </button>
                <button onClick={() => handleDelete(doc)} className="p-1.5 text-gray-500 hover:text-red-400 transition" aria-label={`Delete ${doc.title}`}>
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