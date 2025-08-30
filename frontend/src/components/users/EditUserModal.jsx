import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const EditUserModal = ({ isOpen, onClose, onUserUpdated, user }) => {
    const [formData, setFormData] = useState({});
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Cập nhật form data khi `user` prop thay đổi
        if (user) {
            setFormData({
                fullName: user.full_name || '',
                username: user.username || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                // Định dạng lại ngày tháng để input type="date" có thể nhận
                birth_date: user.birth_date ? user.birth_date.split('T')[0] : '', 
                role_id: user.role_id || '',
                department_id: user.department_id || '',
                note: user.note || '',
                is_active: user.is_active,
            });
        }
    }, [user]);

    useEffect(() => {
        // Fetch dữ liệu cho dropdowns khi modal mở
        const fetchData = async () => {
            if (isOpen) {
                try {
                    const [rolesRes, departmentsRes] = await Promise.all([
                        api.get('/roles'),
                        api.get('/departments')
                    ]);
                    setRoles(rolesRes.data);
                    setDepartments(departmentsRes.data);
                } catch (error) {
                    setError("Không thể tải được danh sách vai trò/phòng ban.");
                }
            }
        };
        fetchData();
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.put(`/users/${user.id}`, formData);
            onUserUpdated();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Cập nhật thất bại.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-2">Chỉnh sửa người dùng</h2>
                <p className="text-sm text-slate-500 mb-6">CCCD: {user.cccd}</p>
                {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Các trường nhập liệu tương tự CreateUserModal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Họ và Tên</label>
                            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full input-style" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Tên đăng nhập</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full input-style" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full input-style" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                            <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} className="mt-1 block w-full input-style" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Ngày sinh</label>
                        <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="mt-1 block w-full input-style" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Vai trò</label>
                            <select name="role_id" value={formData.role_id} onChange={handleChange} className="mt-1 block w-full input-style">
                                {roles.map(role => <option key={role.id} value={role.id}>{role.role_name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Phòng ban/Đơn vị</label>
                            <select name="department_id" value={formData.department_id} onChange={handleChange} className="mt-1 block w-full input-style">
                                <option value="">Không thuộc phòng ban</option>
                                {departments.map(dep => <option key={dep.id} value={dep.id}>{dep.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Ghi chú</label>
                        <textarea name="note" value={formData.note} onChange={handleChange} rows="2" className="mt-1 block w-full input-style" />
                    </div>
                     <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                            {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;