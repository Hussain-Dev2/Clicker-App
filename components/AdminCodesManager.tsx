'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client';

interface Product {
  id: string;
  title: string;
  category: string | null;
  value: string | null;
}

interface RedemptionCode {
  id: string;
  code: string;
  isUsed: boolean;
  productId: string;
  orderId: string | null;
  usedAt: string | null;
  createdAt: string;
}

export default function AdminCodesManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [newCodes, setNewCodes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchCodes(selectedProductId);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    try {
      const data = await apiFetch<Product[]>('/admin/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCodes = async (productId: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<RedemptionCode[]>(`/admin/codes/${productId}`);
      setCodes(data);
    } catch (error) {
      console.error('Failed to fetch codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !newCodes.trim()) return;

    setSubmitting(true);
    try {
      // Split by newlines and filter empty lines
      const codeList = newCodes
        .split('\n')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const response = await apiFetch<{ added: number; skipped: number }>('/admin/codes', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProductId,
          codes: codeList,
        }),
      });

      alert(`✅ Added ${response.added} codes successfully!`);
      setNewCodes('');
      fetchCodes(selectedProductId);
    } catch (error: any) {
      alert(`❌ Failed to add codes: ${error.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Delete this code?')) return;

    try {
      await apiFetch(`/admin/codes?id=${codeId}`, {
        method: 'DELETE',
      });
      setCodes(codes.filter((c) => c.id !== codeId));
    } catch (error) {
      alert('Failed to delete code');
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const availableCodes = codes.filter((c) => !c.isUsed).length;
  const usedCodes = codes.filter((c) => c.isUsed).length;

  return (
    <div className="space-y-6">
      {/* Product Selection */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">🎫 Redemption Codes Manager</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Product
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose a product --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title} {product.category && `(${product.category})`} {product.value && `- ${product.value}`}
              </option>
            ))}
          </select>
        </div>

        {selectedProductId && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-4">
              <div className="text-green-400 text-sm mb-1">Available</div>
              <div className="text-2xl font-bold text-white">{availableCodes}</div>
            </div>
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
              <div className="text-red-400 text-sm mb-1">Used</div>
              <div className="text-2xl font-bold text-white">{usedCodes}</div>
            </div>
            <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
              <div className="text-blue-400 text-sm mb-1">Total</div>
              <div className="text-2xl font-bold text-white">{codes.length}</div>
            </div>
          </div>
        )}

        {/* Add Codes Form */}
        {selectedProductId && (
          <form onSubmit={handleAddCodes} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Add Redemption Codes (one per line)
              </label>
              <textarea
                value={newCodes}
                onChange={(e) => setNewCodes(e.target.value)}
                placeholder="ABCD-1234-EFGH-5678&#10;IJKL-9012-MNOP-3456&#10;..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
                rows={8}
              />
              <p className="text-xs text-slate-400 mt-1">
                💡 Paste multiple codes, each on a new line
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !newCodes.trim()}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded-lg transition-colors font-semibold"
            >
              {submitting ? '⏳ Adding Codes...' : '✓ Add Codes'}
            </button>
          </form>
        )}
      </div>

      {/* Codes List */}
      {selectedProductId && (
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4">
            Codes for {selectedProduct?.title}
          </h3>

          {loading ? (
            <div className="text-slate-400">Loading codes...</div>
          ) : codes.length === 0 ? (
            <div className="text-slate-400 py-8 text-center">
              No codes added yet for this product
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    code.isUsed
                      ? 'bg-slate-700/30 border-slate-600'
                      : 'bg-green-900/20 border-green-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono ${code.isUsed ? 'text-slate-500 line-through' : 'text-white'}`}>
                      {code.code}
                    </span>
                    {code.isUsed ? (
                      <span className="px-2 py-1 bg-red-600/50 rounded text-xs text-white">
                        Used {code.usedAt && `on ${new Date(code.usedAt).toLocaleDateString()}`}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-600/50 rounded text-xs text-white">
                        Available
                      </span>
                    )}
                  </div>
                  {!code.isUsed && (
                    <button
                      onClick={() => handleDeleteCode(code.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
