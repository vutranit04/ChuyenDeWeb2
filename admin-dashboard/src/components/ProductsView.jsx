import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProductsView({ searchQuery }) {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

    const [formData, setFormData] = useState({
        productName: '',
        categoryId: '',
        price: '',
        stockQuantity: 0,
        image: '',
        specifications: '',
        description: '',
        status: true
    });
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedProductDetail, setSelectedProductDetail] = useState(null);

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const formatVND = (value) => {
        if (value === undefined || value === null) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const fetchProductsAndCategories = async () => {
        setLoading(true);
        try {
            const headers = getHeaders();
            const [prodRes, catRes] = await Promise.all([
                axios.get('/api/products', headers),
                axios.get('/api/categories', headers)
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error fetching products/categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductsAndCategories();
    }, []);

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setFormData({
            productName: '',
            categoryId: categories[0]?.categoryId || '',
            price: '',
            stockQuantity: 0,
            image: '',
            specifications: '',
            description: '',
            status: true
        });
        setSelectedFile(null);
        setImagePreview('');
        setError(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (prod) => {
        setEditingProduct(prod);
        setFormData({
            productName: prod.productName,
            categoryId: prod.category?.categoryId || '',
            price: prod.price,
            stockQuantity: prod.stockQuantity || 0,
            image: prod.image || '',
            specifications: prod.specifications || '',
            description: prod.description || '',
            status: prod.status !== false // defaults to true if not explicitly false
        });
        setSelectedFile(null);
        setImagePreview(prod.image || '');
        setError(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleOpenDetailModal = (prod) => {
        setSelectedProductDetail(prod);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setSelectedProductDetail(null);
        setDetailModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        let imageUrl = formData.image;
        if (selectedFile) {
            const uploadData = new FormData();
            uploadData.append('file', selectedFile);
            try {
                const uploadRes = await axios.post('/api/upload', uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });
                imageUrl = uploadRes.data.url;
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Lỗi tải ảnh lên máy chủ.');
                return;
            }
        }

        // Prepare payload (convert types properly)
        const payload = {
            ...formData,
            image: imageUrl,
            price: Number(formData.price),
            stockQuantity: Number(formData.stockQuantity),
            categoryId: formData.categoryId ? Number(formData.categoryId) : null
        };

        try {
            if (editingProduct) {
                await axios.put(`/api/products/${editingProduct.productId}`, payload, getHeaders());
            } else {
                await axios.post('/api/products', payload, getHeaders());
            }
            fetchProductsAndCategories();
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm.');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
        try {
            await axios.delete(`/api/products/${id}`, getHeaders());
            fetchProductsAndCategories();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Không thể xóa sản phẩm này.');
        }
    };

    const handleToggleStatus = async (prod) => {
        const updatedStatus = !prod.status;
        const payload = {
            ...prod,
            status: updatedStatus,
            categoryId: prod.category?.categoryId
        };
        try {
            await axios.put(`/api/products/${prod.productId}`, payload, getHeaders());
            // Update local state directly for responsive feedback
            setProducts(products.map(p => p.productId === prod.productId ? { ...p, status: updatedStatus } : p));
        } catch (err) {
            console.error('Error toggling status:', err);
        }
    };

    // Filters
    const filteredProducts = products.filter(prod => {
        // Search filter
        const query = searchQuery?.toLowerCase() || '';
        const matchesSearch = 
            prod.productName?.toLowerCase().includes(query) ||
            prod.productId?.toString().includes(query) ||
            prod.category?.categoryName?.toLowerCase().includes(query);

        // Category filter
        const matchesCategory = selectedCategoryFilter === 'ALL' || 
            prod.category?.categoryId?.toString() === selectedCategoryFilter;

        // Status filter
        const matchesStatus = selectedStatusFilter === 'ALL' ||
            (selectedStatusFilter === 'ACTIVE' && prod.status !== false) ||
            (selectedStatusFilter === 'INACTIVE' && prod.status === false);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 animate-pulse">Đang tải danh sách sản phẩm...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Quản lý sản phẩm</h3>
                    <p className="text-xs text-slate-500">Quản lý kho hàng, giá cả và danh mục hàng hóa</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Category Filter */}
                    <select 
                        value={selectedCategoryFilter}
                        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none dark:text-white"
                    >
                        <option value="ALL">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select 
                        value={selectedStatusFilter}
                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none dark:text-white"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Kinh doanh</option>
                        <option value="INACTIVE">Ngừng bán</option>
                    </select>

                    <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span>Thêm sản phẩm</span>
                    </button>
                </div>
            </div>

            {/* Products Grid / Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                <th className="py-3 px-6">ID</th>
                                <th className="py-3 px-6">Sản phẩm</th>
                                <th className="py-3 px-6">Danh mục</th>
                                <th className="py-3 px-6 text-right">Đơn giá</th>
                                <th className="py-3 px-6 text-center">Tồn kho</th>
                                <th className="py-3 px-6 text-center">Trạng thái</th>
                                <th className="py-3 px-6 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400">
                                        <i className="fa-solid fa-box-open text-3xl mb-2 block opacity-40"></i>
                                        Không tìm thấy sản phẩm nào
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(prod => (
                                    <tr key={prod.productId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                        <td className="py-4 px-6 font-semibold text-slate-500">#{prod.productId}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
                                                    {prod.image ? (
                                                        <img src={prod.image} alt={prod.productName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <i className="fa-solid fa-image text-slate-400"></i>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="font-semibold text-slate-900 dark:text-white block truncate w-48 md:w-64" title={prod.productName}>{prod.productName}</span>
                                                    <span className="text-[10px] text-slate-400 block truncate max-w-xs">{prod.specifications || 'Không có thông số kỹ thuật'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded">
                                                {prod.category?.categoryName || 'Không xác định'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-slate-800 dark:text-slate-250">{formatVND(prod.price)}</td>
                                        <td className="py-4 px-6 text-center font-semibold dark:text-slate-350">{prod.stockQuantity}</td>
                                        <td className="py-4 px-6 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(prod)}
                                                className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                                                    prod.status !== false 
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30' 
                                                        : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30'
                                                }`}
                                            >
                                                {prod.status !== false ? 'Kinh doanh' : 'Ngừng bán'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenDetailModal(prod)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                    title="Xem chi tiết"
                                                >
                                                    <i className="fa-solid fa-eye text-sm"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenEditModal(prod)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="fa-solid fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteProduct(prod.productId)}
                                                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                    title="Xóa"
                                                >
                                                    <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Add/Edit */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-105 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">
                                {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                            </h4>
                            <button 
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-xs text-red-600 bg-red-55 dark:bg-red-950/20 dark:text-red-400 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tên sản phẩm</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="Nhập tên sản phẩm..."
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Danh mục</label>
                                    <select 
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(cat => (
                                            <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Đơn giá (VND)</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                        placeholder="Ví dụ: 150000"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Số lượng tồn kho</label>
                                    <input 
                                        type="number" 
                                        required 
                                        value={formData.stockQuantity}
                                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Hình ảnh sản phẩm</label>
                                    <div className="flex items-center gap-4">
                                        {imagePreview && (
                                            <div className="relative w-16 h-16 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 flex-shrink-0">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setFormData({ ...formData, image: '' });
                                                        setSelectedFile(null);
                                                        setImagePreview('');
                                                    }}
                                                    className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-all text-xs"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setSelectedFile(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-slate-800 dark:file:text-slate-350 cursor-pointer"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ JPG, PNG, GIF. File được tải lên thư mục tĩnh của Backend.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Thông số kỹ thuật</label>
                                <textarea 
                                    value={formData.specifications}
                                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm h-16 resize-none"
                                    placeholder="Thông số sản phẩm..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Mô tả sản phẩm</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm h-24 resize-none"
                                    placeholder="Mô tả chi tiết..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="prodStatus" 
                                    checked={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                    className="w-4.5 h-4.5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                                />
                                <label htmlFor="prodStatus" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">Cho phép kinh doanh ngay</label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary-500/20"
                                >
                                    Lưu lại
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModalOpen && selectedProductDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">Chi tiết sản phẩm</h4>
                            <button 
                                onClick={handleCloseDetailModal}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Image */}
                            <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                                {selectedProductDetail.image ? (
                                    <img src={selectedProductDetail.image} alt={selectedProductDetail.productName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <i className="fa-solid fa-image text-5xl mb-2 block"></i>
                                        Chưa có hình ảnh
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400">Tên sản phẩm</span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mt-0.5">{selectedProductDetail.productName}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Danh mục</span>
                                        <div className="mt-1">
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-semibold px-2.5 py-1 rounded">
                                                {selectedProductDetail.category?.categoryName || 'Không xác định'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Trạng thái</span>
                                        <div className="mt-1">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                selectedProductDetail.status !== false 
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                                                    : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                                            }`}>
                                                {selectedProductDetail.status !== false ? 'Kinh doanh' : 'Ngừng bán'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Đơn giá</span>
                                        <p className="text-lg font-extrabold text-primary-600 dark:text-primary-400 mt-0.5">{formatVND(selectedProductDetail.price)}</p>
                                    </div>

                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Số lượng tồn kho</span>
                                        <p className="text-base font-bold text-slate-850 dark:text-white mt-1">{selectedProductDetail.stockQuantity} sản phẩm</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Specifications & Description */}
                        <div className="mt-6 space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Thông số kỹ thuật</h5>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line border border-slate-100 dark:border-slate-800">
                                    {selectedProductDetail.specifications || 'Chưa cập nhật thông số kỹ thuật.'}
                                </div>
                            </div>

                            <div>
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Mô tả sản phẩm</h5>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line border border-slate-100 dark:border-slate-800">
                                    {selectedProductDetail.description || 'Chưa cập nhật mô tả.'}
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <button 
                                onClick={handleCloseDetailModal}
                                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                            >
                                Đóng
                            </button>
                            <button 
                                onClick={async () => {
                                    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
                                        try {
                                            await axios.delete(`/api/products/${selectedProductDetail.productId}`, getHeaders());
                                            fetchProductsAndCategories();
                                            handleCloseDetailModal();
                                        } catch (err) {
                                            console.error(err);
                                            alert(err.response?.data?.message || 'Không thể xóa sản phẩm này.');
                                        }
                                    }
                                }}
                                className="px-4 py-2 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                            >
                                Xóa sản phẩm
                            </button>
                            <button 
                                onClick={() => {
                                    handleOpenEditModal(selectedProductDetail);
                                    handleCloseDetailModal();
                                }}
                                className="px-4 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-md shadow-primary-500/20"
                            >
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
