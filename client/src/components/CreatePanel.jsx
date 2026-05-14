import React, { useState, useMemo, useEffect } from "react";
import { createPdf } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".txt"];

function isAllowedFile(file) {
  const name = (file?.name || "").toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function CreatePanel({ hideTabs }) {
  const { token, isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("document.pdf");

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const canProcess = useMemo(() => {
    if (!isAuthenticated || isCreating) return false;
    if (selectedFiles.length === 0) return false;
    return true;
  }, [isAuthenticated, isCreating, selectedFiles]);

  const addFiles = (files) => {
    const incomingFiles = Array.from(files || []);
    if (incomingFiles.length === 0) return;

    const invalidFiles = incomingFiles.filter((file) => !isAllowedFile(file));
    const validFiles = incomingFiles.filter((file) => isAllowedFile(file));

    if (invalidFiles.length > 0) {
      setError("Only PDF, Word (.docx), text (.txt), PNG, JPG, and JPEG files are supported.");
    } else {
      setError("");
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => {
        const map = new Map(prev.map((f) => [`${f.name}-${f.size}`, f]));
        validFiles.forEach((file) => {
          map.set(`${file.name}-${file.size}`, file);
        });
        return Array.from(map.values());
      });
      setSuccess("");
    }
  };

  const onFileChange = (event) => {
    addFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setSuccess("");
    setError("");
  };

  const onProcess = async () => {
    if (!canProcess) return;

    setIsCreating(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append("files", file));
      if (title.trim()) {
        formData.append("title", title);
      }

      const response = await createPdf(formData, token);
      
      if (response && response.blob) {
         const blobUrl = URL.createObjectURL(response.blob);
         if (downloadUrl) {
           URL.revokeObjectURL(downloadUrl);
         }
         setDownloadUrl(blobUrl);
         setDownloadName(response.fileName || "document.pdf");
         setSuccess("PDF created successfully. Download is ready.");
      } else {
         setError("Failed to create PDF.");
      }
    } catch (err) {
      setError(err.message || "Failed to create PDF.");
    } finally {
      setIsCreating(false);
    }
  };

  const onDownload = () => {
    if (!downloadUrl) return;
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const clearContent = () => {
    setTitle("");
    setSelectedFiles([]);
    setError("");
    setSuccess("");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl("");
    }
  };

  return (
    <div id="create-pdf" className="w-full">
      <div className={`${hideTabs ? '' : 'glass rounded-3xl border border-white/50 p-6 shadow-soft sm:p-8'}`}>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create New PDF
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select files (e.g. Word, images, or text) to combine and generate a professional PDF document.
          </p>
        </div>

        {!isAuthenticated && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please login or register first to use this tool.
          </p>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Document Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Important Notes"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="mb-3 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Upload Files
              </label>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => document.getElementById('fileInput').click()}
                className={`relative cursor-pointer overflow-hidden rounded-[24px] border-2 border-dashed p-6 sm:p-10 text-center transition-all ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                    : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-indigo-500"
                }`}
              >
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.png,.jpg,.jpeg,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,text/plain"
                  onChange={onFileChange}
                  className="hidden"
                />
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-400">
                   <svg className="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                   </svg>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Click or drag & drop files here
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Selected Files ({selectedFiles.length})
               </label>
               {(selectedFiles.length > 0 || title.length > 0) && (
                 <button
                   onClick={clearContent}
                   className="text-xs font-bold text-rose-500 hover:underline"
                 >
                   Clear All
                 </button>
               )}
            </div>

            <div className="flex-1 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex flex-col h-full rounded-3xl border border-slate-100 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/30">
                {title ? (
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 pb-2 dark:border-slate-700 break-words">{title}</h3>
                ) : (
                  <div className="text-lg font-bold text-slate-300 dark:text-slate-600 mb-4 border-b border-slate-200 pb-2 dark:border-slate-700 italic">Untitled Document</div>
                )}
                
                {selectedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-10 items-center justify-center rounded-xl ${file.name.endsWith('.pdf') ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'} dark:bg-slate-700 dark:text-slate-300`}>
                            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="max-w-[150px] sm:max-w-[200px]">
                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{file.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="rounded-lg p-2 text-slate-300 hover:bg-white hover:text-rose-500 transition-all dark:hover:bg-slate-600"
                        >
                          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                     <svg className="size-8 text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                     </svg>
                     <p className="text-sm text-slate-400 dark:text-slate-500">Your selected files will appear here</p>
                   </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={onProcess}
                disabled={!canProcess}
                className="flex-[2] rounded-2xl bg-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none"
              >
                {isCreating ? "Creating PDF..." : "Create PDF"}
              </button>

              <button
                onClick={onDownload}
                disabled={!downloadUrl}
                className={`flex-1 rounded-2xl py-4 font-bold transition-all disabled:opacity-50 ${
                  downloadUrl
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                    : "border border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50 dark:bg-slate-800 dark:border-indigo-900 dark:text-indigo-400"
                }`}
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30">
            {success}
          </div>
        )}
      </div>
    </div>
  );
}
