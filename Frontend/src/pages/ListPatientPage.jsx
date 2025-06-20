import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PatientService } from '../services/patientService';

function PatientList() {
    const [patientList, setPatientList] = useState([]);
    const [searchName, setSearchName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [patientsPerPage] = useState(10);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const data = await PatientService.getAllPatients();
            setPatientList(data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách bệnh nhân:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearchName(e.target.value);
        setCurrentPage(1);
    };

    const handleRowClick = (patientId) => {
        navigate('/admin/patients/detail', { state: { id: patientId } });
    };

    const filteredPatients = patientList.filter((patient) => {
        return (
            patient.fullName.toLowerCase().includes(searchName.toLowerCase())
        );
    });

    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="flex min-h-screen">
            <div className="flex-1 flex flex-col">
                <div className="flex">
                    <div className="w-full max-w-6xl mx-auto p-6 relative">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                            <h2 className="text-[#212B36] font-bold text-4xl leading-8">
                                Danh Sách Bệnh Nhân
                            </h2>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div className="flex items-center bg-white rounded-lg border border-[#D9D9D9] w-full md:w-[520px] px-6 py-4 text-[#637381] text-base leading-6">
                                <i className="fas fa-search text-[#637381] mr-3 text-lg"></i>
                                <input
                                    className="w-full text-base placeholder:text-[#637381] focus:outline-none bg-transparent"
                                    placeholder="Tìm kiếm theo tên..."
                                    type="text"
                                    value={searchName}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-[#D9D9D9] bg-white">
                            <table className="w-full text-base text-[#212B36] border-collapse rounded-lg table-fixed">
                                <thead>
                                    <tr className="border-b border-[#D9D9D9]">
                                        <th className="text-left font-semibold py-5 px-6 w-[10%]">STT</th>
                                        <th className="text-left font-semibold py-5 px-6 w-[25%]">Họ Và Tên</th>
                                        <th className="text-left font-semibold py-5 px-6 w-[20%]">Số Điện Thoại</th>
                                        <th className="text-left font-semibold py-5 px-6 w-[15%]">Ngày Sinh</th>
                                        <th className="text-left font-semibold py-5 px-6 w-[30%]">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPatients.length > 0 ? (
                                        currentPatients.map((patient, index) => (
                                            <tr
                                                key={patient._id}
                                                className="border-t border-[#D9D9D9] cursor-pointer hover:bg-gray-50"
                                                onClick={() => handleRowClick(patient._id)}
                                            >
                                                <td className="py-6 px-6 font-normal w-[10%]">
                                                    {indexOfFirstPatient + index + 1}
                                                </td>
                                                <td className="py-6 px-6 flex items-center gap-4 w-[35%] whitespace-nowrap">
                                                    <img
                                                        alt="Avatar of a patient"
                                                        className="w-12 h-12 object-cover rounded-full"
                                                        height="56"
                                                        src={patient.avatar || "https://storage.googleapis.com/a1aa/image/3c98d529-c1f0-4af6-6e7b-f4c0a724759b.jpg"}
                                                        width="56"
                                                    />
                                                    {patient.fullName}
                                                </td>
                                                <td className="py-6 px-6 w-[20%]">{patient.phone || '-'}</td>
                                                <td className="py-6 px-6 w-[15%] capitalize">
                                                    {patient.dob ? new Date(patient.dob).toLocaleDateString('vi-VN') : '-'}
                                                </td>
                                                <td className="py-6 px-6 w-[30%]">{patient.email}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-6 text-center text-lg text-gray-500">
                                                Không tìm thấy bệnh nhân phù hợp.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end items-center gap-4 mt-7 text-[#637381] text-base font-semibold">
                            <button
                                aria-label="Previous page"
                                className="w-11 h-9 border border-[#D9D9D9] rounded-md flex items-center justify-center hover:bg-[#E6F4F1] transition-colors"
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`w-11 h-9 border border-[#D9D9D9] rounded-md flex items-center justify-center hover:bg-[#E6F4F1] transition-colors ${currentPage === i + 1 ? 'bg-[#E6F4F1] text-[#00BFA6]' : ''}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                aria-label="Next page"
                                className="w-11 h-9 border border-[#D9D9D9] rounded-md flex items-center justify-center hover:bg-[#E6F4F1] transition-colors"
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientList;