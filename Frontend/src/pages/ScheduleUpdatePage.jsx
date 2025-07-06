import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import { getScheduleById, updateSchedule } from "../services/scheduleService";

const SHIFTS = [
    { value: '', label: 'Chọn ca làm việc' },
    { value: 'MORNING', label: 'Ca sáng (7h - 12h)' },
    { value: 'AFTERNOON', label: 'Ca chiều (13h - 17h)' },
    { value: 'EVENING', label: 'Ca tối (18h - 21h)' },
];

function ScheduleUpdatePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const scheduleId = location.state?.id;
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [rooms, setRooms] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy danh sách bác sĩ
                const usersResponse = await fetch('http://localhost:3000/api/staff?role=doctor');
                if (!usersResponse.ok) throw new Error('Failed to fetch staff');
                const usersData = await usersResponse.json();
                setUsers(Array.isArray(usersData) ? usersData : []);
                // Lấy danh sách phòng
                const roomsResponse = await fetch('http://localhost:3000/api/room');
                if (!roomsResponse.ok) throw new Error('Failed to fetch rooms');
                const roomsData = await roomsResponse.json();
                setRooms(Array.isArray(roomsData) ? roomsData : []);
                // Fetch specialties for select
            } catch {
                setUsers([]);
                setRooms([]);
                setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
            }
        };
        fetchData();
    }, []);

    // Fetch schedule data
    useEffect(() => {
        if (!scheduleId) {
            navigate("/admin/schedules");
            return;
        }
        async function fetchSchedule() {
            try {
                setLoading(true);
                const data = await getScheduleById(scheduleId);
                setSchedule({
                    ...data,
                    userId: data.userId?._id || data.userId || '',
                    room: data.room?._id || data.room || '',
                    shift: data.shift || '',
                    date: data.date ? new Date(data.date).toISOString().slice(0, 10) : '',
                });
                // Removed setFormData (no longer used)
            } catch {
                setError("Không tìm thấy thông tin lịch trình hoặc có lỗi xảy ra.");
            } finally {
                setLoading(false);
            }
        }
        fetchSchedule();
    }, [scheduleId, navigate]);

    const validateField = (name, value) => {
        switch (name) {
            case 'userId':
                return value ? '' : 'Vui lòng chọn bác sĩ.';
            case 'room':
                return value ? '' : 'Vui lòng chọn phòng.';
            case 'shift':
                return value ? '' : 'Vui lòng chọn ca làm việc.';
            case 'date':
                return value ? '' : 'Vui lòng chọn ngày.';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSchedule(prev => {
            const updated = { ...prev, [name]: value };
            setErrors(prevErrors => ({ ...prevErrors, [name]: validateField(name, updated[name]) }));
            return updated;
        });
    };


    const isValidForm = () => {
        const newErrors = {};
        // Validate all fields required for the form
        const fieldsToValidate = ['userId', 'room', 'shift', 'date'];
        fieldsToValidate.forEach(key => {
            const error = validateField(key, schedule[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidForm()) {
            toast.error("Vui lòng kiểm tra lại các trường thông tin.", { style: { background: '#EF4444', color: '#fff' } });
            return;
        }
        try {
            const originalSchedule = await getScheduleById(scheduleId);
            const updatePayload = {};
            if (schedule.userId !== (originalSchedule.userId?._id || originalSchedule.userId)) {
                updatePayload.userId = schedule.userId;
            }
            if (schedule.room !== (originalSchedule.room?._id || originalSchedule.room)) {
                updatePayload.room = schedule.room;
            }
            if (schedule.shift !== originalSchedule.shift) {
                updatePayload.shift = schedule.shift;
            }
            if (schedule.date !== (originalSchedule.date ? new Date(originalSchedule.date).toISOString().slice(0, 10) : '')) {
                updatePayload.date = schedule.date;
            }
            if (Object.keys(updatePayload).length === 0) {
                toast.info("Không có thông tin nào được thay đổi.", { style: { background: '#3B82F6', color: '#fff' } });
                setTimeout(() => navigate("/admin/schedules"), 1500);
                return;
            }
            await updateSchedule(scheduleId, updatePayload);
            toast.success("Đã cập nhật lịch trình thành công!", { style: { background: '#10B981', color: '#fff' } });
            setTimeout(() => navigate("/admin/schedules"), 2000);
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Cập nhật thất bại!';
            toast.error(`Cập nhật thất bại: ${errorMessage}`, { style: { background: '#EF4444', color: '#fff' } });
        }
    };

    if (loading) {
        return (
            <div className="flex bg-[#F3F6F9] min-h-screen">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center py-15 text-xl text-gray-600">
                        Đang tải thông tin...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex bg-[#F3F6F9] min-h-screen">
                <div className="flex-1 flex flex-col items-center justify-center">
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

    if (!schedule) {
        return null;
    }

    return (
        <div className="flex text-[18px] leading-[1.75]">
            <Toaster />
            <div className="flex-1 flex flex-col">
                <div className="flex">
                    <div className="w-full max-w-[900px] mx-auto p-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                            <h2 className="text-[#212B36] font-bold text-4xl leading-6">
                                Cập nhật thông tin lịch trình
                            </h2>
                        </div>
                        {/* UI chọn chuyên khoa và ca làm việc giống trang add (chỉ UI, không ảnh hưởng update) */}
                        <div className="flex flex-wrap gap-6 items-center mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc</label>
                                <select
                                    name="shift"
                                    value={schedule.shift || ''}
                                    onChange={handleChange}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
                                >
                                    {SHIFTS.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-[#D9D9D9] p-6">
                            <form
                                onSubmit={handleSubmit}
                                className="w-full max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6"
                            >
                                <div>
                                    <label htmlFor="userId" className="block text-sm text-gray-700 mb-1">Bác sĩ</label>
                                    <select
                                        id="userId"
                                        name="userId"
                                        value={schedule.userId}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <option value="">Chọn bác sĩ</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>{user.fullName}</option>
                                        ))}
                                    </select>
                                    {errors.userId && <p className="text-sm text-red-600">{errors.userId}</p>}
                                </div>
                                <div>
                                    <label htmlFor="room" className="block text-sm text-gray-700 mb-1">Phòng</label>
                                    <select
                                        id="room"
                                        name="room"
                                        value={schedule.room}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        <option value="">Chọn phòng</option>
                                        {rooms.map(room => (
                                            <option key={room._id} value={room._id}>{room.roomName || room.roomNumber}</option>
                                        ))}
                                    </select>
                                    {errors.room && <p className="text-sm text-red-600">{errors.room}</p>}
                                </div>
                                <div>
                                    <label htmlFor="shift" className="block text-sm text-gray-700 mb-1">Ca làm việc</label>
                                    <select
                                        id="shift"
                                        name="shift"
                                        value={schedule.shift}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    >
                                        {SHIFTS.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                    {errors.shift && <p className="text-sm text-red-600">{errors.shift}</p>}
                                </div>
                                <div>
                                    <label htmlFor="date" className="block text-sm text-gray-700 mb-1">Ngày</label>
                                    <input
                                        id="date"
                                        name="date"
                                        type="date"
                                        value={schedule.date || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                    />
                                    {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
                                </div>
                                <div className="col-span-full flex justify-between items-center mt-8">
                                    <div className="flex space-x-4">
                                        <button
                                            type="submit"
                                            className="bg-custom-blue hover:bg-custom-bluehover2 text-white font-semibold text-sm rounded-lg w-28 h-12"
                                        >
                                            Cập nhật
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-sm rounded-lg w-36 h-12"
                                            onClick={() => navigate("/admin/schedules")}
                                        >
                                            Quay về danh sách
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScheduleUpdatePage;