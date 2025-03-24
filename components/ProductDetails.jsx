'use client'

import React, { useEffect, useState } from 'react'
import { useCart } from './CartProvider'
import { Button } from './ui/button'
import { AlertCircleIcon, Check, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

const ProductDetails = ({ productId }) => {
    const { user } = useUser()
    const { addToCart, updateQuantity, items } = useCart()
    const supabase = createClient()
    const [addedItems, setAddedItems] = useState({})
    const [product, setProduct] = useState(null)

    // Find if current product is in cart
    const cartItem = items.find(item => item.id === productId)


    //FETCH DETAILS PAGE
    useEffect(() => {
        const getProduct = async () => {
            let { data: product, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single()

            if (error) {
                throw new Error("error fetching product");
            }
            if (product) {
                setProduct(product)
            }
        }

        getProduct()
    }, [productId, supabase])

    // Add to cart function
    const handleAddToCart = (product) => {
        addToCart(product)

        // Show visual feedback
        setAddedItems((prev) => ({ ...prev, [product.id]: true }))

        // Reset after 1 second
        setTimeout(() => {
            setAddedItems((prev) => ({ ...prev, [product.id]: false }))
        }, 1000)
    }


    return (
        <>
            <div className='flex items-start w-[90%] md:w-[80%] mx-auto gap-4 mt-10 flex-col md:flex-row'>
                <div className='bg-gray-100 rounded-2xl h-[300px] flex justify-center w-full shadow-xl items-center p-4'>
                    {product?.image_url && (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            className='w-full h-full object-contain'
                            width={400}
                            height={300}
                        />
                    )}
                </div>

                <div className='w-full p-5 rounded-2xl space-y-4'>
                    <h1 className='font-bold text-2xl'>{product?.name}</h1>
                    <p className='font-bold text-lg'>${product?.price}</p>
                    <p className='text-sm text-gray-500'>{product?.description}</p>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Only show quantity controls if this product is in cart */}
                        {cartItem ? (
                            <div className="flex items-center border rounded-md">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none"
                                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                                    disabled={cartItem.quantity <= 1}
                                >
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{cartItem.quantity}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none"
                                    onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                                >
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : null}

                        {/* Add to cart button */}
                        <Button
                            className="bg-gradient-to-r from-purple-800 to-fuchsia-600 cursor-pointer hover:bg-gradient-to-r hover:from-purple-900 hover:to-fuchsia-700 ml-auto"
                            onClick={() => handleAddToCart(product)}
                            disabled={!product}
                        >
                            {addedItems[product?.id] ? (
                                <>
                                    <Check className="mr-2 h-4 w-4" /> Added
                                </>
                            ) : (
                                <>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    {cartItem ? 'Add Another' : 'Add to Cart'}
                                </>
                            )}
                        </Button>


                    </div>




                </div>
            </div>

            <div className='border rounded overflow-hidden w-[80%] md:w-[60%] mx-auto mt-5'>

                <div className='flex items-center text-amber-400 gap-x-3 px-7 py-2 text-center'>
                    <AlertCircleIcon />
                    <p>Note: The card detail is for testing, no actual transactions wil be made!. </p>
                </div>

                <div className="">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left border-b">Card Number</th>
                                <th className="p-3 text-left border-b">Expiry</th>
                                <th className="p-3 text-left border-b">CVV</th>
                                <th className="p-3 text-left border-b">PIN</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-3 border-b">5531 8866 5214 2950</td>
                                <td className="p-3 border-b">09/32</td>
                                <td className="p-3 border-b">564</td>
                                <td className="p-3 border-b">12345</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default ProductDetails