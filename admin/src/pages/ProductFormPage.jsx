import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Plus, Trash2 } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';
import PageHeader from '../components/ui/PageHeader';
import toast from 'react-hot-toast';

export default function ProductFormPage() {
  const { slug } = useParams();
  const isEdit = !!slug;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [productId, setProductId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    category: '',
    brand: '',
    mrp: '',
    price: '',
    discount: 0,
    stock: 100,
    lowStockThreshold: 10,
    prescriptionRequired: false,
    isActive: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    shortDescription: '',
    description: '',
    composition: '',
    ingredients: '',
    manufacturer: '',
    countryOfOrigin: 'India',
    storage: '',
    warnings: '',
    usageInstructions: '',
    sideEffects: '',
    tags: '',
    imageUrl: '',
    imageAlt: ''
  });

  useEffect(() => {
    Promise.all([
      categoryService.getCategories(),
      brandService.getBrands()
    ]).then(([catRes, brandRes]) => {
      setCategories(catRes.data?.data || []);
      setBrands(brandRes.data?.data || []);
    }).catch(() => {});

    if (isEdit) {
      productService.getProduct(slug)
        .then((res) => {
          const p = res.data?.data;
          if (!p) {
            toast.error('Product not found');
            navigate('/admin/products');
            return;
          }
          setProductId(p._id);
          setFormData({
            name: p.name || '',
            slug: p.slug || '',
            sku: p.sku || '',
            category: p.category?._id || p.category || '',
            brand: p.brand?._id || p.brand || '',
            mrp: p.mrp || '',
            price: p.price || '',
            discount: p.discount || 0,
            stock: p.stock ?? 100,
            lowStockThreshold: p.lowStockThreshold ?? 10,
            prescriptionRequired: !!p.prescriptionRequired,
            isActive: p.isActive ?? true,
            isFeatured: !!p.isFeatured,
            isBestSeller: !!p.isBestSeller,
            isNew: !!p.isNew,
            shortDescription: p.shortDescription || '',
            description: p.description || '',
            composition: p.composition || '',
            ingredients: p.ingredients || '',
            manufacturer: p.manufacturer || '',
            countryOfOrigin: p.countryOfOrigin || 'India',
            storage: p.storage || '',
            warnings: p.warnings || '',
            usageInstructions: p.usageInstructions || '',
            sideEffects: p.sideEffects || '',
            tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
            imageUrl: p.images?.[0]?.url || '',
            imageAlt: p.images?.[0]?.alt || ''
          });
        })
        .catch(() => {
          toast.error('Failed to load product');
          navigate('/admin/products');
        })
        .finally(() => setFetching(false));
    }
  }, [slug]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'mrp' || name === 'price') {
        const mrp = name === 'mrp' ? parseFloat(value) || 0 : parseFloat(prev.mrp) || 0;
        const price = name === 'price' ? parseFloat(value) || 0 : parseFloat(prev.price) || 0;
        if (mrp > 0 && price <= mrp) {
          updated.discount = Math.round(((mrp - price) / mrp) * 100);
        } else {
          updated.discount = 0;
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.category || !formData.price || !formData.mrp) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        mrp: parseFloat(formData.mrp),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10) || 0,
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 10,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        images: formData.imageUrl ? [{
          url: formData.imageUrl,
          alt: formData.imageAlt || formData.name,
          isPrimary: true,
          order: 0
        }] : [{
          url: `https://placehold.co/600x600?text=${encodeURIComponent(formData.name)}`,
          alt: formData.name,
          isPrimary: true,
          order: 0
        }]
      };

      if (isEdit && productId) {
        await productService.updateProduct(productId, payload);
        toast.success('Product updated successfully!');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created successfully!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <PageHeader
            title={isEdit ? `Edit: ${formData.name}` : 'Create New Product'}
            subtitle={isEdit ? 'Update product details, pricing, and medical info' : 'Add a new pharmaceutical or wellness product to the catalog'}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Paracetamol 500mg Tablets"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">SKU (Stock Keeping Unit) *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. MED-PARA-500"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Brand</label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Short Description</label>
            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="Brief summary for product card & search snippets"
              className="input"
            />
          </div>

          <div>
            <label className="label">Full Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed product information, benefits, and specifications..."
              className="input"
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">MRP (₹) *</label>
              <input
                type="number"
                step="0.01"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Selling Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="input"
              />
            </div>

            <div>
              <label className="label">Discount %</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                readOnly
                className="input bg-gray-50 cursor-not-allowed font-semibold text-primary-600"
              />
            </div>

            <div>
              <label className="label">Stock Available (units) *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Medical & Regulatory Details */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
            Medical & Regulatory Details
          </h3>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-amber-900 text-sm">Prescription Required (Schedule H / Rx)</p>
              <p className="text-xs text-amber-700">Customers must upload a verified doctor prescription to purchase this item</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="prescriptionRequired"
                checked={formData.prescriptionRequired}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Active Composition / Salt</label>
              <input
                type="text"
                name="composition"
                value={formData.composition}
                onChange={handleChange}
                placeholder="e.g. Paracetamol (500mg)"
                className="input"
              />
            </div>

            <div>
              <label className="label">Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g. Cipla Ltd / Sun Pharma"
                className="input"
              />
            </div>

            <div>
              <label className="label">Storage Instructions</label>
              <input
                type="text"
                name="storage"
                value={formData.storage}
                onChange={handleChange}
                placeholder="e.g. Store below 25°C in a dry place"
                className="input"
              />
            </div>

            <div>
              <label className="label">Usage Instructions</label>
              <input
                type="text"
                name="usageInstructions"
                value={formData.usageInstructions}
                onChange={handleChange}
                placeholder="e.g. As directed by the physician"
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Safety Warnings & Precautions</label>
            <textarea
              name="warnings"
              rows={2}
              value={formData.warnings}
              onChange={handleChange}
              placeholder="Contraindications, overdose cautions, pregnancy advisories..."
              className="input"
            />
          </div>
        </div>

        {/* Media & Image */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
            Product Image
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Image URL</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://... or /uploads/products/image.jpg"
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to use standard high-res medicine placeholder</p>
            </div>

            <div>
              <label className="label">Image Alt Text</label>
              <input
                type="text"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={handleChange}
                placeholder="Accessible image description"
                className="input"
              />
            </div>
          </div>

          {formData.imageUrl && (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-xs text-gray-500">Preview:</span>
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-gray-50 p-1"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        {/* Visibility & Flags */}
        <div className="card p-6 bg-white space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
            Visibility & Badges
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-navy-800">Active (Visible)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-navy-800">Featured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <input
                type="checkbox"
                name="isBestSeller"
                checked={formData.isBestSeller}
                onChange={handleChange}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-navy-800">Best Seller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={handleChange}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs font-semibold text-navy-800">New Arrival</span>
            </label>
          </div>

          <div>
            <label className="label">Search Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="fever, headache, pain relief, tablet"
              className="input"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Link to="/admin/products" className="btn-ghost">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            <Save size={16} />
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
