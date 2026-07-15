import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AddressesView() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [customerSearch, setCustomerSearch] = useState('');

    const [formData, setFormData] = useState({
        contactName: '',
        phone: '',
        specificAddress: '',
        isDefault: false
    });
    const [error, setError] = useState(null);

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const fetchCustomers = async () => {
        setLoadingCustomers(true);
        try {
            const response = await axios.get('/api/customers', getHeaders());
            // Since getAllCustomers returns List<Customer> directly
            const custs = response.data || [];
            setCustomers(custs);
            if (custs.length > 0) {
                setSelectedCustomer(custs[0]);
            }
        } catch (err) {
            console.error('Error fetching customers:', err);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const fetchAddresses = async (customerId) => {
        if (!customerId) return;
        setLoadingAddresses(true);
        try {
            const response = await axios.get(`/api/customers/${customerId}/addresses`, getHeaders());
            setAddresses(response.data || []);
        } catch (err) {
            console.error('Error fetching addresses:', err);
        } finally {
            setLoadingAddresses(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (selectedCustomer) {
            fetchAddresses(selectedCustomer.customerId);
        } else {
            setAddresses([]);
        }
    }, [selectedCustomer]);

    const handleOpenAddModal = () => {
        setEditingAddress(null);
        setFormData({
            contactName: '',
            phone: '',
            specificAddress: '',
            isDefault: false
        });
        setError(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (addr) => {
        setEditingAddress(addr);
        setFormData({
            contactName: addr.contactName,
            phone: addr.phone,
            specificAddress: addr.specificAddress,
            isDefault: addr.isDefault === true
        });
        setError(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            if (editingAddress) {
                // Update
                await axios.put(`/api/addresses/${editingAddress.addressId}`, formData, getHeaders());
            } else {
                // Create
                await axios.post(`/api/customers/${selectedCustomer.customerId}/addresses`, formData, getHeaders());
            }
            fetchAddresses(selectedCustomer.customerId);
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu địa chỉ.');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) return;
        try {
            await axios.delete(`/api/addresses/${addressId}`, getHeaders());
            fetchAddresses(selectedCustomer.customerId);
        } catch (err) {
            console.error(err);
            alert('Không thể xóa địa chỉ này.');
        }
    };

    const handleSetDefault = async (addr) => {
        if (addr.isDefault) return;
        const payload = {
            ...addr,
            isDefault: true
        };
        try {
            await axios.put(`/api/addresses/${addr.addressId}`, payload, getHeaders());
            fetchAddresses(selectedCustomer.customerId);
        } catch (err) {
            console.error('Error setting default address:', err);
        }
    };

    // Filter customers
    const filteredCustomers = customers.filter(c => {
        const query = customerSearch.toLowerCase();
        return (
            c.fullName?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query) ||
            c.phone?.toLowerCase().includes(query) ||
            c.customerId?.toString().includes(query)
        );
    });

    if (loadingCustomers) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 animate-pulse">Đang tải danh sách khách hàng...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customers Master List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm flex flex-col h-[600px]">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/50 space-y-3">
                    <h4 className="font-outfit font-bold text-slate-850 dark:text-white">Danh sách khách hàng</h4>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                        </span>
                        <input 
                            type="text" 
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none dark:text-white" 
                            placeholder="Tìm kiếm khách hàng..."
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 p-2 space-y-1">
                    {filteredCustomers.length === 0 ? (
                        <div className="text-center py-10 text-xs text-slate-400">
                            Không có khách hàng
                        </div>
                    ) : (
                        filteredCustomers.map(cust => (
                            <button
                                key={cust.customerId}
                                onClick={() => setSelectedCustomer(cust)}
                                className={`w-full flex flex-col items-start text-left p-3 rounded-xl transition-all border ${
                                    selectedCustomer?.customerId === cust.customerId
                                        ? 'bg-primary-50/70 border-primary-100 dark:bg-primary-950/20 dark:border-primary-900/30'
                                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30'
                                }`}
                            >
                                <span className={`text-xs font-bold ${selectedCustomer?.customerId === cust.customerId ? 'text-primary-750 dark:text-primary-300' : 'text-slate-800 dark:text-slate-250'}`}>
                                    {cust.fullName}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{cust.email || 'Không có email'}</span>
                                <span className="text-[10px] text-slate-400 block">{cust.phone || 'Không có sđt'}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Addresses Detail Panel */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm p-6 flex flex-col h-[600px]">
                {selectedCustomer ? (
                    <>
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                            <div>
                                <span className="text-xs text-slate-400">Địa chỉ giao hàng của</span>
                                <h3 className="font-outfit font-bold text-lg dark:text-white mt-0.5">{selectedCustomer.fullName}</h3>
                            </div>
                            <button 
                                onClick={handleOpenAddModal}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-all shadow-md shadow-emerald-500/10"
                            >
                                <i className="fa-solid fa-plus"></i>
                                <span>Thêm địa chỉ</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                            {loadingAddresses ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <i className="fa-solid fa-location-dot text-4xl mb-3 block opacity-30"></i>
                                    Khách hàng này chưa có địa chỉ giao nhận nào.
                                </div>
                            ) : (
                                addresses.map(addr => (
                                    <div 
                                        key={addr.addressId} 
                                        className={`p-4 rounded-xl border transition-all flex justify-between items-start gap-4 ${
                                            addr.isDefault 
                                                ? 'border-primary-100 bg-primary-50/10 dark:border-primary-900/30 dark:bg-primary-950/5'
                                                : 'border-slate-100 dark:border-slate-800/80'
                                        }`}
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <span className="font-semibold text-sm dark:text-white">{addr.contactName}</span>
                                                <span className="text-xs text-slate-405 dark:text-slate-400 font-medium">({addr.phone})</span>
                                                {addr.isDefault && (
                                                    <span className="bg-primary-100 dark:bg-primary-950/40 text-primary-650 dark:text-primary-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-200/30">Mặc định</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">{addr.specificAddress}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!addr.isDefault && (
                                                <button 
                                                    onClick={() => handleSetDefault(addr)}
                                                    className="px-2.5 py-1 text-slate-500 hover:text-primary-650 dark:hover:text-primary-400 text-xs font-semibold rounded hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all"
                                                >
                                                    Đặt mặc định
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleOpenEditModal(addr)}
                                                className="p-1.5 text-slate-405 hover:text-primary-600 rounded"
                                                title="Sửa"
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAddress(addr.addressId)}
                                                className="p-1.5 text-slate-405 hover:text-red-650 rounded"
                                                title="Xóa"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <i className="fa-solid fa-user-tag text-5xl mb-3 block opacity-30"></i>
                        Chọn một khách hàng để quản lý địa chỉ giao hàng
                    </div>
                )}
            </div>

            {/* Modal Add/Edit */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">
                                {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ giao nhận'}
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
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Tên người nhận</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="Ví dụ: Nguyễn Văn B"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Số điện thoại liên hệ</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                                    placeholder="Ví dụ: 0987654321"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Địa chỉ cụ thể</label>
                                <textarea 
                                    required
                                    value={formData.specificAddress}
                                    onChange={(e) => setFormData({ ...formData, specificAddress: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white text-sm h-20 resize-none"
                                    placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="addrDefault" 
                                    checked={formData.isDefault}
                                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                    className="w-4.5 h-4.5 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                                />
                                <label htmlFor="addrDefault" className="text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">Đặt làm địa chỉ giao hàng mặc định</label>
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
        </div>
    );
}
