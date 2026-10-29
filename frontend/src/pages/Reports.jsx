import { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/format';
import { TrendingUp, Package, ShoppingBag, DollarSign } from 'lucide-react';
import Loading from '../components/Loading';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start_date: '', end_date: '' });
  const [salesReport, setSalesReport] = useState(null);
  const [purchaseReport, setPurchaseReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  const generateSalesReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await api.get(`/reports/sales?${params}`);
      setSalesReport(response.data.data);
      setActiveReport('sales');
      toast.success('Sales report generated');
    } catch (error) {
      toast.error('Failed to generate sales report');
    } finally {
      setLoading(false);
    }
  };

  const generatePurchaseReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await api.get(`/reports/purchases?${params}`);
      setPurchaseReport(response.data.data);
      setActiveReport('purchases');
      toast.success('Purchase report generated');
    } catch (error) {
      toast.error('Failed to generate purchase report');
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/inventory');
      setInventoryReport(response.data.data);
      setActiveReport('inventory');
      toast.success('Inventory report generated');
    } catch (error) {
      toast.error('Failed to generate inventory report');
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialSummary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await api.get(`/reports/financial-summary?${params}`);
      setFinancialSummary(response.data.data);
      setActiveReport('financial');
      toast.success('Financial summary generated');
    } catch (error) {
      toast.error('Failed to generate financial summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales & Purchases Reports</h1>
        <p className="text-gray-600">Generate business performance and transaction analytics</p>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <h3 className="font-semibold mb-3">Filter by Date Range</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="label">Start Date</label>
            <input 
              type="date" 
              value={dateRange.start_date} 
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })} 
              className="input" 
            />
          </div>
          <div className="flex-1">
            <label className="label">End Date</label>
            <input 
              type="date" 
              value={dateRange.end_date} 
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })} 
              className="input" 
            />
          </div>
        </div>
      </div>

      {/* Report Selection Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={generateSalesReport} 
          disabled={loading} 
          className={`card hover:shadow-lg transition-shadow cursor-pointer text-left border-2 ${
            activeReport === 'sales' ? 'border-blue-500 bg-blue-50/30' : 'border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><DollarSign className="text-blue-600" size={24} /></div>
            <div>
              <h3 className="font-semibold text-gray-900">Sales Report</h3>
              <p className="text-xs text-gray-600">Completed sales & revenue</p>
            </div>
          </div>
        </button>

        <button 
          onClick={generatePurchaseReport} 
          disabled={loading} 
          className={`card hover:shadow-lg transition-shadow cursor-pointer text-left border-2 ${
            activeReport === 'purchases' ? 'border-orange-500 bg-orange-50/30' : 'border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg"><ShoppingBag className="text-orange-600" size={24} /></div>
            <div>
              <h3 className="font-semibold text-gray-900">Purchase Report</h3>
              <p className="text-xs text-gray-600">Purchases & supplier orders</p>
            </div>
          </div>
        </button>

        <button 
          onClick={generateInventoryReport} 
          disabled={loading} 
          className={`card hover:shadow-lg transition-shadow cursor-pointer text-left border-2 ${
            activeReport === 'inventory' ? 'border-purple-500 bg-purple-50/30' : 'border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg"><Package className="text-purple-600" size={24} /></div>
            <div>
              <h3 className="font-semibold text-gray-900">Stock Valuation</h3>
              <p className="text-xs text-gray-600">Stock levels & valuation</p>
            </div>
          </div>
        </button>

        <button 
          onClick={generateFinancialSummary} 
          disabled={loading} 
          className={`card hover:shadow-lg transition-shadow cursor-pointer text-left border-2 ${
            activeReport === 'financial' ? 'border-green-500 bg-green-50/30' : 'border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><TrendingUp className="text-green-600" size={24} /></div>
            <div>
              <h3 className="font-semibold text-gray-900">Financial Summary</h3>
              <p className="text-xs text-gray-600">Gross profit & COGS analysis</p>
            </div>
          </div>
        </button>
      </div>

      {loading && <Loading message="Generating report..." />}

      {/* Sales Report View */}
      {salesReport && activeReport === 'sales' && (
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Sales Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Gross Sales</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(salesReport.summary.totalSales)}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">Total Discounts</p>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(salesReport.summary.totalDiscount)}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Net Sales</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(salesReport.summary.netSales)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Transactions</p>
              <p className="text-2xl font-bold text-purple-900">{salesReport.summary.totalTransactions}</p>
            </div>
          </div>
          
          <div className="overflow-x-auto mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction #</th>
                  <th>Date</th>
                  <th>Cashier</th>
                  <th>Payment</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.sales.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium">{s.transaction_number}</td>
                    <td>{new Date(s.created_at).toLocaleString()}</td>
                    <td>{s.cashier?.first_name} {s.cashier?.last_name}</td>
                    <td className="uppercase">{s.payment_method}</td>
                    <td className="font-semibold">{formatCurrency(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Report View */}
      {purchaseReport && activeReport === 'purchases' && (
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Purchases Report Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-700">Total Purchase Orders Amount</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(purchaseReport.summary.totalPurchases)}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total Orders</p>
              <p className="text-2xl font-bold text-blue-900">{purchaseReport.summary.totalTransactions}</p>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Purchase #</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Ordered By</th>
                  <th>Status</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {purchaseReport.purchases.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.purchase_number}</td>
                    <td>{formatDate(p.purchase_date)}</td>
                    <td>{p.supplier?.name}</td>
                    <td>{p.user?.first_name} {p.user?.last_name}</td>
                    <td>
                      <span className={`badge ${
                        p.status === 'received' ? 'badge-success' :
                        p.status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="font-semibold">{formatCurrency(p.total_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Report View */}
      {inventoryReport && activeReport === 'inventory' && (
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Stock Valuation & Inventory Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total Products</p>
              <p className="text-2xl font-bold text-blue-900">{inventoryReport.summary.totalProducts}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Inventory Cost Value</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(inventoryReport.summary.totalInventoryValue)}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-900">{inventoryReport.summary.lowStockCount}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">Out of Stock</p>
              <p className="text-2xl font-bold text-red-900">{inventoryReport.summary.outOfStockCount}</p>
            </div>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReport.products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name} ({p.sku})</td>
                    <td>{p.category?.name || '-'}</td>
                    <td>{formatCurrency(p.cost_price)}</td>
                    <td>{formatCurrency(p.selling_price)}</td>
                    <td className="font-semibold">{p.current_stock} {p.unit}</td>
                    <td>
                      <span className={`badge ${
                        p.current_stock === 0 ? 'badge-danger' :
                        p.current_stock <= p.minimum_stock ? 'badge-warning' : 'badge-success'
                      }`}>
                        {p.current_stock === 0 ? 'Out of Stock' : p.current_stock <= p.minimum_stock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {financialSummary && activeReport === 'financial' && (
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Financial Summary (COGS & Margins)</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-gray-700">Gross Sales</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(financialSummary.grossSales)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-gray-700">Total Discounts</span>
              <span className="text-lg font-bold text-red-600">-{formatCurrency(financialSummary.totalDiscount)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="font-medium text-blue-800">Net Sales</span>
              <span className="text-lg font-bold text-blue-600">{formatCurrency(financialSummary.netSales)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium text-gray-700">Cost of Goods Sold (COGS)</span>
              <span className="text-lg font-bold text-orange-600">-{formatCurrency(financialSummary.costOfGoodsSold)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium text-green-800">Gross Profit</span>
              <span className="text-lg font-bold text-green-600">{formatCurrency(financialSummary.grossProfit)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-100 rounded border-2 border-green-200">
              <span className="font-bold text-green-900">Gross Profit Margin</span>
              <span className="text-2xl font-bold text-green-800">{financialSummary.grossProfitMargin}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
