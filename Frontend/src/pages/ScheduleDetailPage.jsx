import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminNavSidebar from "../components/AdminNavSidebar";
import Header from "../components/Header";
import { getScheduleById } from "../services/scheduleService";

function ScheduleDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.id;
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch schedule data when component mounts or ID changes
  useEffect(() => {
    if (!id) {
      console.warn(
        "Không tìm thấy ID lịch trình trong location state. Điều hướng về trang danh sách."
      );
      navigate("/admin/schedules");
      return;
    }

    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await getScheduleById(id);
        setSchedule(data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin lịch trình:", err);
        setError("Không tìm thấy thông tin lịch trình hoặc có lỗi xảy ra.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id, navigate]);

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
            onClick={() => navigate("/admin/schedules")}
            className="mt-5 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-12 py-4"
          >
            Quay về danh sách
          </button>
        </div>
      </div>
    );
  }

  // Don't render if schedule is null after loading and no error
  if (!schedule) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col">
        <div className="flex">
          <div className="w-full max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-5">
              <h2 className="text-[#212B36] font-bold text-4xl leading-7 text-center w-full">
                Thông tin chi tiết lịch trình
              </h2>
            </div>

            <div className="bg-white rounded-lg border border-[#D9D9D9] p-8">
              <form className="w-full max-w-5xl mx-auto grid grid-cols-2 gap-x-4 gap-y-4">
                <div className="grid grid-cols-[120px_1fr] items-start">
                  <span className="text-sm text-gray-500">Bác sĩ:</span>
                  <span className="font-medium text-gray-800">
                    {schedule.userId?.fullName || "-"}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start">
                  <span className="text-sm text-gray-500">Ca làm việc:</span>
                  <span className="font-medium text-gray-800">
                    {schedule.shift === 'MORNING' ? 'Sáng (07:00 - 12:00)' : schedule.shift === 'AFTERNOON' ? 'Chiều (13:00 - 17:00)' : schedule.shift === 'EVENING' ? 'Tối (18:00 - 21:00)' : '-'}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start">
                  <span className="text-sm text-gray-500">Ngày làm việc:</span>
                  <span className="font-medium text-gray-800">
                    {schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : "-"}
                  </span>
                </div>
                <div className="grid grid-cols-[120px_1fr] items-start">
                  <span className="text-sm text-gray-500">Phòng:</span>
                  <span className="font-medium text-gray-800">
                    {schedule.room?.roomName || schedule.room?.roomNumber || "-"}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="col-span-1 sm:col-span-1 flex justify-start mt-8">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      className="bg-custom-blue hover:bg-custom-bluehover2 text-white font-semibold text-sm rounded-lg w-36 h-12"
                      onClick={() =>
                        navigate('/admin/schedules/update', {state: { id: schedule._id },
                        })
                      }
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
                <div className="col-span-1 sm:col-span-1 flex justify-end mt-8">
                  <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-sm rounded-lg w-36 h-12"
                    onClick={() => navigate("/admin/schedules")}
                  >
                    Quay về danh sách
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleDetailPage;