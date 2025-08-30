import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Plus } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import TaskColumn from '../components/tasks/TaskColumn';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useContext(AuthContext);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    // Không cần setLoading(true) ở đây vì sẽ gây nhấp nháy khi modal đóng
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error("Lỗi khi tải công việc:", error);
    } finally {
      setLoading(false); // Chỉ set loading false sau lần tải đầu tiên
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const canCreateTask = hasPermission(['create_task']);

  // NÂNG CẤP LOGIC LỌC
  const columns = {
    // Thêm trạng thái 'Yêu cầu làm lại' vào cột đầu tiên
    'new_and_pending': tasks.filter(t => ['Mới tạo', 'Tiếp nhận', 'Yêu cầu làm lại'].includes(t.status)),
    'in_progress': tasks.filter(t => t.status === 'Đang thực hiện'),
    'reviewing': tasks.filter(t => t.status === 'Chờ duyệt'),
    'completed': tasks.filter(t => t.status === 'Hoàn thành'),
  };

  if (loading) return <Spinner fullPage />;

  return (
    <>
      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onTaskCreated={() => {
            setIsCreateModalOpen(false);
            fetchTasks(); // Tải lại danh sách sau khi tạo
        }}
      />
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
              setSelectedTask(null); // Đóng modal
              fetchTasks(); // Tải lại danh sách
          }}
        />
      )}

      <div>
          <div className="flex items-center justify-between mb-6">
              <div>
                  <h1 className="text-3xl font-bold text-slate-800">Quản lý công việc</h1>
                  <p className="mt-1 text-slate-500">(Theo dõi, giao việc và báo cáo tiến độ)</p>
              </div>
              {canCreateTask && (
                  <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm">
                      <Plus className="w-5 h-5 mr-2" /> Giao việc mới
                  </button>
              )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <TaskColumn title="Mới & Chờ tiếp nhận" tasks={columns['new_and_pending']} onTaskClick={setSelectedTask} />
              <TaskColumn title="Đang thực hiện" tasks={columns['in_progress']} onTaskClick={setSelectedTask} />
              <TaskColumn title="Chờ duyệt" tasks={columns['reviewing']} onTaskClick={setSelectedTask} />
              <TaskColumn title="Hoàn thành" tasks={columns['completed']} onTaskClick={setSelectedTask} />
          </div>
      </div>
    </>
  );
};

export default TasksPage;