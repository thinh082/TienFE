const dashboardEmployees = document.getElementById("dashboardEmployees");
const dashboardDepartments = document.getElementById("dashboardDepartments");
const dashboardAccounts = document.getElementById("dashboardAccounts");
const employeeTable = document.getElementById("employeeTable");
const departmentTable = document.getElementById("departmentTable");
const accountTable = document.getElementById("accountTable");
const employeeForm = document.getElementById("employeeForm");
const employeeMessage = document.getElementById("employeeMessage");
const resetEmployeeFormBtn = document.getElementById("resetEmployeeForm");
const departmentForm = document.getElementById("departmentForm");
const departmentMessage = document.getElementById("departmentMessage");
const resetDepartmentFormBtn = document.getElementById("resetDepartmentForm");

const adminState = {
  employeeId: null,
  departmentId: null,
};

const adminCache = {
  employees: [],
  departments: [],
};

const setEmployeeMessage = (text, isError = false) => {
  employeeMessage.textContent = text;
  employeeMessage.classList.toggle("text-red-500", isError);
  employeeMessage.classList.toggle("text-emerald-600", !isError);
};

const setDepartmentMessage = (text, isError = false) => {
  departmentMessage.textContent = text;
  departmentMessage.classList.toggle("text-red-500", isError);
  departmentMessage.classList.toggle("text-emerald-600", !isError);
};

const loadDashboard = async () => {
  try {
    const result = await apiClient.get("/Admin/dashboard");
    dashboardEmployees.textContent = result.data.tongNhanVien;
    dashboardDepartments.textContent = result.data.tongPhongBan;
    dashboardAccounts.textContent = result.data.tongTaiKhoan;
  } catch (error) {
    console.error(error);
  }
};

const loadEmployees = async () => {
  try {
    const result = await apiClient.get("/Admin/nhan-vien");
    adminCache.employees = result.data || [];
    employeeTable.innerHTML = result.data
      .map(
        (nv) => `
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">${nv.hoTen}</td>
          <td class="px-4 py-3">
            <p>${nv.email || "—"}</p>
            <p>${nv.dienThoai || ""}</p>
          </td>
          <td class="px-4 py-3">${nv.phongBan || "—"}</td>
          <td class="px-4 py-3">${nv.chucVu || "—"}</td>
          <td class="px-4 py-3">${nv.ngayVaoLam}</td>
          <td class="px-4 py-3">${nv.trangThai || "—"}</td>
          <td class="px-4 py-3 space-x-2">
            <button data-edit="${nv.id}" class="rounded-lg bg-sky-500 px-3 py-1 text-white">Sửa</button>
            <button data-delete="${nv.id}" class="rounded-lg bg-rose-500 px-3 py-1 text-white">Xóa</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    employeeTable.innerHTML = `<tr><td colspan="7" class="px-4 py-3 text-red-500">${error.message}</td></tr>`;
  }
};

const loadDepartments = async () => {
  try {
    const result = await apiClient.get("/Admin/phong-ban");
    adminCache.departments = result.data || [];
    departmentTable.innerHTML = result.data
      .map(
        (pb) => `
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">${pb.tenPhongBan}</td>
          <td class="px-4 py-3">${pb.moTa || ""}</td>
          <td class="px-4 py-3 space-x-2">
            <button data-de-edit="${pb.id}" class="rounded-lg bg-sky-500 px-3 py-1 text-white">Sửa</button>
            <button data-de-delete="${pb.id}" class="rounded-lg bg-rose-500 px-3 py-1 text-white">Xóa</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    departmentTable.innerHTML = `<tr><td colspan="3" class="px-4 py-3 text-red-500">${error.message}</td></tr>`;
  }
};

const loadAccounts = async () => {
  try {
    const result = await apiClient.get("/Admin/tai-khoan");
    accountTable.innerHTML = result.data
      .map(
        (tk) => `
        <tr>
          <td class="px-4 py-3 font-semibold text-slate-700">${tk.tenDangNhap}</td>
          <td class="px-4 py-3">${tk.vaiTro || "—"}</td>
          <td class="px-4 py-3">${tk.idNhanVien ?? "—"}</td>
        </tr>
      `
      )
      .join("");
  } catch (error) {
    accountTable.innerHTML = `<tr><td colspan="3" class="px-4 py-3 text-red-500">${error.message}</td></tr>`;
  }
};

employeeForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(employeeForm);
  const payload = {
    hoTen: formData.get("hoTen")?.trim(),
    ngayVaoLam: formData.get("ngayVaoLam"),
    email: formData.get("email") || null,
    dienThoai: formData.get("dienThoai") || null,
    diaChi: formData.get("diaChi") || null,
    idPhongBan: formData.get("idPhongBan")
      ? Number(formData.get("idPhongBan"))
      : null,
    idChucVu: formData.get("idChucVu")
      ? Number(formData.get("idChucVu"))
      : null,
  };

  const editingId = adminState.employeeId;
  if (editingId) {
    payload.trangThai = formData.get("trangThai") || null;
  }

  setEmployeeMessage("Đang lưu...");

  try {
    if (editingId) {
      await apiClient.put(`/Admin/nhan-vien/${editingId}`, payload);
      setEmployeeMessage("Cập nhật nhân viên thành công");
    } else {
      await apiClient.post("/Admin/nhan-vien", payload);
      setEmployeeMessage("Thêm nhân viên thành công");
    }
    adminState.employeeId = null;
    employeeForm.reset();
    await loadEmployees();
    await loadDashboard();
  } catch (error) {
    setEmployeeMessage(error.message, true);
  }
});

employeeTable?.addEventListener("click", async (event) => {
  const editId = event.target.dataset.edit;
  const deleteId = event.target.dataset.delete;

  if (editId) {
    adminState.employeeId = Number(editId);
    const nv = adminCache.employees.find((item) => item.id === adminState.employeeId);
    if (!nv) return;
    employeeForm.hoTen.value = nv.hoTen;
    employeeForm.ngayVaoLam.value = nv.ngayVaoLam;
    employeeForm.email.value = nv.email || "";
    employeeForm.dienThoai.value = nv.dienThoai || "";
    employeeForm.diaChi.value = nv.diaChi || "";
    employeeForm.idPhongBan.value = nv.idPhongBan ?? "";
    employeeForm.idChucVu.value = nv.idChucVu ?? "";
    employeeForm.trangThai.value = nv.trangThai || "";
    setEmployeeMessage(`Đang sửa nhân viên #${nv.id}`);
  }

  if (deleteId) {
    if (!confirm("Xóa nhân viên này?")) return;
    try {
      await apiClient.delete(`/Admin/nhan-vien/${deleteId}`);
      setEmployeeMessage("Đã xóa nhân viên");
      await loadEmployees();
      await loadDashboard();
    } catch (error) {
      setEmployeeMessage(error.message, true);
    }
  }
});

resetEmployeeFormBtn?.addEventListener("click", () => {
  adminState.employeeId = null;
  employeeForm.reset();
  setEmployeeMessage("Đã làm mới form");
});

departmentForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(departmentForm);
  const payload = {
    tenPhongBan: formData.get("tenPhongBan")?.trim(),
    moTa: formData.get("moTa") || null,
  };

  const editingId = adminState.departmentId;
  setDepartmentMessage("Đang lưu...");

  try {
    if (editingId) {
      await apiClient.put(`/Admin/phong-ban/${editingId}`, payload);
      setDepartmentMessage("Cập nhật phòng ban thành công");
    } else {
      await apiClient.post("/Admin/phong-ban", payload);
      setDepartmentMessage("Thêm phòng ban thành công");
    }
    adminState.departmentId = null;
    departmentForm.reset();
    await loadDepartments();
    await loadDashboard();
  } catch (error) {
    setDepartmentMessage(error.message, true);
  }
});

departmentTable?.addEventListener("click", (event) => {
  const editId = event.target.dataset.deEdit;
  const deleteId = event.target.dataset.deDelete;

  if (editId) {
    adminState.departmentId = Number(editId);
    const dept = adminCache.departments.find((item) => item.id === adminState.departmentId);
    if (!dept) return;
    departmentForm.tenPhongBan.value = dept.tenPhongBan;
    departmentForm.moTa.value = dept.moTa || "";
    setDepartmentMessage(`Đang sửa phòng ban #${editId}`);
  }

  if (deleteId) {
    if (!confirm("Xóa phòng ban này?")) return;
    apiClient
      .delete(`/Admin/phong-ban/${deleteId}`)
      .then(() => {
        setDepartmentMessage("Đã xóa phòng ban");
        loadDepartments();
        loadDashboard();
      })
      .catch((error) => setDepartmentMessage(error.message, true));
  }
});

resetDepartmentFormBtn?.addEventListener("click", () => {
  adminState.departmentId = null;
  departmentForm.reset();
  setDepartmentMessage("Đã làm mới form");
});

loadDashboard();
loadEmployees();
loadDepartments();
loadAccounts();

