import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { formatCurrency, getStockStatus } from '../utils/format';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    category_id: '',
    supplier_id: '',
    cost_price: '',
    selling_price: '',
    current_stock: '',
    minimum_stock: '',
    maximum_stock: '',
    unit: 'pcs',
    expiration_tracking: false,
    expiration_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/suppliers')
      ]);

      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
      setSuppliers(suppliersRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category_id === parseInt(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', formData);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      barcode: product.barcode || '',
      name: product.name,
      description: product.description || '',
      category_id: product.category_id,
      supplier_id: product.supplier_id,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
      current_stock: product.current_stock,
      minimum_stock: product.minimum_stock,
      maximum_stock: product.maximum_stock,
      unit: product.unit,
      expiration_tracking: product.expiration_tracking,
      expiration_date: product.expiration_date ? product.expiration_date.split('T')[0] : '',
      status: product.status
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteConfirm.id}`);
      toast.success('Product deactivated successfully');
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      barcode: '',
      name: '',
      description: '',
      category_id: '',
      supplier_id: '',
      cost_price: '',
      selling_price: '',
      current_stock: '',
      minimum_stock: '',
      maximum_stock: '',
      unit: 'pcs',
      expiration_tracking: false,
      expiration_date: '',
      status: 'active'
    });
  };

  if (loading) {
    return <Loading message="Loading products..." />;
  }

  const canModify = hasRole(['admin', 'manager']);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        {canModify && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Status</th>
                {canModify && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id}>
                    <td className="font-medium">{product.sku}</td>
                    <td>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.supplier?.name}</div>
                    </td>
                    <td>{product.category?.name}</td>
                    <td>{formatCurrency(product.cost_price)}</td>
                    <td className="font-semibold">{formatCurrency(product.selling_price)}</td>
                    <td>
                      <div>{product.current_stock} {product.unit}</div>
                      <div className="text-xs text-gray-500">Min: {product.minimum_stock}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    {canModify && (
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(product)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Barcode</label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows="2"
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Category</option>
                {categories.filter(c => c.status === 'active').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Supplier *</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.filter(s => s.status === 'active').map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Cost Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_price}
                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Selling Price *</label>
              <input
                type="number"
                step="0.01"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Current Stock *</label>
              <input
                type="number"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Minimum Stock *</label>
              <input
                type="number"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Maximum Stock *</label>
              <input
                type="number"
                value={formData.maximum_stock}
                onChange={(e) => setFormData({ ...formData, maximum_stock: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Unit *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="input"
              >
                <option value="pcs">Pieces</option>
                <option value="pack">Pack</option>
                <option value="box">Box</option>
                <option value="bottle">Bottle</option>
                <option value="can">Can</option>
                <option value="kg">Kilogram</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.expiration_tracking}
                  onChange={(e) => setFormData({ ...formData, expiration_tracking: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Enable Expiration Tracking</span>
              </label>
            </div>
            {formData.expiration_tracking && (
              <div>
                <label className="label">Expiration Date</label>
                <input
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  className="input"
                />
              </div>
            )}
            <div>
              <label className="label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              {editingProduct ? 'Update Product' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate "${deleteConfirm?.name}"? This product will be marked as inactive.`}
        confirmText="Deactivate"
      />
    </div>
  );
};

export default Products;
