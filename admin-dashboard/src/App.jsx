import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import CustomersView from './components/CustomersView';
import OrdersView from './components/OrdersView';
import ProductsView from './components/ProductsView';
import PostsView from './components/PostsView';
import BannersView from './components/BannersView';
import AddressesView from './components/AddressesView';
import CategoriesView from './components/CategoriesView';
import CategoryPostsView from './components/CategoryPostsView';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwtToken'));
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Global Axios Interceptor to catch 401 unauthorized
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('fullName');
                    localStorage.removeItem('role');
                    setIsAuthenticated(false);
                }
                return Promise.reject(error);
            }
        );
        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setActiveTab('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('username');
        localStorage.removeItem('fullName');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
    };

    // Reset search query when tab changes
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchQuery('');
    };

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
            {/* Sidebar */}
            <Sidebar 
                activeTab={activeTab} 
                onTabChange={handleTabChange}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header 
                    activeTab={activeTab}
                    onSearch={setSearchQuery}
                    onToggleSidebar={() => setIsSidebarOpen(true)}
                    onLogout={handleLogout}
                />

                {/* Main Dynamic View Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    {activeTab === 'dashboard' && <DashboardView />}
                    {activeTab === 'users' && <UsersView searchQuery={searchQuery} />}
                    {activeTab === 'customers' && <CustomersView searchQuery={searchQuery} />}
                    {activeTab === 'categories' && <CategoriesView searchQuery={searchQuery} />}
                    {activeTab === 'products' && <ProductsView searchQuery={searchQuery} />}
                    {activeTab === 'category-posts' && <CategoryPostsView searchQuery={searchQuery} />}
                    {activeTab === 'posts' && <PostsView searchQuery={searchQuery} />}
                    {activeTab === 'banners' && <BannersView searchQuery={searchQuery} />}
                    {activeTab === 'orders' && <OrdersView searchQuery={searchQuery} />}
                    {activeTab === 'addresses' && <AddressesView />}
                </main>
            </div>
        </div>
    );
}
