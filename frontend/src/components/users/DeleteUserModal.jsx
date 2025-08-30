import React from 'react';
import api from '../../api/axios';
import { AlertTriangle } from 'lucide-react';

const DeleteUserModal = ({ isOpen, onClose, onUserDeleted, user }) => {
    if (!isOpen || !user) return null;

    const handleDelete = async () => {
        try {
            await api.delete(`/users/${user.id}`);
            onUserDeleted();
            onClose();
        } catch (error) {
            console.error("Lỗi khi xóa người dùng:", error);
            // Có thể thêm thông báo lỗi cho người dùng ở đây
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Xóa người dùng
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                Bạn có chắc chắn muốn xóa người dùng <span className="font-bold">{user.full_name}</span>? Hành động này không thể được hoàn tác.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={handleDelete}
                    >
                        Xóa
                    </button>
                    <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={onClose}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal;
