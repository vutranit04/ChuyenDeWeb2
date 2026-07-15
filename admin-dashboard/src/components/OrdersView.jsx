import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrdersView({ searchQuery }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ orderId: null, shippingAddress: '', note: '' });

    const getHeaders = () => ({
        headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`
        }
    });

    const formatVND = (value) => {
        if (value === undefined || value === null) return '0đ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Fetch all orders - now unpaginated
            const response = await axios.get('/api/orders', getHeaders());
            setOrders(response.data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingStatusId(orderId);
        try {
            await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, getHeaders());
            // Refresh order details if it's currently opened
            if (selectedOrder && selectedOrder.orderId === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
            fetchOrders();
        } catch (err) {
            console.error('Error updating order status:', err);
            alert('Không thể cập nhật trạng thái đơn hàng.');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleOpenEdit = (order) => {
        setEditForm({
            orderId: order.orderId,
            shippingAddress: order.shippingAddress || '',
            note: order.note || ''
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/orders/${editForm.orderId}`, {
                shippingAddress: editForm.shippingAddress,
                note: editForm.note
            }, getHeaders());
            setEditModalOpen(false);
            fetchOrders();
            if (selectedOrder && selectedOrder.orderId === editForm.orderId) {
                setSelectedOrder({
                    ...selectedOrder,
                    shippingAddress: editForm.shippingAddress,
                    note: editForm.note
                });
            }
        } catch (err) {
            console.error('Error saving order edits:', err);
            alert('Không thể cập nhật thông tin đơn hàng.');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${orderId} không? (Hành động này sẽ khôi phục kho và xóa toàn bộ chi tiết đơn hàng)`)) {
            try {
                await axios.delete(`/api/orders/${orderId}`, getHeaders());
                fetchOrders();
                if (selectedOrder && selectedOrder.orderId === orderId) {
                    setDetailsModalOpen(false);
                    setSelectedOrder(null);
                }
            } catch (err) {
                console.error('Error deleting order:', err);
                alert('Không thể xóa đơn hàng.');
            }
        }
    };

    const handleDeleteDetailItem = async (detailId) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi đơn hàng?')) {
            try {
                await axios.delete(`/api/orders/${selectedOrder.orderId}/details/${detailId}`, getHeaders());
                const updatedOrderRes = await axios.get(`/api/orders/${selectedOrder.orderId}`, getHeaders());
                setSelectedOrder(updatedOrderRes.data);
                fetchOrders();
            } catch (err) {
                console.error('Error deleting detail item:', err);
                alert('Không thể xóa sản phẩm khỏi đơn hàng.');
            }
        }
    };

    const handleUpdateDetailQty = async (detailId, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty <= 0) {
            handleDeleteDetailItem(detailId);
            return;
        }
        try {
            await axios.put(`/api/orders/${selectedOrder.orderId}/details/${detailId}`, { quantity: newQty }, getHeaders());
            const updatedOrderRes = await axios.get(`/api/orders/${selectedOrder.orderId}`, getHeaders());
            setSelectedOrder(updatedOrderRes.data);
            fetchOrders();
        } catch (err) {
            console.error('Error updating detail quantity:', err);
            alert(err.response?.data?.message || 'Không thể cập nhật số lượng sản phẩm.');
        }
    };

    const handleViewDetails = async (order) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/orders/${order.orderId}`, getHeaders());
            setSelectedOrder(response.data);
            setDetailsModalOpen(true);
        } catch (err) {
            console.error('Error fetching order details:', err);
            alert('Không thể tải chi tiết đơn hàng.');
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        
        const query = searchQuery?.toLowerCase() || '';
        const matchesSearch = 
            order.orderId?.toString().includes(query) ||
            order.customerName?.toLowerCase().includes(query) ||
            order.shippingAddress?.toLowerCase().includes(query) ||
            order.note?.toLowerCase().includes(query);

        return matchesStatus && matchesSearch;
    });

    const statusOptions = ['Chờ duyệt', 'Đang giao', 'Đã giao', 'Đã hủy'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 animate-pulse">Đang tải danh sách đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Quản lý đơn hàng</h3>
                    <p className="text-xs text-slate-500">Phê duyệt và cập nhật tình trạng giao nhận</p>
                </div>

                {/* Status Tabs */}
                <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl text-xs font-semibold">
                    <button 
                        onClick={() => setStatusFilter('ALL')}
                        className={`px-3.5 py-2 rounded-lg transition-all ${
                            statusFilter === 'ALL' 
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        Tất cả
                    </button>
                    {statusOptions.map(opt => (
                        <button 
                            key={opt}
                            onClick={() => setStatusFilter(opt)}
                            className={`px-3.5 py-2 rounded-lg transition-all ${
                                statusFilter === opt 
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                <th className="py-3 px-6">Mã đơn</th>
                                <th className="py-3 px-6">Khách hàng</th>
                                <th className="py-3 px-6">Ngày đặt</th>
                                <th className="py-3 px-6 text-right">Tổng tiền</th>
                                <th className="py-3 px-6 text-center">Trạng thái</th>
                                <th className="py-3 px-6 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">
                                        <i className="fa-solid fa-folder-open text-3xl mb-2 block opacity-40"></i>
                                        Không tìm thấy đơn hàng nào
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => {
                                    let statusStyle = '';
                                    if (order.status === 'Chờ duyệt') statusStyle = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30';
                                    else if (order.status === 'Đang giao') statusStyle = 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30';
                                    else if (order.status === 'Đã giao') statusStyle = 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
                                    else statusStyle = 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30';

                                    return (
                                        <tr key={order.orderId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                                            <td className="py-4 px-6 font-semibold text-primary-600 dark:text-primary-400">#{order.orderId}</td>
                                            <td className="py-4 px-6 font-medium dark:text-white">{order.customerName}</td>
                                            <td className="py-4 px-6 text-slate-400">{formatDateTime(order.orderDate)}</td>
                                            <td className="py-4 px-6 text-right font-bold text-slate-800 dark:text-slate-200">{formatVND(order.totalAmount)}</td>
                                            <td className="py-4 px-6 text-center">
                                                {updatingStatusId === order.orderId ? (
                                                    <span className="text-xs text-slate-400 animate-pulse">Đang cập nhật...</span>
                                                ) : (
                                                    <select 
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none ${statusStyle}`}
                                                    >
                                                        {statusOptions.map(opt => (
                                                            <option key={opt} value={opt} className="bg-white dark:bg-slate-900 text-slate-805 dark:text-slate-200 font-medium">{opt}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </td>
                                             <td className="py-4 px-6 text-center">
                                                 <div className="flex justify-center items-center gap-2">
                                                     <button 
                                                         onClick={() => handleViewDetails(order)}
                                                         className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-all"
                                                         title="Chi tiết đơn hàng"
                                                     >
                                                         Chi tiết
                                                     </button>
                                                     <button 
                                                         onClick={() => handleDeleteOrder(order.orderId)}
                                                         className="px-2 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-lg text-xs transition-all"
                                                         title="Xóa đơn hàng"
                                                     >
                                                         Xóa
                                                     </button>
                                                 </div>
                                             </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {detailsModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                            <div>
                                <h4 className="font-outfit font-bold text-lg dark:text-white">Chi tiết đơn hàng #{selectedOrder.orderId}</h4>
                                <p className="text-xs text-slate-400">Đặt lúc {formatDateTime(selectedOrder.orderDate)}</p>
                            </div>
                            <button 
                                onClick={() => setDetailsModalOpen(false)}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Customer & Shipping Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Thông tin khách hàng</span>
                                    <p className="text-sm font-semibold dark:text-white">{selectedOrder.customerName}</p>
                                    <p className="text-xs text-slate-500">ID Khách hàng: #{selectedOrder.customerId}</p>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Địa chỉ giao hàng</span>
                                    <p className="text-sm dark:text-slate-300">{selectedOrder.shippingAddress || 'Chưa cung cấp'}</p>
                                </div>
                                {selectedOrder.note && (
                                    <div className="col-span-1 md:col-span-2">
                                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ghi chú đơn hàng</span>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{selectedOrder.note}"</p>
                                    </div>
                                )}
                            </div>

                            {/* Order Details List */}
                            <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Sản phẩm đã đặt</span>
                                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                                                <th className="py-2.5 px-4">Tên sản phẩm</th>
                                                <th className="py-2.5 px-4 text-center">Số lượng</th>
                                                <th className="py-2.5 px-4 text-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {!selectedOrder.orderDetails || selectedOrder.orderDetails.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="py-6 text-center text-slate-400">Không có thông tin chi tiết sản phẩm</td>
                                                </tr>
                                            ) : (
                                                selectedOrder.orderDetails.map(detail => (
                                                    <tr key={detail.orderDetailId}>
                                                        <td className="py-3 px-4 font-medium dark:text-white">
                                                            <div>{detail.productName}</div>
                                                            <div className="text-[10px] text-slate-400 mt-0.5">Mã SP: #{detail.productId}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button 
                                                                    onClick={() => handleUpdateDetailQty(detail.orderDetailId, detail.quantity, -1)}
                                                                    className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-xs dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="font-semibold w-6 text-center dark:text-slate-350">{detail.quantity}</span>
                                                                <button 
                                                                    onClick={() => handleUpdateDetailQty(detail.orderDetailId, detail.quantity, 1)}
                                                                    className="w-5 h-5 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-xs dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 text-right font-bold text-slate-800 dark:text-slate-200">{formatVND(detail.totalPrice)}</td>
                                                    </tr>
                                                ))
                                            )}
                                            {/* Subtotal */}
                                            <tr className="bg-slate-50 dark:bg-slate-800/20 font-semibold">
                                                <td colSpan="2" className="py-3 px-4 text-right text-slate-500 uppercase tracking-wider text-[10px]">Tổng thanh toán:</td>
                                                <td className="py-3 px-4 text-right font-extrabold text-sm text-primary-600 dark:text-primary-400">{formatVND(selectedOrder.totalAmount)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Status controls inside modal */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400">Trạng thái:</span>
                                    <select 
                                        value={selectedOrder.status}
                                        onChange={(e) => handleUpdateStatus(selectedOrder.orderId, e.target.value)}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none dark:bg-slate-900 dark:text-white"
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={() => handleOpenEdit(selectedOrder)}
                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5"
                                        title="Sửa đơn hàng"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i> Sửa thông tin
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteOrder(selectedOrder.orderId)}
                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold rounded-lg text-xs transition-all flex items-center gap-1.5"
                                        title="Xóa đơn hàng"
                                    >
                                        <i className="fa-solid fa-trash-can"></i> Xóa đơn hàng
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setDetailsModalOpen(false)}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm">
                    <div className="w-full max-w-md p-6 mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
                            <h4 className="font-outfit font-bold text-lg dark:text-white">Sửa thông tin đơn hàng #{editForm.orderId}</h4>
                            <button 
                                onClick={() => setEditModalOpen(false)}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Địa chỉ giao hàng</label>
                                <textarea
                                    value={editForm.shippingAddress}
                                    onChange={(e) => setEditForm({ ...editForm, shippingAddress: e.target.value })}
                                    className="w-full text-sm px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none dark:bg-slate-900 dark:text-white dark:border-slate-800"
                                    rows="3"
                                    placeholder="Nhập địa chỉ giao hàng..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Ghi chú đơn hàng</label>
                                <textarea
                                    value={editForm.note}
                                    onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                                    className="w-full text-sm px-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none dark:bg-slate-900 dark:text-white dark:border-slate-800"
                                    rows="3"
                                    placeholder="Nhập ghi chú..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                <button 
                                    type="button"
                                    onClick={() => setEditModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-all"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-750 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-primary-500/20"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
