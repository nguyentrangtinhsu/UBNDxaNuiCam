import React from 'react';
import { format, differenceInDays, isPast } from 'date-fns';
import { vi } from 'date-fns/locale';

const TaskCard = ({ task, onClick }) => {
    const dueDate = new Date(task.due_date);
    const remainingDays = differenceInDays(dueDate, new Date());
    const isOverdue = isPast(dueDate) && task.status !== 'Hoàn thành';

    let deadlineColor = 'text-slate-500';
    let deadlineText = `Còn lại ${remainingDays} ngày`;

    if (isOverdue) {
        deadlineColor = 'text-red-600 font-semibold';
        deadlineText = `Quá hạn ${Math.abs(remainingDays)} ngày, đề nghị báo cáo`;
    } else if (remainingDays <= 1) {
        deadlineColor = 'text-yellow-600 font-semibold';
        deadlineText = 'Tới hạn hôm nay';
    }

    const priorityClasses = {
        'Cao': 'bg-red-100 text-red-800',
        'Trung bình': 'bg-yellow-100 text-yellow-800',
        'Thấp': 'bg-blue-100 text-blue-800'
    };
    
    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-md shadow-sm p-4 border border-slate-200 hover:shadow-md hover:border-blue-500 cursor-pointer transition-all"
        >
            <div className="flex justify-between items-start">
                <h4 className="font-semibold text-slate-800 text-sm mb-2">{task.title}</h4>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityClasses[task.priority] || priorityClasses['Trung bình']}`}>
                    {task.priority}
                </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Người thực hiện: <span className="font-medium text-slate-600">{task.assignee_name}</span></p>
            
            <div className="flex justify-between items-center border-t pt-2 mt-2">
                <p className={`text-xs ${deadlineColor}`}>
                    Hạn: {format(dueDate, 'dd/MM/yyyy', { locale: vi })}
                </p>
                <div className="flex -space-x-2">
                    {/* Placeholder for supporter avatars */}
                </div>
            </div>
             <p className={`text-xs text-center mt-1 font-medium ${deadlineColor}`}>
                    {deadlineText}
                </p>
        </div>
    );
};

export default TaskCard;