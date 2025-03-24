"use client"
// import { createClient } from "@/utils/supabase/client"
import React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// Create the cart context with default values
const CartContext = createContext({
    items: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    totalItems: 0,
    totalPrice: 0,
})



// Custom hook to use the cart context
export const useCart = () => useContext(CartContext)

// Cart provider component
export function CartProvider({ children }) {
    const [items, setItems] = useState([])
    const [isInitialized, setIsInitialized] = useState(false)

    // Load cart from localStorage on component mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem("cart")
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart)
                setItems(parsedCart)
            }
        } catch (error) {
            console.error("Failed to parse cart from localStorage:", error)
        }
        setIsInitialized(true)
    }, [])

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        // Only save to localStorage after initial load
        if (isInitialized) {
            localStorage.setItem("cart", JSON.stringify(items))
            console.log("Cart updated:", items)
        }
    }, [items, isInitialized])


    // Add a product to the cart
    const addToCart = (product) => {
        console.log("Adding to cart:", product)
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id)
            if (existingItem) {
                // If item already exists, increase quantity
                return prevItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
            } else {
                // Otherwise add new item with quantity 1
                return [...prevItems, { ...product, quantity: 1 }]
            }
        })
    }

    // Remove an item from the cart
    const removeFromCart = (id) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }

    // Update the quantity of an item
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return
        setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }

    // Clear the entire cart
    const clearCart = () => {
        setItems([])
    }

    // Calculate total items in cart
    const totalItems = items.reduce((total, item) => total + item.quantity, 0)

    // Calculate total price
    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, }}>
            {children}
        </CartContext.Provider>
    )
}







// Create a search context to share the search query between components
const SearchContext = createContext({
    searchQuery: '',
    setSearchQuery: () => { }
});


export const useSearch = () => useContext(SearchContext);


export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
            {children}
        </SearchContext.Provider>
    );
};