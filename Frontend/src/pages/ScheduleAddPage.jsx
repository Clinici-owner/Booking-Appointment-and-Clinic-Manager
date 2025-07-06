import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import AdminNavSidebar from '../components/AdminNavSidebar';
import { DoctorService } from '../services/doctorService';
import { listService } from '../services/medicalService';
import { createSchedule, getAllSchedules } from '../services/scheduleService';

function ScheduleAddPage() {
    // Giá trị mặc định: ca làm việc đầu tiên và tất cả chuyên khoa (nếu có)
    const defaultShifts = ['MORNING', 'AFTERNOON', 'EVENING'];
    const [formData, setFormData] = useState({
        userId: '',
        room: '',
        shift: defaultShifts[0],
        date: '',
        department: '', // sẽ set sau khi fetch specialties
    });

    // Chuyên khoa mặc định: sẽ set sau khi fetch
    const [specialties, setSpecialties] = useState([]);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();
    // Hiển thị tuần cố định từ 07/07 đến 13/07/2025
    const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    // const fixedMonday = new Date(2025, 6, 7); // Không cần dùng biến này
    const days = [
        { value: '', label: 'Chọn ngày' },
        ...Array.from({ length: 7 }).map((_, i) => {
            // Tạo ngày chính xác không bị lệch múi giờ
            const d = new Date(Date.UTC(2025, 6, 7 + i)); // Luôn dùng UTC để không bị lùi ngày
            const weekday = weekdays[d.getUTCDay()];
            const dayStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
            return {
                value: d.toISOString().slice(0, 10),
                label: `${weekday} (${dayStr})`,
                date: d.toISOString().slice(0, 10)
            };
        })
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
                const specialtiesOptions = (Array.isArray(specialtiesData) ? specialtiesData : []).map(s => ({
                    value: s._id || s.id || s.value,
                    label: s.name || s.label || s.specialtyName || 'Chuyên khoa',
                }));
                setSpecialties(specialtiesOptions);
                // Nếu có ít nhất 2 chuyên khoa, mặc định chọn cả 2 (hoặc tất cả)
               if (specialtiesOptions.length > 0) {
                setFormData(prev => ({
                    ...prev,
                    department: specialtiesOptions.length > 1
                        ? specialtiesOptions.map(s => s.value)
                        : [specialtiesOptions[0].value]
                }));
            }
            } catch {
                toast.error('Không thể tải danh sách chuyên khoa.', { style: { background: '#EF4444', color: '#fff' } });
            }

            // Fetch all schedules from server
            try {
                const allSchedules = await getAllSchedules();
                setServerSchedules(Array.isArray(allSchedules) ? allSchedules : []);
            } catch {
                toast.error('Không thể tải danh sách lịch trình từ server.', { style: { background: '#EF4444', color: '#fff' } });
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


    const [serverSchedules, setServerSchedules] = useState([]);

    // Sửa: Cho phép click vào ô đã có lịch để chỉnh sửa
    const handleCellClick = (room, day, schedule) => {
        if (schedule) {
            setModalForm({
                userId: schedule.userId?._id || schedule.userId,
                room: schedule.room?._id || schedule.room,
                shift: schedule.shift,
                date: schedule.date,
                _id: schedule._id // Để biết là edit mode
            });
            setModalErrors({});
            setModalOpen(true);
        } else {
            // day ở đây là ISO string (yyyy-mm-dd) truyền từ cell
            setModalForm({
                userId: '',
                room,
                shift: formData.shift,
                date: day, // Gán đúng ngày của ô
            });
            setModalErrors({});
            setModalOpen(true);
        }
    };
    const handleModalClose = () => setModalOpen(false);
    const handleModalFormChange = (e) => {
        const { name, value } = e.target;
        if (name === "date") {
            // Chỉ cho phép chọn ngày trong tuần 07/07 - 13/07/2025 (UTC)
            const allowedDates = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(Date.UTC(2025, 6, 7 + i));
                return d.toISOString().slice(0, 10);
            });
            const newDates = value
                ? value.split(",").map(d => d.trim()).filter(d => allowedDates.includes(d))
                : [];
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

    // Sửa: Xử lý submit cho cả thêm mới và chỉnh sửa (tạo luôn trên backend khi bấm Lưu)
    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const errors = validateModalForm();
        if (!formData.shift) {
            errors.shift = 'Vui lòng chọn ca làm việc';
        }
        if (Object.keys(errors).length > 0) {
            setModalErrors(errors);
            return;
        }

        if (modalForm._id) {
            // Edit mode: update schedule
            try {
                const updateData = {
                    userId: modalForm.userId,
                    room: modalForm.room,
                    shift: modalForm.shift,
                    date: modalForm.date
                };
                await import('../services/scheduleService').then(m => m.updateSchedule(modalForm._id, updateData));
                // Refresh server schedules
                const updated = await import('../services/scheduleService').then(m => m.getAllSchedules());
                setServerSchedules(updated);
                toast.success('Cập nhật lịch trình thành công!', {
                    style: { background: '#10B981', color: '#fff' },
                });
                setModalOpen(false);
            } catch (error) {
                toast.error(error.response?.data?.error || 'Cập nhật lịch trình thất bại!', {
                    style: { background: '#EF4444', color: '#fff' },
                });
            }
        } else {
            // Tạo mới: gọi API tạo lịch trình luôn
            try {
                const selectedDates = Array.isArray(modalForm.date) ? modalForm.date : [modalForm.date];
                const res = await createSchedule({
                    userId: modalForm.userId,
                    room: rooms.find(r => r.roomNumber === modalForm.room || r._id === modalForm.room)?._id || modalForm.room,
                    shift: formData.shift,
                    date: selectedDates,
                });
                // Refresh server schedules
                const updated = await import('../services/scheduleService').then(m => m.getAllSchedules());
                setServerSchedules(updated);
                toast.success(res.message || 'Tạo lịch trình thành công!', {
                    style: { background: '#10B981', color: '#fff' },
                });
                setModalOpen(false);
            } catch (error) {
                toast.error(error.response?.data?.error || 'Tạo lịch trình thất bại!', {
                    style: { background: '#EF4444', color: '#fff' },
                });
            }
        }
    };






    // Đã bỏ nút tạo mới, không còn lưu tạm localSchedules


    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [roomError, setRoomError] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [doctorError, setDoctorError] = useState(null);

    // Fetch rooms and doctors when department (specialty) changes
    useEffect(() => {
    const fetchRoomsAndDoctors = async () => {
        if (!formData.department || formData.department.length === 0) {
            setRooms([]);
            setDoctors([]);
            return;
        }
        setLoadingRooms(true);
        setLoadingDoctors(true);
        const departmentArr = formData.department;
        try {
            let allRooms = [];
            for (const dep of departmentArr) {
                const specialtyRes = await fetch(`http://localhost:3000/api/specialty/${dep}`);
                if (specialtyRes.ok) {
                    const specialty = await specialtyRes.json();
                    if (Array.isArray(specialty.room)) {
                        allRooms = allRooms.concat(specialty.room);
                    }
                }
            }
            setRooms(allRooms);
        } catch {
            setRoomError('Không thể tải danh sách phòng.');
            setRooms([]);
        } finally {
            setLoadingRooms(false);
        }
        try {
            let allDoctors = [];
            for (const dep of departmentArr) {
                const doctorProfiles = await DoctorService.getDoctorsBySpecialty(dep);
                if (Array.isArray(doctorProfiles)) {
                    allDoctors = allDoctors.concat(doctorProfiles.filter(d => d.doctorId && d.doctorId.fullName).map(d => d.doctorId));
                }
            }
            setDoctors(allDoctors);
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
                    <div className="w-72">
                        <label htmlFor="department" className="block mb-1 font-semibold text-gray-700">Chọn chuyên khoa</label>
                        <div className="relative">
                            <select
                                id="department"
                                name="department"
                                className="w-full rounded-lg border border-blue-400 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-150 hover:border-blue-600"
                                value={formData.department}
                                onChange={e => {
                                    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                                    setFormData({ ...formData, department: selected });
                                }}
                                multiple
                                size={Math.min(6, specialties.length)}
                            >
                                {specialties.map((s) => (
                                    <option key={s.value} value={s.value} className="py-2 px-2 rounded hover:bg-blue-100">
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                            <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 9l6 6 6-6"/></svg>
                            </span>
                        </div>

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
                        // Tính ngày tương ứng với ô
                        // Lấy đúng ngày ISO cho từng cột
                        const cellDate = d.date;

                        const normalizeDate = (iso) => new Date(iso).toISOString().slice(0, 10);
                        const roomId = room._id || room.roomNumber;

                        const schedules = [
                            ...serverSchedules.filter(s =>
                                (s.room?._id === roomId || s.room?.roomNumber === room.roomNumber || s.room === roomId)
                                && normalizeDate(s.date) === cellDate
                                && s.shift === formData.shift
                            ).map(s => ({
                                ...s,
                                fullName: s.userId?.fullName || '',
                                specialty: s.userId?.specialtyName || '',
                            }))
                        ];

                        // Nếu có nhiều lịch trình, chỉ cho phép sửa lịch trình đầu tiên (ưu tiên server)
                        const editSchedule = schedules.length > 0 ? schedules[0] : null;
                        const isScheduled = schedules.length > 0;

                        return (
                            <td
                                key={d.value}
                                className={`border-r border-gray-300 py-5 schedule-cell ${isScheduled ? 'bg-red-500 cursor-pointer hover:bg-red-400' : 'cursor-pointer hover:bg-blue-50'}`}
                                onClick={() => handleCellClick(room.roomNumber, d.date, editSchedule)}
                            >
                                {isScheduled ? (
                                    <div className="text-xs text-white font-semibold text-center">
                                        {schedules.map((s, idx) => (
                                            <div key={idx}>
                                                {s.fullName && <div>{s.fullName}</div>}
                                                {s.specialty && <div className="italic text-sm">{s.specialty}</div>}
                                                <div className="italic text-white text-xs">Đã có lịch</div>
                                                {idx !== schedules.length - 1 && <hr className="my-1" />}
                                            </div>
                                        ))}
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


                <div className="flex justify-start space-x-4 pt-6">
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
                            <h3 className="text-xl font-semibold mb-4">{modalForm._id ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình'}</h3>
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
                                        readOnly={!(!modalForm._id)}
                                        onChange={modalForm._id ? handleModalFormChange : undefined}
                                        className={`w-full rounded-md border border-gray-300 ${modalForm._id ? 'bg-white' : 'bg-gray-100'} px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${modalForm._id ? '' : 'cursor-not-allowed'}`}
                                    />
                                    {modalErrors.date && <p className="text-xs text-red-600 mt-1">{modalErrors.date}</p>}
                                </div>
                                {modalForm._id && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc</label>
                                        <select
                                            name="shift"
                                            value={modalForm.shift}
                                            onChange={handleModalFormChange}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="MORNING">Ca sáng (7h - 12h)</option>
                                            <option value="AFTERNOON">Ca chiều (13h - 17h)</option>
                                            <option value="EVENING">Ca tối (18h - 21h)</option>
                                        </select>
                                    </div>
                                )}
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