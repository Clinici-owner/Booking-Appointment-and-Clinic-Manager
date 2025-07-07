import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import DoctorNavSidebar from '../components/DoctorNavSideBar';
import { getOwnSchedules } from '../services/scheduleService';

function ScheduleOwnPage() {
    const { userId: routeUserId } = useParams();
    const [scheduleList, setScheduleList] = useState([]);
    const [schedulesPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();

    // Lấy userId từ sessionStorage
    const getUserIdFromSession = () => {
        try {
            const rawData = sessionStorage.getItem('user');
            if (!rawData) return null;
            const parsed = JSON.parse(rawData);
            return parsed?._id || null;
        } catch (err) {
            console.error('Lỗi khi parse user:', err);
            return null;
        }
    };

    // Ưu tiên route param nếu có
    const [internalUserId, setInternalUserId] = useState(() => routeUserId || getUserIdFromSession());

    // Gọi API lấy lịch trình
    const fetchOwnSchedules = useCallback(async () => {
        setLoading(true);
        setFetchError(null);

        try {
            if (!internalUserId) throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
            const data = await getOwnSchedules(internalUserId);

            if (!Array.isArray(data)) throw new Error('Dữ liệu lịch trình không hợp lệ.');
            setScheduleList(data);
        } catch (error) {
            const msg = error?.response?.data?.message || error.message;
            setFetchError(`Không thể tải dữ liệu. Lỗi: ${msg}`);
            toast.error('Không thể tải danh sách lịch trình cá nhân.', {
                style: { background: '#EF4444', color: '#fff' },
            });
        } finally {
            setLoading(false);
        }
    }, [internalUserId]);

    useEffect(() => {
        const sessionId = getUserIdFromSession();
        const validUserId = routeUserId || sessionId;

        if (!validUserId) {
            setFetchError('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
            return;
        }

        setInternalUserId(validUserId);

        if (sessionId && routeUserId && sessionId !== routeUserId) {
            navigate(`/admin/schedules/own/${sessionId}`, { replace: true });
        }

        fetchOwnSchedules();
    }, [routeUserId, navigate, fetchOwnSchedules]);


    const handleRowClick = useCallback((scheduleId) => {
        navigate('/admin/schedules/detail', { state: { id: scheduleId } });
    }, [navigate]);

    // Không còn lọc theo dịch vụ, chỉ phân trang
    const filteredSchedules = useMemo(() => scheduleList, [scheduleList]);

    const [currentPage] = useState(1);
    const indexOfLastSchedule = currentPage * schedulesPerPage;
    const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
    const currentSchedules = filteredSchedules.slice(indexOfFirstSchedule, indexOfLastSchedule);


    // Gom nhóm lịch trình theo ngày (dựa vào trường date của model Schedule)
    const schedulesByDate = useMemo(() => {
        const grouped = {};
        currentSchedules.forEach(schedule => {
            let dateStr = '';
            if (schedule.date) {
                try {
                    dateStr = new Date(schedule.date).toLocaleDateString('vi-VN');
                } catch {
                    dateStr = String(schedule.date);
                }
            } else if (schedule.startTime) {
                dateStr = new Date(schedule.startTime).toLocaleDateString('vi-VN');
            } else {
                dateStr = '-';
            }
            if (!grouped[dateStr]) grouped[dateStr] = [];
            grouped[dateStr].push(schedule);
        });
        return grouped;
    }, [currentSchedules]);

    if (fetchError) {
        return (
            <div className="flex min-h-screen">
                <Toaster />
                <AdminNavSidebar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
                    <div className="text-center py-12 px-6 bg-white rounded-lg shadow-lg">
                        <p className="text-xl text-red-600 font-semibold mb-6">{fetchError}</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={fetchOwnSchedules}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-lg px-8 py-3 transition-colors duration-200"
                            >
                                Thử tải lại
                            </button>
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-8 py-3 transition-colors duration-200"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <Toaster />
                <DoctorNavSidebar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
                    <div className="text-center py-12 px-6 bg-white rounded-lg shadow-lg">
                        <p className="text-xl text-gray-600 font-semibold animate-pulse">
                            Đang tải dữ liệu lịch trình cá nhân...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Toaster />
            <DoctorNavSidebar>
                <div className="flex-1 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-screen-xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                            <h2 className="text-[#212B36] font-bold text-4xl leading-tight">
                                Lịch Trình Cá Nhân
                            </h2>
                        </div>
                        <div className="space-y-8">
                            {Object.keys(schedulesByDate).length > 0 ? (
                                Object.entries(schedulesByDate).map(([date, schedules]) => (
                                    <div key={date} className="mb-8">
                                        <h3 className="text-2xl font-semibold text-[#212B36] mb-4">{date}</h3>
                                        <div className="space-y-4">
                                            {schedules.map((schedule) => (
                                                <div
                                                    key={schedule._id}
                                                    className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-[#D9D9D9]"
                                                    onClick={() => handleRowClick(schedule._id)}
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                        <div className="flex-1">
                                                            <p className="text-lg font-semibold text-[#212B36]">
                                                                Ca làm việc: {(() => {
                                                                    if (schedule.shift === 'MORNING') return 'Sáng (7h-12h)';
                                                                    if (schedule.shift === 'AFTERNOON') return 'Chiều (13h-17h)';
                                                                    if (schedule.shift === 'EVENING') return 'Tối (18h-21h)';
                                                                    return schedule.shift || '-';
                                                                })()}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Nhân viên: {schedule.userId?.fullName || '-'}
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                Phòng: {schedule.room?.roomName || schedule.room?.roomNumber || '-'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-600">
                                                                Ngày: {schedule.date ? new Date(schedule.date).toLocaleDateString('vi-VN') : '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 px-6 bg-white rounded-lg shadow-lg">
                                    <p className="text-lg text-gray-500">
                                        Không tìm thấy lịch trình cá nhân phù hợp.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DoctorNavSidebar>
        </div>
    );
}

export default ScheduleOwnPage;