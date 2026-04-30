const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let message = "Something went wrong.";
    try {
      const data = await response.json();
      message = data.message || message;
    } catch (error) {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response;
}

export async function registerUser(payload) {
  const response = await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
}

export async function loginUser(payload) {
  const response = await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return response.json();
}

function getDownloadFileName(response, outputFormat, mode) {
  const fallbackPrefix = mode === "convert" ? "converted" : "merged";
  const fallbackName = `${fallbackPrefix}.${outputFormat}`;
  const contentDisposition = response.headers.get("content-disposition") || "";
  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  const headerName = match?.[1] || fallbackName;
  const expectedExtension = `.${outputFormat}`;

  return headerName.toLowerCase().endsWith(expectedExtension)
    ? headerName
    : `${headerName.replace(/\.[^.]+$/, "")}${expectedExtension}`;
}

export async function mergePdfs(files, token, outputFormat = "pdf", mode = "merge") {
  const formData = new FormData();
  files.forEach((file) => formData.append("pdfs", file));
  formData.append("outputFormat", outputFormat);
  formData.append("mode", mode);

  const response = await request("/pdf/merge", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const fileName = getDownloadFileName(response, outputFormat, mode);
  const blob = await response.blob();

  return { blob, fileName };
}
