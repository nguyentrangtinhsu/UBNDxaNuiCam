import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { Plus, Search, MoreVertical, Edit, Trash2, UserCheck, UserX, Eye } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import api from '../api/axios';
import AuthContext from '../context/AuthContext';
import CreateUserModal from '../components/users/CreateUserModal';
import EditUserModal from '../components/users/EditUserModal';
import DeleteUserModal from '../components/users/DeleteUserModal';
import { debounce } from 'lodash';

// RoleBadge component
const RoleBadge = ({ name, color = '#64748b' }) => (
    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" style={{ backgroundColor: `${color}20`, color: color }}>
        {name}
    </span>
);

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modals, setModals] = useState({ create: false, edit: false, delete: false, view: false });
    const [selectedUser, setSelectedUser] = useState(null);
    const { hasPermission } = useContext(AuthContext);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách tài khoản:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    // Xử lý Khóa/Mở khóa tài khoản
    const handleToggleStatus = async (user) => {
        try {
            await api.patch(`/users/${user.id}/status`, { is_active: !user.is_active });
            fetchUsers(); // Tải lại danh sách sau khi cập nhật
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái người dùng:", error);
        }
    };

    const openModal = (modalName, user = null) => {
        setSelectedUser(user);
        setModals(prev => ({ ...prev, [modalName]: true }));
    };

    const closeModal = (modalName) => {
        setSelectedUser(null);
        setModals(prev => ({ ...prev, [modalName]: false }));
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cccd.includes(searchTerm) ||
        (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const canManageUsers = hasPermission(['user_management']);

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý tài khoản</h1>
                    <p className="text-sm text-slate-500">(Tạo, chỉnh sửa và phân quyền cho tài khoản)</p>
                </div>
                {canManageUsers && (
                    <button onClick={() => openModal('create')} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus size={20} className="mr-2"/>
                        Tạo Tài khoản
                    </button>
                )}
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                    <input
                        type="text"
                        placeholder="Tìm theo tên, CCCD, email, phòng ban..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tài khoản</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email & SĐT</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phòng ban</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-10">Đang tải dữ liệu...</td></tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover" src={user.avatar || '/avatars/default-avatar.png'} alt="Avatar" />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                                {user.full_name}
                                            </div>
                                            <div className="text-sm text-slate-500">@{user.username || 'N/A'} / CCCD: {user.cccd}</div>
                                             <RoleBadge name={user.role_name} color={user.role_color} />
                                        </div>
                                    </div>
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    <div>{user.email || 'Chưa có'}</div>
                                    <div>{user.phone_number || 'Chưa có'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{user.department_name || 'Chưa có'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {canManageUsers && (
                                        <Menu as="div" className="relative inline-block text-left">
                                            <Menu.Button className="p-2 rounded-full hover:bg-slate-100 focus:outline-none">
                                                <MoreVertical className="h-5 w-5 text-slate-500" />
                                            </Menu.Button>
                                            <Transition as={React.Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                                <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                                    <div className="py-1">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button onClick={() => openModal('edit', user)} className={`${active ? 'bg-slate-100' : ''} group flex items-center w-full px-4 py-2 text-sm text-slate-700`}>
                                                                    <Edit className="mr-3 h-5 w-5 text-slate-400" /> Chỉnh sửa
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button onClick={() => handleToggleStatus(user)} className={`${active ? 'bg-slate-100' : ''} group flex items-center w-full px-4 py-2 text-sm text-slate-700`}>
                                                                    {user.is_active 
                                                                        ? <><UserX className="mr-3 h-5 w-5 text-yellow-500" /> Khóa tài khoản</> 
                                                                        : <><UserCheck className="mr-3 h-5 w-5 text-green-500" /> Mở khóa</>
                                                                    }
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                        <div className="border-t my-1"></div>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button onClick={() => openModal('delete', user)} className={`${active ? 'bg-slate-100' : ''} group flex items-center w-full px-4 py-2 text-sm text-red-700`}>
                                                                    <Trash2 className="mr-3 h-5 w-5 text-red-400" /> Xóa vĩnh viễn
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </div>
                                                </Menu.Items>
                                            </Transition>
                                        </Menu>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            {canManageUsers && (
                <>
                    <CreateUserModal isOpen={modals.create} onClose={() => closeModal('create')} onUserCreated={fetchUsers} />
                    {selectedUser && <EditUserModal isOpen={modals.edit} onClose={() => closeModal('edit')} onUserUpdated={fetchUsers} user={selectedUser} />}
                    {selectedUser && <DeleteUserModal isOpen={modals.delete} onClose={() => closeModal('delete')} onUserDeleted={fetchUsers} user={selectedUser} />}
                </>
            )}
        </div>
    );
};

export default UsersPage;