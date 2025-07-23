import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MedicalProcessService } from '../services/medicalProcessService';

const MedicalProcessListPage = () => {
  const [processes, setProcesses] = useState([]);
  const [filteredProcesses, setFilteredProcesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // Pagination and filter states
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch all medical processes
  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        setIsLoading(true);
        const data = await MedicalProcessService.getAllMedicalProcesses();
        setProcesses(data);
        setFilteredProcesses(data);
      } catch (err) {
        console.error('Error fetching medical processes:', err);
        setError('Không thể tải danh sách tiến trình khám');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  // Filter, sort, and search processes
  useEffect(() => {
    let filtered = processes;
    // Filter by date
    filtered = filtered.filter(proc => {
      if (startDate && new Date(proc.createdAt) < new Date(startDate)) return false;
      if (endDate && new Date(proc.createdAt) > new Date(endDate)) return false;
      return true;
    });
    // Search by patient name
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(process =>
        process.appointmentId?.patientId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Sort by newest
    filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredProcesses(filtered);
    setPage(1); // Reset to first page when filter/search changes
  }, [searchTerm, processes, startDate, endDate]);

  // Pagination
  const totalPages = Math.ceil(filteredProcesses.length / pageSize);
  const paginatedProcesses = filteredProcesses.slice((page - 1) * pageSize, page * pageSize);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Translate status
  const translateStatus = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Danh Sách Tiến Trình Khám</h1>
      {/* Filter & Search Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="start-date" className="text-gray-600">Từ ngày:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="end-date" className="text-gray-600">Đến ngày:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <label htmlFor="page-size" className="text-gray-600">Số tiến trình/trang:</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="relative w-full md:w-1/3">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tìm kiếm theo tên bệnh nhân..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* Processes Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bệnh nhân
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bác sĩ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số bước
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProcesses.length > 0 ? (
              paginatedProcesses.map((process) => (
                <tr key={process._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={process.appointmentId?.patientId?.avatar} alt={process.appointmentId?.patientId?.fullName} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{process.appointmentId?.patientId?.fullName}</div>
                        <div className="text-sm text-gray-500">{process.appointmentId?.patientId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{process.doctorId.fullName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(process.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {process.processSteps.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(process.status)}`}>
                      {translateStatus(process.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => navigate(`/doctor/medicalProcess/${process._id}`, { state: { process } })}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  Không tìm thấy tiến trình khám nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination controls */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Trước
        </button>
        <span className="font-medium">Trang {page} / {totalPages}</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default MedicalProcessListPage;