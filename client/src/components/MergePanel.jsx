import { useEffect, useMemo, useState } from "react";
import { mergePdfs } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg"];

function isAllowedFile(file) {
  const name = (file?.name || "").toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function MergePanel({ initialMode, hideTabs }) {
  const { token, isAuthenticated } = useAuth();
  const [mode, setMode] = useState(() => {
    if (initialMode) return initialMode;
    const hash = window.location.hash;
    if (hash === "#convert-pdf") return "convert";
    if (hash === "#remove-pages") return "remove-pages";
    return "merge";
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [pagesToRemove, setPagesToRemove] = useState("");
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("merged.pdf");
  const [outputFormat, setOutputFormat] = useState("pdf");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
      return;
    }
    const syncModeFromHash = () => {
      const hash = window.location.hash;
      if (hash === "#convert-pdf") setMode("convert");
      else if (hash === "#remove-pages") setMode("remove-pages");
      else setMode("merge");
    };

    window.addEventListener("hashchange", syncModeFromHash);

    return () => {
      window.removeEventListener("hashchange", syncModeFromHash);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl, initialMode]);

  const minimumFiles = (mode === "convert" || mode === "remove-pages") ? 1 : 2;
  const actionLabel = mode === "convert" ? "Convert" : mode === "remove-pages" ? "Process" : "Merge";
  const actionProgressLabel = mode === "convert" ? "Converting..." : mode === "remove-pages" ? "Processing..." : "Merging...";

  const canProcess = useMemo(() => {
    if (!isAuthenticated || isMerging) return false;
    if (selectedFiles.length < minimumFiles) return false;
    if (mode === "remove-pages" && !pagesToRemove.trim()) return false;
    return true;
  }, [isAuthenticated, selectedFiles.length, minimumFiles, isMerging, mode, pagesToRemove]);

  const addFiles = (files) => {
    const incomingFiles = Array.from(files || []);
    if (incomingFiles.length === 0) {
      return;
    }

    const invalidFiles = incomingFiles.filter((file) => !isAllowedFile(file));
    const validFiles = incomingFiles.filter((file) => isAllowedFile(file));

    if (invalidFiles.length > 0) {
      setError("Only PDF, Word (.docx), PNG, JPG, and JPEG files are supported.");
    } else {
      setError("");
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => {
        if (mode === "remove-pages") {
          return [validFiles[0]];
        }
        const map = new Map(prev.map((f) => [`${f.name}-${f.size}`, f]));
        validFiles.forEach((file) => {
          map.set(`${file.name}-${file.size}`, file);
        });
        return Array.from(map.values());
      });

      setSuccess("");
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        setDownloadUrl("");
      }
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

  const clearFiles = () => {
    setSelectedFiles([]);
    setSuccess("");
    setError("");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl("");
    }
  };

  const onProcess = async () => {
    if (!canProcess) {
      return;
    }

    setIsMerging(true);
    setError("");
    setSuccess("");

    try {
      const { blob, fileName } = await mergePdfs(
        selectedFiles,
        token,
        outputFormat,
        mode,
        { pagesToRemove }
      );
      const blobUrl = URL.createObjectURL(blob);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(blobUrl);
      setDownloadName(fileName);
      setSuccess(`Files ${mode === "convert" ? "converted" : mode === "remove-pages" ? "processed" : "merged"} successfully. Download is ready.`);
    } catch (err) {
      setError(err.message || "Failed to merge files.");
    } finally {
      setIsMerging(false);
    }
  };

  const onDownload = () => {
    if (!downloadUrl) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = downloadName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div id="merge" className="w-full">
      <div id="convert-pdf" className={`${hideTabs ? '' : 'glass rounded-3xl border border-white/50 p-6 shadow-soft sm:p-8'}`}>
        <div className="mb-6">
          {!hideTabs && (
            <div className="mb-4 flex flex-wrap gap-2">
              <a
                href="#merge"
                onClick={() => setMode("merge")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  mode === "merge"
                    ? "bg-brand-600 text-white"
                    : "border border-brand-200 text-brand-700 hover:bg-brand-50"
                }`}
              >
                Merge PDFs
              </a>
              <a
                href="#convert-pdf"
                onClick={() => setMode("convert")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  mode === "convert"
                    ? "bg-brand-600 text-white"
                    : "border border-brand-200 text-brand-700 hover:bg-brand-50"
                }`}
              >
                Convert PDF
              </a>
              <a
                href="#remove-pages"
                onClick={() => setMode("remove-pages")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  mode === "remove-pages"
                    ? "bg-brand-600 text-white"
                    : "border border-brand-200 text-brand-700 hover:bg-brand-50"
                }`}
              >
                Remove Pages
              </a>
            </div>
          )}
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "convert" ? "Convert Your File" : mode === "remove-pages" ? "Remove PDF Pages" : "Merge Your Files"}
          </h2>
          <p className="mt-2 text-slate-600">
            {mode === "convert"
              ? "Add one PDF, Word .docx, or photo, then download as PDF or Word."
              : mode === "remove-pages"
              ? "Add one PDF, enter page numbers to remove, then download the result."
              : "Add at least two files (PDF, Word .docx, or photos), merge them, then download as PDF or Word."}
          </p>
        </div>

        {!isAuthenticated && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please login or register first to use this tool.
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select Files
            </label>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`rounded-xl border-2 border-dashed bg-white p-5 transition ${
                isDragging
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-300"
              }`}
            >
              <input
                type="file"
                accept=".pdf,.docx,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                multiple={mode !== "remove-pages"}
                onChange={onFileChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <p className="mt-3 text-sm font-medium text-slate-700">
                {mode === "remove-pages" 
                  ? "Choose the PDF file you want to edit." 
                  : "Drag and drop files here, or choose files from your computer."}
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              You can add files multiple times. Supported: PDF, DOCX, PNG, JPG, JPEG.
            </p>
          </div>

          <div className="max-w-xs">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Choose Download Format
            </label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="outputFormat"
                  value="pdf"
                  checked={outputFormat === "pdf"}
                  onChange={() => {
                    setOutputFormat("pdf");
                    setSuccess("");
                    if (downloadUrl) {
                      URL.revokeObjectURL(downloadUrl);
                      setDownloadUrl("");
                    }
                  }}
                  className="size-4 accent-brand-600"
                />
                PDF
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="outputFormat"
                  value="docx"
                  checked={outputFormat === "docx"}
                  onChange={() => {
                    setOutputFormat("docx");
                    setSuccess("");
                    if (downloadUrl) {
                      URL.revokeObjectURL(downloadUrl);
                      setDownloadUrl("");
                    }
                  }}
                  className="size-4 accent-brand-600"
                />
                Word (.docx)
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Word download keeps Word text and photos. PDF files are best kept as PDF.
            </p>
          </div>

          {mode === "remove-pages" && (
            <div className="max-w-xs">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Pages to Remove
              </label>
              <input
                type="text"
                value={pagesToRemove}
                onChange={(e) => setPagesToRemove(e.target.value)}
                placeholder="e.g. 1, 3-5, 10"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">
                Enter comma-separated page numbers or ranges to delete.
              </p>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">
                  Selected files ({selectedFiles.length}):
                </p>
                <button
                  onClick={clearFiles}
                  type="button"
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                >
                  Clear all
                </button>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {selectedFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      type="button"
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onProcess}
              disabled={!canProcess}
              className="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isMerging ? actionProgressLabel : `${actionLabel} Files`}
            </button>

            <button
              onClick={onDownload}
              disabled={!downloadUrl}
              className="rounded-xl border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Download {mode === "convert" ? "Converted" : "Merged"} {outputFormat === "docx" ? "Word" : "PDF"}
            </button>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
