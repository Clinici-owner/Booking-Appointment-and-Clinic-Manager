import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import AdminNavSidebar from '../components/AdminNavSidebar';
import { getOwnSchedules } from '../services/scheduleService';

function ScheduleOwnPage() {
    const { userId: routeUserId } = useParams();
    const [scheduleList, setScheduleList] = useState([]);
    const [filterParaclinicalService, setFilterParaclinicalService] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1);
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

    const handleFilterChange = useCallback((e) => {
        setFilterParaclinicalService(e.target.value); // Cập nhật filterParaclinicalService
        setCurrentPage(1);
    }, []);

    const handleRowClick = useCallback((scheduleId) => {
        navigate('/admin/schedules/detail', { state: { id: scheduleId } });
    }, [navigate]);

    const filteredSchedules = useMemo(() => {
        return scheduleList.filter((schedule) => {
            // Lọc theo tên dịch vụ cận lâm sàng
            return filterParaclinicalService === '' || 
                   (schedule.paraclinicalId && schedule.paraclinicalId.paraclinalName && 
                    schedule.paraclinicalId.paraclinalName.toLowerCase().includes(filterParaclinicalService.toLowerCase()));
        });
    }, [scheduleList, filterParaclinicalService]);

    const indexOfLastSchedule = currentPage * schedulesPerPage;
    const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
    const currentSchedules = filteredSchedules.slice(indexOfFirstSchedule, indexOfLastSchedule);
    const totalPages = Math.ceil(filteredSchedules.length / schedulesPerPage);

    const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

    const uniqueParaclinicalServices = useMemo(() => { // Đổi từ uniqueRooms
        const services = scheduleList
            .map(schedule => schedule.paraclinicalId?.paraclinalName) // Lấy tên dịch vụ cận lâm sàng
            .filter(service => service !== undefined && service !== null);
        return [...new Set(services)].sort((a, b) => a.localeCompare(b)); // Sắp xếp theo alphabet
    }, [scheduleList]);

    // Group schedules by date for timeline view
    const schedulesByDate = useMemo(() => {
        const grouped = {};
        currentSchedules.forEach(schedule => {
            const date = new Date(schedule.startTime).toLocaleDateString('vi-VN');
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(schedule);
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
                <AdminNavSidebar />
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
            <AdminNavSidebar />
            <div className="flex-1 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-screen-xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                        <h2 className="text-[#212B36] font-bold text-4xl leading-tight">
                            Lịch Trình Cá Nhân
                        </h2>
                        <select
                            aria-label="Filter paraclinical services"
                            className="bg-white border border-[#D9D9D9] rounded-lg text-base font-semibold text-[#212B36] py-3.5 px-5 w-full md:w-[200px] cursor-pointer shadow-sm focus:ring focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                            value={filterParaclinicalService} // Sử dụng filterParaclinicalService
                            onChange={handleFilterChange}
                        >
                            <option value="">Tất cả dịch vụ</option> {/* Đổi text */}
                            {uniqueParaclinicalServices.map(service => ( // Duyệt qua uniqueParaclinicalServices
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
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
                                                            {schedule.paraclinicalId?.paraclinalName || '-'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Nhân viên: {schedule.userId?.fullName || '-'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Phòng: {schedule.roomNumber || '-'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">
                                                            Bắt đầu: {schedule.startTime ? new Date(schedule.startTime).toLocaleTimeString('vi-VN') : '-'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Kết thúc: {schedule.endTime ? new Date(schedule.endTime).toLocaleTimeString('vi-VN') : '-'}
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
                    <div className="flex justify-end items-center gap-2 mt-7 text-[#637381] text-base font-semibold">
                        <button
                            aria-label="Previous page"
                            className="w-10 h-9 border border-[#D9D9D9] rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`w-10 h-9 border border-[#D9D9D9] rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors ${currentPage === i + 1 ? 'bg-[#00BFA6] text-white border-[#00BFA6] shadow-sm' : 'bg-white text-[#637381]'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            aria-label="Next page"
                            className="w-10 h-9 border border-[#D9D9D9] rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScheduleOwnPage;