import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import AdminNavSidebar from '../components/AdminNavSidebar';
import { DoctorService } from '../services/doctorService';
import { listService } from '../services/medicalService';
import { createSchedule, getAllSchedules } from '../services/scheduleService';

function ScheduleAddPage() {
    // State lưu selectedName cho từng cell (key: roomId+date)

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
    // Hiển thị tuần động theo ngày hiện tại của máy tính
    const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    // Lấy ngày đầu tuần (thứ 2) dựa trên ngày hiện tại
    function getMonday(d) {
        const date = new Date(d);
        const day = date.getDay();
        // Nếu là Chủ nhật (0), lùi về thứ 2 tuần trước
        const diff = day === 0 ? -6 : 1 - day;
        date.setDate(date.getDate() + diff);
        date.setHours(0,0,0,0);
        return date;
    }
    const today = new Date();
    const monday = getMonday(today);
    const days = [
        { value: '', label: 'Chọn ngày' },
        ...Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const weekday = weekdays[d.getDay()];
            const dayStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
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
                // Mặc định chọn chuyên khoa "Khoa nội" nếu có, nếu không thì chọn chuyên khoa đầu tiên
                const noiKhoa = specialtiesOptions.find(s => s.label.toLowerCase().includes('nội'));
                if (noiKhoa) {
                    setFormData(prev => ({ ...prev, department: [noiKhoa.value] }));
                } else if (specialtiesOptions.length > 0) {
                    setFormData(prev => ({ ...prev, department: [specialtiesOptions[0].value] }));
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
        userId: [], // allow multiple
        room: '',
        shift: '',
        date: [],  // Initialize date as an empty array
    });
    const [modalErrors, setModalErrors] = useState({});


    const [serverSchedules, setServerSchedules] = useState([]);

    // Sửa: Cho phép click vào ô đã có lịch để chỉnh sửa
    const [isEditMode, setIsEditMode] = useState(false);
    const handleCellClick = (room, day, schedule) => {
        if (schedule) {
            // Nếu có nhiều nhân viên trong 1 cell (nhiều lịch trình cùng phòng/ngày/ca), lấy tất cả userId
            const currentRoom = schedule.room?._id || schedule.room;
            const currentDate = new Date(schedule.date).toISOString().slice(0, 10);
            const currentShift = schedule.shift;
            // Lấy tất cả lịch trình cùng phòng/ngày/ca
            const allSchedules = serverSchedules.filter(s =>
                (s.room?._id === currentRoom || s.room === currentRoom || s.room?.roomNumber === currentRoom)
                && new Date(s.date).toISOString().slice(0, 10) === currentDate
                && s.shift === currentShift
            );
            const allUserIds = allSchedules.map(s => s.userId?._id || s.userId).filter(Boolean);
            setModalForm({
                userId: allUserIds,
                room: currentRoom,
                shift: currentShift,
                date: schedule.date,
                _id: undefined // Khi click cả ô, cho phép chỉnh sửa nhiều bác sĩ, nhưng vẫn là edit mode
            });
            setIsEditMode(true);
            setModalErrors({});
            setModalOpen(true);
        } else {
            // day ở đây là ISO string (yyyy-mm-dd) truyền từ cell
            setModalForm({
                userId: [],
                room,
                shift: formData.shift,
                date: day, // Gán đúng ngày của ô
            });
            setIsEditMode(false);
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
        if (!modalForm.userId || (Array.isArray(modalForm.userId) && modalForm.userId.length === 0)) errors.userId = 'Vui lòng chọn nhân viên';
        if (!modalForm.room) errors.room = 'Vui lòng chọn phòng';
        if (!modalForm.shift) errors.shift = 'Vui lòng chọn ca làm việc';
        if (!modalForm.date) errors.date = 'Vui lòng chọn ngày';

        // Lấy thông tin lịch trình hiện tại
        const currentRoom = modalForm.room;
        const currentDate = Array.isArray(modalForm.date) ? modalForm.date[0] : modalForm.date;
        const currentShift = modalForm.shift || formData.shift;
        const userIds = Array.isArray(modalForm.userId) ? modalForm.userId : [modalForm.userId];
        const selectedUsers = doctors.filter(u => userIds.includes(u._id));

        for (const user of selectedUsers) {
            if (user.role === 'nursing') {
                // Lấy chuyên khoa hiện tại
                let currentSpecialty = formData.department;
                if (Array.isArray(currentSpecialty)) currentSpecialty = currentSpecialty[0];
                // 1. Nếu điều dưỡng đã có lịch ở chuyên khoa khác cùng ca (bất kỳ ngày nào), không cho chọn lại ở chuyên khoa khác cùng ca
                const hasSpecialtyConflict = serverSchedules.some(s => {
                    const sUserId = s.userId?._id || s.userId;
                    if (sUserId !== user._id) return false;
                    if (modalForm._id && s._id === modalForm._id) return false;
                    // Lấy chuyên khoa của lịch trình đã có
                    const sSpecialty = s.specialty || s.department || (s.room?.specialty || s.room?.department);
                    // Nếu khác chuyên khoa và cùng ca (bất kỳ ngày nào)
                    return s.shift === currentShift && sSpecialty && currentSpecialty && sSpecialty !== currentSpecialty;
                });
                if (hasSpecialtyConflict) {
                    toast.error(`Điều dưỡng "${user.fullName}" đã có lịch ở chuyên khoa khác trong cùng ca!`, { style: { background: '#EF4444', color: '#fff' } });
                    errors.userId = `Điều dưỡng "${user.fullName}" đã có lịch ở chuyên khoa khác trong cùng ca!`;
                    break;
                }
                // 2. Nếu chọn điều dưỡng đó trong cùng 1 ca nhưng ở phòng khác trong ngày đó sẽ báo lỗi trùng lịch giống bác sĩ/kỹ thuật viên
                const hasRoomConflict = serverSchedules.some(s => {
                    const sUserId = s.userId?._id || s.userId;
                    if (sUserId !== user._id) return false;
                    if (modalForm._id && s._id === modalForm._id) return false;
                    const sDate = new Date(s.date).toISOString().slice(0, 10);
                    const modalDate = new Date(currentDate).toISOString().slice(0, 10);
                    return (
                        sDate === modalDate &&
                        s.shift === currentShift &&
                        (s.room?._id?.toString() || s.room?.toString() || s.room) !== currentRoom.toString()
                    );
                });
                if (hasRoomConflict) {
                    toast.error(`Điều dưỡng "${user.fullName}" đã có lịch ở phòng khác trong cùng ca/ngày!`, { style: { background: '#EF4444', color: '#fff' } });
                    errors.userId = `Điều dưỡng "${user.fullName}" đã có lịch ở phòng khác trong cùng ca/ngày!`;
                    break;
                }
            }
        }
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
            // Edit mode: update schedule (chỉ cho phép sửa 1 lịch trình 1 bác sĩ)
            try {
                const updateData = {
                    userId: Array.isArray(modalForm.userId) ? modalForm.userId[0] : modalForm.userId,
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
            return;
        }

        // Chỉnh sửa nhiều bác sĩ (click cả ô, không có _id, userId là mảng)
        if (!modalForm._id && Array.isArray(modalForm.userId) && modalForm.userId.length > 0) {
            try {
                // Lấy ObjectId của phòng
                const currentRoom = (() => {
                    const found = rooms.find(r => r.roomNumber === modalForm.room || r._id === modalForm.room);
                    return found ? found._id : modalForm.room;
                })();
                const currentDate = Array.isArray(modalForm.date) ? modalForm.date[0] : modalForm.date;
                const currentShift = modalForm.shift || formData.shift;
                // Lấy danh sách lịch trình đã có ở phòng/ngày/ca này
                const existedSchedules = serverSchedules.filter(s =>
                    (s.room?._id === currentRoom || s.room === currentRoom || s.room?.roomNumber === currentRoom)
                    && new Date(s.date).toISOString().slice(0, 10) === new Date(currentDate).toISOString().slice(0, 10)
                    && s.shift === currentShift
                );
                const existedUserIds = existedSchedules.map(s => s.userId?._id?.toString() || s.userId?.toString());
                const newUserIds = modalForm.userId.map(id => id.toString()).filter(id => !existedUserIds.includes(id));
                const removedUserIds = existedUserIds.filter(id => !modalForm.userId.map(x => x.toString()).includes(id));

                // Tạo lịch cho bác sĩ mới
                for (const uid of newUserIds) {
                    await createSchedule({
                        userId: uid,
                        room: currentRoom,
                        shift: currentShift,
                        date: currentDate,
                    });
                }
                // Xóa lịch cho bác sĩ bị bỏ chọn
                for (const uid of removedUserIds) {
                    const scheduleToDelete = existedSchedules.find(s => (s.userId?._id?.toString() || s.userId?.toString()) === uid);
                    if (scheduleToDelete) {
                        await import('../services/scheduleService').then(m => m.deleteSchedule(scheduleToDelete._id));
                    }
                }
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
            return;
        }

        // Tạo mới hoàn toàn (chưa có lịch nào ở phòng/ngày/ca này)
        try {
            // Lấy ObjectId của phòng
            const currentRoom = (() => {
                const found = rooms.find(r => r.roomNumber === modalForm.room || r._id === modalForm.room);
                return found ? found._id : modalForm.room;
            })();
            const selectedDates = Array.isArray(modalForm.date) ? modalForm.date : [modalForm.date];
            const userIds = Array.isArray(modalForm.userId) ? modalForm.userId : [modalForm.userId];
            const createPromises = userIds.map(uid =>
                createSchedule({
                    userId: uid,
                    room: currentRoom,
                    shift: formData.shift,
                    date: selectedDates,
                })
            );
            await Promise.all(createPromises);
            // Refresh server schedules
            const updated = await import('../services/scheduleService').then(m => m.getAllSchedules());
            setServerSchedules(updated);
            toast.success('Tạo lịch trình thành công!', {
                style: { background: '#10B981', color: '#fff' },
            });
            setModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Tạo lịch trình thất bại!', {
                style: { background: '#EF4444', color: '#fff' },
            });
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

    // MultiSelectDropdown component for user selection by role
    function MultiSelectDropdown({ users, selected, onChange, placeholder = [], bookedUserIds = [], editMode = false }) {
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(null);
    const handleToggle = () => setOpen(v => !v);
    const handleBlur = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    };
    // Ẩn khỏi dropdown những nhân viên đã được chọn lịch trình ở ca/phòng/ngày này (bookedUserIds)
    // và cả những nhân viên đã được chọn trong form hiện tại (selected)
    const filteredUsers = users.filter(u =>
        !(selected.includes(u._id) || bookedUserIds.includes(u._id))
    );

    // Hiển thị tên đã chọn với hiệu ứng hover từng tên riêng biệt khi ở edit mode
    const renderSelectedNames = () => {
        const selectedUsers = users.filter(u => selected.includes(u._id));
        if (!editMode) {
            return (
                <div className="flex flex-wrap gap-1">
                    {selectedUsers.map(u => (
                        <span key={u._id} className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs mr-1 mb-1 inline-block">
                            {u.fullName}
                        </span>
                    ))}
                </div>
            );
        }
        // Edit mode: hover từng tên chỉ hiện đúng tên đó
        return (
            <div className="flex flex-wrap gap-1">
                {selectedUsers.map(u => (
                    <span
                        key={u._id}
                        className={`bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs mr-1 mb-1 inline-block transition-all duration-150 ${hovered === u._id ? 'bg-blue-600 text-white font-bold scale-110 z-10' : ''}`}
                        onMouseEnter={() => setHovered(u._id)}
                        onMouseLeave={() => setHovered(null)}
                    >
                        {hovered === u._id ? u.fullName : (selectedUsers.length === 1 ? u.fullName : hovered ? '' : u.fullName)}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="relative" tabIndex={0} onBlur={handleBlur}>
            <button
                type="button"
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-wrap min-h-[40px]"
                onClick={handleToggle}
            >
                {selected && selected.length > 0 && users.filter(u => selected.includes(u._id)).length > 0 ? (
                    renderSelectedNames()
                ) : <span className="text-gray-400">{placeholder}</span>}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#555" strokeWidth="2" d="M6 9l6 6 6-6"/></svg>
                </span>
            </button>
            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-56 overflow-y-auto animate-fade-in">
                    {filteredUsers.length === 0 && (
                        <div className="px-3 py-2 text-gray-400 text-sm">Không có nhân viên</div>
                    )}
                    {filteredUsers.map((user) => (
                        <label key={user._id} className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm">
                            <input
                                type="checkbox"
                                className="mr-2 accent-blue-600"
                                checked={false}
                                disabled={false}
                                onChange={e => {
                                    let newSelected = Array.isArray(selected) ? [...selected] : [];
                                    if (e.target.checked) {
                                        if (!newSelected.includes(user._id)) newSelected.push(user._id);
                                    } else {
                                        newSelected = newSelected.filter(id => id !== user._id);
                                    }
                                    onChange(newSelected);
                                }}
                            />
                            {user.fullName}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}



// Component hiển thị tên riêng biệt khi hover (không còn sử dụng, giữ lại để tránh lỗi import)
function HoverSingleName() {
    return null;
}

    return (
        <div className="flex min-h-screen">
            <Toaster />
            <main className="flex-1 p-8 flex flex-col gap-8 items-center bg-gradient-to-br from-blue-50 to-white min-h-screen">
                <div className="w-full max-w-4xl mx-auto flex flex-col items-center mb-6">
                    <h1 className="text-4xl font-bold text-center text-blue-700 mb-6 tracking-tight drop-shadow-lg">Lịch trình làm việc</h1>
                    <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
                        <div className="w-full md:w-1/2">
                            <label htmlFor="department" className="block mb-1 font-semibold text-gray-700">Chọn chuyên khoa</label>
                            <select
                                id="department"
                                name="department"
                                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={Array.isArray(formData.department) ? formData.department[0] : formData.department}
                                onChange={e => setFormData({ ...formData, department: [e.target.value] })}
                            >
                                {specialties.map((s) => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-1/2">
                            <label htmlFor="shift" className="block mb-1 font-semibold text-gray-700">Chọn ca làm việc</label>
                            <select
                                id="shift"
                                name="shift"
                                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                value={formData.shift}
                                onChange={handleShiftChange}
                            >
                                <option value="MORNING">Ca sáng (7h - 12h)</option>
                                <option value="AFTERNOON">Ca trưa (13h - 17h)</option>
                                <option value="EVENING">Ca chiều (18h - 21h)</option>
                            </select>
                        </div>
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
                        {room.roomNumber}
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
                        const isScheduled = schedules.length > 0;

                        
                        const handleCellBoxClick = () => {
                            if (!isScheduled) {
                                setIsEditMode(false); 
                                return handleCellClick(room.roomNumber, d.date, null);
                            }
                            
                            const allUserIds = schedules.map(s => s.userId?._id || s.userId).filter(Boolean);
                            setModalForm({
                                userId: allUserIds,
                                room: roomId,
                                shift: formData.shift,
                                date: cellDate,
                                _id: undefined 
                            });
                            setModalErrors({});
                            setIsEditMode(true); 
                            setModalOpen(true);
                        };

                        return (
                            <td
                                key={d.value}
                                className={`border-r border-gray-300 py-5 schedule-cell ${isScheduled ? 'bg-green-500 cursor-pointer hover:bg-green-400' : 'cursor-pointer hover:bg-blue-50'}`}
                                onClick={handleCellBoxClick}
                            >
                                {isScheduled ? (
                                    <div className="text-xs text-white font-semibold text-center">
                                        {schedules.map((s, idx) => {
                                            const userNames = s.fullName ? s.fullName.split('_') : [];
                                            return (
                                                <div key={idx}>
                                                    {userNames.length > 1 ? (
                                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
                                                            {userNames.map((name, i) => {
                                                                // Tìm đúng userId của nhân viên này trong schedules
                                                                const userObj = Array.isArray(s.userId) ? s.userId[i] : s.userId;
                                                                const userId = userObj?._id || userObj || (s.userId?._id || s.userId);
                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        className={`hover:bg-white hover:text-black transition rounded cursor-pointer px-1`}
                                                                        title={name.trim()}
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        setIsEditMode(true);
                                                                        setModalForm({
                                                                            userId: [userId],
                                                                            room: s.room?._id || s.room,
                                                                            shift: s.shift,
                                                                            date: s.date,
                                                                            _id: s._id
                                                                        });
                                                                        setModalErrors({});
                                                                        setModalOpen(true);
                                                                    }}
                                                                    >
                                                                        {name.trim()}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="hover:bg-white hover:text-black transition rounded cursor-pointer"
                                                            title={s.fullName}
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                setIsEditMode(true);
                                                                const userId = s.userId?._id || s.userId;
                                                                setModalForm({
                                                                    userId: [userId],
                                                                    room: s.room?._id || s.room,
                                                                    shift: s.shift,
                                                                    date: s.date,
                                                                    _id: s._id
                                                                });
                                                                setModalErrors({});
                                                                setModalOpen(true);
                                                            }}
                                                        >
                                                            {s.fullName}
                                                        </div>
                                                    )}
                                                    {s.specialty && <div className="italic text-sm">{s.specialty}</div>}
                                                    <div className="italic text-white text-xs">
                                                        {s.userId?.role === 'doctor' && 'Bác sĩ'}
                                                        {s.userId?.role === 'technician' && 'Kỹ thuật viên'}
                                                        {s.userId?.role === 'nursing' && 'Điều dưỡng'}
                                                        {(!s.userId?.role || (s.userId?.role !== 'doctor' && s.userId?.role !== 'technician' && s.userId?.role !== 'nursing')) && 'Nhân viên'}
                                                    </div>
                                                    {idx !== schedules.length - 1 && <hr className="my-1" />}
                                                </div>
                                            );
                                        })}
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



                {modalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)' }}>
                        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                            <button
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                                aria-label="Close modal"
                                type="button"
                                onClick={handleModalClose}
                            >
                                <span className="text-xl">×</span>
                            </button>
                            <h3 className="text-xl font-semibold mb-4">{isEditMode ? 'Chỉnh sửa lịch trình' : 'Tạo lịch trình'}</h3>

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
                                {(modalForm._id || (isEditMode && !modalForm._id)) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc</label>
                                        <select
                                            name="shift"
                                            value={modalForm.shift}
                                            onChange={handleModalFormChange}
                                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="MORNING">Ca sáng (7h - 12h)</option>
                                            <option value="AFTERNOON">Ca trưa (13h - 17h)</option>
                                            <option value="EVENING">Ca chiều (18h - 21h)</option>
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bác sĩ</label>
                                    <MultiSelectDropdown
                                        users={doctors.filter(u => u.role === 'doctor')}
                                        selected={modalForm.userId}
                                        onChange={newSelected =>
                                            modalForm._id
                                                ? setModalForm(prev => ({ ...prev, userId: newSelected.slice(-1) }))
                                                : setModalForm(prev => ({ ...prev, userId: newSelected }))
                                        }
                                        placeholder="Chọn bác sĩ"
                                        bookedUserIds={(() => {
                                            const currentRoom = modalForm.room;
                                            const currentDate = Array.isArray(modalForm.date) ? modalForm.date[0] : modalForm.date;
                                            const currentShift = modalForm.shift || formData.shift;
                                            let booked = [];
                                            if (currentRoom && currentShift && currentDate) {
                                                booked = serverSchedules.filter(s =>
                                                    (s.room?._id === currentRoom || s.room === currentRoom || s.room?.roomNumber === currentRoom)
                                                    && new Date(s.date).toISOString().slice(0, 10) === new Date(currentDate).toISOString().slice(0, 10)
                                                    && s.shift === currentShift
                                                    && (!modalForm._id || s._id !== modalForm._id)
                                                ).map(s => (s.userId?._id || s.userId)).filter(Boolean);
                                            }
                                            return booked;
                                        })()}
                                        editMode={!!modalForm._id}
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Kỹ thuật viên</label>
                                    <MultiSelectDropdown
                                        users={doctors.filter(u => u.role === 'technician')}
                                        selected={modalForm.userId}
                                        onChange={newSelected => setModalForm(prev => ({ ...prev, userId: newSelected }))}
                                        placeholder="Chọn kỹ thuật viên"
                                        bookedUserIds={(() => {
                                            const currentRoom = modalForm.room;
                                            const currentDate = Array.isArray(modalForm.date) ? modalForm.date[0] : modalForm.date;
                                            const currentShift = modalForm.shift || formData.shift;
                                            let booked = [];
                                            if (currentRoom && currentShift && currentDate) {
                                                booked = serverSchedules.filter(s =>
                                                    (s.room?._id === currentRoom || s.room === currentRoom || s.room?.roomNumber === currentRoom)
                                                    && new Date(s.date).toISOString().slice(0, 10) === new Date(currentDate).toISOString().slice(0, 10)
                                                    && s.shift === currentShift
                                                    && (!modalForm._id || s._id !== modalForm._id)
                                                ).map(s => (s.userId?._id || s.userId)).filter(Boolean);
                                            }
                                            return booked;
                                        })()}
                                        editMode={!!modalForm._id}
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Điều dưỡng</label>
                                    <MultiSelectDropdown
                                        users={doctors.filter(u => u.role === 'nursing')}
                                        selected={modalForm.userId}
                                        onChange={newSelected => setModalForm(prev => ({ ...prev, userId: newSelected }))}
                                        placeholder="Chọn điều dưỡng"
                                        bookedUserIds={(() => {
                                            const currentRoom = modalForm.room;
                                            const currentDate = Array.isArray(modalForm.date) ? modalForm.date[0] : modalForm.date;
                                            const currentShift = modalForm.shift || formData.shift;
                                            let booked = [];
                                            if (currentRoom && currentShift && currentDate) {
                                                booked = serverSchedules.filter(s =>
                                                    (s.room?._id === currentRoom || s.room === currentRoom || s.room?.roomNumber === currentRoom)
                                                    && new Date(s.date).toISOString().slice(0, 10) === new Date(currentDate).toISOString().slice(0, 10)
                                                    && s.shift === currentShift
                                                    && (!modalForm._id || s._id !== modalForm._id)
                                                ).map(s => (s.userId?._id || s.userId)).filter(Boolean);
                                            }
                                            return booked;
                                        })()}
                                        editMode={!!modalForm._id}
                                    />
                                    <div className="text-xs text-gray-500 mt-1">Có thể chọn nhiều nhân viên cho ca làm này</div>
                                    {modalErrors.userId && <p className="text-xs text-red-600 mt-1">{modalErrors.userId}</p>}
                                </div>
                                {modalErrors.shift && (
                                    <div className="text-xs text-red-600 mt-1">{modalErrors.shift}</div>
                                )}
                                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                                    {/* Nút xóa nhiều lịch trình khi chỉnh sửa nhiều bác sĩ - nằm dưới cùng */}
                                    {isEditMode && !modalForm._id && Array.isArray(modalForm.userId) && modalForm.userId.length > 0 && (
                                        <button
                                            type="button"
                                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md transition"
                                            onClick={async () => {
                                                try {
                                                    // Xóa tất cả lịch trình của các userId trong modalForm.userId ở phòng/ngày/ca này
                                                    const currentRoom = (() => {
                                                        const found = rooms.find(r => r.roomNumber === modalForm.room || r._id === modalForm.room);
                                                        return found ? found._id : modalForm.room;
                                                    })();
                                                    const currentDate = Array.isArray(modalForm.date) ? modalForm.date[0] : modalForm.date;
                                                    const currentShift = modalForm.shift || formData.shift;
                                                    const existedSchedules = serverSchedules.filter(s =>
                                                        (s.room?._id === currentRoom || s.room === currentRoom || s.room?.roomNumber === currentRoom)
                                                        && new Date(s.date).toISOString().slice(0, 10) === new Date(currentDate).toISOString().slice(0, 10)
                                                        && s.shift === currentShift
                                                        && modalForm.userId.includes(s.userId?._id?.toString() || s.userId?.toString())
                                                    );
                                                    for (const sch of existedSchedules) {
                                                        await import('../services/scheduleService').then(m => m.deleteSchedule(sch._id));
                                                    }
                                                    const updated = await import('../services/scheduleService').then(m => m.getAllSchedules());
                                                    setServerSchedules(updated);
                                                    toast.success('Đã xóa tất cả lịch trình đã chọn!', { style: { background: '#EF4444', color: '#fff' } });
                                                    setModalOpen(false);
                                                } catch (error) {
                                                    toast.error(error.response?.data?.error || 'Xóa lịch trình thất bại!', { style: { background: '#EF4444', color: '#fff' } });
                                                }
                                            }}
                                        >
                                            Xóa 
                                        </button>
                                    )}
                                    {modalForm._id && (
                                        <button
                                            type="button"
                                            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-md transition"
                                            onClick={async () => {
                                                try {
                                                    await import('../services/scheduleService').then(m => m.deleteSchedule(modalForm._id));
                                                    const updated = await import('../services/scheduleService').then(m => m.getAllSchedules());
                                                    setServerSchedules(updated);
                                                    toast.success('Đã xóa lịch trình!', { style: { background: '#EF4444', color: '#fff' } });
                                                    setModalOpen(false);
                                                } catch (error) {
                                                    toast.error(error.response?.data?.error || 'Xóa lịch trình thất bại!', { style: { background: '#EF4444', color: '#fff' } });
                                                }
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    )}
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