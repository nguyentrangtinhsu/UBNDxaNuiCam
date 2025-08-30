import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { Camera } from 'lucide-react';

const DepartmentModal = ({ isOpen, onClose, onSuccess, mode, departmentData }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [avatarFile, setAvatarFile] = useState(null); // State cho file ảnh
    const [avatarPreview, setAvatarPreview] = useState(null); // State cho ảnh xem trước
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const isEditMode = mode === 'edit';

    useEffect(() => {
        if (isOpen) {
            if (isEditMode && departmentData) {
                setName(departmentData.name);
                setDescription(departmentData.description || '');
                setAvatarPreview(departmentData.avatar || '/avatars/default-avatar.png');
            } else {
                setName('');
                setDescription('');
                setAvatarPreview('/avatars/default-avatar.png');
            }
            setError('');
            setAvatarFile(null);
        }
    }, [isOpen, isEditMode, departmentData]);

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // TODO: API cần hỗ trợ multipart/form-data để upload file
            // Hiện tại, logic sẽ chỉ gửi dữ liệu text
            const payload = { name, description };
            if (isEditMode) {
                await api.put(`/departments/${departmentData.id}`, payload);
            } else {
                await api.post('/departments', payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-6">{isEditMode ? 'Chỉnh sửa Phòng ban' : 'Tạo Phòng ban mới'}</h2>
                {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
                
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <img src={avatarPreview} className="w-24 h-24 rounded-full object-cover border-4 border-slate-200" alt="Avatar phòng ban"/>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                        >
                            <Camera size={16} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="dep-name" className="block text-sm font-medium text-slate-700">Tên Phòng ban/Đơn vị</label>
                        <input
                            id="dep-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full input-style"
                        />
                    </div>
                    <div>
                        <label htmlFor="dep-desc" className="block text-sm font-medium text-slate-700">Mô tả (tùy chọn)</label>
                        <textarea
                            id="dep-desc"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full input-style"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepartmentModal;