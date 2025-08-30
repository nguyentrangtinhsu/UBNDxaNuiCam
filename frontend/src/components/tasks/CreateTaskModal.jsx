import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Trung bình');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const res = await api.get('/users');
          setUsers(res.data);
          if (res.data.length > 0) {
            setAssigneeId(res.data[0].id);
          }
        } catch (err) {
          console.error("Lỗi tải người dùng:", err);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tasks', { 
        title, 
        description, 
        assignee_id: assigneeId, 
        due_date: dueDate, 
        priority 
      });
      onTaskCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo công việc.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 md:max-w-lg mx-auto p-6">
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-lg font-semibold text-slate-800">Tạo công việc mới</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Tên công việc</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Giao cho</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
            </select>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">Ngày hết hạn</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700">Độ ưu tiên</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Thấp</option>
                <option>Trung bình</option>
                <option>Cao</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end pt-4 border-t mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50 mr-2">Hủy</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Tạo công việc</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;