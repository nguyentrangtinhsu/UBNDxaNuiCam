import React from 'react';
import { BookOpen } from 'lucide-react';

const HandbookPage = () => {
    return (
        <div>
            <div className="flex items-center mb-6">
                <BookOpen className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Cẩm nang sử dụng</h1>
                    <p className="mt-1 text-slate-500">Tài liệu hướng dẫn, quy trình và các thông tin cần thiết.</p>
                </div>
            </div>
            
             <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-semibold text-slate-700">Nội dung đang được xây dựng</h2>
                <p className="text-slate-500 mt-2">Tính năng quản lý và hiển thị nội dung cẩm nang sẽ sớm được ra mắt.</p>
            </div>
        </div>
    );
};

export default HandbookPage;