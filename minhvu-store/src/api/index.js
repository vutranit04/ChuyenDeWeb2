import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ===== PRODUCTS =====
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const getLatestProducts = () => api.get('/products/latest');
export const getBestSellers = () => api.get('/products/best-sellers');

// ===== CATEGORIES =====
export const getCategories = () => api.get('/categories');
export const getCategoryById = (id) => api.get(`/categories/${id}`);

// ===== BANNERS =====
export const getBanners = (activeOnly = true) => api.get(`/banners?activeOnly=${activeOnly}`);

// ===== POSTS =====
export const getPosts = () => api.get('/posts');
export const getPostById = (id) => api.get(`/posts/${id}`);

// ===== CATEGORY POSTS =====
export const getCategoryPosts = () => api.get('/category-posts');

// ===== CUSTOMERS =====
export const createCustomer = (data) => api.post('/customers', data);
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const forgotPassword = (data) => api.post('/customers/forgot-password', data);

// ===== ORDERS =====
export const createOrder = (orderRequest) => api.post('/orders', orderRequest);
export const getOrders = (status) => {
  let url = '/orders';
  if (status) url += `?status=${status}`;
  return api.get(url);
};
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getOrderDetails = (orderId) => api.get(`/orders/${orderId}/details`);
export const updateOrderStatus = (orderId, status) => api.put(`/orders/${orderId}/status`, { status });

// ===== SHIPPING ADDRESSES =====
export const getAddresses = (customerId) => api.get(`/customers/${customerId}/addresses`);
export const createAddress = (customerId, data) => api.post(`/customers/${customerId}/addresses`, data);
export const updateAddress = (addressId, data) => api.put(`/addresses/${addressId}`, data);
export const deleteAddress = (addressId) => api.delete(`/addresses/${addressId}`);

// ===== IMAGE URL HELPER =====
export const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/400x300?text=No+Image';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return path;
  if (path.startsWith('uploads/')) return '/' + path;
  return `/uploads/${path}`;
};

export default api;
