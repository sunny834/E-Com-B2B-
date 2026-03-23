'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/productActions';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  lowStockAt: number;
  status: string;
  image: string | null;
  sku: string;
  categoryId: string | null;
};

type Category = {
  id: string;
  name: string;
};

export default function ProductClient({ 
  initialProducts, 
  categories 
}: { 
  initialProducts: Product[],
  categories: Category[]
}) {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '', price: 0, stock: 0, sku: '', status: 'active', image: '', categoryId: ''
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: 0, stock: 0, sku: '', status: 'active', image: '', categoryId: '' });
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      price: p.price,
      stock: p.stock,
      sku: p.sku,
      status: p.status,
      image: p.image || '',
      categoryId: p.categoryId || ''
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setLoading(true);
    const res = await deleteProduct(id);
    if (res.success) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert('Error deleting product');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (editingProduct) {
      const res = await updateProduct(editingProduct.id, formData);
      if (res.success && res.product) {
        setProducts(products.map(p => p.id === editingProduct.id ? res.product : p));
        setIsModalOpen(false);
      } else {
        setError(res.error || 'Update failed');
      }
    } else {
      const uniqueSku = formData.sku || `SKU-${Date.now()}`;
      const res = await createProduct({ ...formData, sku: uniqueSku });
      if (res.success && res.product) {
        // Safe casting to Product as it returns the DB row
        setProducts([res.product as any, ...products]);
        setIsModalOpen(false);
      } else {
        setError(res.error || 'Creation failed');
      }
    }
    setLoading(false);
  };

  // Adding very basic styling block for modal here for simplicity without modifying global CSS
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
  };
  const modalStyle: React.CSSProperties = {
    background: 'var(--bg-surface)', padding: '2rem', borderRadius: 'var(--radius-md)',
    width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)'
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
    marginBottom: '1rem', fontFamily: 'var(--font-sans)', backgroundColor: 'var(--bg-primary)'
  };

  return (
    <>
      <div className="page-header">
        <h1>Products</h1>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleOpenAdd}>+ Add Product</button>
          <button className="btn btn-outline flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            Manage Categories
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="product-cell">
                    {product.image && (
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        width={48} 
                        height={48} 
                        className="product-img"
                        unoptimized
                      />
                    )}
                    <span className="product-name">{product.name}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>${Number(product.price).toFixed(2)}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: product.stock <= product.lowStockAt ? 'var(--danger)' : 'inherit' }}>
                    {product.stock} {product.stock <= product.lowStockAt ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td>
                  {product.status === 'active' && product.stock > product.lowStockAt && (
                    <span className="status-badge status-active">Active</span>
                  )}
                  {product.status === 'active' && product.stock <= product.lowStockAt && (
                    <span className="status-badge status-low-stock">Low Stock</span>
                  )}
                  {product.status === 'inactive' && (
                    <span className="status-badge status-inactive">Inactive</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons items-center">
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(product)}>Edit</button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDelete(product.id)} disabled={loading}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '2rem'}}>No products found. Add one!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginBottom: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.5rem', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom:'0.25rem', fontWeight: 600}}>Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={inputStyle} />
                </div>
                
                <div>
                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom:'0.25rem', fontWeight: 600}}>Price ($)</label>
                  <input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})} required style={inputStyle} />
                </div>

                <div>
                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom:'0.25rem', fontWeight: 600}}>Stock Check</label>
                  <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} required style={inputStyle} />
                </div>

                <div>
                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom:'0.25rem', fontWeight: 600}}>SKU Code</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="Leave blank to auto-generate" style={inputStyle} />
                </div>

                <div>
                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom:'0.25rem', fontWeight: 600}}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={inputStyle}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{display: 'block', fontSize: '0.85rem', marginBottom:'0.25rem', fontWeight: 600}}>Image URL (Leave format: /products/image.png)</label>
                  <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} style={inputStyle} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
