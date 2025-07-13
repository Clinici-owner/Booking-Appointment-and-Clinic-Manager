import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import DoctorNavSidebar from '../components/DoctorNavSideBar';
import TechnicianNavSidebar from '../components/TechnicianNavSidebar';
import { getOwnSchedules } from '../services/scheduleService';

function ScheduleOwnPage() {
    const { userId: routeUserId } = useParams();
    const [scheduleList, setScheduleList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();

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

    const [internalUserId, setInternalUserId] = useState(() => routeUserId || getUserIdFromSession());

    const getVNDate = () => {
        const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        now.setHours(0, 0, 0, 0);
        return now;
    };
    const [currentDate, setCurrentDate] = useState(getVNDate);

    const handleNextWeek = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() + 7);
            return newDate;
        });
    };

    const handlePreviousWeek = () => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(newDate.getDate() - 7);
            return newDate;
        });
    };
    
    useEffect(() => {
        const interval = setInterval(() => {
            const now = getVNDate();
            if (now.toDateString() !== new Date().toDateString()) {
                 setCurrentDate(now);
            }
        }, 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const weekdays = ['Thứ 7','Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6'];

    function getMonday(d) {
        const date = new Date(d);
        const day = date.getDay();
        const diff = (day + 6) % 7;
        date.setDate(date.getDate() - diff);
        date.setHours(0, 0, 0, 0);
        return date;
    }

    const monday = getMonday(currentDate);

    // [✅ SỬA LỖI TẠI ĐÂY]
    // Chỉnh sửa logic tạo mảng các ngày trong tuần
    const days = [
        ...Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(monday);
            // Ta cộng thêm 1 ngày vào đây để bù lại sai số 1 ngày khi hiển thị
            d.setDate(monday.getDate() + i + 1); 
            const weekday = weekdays[d.getDay()];
            return {
                value: d.toISOString().slice(0, 10),
                label: `${weekday}`,
                date: d.toISOString().slice(0, 10)
            };
        })
    ];
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 7); // +7 thay vì +6 vì ngày đã được bù 1
    const formatDisplayDate = (d) => d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });


    const shifts = [
        { value: 'MORNING', label: 'Ca sáng (7h - 11h30)' },
        { value: 'NOON', label: 'Ca trưa (11h30 - 13h30)' },
        { value: 'AFTERNOON', label: 'Ca chiều (13h30 - 17h)' },
    ];

const [userInfo, setUserInfo] = useState(() => {
    try {
        const rawData = sessionStorage.getItem('user');
        if (!rawData) return null;
        return JSON.parse(rawData);
    } catch {
        return null;
    }
});

    const fetchOwnSchedules = useCallback(async () => {
        setLoading(true);
        setFetchError(null);
        try {
            if (!internalUserId) throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
            const data = await getOwnSchedules(internalUserId);
            if (!Array.isArray(data)) throw new Error('Dữ liệu lịch trình không hợp lệ.');
            setScheduleList(data);
            const rawData = sessionStorage.getItem('user');
            if (rawData) setUserInfo(JSON.parse(rawData));
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
            navigate(`/schedules/own/${sessionId}`, { replace: true });
        }
        fetchOwnSchedules();
    }, [routeUserId, navigate, fetchOwnSchedules]);

    const weekSchedules = days.map(day => {
        const ca = {};
        shifts.forEach(shift => {
            const found = scheduleList.find(s => {
                const sDate = new Date(s.date).toISOString().slice(0, 10);
                return sDate === day.value && s.shift === shift.value;
            });
            ca[shift.value] = found || null;
        });
        return { ...day, shifts: ca };
    });

    const SidebarComponent = userInfo?.role === 'technician' ? TechnicianNavSidebar : DoctorNavSidebar;
    // Render sidebar using portal to keep layout correct but not in JSX at line 190
    const sidebarPortal = typeof window !== 'undefined'
        ? createPortal(<SidebarComponent />, document.body)
        : null;

    if (fetchError) {
        return (
            <div className="flex min-h-screen">
                <Toaster />
                <SidebarComponent />
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
                    <div className="text-center py-12 px-6 bg-white rounded-lg shadow-lg">
                        <p className="text-xl text-red-600 font-semibold mb-6">{fetchError}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <Toaster />
                <SidebarComponent />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-xl text-gray-600 animate-pulse">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 ">
            <Toaster />
            {sidebarPortal}
            <div className="flex-1 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-screen-xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                        <h2 className="text-[#212B36] font-bold text-4xl leading-tight">
                            Lịch Trình Cá Nhân
                        </h2>
                        <div className="flex items-center gap-4">
                            <button onClick={handlePreviousWeek} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold">Tuần Trước</button>
                            <span className="text-lg font-semibold text-gray-700">
                                {formatDisplayDate(new Date(days[0].date))} - {formatDisplayDate(new Date(days[6].date))}
                            </span>
                            <button onClick={handleNextWeek} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold">Tuần Sau</button>
                        </div>
                    </div>

                    <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-8xl w-full overflow-x-auto">
                        <table className="w-full border border-gray-300 rounded-lg table-fixed text-center">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-300">
                                    <th className="border-r border-gray-300 py-3 font-semibold text-sm bg-white max-w-[140px]">Ca làm việc</th>
                                    {days.map((d) => (
                                        <th key={d.value} className="border-r border-gray-300 py-3 font-semibold text-sm">
                                            {d.label}<br />
                                            <span className="text-xs font-normal">
                                                {new Date(d.value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {shifts.map(shift => (
                                    <tr key={shift.value} className="border-t border-gray-300">
                                        <td className="border-r border-gray-300 py-5 font-medium text-gray-700 bg-gray-50 max-w-[140px]">
                                            {shift.label}
                                        </td>
                                        {weekSchedules.map((day) => {
                                            const schedule = day.shifts[shift.value];
                                            return (
                                                <td key={day.value} className={`border-r border-gray-300 py-5 ${schedule ? 'bg-green-500 text-white font-semibold' : 'bg-gray-50'}`}>
                                                    {schedule ? (
                                                        <div>
                                                            <div>Phòng: {schedule.room?.roomNumber || '-'}</div>
                                                            {schedule.specialty && <div className="italic text-xs">{schedule.specialty}</div>}
                                                        </div>
                                                    ) : null}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default ScheduleOwnPage;