const employeeId = localStorage.getItem("idNhanVien");
const profileBox = document.getElementById("profileBox");
const updateForm = document.getElementById("updateForm");
const updateMessage = document.getElementById("updateMessage");
const btnCheckIn = document.getElementById("btnCheckIn");
const btnCheckOut = document.getElementById("btnCheckOut");
const attendanceMessage = document.getElementById("attendanceMessage");
const historyLimit = document.getElementById("historyLimit");
const historyBody = document.getElementById("historyBody");

if (!employeeId) {
  profileBox.innerHTML =
    '<p class="text-red-500">Chưa có mã nhân viên. Vui lòng đăng nhập lại.</p>';
}

const renderProfile = (data) => {
  if (!profileBox) return;
  const fields = [
    { label: "Họ tên", value: data.hoTen },
    { label: "Email", value: data.email || "—" },
    { label: "Điện thoại", value: data.dienThoai || "—" },
    { label: "Địa chỉ", value: data.diaChi || "—" },
    { label: "Phòng ban", value: data.phongBan || "—" },
    { label: "Chức vụ", value: data.chucVu || "—" },
    { label: "Ngày vào làm", value: data.ngayVaoLam },
  ];

  profileBox.innerHTML = fields
    .map(
      (item) => `
      <div class="rounded-xl border border-slate-100 p-4">
        <p class="text-slate-400">${item.label}</p>
        <p class="text-slate-700 font-semibold">${item.value}</p>
      </div>
    `
    )
    .join("");

  updateForm.email.value = data.email || "";
  updateForm.dienThoai.value = data.dienThoai || "";
  updateForm.diaChi.value = data.diaChi || "";
};

const loadProfile = async () => {
  if (!employeeId) return;
  try {
    const result = await apiClient.get(`/NhanVien/${employeeId}`);
    renderProfile(result.data);
  } catch (error) {
    profileBox.innerHTML = `<p class="text-red-500">${error.message}</p>`;
  }
};

updateForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!employeeId) return;

  const payload = {
    email: updateForm.email.value || null,
    dienThoai: updateForm.dienThoai.value || null,
    diaChi: updateForm.diaChi.value || null,
  };

  updateMessage.textContent = "Đang lưu...";

  try {
    const result = await apiClient.put(`/NhanVien/${employeeId}`, payload);
    updateMessage.textContent = result.message;
    updateMessage.classList.add("text-emerald-600");
    await loadProfile();
  } catch (error) {
    updateMessage.textContent = error.message;
    updateMessage.classList.add("text-red-500");
  }
});

const handleAttendance = async (type) => {
  if (!employeeId) return;
  attendanceMessage.textContent = "Đang gửi...";
  const payload = { ghiChu: document.getElementById("chamCongNote").value || null };

  try {
    const path = type === "in" ? "check-in" : "check-out";
    const result = await apiClient.post(`/NhanVien/${employeeId}/${path}`, payload);
    attendanceMessage.textContent = result.message;
    attendanceMessage.classList.add("text-emerald-600");
    await loadHistory();
  } catch (error) {
    attendanceMessage.textContent = error.message;
    attendanceMessage.classList.add("text-red-500");
  }
};

btnCheckIn?.addEventListener("click", () => handleAttendance("in"));
btnCheckOut?.addEventListener("click", () => handleAttendance("out"));

const renderHistory = (items) => {
  historyBody.innerHTML = items
    .map(
      (item) => `
      <tr>
        <td class="px-4 py-3">${item.ngay}</td>
        <td class="px-4 py-3">${item.gioVao || "—"}</td>
        <td class="px-4 py-3">${item.gioRa || "—"}</td>
        <td class="px-4 py-3">${item.ghiChu || ""}</td>
      </tr>
    `
    )
    .join("");
};

const loadHistory = async () => {
  if (!employeeId) return;
  const limit = historyLimit.value || 30;
  try {
    const result = await apiClient.get(`/NhanVien/${employeeId}/cham-cong?limit=${limit}`);
    renderHistory(result.data || []);
  } catch (error) {
    historyBody.innerHTML = `<tr><td colspan="4" class="px-4 py-3 text-red-500">${error.message}</td></tr>`;
  }
};

historyLimit?.addEventListener("change", loadHistory);

loadProfile();
loadHistory();

