import React, { useContext, useState, useEffect, useRef } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import Spinner from '../components/common/Spinner';
import { Camera } from 'lucide-react';

// Component chọn ngày tháng năm sinh
const DateOfBirthSelector = ({ value, onChange }) => {
    const date = value ? new Date(value) : new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const handleChange = (part, val) => {
        const newDate = new Date(year, month - 1, day);
        if (part === 'day') newDate.setDate(val);
        if (part === 'month') newDate.setMonth(val - 1);
        if (part === 'year') newDate.setFullYear(val);
        // Chuyển sang định dạng YYYY-MM-DD để gửi đi
        onChange({ target: { name: 'birth_date', value: newDate.toISOString().split('T')[0] } });
    };

    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="grid grid-cols-3 gap-3">
            <select value={day} onChange={(e) => handleChange('day', e.target.value)} className="input-style">
                {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={month} onChange={(e) => handleChange('month', e.target.value)} className="input-style">
                {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
            </select>
            <select value={year} onChange={(e) => handleChange('year', e.target.value)} className="input-style">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
    );
};


const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [profile, setProfile] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', content: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setProfile({
                fullName: user.fullName || '',
                cccd: user.cccd || '',
                birth_date: user.birth_date || '',
                phone_number: user.phone_number || '',
                email: user.email || '',
                role: user.role || '',
                department: user.department || '',
                avatar: user.avatar || ''
            });
            setAvatarPreview(user.avatar || '/avatars/default-avatar.png');
            setLoading(false);
        }
    }, [user]);

    const handleChange = (e) => {
        setProfile({...profile, [e.target.name]: e.target.value });
    }

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: '', content: '' });
        
        // TODO: Xử lý upload ảnh đại diện (sẽ cần API riêng cho việc này)
        // Hiện tại chỉ cập nhật thông tin text
        
        try {
            const res = await api.put(`/auth/profile`, { 
                fullName: profile.fullName, 
                birth_date: profile.birth_date,
                phone_number: profile.phone_number,
                email: profile.email
            });

            // Cập nhật thông tin user trong context để giao diện thay đổi ngay lập tức
            setUser(prev => ({
                ...prev, 
                fullName: res.data.fullName,
                birth_date: res.data.birth_date,
                phone_number: res.data.phone_number,
                email: res.data.email,
                // avatar: newAvatarUrl // Cập nhật sau khi có API upload
            }));
            
            setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });
        } catch (error) {
            setMessage({ type: 'error', content: error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.' });
        }
    };

    if (loading || !profile) return <Spinner fullPage />;

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Hồ sơ cá nhân</h1>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                    <div className="relative">
                        <img src={avatarPreview} className="w-32 h-32 rounded-full object-cover border-4 border-slate-200" alt="Avatar"/>
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all"
                            aria-label="Thay đổi ảnh đại diện"
                        >
                            <Camera size={18} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleAvatarChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-slate-800">{profile.fullName}</h2>
                        <p className="text-slate-500 mt-1">{profile.role}</p>
                        <p className="text-slate-500 text-sm">{profile.department || 'Chưa thuộc phòng ban'}</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="mt-8 border-t pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Họ và Tên</label>
                        <input type="text" name="fullName" value={profile.fullName} onChange={handleChange} className="mt-1 input-style" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Ngày sinh</label>
                        <DateOfBirthSelector value={profile.birth_date} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                        <input type="tel" name="phone_number" value={profile.phone_number} onChange={handleChange} className="mt-1 input-style" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input type="email" name="email" value={profile.email} onChange={handleChange} className="mt-1 input-style" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Số CCCD (Không thể thay đổi)</label>
                        <input type="text" value={profile.cccd} disabled className="mt-1 input-style bg-slate-100 cursor-not-allowed" />
                    </div>
                
                    <div className="md:col-span-2 mt-4">
                        {message.content && (
                            <p className={`text-sm mb-4 p-3 rounded-lg ${message.type === 'success' ? 'text-green-800 bg-green-50' : 'text-red-800 bg-red-50'}`}>
                                {message.content}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-4">
                            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                Cập nhật thông tin
                            </button>
                            <button type="button" onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-50">
                                Đổi mật khẩu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <ChangePasswordModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default ProfilePage;