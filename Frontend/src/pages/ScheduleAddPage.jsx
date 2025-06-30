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
        paraclinicalId: ''
    });

    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [paraclinicalServices, setParaclinicalServices] = useState([]);
    const [isLoadingServices, setIsLoadingServices] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const navigate = useNavigate();

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
                console.error('Error fetching users:', error);
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
                console.error('Error fetching paraclinical services:', error);
                setFetchError(`Không thể tải danh sách dịch vụ cận lâm sàng. Lỗi: ${error.message}`);
                toast.error('Không thể tải danh sách dịch vụ cận lâm sàng.', { style: { background: '#EF4444', color: '#fff' } });
            } finally {
                setIsLoadingServices(false);
            }
        };
        fetchData();
    }, []);

    const validateField = (name, value) => {
        switch (name) {
            case 'userId':
                return value ? '' : 'Vui lòng chọn nhân viên.';
            case 'startTime':
                return value ? '' : 'Vui lòng chọn thời gian bắt đầu.';
            case 'endTime':
                if (!value) return 'Vui lòng chọn thời gian kết thúc.';
                if (formData.startTime && new Date(value) <= new Date(formData.startTime)) {
                    return 'Thời gian kết thúc phải sau thời gian bắt đầu.';
                }
                return '';
            case 'roomNumber':
                if (!value) return 'Vui lòng chọn dịch vụ để tự động điền số phòng.';
                return '';
            case 'paraclinicalId':
                return value ? '' : 'Vui lòng chọn dịch vụ cận lâm sàng.';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: value };

        if (name === 'paraclinicalId' && value) {
            const selectedService = paraclinicalServices.find(service => service._id === value);
            updatedFormData.roomNumber = selectedService?.roomNumber || '';
        }

        setFormData(updatedFormData);

        const errorMessage = validateField(name, updatedFormData[name]);
        setErrors(prev => ({ ...prev, [name]: errorMessage }));
    };

    const isValidForm = () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidForm()) {
        toast.error('Vui lòng kiểm tra lại các trường thông tin.', {
            style: { background: '#EF4444', color: '#fff' },
        });
        return;
    }

    try {
        console.log('Form data being sent:', formData);
        const response = await createSchedule(formData);

        if (response && response.message) {
            toast.success('Tạo lịch trình thành công!', {
                style: { background: '#10B981', color: '#fff' },
            });
            setTimeout(() => navigate('/admin/schedules'), 3000);
        } else {
            toast.error('Tạo lịch trình thất bại: Phản hồi không hợp lệ.', {
                style: { background: '#EF4444', color: '#fff' },
            });
        }
    } catch (error) {
        console.error('Lỗi tạo lịch trình:', error);
        const errorMessage =
            error?.response?.data?.error || error.message || 'Tạo lịch trình thất bại!';

        toast.error(`Tạo thất bại: ${errorMessage}`, {
            style: { background: '#EF4444', color: '#fff' },
        });
    }
};

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
        <div className="flex text-[1.75rem] leading-[1.75]">
            <Toaster />
            <div className="flex-1 flex flex-col">
                <div className="flex">
                    <div className="w-full max-w-[1600px] mx-auto p-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                            <h2 className="text-[#212123] font-bold text-4xl leading-6">
                                Tạo lịch trình mới
                            </h2>
                        </div>

                        <div className="bg-white rounded-lg border border-[#D9D9D9] p-6">
                            <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                                <div>
                                    <label htmlFor="userId" className="block text-sm text-gray-700 mb-1">Nhân viên</label>
                                    <select
                                        id="userId"
                                        name="userId"
                                        onChange={handleChange}
                                        value={formData.userId}
                                        className="w-full rounded-md border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        required
                                    >
                                        <option value="">Chọn nhân viên</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>{user.fullName}</option>
                                        ))}
                                    </select>
                                    {errors.userId && <p className="text-sm text-red-600">{errors.userId}</p>}
                                </div>
                                <div>
                                    <label htmlFor="paraclinicalId" className="block text-sm text-gray-700 mb-1">Dịch vụ cận lâm sàng</label>
                                    <select
                                        id="paraclinicalId"
                                        name="paraclinicalId"
                                        onChange={handleChange}
                                        value={formData.paraclinicalId}
                                        className="w-full rounded-md border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        required
                                        disabled={isLoadingServices}
                                    >
                                        <option value="">{isLoadingServices ? 'Đang tải...' : 'Chọn dịch vụ'}</option>
                                        {Array.isArray(paraclinicalServices) && paraclinicalServices.map(service => (
                                            <option key={service._id} value={service._id}>{service.paraclinalName}</option>
                                        ))}
                                    </select>
                                    {errors.paraclinicalId && <p className="text-sm text-red-600">{errors.paraclinicalId}</p>}
                                </div>
                                <div>
                                    <label htmlFor="startTime" className="block text-sm text-gray-700 mb-1">Thời gian bắt đầu</label>
                                    <input
                                        id="startTime"
                                        name="startTime"
                                        type="datetime-local"
                                        onChange={handleChange}
                                        value={formData.startTime}
                                        className="w-full rounded-md border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        required
                                    />
                                    {errors.startTime && <p className="text-sm text-red-600">{errors.startTime}</p>}
                                </div>
                                <div>
                                    <label htmlFor="endTime" className="block text-sm text-gray-700 mb-1">Thời gian kết thúc</label>
                                    <input
                                        id="endTime"
                                        name="endTime"
                                        type="datetime-local"
                                        onChange={handleChange}
                                        value={formData.endTime}
                                        className="w-full rounded-md border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        required
                                    />
                                    {errors.endTime && <p className="text-sm text-red-600">{errors.endTime}</p>}
                                </div>
                                <div>
                                    <label htmlFor="roomNumber" className="block text-sm text-gray-700 mb-1">Số phòng</label>
                                    <input
                                        id="roomNumber"
                                        name="roomNumber"
                                        type="text"
                                        placeholder="Tự động điền khi chọn dịch vụ"
                                        value={formData.roomNumber}
                                        disabled
                                        className="w-full rounded-md border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                        required
                                    />
                                    {errors.roomNumber && <p className="text-sm text-red-600">{errors.roomNumber}</p>}
                                </div>
                                <div className="col-span-full flex justify-between items-center mt-8">
                                    <div className="flex space-x-4">
                                        <button
                                            type="submit"
                                            className="bg-custom-blue hover:bg-custom-bluehover2 text-white font-semibold text-sm rounded-lg w-28 h-12"
                                        >
                                            Tạo mới
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/admin/schedules')}
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold text-sm rounded-lg w-36 h-12"
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

export default ScheduleAddPage;