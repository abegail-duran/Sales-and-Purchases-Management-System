import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/format';
import { Search, Plus, Minus, Trash2, ShoppingCart, X, Printer } from 'lucide-react';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const POS = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, customersRes] = await Promise.all([
        api.get('/products?status=active'),
        api.get('/categories?status=active'),
        api.get('/customers?status=active')
      ]);

      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
      setCustomers(customersRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    if (product.current_stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }

    // Check if product is expired
    if (product.expiration_tracking && product.expiration_date) {
      const expirationDate = new Date(product.expiration_date);
      if (expirationDate < new Date()) {
        toast.error('Product has expired and cannot be sold');
        return;
      }
    }

    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.current_stock) {
        toast.error('Cannot add more than available stock');
        return;
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.selling_price),
        quantity: 1,
        available_stock: product.current_stock
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => {
      if (item.product_id === productId) {
        if (newQuantity > item.available_stock) {
          toast.error('Cannot exceed available stock');
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setPaymentMethod('cash');
    setAmountReceived('');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal(); // Can add tax/discount here if needed
  };

  const calculateChange = () => {
    if (paymentMethod !== 'cash') return 0;
    const received = parseFloat(amountReceived) || 0;
    const total = calculateTotal();
    return Math.max(0, received - total);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === 'cash') {
      const received = parseFloat(amountReceived) || 0;
      const total = calculateTotal();
      if (received < total) {
        toast.error('Amount received is less than total');
        return;
      }
    }

    setProcessing(true);

    try {
      const saleData = {
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'cash' ? parseFloat(amountReceived) : calculateTotal(),
        discount: 0,
        tax: 0
      };

      const response = await api.post('/sales', saleData);
      
      setReceiptData(response.data.data);
      setShowReceipt(true);
      clearCart();
      toast.success('Sale completed successfully!');
      
      // Refresh products to update stock
      const productsRes = await api.get('/products?status=active');
      setProducts(productsRes.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process sale');
    } finally {
      setProcessing(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  if (loading) {
    return <Loading message="Loading POS..." />;
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Search and Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products by name, SKU, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input sm:w-48"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 card overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.current_stock === 0}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  product.current_stock === 0
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                    : 'border-gray-200 hover:border-red-500 hover:shadow-md'
                }`}
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                  <ShoppingCart className="text-gray-400" size={32} />
                </div>
                <h4 className="font-medium text-sm text-gray-900 truncate">{product.name}</h4>
                <p className="text-xs text-gray-500 mb-1">{product.category?.name}</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(product.selling_price)}</p>
                <p className={`text-xs ${product.current_stock <= product.minimum_stock ? 'text-red-600' : 'text-gray-500'}`}>
                  Stock: {product.current_stock}
                </p>
              </button>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="w-full lg:w-96 flex flex-col space-y-4">
        {/* Cart Items */}
        <div className="card flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Cart</h3>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700">
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="mx-auto mb-2" size={48} />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.product_id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="p-1 bg-white rounded hover:bg-gray-200"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="p-1 bg-white rounded hover:bg-gray-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="w-20 text-right font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Customer Selection */}
          <div className="border-t pt-4 mb-4">
            <label className="label">Customer (Optional)</label>
            <select
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customer = customers.find(c => c.id === parseInt(e.target.value));
                setSelectedCustomer(customer);
              }}
              className="input"
            >
              <option value="">Walk-in Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="label">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input"
            >
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Cash Payment Fields */}
          {paymentMethod === 'cash' && (
            <div className="mb-4">
              <label className="label">Amount Received</label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="input"
                placeholder="0.00"
                step="0.01"
              />
              {amountReceived && (
                <div className="mt-2 p-2 bg-green-50 rounded">
                  <p className="text-sm text-green-700">
                    Change: <span className="font-bold">{formatCurrency(calculateChange())}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Totals */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-red-600">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="btn btn-primary w-full py-3 text-lg mt-4"
          >
            {processing ? 'Processing...' : 'Complete Sale'}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        title="Sale Receipt"
        size="md"
      >
        <div className="print-area">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-red-600">ESTRELLA FOOD HUB</h2>
            <p className="text-sm text-gray-600">Sales and Purchases Management System</p>
            <p className="text-xs text-gray-500 mt-1">123 Main Street, City, Province</p>
            <p className="text-xs text-gray-500">Tel: 09123456789</p>
          </div>

          {receiptData && (
            <>
              <div className="border-t border-b border-dashed py-3 mb-3 text-sm">
                <div className="flex justify-between">
                  <span>Transaction:</span>
                  <span className="font-medium">{receiptData.transaction_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(receiptData.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier:</span>
                  <span>{receiptData.cashier.first_name} {receiptData.cashier.last_name}</span>
                </div>
                {receiptData.customer && (
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{receiptData.customer.name}</span>
                  </div>
                )}
              </div>

              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Item</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.product.name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="text-right">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(receiptData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(receiptData.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="uppercase">{receiptData.payment_method}</span>
                </div>
                {receiptData.payment_method === 'cash' && (
                  <>
                    <div className="flex justify-between">
                      <span>Amount Received:</span>
                      <span>{formatCurrency(receiptData.amount_received)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Change:</span>
                      <span>{formatCurrency(receiptData.change_amount)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center mt-6 text-xs text-gray-500">
                <p>Thank you for your purchase!</p>
                <p className="mt-1">This serves as your official receipt</p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2 mt-6 no-print">
          <button onClick={printReceipt} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
            <Printer size={20} />
            Print Receipt
          </button>
          <button onClick={() => setShowReceipt(false)} className="btn btn-secondary flex-1">
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default POS;
