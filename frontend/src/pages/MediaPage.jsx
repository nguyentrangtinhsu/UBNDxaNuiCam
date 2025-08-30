import React from 'react';
import { Megaphone } from 'lucide-react';

const MediaPage = () => {
    return (
        <div>
            <div className="flex items-center mb-6">
                <Megaphone className="w-8 h-8 text-green-600 mr-4" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Thông tin truyền thông</h1>
                    <p className="mt-1 text-slate-500">Các thông báo, tin tức và hoạt động của đơn vị.</p>
                </div>
            </div>
            
             <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-semibold text-slate-700">Nội dung đang được xây dựng</h2>
                <p className="text-slate-500 mt-2">Tính năng quản lý và hiển thị tin tức truyền thông sẽ sớm được ra mắt.</p>
            </div>
        </div>
    );
};

export default MediaPage;