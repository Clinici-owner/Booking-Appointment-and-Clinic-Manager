import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import AdminNavSidebar from '../components/AdminNavSidebar';
import { listService } from '../services/medicalService';
import { createSchedule } from '../services/scheduleService';

function ScheduleAddPage() {
    const [formData, setFormData] = useState({
        userId: '',
        startTime: '',
        endTime: '',
        roomNumber: '',
        paraclinicalId: '',
        department: '',
        shift: '',
        day: ''
    });
    const [users, setUsers] = useState([]);
    const [paraclinicalServices, setParaclinicalServices] = useState([]);
    const [specialties, setSpecialties] = useState([{ value: '', label: 'Chọn chuyên khoa' }]);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
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

    useEffect(() => {
        const fetchData = async () => {
            setLoadingUsers(true);
            try {
                const usersData = await fetch('http://localhost:3000/api/staff').then(res => {
                    if (!res.ok) throw new Error('Không thể tải danh sách nhân viên.');
                    return res.json();
                });
                if (!Array.isArray(usersData)) throw new Error('Dữ liệu nhân viên không hợp lệ.');
                setUsers(usersData);
            } catch (error) {
                setFetchError(`Không thể tải danh sách nhân viên. Lỗi: ${error.message}`);
                toast.error('Không thể tải danh sách nhân viên.', { style: { background: '#EF4444', color: '#fff' } });
            } finally {
                setLoadingUsers(false);
            }

            setIsLoadingServices(true);
            try {
                const data = await listService();
                const services = data.services || data;
                if (!Array.isArray(services)) throw new Error('Dữ liệu dịch vụ cận lâm sàng không hợp lệ.');
                setParaclinicalServices(services);
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
    const [modalCell, setModalCell] = useState({ room: '', day: '' });
    const [modalForm, setModalForm] = useState({
        userId: '',
        startTime: '',
        endTime: '',
        paraclinicalId: ''
    });
    const [modalErrors, setModalErrors] = useState({});

    // Open modal when click cell
    const handleCellClick = (room, day) => {
        setModalCell({ room, day });
        setModalForm({ userId: '', startTime: '', endTime: '', paraclinicalId: '' });
        setModalErrors({});
        setModalOpen(true);
    };
    const handleModalClose = () => setModalOpen(false);
    const handleModalFormChange = (e) => {
        const { name, value } = e.target;
        setModalForm((prev) => ({ ...prev, [name]: value }));
        setModalErrors((prev) => ({ ...prev, [name]: '' }));
    };
    const validateModalForm = () => {
        const errors = {};
        if (!modalForm.userId) errors.userId = 'Vui lòng chọn nhân viên';
        if (!modalForm.startTime) errors.startTime = 'Vui lòng chọn giờ bắt đầu';
        if (!modalForm.endTime) errors.endTime = 'Vui lòng chọn giờ kết thúc';
        if (!modalForm.paraclinicalId) errors.paraclinicalId = 'Vui lòng chọn dịch vụ';
        if (modalForm.startTime && modalForm.endTime && modalForm.endTime <= modalForm.startTime) {
            errors.endTime = 'Giờ kết thúc phải sau giờ bắt đầu';
        }
        return errors;
    };
    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const errors = validateModalForm();
        if (Object.keys(errors).length > 0) {
            setModalErrors(errors);
            return;
        }
        // Gửi dữ liệu tạo lịch trình
        const schedulePayload = {
            userId: modalForm.userId,
            roomNumber: modalCell.room,
            department: formData.department,
            shift: formData.shift,
            day: modalCell.day,
            startTime: modalForm.startTime,
            endTime: modalForm.endTime,
            paraclinicalId: modalForm.paraclinicalId,
        };
        try {
            await createSchedule(schedulePayload);
            toast.success('Tạo lịch trình thành công!', { style: { background: '#10B981', color: '#fff' } });
            setModalOpen(false);
        } catch {
            toast.error('Tạo lịch trình thất bại!', { style: { background: '#EF4444', color: '#fff' } });
        }
    };

    // Danh sách phòng mẫu (có thể lấy từ API nếu cần)
    const ROOMS = [
        'Phòng 101',
        'Phòng 102',
        'Phòng 103',
        'Phòng 104',
        'Phòng 105',
    ];

    if (fetchError) {
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

    if (loadingUsers || isLoadingServices) {
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
                            onChange={e => setFormData({ ...formData, shift: e.target.value })}
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
                            {ROOMS.map((room) => (
                                <tr key={room} className="border-t border-gray-300">
                                    <td className="border-r border-gray-300 py-5 font-medium text-gray-700 bg-gray-50 max-w-[140px]">{room}</td>
                                    {days.slice(1).map((d) => (
                                        <td
                                            key={d.value}
                                            className="border-r border-gray-300 py-5 cursor-pointer schedule-cell hover:bg-blue-50"
                                            onClick={() => handleCellClick(room, d.value)}
                                        >             
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                
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
                                        value={modalCell.room}
                                        readOnly
                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 text-sm cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày</label>
                                    <input
                                        type="text"
                                        value={modalCell.day}
                                        readOnly
                                        className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-700 text-sm cursor-not-allowed"
                                    />
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
                                        <option value="">Chọn nhân viên</option>
                                        {users.map((user) => (
                                            <option key={user._id} value={user._id}>{user.fullName}</option>
                                        ))}
                                    </select>
                                    {modalErrors.userId && <p className="text-xs text-red-600 mt-1">{modalErrors.userId}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        required
                                        value={modalForm.startTime}
                                        onChange={handleModalFormChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {modalErrors.startTime && <p className="text-xs text-red-600 mt-1">{modalErrors.startTime}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        required
                                        value={modalForm.endTime}
                                        onChange={handleModalFormChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {modalErrors.endTime && <p className="text-xs text-red-600 mt-1">{modalErrors.endTime}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ cận lâm sàng</label>
                                    <select
                                        name="paraclinicalId"
                                        required
                                        value={modalForm.paraclinicalId}
                                        onChange={handleModalFormChange}
                                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Chọn dịch vụ</option>
                                        {paraclinicalServices.map((service) => (
                                            <option key={service._id} value={service._id}>{service.paraclinalName || service.name}</option>
                                        ))}
                                    </select>
                                    {modalErrors.paraclinicalId && <p className="text-xs text-red-600 mt-1">{modalErrors.paraclinicalId}</p>}
                                </div>
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