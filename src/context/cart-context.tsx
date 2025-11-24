'use client';

import type { Product } from '@/lib/data';
import React, { createContext, useContext, useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { WithId } from '@/firebase';

export type CartItem = {
  id: string; // Unique ID for the cart item (e.g., productId-size)
  product: WithId<Omit<Product, 'id'>>;
  quantity: number;
  size?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: WithId<Omit<Product, 'id'>>, size?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: WithId<Omit<Product, 'id'>>, size?: string) => {
    setCartItems((prevItems) => {
      // Create a unique ID for the cart item based on product ID and size
      const cartItemId = size ? `${product.id}-${size}` : product.id;
      
      const existingItem = prevItems.find(
        (item) => item.id === cartItemId
      );

      if (existingItem) {
        // If item with same ID (and size) exists, just increase quantity
        return prevItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Otherwise, add a new item to the cart
      return [...prevItems, { id: cartItemId, product, quantity: 1, size }];
    });

    toast({
      title: 'Added to Cart',
      description: `${product.name}${size ? ` (Size: ${size})` : ''} has been added.`,
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== cartItemId)
    );
    toast({
      title: 'Removed from Cart',
      description: 'The item has been removed from your cart.',
      variant: 'destructive',
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}