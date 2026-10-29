import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency, formatDateTime } from '../utils/format';
import { Search, Eye, XCircle } from 'lucide-react';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Sales = () => {
  const { hasRole } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [viewSale, setViewSale] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await api.get('/sales');
      setSales(response.data.data);
    } catch (error) {
      toast.error('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = async (saleId) => {
    if (!window.confirm('Are you sure you want to void this sale? This will restore the inventory.')) return;
    
    try {
      await api.post(`/sales/${saleId}/void`);
      toast.success('Sale voided successfully');
      fetchSales();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to void sale');
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.transaction_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = !paymentFilter || sale.payment_method === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  if (loading) return <Loading message="Loading sales..." />;

  const canVoid = hasRole(['admin', 'manager']);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
        <p className="text-gray-600">View and manage sales transactions</p>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search by transaction number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
          </div>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="input sm:w-48">
            <option value="">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="gcash">GCash</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction #</th>
                <th>Date & Time</th>
                <th>Cashier</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td className="font-medium">{sale.transaction_number}</td>
                  <td className="text-sm">{formatDateTime(sale.created_at)}</td>
                  <td>{sale.cashier?.first_name} {sale.cashier?.last_name}</td>
                  <td>{sale.customer?.name || 'Walk-in'}</td>
                  <td className="font-semibold">{formatCurrency(sale.total)}</td>
                  <td className="uppercase text-sm">{sale.payment_method}</td>
                  <td>
                    <span className={`badge ${
                      sale.status === 'completed' ? 'badge-success' :
                      sale.status === 'void' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => setViewSale(sale)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                        <Eye size={18} />
                      </button>
                      {canVoid && sale.status === 'completed' && (
                        <button onClick={() => handleVoid(sale.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Void Sale">
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="text-center py-12 text-gray-500">No sales found</div>
          )}
        </div>
      </div>

      <Modal isOpen={!!viewSale} onClose={() => setViewSale(null)} title="Sale Details" size="lg">
        {viewSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Transaction Number</p>
                <p className="font-semibold">{viewSale.transaction_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold">{formatDateTime(viewSale.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cashier</p>
                <p className="font-semibold">{viewSale.cashier?.first_name} {viewSale.cashier?.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-semibold">{viewSale.customer?.name || 'Walk-in Customer'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Items</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Product</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Price</th>
                    <th className="text-right p-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {viewSale.items?.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{item.product?.name}</td>
                      <td className="text-center p-2">{item.quantity}</td>
                      <td className="text-right p-2">{formatCurrency(item.unit_price)}</td>
                      <td className="text-right p-2">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(viewSale.subtotal)}</span>
              </div>
              {viewSale.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(viewSale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(viewSale.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="uppercase font-semibold">{viewSale.payment_method}</span>
              </div>
              {viewSale.payment_method === 'cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Amount Received:</span>
                    <span>{formatCurrency(viewSale.amount_received)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span>{formatCurrency(viewSale.change_amount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Sales;
