import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, User, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { debounce } from 'lodash';

const AuditLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ user: '', action: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });

    const fetchLogs = useCallback(async (page = 1, currentFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: 15,
                ...currentFilters
            });
            const res = await api.get(`/audit-logs?${params.toString()}`);
            setLogs(res.data.logs);
            setPagination({ currentPage: res.data.currentPage, totalPages: res.data.totalPages });
        } catch (error) {
            console.error("Lỗi khi tải nhật ký:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs(1, filters);
    }, [fetchLogs, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Nhật ký hệ thống</h1>
            <p className="text-slate-500 mb-6">Theo dõi mọi hoạt động quan trọng diễn ra trên hệ thống.</p>

            {/* Filter Section */}
            <div className="flex flex-wrap gap-4 mb-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        name="action"
                        placeholder="Tìm theo hành động (ví dụ: tạo mới, cập nhật...)"
                        onChange={handleFilterChange}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                    />
                </div>
                 <div className="relative flex-grow">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        name="user"
                        placeholder="Tìm theo tên người thực hiện..."
                        onChange={handleFilterChange}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                    />
                </div>
                 <input type="date" name="startDate" onChange={handleFilterChange} className="border-slate-300 rounded-lg"/>
                 <input type="date" name="endDate" onChange={handleFilterChange} className="border-slate-300 rounded-lg"/>
            </div>

            {/* Table */}
            <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Người thực hiện</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hành động</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Chi tiết</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-10">Đang tải nhật ký...</td></tr>
                        ) : logs.map(log => (
                            <tr key={log.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{log.user_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{log.action}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {log.details}
                                    {log.task_title && <span className="block text-xs text-blue-600"> (Công việc: {log.task_title})</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {format(new Date(log.created_at), 'HH:mm, dd/MM/yyyy', { locale: vi })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Controls */}
             <div className="flex justify-between items-center mt-4 text-sm">
                <p>Trang {pagination.currentPage} / {pagination.totalPages}</p>
                 <div className="flex gap-1">
                    <button onClick={() => fetchLogs(1, filters)} disabled={pagination.currentPage === 1} className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"><ChevronsLeft size={16}/></button>
                    <button onClick={() => fetchLogs(pagination.currentPage - 1, filters)} disabled={pagination.currentPage === 1} className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"><ChevronLeft size={16}/></button>
                    <button onClick={() => fetchLogs(pagination.currentPage + 1, filters)} disabled={pagination.currentPage === pagination.totalPages} className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"><ChevronRight size={16}/></button>
                    <button onClick={() => fetchLogs(pagination.totalPages, filters)} disabled={pagination.currentPage === pagination.totalPages} className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"><ChevronsRight size={16}/></button>
                 </div>
            </div>
        </div>
    );
};

export default AuditLogPage;