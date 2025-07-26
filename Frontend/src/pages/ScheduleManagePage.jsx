import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { DoctorService } from '../services/doctorService';
import { listService } from '../services/medicalService';
import { createSchedule, getAllSchedules } from '../services/scheduleService';

function ScheduleAddPage() {
    // State lưu selectedName cho từng cell (key: roomId+date)

    // Giá trị mặc định: ca làm việc đầu tiên và tất cả chuyên khoa (nếu có)
    const defaultShifts = ['MORNING', 'NOON', 'AFTERNOON'];
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
    // Hiển thị tuần động, luôn bắt đầu từ thứ Hai của tuần hiện tại (theo ngày hệ thống)
    const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    // Lấy ngày hiện tại (theo hệ thống)
    const today = new Date();
    // Tìm ngày thứ Hai đầu tuần hiện tại
    const getMonday = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        // getDay: 0=Chủ nhật, 1=Thứ 2, ...
        const diff = d.getDate() - ((day === 0 ? 7 : day) - 1);
        d.setDate(diff);
        d.setHours(0,0,0,0);
        return d;
    };
    // weekOffset: 0 là tuần hiện tại, +1 tuần sau, -1 tuần trước
    const [weekOffset, setWeekOffset] = useState(0);
    const monday = (() => {
        const baseMonday = getMonday(today);
        const result = new Date(baseMonday);
        result.setDate(baseMonday.getDate() + weekOffset * 7);
        return result;
    })();
    const days = [
        { value: '', label: 'Chọn ngày' },
        ...Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const weekday = weekdays[i];
            const dayStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            return {
                value: d.toISOString().slice(0, 10),
                label: `${weekday} (${dayStr})`,
                date: d.toISOString().slice(0, 10)
            };
        })
    ];

    // Hàm chuyển tuần
    const handleNextWeek = () => setWeekOffset(offset => offset + 1);
    const handlePreviousWeek = () => setWeekOffset(offset => offset - 1);


    const addOneDayToDateString = (dateString) => {
        const date = new Date(dateString); 
        date.setDate(date.getDate() + 1);  
        return date.toISOString().slice(0, 10); 
    };



    // Set giờ mặc định khi chọn ca làm việc
    const handleShiftChange = (e) => {
        const shift = e.target.value;
        setFormData((prev) => ({ ...prev, shift }));
        // Nếu modal đang mở thì set giờ mặc định luôn
        if (modalOpen) {
            if (shift === 'MORNING') {
                setModalForm((prev) => ({ ...prev, startTime: '07:00', endTime: '11:30' }));
            } else if (shift === 'NOON') {
                setModalForm((prev) => ({ ...prev, startTime: '11:30', endTime: '13:30' }));
            } else if (shift === 'AFTERNOON') {
                setModalForm((prev) => ({ ...prev, startTime: '13:30', endTime: '17:00' }));
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
                const specialtiesData = await fetch('https://booking-appointment-be.up.railway.app/api/specialty').then(res => {
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
            // Lấy ngày đúng từ cột giao diện (tham số day luôn là ISO yyyy-mm-dd đúng với bảng)
            const currentDate = day;
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
                date: currentDate, // Đảm bảo ngày trong modal luôn đúng với ngày của cột giao diện
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
            // Lấy dải ngày tuần hiện tại giống như days ở ngoài giao diện
            const allowedDates = days.slice(1).map(d => d.date);
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

        // 1. Edit mode: update 1 lịch trình (1 bác sĩ, 1 ngày)
        if (modalForm._id) {
            try {
                const updateData = {
                    userId: Array.isArray(modalForm.userId) ? modalForm.userId[0] : modalForm.userId,
                    room: modalForm.room,
                    shift: modalForm.shift,
                    date: Array.isArray(modalForm.date) ? modalForm.date[0] : modalForm.date
                };
                await import('../services/scheduleService').then(m => m.updateSchedule(modalForm._id, updateData));
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

        // 2. Chỉnh sửa nhiều bác sĩ/ngày (click cả ô, không có _id, userId là mảng, date có thể là mảng)
        if (!modalForm._id && Array.isArray(modalForm.userId) && modalForm.userId.length > 0) {
            try {
                const currentRoom = (() => {
                    const found = rooms.find(r => r.roomNumber === modalForm.room || r._id === modalForm.room);
                    return found ? found._id : modalForm.room;
                })();
                const selectedDates = Array.isArray(modalForm.date) ? modalForm.date : [modalForm.date];
                const userIds = modalForm.userId.map(id => id.toString());
                const currentShift = modalForm.shift || formData.shift;

                // Lấy tất cả lịch trình đã có ở phòng/ngày/ca này
                const existedSchedules = serverSchedules.filter(s =>
                    (s.room?._id === currentRoom || s.room === currentRoom || s.room?.roomNumber === currentRoom)
                    && selectedDates.includes(new Date(s.date).toISOString().slice(0, 10))
                    && s.shift === currentShift
                );
                // Tìm userId-date đã có
                const existedUserDatePairs = existedSchedules.map(s => ({
                    userId: s.userId?._id?.toString() || s.userId?.toString(),
                    date: new Date(s.date).toISOString().slice(0, 10)
                }));

                // Tạo lịch cho userId-date chưa có
                for (const uid of userIds) {
                    for (const date of selectedDates) {
                        const exists = existedUserDatePairs.some(pair => pair.userId === uid && pair.date === date);
                        if (!exists) {
                            await createSchedule({
                                userId: uid,
                                room: currentRoom,
                                shift: currentShift,
                                date
                            });
                        }
                    }
                }
                // Xóa lịch cho userId-date bị bỏ chọn
                for (const s of existedSchedules) {
                    const uid = s.userId?._id?.toString() || s.userId?.toString();
                    const date = new Date(s.date).toISOString().slice(0, 10);
                    if (!userIds.includes(uid) || !selectedDates.includes(date)) {
                        await import('../services/scheduleService').then(m => m.deleteSchedule(s._id));
                    }
                }
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

        // 3. Tạo mới hoàn toàn (chưa có lịch nào ở phòng/ngày/ca này)
        try {
            const currentRoom = (() => {
                const found = rooms.find(r => r.roomNumber === modalForm.room || r._id === modalForm.room);
                return found ? found._id : modalForm.room;
            })();
            const selectedDates = Array.isArray(modalForm.date) ? modalForm.date : [modalForm.date];
            const userIds = Array.isArray(modalForm.userId) ? modalForm.userId : [modalForm.userId];
            // Gửi đúng format cho backend: userIds, room, shift, dates
            await createSchedule({
                userIds,
                room: currentRoom,
                shift: formData.shift,
                dates: selectedDates
            });
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

    function MultiSelectDateDropdown({ days, selected, onChange }) {
        const [open, setOpen] = useState(false);
        // Đảm bảo localSelected luôn là mảng
        const localSelected = Array.isArray(selected) ? selected : (selected ? [selected] : []);

        const handleToggle = () => setOpen(v => !v);
        const handleBlur = (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
        };

        const handleRemoveDate = (date) => {
            const newSelected = localSelected.filter(d => d !== date);
            onChange(newSelected);
        };

        return (
            <div className="relative" tabIndex={0} onBlur={handleBlur}>
                {/* Render selected dates OUTSIDE the trigger button */}
                <div className="flex flex-wrap gap-1 mb-1">
                    {localSelected.map(date => (
                        <span
                            key={date}
                            className="bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs mr-1 mb-1 inline-flex items-center font-bold transition-all duration-150 hover:bg-blue-600 hover:text-white hover:scale-105 hover:z-10"
                        >
                            {new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            <button
                                type="button"
                                className="ml-1 text-gray-700 hover:text-red-600 focus:outline-none font-bold"
                                style={{ fontSize: '22px', lineHeight: 1, padding: 0, fontWeight: 900 }}
                                aria-label={`Xóa ngày ${date}`}
                                onClick={e => {
                                    e.stopPropagation();
                                    handleRemoveDate(date);
                                }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <button
                    type="button"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-wrap min-h-[40px] relative"
                    onClick={handleToggle}
                >
                    {localSelected.length > 0
                        ? localSelected.map(date => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })).join(', ')
                        : <span className="text-gray-400">Chọn ngày</span>}
                    <span className="pointer-events-none flex items-center absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#555" strokeWidth="2" d="M6 9l6 6 6-6" /></svg>
                    </span>
                </button>
                {open && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-56 overflow-y-auto animate-fade-in">
                        {days.map(d => (
                            <label key={d.date} className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm">
                                <input
                                    type="checkbox"
                                    className="mr-2 accent-blue-600"
                                    checked={localSelected.includes(addOneDayToDateString(d.date))}
                                    onChange={e => {
                                        let newSelected = [...localSelected];
                                        if (e.target.checked) {
                                            if (!newSelected.includes(addOneDayToDateString(d.date))) newSelected.push(addOneDayToDateString(d.date));
                                        } else {
                                            newSelected = newSelected.filter(date => date !== addOneDayToDateString(d.date));
                                        }
                                        onChange(newSelected);
                                    }}
                                />
                                {/* Hiển thị ngày đã cộng thêm 1 ngày */}
                                {new Date(addOneDayToDateString(d.date)).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </label>
                        ))}
                    </div>
                )}
            </div>
        );
    }






    // Đã bỏ nút tạo mới, không còn lưu tạm localSchedules


    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [roomError, setRoomError] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [receptionists, setReceptionists] = useState([]);
    const [loadingDoctors, setLoadingDoctors] = useState(false);
    const [doctorError, setDoctorError] = useState(null);
    



    // Fetch rooms and doctors when department (specialty) changes
    useEffect(() => {
        const fetchRoomsDoctors = async () => {
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
                    const specialtyRes = await fetch(`https://booking-appointment-be.up.railway.app/api/specialty/${dep}`);
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
        fetchRoomsDoctors();
    }, [formData.department]);

    // Fetch all lễ tân (receptionist) khi mở trang
    useEffect(() => {
        const fetchReceptionists = async () => {
            try {
                const { getAllReceptionists } = await import('../services/scheduleService');
                const users = await getAllReceptionists();
                setReceptionists(users);
            } catch {
                setReceptionists([]);
            }
        };
        fetchReceptionists();
    }, []);

    if (fetchError || roomError || doctorError) {
        return (
            <div className="flex text-[1.75rem]">
                <Toaster />

                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center py-15 text-xl text-red-500">{fetchError}</div>
                    <button
                        onClick={() => navigate('/admin/schedules/add')}
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

                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="text-center py-15 text-xl text-gray-600">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    // MultiSelectDropdown component for user selection by role
    function MultiSelectDropdown({ users, selected, onChange, placeholder = [], bookedUserIds = [], editMode = false }) {
        const [open, setOpen] = useState(false);
        const [localSelected, setLocalSelected] = useState(selected);

        // Nhận thêm prop roleLock (vai trò được phép chỉnh sửa), truyền từ ngoài vào
        const roleLock = arguments.length > 1 && arguments[1] && arguments[1].roleLock;

        useEffect(() => {
            setLocalSelected(selected);
        }, [selected]);

        const handleToggle = () => setOpen(v => !v);
        const handleBlur = (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
        };

        const filteredUsers = users.filter(u =>
            !(localSelected.includes(u._id) || bookedUserIds.includes(u._id))
        );

        // Hàm cập nhật database khi xóa/chọn nhân viên
        const handleRemoveUser = async (userId) => {
            const user = users.find(u => u._id === userId);
            if (editMode && roleLock && user && user.role !== roleLock) return;
            const newSelected = localSelected.filter(id => id !== userId);
            setLocalSelected(newSelected);
            onChange(newSelected);
            if (editMode && typeof window !== 'undefined') {
                try {
                    const scheduleId = window?.modalForm?._id;
                    if (scheduleId) {
                        await import('../services/scheduleService').then(m => m.deleteSchedule(scheduleId));
                    }
                } catch (error) {
                    console.error('Lỗi khi xóa lịch trình:', error);
                    if (typeof toast === 'function') {
                        toast.error('Lỗi khi xóa lịch trình!');
                    }
                }
            }
        };

        // Hiển thị tên đã chọn với dấu x để xóa từng nhân viên (rendered OUTSIDE the trigger button)
        const renderSelectedNames = () => {
            const selectedUsers = users.filter(u => localSelected.includes(u._id));
            if (selectedUsers.length === 0) return null;
            return (
                <div className="flex flex-wrap gap-1 mb-1">
                    {selectedUsers.map(u => (
                        <span
                            key={u._id}
                            className={
                                `bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs mr-1 mb-1 inline-flex items-center font-bold transition-all duration-150 hover:bg-blue-600 hover:text-white hover:scale-105 hover:z-10`
                            }
                        >
                            {u.fullName}
                            <button
                                type="button"
                                className="ml-1 text-gray-700 hover:text-red-600 focus:outline-none font-bold"
                                style={{ fontSize: '22px', lineHeight: 1, padding: 0, fontWeight: 900 }}
                                aria-label={`Xóa ${u.fullName}`}
                                onClick={e => {
                                    e.stopPropagation();
                                    handleRemoveUser(u._id);
                                }}
                                disabled={editMode && roleLock && u.role !== roleLock}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            );
        };

        return (
            <div className="relative" tabIndex={0} onBlur={handleBlur}>
                {/* Render selected names OUTSIDE the trigger button to avoid button nesting */}
                {renderSelectedNames()}
                <button
                    type="button"
                    className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-wrap min-h-[40px] relative ${editMode && roleLock ? 'opacity-60 cursor-not-allowed' : ''}`}
                    onClick={editMode && roleLock ? undefined : handleToggle}
                    disabled={editMode && roleLock}
                >
                    {selected && selected.length > 0 && users.filter(u => selected.includes(u._id)).length > 0 ? (
                        (() => {
                            const selectedUsers = users.filter(u => selected.includes(u._id));
                            if (selectedUsers.length === 1) {
                                return <span className="text-gray-900">{selectedUsers[0].fullName}</span>;
                            } else {
                                return <span className="text-gray-900">{selectedUsers.map(u => u.fullName).join(', ')}</span>;
                            }
                        })()
                    ) : <span className="text-gray-400">{placeholder}</span>}
                    <span className="pointer-events-none flex items-center absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#555" strokeWidth="2" d="M6 9l6 6 6-6" /></svg>
                    </span>
                </button>
                {open && (!editMode || !roleLock) && (
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
                                    disabled={editMode && roleLock && user.role !== roleLock}
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
    // function HoverSingleName() {
    //     return null;
    // }

    return (
        <div className="flex min-h-screen">
            <Toaster />

            <main className="flex-1 p-8 flex flex-col gap-8 items-center bg-gradient-to-br from-blue-50 to-white min-h-screen">

                <div className="w-full max-w-4xl mx-auto flex flex-col items-center mb-6">
                    <h1 className="text-4xl font-bold text-center text-blue-700 mb-6 tracking-tight drop-shadow-lg">Lịch trình làm việc</h1>
                    <div className="flex flex-row gap-6 w-full justify-center items-center">
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
                                <option value="MORNING">Ca sáng (7h - 11h30)</option>
                                <option value="NOON">Ca trưa (11h30 - 13h30)</option>
                                <option value="AFTERNOON">Ca chiều (13h30 - 17h)</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePreviousWeek}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-200 transition"
                                aria-label="Tuần trước"
                            >
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                            <span className="text-lg font-bold text-blue-700 tracking-wide px-4 py-2 rounded bg-white shadow border border-blue-200 whitespace-nowrap">
                                {days[1] && days[1].date ? (() => {
                                    const monday = new Date(days[2].date);
                                    return monday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                })() : ''}
                                {' - '}
                                {days[1] && days[1].date ? (() => {
                                    const sunday = new Date(days[1].date);
                                    sunday.setDate(sunday.getDate() + 7);
                                    return sunday.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                })() : ''}
                            </span>
                            <button
                                onClick={handleNextWeek}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-200 transition"
                                aria-label="Tuần sau"
                            >
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
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
                                        const cellDate = addOneDayToDateString(d.date);
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
                                                return handleCellClick(room.roomNumber, addOneDayToDateString(d.date), null);
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
                                                className={`border-r border-gray-300 py-5 schedule-cell ${isScheduled ? 'bg-green-500 cursor-pointer hover:bg-green-500' : 'cursor-pointer hover:bg-blue-50'}`}
                                                onClick={handleCellBoxClick}
                                            >
                                                {isScheduled ? (
                                                    <div className="text-xs text-white font-semibold text-center">
                                                        {schedules.map((s, idx) => {
                                                            // const userNames = s.fullName ? s.fullName.split('_') : [];
                                                            // Hiển thị mỗi user là 1 block, hover vào block sẽ highlight toàn bộ vùng (không bị cắt nửa)
                                                            const displayName = s.fullName || '';
                                                            const displayRole = s.userId?.role === 'doctor' ? 'Bác sĩ' : (s.userId?.role === 'technician' ? 'Kỹ thuật viên' : (s.userId?.role === 'nursing' ? 'Điều dưỡng' : (s.userId?.role === 'receptionist' ? 'Lễ tân' : 'Nhân Viên')));
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="group relative"
                                                                >
                                                                    <div
                                                                        className="px-2 py-1 rounded bg-green-500 text-white font-semibold text-xs text-center transition-colors duration-150 group-hover:bg-white group-hover:text-black cursor-pointer border-b border-white last:border-b-0"
                                                                        title={displayName}
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
                                                                        {displayName}<br />
                                                                        <span className="italic">{displayRole}</span>
                                                                        {s.specialty && <div className="italic text-sm">{s.specialty}</div>}
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
                                        value={(() => {
                                            // Hiển thị số phòng thay vì id phòng
                                            if (!modalForm.room) return '';
                                            const found = rooms?.find(r => r._id === modalForm.room || r.roomNumber === modalForm.room);
                                            return found ? found.roomNumber : modalForm.room;
                                        })()}
                                        readOnly
                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 text-sm cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                                    {isEditMode ? (
                                        // Chế độ chỉnh sửa: chỉ hiển thị ngày, không cho chọn/chỉnh sửa
                                        <input
                                            type="text"
                                            value={(() => {
                                                if (Array.isArray(modalForm.date)) {
                                                    return modalForm.date.map(date => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })).join(', ');
                                                } else if (modalForm.date) {
                                                    return new Date(modalForm.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                }
                                                return '';
                                            })()}
                                            readOnly
                                            className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 text-sm cursor-not-allowed"
                                        />
                                    ) : (
                                        <>
                                            <MultiSelectDateDropdown
                                                days={days.slice(1)}
                                                selected={modalForm.date}
                                                onChange={newSelected => setModalForm(prev => ({ ...prev, date: newSelected }))}
                                            />
                                            <div className="text-xs text-gray-500 mt-1">Có thể chọn/xóa nhiều ngày linh hoạt</div>
                                        </>
                                    )}
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
                                            <option value="MORNING">Ca sáng (7h - 11h30)</option>
                                            <option value="NOON">Ca trưa (11h30 - 13h30)</option>
                                            <option value="AFTERNOON">Ca chiều (13h30 - 17h)</option>
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
                                        onChange={newSelected =>
                                            modalForm._id
                                                ? setModalForm(prev => ({ ...prev, userId: newSelected.slice(-1) }))
                                                : setModalForm(prev => ({ ...prev, userId: newSelected }))
                                        }
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
                                        onChange={newSelected =>
                                            modalForm._id
                                                ? setModalForm(prev => ({ ...prev, userId: newSelected.slice(-1) }))
                                                : setModalForm(prev => ({ ...prev, userId: newSelected }))
                                        }
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Lễ tân</label>
                                    <MultiSelectDropdown
                                        users={receptionists}
                                        selected={modalForm.userId}
                                        onChange={newSelected =>
                                            modalForm._id
                                                ? setModalForm(prev => ({ ...prev, userId: newSelected.slice(-1) }))
                                                : setModalForm(prev => ({ ...prev, userId: newSelected }))
                                        }
                                        placeholder="Chọn lễ tân"
                                        bookedUserIds={[]}
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