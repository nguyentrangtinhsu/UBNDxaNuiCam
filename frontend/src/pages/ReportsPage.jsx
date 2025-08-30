import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { BarChart, Clock, AlertCircle, CheckCircle, Users, Building } from 'lucide-react';
import Spinner from '../components/common/Spinner';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            {React.cloneElement(icon, { size: 24, className: 'text-white' })}
        </div>
    </div>
);

const ReportsPage = () => {
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({ userId: '', departmentId: '' });
    const [filterOptions, setFilterOptions] = useState({ users: [], departments: [] });
    const [loading, setLoading] = useState(true);

    const fetchFilters = useCallback(async () => {
        try {
            const res = await api.get('/reports/filters');
            setFilterOptions(res.data);
        } catch (error) {
            console.error("Lỗi khi tải bộ lọc:", error);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const statsRes = await api.get(`/reports/overview-stats?${params}`);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu báo cáo:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchFilters();
    }, [fetchFilters]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Báo cáo & Thống kê</h1>
                    <p className="mt-1 text-slate-500">Tổng quan về hiệu suất và tiến độ công việc.</p>
                </div>
                {/* Filter Section */}
                <div className="flex flex-wrap gap-3">
                    <select name="departmentId" value={filters.departmentId} onChange={handleFilterChange} className="input-style w-full sm:w-auto">
                        <option value="">Tất cả Phòng ban</option>
                        {filterOptions.departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                    </select>
                    <select name="userId" value={filters.userId} onChange={handleFilterChange} className="input-style w-full sm:w-auto">
                        <option value="">Tất cả Người dùng</option>
                         {filterOptions.users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
                    </select>
                </div>
            </div>
            
            {loading ? <Spinner fullPage /> : !stats ? <p>Không thể tải dữ liệu.</p> : (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Tổng Công Việc" value={stats.total} icon={<BarChart />} color="bg-blue-500" />
                        <StatCard title="Đang Thực Hiện" value={stats.inProgress} icon={<Clock />} color="bg-orange-500" />
                        <StatCard title="Quá Hạn" value={stats.overdue} icon={<AlertCircle />} color="bg-red-500" />
                        <StatCard title="Hoàn Thành" value={stats.completed} icon={<CheckCircle />} color="bg-green-500" />
                    </div>
                     {/* TODO: Thêm các biểu đồ chi tiết */}
                </>
            )}
        </div>
    );
};

export default ReportsPage;