import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Kiểm tra token đã hết hạn chưa
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            setUser(null);
        } else {
            // Lưu toàn bộ thông tin user từ token vào state
            setUser(decoded.user);
        }
      } catch (error) {
        // Nếu token bị lỗi, xóa nó đi
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setUser(decoded.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login'; // Chuyển hướng và làm mới
  };

  // Hàm kiểm tra quyền hạn tiện ích
  const hasPermission = (requiredPermissions = []) => {
      if (!user || !user.permissions) {
          return false;
      }
      // Quyền Admin có thể làm mọi thứ
      if (user.permissions.includes('full_access')) {
          return true;
      }
      // Kiểm tra xem người dùng có TẤT CẢ các quyền được yêu cầu hay không
      return requiredPermissions.every(p => user.permissions.includes(p));
  };

  const authContextValue = {
      user,
      login,
      logout,
      loading,
      hasPermission,
      setUser // Thêm setUser để có thể cập nhật thông tin user từ ProfilePage
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;