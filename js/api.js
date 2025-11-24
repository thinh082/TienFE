const apiClient = (() => {
  const STORAGE_KEY = "tien_api_base";
  let baseUrl = localStorage.getItem(STORAGE_KEY) || "http://localhost:5286/api";

  const buildUrl = (path) => `${baseUrl}${path}`;

  const request = async (path, options = {}) => {
    const opts = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    const response = await fetch(buildUrl(path), opts);
    const data = await response.json().catch(() => ({
      ok: false,
      message: "Không thể đọc dữ liệu trả về",
    }));

    if (!response.ok || data.ok === false) {
      throw new Error(data.message || "Có lỗi xảy ra");
    }

    return data;
  };

  return {
    getBase: () => baseUrl,
    setBase: (url) => {
      baseUrl = url;
      localStorage.setItem(STORAGE_KEY, url);
    },
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) =>
      request(path, { method: "POST", body: JSON.stringify(body || {}) }),
    put: (path, body) =>
      request(path, { method: "PUT", body: JSON.stringify(body || {}) }),
    delete: (path) => request(path, { method: "DELETE" }),
  };
})();

window.apiClient = apiClient;

