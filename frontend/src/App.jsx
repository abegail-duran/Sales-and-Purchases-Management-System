import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="pos" element={
            <ProtectedRoute roles={['admin', 'manager', 'cashier']}>
              <POS />
            </ProtectedRoute>
          } />
          
          <Route path="sales" element={
            <ProtectedRoute roles={['admin', 'manager', 'cashier']}>
              <Sales />
            </ProtectedRoute>
          } />
          
          <Route path="purchases" element={
            <ProtectedRoute roles={['admin', 'manager', 'inventory_staff']}>
              <Purchases />
            </ProtectedRoute>
          } />

          <Route path="products" element={
            <ProtectedRoute roles={['admin', 'manager', 'inventory_staff']}>
              <Products />
            </ProtectedRoute>
          } />
          
          <Route path="suppliers" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Suppliers />
            </ProtectedRoute>
          } />
          
          <Route path="reports" element={
            <ProtectedRoute roles={['admin', 'manager']}>
              <Reports />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
