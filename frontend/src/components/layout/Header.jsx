import React, { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import api from '../../api/axios';
import { Bell, ChevronDown, LogOut, User, Menu } from 'lucide-react';

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Nâng cấp: State để lưu thông báo từ API
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  const fetchNotifications = useCallback(async () => {
      setLoadingNotifs(true);
      try {
          // API này cần được tạo ở backend
          const res = await api.get('/notifications'); 
          setNotifications(res.data);
      } catch (error) {
          console.error("Không thể tải thông báo:", error);
      } finally {
          setLoadingNotifs(false);
      }
  }, []);

  useEffect(() => {
      // Tải thông báo khi component được mount
      fetchNotifications();
      // Thiết lập Polling: Tự động tải lại thông báo mỗi 30 giây
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval); // Dọn dẹp khi component unmount
  }, [fetchNotifications]);

  const hasUnread = notifications.some(n => !n.is_read);

  const handleMarkAsRead = async (notificationId) => {
      // API này cần được tạo ở backend
      // api.post(`/notifications/${notificationId}/read`);
      // Cập nhật trạng thái ở frontend để giao diện thay đổi ngay lập tức
      setNotifications(
          notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
  };

  return (
    <header className="relative z-20 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-500">
            <Menu />
        </button>
        <div className="flex-1"></div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="text-slate-500 hover:text-slate-700">
                <Bell />
                {hasUnread && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
            </button>
             {isNotificationsOpen && (
                 <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-30" onMouseLeave={() => setIsNotificationsOpen(false)}>
                     <div className="px-4 py-2 font-semibold text-sm border-b">Thông báo</div>
                     <div className="max-h-80 overflow-y-auto">
                        {loadingNotifs ? <p className="text-center text-sm p-4">Đang tải...</p> : notifications.length > 0 ? notifications.map(notif => (
                             <div 
                                key={notif.id} 
                                className={`px-4 py-3 hover:bg-slate-50 border-b cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''}`}
                                onClick={() => handleMarkAsRead(notif.id)}
                            >
                                 <p className="text-sm text-slate-700">{notif.message}</p>
                                 <p className="text-xs text-slate-400 mt-1">{notif.time_ago}</p>
                             </div>
                        )) : (
                            <p className="text-sm text-slate-500 text-center py-4">Không có thông báo mới.</p>
                        )}
                     </div>
                 </div>
             )}
          </div>
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2">
              <img className="w-8 h-8 rounded-full object-cover" src={user.avatar || `/avatars/default-avatar.png`} alt="User avatar"/>
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-slate-800">{user.fullName}</div>
                <div className="text-xs text-slate-500">{user.role}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30" onClick={() => setIsMenuOpen(false)}>
                <Link to="/settings/profile" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  <User className="w-4 h-4 mr-2" /> Hồ sơ cá nhân
                </Link>
                <button onClick={logout} className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;