const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const showMessage = (text, isError = false) => {
  loginMessage.textContent = text;
  loginMessage.classList.toggle("text-red-500", isError);
  loginMessage.classList.toggle("text-emerald-600", !isError);
};

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = {
    username: formData.get("username")?.trim(),
    password: formData.get("password")?.trim(),
  };

  showMessage("Đang xử lý...");

  try {
    const result = await apiClient.post("/Auth/login", payload);
    localStorage.setItem("idTaiKhoan", result.idTaiKhoan);
    if (result.idNhanVien) {
      localStorage.setItem("idNhanVien", result.idNhanVien);
    }
    if (result.vaiTro) {
      localStorage.setItem("vaiTro", result.vaiTro);
    } else {
      localStorage.removeItem("vaiTro");
    }
    showMessage("Đăng nhập thành công, chuyển hướng...", false);
    setTimeout(() => {
      const target =
        result.vaiTro && result.vaiTro === "Admin"
          ? "admin.html"
          : "nhanvien.html";
      window.location.href = target;
    }, 800);
  } catch (error) {
    showMessage(error.message || "Đăng nhập thất bại", true);
  }
});

