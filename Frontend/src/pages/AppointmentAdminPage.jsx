import React, { useEffect, useMemo, useState } from 'react'

import AppointmentManageCard from '../components/AppointmentManageCard'
import AppointmentFilter from '../components/AppointmentFilter'

import appointmentService from '../services/appointmentService'

import { Divider } from '@mui/material'

function AppointmentAdminPage() {
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await appointmentService.getAppointments()
        console.log("Fetched appointments:", data);
        // Sort by booking date (appointment.time) descending (newest first)
        const sortedData = [...data].sort((a, b) => new Date(b.time) - new Date(a.time))
        setAppointments(sortedData)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }

    fetchAppointments()
  }, [])

  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter appointments based on current filters
  const filteredAppointments = useMemo(() => {
  if (!appointments || appointments.length === 0) return []

  return appointments.filter((appointment) => {
    // Lọc theo trạng thái (nếu có)
    const matchStatus =
      !statusFilter || appointment.status === statusFilter

    // Lọc theo ngày khám (nếu có)
    const matchDate =
      !dateFilter ||
      new Date(appointment.time).toISOString().split("T")[0] === dateFilter

    // Lọc theo tìm kiếm (nếu có)
    const matchSearch = (() => {
      if (!searchTerm) return true

      const keyword = searchTerm.toLowerCase()

      const patientName = appointment.patientId?.fullName?.toLowerCase() || ""
      const doctorName = appointment.doctorId?.fullName?.toLowerCase() || ""
      const specialtyName =
        appointment.specialties?.[0]?.specialtyName?.toLowerCase() || ""
      const cidNumber = appointment.patientId?.cidNumber?.toLowerCase() || ""

      return (
        patientName.includes(keyword) ||
        doctorName.includes(keyword) ||
        specialtyName.includes(keyword) ||
        cidNumber.includes(keyword)
      )
    })()

    // Chỉ giữ appointment nếu thỏa cả 3 điều kiện
    return matchStatus && matchDate && matchSearch
  })
}, [appointments, statusFilter, dateFilter, searchTerm])


  const handleAppointmentClick = (appointment) => {
    console.log("Clicked appointment:", appointment)
    // Handle appointment click logic here
  }

  const handleClearFilters = () => {
    setStatusFilter("")
    setDateFilter("")
    setSearchTerm("")
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-custom-blue">Quản lý lịch hẹn</h1>
        <p className="text-gray-600">
          Tổng cộng: {filteredAppointments.length} lịch hẹn
          {filteredAppointments.length !== appointments.length && ` (từ ${appointments.length} lịch hẹn)`}
        </p>
      </div>

      <AppointmentFilter
        statusFilter={statusFilter}
        dateFilter={dateFilter}
        searchTerm={searchTerm}
        onStatusChange={setStatusFilter}
        onDateChange={setDateFilter}
        onSearchChange={setSearchTerm}
        onClearFilters={handleClearFilters}
      />

      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <AppointmentManageCard key={appointment.id} appointment={appointment} onClick={handleAppointmentClick} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy lịch hẹn</h3>
              <p className="text-gray-500 mb-4">Không có lịch hẹn nào phù hợp với bộ lọc hiện tại.</p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentAdminPage
