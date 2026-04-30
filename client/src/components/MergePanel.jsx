import { useEffect, useMemo, useState } from "react";
import { mergePdfs } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".png", ".jpg", ".jpeg"];

function isAllowedFile(file) {
  const name = (file?.name || "").toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function MergePanel() {
  const { token, isAuthenticated } = useAuth();
  const [mode, setMode] = useState(() =>
    window.location.hash === "#convert-pdf" ? "convert" : "merge"
  );
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("merged.pdf");
  const [outputFormat, setOutputFormat] = useState("pdf");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const syncModeFromHash = () => {
      setMode(window.location.hash === "#convert-pdf" ? "convert" : "merge");
    };

    window.addEventListener("hashchange", syncModeFromHash);

    return () => {
      window.removeEventListener("hashchange", syncModeFromHash);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const minimumFiles = mode === "convert" ? 1 : 2;
  const actionLabel = mode === "convert" ? "Convert" : "Merge";
  const actionProgressLabel = mode === "convert" ? "Converting..." : "Merging...";

  const canProcess = useMemo(
    () => isAuthenticated && selectedFiles.length >= minimumFiles && !isMerging,
    [isAuthenticated, selectedFiles.length, minimumFiles, isMerging]
  );

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
        mode
      );
      const blobUrl = URL.createObjectURL(blob);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(blobUrl);
      setDownloadName(fileName);
      setSuccess(`Files ${mode === "convert" ? "converted" : "merged"} successfully. Download is ready.`);
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
    <section id="merge" className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6">
      <div id="convert-pdf" className="glass rounded-3xl border border-white/50 p-6 shadow-soft sm:p-8">
        <div className="mb-6">
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
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "convert" ? "Convert Your File" : "Merge Your Files"}
          </h2>
          <p className="mt-2 text-slate-600">
            {mode === "convert"
              ? "Add one PDF, Word .docx, or photo, then download as PDF or Word."
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
                multiple
                onChange={onFileChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <p className="mt-3 text-sm font-medium text-slate-700">
                Drag and drop files here, or choose files from your computer.
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              You can add files multiple times. Supported: PDF, DOCX, PNG, JPG, JPEG.
            </p>
          </div>

          <div className="max-w-xs">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Download Format
            </label>
            <select
              value={outputFormat}
              onChange={(event) => {
                setOutputFormat(event.target.value);
                setSuccess("");
                if (downloadUrl) {
                  URL.revokeObjectURL(downloadUrl);
                  setDownloadUrl("");
                }
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="docx">Word (.docx)</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Word download keeps Word text and photos. PDF files are best kept as PDF.
            </p>
          </div>

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
    </section>
  );
}
