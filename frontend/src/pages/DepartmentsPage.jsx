import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import Spinner from '../components/common/Spinner';
import DepartmentModal from '../components/departments/DepartmentModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';

const DepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useContext(AuthContext);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [modalMode, setModalMode] = useState('create');

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách phòng ban:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const handleOpenCreateModal = () => {
        setSelectedDepartment(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (department) => {
        setSelectedDepartment(department);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (department) => {
        setSelectedDepartment(department);
        setIsDeleteModalOpen(true);
    };
    
    const canManage = hasPermission(['department_management']);

    if (loading) return <Spinner fullPage />;

    return (
        <>
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Quản lý Phòng ban & Đơn vị</h1>
                        <p className="text-sm text-slate-500">(Tạo, chỉnh sửa các Phòng chuyên môn, Trung tâm, Tổ giúp việc,...)</p>
                    </div>
                    {canManage && (
                        <button onClick={handleOpenCreateModal} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                            <Plus size={20} className="mr-2"/>
                            Thêm mới
                        </button>
                    )}
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <ul className="divide-y divide-slate-200">
                        {departments.length > 0 ? departments.map(dep => (
                            <li key={dep.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50">
                                <div className="flex items-center">
                                    {/* HIỂN THỊ AVATAR PHÒNG BAN */}
                                    <img 
                                        src={dep.avatar || '/avatars/default-avatar.png'} 
                                        alt={`Avatar của ${dep.name}`}
                                        className="w-12 h-12 rounded-full object-cover mr-4"
                                    />
                                    <div>
                                        <p className="font-semibold text-slate-800">{dep.name}</p>
                                        <p className="text-sm text-slate-500">{dep.description || 'Không có mô tả'}</p>
                                    </div>
                                </div>
                                {canManage && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenEditModal(dep)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full">
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(dep)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </li>
                        )) : (
                             <p className="text-center py-10 text-slate-500">Chưa có phòng ban nào được tạo.</p>
                        )}
                    </ul>
                </div>
            </div>

            {canManage && (
                <>
                    <DepartmentModal 
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={fetchDepartments}
                        mode={modalMode}
                        departmentData={selectedDepartment}
                    />
                    <DeleteConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onConfirm={async () => {
                            if (selectedDepartment) {
                                await api.delete(`/departments/${selectedDepartment.id}`);
                                fetchDepartments();
                            }
                        }}
                        title="Xác nhận xóa"
                        message={`Bạn có chắc chắn muốn xóa phòng ban "${selectedDepartment?.name}"? Hành động này không thể khôi phục.`}
                    />
                </>
            )}
        </>
    );
};

export default DepartmentsPage;