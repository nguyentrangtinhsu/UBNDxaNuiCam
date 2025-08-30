import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Briefcase, FilePlus2, Loader2, CheckCircle } from 'lucide-react';
import Spinner from '../components/common/Spinner';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // API này lấy các công việc liên quan đến người dùng (được giao hoặc hỗ trợ)
                const res = await api.get('/tasks'); 
                const userTasks = res.data;
                setStats({
                    total: userTasks.length,
                    new: userTasks.filter(t => t.status === 'Mới tạo' || t.status === 'Tiếp nhận').length,
                    inProgress: userTasks.filter(t => t.status === 'Đang thực hiện').length,
                    completed: userTasks.filter(t => t.status === 'Hoàn thành').length,
                });
            } catch (error) {
                console.error("Lỗi khi tải thống kê:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    if (loading) return <Spinner fullPage />;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Bảng điều khiển</h1>
            <p className="mt-1 text-slate-500">Chào mừng trở lại, {user.fullName}!</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Tổng công việc của bạn</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600"><Briefcase /></div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Việc mới/Chờ nhận</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.new}</p>
                        </div>
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600"><FilePlus2 /></div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Đang thực hiện</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.inProgress}</p>
                        </div>
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600"><Loader2 className="animate-spin"/></div>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Hoàn thành</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.completed}</p>
                        </div>
                        <div className="p-3 rounded-full bg-green-100 text-green-600"><CheckCircle /></div>
                    </div>
                </div>
            </div>
            {/* Thêm các biểu đồ hoặc danh sách công việc sắp tới hạn tại đây */}
        </div>
    );
};

export default DashboardPage;