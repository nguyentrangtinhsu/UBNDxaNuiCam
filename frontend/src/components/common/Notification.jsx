import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                handleClose();
            }, 5000); // Tự động đóng sau 5 giây
            return () => clearTimeout(timer);
        }
    }, [message, type]);

    const handleClose = () => {
        setVisible(false);
        // Delay việc gọi onClose để animation kịp chạy
        setTimeout(() => onClose(), 300); 
    };

    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
    const Icon = isSuccess ? CheckCircle : AlertTriangle;

    return (
        <div className={`fixed top-5 right-5 z-[100] transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-[120%]'}`}>
            <div className={`flex items-center text-white rounded-md shadow-lg p-4 ${bgColor}`}>
                <Icon className="w-6 h-6 mr-3" />
                <p className="text-sm font-medium">{message}</p>
                <button onClick={handleClose} className="ml-4 p-1 rounded-full hover:bg-black/20">
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default Notification;