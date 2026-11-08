import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Image as ImageIcon,
  FileCode,
  Trash2,
  Sparkles,
  Download,
  Eye,
  RefreshCw,
  Search,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { DocumentFile } from '../../types.ts';

export const FilesView: React.FC = () => {
  const { files, addFile, deleteFile, settings, setActiveTab, sendMessage, showToast } = useApp();
  const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isImage = file.type.startsWith('image/');

    reader.onload = () => {
      const result = reader.result as string;
      const content = isImage ? result.split(',')[1] : result;

      const newDoc: Partial<DocumentFile> = {
        name: file.name,
        size: file.size,
        type: file.type || 'text/plain',
        content
      };

      addFile(newDoc);
      showToast(`Uploaded ${file.name}`, 'success');
    };

    if (isImage) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async (file: DocumentFile) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      if (file.type.startsWith('image/')) {
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: file.content,
            mimeType: file.type,
            prompt: `Perform a comprehensive multimodal analysis of this image. Extract any text (OCR), evaluate UI/UX if it's an interface, identify syntax or logic errors if it's code, and provide actionable suggestions for ${settings.userNickname}.`
          })
        });
        const data = await res.json();
        setAnalysisResult(data.analysis || 'Analysis complete with no specific findings.');
      } else {
        const prompt = `Summarize and analyze the following document named "${file.name}":\n\n${file.content.slice(0, 4000)}\n\nProvide key takeaways, structured bullet points, and actionable next steps.`;
        const res = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userMessage: prompt })
        });
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let full = '';
        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          const chunkStr = decoder.decode(value);
          for (const line of chunkStr.split('\n\n')) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.replace('data: ', ''));
                if (parsed.chunk) full += parsed.chunk;
              } catch (e) {}
            }
          }
        }
        setAnalysisResult(full || 'Document processed.');
      }
    } catch (err: any) {
      setAnalysisResult(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-fuchsia-400" />
            <span>Files & Multimodal Intelligence</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Upload PDFs, code, text, or screenshots for OCR extraction, UI audits, and code analysis
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept=".txt,.pdf,.docx,.json,.js,.ts,.tsx,.py,.html,.css,image/*"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File or Image</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Files List */}
        <div className="glass-panel rounded-3xl p-5 space-y-4">
          <span className="font-bold text-sm text-slate-200">Indexed Files ({files.length})</span>
          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <FileCode className="w-8 h-8 mx-auto text-slate-600" />
                <p>No files uploaded yet.</p>
              </div>
            ) : (
              files.map(f => {
                const isSelected = selectedFile?.id === f.id;
                const isImg = f.type.startsWith('image/');
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setSelectedFile(f);
                      setAnalysisResult(null);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer text-xs transition-all border ${
                      isSelected
                        ? 'bg-fuchsia-600/20 text-white border-fuchsia-500/50'
                        : 'bg-slate-900/50 text-slate-300 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <div className="p-2 rounded-xl bg-slate-800 text-fuchsia-400">
                        {isImg ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold truncate">{f.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {(f.size / 1024).toFixed(1)} KB • {new Date(f.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteFile(f.id);
                        if (selectedFile?.id === f.id) setSelectedFile(null);
                      }}
                      className="p-1 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* File Detail & AI Analysis Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedFile ? (
            <div className="glass-panel-glow rounded-3xl p-6 space-y-6 border border-purple-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-900/30 gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">{selectedFile.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Type: {selectedFile.type} • Uploaded: {new Date(selectedFile.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAnalyze(selectedFile)}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-bold text-xs shadow-md disabled:opacity-50"
                  >
                    {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{selectedFile.type.startsWith('image/') ? 'Analyze Vision' : 'AI Summarize'}</span>
                  </button>
                </div>
              </div>

              {/* Preview preview */}
              <div className="max-h-72 overflow-y-auto rounded-2xl bg-slate-900/80 p-4 border border-purple-900/20">
                {selectedFile.type.startsWith('image/') ? (
                  <img
                    src={`data:${selectedFile.type};base64,${selectedFile.content}`}
                    alt="preview"
                    className="max-h-64 mx-auto rounded-xl object-contain shadow-lg"
                  />
                ) : (
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedFile.content.slice(0, 3000)}
                    {selectedFile.content.length > 3000 && '\n... [content truncated for preview]'}
                  </pre>
                )}
              </div>

              {/* Analysis Output */}
              {isAnalyzing && (
                <div className="p-8 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 text-fuchsia-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-300">
                    {settings.assistantName} is analyzing image & document features...
                  </p>
                </div>
              )}

              {analysisResult && (
                <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-fuchsia-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{settings.assistantName} Intelligence Report</span>
                    </span>
                    <button
                      onClick={() => {
                        sendMessage(`Regarding file "${selectedFile.name}": ${analysisResult.slice(0, 300)}...`);
                        setActiveTab('chat');
                      }}
                      className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Discuss in Chat</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {analysisResult}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Eye className="w-10 h-10 mx-auto text-slate-600" />
              <h3 className="text-base font-bold text-white">Select a File to Inspect</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Choose an item from the left panel or upload new media for instant vision and text intelligence.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
