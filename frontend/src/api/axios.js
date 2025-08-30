import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động đính kèm token vào mỗi yêu cầu
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi toàn cục (NÂNG CẤP)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Lỗi 401: Token không hợp lệ hoặc hết hạn -> Đăng xuất
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."));
      }
      
      // Lỗi 503: Hệ thống đang bảo trì -> Chuyển hướng đến trang bảo trì
      if (error.response.status === 503) {
        // Chỉ chuyển hướng nếu chưa ở trên trang bảo trì để tránh lặp vô hạn
        if (window.location.pathname !== '/maintenance') {
           window.location.href = '/maintenance';
        }
        return Promise.reject(new Error("Hệ thống đang bảo trì."));
      }
    }
    return Promise.reject(error);
  }
);

export default api;