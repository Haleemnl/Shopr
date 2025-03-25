

'use client'
import React, { useState } from 'react'
import { Search, Menu, X, ShoppingCart } from 'lucide-react'
import { useCart, useSearch } from './CartProvider';
import { Button } from './ui/button';
import CartModal from './CartModal';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton, } from '@clerk/nextjs';


const Header = ({ onSuccess }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false)

    const { totalItems } = useCart()
    const { searchQuery, setSearchQuery } = useSearch();

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {

        }
    };




    return (
        <nav className="w-full bg-white shadow-lg sticky top-0 z-50">


            {/* Desktop Header */}
            <header className=" mx-auto flex items-center justify-between py-4 px-4 md:px-6">
                {/* Logo on the left */}
                <Link href='/'>
                    <h1 className="font-bold text-2xl font-serif bg-gradient-to-l from-purple-700 to-fuchsia-600 text-transparent bg-clip-text border-x rounded-br-3xl rounded-tr-sm rounded-tl-3xl rounded-bl-sm border-purple-600  px-3 ">
                        Shopr
                    </h1>
                </Link>

                {/* Search input - hidden on mobile, visible on md and up */}
                <div className="hidden md:flex flex-grow mx-2 lg:mx-6 max-w-md relative">
                    <div className="flex items-center w-full">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <Search className=" absolute right-3 text-gray-500 h-5 w-5 cursor-pointe" onClick={handleSearch} />

                    </div>
                </div>

                {/* Navigation items - visible to all up */}
                <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-6">
                    <Button variant="outline" size="icon" className="relative  size-6 md:size-8 cursor-pointer" onClick={() => setIsCartOpen(true)}>
                        <ShoppingCart className="" />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center bg-gradient-to-l from-purple-700 to-fuchsia-400">
                                {totalItems}
                            </span>
                        )}
                    </Button>

                    {/* when user is signed out */}
                    <SignedOut>
                        <SignInButton mode='modal' className='cursor-pointer bg-gradient-to-l from-purple-700 to-fuchsia-400  text-white text-sm font-bold py-1 px-2 md:py-2 md:px-3 rounded-3xl' />

                    </SignedOut>


                    {/* When a user is signed in */}
                    <SignedIn>
                        <UserButton className='size-5 cursor-pointer' />
                        <Link href='/orders'>
                            <p className="cursor-pointer bg-gradient-to-l from-purple-700 to-fuchsia-400  text-white text-sm font-bold py-1 px-2 md:py-2 md:px-3 rounded-3xl">Orders</p>
                        </Link>

                    </SignedIn>

                    <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

                    {/* Mobile menu and close button */}
                    <button
                        className="md:hidden p-2 cursor-pointer"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6 " /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

            </header>

            {/* Mobile Menu Open */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white pb-4 px-4">
                    {/* Mobile search input */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full rounded-lg border border-gray-300 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent "
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                        <Search className="absolute cursor-pointer right-3 top-2.5 text-gray-500 h-5 w-5" onClick={handleSearch} />
                    </div>

                    {/* Mobile navigation items */}
                    <div className="flex flex-col space-y-4">
                        <p className="cursor-pointer hover:text-blue-600 py-1 font-bold">Categories</p>
                        <p className="cursor-pointer hover:text-blue-600 py-1">Electronics</p>
                        <p className="cursor-pointer hover:text-blue-600 py-1">Books</p>
                        <p className="cursor-pointer hover:text-blue-600 py-1">Groceries</p>
                        <p className="cursor-pointer hover:text-blue-600 py-1">Smartphones</p>
                        <p className="cursor-pointer hover:text-blue-600 py-1">Shoes</p>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Header