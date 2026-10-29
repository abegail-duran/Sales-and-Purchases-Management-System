import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  FileText,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      roles: ['admin', 'manager', 'cashier', 'inventory_staff'] 
    },
    { 
      path: '/pos', 
      icon: ShoppingCart, 
      label: 'Point of Sale', 
      roles: ['admin', 'manager', 'cashier'] 
    },
    { 
      path: '/sales', 
      icon: DollarSign, 
      label: 'Sales History', 
      roles: ['admin', 'manager', 'cashier'] 
    },
    { 
      path: '/purchases', 
      icon: ShoppingBag, 
      label: 'Purchases', 
      roles: ['admin', 'manager', 'inventory_staff'] 
    },
    { 
      path: '/products', 
      icon: Package, 
      label: 'Products', 
      roles: ['admin', 'manager', 'inventory_staff'] 
    },
    { 
      path: '/suppliers', 
      icon: Users, 
      label: 'Suppliers', 
      roles: ['admin', 'manager'] 
    },
    { 
      path: '/reports', 
      icon: FileText, 
      label: 'Reports', 
      roles: ['admin', 'manager'] 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white shadow-lg flex flex-col h-full
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header / Brand */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h1 className="text-base font-bold text-red-600 leading-tight">
              Sales and Purchases
            </h1>
            <p className="text-xs font-semibold text-gray-700">
              Management System
            </p>
            <p className="text-[11px] font-medium text-gray-400">
              ESTRELLA FOOD HUB
            </p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-red-50 text-red-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t space-y-3">
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold">
                  {user.first_name ? user.first_name.charAt(0) : 'U'}
                  {user.last_name ? user.last_name.charAt(0) : ''}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {user.role ? user.role.replace('_', ' ') : ''}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
