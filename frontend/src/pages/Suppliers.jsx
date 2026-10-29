import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', status: 'active' });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data);
    } catch (error) {
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, formData);
        toast.success('Supplier updated successfully');
      } else {
        await api.post('/suppliers', formData);
        toast.success('Supplier created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({ name: supplier.name, contact_person: supplier.contact_person || '', phone: supplier.phone || '', email: supplier.email || '', address: supplier.address || '', status: supplier.status });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/suppliers/${deleteConfirm.id}`);
      toast.success('Supplier deactivated successfully');
      setDeleteConfirm(null);
      fetchSuppliers();
    } catch (error) {
      toast.error('Failed to delete supplier');
    }
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setFormData({ name: '', contact_person: '', phone: '', email: '', address: '', status: 'active' });
  };

  const filteredSuppliers = suppliers.filter(sup =>
    sup.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading message="Loading suppliers..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600">Manage your suppliers</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Supplier
        </button>
      </div>

      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search suppliers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td className="font-medium">{supplier.name}</td>
                  <td>{supplier.contact_person || '-'}</td>
                  <td>{supplier.phone || '-'}</td>
                  <td>{supplier.email || '-'}</td>
                  <td>
                    <span className={`badge ${supplier.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(supplier)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={18} /></button>
                      <button onClick={() => setDeleteConfirm(supplier)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); resetForm(); }} title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Supplier Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="label">Contact Person</label>
            <input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input" rows="2" />
          </div>
          <div>
            <label className="label">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">{editingSupplier ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="btn btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete} title="Deactivate Supplier" message={`Are you sure you want to deactivate "${deleteConfirm?.name}"?`} />
    </div>
  );
};

export default Suppliers;
