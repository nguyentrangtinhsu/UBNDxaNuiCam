import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import { 
    LayoutDashboard, ListChecks, Users, PieChart, History, Building, Settings, 
    BookOpen, Megaphone, Calendar, Users2, CalendarPlus, MessageSquare, 
    ShieldCheck, Info
} from 'lucide-react';

const Sidebar = ({ isSidebarOpen, setSidebarOpen }) => {
  const { user, hasPermission } = useContext(AuthContext);

  const navLinkClass = ({ isActive }) =>
    `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 text-sm ${
      isActive
        ? 'bg-blue-100 text-blue-700 font-semibold'
        : 'text-slate-700 hover:bg-slate-200'
    }`;
    
  if (!user) return null;

  return (
    <>
      <aside className={`fixed top-0 left-0 z-40 w-64 h-screen bg-white shadow-md transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-center h-16 border-b">
              <img src="/assets/5tayHCC_LV.png" alt="Logo" className="h-10 w-10"/>
              <span className="ml-3 text-lg font-bold text-slate-800">UBND xã Núi Cấm</span>
          </div>
          <nav className="mt-4 px-4 space-y-1 flex-grow overflow-y-auto pb-4">
            <p className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400 uppercase">THEO DÕI VÀ GIAO VIỆC</p>
            <NavLink to="/" end className={navLinkClass} onClick={() => setSidebarOpen(false)}>
              <LayoutDashboard className="w-5 h-5 mr-3" /> Bảng điều khiển
            </NavLink>
            <NavLink to="/tasks" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
              <ListChecks className="w-5 h-5 mr-3" /> Quản lý công việc
            </NavLink>

            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-slate-400 uppercase">QUẢN LÝ</p>
            {hasPermission(['user_management']) && (
              <NavLink to="/users" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                <Users className="w-5 h-5 mr-3" /> Quản lý tài khoản
              </NavLink>
            )}
            {hasPermission(['department_management']) && (
              <NavLink to="/departments" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                <Building className="w-5 h-5 mr-3" /> Quản lý phòng ban
              </NavLink>
            )}
            {hasPermission(['view_reports']) && (
              <NavLink to="/reports" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                <PieChart className="w-5 h-5 mr-3" /> Báo cáo & Thống kê
              </NavLink>
            )}
            {hasPermission(['view_audit_log']) && (
              <NavLink to="/audit-log" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                <History className="w-5 h-5 mr-3" /> Nhật ký hệ thống
              </NavLink>
            )}
            
            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-slate-400 uppercase">TIỆN ÍCH</p>
            <NavLink to="/handbook" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                <BookOpen className="w-5 h-5 mr-3" /> Cẩm nang
            </NavLink>
             <NavLink to="/media" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                <Megaphone className="w-5 h-5 mr-3" /> Thông tin truyền thông
            </NavLink>
            {/* Các mục đang phát triển */}
            <a href="#" className={`${navLinkClass({isActive: false})} opacity-50 cursor-not-allowed`}>
                <Calendar className="w-5 h-5 mr-3" /> Lịch làm việc
            </a>
            <a href="#" className={`${navLinkClass({isActive: false})} opacity-50 cursor-not-allowed`}>
                <Users2 className="w-5 h-5 mr-3" /> Họp & Hội nghị 
            </a>
             <a href="#" className={`${navLinkClass({isActive: false})} opacity-50 cursor-not-allowed`}>
                <CalendarPlus className="w-5 h-5 mr-3" /> Đăng ký phòng họp
            </a>
            <a href="#" className={`${navLinkClass({isActive: false})} opacity-50 cursor-not-allowed`}>
                <MessageSquare className="w-5 h-5 mr-3" /> Góp ý & Cải thiện 
            </a>


            <p className="px-4 pt-4 pb-1 text-xs font-semibold text-slate-400 uppercase">HỆ THỐNG</p>
             <NavLink to="/settings/profile" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                <Settings className="w-5 h-5 mr-3" /> Cài đặt
            </NavLink>
            {hasPermission(['system_settings']) && (
              <NavLink to="/admin/settings" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                <ShieldCheck className="w-5 h-5 mr-3" /> Cài đặt hệ thống
              </NavLink>
            )}
          </nav>

          {/* Liên kết Zalo OA */}
           <div className="px-4 py-4 border-t">
               <a href="https://zalo.me/3388785049828093387" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg bg-slate-100 hover:bg-slate-200">
                   <img src="/assets/QR_ZALO_OA.jpg" alt="Zalo OA QR Code" className="w-10 h-10 rounded-md"/>
                   <div className="ml-3">
                       <p className="text-sm font-semibold text-slate-800">Chính quyền số</p>
                       <p className="text-xs text-slate-500">xã Núi Cấm</p>
                   </div>
               </a>
           </div>
      </aside>
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
};

export default Sidebar;