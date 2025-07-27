import React, { useEffect, useState } from 'react';
import appointmentService from '../services/appointmentService';
import { PatientService } from '../services/patientService';
import { getAllPayments } from '../services/paymentService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const getMonthName = (month) => {
  return `${month + 1}`;
};

const getYearsFromData = (appointments, patients, payments) => {
  const years = new Set();
  appointments.forEach(a => {
    if (a.time) years.add(new Date(a.time).getFullYear());
  });
  patients.forEach(p => {
    if (p.createdAt) years.add(new Date(p.createdAt).getFullYear());
  });
  payments.forEach(p => {
    if (p.createdAt) years.add(new Date(p.createdAt).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
};

const StatisticalPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [years, setYears] = useState([new Date().getFullYear()]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appts, pats, pays] = await Promise.all([
          appointmentService.getAppointments(),
          PatientService.getAllPatients(),
          getAllPayments()
        ]);
        setAppointments(appts);
        setPatients(pats);
        setPayments(pays);
        setYears(getYearsFromData(appts, pats, pays));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Group appointments by month for selected year
  const appointmentStats = Array(12).fill(0);
  appointments.forEach(a => {
    if (a.time) {
      const d = new Date(a.time);
      if (d.getFullYear() === Number(year)) {
        appointmentStats[d.getMonth()]++;
      }
    }
  });
  const appointmentData = appointmentStats.map((count, idx) => ({
    month: getMonthName(idx),
    count
  }));

  // Group patients by month for selected year
  const patientStats = Array(12).fill(0);
  patients.forEach(p => {
    if (p.createdAt) {
      const d = new Date(p.createdAt);
      if (d.getFullYear() === Number(year)) {
        patientStats[d.getMonth()]++;
      }
    }
  });
  const patientData = patientStats.map((count, idx) => ({
    month: getMonthName(idx),
    count
  }));

  // Group revenue by month for selected year
  const revenueStats = Array(12).fill(0);
  payments.forEach(p => {
    if (p.createdAt) {
      const d = new Date(p.createdAt);
      if (d.getFullYear() === Number(year)) {
        const totalFee = p.examinationFee + (p.serviceFee || []).reduce((acc, s) => acc + (s.fee || 0), 0);
        revenueStats[d.getMonth()] += totalFee;
      }
    }
  });
  const revenueData = revenueStats.map((revenue, idx) => ({
    month: getMonthName(idx),
    revenue
  }));

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Thống kê hệ thống</h1>
      <div className="flex justify-end mb-6">
        <label htmlFor="year-select" className="mr-2 font-medium">Chọn năm:</label>
        <select
          id="year-select"
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-center">Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 text-center">Số lượng lịch hẹn theo tháng ({year})</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Tháng', position: 'insideBottom', offset: -5 }} />
                  <YAxis allowDecimals={false} label={{ value: 'Lịch hẹn', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Lịch hẹn" fill="#3182ce" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 text-center">Số lượng người đăng ký theo tháng ({year})</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={patientData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: 'Tháng', position: 'insideBottom', offset: -5 }} />
                  <YAxis allowDecimals={false} label={{ value: 'Người đăng ký', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Người đăng ký" fill="#38a169" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 mt-8">
            <h2 className="text-lg font-semibold mb-4 text-center">Tổng doanh thu theo tháng ({year})</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" label={{ value: 'Tháng', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Doanh thu (VND)', angle: -90, position: 'insideLeft' }} tickFormatter={(value) => new Intl.NumberFormat('vi-VN').format(value)} />
                <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' VND'} />
                <Legend />
                <Bar dataKey="revenue" name="Doanh thu" fill="#dd6b20" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default StatisticalPage;
