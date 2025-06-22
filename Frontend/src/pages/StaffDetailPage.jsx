import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavSidebar from "../components/AdminNavSidebar";
import Header from "../components/Header";
import ConfirmationModal from "../components/ConfirmationModal";
import { getStaffById, toggleLockStatus } from "../services/staffService";

function StaffDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.id;
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(""); // State to track lock/unlock action
  const [notification, setNotification] = useState(null); // State for success notification

  // Fetch staff data khi component mount hoặc ID thay đổi
  useEffect(() => {
    if (!id) {
      console.warn(
        "Không tìm thấy ID nhân viên trong location state. Điều hướng về trang danh sách."
      );
      navigate("/admin/staffs");
      return;
    }

    const fetchStaff = async () => {
      try {
        setLoading(true);
        const data = await getStaffById(id);
        setStaff(data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin nhân viên:", err);
        setError("Không tìm thấy thông tin nhân viên hoặc có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [id, navigate]);

  // Handle lock/unlock button click to show confirmation modal
  const handleToggleLockStatusClick = () => {
    setActionType(staff.status === "locked" ? "unlock" : "lock");
    setShowConfirmModal(true);
  };

  // Handle confirmation of lock/unlock action
  const handleConfirmToggle = async () => {
    try {
      const res = await toggleLockStatus(id, staff.status);
      if (res?.user?.status) {
        setStaff((prev) => ({ ...prev, status: res.user.status }));
        // Show success notification based on action type
        setNotification(
          actionType === "lock"
            ? "Đã khóa tài khoản thành công!"
            : "Đã hủy khóa tài khoản thành công!"
        );
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      }
      setShowConfirmModal(false); // Hide modal after success
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái tài khoản:", error);
      setShowConfirmModal(false); // Hide modal even if there's an error
    }
  };

  // Xử lý hủy xác nhận
  const handleCancelToggle = () => {
    setShowConfirmModal(false); // Ẩn modal
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex bg-[#F3F6F9] min-h-screen">
        <AdminNavSidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Header />
          <div className="text-center py-15 text-xl text-gray-600">
            Đang tải thông tin...
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex bg-[#F3F6F9] min-h-screen">
        <AdminNavSidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Header />
          <div className="text-center py-15 text-xl text-red-500">{error}</div>
          <button
            onClick={() => navigate("/admin/staffs")}
            className="mt-5 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-12 py-4"
          >
            Quay về danh sách
          </button>
        </div>
      </div>
    );
  }

  // Don't render if staff is null after loading and no error
  if (!staff) {
    return null;
  }

  const isLocked = staff.status === "locked";

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex">
          <div className="w-full max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-5">
              <h2 className="text-[#212B36] font-bold text-4xl leading-7 text-center w-full">
                Thông tin chi tiết nhân viên
              </h2>
            </div>

            {/* Success Notification */}
            {notification && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-5 py-4 rounded-lg mb-8 text-center">
                {notification}
              </div>
            )}

            <div className="bg-white rounded-lg border border-[#D9D9D9] p-8">
              <div className="flex justify-center mb-8">
                <img
                  src={staff.avatar || "https://via.placeholder.com/150"}
                  alt="Avatar nhân viên"
                  className="w-32 h-32 rounded-full object-cover border border-gray-200"
                />
              </div>
              <form className="w-full max-w-5xl mx-auto grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="grid grid-cols-[120px_1fr] items-start">
                    <span className="text-sm text-gray-500">Họ và tên:</span>
                    <span className="font-medium text-gray-800">{staff.fullName || "-"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start">
                    <span className="text-sm text-gray-500">Số điện thoại:</span>
                    <span className="font-medium text-gray-800">{staff.phone || "-"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start">
                    <span className="text-sm text-gray-500">CMND/CCCD:</span>
                    <span className="font-medium text-gray-800">{staff.cidNumber || "-"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start">
                    <span className="text-sm text-gray-500">Ngày sinh:</span>
                    <span className="font-medium text-gray-800">{staff.dob ? new Date(staff.dob).toLocaleDateString("vi-VN") : "-"}</span>
                </div>
                 <div className="grid grid-cols-[120px_1fr] items-start">
                    <span className="text-sm text-gray-500">Địa chỉ:</span>
                    <span className="font-medium text-gray-800 whitespace-pre-line">{staff.address || "-"}</span>
                  </div>
                <div className="grid grid-cols-[120px_1fr] items-start">
                    <span className="text-sm text-gray-500">Email:</span>
                    <span className="font-medium text-gray-800">{staff.email || "-"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start">
                    <span className="text-sm text-gray-500">Giới tính:</span>
                    <span className="font-medium text-gray-800">{staff.gender === true ? "Nam" : staff.gender === false ? "Nữ" : "-"}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start">
                    <span className="text-sm text-gray-500">Vai trò:</span>
                    <span className="font-medium text-gray-800">
                    {staff.role === "doctor"
                    ? "Bác sĩ"
                    : staff.role === "technician"
                    ? "Kỹ thuật viên"
                    : staff.role === "receptionist"
                    ? "Lễ tân"
                    : staff.role || "-"}
                    </span>
              </div>

                {/* Các nút hành động */}
                <div className="col-span-1 sm:col-span-1 flex justify-start mt-8">
                  <div className="flex space-x-4">
                  <button
                    type="button"
                    className="bg-custom-blue hover:bg-custom-bluehover2 text-white font-semibold text-sm rounded-lg w-36 h-12"
                    onClick={() =>
                      navigate(`/admin/staffs/update`, {
                        state: { id: staff._id },
                      })
                    }
                  >
                    Chỉnh sửa
                  </button>
                   <button
                    type="button"
                    className={
                      isLocked
                        ? "bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg w-36 h-12"
                        : "bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg w-36 h-12"
                    }
                    onClick={handleToggleLockStatusClick}
                  >
                    {isLocked ? "Hủy khóa tài khoản" : "Khóa tài khoản"}
                  </button>
                  </div>


                </div>
                <div className="col-span-1 sm:col-span-1 flex justify-end mt-8">
                 <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-sm rounded-lg w-36 h-12"
                    onClick={() => navigate("/admin/staffs")}
                  >
                    Quay về danh sách
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmationModal
          title={
            actionType === "lock"
              ? "Xác nhận khóa tài khoản"
              : "Xác nhận hủy khóa tài khoản"
          }
          message={
            actionType === "lock"
              ? `Bạn có chắc chắn muốn khóa tài khoản "${staff.fullName}" này không?`
              : `Bạn có chắc chắn muốn hủy khóa tài khoản "${staff.fullName}" này không?`
          }
          onConfirm={handleConfirmToggle}
          onCancel={handleCancelToggle}
        />
      )}
    </div>
  );
}

export default StaffDetailPage;