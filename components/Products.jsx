'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { ShoppingBag } from 'lucide-react'
import { createClient } from "@/utils/supabase/client";
import Image from 'next/image'
import { ProductLoading } from './loading/productPage'
import { useSearch } from './CartProvider'


const Products = () => {


    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { searchQuery } = useSearch()  // Get the search query from context


    const supabase = createClient()

    //product fetching
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            try {

                let query = supabase.from('products').select('*')

                if (searchQuery && searchQuery.trim() !== '') {
                    const searchTerm = searchQuery.trim()

                    // Create variations of the search term to catch common typos
                    const variations = [
                        searchTerm,                         // Exact term
                        searchTerm.replace(/[aeiou]/g, '_'), // Replace vowels with wildcards
                        `%${searchTerm}%`,                  // Contains term anywhere
                        `%${searchTerm.substring(0, Math.max(searchTerm.length - 1, 1))}%` // Missing last character
                    ]

                    // Build OR conditions for each variation
                    let conditions = variations.map(term =>
                        `name.ilike.${term},description.ilike.${term}`
                    ).join(',')

                    query = query.or(conditions)
                }

                const { data: products, error } = await query



                if (error) {
                    throw error
                }

                if (products) {
                    setProducts(products)
                }
            } catch (error) {
                console.error('Error fetching products:', error)
                setError('Something went wrong, but don"t fret — let"s give it another shot.')
            } finally {
                setLoading(false)
            }
        }

        // Fetch products whenever searchQuery changes
        fetchProducts()

        // Set up real-time subscription
        const channel = supabase
            .channel('posts-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products'
                },
                (payload) => {
                    console.log('Change received!', payload)

                    switch (payload.eventType) {
                        case 'INSERT':
                            //👉 1. Add new post to the list
                            setProducts(prevPosts => [...prevPosts, payload.new])
                            break
                        case 'DELETE':
                            // Remove deleted post from the list
                            setProducts(prevPosts =>
                                prevPosts.filter(post => post.id !== payload.old.id)
                            )
                            break
                        case 'UPDATE':
                            // Update existing post in the list
                            setProducts(prevPosts =>
                                prevPosts.map(post =>
                                    post.id === payload.new.id ? payload.new : post
                                )
                            )
                            break
                    }
                })
            .subscribe()

        // Cleanup subscription
        return () => {
            supabase.removeChannel(channel)
        }
    }, [searchQuery]) // Re-run when searchQuery changes

    return (
        <div>
            <h1 className='m-3 text-2xl bg-gradient-to-r from-purple-800 to-fuchsia-600 text-white w-[90%] mx-auto text-center font-bold p-2 rounded-2xl '>
                {searchQuery ? `Search Results: "${searchQuery}"` : 'Our Products'}
            </h1>
            {
                loading ? <ProductLoading /> :

                    <>
                        {error && (
                            <div className="bg-red-100 p-4 rounded-md text-red-700 flex items-center justify-center w-[60%] mx-auto mb-4">
                                <p className='text-center'>
                                    {error}
                                </p>
                            </div>
                        )}

                        {products.length === 0 && !loading && !error && (
                            <div className="bg-yellow-100 p-4 rounded-md text-yellow-700 flex items-center justify-center w-[60%] mx-auto mb-4">
                                <p className='text-center'>
                                    No products found matching "{searchQuery}". Try a different search term.
                                </p>
                            </div>
                        )}


                        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>



                            {products.map((product) => (
                                <div key={product.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
                                    {/* Image container with fixed aspect ratio */}
                                    <div className="relative h-48 md:h-64 bg-gray-50 p-4">
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-2"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority
                                        />
                                    </div>

                                    {/* Product info container */}
                                    <div className="flex flex-col flex-grow p-4 bg-white">
                                        <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                                        <p className="font-bold text-xl mt-auto mb-3">${product.price.toFixed(2)}</p>

                                        <Link href={`/product/${product.id}`} className="w-full">
                                            <Button className="w-full bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-800 hover:to-fuchsia-700 transition-all duration-300 cursor-pointer">
                                                <span className="mr-2">View Product</span> <ShoppingBag size={18} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </>
            }

        </div>
    )
}

export default Products