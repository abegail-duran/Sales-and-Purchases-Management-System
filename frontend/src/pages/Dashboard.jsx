import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency, formatDateTime, getStockStatus } from '../utils/format';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Loading from '../components/Loading';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, chartRes, productsRes, transactionsRes, lowStockRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/sales-chart?period=daily'),
        api.get('/dashboard/top-products?limit=5'),
        api.get('/dashboard/recent-transactions?limit=10'),
        api.get('/dashboard/low-stock?limit=10')
      ]);

      setStats(statsRes.data.data);
      setSalesChart(chartRes.data.data);
      setTopProducts(productsRes.data.data);
      setRecentTransactions(transactionsRes.data.data);
      setLowStockProducts(lowStockRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Sales and Purchases System Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats?.todaysSales || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sales Transactions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.todaysTransactions || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalProducts || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inventory Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats?.totalInventoryValue || 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Warehouse className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-yellow-600" size={32} />
            <div>
              <p className="text-sm text-yellow-700">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-900">{stats?.lowStockItems || 0}</p>
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <TrendingDown className="text-red-600" size={32} />
            <div>
              <p className="text-sm text-red-700">Out of Stock</p>
              <p className="text-3xl font-bold text-red-900">{stats?.outOfStockItems || 0}</p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-green-600" size={32} />
            <div>
              <p className="text-sm text-green-700">Net Sales Today</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats?.netSales || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Daily Sales (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#dc2626" name="Sales (₱)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product.name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_quantity" fill="#dc2626" name="Quantity Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Sales</h3>
            <Link to="/sales" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.transaction_number}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(transaction.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(transaction.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        transaction.status === 'completed' ? 'badge-success' :
                        transaction.status === 'void' ? 'badge-danger' :
                        'badge-warning'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-6 text-center text-sm text-gray-500">
                      No sales transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Low Stock Products</h3>
            <Link to="/products" className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 font-medium">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStockProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {product.sku}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.current_stock} / {product.minimum_stock}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge badge-${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-4 py-6 text-center text-sm text-gray-500">
                      All products have adequate stock
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
