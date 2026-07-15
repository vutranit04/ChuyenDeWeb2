import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { customer } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('minhvu-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Clear cart when customer logs out
  useEffect(() => {
    if (!customer) {
      setCartItems([]);
    }
  }, [customer]);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('minhvu-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    const existing = cartItems.find(item => item.productId === product.productId);
    const existingQty = existing ? existing.quantity : 0;
    const requestedQty = existingQty + quantity;

    if (product.stockQuantity !== undefined && requestedQty > product.stockQuantity) {
      toast.error(`Số lượng trong kho không đủ (Hiện còn ${product.stockQuantity} sản phẩm)`);
      return;
    }

    if (existing) {
      toast.success(`Đã cập nhật số lượng "${product.productName}"`);
    } else {
      toast.success(`Đã thêm "${product.productName}" vào giỏ hàng`);
    }

    setCartItems(prev => {
      const hasItem = prev.some(item => item.productId === product.productId);
      if (hasItem) {
        return prev.map(item =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        productId: product.productId,
        productName: product.productName,
        image: product.image,
        price: product.price,
        quantity,
        stockQuantity: product.stockQuantity,
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
    toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.find(i => i.productId === productId);
    if (item && item.stockQuantity !== undefined && quantity > item.stockQuantity) {
      toast.error(`Số lượng trong kho không đủ (Hiện còn ${item.stockQuantity} sản phẩm)`);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount,
      isCartOpen, setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
