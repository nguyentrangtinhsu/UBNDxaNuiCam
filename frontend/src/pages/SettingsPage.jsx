import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Lock, SunMoon, Languages, Bell, History } from 'lucide-react';

const settingsMenu = [
    { name: 'Thông tin cá nhân', path: '/settings/profile', icon: User },
    { name: 'Đổi mật khẩu', path: '/settings/password', icon: Lock },
    { name: 'Giao diện', path: '/settings/theme', icon: SunMoon },
    { name: 'Ngôn ngữ', path: '/settings/language', icon: Languages },
    { name: 'Thông báo', path: '/settings/notifications', icon: Bell },
    { name: 'Lịch sử hoạt động', path: '/settings/activity', icon: History },
];

const SettingsPage = () => {

    const navLinkClass = ({ isActive }) =>
        `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
        isActive
            ? 'bg-blue-100 text-blue-700'
            : 'text-slate-600 hover:bg-slate-100'
        }`;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Cài đặt</h1>
            <div className="flex flex-col md:flex-row gap-8">
                {/* Vertical Navigation */}
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <nav className="space-y-1">
                        {settingsMenu.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={navLinkClass}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                <span>{item.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1">
                    {/* The specific settings component (e.g., ProfilePage) will be rendered here */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;