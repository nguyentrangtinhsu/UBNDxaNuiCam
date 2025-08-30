import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';
import { ShieldCheck, ToggleLeft, ToggleRight, Save } from 'lucide-react';

const AdminSettingsPage = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/system/settings');
            setSettings(res.data);
        } catch (error) {
            console.error("Lỗi tải cài đặt:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleMaintenanceChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            maintenance_mode: {
                ...prev.maintenance_mode,
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await api.put('/system/settings/maintenance', settings.maintenance_mode);
            setMessage('Lưu cài đặt thành công!');
            setTimeout(() => setMessage(''), 3000); // Ẩn thông báo sau 3 giây
        } catch (error) {
            setMessage('Lỗi! Không thể lưu cài đặt.');
            console.error("Lỗi lưu cài đặt:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner fullPage />;
    if (!settings) return <p>Không thể tải dữ liệu cài đặt.</p>;

    const isMaintenanceEnabled = settings.maintenance_mode?.enabled;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center">
                <ShieldCheck className="w-8 h-8 mr-3 text-blue-600"/>
                Cài đặt Hệ thống
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl">
                <h2 className="text-xl font-semibold text-slate-700">Chế độ Bảo trì</h2>
                <p className="text-sm text-slate-500 mt-1">
                    (Khi bật, chỉ có Admin mới có thể kích hoạt lại hệ thống)
                </p>

                <div className="mt-6 flex items-center justify-between p-4 rounded-md bg-slate-50">
                    <span className="font-medium">Trạng thái bảo trì đang tắt (nhấn nút để bật)</span>
                    <button onClick={() => handleMaintenanceChange('enabled', !isMaintenanceEnabled)}>
                        {isMaintenanceEnabled ? (
                            <ToggleRight className="w-10 h-10 text-green-500"/>
                        ) : (
                            <ToggleLeft className="w-10 h-10 text-slate-400"/>
                        )}
                    </button>
                </div>

                {isMaintenanceEnabled && (
                    <div className="mt-4 space-y-4 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tiêu đề thông báo</label>
                            <input
                                type="text"
                                value={settings.maintenance_mode.title}
                                onChange={(e) => handleMaintenanceChange('title', e.target.value)}
                                className="mt-1 input-style"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700">Nội dung thông báo</label>
                             <textarea
                                rows="3"
                                value={settings.maintenance_mode.message}
                                onChange={(e) => handleMaintenanceChange('message', e.target.value)}
                                className="mt-1 input-style"
                             />
                        </div>
                    </div>
                )}
                
                <div className="mt-6 border-t pt-5 flex items-center justify-between">
                     <p className={`text-sm ${message.includes('Lỗi') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
                     <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm disabled:bg-blue-300"
                    >
                        <Save className="w-4 h-4 mr-2"/>
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;