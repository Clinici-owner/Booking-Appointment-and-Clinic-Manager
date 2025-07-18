"use client"

import React from "react"
import { Calendar, Filter, X } from "lucide-react"

function AppointmentFilter({
  statusFilter,
  dateFilter,
  searchTerm,
  onStatusChange,
  onDateChange,
  onSearchChange,
  onClearFilters,
}) {
  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "cancelled", label: "Đã hủy" },
    { value: "completed", label: "Đã khám xong" },
  ]

  const hasActiveFilters = statusFilter || dateFilter || searchTerm

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Bộ lọc: tìm kiếm, trạng thái, ngày */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Tìm kiếm </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nhập từ khóa tìm kiếm..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Ngày khám</label>
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pl-10"
            />
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Hiển thị các filter đang áp dụng */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Tìm kiếm: "{searchTerm}"
                <button onClick={() => onSearchChange("")} className="ml-1 hover:text-blue-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Trạng thái: {statusOptions.find((opt) => opt.value === statusFilter)?.label}
                <button onClick={() => onStatusChange("")} className="ml-1 hover:text-green-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {dateFilter && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Ngày: {new Date(dateFilter).toLocaleDateString("vi-VN")}
                <button onClick={() => onDateChange("")} className="ml-1 hover:text-purple-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AppointmentFilter
