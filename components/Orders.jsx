'use client'
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from 'lucide-react'

const Orders = () => {
    const { user } = useUser()
    const supabase = createClient()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    //fetch order from supabase
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                let { data: orders, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('user_id', user?.id);
                if (error) {
                    throw error
                }
                if (orders) {
                    setOrders(orders)
                }
            } catch (error) {
                setError('Ops Failed to fetch orders, check your connections')
            } finally {
                setLoading(false)
            }
        }
        // Initial fetch
        fetchPosts()
        // Set up real-time subscription
        const channel = supabase
            .channel('posts-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    console.log('Change received!', payload)
                    switch (payload.eventType) {
                        case 'INSERT':
                            //👉 1. Add new post to the list
                            setOrders(prevPosts => [...prevPosts, payload.new])
                            break
                        case 'DELETE':
                            // Remove deleted post from the list
                            setOrders(prevPosts =>
                                prevPosts.filter(post => post.id !== payload.old.id)
                            )
                            break
                        case 'UPDATE':
                            // Update existing post in the list
                            setOrders(prevPosts =>
                                prevPosts.map(post =>
                                    post.id === payload.new.id ? payload.new : post
                                )
                            )
                            break
                    }
                }
            )
            .subscribe()
        // Cleanup subscription when component unmounts
        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, supabase])


    // Function to parse the JSON string in orders field
    const parseOrderItems = (orderItems) => {
        try {
            if (!orderItems) return [];
            // If it's already an object, return it
            if (typeof orderItems === 'object') return orderItems;
            // Parse the JSON string
            return JSON.parse(orderItems);
        } catch (err) {
            console.error("Error parsing order items:", err);
            return [];
        }
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

            {loading ? (
                <div className="flex items-center justify-center">
                    <p className="text-lg">Loading your orders...</p>
                    <Loader className='animate-spin ' />
                </div>
            ) : error ? (
                <div className="bg-red-100 p-4 rounded-md text-red-700">
                    {error}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {orders.map((order) => {
                        const orderItems = parseOrderItems(order.items || order.orders);

                        return (
                            <Card key={order.id} className="shadow-md w-[90%] mx-auto md:w-full">

                                <CardHeader className="bg-gray-50 py-1">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">
                                            Order #{order.tx_ref || order.id.substring(0, 8)}
                                        </CardTitle>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'successful' ? 'bg-green-500 text-green-50' :
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {formatDate(order.created_at || order.date)}
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-1">
                                    <div className="mb-4">
                                        <h3 className="font-medium mb-2">Order Items</h3>
                                        {Array.isArray(orderItems) && orderItems.length > 0 ? (
                                            <div className="space-y-2">
                                                {orderItems.map((product) => (
                                                    <div key={product.id} className="flex justify-between border-b pb-2">
                                                        <div className="flex items-center space-x-3">
                                                            {product.image_url && (
                                                                <div className="h-12 w-12 rounded border overflow-hidden">
                                                                    <img
                                                                        src={product.image_url}
                                                                        alt={product.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-medium">{product.name}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    Qty: {product.quantity}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <p className="font-medium">
                                                            ${(product.price * product.quantity).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 text-sm">No items found</p>
                                        )}
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total:</span>
                                        <span>${parseFloat(order.total_amount).toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default Orders