import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function BannersView({ searchQuery }) {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedBannerDetail, setSelectedBannerDetail] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        linkUrl: '',
        status: true
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [error, setError] = useState(null);

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/banners', getHeaders());
            setBanners(response.data);
        } catch (err) {
            console.error('Error fetching banners:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleOpenAddModal = () => {
        setEditingBanner(null);
        setFormData({
            title: '',
            imageUrl: '',
            linkUrl: '',
            status: true
        });
        setSelectedFile(null);
        setImagePreview('');
        setError(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title || '',
            imageUrl: banner.imageUrl || '',
            linkUrl: banner.linkUrl || '',
            status: banner.status !== false
        });
        setSelectedFile(null);
        setImagePreview(banner.imageUrl || '');
        setError(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleOpenDetailModal = (banner) => {
        setSelectedBannerDetail(banner);
        setDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setSelectedBannerDetail(null);
        setDetailModalOpen(false);
    };

    const handleDeleteBanner = async (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa banner này?')) {
            try {
                await axios.delete(`/api/banners/${id}`, getHeaders());
                fetchBanners();
                if (selectedBannerDetail && selectedBannerDetail.bannerId === id) {
                    handleCloseDetailModal();
                }
            } catch (err) {
                console.error(err);
                alert('Không thể xóa banner này.');
            }
        }
    };

    const handleToggleStatus = async (banner) => {
        try {
            const updated = { ...banner, status: !banner.status };
            await axios.put(`/api/banners/${banner.bannerId}`, updated, getHeaders());
            fetchBanners();
        } catch (err) {
            console.error('Error toggling status:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        let finalImageUrl = formData.imageUrl;
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
                finalImageUrl = uploadRes.data.url;
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Lỗi tải ảnh lên máy chủ.');
                return;
            }
        }

        if (!finalImageUrl) {
            setError('Vui lòng chọn hình ảnh cho banner.');
            return;
        }

        const payload = {
            ...formData,
            imageUrl: finalImageUrl
        };

        try {
            if (editingBanner) {
                await axios.put(`/api/banners/${editingBanner.bannerId}`, payload, getHeaders());
            } else {
                await axios.post('/api/banners', payload, getHeaders());
            }
            fetchBanners();
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu banner.');
        }
    };

    // Filter by search query
    const filteredBanners = banners.filter(banner => {
        const query = searchQuery?.toLowerCase() || '';
        return (
            banner.title?.toLowerCase().includes(query) ||
            banner.linkUrl?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="font-outfit font-bold text-2xl text-slate-800 dark:text-white">Quản lý Banner</h3>
                    <p className="text-slate-400 text-xs mt-1">Cấu hình các hình ảnh banner quảng cáo trên website cửa hàng</p>
                </div>
                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 self-start md:self-auto"
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Thêm Banner</span>
                </button>
            </div>

            {/* Content list */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-24 text-center text-slate-400">
                        <i className="fa-solid fa-circle-notch fa-spin text-3xl mb-2 text-primary-500"></i>
                        <p className="text-xs">Đang tải dữ liệu banner...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                    <th className="py-3 px-6">ID</th>
                                    <th className="py-3 px-6">Hình ảnh</th>
                                    <th className="py-3 px-6">Tiêu đề Banner</th>
                                    <th className="py-3 px-6">Đường dẫn (Link)</th>
                                    <th className="py-3 px-6 text-center">Trạng thái</th>
                                    <th className="py-3 px-6 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {filteredBanners.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400">
                                            <i className="fa-solid fa-images text-3xl mb-2 block opacity-40"></i>
                                            Không tìm thấy banner nào
                                        </td>
                                    </tr>
                                ) : (
                                    filteredBanners.map(banner => (
                                        <tr key={banner.bannerId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                            <td className="py-4 px-6 font-semibold text-slate-500">#{banner.bannerId}</td>
                                            <td className="py-4 px-6">
                                                <div className="w-24 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0">
                                                    {banner.imageUrl ? (
                                                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <i className="fa-solid fa-image text-slate-400"></i>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-medium dark:text-white max-w-xs truncate">{banner.title || 'Không có tiêu đề'}</td>
                                            <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">{banner.linkUrl || '-'}</td>
                                            <td className="py-4 px-6 text-center">
                                                <button 
                                                    onClick={() => handleToggleStatus(banner)}
                                                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                                                        banner.status !== false 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                                            : 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {banner.status !== false ? 'Hiển thị' : 'Ẩn'}
                                                </button>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button 
                                                        onClick={() => handleOpenDetailModal(banner)}
                                                        className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="fa-solid fa-eye text-sm"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenEditModal(banner)}
                                                        className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square"></i>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteBanner(banner.bannerId)}
                                                        className="p-2 text-slate-400 hover:text-red-650 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
                )}
            </div>

            {/* Form Add / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">
                                {editingBanner ? 'Cập nhật Banner' : 'Thêm Banner mới'}
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
                                <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tiêu đề Banner</label>
                                <input 
                                    type="text" 
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="Ví dụ: Banner siêu khuyến mãi hè"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Đường dẫn liên kết (Link)</label>
                                <input 
                                    type="text" 
                                    value={formData.linkUrl}
                                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="Ví dụ: /san-pham/1"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Hình ảnh Banner</label>
                                <div className="flex items-center gap-4">
                                    {imagePreview && (
                                        <div className="relative w-24 h-12 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-900 flex-shrink-0">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setFormData({ ...formData, imageUrl: '' });
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
                                            required={!imagePreview}
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setSelectedFile(file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-slate-800 dark:file:text-slate-350 cursor-pointer"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ các định dạng JPG, PNG, GIF. File ảnh được tải trực tiếp lên Backend.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="bannerStatus" 
                                    checked={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                    className="w-4.5 h-4.5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                                />
                                <label htmlFor="bannerStatus" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">Kích hoạt hiển thị</label>
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
            {detailModalOpen && selectedBannerDetail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">Chi tiết Banner</h4>
                            <button 
                                onClick={handleCloseDetailModal}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Large Image Preview */}
                            <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                                {selectedBannerDetail.imageUrl ? (
                                    <img src={selectedBannerDetail.imageUrl} alt={selectedBannerDetail.title} className="w-full h-full object-contain" />
                                ) : (
                                    <div className="text-center text-slate-400">
                                        <i className="fa-solid fa-image text-5xl mb-2 block"></i>
                                        Chưa có hình ảnh
                                    </div>
                                )}
                            </div>

                            {/* Banner details mapping */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Tiêu đề Banner</span>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{selectedBannerDetail.title || 'Không có tiêu đề'}</h3>
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Đường dẫn liên kết (Link)</span>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5 truncate">{selectedBannerDetail.linkUrl || 'Không liên kết'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">Trạng thái</span>
                                            <div className="mt-1">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    selectedBannerDetail.status !== false 
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                                                        : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                                                }`}>
                                                    {selectedBannerDetail.status !== false ? 'Đang hoạt động' : 'Đang ẩn'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase font-bold text-slate-400">Mã ID</span>
                                            <p className="text-sm font-semibold dark:text-white mt-1">#{selectedBannerDetail.bannerId}</p>
                                        </div>
                                    </div>
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
                                onClick={() => handleDeleteBanner(selectedBannerDetail.bannerId)}
                                className="px-4 py-2 text-sm font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                            >
                                Xóa Banner
                            </button>
                            <button 
                                onClick={() => {
                                    handleOpenEditModal(selectedBannerDetail);
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
