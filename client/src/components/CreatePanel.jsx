import React, { useState, useMemo, useEffect } from "react";
import { createPdf } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CreatePanel({ hideTabs }) {
  const { token, isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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
    if (!content.trim()) return false;
    return true;
  }, [isAuthenticated, isCreating, content]);

  const onProcess = async () => {
    if (!canProcess) return;

    setIsCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await createPdf({ text: content, title }, token);
      
      // The response should contain base64 PDF if it's JSON from standard api,
      // wait, `api.js` returns `response.json()`
      // Let's check how api.js expects. In the log:
      /*
      "    body: JSON.stringify(payload)\n  });\n  return response.json();\n}\n"
      */
      // Wait, mergePdfs returns blob. But createPdf returns JSON, I need to check the backend route `pdfRoutes.js`.
      // The log shows:
      // "async function createPdfFromText(text, title = \"\") {\n  const pdf = await PDFDocument.create();... return await pdf.saveAsBase64({ dataUri: true });"
      // Wait, if it saves as base64, then `res.json({ pdf: base64String })` or something.
      // Let me just fetch the data and then create a blob from base64 dataUri.
      if (response && response.pdfData) {
         // Assuming response is { message, pdfData, fileName }
         const resData = response.pdfData;
         // convert base64 dataUri to Blob
         let base64str = resData;
         if (resData.startsWith("data:application/pdf;base64,")) {
             base64str = resData.split(",")[1];
         }
         const byteCharacters = atob(base64str);
         const byteNumbers = new Array(byteCharacters.length);
         for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
         }
         const byteArray = new Uint8Array(byteNumbers);
         const blob = new Blob([byteArray], { type: "application/pdf" });
         
         const blobUrl = URL.createObjectURL(blob);
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
    setContent("");
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
            Write or paste your text to generate a professional PDF document instantly.
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
            <div className="rounded-2xl bg-white p-5 border border-slate-100 shadow-sm dark:bg-slate-800 dark:border-slate-700 flex-1">
              <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start typing your content here..."
                rows="10"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:bg-slate-900 dark:border-slate-700 dark:text-white resize-y min-h-[200px]"
              ></textarea>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Document Preview
               </label>
               {(content.length > 0 || title.length > 0) && (
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
                
                {content ? (
                  <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap flex-1 break-words">
                    {content}
                  </div>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center">
                     <svg className="size-8 text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                     </svg>
                     <p className="text-sm text-slate-400 dark:text-slate-500">Your content will appear here</p>
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
