import { useEffect, useMemo, useState } from "react";
import { mergePdfs } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

function isAllowedFile(file) {
  const name = (file?.name || "").toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export default function MergePanel() {
  const { token, isAuthenticated } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("merged.pdf");

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const canMerge = useMemo(
    () => isAuthenticated && selectedFiles.length >= 2 && !isMerging,
    [isAuthenticated, selectedFiles.length, isMerging]
  );

  const onFileChange = (event) => {
    const incomingFiles = Array.from(event.target.files || []);
    if (incomingFiles.length === 0) {
      return;
    }

    const invalidFiles = incomingFiles.filter((file) => !isAllowedFile(file));
    const validFiles = incomingFiles.filter((file) => isAllowedFile(file));

    if (invalidFiles.length > 0) {
      setError("Only PDF and Word (.docx) files are supported.");
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

    event.target.value = "";
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

  const onMerge = async () => {
    if (!canMerge) {
      return;
    }

    setIsMerging(true);
    setError("");
    setSuccess("");

    try {
      const { blob, fileName } = await mergePdfs(selectedFiles, token);
      const blobUrl = URL.createObjectURL(blob);
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
      setDownloadUrl(blobUrl);
      setDownloadName(fileName);
      setSuccess("Files merged successfully. Download is ready.");
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
      <div className="glass rounded-3xl border border-white/50 p-6 shadow-soft sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Merge Your Files</h2>
          <p className="mt-2 text-slate-600">
            Add at least two files (PDF or Word .docx), merge them, then
            download one PDF.
          </p>
        </div>

        {!isAuthenticated && (
          <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Please login or register first to use file merge.
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select Files
            </label>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              onChange={onFileChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <p className="mt-2 text-xs text-slate-500">
              You can add files multiple times. Supported: PDF, DOCX.
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
              onClick={onMerge}
              disabled={!canMerge}
              className="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isMerging ? "Merging..." : "Merge Files"}
            </button>

            <button
              onClick={onDownload}
              disabled={!downloadUrl}
              className="rounded-xl border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Download Merged PDF
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

