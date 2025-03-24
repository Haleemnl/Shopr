'use client'
import React from 'react'
// import { currentUser } from '@clerk/nextjs/server';
import { useCart } from './CartProvider';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/utils/supabase/client';

const Success = ({ paymentResponse, paymentCompleted }) => {
    // const user = await currentUser();
    const { user } = useUser()
    const { items, totalPrice } = useCart();
    const mail = user?.emailAddresses[0].emailAddress





    return (
        <>
            <div className='receipt'>
                <h1>Payment Complete</h1>
                <p>Thank you for your payment, {user?.firstName}!</p>
                <p>Transaction Reference: {paymentResponse?.tx_ref}</p>
                <p>Total Amount Paid: ₦{totalPrice}</p>
                <p>Items Purchased:</p>
                <ul>
                    {items.map((item) => (
                        <li key={item.id}>
                            {item.name}: ₦{item.price}
                        </li>
                    ))}
                </ul>
                <p>
                    A receipt has been sent to your email:{' '}
                    {mail}
                </p>
            </div>
        </>
    )
}

export default Success