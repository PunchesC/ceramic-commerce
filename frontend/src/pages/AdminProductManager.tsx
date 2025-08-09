import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Product } from '../models/Product';
import { apiFetch } from '../utils/api';

const API_URL = process.env.REACT_APP_API_URL;

// Add: allowed types and max size (keep in sync with backend)
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

// Utility to normalize image URLs
function getImageUrl(url: string): string {
  if (!url) return '';
  // If already absolute (http/https), return as is
  if (/^https?:\/\//i.test(url)) return url;
  // If starts with /api, prepend API_URL if defined
  if (url.startsWith('/api')) {
    return API_URL ? `${API_URL}${url}` : url;
  }
  // Otherwise, return as is
  return url;
}

// Fallback placeholder for broken images
const placeholderImg =
  'https://via.placeholder.com/60x60.png?text=No+Image';

// Styles
const imageListStyle = { display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' } as const;
const imageStyle = { width: 60, height: 60, objectFit: 'cover', borderRadius: 4 } as const;
const imagePlaceholderStyle = { ...imageStyle, opacity: 0.5 } as const;

// Reusable image list component (memoized)
const ProductImageList: React.FC<{ urls?: string[] }> = React.memo(({ urls }) => (
  <div style={imageListStyle}>
    {urls && urls.length > 0 ? (
      urls.map((url, idx) => (
        <img
          key={idx}
          src={getImageUrl(url)}
          alt=""
          style={imageStyle}
          onError={e => {
            (e.target as HTMLImageElement).src = placeholderImg;
          }}
        />
      ))
    ) : (
      <img src={placeholderImg} alt="No images" style={imagePlaceholderStyle} />
    )}
  </div>
));
ProductImageList.displayName = 'ProductImageList';

const emptyForm: Omit<Product, 'id' | 'imageUrls'> = {
  title: '',
  description: '',
  price: 0,
  type: '',
  stock: 0,
  isActive: true,
};

const AdminProductManager: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    if (!user?.isAdmin) return;
    setLoading(true);
    fetch(`${API_URL}/api/products`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(setProducts)
      .catch(() => setMessage('Error loading products'))
      .finally(() => setLoading(false));
  }, [user]);

  // Handle form input
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? target.checked : type === 'number' ? Number(value) : value,
    }));
  };

  // Replace: robust file input handler with type/size validation and feedback
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setSelectedFiles(null);
      return;
    }

    const valid: File[] = [];
    const rejected: string[] = [];

    Array.from(files).forEach(f => {
      const mime = f.type;
      const ext = f.name.split('.').pop()?.toLowerCase();
      const okByMime = ALLOWED_TYPES.has(mime);
      const okByExt = ext ? ['jpg', 'jpeg', 'png', 'webp'].includes(ext) : false;
      const okType = okByMime || okByExt; // allow by extension if browser leaves type empty
      const okSize = f.size <= MAX_UPLOAD_BYTES;

      if (okType && okSize) {
        valid.push(f);
      } else {
        const reasons = [
          !okType ? `type ${mime || `.${ext || 'unknown'}`}` : '',
          !okSize ? `size ${(f.size / (1024 * 1024)).toFixed(2)}MB` : '',
        ].filter(Boolean).join(', ');
        rejected.push(`${f.name} (${reasons})`);
      }
    });

    if (rejected.length > 0) {
      setMessage(`Some files were skipped: ${rejected.join('; ')}. Allowed: JPEG, PNG, WEBP up to 5MB.`);
    } else {
      setMessage(null);
    }

    if (valid.length > 0) {
      const dt = new DataTransfer();
      valid.forEach(f => dt.items.add(f));
      setSelectedFiles(dt.files);
    } else {
      setSelectedFiles(null);
    }

    // Clear input so selecting the same files again triggers change
    e.currentTarget.value = '';
  };

  // Create or update product, and upload images if creating
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `/api/products/${editingId}`
      : `/api/products`;
    const res = await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setMessage('Error saving product');
      return;
    }
    const savedProduct = await res.json();
    let imageUploadMessage = '';
    // If creating and files are selected, upload images right after product creation
    if (!editingId && savedProduct.id && selectedFiles && selectedFiles.length > 0) {
      setUploading(true);
      const formData = new FormData();
      Array.from(selectedFiles).forEach(file => formData.append('Files', file));
      const imgRes = await apiFetch(`/api/product-images/${savedProduct.id}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      setUploading(false);
      if (!imgRes.ok) {
        const errorText = await imgRes.text();
        imageUploadMessage = ' (Image upload failed: ' + errorText + ')';
      } else {
        imageUploadMessage = ' Images uploaded!';
      }
    }
    setMessage('Product saved!' + imageUploadMessage);
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFiles(null);
    // Refresh products
    setLoading(true);
    fetch(`${API_URL}/api/products`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(setProducts)
      .catch(() => setMessage('Error loading products'))
      .finally(() => setLoading(false));
  };

  // Edit product
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description || '',
      price: product.price,
      type: product.type || '',
      stock: product.stock ?? 0,
      isActive: product.isActive ?? true,
    });
    setMessage(null);
    setSelectedFiles(null);
  };

  // Delete product
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    await apiFetch(`/api/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    setProducts(products => products.filter(p => p.id !== id));
    setMessage('Product deleted.');
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
      setSelectedFiles(null);
    }
  };

  // Upload images
  const handleUpload = async (productId: string) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => formData.append('Files', file));
    const res = await apiFetch(`/api/product-images/${productId}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    setUploading(false);
    if (!res.ok) {
      const errorText = await res.text();
      setMessage('Image upload failed: ' + errorText);
      return;
    }
    setMessage('Images uploaded!');
    setSelectedFiles(null);

    // Try to fetch latest image variants and update the product locally
    try {
      const listRes = await fetch(`${API_URL}/api/product-images/${productId}`, { credentials: 'include' });
      if (listRes.ok) {
        const data = await listRes.json();
        let urls: string[] = [];
        if (Array.isArray(data) && data.length && typeof data[0] === 'object') {
          const variants = data as Array<{ url: string; variant?: string; sortOrder?: number }>;
          variants.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
          const w800s = variants.filter(v => (v.variant || '').toLowerCase() === 'w800');
          const originals = variants.filter(v => (v.variant || '').toLowerCase() === 'original');
          const chosen = w800s.length ? w800s : originals.length ? originals : variants;
          urls = chosen.map(v => v.url);
        } else if (Array.isArray(data) && (data.length === 0 || typeof data[0] === 'string')) {
          urls = data as string[];
        }
        if (urls.length) {
          setProducts(prev => prev.map(p => (p.id === productId ? { ...p, imageUrls: urls } : p)));
        }
      }
    } catch {
      // ignore preview update errors
    }

    // Also refresh the full list from backend
    setLoading(true);
    fetch(`${API_URL}/api/products`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(setProducts)
      .catch(() => setMessage('Error loading products'))
      .finally(() => setLoading(false));
  };

  // Done editing/creating
  const handleDone = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFiles(null);
    setMessage(null);
  };

  if (!user?.isAdmin) return <div>403 Unauthorized</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Product Management</h1>
      {message && <div style={{ color: message.toLowerCase().includes('error') ? 'red' : 'green' }}>{message}</div>}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, background: '#f9f9f9', padding: 16, borderRadius: 8 }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500 }}>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500 }}>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500 }}>
          Price
          <input name="price" type="number" value={form.price} onChange={handleChange} required min={0} step="0.01" />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500 }}>
          Type
          <input name="type" value={form.type} onChange={handleChange} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500 }}>
          Stock
          <input name="stock" type="number" value={form.stock} onChange={handleChange} min={0} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
          <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} style={{ marginRight: 8 }} />
          Active
        </label>
        {/* Image upload for product being created/edited */}
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 500 }}>
          Product Images
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
          />
          {/* Preview of selected files before upload */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{selectedFiles.length} file(s) selected</div>
              <div style={imageListStyle}>
                {Array.from(selectedFiles).map((f, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    style={imageStyle}
                    onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                  />
                ))}
              </div>
              {!editingId && (
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                  Images will upload after you create the product.
                </div>
              )}
            </div>
          )}
        </label>
        {/* Only show Upload Images button for editing existing products */}
        {editingId && selectedFiles && selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={() => handleUpload(editingId)}
            disabled={uploading}
            style={{ marginBottom: 8 }}
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        )}
        {editingId && (
          <button type="button" onClick={handleDone} style={{ marginBottom: 8 }}>
            Done
          </button>
        )}
        {/* Show images for product being edited */}
        {editingId && (
          <ProductImageList urls={products.find(p => p.id === editingId)?.imageUrls} />
        )}
        <button type="submit" disabled={uploading}>{editingId ? 'Update' : 'Create'} Product</button>
      </form>
      <h2>Products</h2>
      {loading ? (
        <div>Loading products...</div>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id} style={{ marginBottom: 16, background: '#f4f4f4', padding: 12, borderRadius: 6 }}>
              <strong>{product.title}</strong> (${product.price.toFixed(2)}) {product.isActive ? '' : '(Inactive)'}
              <br />
              <button onClick={() => handleEdit(product)} style={{ marginRight: 8 }}>Edit</button>
              <button onClick={() => handleDelete(product.id)} style={{ marginRight: 8 }}>Delete</button>
              {/* Show images for each product */}
              <ProductImageList urls={product.imageUrls} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminProductManager;