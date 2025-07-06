import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import AdminNavSidebar from '../components/AdminNavSidebar';
import { DoctorService } from '../services/doctorService';
import { listService } from '../services/medicalService';
import { createSchedule } from '../services/scheduleService';

function ScheduleAddPage() {
    const [formData, setFormData] = useState({
        userId: '',
        room: '',
        shift: '',
        date: '',
    });

    const [specialties, setSpecialties] = useState([{ value: '', label: 'Chọn chuyên khoa' }]);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    // const [loadingUsers, setLoadingUsers] = useState(false); // Không còn dùng nữa
    const navigate = useNavigate();
    const days = [
        { value: '', label: 'Chọn ngày' },
        { value: 'Thứ 2', label: 'Thứ 2 (01/05)' },
        { value: 'Thứ 3', label: 'Thứ 3 (02/05)' },
        { value: 'Thứ 4', label: 'Thứ 4 (03/05)' },
        { value: 'Thứ 5', label: 'Thứ 5 (04/05)' },
        { value: 'Thứ 6', label: 'Thứ 6 (05/05)' },
        { value: 'Thứ 7', label: 'Thứ 7 (06/05)' },
        { value: 'Chủ nhật', label: 'Chủ nhật (07/05)' }
    ];

    // Set giờ mặc định khi chọn ca làm việc
    const handleShiftChange = (e) => {
        const shift = e.target.value;
        setFormData((prev) => ({ ...prev, shift }));
        // Nếu modal đang mở thì set giờ mặc định luôn
        if (modalOpen) {
            if (shift === 'MORNING') {
                setModalForm((prev) => ({ ...prev, startTime: '07:00', endTime: '12:00' }));
            } else if (shift === 'AFTERNOON') {
                setModalForm((prev) => ({ ...prev, startTime: '13:00', endTime: '17:00' }));
            } else if (shift === 'EVENING') {
                setModalForm((prev) => ({ ...prev, startTime: '18:00', endTime: '21:00' }));
            } else {
                setModalForm((prev) => ({ ...prev, startTime: '', endTime: '' }));
            }
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingServices(true);
            try {
                const data = await listService();
                const services = data.services || data;
                if (!Array.isArray(services)) throw new Error('Dữ liệu dịch vụ cận lâm sàng không hợp lệ.');
            } catch (error) {
                setFetchError(`Không thể tải danh sách dịch vụ cận lâm sàng. Lỗi: ${error.message}`);
                toast.error('Không thể tải danh sách dịch vụ cận lâm sàng.', { style: { background: '#EF4444', color: '#fff' } });
            } finally {
                setIsLoadingServices(false);
            }

            try {
                const specialtiesData = await fetch('http://localhost:3000/api/specialty').then(res => {
                    if (!res.ok) throw new Error('Không thể tải danh sách chuyên khoa.');
                    return res.json();
                });
                const specialtiesOptions = [{ value: '', label: 'Chọn chuyên khoa' }].concat(
                    (Array.isArray(specialtiesData) ? specialtiesData : []).map(s => ({
                        value: s._id || s.id || s.value,
                        label: s.name || s.label || s.specialtyName || 'Chuyên khoa',
                    }))
                );
                setSpecialties(specialtiesOptions);
            } catch {
                toast.error('Không thể tải danh sách chuyên khoa.', { style: { background: '#EF4444', color: '#fff' } });
            }
        };
        fetchData();
    }, []);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState({
    userId: '',
    room: '',
    shift: '',
    date: [],  // Initialize date as an empty array
});
    const [modalErrors, setModalErrors] = useState({});
    // State để lưu các lịch trình đã tạo và hiển thị trên bảng
    const [localSchedules, setLocalSchedules] = useState([]);

    const addNewSchedulesToLocal = (newSchedules) => {
    setLocalSchedules((prevSchedules) => [...prevSchedules, ...newSchedules]);
};

    // Open modal when click cell
    const handleCellClick = (room, day) => {
        let date = '';
        if (day && day !== '') {
            // Giả sử tuần này, lấy ngày gần nhất ứng với thứ đã chọn
            const today = new Date();
            const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            const idx = weekdays.findIndex(w => day.includes(w));
            if (idx !== -1) {
                const nowDay = today.getDay();
                let diff = idx - nowDay;
                if (diff < 0) diff += 7;
                const d = new Date(today);
                d.setDate(today.getDate() + diff);
                date = d.toISOString().slice(0, 10);
            }
        }
        setModalForm({
            userId: '',
            room,
            shift: formData.shift,
            date,
        });
        setModalErrors({});
        setModalOpen(true);
    };
    const handleModalClose = () => setModalOpen(false);
    const handleModalFormChange = (e) => {
    const { name, value } = e.target; 
    if (name === "date") {
        const newDates = value ? value.split(",").map(d => d.trim()) : []; 
        setModalForm((prev) => ({ ...prev, [name]: newDates }));
    } else {
        setModalForm((prev) => ({ ...prev, [name]: value }));
    }
};
    const validateModalForm = () => {
        const errors = {};
        if (!modalForm.userId) errors.userId = 'Vui lòng chọn nhân viên';
        if (!modalForm.room) errors.room = 'Vui lòng chọn phòng';
        if (!modalForm.shift) errors.shift = 'Vui lòng chọn ca làm việc';
        if (!modalForm.date) errors.date = 'Vui lòng chọn ngày';
        return errors;
    };
    
    const handleModalSubmit = (e) => {
        e.preventDefault();
        const errors = validateModalForm();
        // Validate ca làm việc (shift) khi lưu tạm thời
        if (!formData.shift) {
            errors.shift = 'Vui lòng chọn ca làm việc';
        }
        if (Object.keys(errors).length > 0) {
            setModalErrors(errors);
            return;
        }

        const doctor = doctors.find(d => d._id === modalForm.userId);
        const specialty = specialties.find(s => s.value === formData.department)?.label || '';

        // Đảm bảo modalForm.date là một mảng
        const selectedDates = Array.isArray(modalForm.date) ? modalForm.date : [modalForm.date]; // Nếu không phải mảng, tạo mảng

        const newSchedules = selectedDates.map(date => {
            return {
                userId: modalForm.userId,
                room: modalForm.room,
                shift: formData.shift,
                date: date,
                fullName: doctor?.fullName || '',
                specialty,
            };
        });

        // Gọi addNewSchedulesToLocal để thêm tất cả các lịch trình vào localSchedules
        addNewSchedulesToLocal(newSchedules);

        toast.success('Đã lưu tất cả lịch trình tạm thời (chưa gửi lên server)', {
            style: { background: '#10B981', color: '#fff' },
        });
        setModalOpen(false);
    };





    const handleCreateSchedule = async () => {
        // Lấy tất cả lịch trình tạm thời từ localSchedules, group theo userId, room, shift, date
        if (!localSchedules.length) {
            toast.error('Không có lịch trình nào để tạo!');
            return;
        }
        // Chỉ gửi các trường cần thiết cho backend
        const schedulesToCreate = localSchedules.map(s => ({
            userId: s.userId,
            room: rooms.find(r => r.roomNumber === s.room || r._id === s.room)?._id || s.room,
            shift: s.shift,
            date: s.date,
        }));
        try {
            const res = await createSchedule({
                userId: schedulesToCreate[0].userId,
                room: schedulesToCreate[0].room,
                shift: schedulesToCreate[0].shift,
                date: schedulesToCreate.map(s => s.date),
            });
            toast.success(res.message || 'Tạo lịch trình thành công!', {
                style: { background: '#10B981', color: '#fff' },
            });
            setLocalSchedules([]);
            navigate('/admin/schedules');
        } catch (error) {
            console.error('Lỗi khi tạo lịch trình:', error);
            toast.error(error.response?.data?.error || 'Tạo lịch trình thất bại!', {
                style: { background: '#EF4444', color: '#fff' },
            });
        }
    };





    // Danh sách phòng và bác sĩ theo chuyên khoa
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [roomError, setRoomError] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [doctorError, setDoctorError] = useState(null);

    // Fetch rooms and doctors when department (specialty) changes
    useEffect(() => {
        const fetchRoomsAndDoctors = async () => {
            if (!formData.department) {
                setRooms([]);
                setDoctors([]);
                return;
            }
            setLoadingRooms(true);
            setLoadingDoctors(true);
            try {
                const specialtyRes = await fetch(`http://localhost:3000/api/specialty/${formData.department}`);
                if (!specialtyRes.ok) throw new Error('Không thể tải chuyên khoa.');
                const specialty = await specialtyRes.json();
                setRooms(Array.isArray(specialty.room) ? specialty.room : []);
            } catch {
                setRoomError('Không thể tải danh sách phòng.');
                setRooms([]);
            } finally {
                setLoadingRooms(false);
            }
            try {
                const doctorProfiles = await DoctorService.getDoctorsBySpecialty(formData.department);
                if (Array.isArray(doctorProfiles)) {
                  setDoctors(doctorProfiles.filter(d => d.doctorId && d.doctorId.fullName).map(d => d.doctorId));
                } else {
                  setDoctors([]);
                }
            } catch {
                setDoctorError('Không thể tải danh sách bác sĩ.');
                setDoctors([]);
            } finally {
                setLoadingDoctors(false);
            }
        };
        fetchRoomsAndDoctors();
    }, [formData.department]);

    if (fetchError || roomError || doctorError) {
        return (
            <div className="flex text-[1.75rem]">
                <Toaster />
                <AdminNavSidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center py-15 text-xl text-red-500">{fetchError}</div>
                    <button
                        onClick={() => navigate('/admin/schedules')}
                        className="mt-5 bg-gray-500 hover:bg-gray-600 text-white font-semibold text-lg rounded-lg px-12 py-4"
                    >
                        Quay về danh sách
                    </button>
                </div>
            </div>
        );
    }

    if (isLoadingServices || loadingRooms || loadingDoctors) {
        return (
            <div className="flex text-[1.75rem]">
                <Toaster />
                <AdminNavSidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center py-15 text-xl text-gray-600">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Toaster />
            <main className="flex-1 p-8 flex flex-col gap-6">
                <div className="flex justify-between items-center max-w-6xl w-full">
                    <h1 className="text-4xl font-bold">Tạo lịch trình làm việc mới</h1>
                    <div className="w-64">
                        <label htmlFor="department" className="block mb-1 font-semibold text-gray-700">Chọn chuyên khoa</label>
                        <select
                            id="department"
                            name="department"
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                        >
                            {specialties.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-64">
                        <label htmlFor="shift" className="block mb-1 font-semibold text-gray-700">Chọn ca làm việc</label>
                        <select
                            id="shift"
                            name="shift"
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.shift}
                            onChange={handleShiftChange}
                        >
                            <option value="">Chọn ca làm việc</option>
                            <option value="MORNING">Ca sáng (7h - 12h)</option>
                            <option value="AFTERNOON">Ca chiều (13h - 17h)</option>
                            <option value="EVENING">Ca tối (18h - 21h)</option>
                        </select>
                    </div> 
                </div>

                <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-8xl w-full overflow-x-auto">
                    <table className="w-full border border-gray-300 rounded-lg table-fixed text-center">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-300">
                                <th className="border-r border-gray-300 py-3 font-semibold text-sm bg-white max-w-[140px]">Phòng</th>
                                {days.slice(1).map((d) => (
                                    <th key={d.value} className="border-r border-gray-300 py-3 font-semibold text-sm">
                                        {d.label}<br /><span className="text-xs font-normal">{d.label.match(/\((.*?)\)/)?.[1]}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room._id || room.roomNumber} className="border-t border-gray-300">
                                    <td className="border-r border-gray-300 py-5 font-medium text-gray-700 bg-gray-50 max-w-[140px]">
                                        {room.roomName || room.roomNumber}
                                    </td>
                                    {days.slice(1).map((d) => {
                                        // Tìm lịch trình đã tạo cho phòng này, ngày này, ca này
                                        const cellDate = (() => {
                                            let date = '';
                                            if (d.value && d.value !== '') {
                                                const today = new Date();
                                                const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                                const idx = weekdays.findIndex(w => d.value.includes(w));
                                                if (idx !== -1) {
                                                    const nowDay = today.getDay();
                                                    let diff = idx - nowDay;
                                                    if (diff < 0) diff += 7;
                                                    const dt = new Date(today);
                                                    dt.setDate(today.getDate() + diff);
                                                    date = dt.toISOString().slice(0, 10);
                                                }
                                            }
                                            return date;
                                        })();
                                        const schedule = localSchedules.find(s =>
                                            (s.room === (room._id || room.roomNumber) || s.room === room.roomNumber)
                                            && s.date === cellDate
                                            && s.shift === formData.shift
                                        );
                                        return (
                                            <td
                                                key={d.value}
                                                className="border-r border-gray-300 py-5 cursor-pointer schedule-cell hover:bg-blue-50"
                                                onClick={() => handleCellClick(room.roomNumber, d.value)}
                                            >
                                                {schedule && (
                                                    <div className="text-xs text-blue-700 font-semibold">
                                                        <div><span className="font-semibold">Bác sĩ:</span> {schedule.fullName}</div>
                                                        <div><span className="font-semibold">Chuyên khoa:</span> {schedule.specialty}</div>
                                                        <div><span className="font-semibold">Số phòng:</span> {room.roomNumber || room._id}</div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <div className="flex justify-start space-x-4 pt-6">
                                        <button
                                        type="button"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2 rounded-md transition"
                                        onClick={handleCreateSchedule}
                                        >
                                        Tạo mới
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-8 py-2 rounded-md transition"
                                            onClick={() => { setModalOpen(false); navigate('/admin/schedules'); }}
                                        >
                                            Quay về danh sách
                                        </button>
                                    </div>

                
                {modalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                            <button
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                                aria-label="Close modal"
                                type="button"
                                onClick={handleModalClose}
                            >
                                <span className="text-xl">×</span>
                            </button>
                            <h3 className="text-xl font-semibold mb-4">Tạo lịch trình</h3>
                            <form className="space-y-4" onSubmit={handleModalSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
                                    <input
                                        type="text"
                                        name="room"
                                        value={modalForm.room}
                                        readOnly
                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 text-sm cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                                    <input
                                    type="text"
                                    name="date"
                                    value={Array.isArray(modalForm.date) ? modalForm.date.join(", ") : modalForm.date}
                                    onChange={handleModalFormChange}
                                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />

                                    {modalErrors.date && <p className="text-xs text-red-600 mt-1">{modalErrors.date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                                    <select
                                        name="userId"
                                        required
                                        value={modalForm.userId}
                                        onChange={handleModalFormChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Chọn bác sĩ</option>
                                        {doctors.map((user) => (
                                            <option key={user._id} value={user._id}>{user.fullName}</option>
                                        ))}
                                    </select>
                                    {modalErrors.userId && <p className="text-xs text-red-600 mt-1">{modalErrors.userId}</p>}
                                </div>
                                {modalErrors.shift && (
                                    <div className="text-xs text-red-600 mt-1">{modalErrors.shift}</div>
                                )}

                                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-md transition"
                                        onClick={handleModalClose}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition"
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ScheduleAddPage;