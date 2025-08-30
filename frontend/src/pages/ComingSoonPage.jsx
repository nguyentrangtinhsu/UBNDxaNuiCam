import React from 'react';
import { Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComingSoonPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-lg p-12 text-center">
            <Wrench className="w-24 h-24 text-blue-500 mb-6 animate-bounce" />
            <h1 className="text-4xl font-bold text-slate-800">[Đang phát triển]</h1>
            <p className="text-slate-600 mt-3 max-w-md">
                Tính năng này sẽ được ra mắt trong thời gian tới.
            </p>
            <Link 
                to="/" 
                className="mt-8 px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
                Quay về Bảng điều khiển
            </Link>
        </div>
    );
};

export default ComingSoonPage;