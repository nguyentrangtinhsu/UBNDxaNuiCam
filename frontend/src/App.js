import { Routes, Route } from 'react-router-dom';

// --- Layout & Authentication ---
import DashboardLayout from './components/layout/DashboardLayout';
import PrivateRoute from './components/routes/PrivateRoute';

// --- Core Pages ---
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';

// --- Management Pages ---
import UsersPage from './pages/UsersPage';
import DepartmentsPage from './pages/DepartmentsPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogPage from './pages/AuditLogPage';

// --- NEW PAGES (Imported for new routes) ---
import SettingsPage from './pages/SettingsPage';
import AdminSettingsPage from './pages/AdminSettingsPage'; // Trang cài đặt của Admin
import HandbookPage from './pages/HandbookPage'; // Trang cẩm nang
import MediaPage from './pages/MediaPage'; // Trang truyền thông
import ComingSoonPage from './pages/ComingSoonPage'; // Trang "Đang phát triển"
import MaintenancePage from './pages/MaintenancePage'; // Trang bảo trì
import AccessDeniedPage from './pages/AccessDeniedPage';

function App() {
  return (
    <Routes>
      {/* Các route công khai, không cần đăng nhập */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Bố cục chính của trang quản trị, yêu cầu đăng nhập */}
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        {/* Route mặc định */}
        <Route index element={<DashboardPage />} />

        {/* Các route chức năng chính */}
        <Route path="tasks" element={<TasksPage />} />
        
        {/* --- CÁC ROUTE ĐƯỢC BẢO VỆ BỞI PERMISSION --- */}
        <Route 
          path="users" 
          element={<PrivateRoute requiredPermissions={['user_management']}><UsersPage /></PrivateRoute>} 
        />
        <Route 
          path="departments" 
          element={<PrivateRoute requiredPermissions={['department_management']}><DepartmentsPage /></PrivateRoute>} 
        />
        <Route 
          path="reports" 
          element={<PrivateRoute requiredPermissions={['view_reports']}><ReportsPage /></PrivateRoute>} 
        />
        <Route 
          path="audit-log" 
          element={<PrivateRoute requiredPermissions={['view_audit_log']}><AuditLogPage /></PrivateRoute>} 
        />
        <Route 
          path="admin/settings" 
          element={<PrivateRoute requiredPermissions={['system_settings']}><AdminSettingsPage /></PrivateRoute>} 
        />
        
        {/* --- ROUTE CÀI ĐẶT LỒNG NHAU --- */}
        <Route path="settings" element={<SettingsPage />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="password" element={<ComingSoonPage />} />
          <Route path="theme" element={<ComingSoonPage />} />
          <Route path="language" element={<ComingSoonPage />} />
          <Route path="notifications" element={<ComingSoonPage />} />
          <Route path="activity" element={<ComingSoonPage />} />
        </Route>

        {/* --- CÁC ROUTE TIỆN ÍCH KHÁC --- */}
        <Route path="handbook" element={<HandbookPage />} />
        <Route path="media" element={<MediaPage />} />

        {/* Các route "Đang phát triển" */}
        <Route path="schedule" element={<ComingSoonPage />} />
        <Route path="meetings" element={<ComingSoonPage />} />
        <Route path="meeting-room" element={<ComingSoonPage />} />
        <Route path="feedback" element={<ComingSoonPage />} />

      </Route>
    </Routes>
  );
}

export default App;