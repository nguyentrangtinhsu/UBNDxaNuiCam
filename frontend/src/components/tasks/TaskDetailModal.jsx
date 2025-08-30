import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { X, User, Calendar, Flag, Clock, CornerUpLeft, Check, History, Paperclip, MessageSquare } from 'lucide-react';
import Spinner from '../common/Spinner';

// Helper components
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="text-slate-400 mr-3 mt-1">{React.cloneElement(icon, { size: 18 })}</div>
        <div>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="font-semibold text-slate-700">{value}</p>
        </div>
    </div>
);

const ActionButton = ({ onClick, text, icon = null, className = "bg-blue-600 hover:bg-blue-700" }) => (
     <button type="button" onClick={onClick} className={`flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm ${className}`}>
        {icon && React.cloneElement(icon, { size: 16, className: "mr-2" })}
        {text}
    </button>
);


const TaskDetailModal = ({ task, onClose, onUpdate }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, hasPermission } = useContext(AuthContext);

    useEffect(() => {
        const fetchTaskData = async () => {
            if (!task?.id) return;
            setLoading(true);
            try {
                const historyRes = await api.get(`/tasks/${task.id}/history`);
                setHistory(historyRes.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu chi tiết công việc:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTaskData();
    }, [task.id]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            await api.patch(`/tasks/${task.id}/status`, { status: newStatus });
            onUpdate(); // Tải lại danh sách công việc ở trang chính
            onClose();   // Đóng modal
        } catch (error) {
            console.error("Lỗi cập nhật trạng thái:", error);
            // Có thể thêm thông báo lỗi cho người dùng ở đây
        }
    };
    
    // Logic xác định các hành động người dùng có thể thực hiện
    const isAssignee = user.id === task.assignee_id;
    const isCreator = user.id === task.creator_id;
    const canApprove = hasPermission(['approve_task']);
    
    const canAccept = isAssignee && (task.status === 'Mới tạo');
    const canStart = isAssignee && task.status === 'Tiếp nhận';
    const canReport = isAssignee && task.status === 'Đang thực hiện';
    const canReview = (isCreator || canApprove) && task.status === 'Chờ duyệt';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6">
                    {/* Thông tin chính */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <InfoItem icon={<User />} label="Người giao việc" value={task.creator_name} />
                        <InfoItem icon={<User />} label="Người thực hiện" value={task.assignee_name} />
                        <InfoItem icon={<Calendar />} label="Ngày hết hạn" value={format(new Date(task.due_date), 'dd/MM/yyyy', { locale: vi })} />
                        <InfoItem icon={<Flag />} label="Độ ưu tiên" value={task.priority} />
                        <InfoItem icon={<Clock />} label="Trạng thái" value={task.status} />
                    </div>
                    
                    {/* Mô tả */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-2">Mô tả công việc</h3>
                        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-md whitespace-pre-wrap">{task.description || "Không có mô tả chi tiết."}</p>
                    </div>

                    {/* Lịch sử và Bình luận */}
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center"><History size={16} className="mr-2"/> Lịch sử hoạt động</h3>
                        {loading ? <Spinner /> : (
                            <div className="space-y-4 text-sm text-slate-600 max-h-48 overflow-y-auto border-l-2 border-slate-200 ml-1 pl-5">
                                {history.length > 0 ? history.map(item => (
                                    <div key={item.id} className="relative">
                                        <div className="absolute -left-[27px] top-1 w-3 h-3 bg-slate-300 rounded-full border-2 border-white"></div>
                                        <p className="font-semibold text-slate-800">{item.action}</p>
                                        <p className="text-xs text-slate-500">
                                            bởi <span className="font-medium">{item.user_name}</span> lúc {format(new Date(item.created_at), 'HH:mm, dd/MM/yyyy', { locale: vi })}
                                        </p>
                                        <p className="text-xs italic text-slate-500 mt-1">"{item.details}"</p>
                                    </div>
                                )) : <p>Chưa có lịch sử hoạt động.</p>}
                            </div>
                        )}
                    </div>

                     <div className="mt-6">
                        <h3 className="font-semibold mb-2 flex items-center"><MessageSquare size={16} className="mr-2"/> Bình luận & Trao đổi</h3>
                        <div className="bg-slate-50 p-4 rounded-md text-center text-sm text-slate-500">
                            <p>[Tính năng đang phát triển]</p>
                        </div>
                    </div>

                    <div className="mt-6">
                         <h3 className="font-semibold mb-2 flex items-center"><Paperclip size={16} className="mr-2"/> File đính kèm & Báo cáo</h3>
                         <div className="bg-slate-50 p-4 rounded-md text-center text-sm text-slate-500">
                             <p>[Tính năng đang phát triển]</p>
                         </div>
                     </div>
                </div>

                {/* Actions Footer */}
                <div className="p-6 border-t bg-slate-50 flex flex-wrap gap-3 justify-end items-center">
                    {canAccept && <ActionButton onClick={() => handleStatusUpdate('Tiếp nhận')} text="Tiếp nhận công việc" />}
                    {canStart && <ActionButton onClick={() => handleStatusUpdate('Đang thực hiện')} text="Bắt đầu thực hiện" />}
                    {canReport && <ActionButton onClick={() => handleStatusUpdate('Chờ duyệt')} text="Báo cáo hoàn thành" />}
                    {canReview && (
                        <>
                            <ActionButton onClick={() => handleStatusUpdate('Yêu cầu làm lại')} text="Yêu cầu làm lại" icon={<CornerUpLeft/>} className="bg-yellow-500 hover:bg-yellow-600" />
                            <ActionButton onClick={() => handleStatusUpdate('Hoàn thành')} text="Duyệt & Hoàn thành" icon={<Check />} />
                        </>
                    )}
                     <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-100">Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;