import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'

const DataTable = ({ columns, data, onRowClick, searchPlaceholder = 'Search...' }) => {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 8

  const filteredData = data.filter((row) =>
    columns.some((col) => {
      const val = col.accessor ? row[col.accessor] : ''
      return String(val).toLowerCase().includes(search.toLowerCase())
    })
  )

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const paginated = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  )

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Search bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 gap-2 w-72">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="bg-transparent text-sm outline-none w-full text-gray-700"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Filter size={14} />
          <span>{filteredData.length} results</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              {columns.map((col, i) => (
                <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paginated.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-gray-50/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3 text-sm text-gray-700">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-400 text-sm">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                  ${page === currentPage ? 'bg-[#EF4F5F] text-white' : 'hover:bg-gray-100 text-gray-600'}
                `}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
