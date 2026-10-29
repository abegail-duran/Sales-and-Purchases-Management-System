import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/format';
import { Plus, Eye, CheckCircle } from 'lucide-react';
import Loading from '../components/Loading';
import Modal from '../components/Modal';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewPurchase, setViewPurchase] = useState(null);
  const [items, setItems] = useState([{ product_id: '', quantity: '', cost_price: '' }]);
  const [formData, setFormData] = useState({ supplier_id: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/suppliers?status=active'),
        api.get('/products?status=active')
      ]);
      setPurchases(purchasesRes.data.data);
      setSuppliers(suppliersRes.data.data);
      setProducts(productsRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/purchases', { ...formData, items });
      toast.success('Purchase order created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create purchase');
    }
  };

  const handleReceive = async (purchaseId) => {
    if (!window.confirm('Confirm receipt of this purchase? This will update inventory.')) return;
    try {
      await api.post(`/purchases/${purchaseId}/receive`);
      toast.success('Purchase received successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to receive purchase');
    }
  };

  const resetForm = () => {
    setFormData({ supplier_id: '', notes: '' });
    setItems([{ product_id: '', quantity: '', cost_price: '' }]);
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: '', cost_price: '' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  if (loading) return <Loading message="Loading purchases..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600">Manage purchase orders and stock receiving</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Create Purchase Order
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Purchase #</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(purchase => (
                <tr key={purchase.id}>
                  <td className="font-medium">{purchase.purchase_number}</td>
                  <td>{purchase.supplier?.name}</td>
                  <td>{formatDate(purchase.purchase_date)}</td>
                  <td className="font-semibold">{formatCurrency(purchase.total_cost)}</td>
                  <td>
                    <span className={`badge ${
                      purchase.status === 'received' ? 'badge-success' :
                      purchase.status === 'pending' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => setViewPurchase(purchase)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye size={18} /></button>
                      {purchase.status === 'pending' && (
                        <button onClick={() => handleReceive(purchase.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Receive">
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm(); }} title="Create Purchase Order" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Supplier *</label>
            <select value={formData.supplier_id} onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })} className="input" required>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          
          <div>
            <label className="label">Items</label>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select value={item.product_id} onChange={(e) => updateItem(idx, 'product_id', e.target.value)} className="input flex-1" required>
                  <option value="">Select Product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="input w-24" required />
                <input type="number" step="0.01" placeholder="Cost" value={item.cost_price} onChange={(e) => updateItem(idx, 'cost_price', e.target.value)} className="input w-32" required />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="btn btn-danger">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="btn btn-secondary text-sm">Add Item</button>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input" rows="2" />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">Create Purchase Order</button>
            <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!viewPurchase} onClose={() => setViewPurchase(null)} title="Purchase Details" size="lg">
        {viewPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-600">Purchase #</p><p className="font-semibold">{viewPurchase.purchase_number}</p></div>
              <div><p className="text-sm text-gray-600">Supplier</p><p className="font-semibold">{viewPurchase.supplier?.name}</p></div>
              <div><p className="text-sm text-gray-600">Date</p><p className="font-semibold">{formatDate(viewPurchase.purchase_date)}</p></div>
              <div><p className="text-sm text-gray-600">Status</p><p className="font-semibold capitalize">{viewPurchase.status}</p></div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Items</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2">Product</th>
                    <th className="text-center p-2">Qty</th>
                    <th className="text-right p-2">Cost</th>
                    <th className="text-right p-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {viewPurchase.items?.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{item.product?.name}</td>
                      <td className="text-center p-2">{item.quantity}</td>
                      <td className="text-right p-2">{formatCurrency(item.cost_price)}</td>
                      <td className="text-right p-2">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Cost:</span>
                <span>{formatCurrency(viewPurchase.total_cost)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Purchases;
