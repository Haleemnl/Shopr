
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Minus, Plus, Trash2, Download } from "lucide-react";
import { useCart } from "./CartProvider";
import Image from "next/image";
import { FlutterWaveButton, closePaymentModal } from 'flutterwave-react-v3'; //flutterwave
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function CartModal({ isOpen, onClose }) {
    const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const { user } = useUser();
    const supabase = createClient()

    // Payment state
    const [paymentResponse, setPaymentResponse] = useState(null);

    // Stores purchased items separately so they remain visible after cart is cleared
    const [purchasedItems, setPurchasedItems] = useState([]);
    // Store the total price at the time of purchase
    const [purchaseTotal, setPurchaseTotal] = useState(0);

    // Separate state for receipt popup
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);

    const mail = user?.emailAddresses[0].emailAddress;

    // Function to download receipt as text file
    const downloadReceipt = () => {
        // Create receipt content
        const receiptDate = new Date().toLocaleString();
        let receiptContent = `
            =================================================
                            PURCHASE RECEIPT                
            =================================================
            Date: ${receiptDate}
            Transaction Reference: ${paymentResponse?.tx_ref}
            Customer: ${user?.fullName}
            Email: ${mail}

            ITEMS PURCHASED:
            -------------------------------------------------
            `;

        // Add each item with its price
        purchasedItems.forEach(item => {
            receiptContent += `${item.name} ${item.quantity > 1 ? `(x${item.quantity})` : ''}\t$${(item.price * (item.quantity || 1)).toFixed(2)}\n`;
        });

        receiptContent += `
            -------------------------------------------------
            TOTAL AMOUNT PAID: $${purchaseTotal.toFixed(2)}
            =================================================
                
            Thank you for your purchase!
            `;

        // Create a blob from the content
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${paymentResponse?.tx_ref || Date.now()}.txt`;
        document.body.appendChild(link);
        link.click();

        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
    };

    // Flutterwave payment configuration
    const config = {
        public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_SECRET_KEY,
        tx_ref: Date.now(),
        amount: totalPrice,
        currency: 'USD',
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: mail,
            name: user?.fullName,
        },
        customizations: {
            title: 'Store Purchase',
            description: 'Payment for items in your cart',
            logo: 'Shopr',
        },
    };

    // Success notification function using Sonner
    const showSuccessNotification = () => {
        toast.success('Payment Successful!', {
            description: 'Your receipt is ready.',
            duration: 5000,
        });
    };

    //supabase
    const addOrders = async (response) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([
                    {
                        email: mail,
                        name: user?.fullName,
                        total_amount: totalPrice,
                        tx_ref: response.tx_ref,
                        transaction_id: response.transaction_id,
                        orders: JSON.stringify(items.map(item => ({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            image_url: item.image_url,
                            user_id: user?.id,
                        }))),
                        status: response.status,
                    },
                ])
                .select();

            if (error) {
                console.error("Error saving order to Supabase:", error);
                toast.error('Failed to save order details');
                throw error;
            }

            console.log("Order saved successfully:", data);
            return data;
        } catch (err) {
            console.error("Exception saving order:", err);
            toast.error('Failed to save order details');
        }
    };

    const fwConfig = {
        ...config,
        text: 'Checkout',
        callback: async (response) => {
            console.log(response);
            if (response.status === "successful") {
                try {
                    // Save order to Supabase
                    await addOrders(response);

                    // Save a copy of the items and total before clearing the cart
                    setPurchasedItems([...items]);
                    setPurchaseTotal(totalPrice);
                    setPaymentResponse(response);

                    clearCart();

                    // Close cart modal
                    onClose();

                    // Show success notification with Sonner
                    showSuccessNotification();

                    // Open the receipt modal
                    setReceiptModalOpen(true);
                } catch (error) {
                    console.error("Error processing successful payment:", error);
                    // Still show receipt even if database save fails
                    setPurchasedItems([...items]);
                    setPurchaseTotal(totalPrice);
                    setPaymentResponse(response);
                    setReceiptModalOpen(true);
                }
            }
            closePaymentModal();
        },

    };

    const handleCloseReceiptModal = () => {
        setReceiptModalOpen(false);
    };

    return (
        <>
            {/* Cart Modal */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Your Shopping Cart</DialogTitle>
                    </DialogHeader>

                    {items.length === 0 ? (
                        <div className="py-6 text-center text-muted-foreground">Your cart is empty</div>
                    ) : (
                        <>
                            <div className="space-y-4 max-h-[60vh] overflow-auto py-4">
                                {items.map((item) => (
                                    <CartItem
                                        key={item.id}
                                        item={item}
                                        onRemove={removeFromCart}
                                        onUpdateQuantity={updateQuantity}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col gap-4 pt-4 border-t">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total:</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>

                                {/* modal buttons */}
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1 cursor-pointer" onClick={onClose}>
                                        Continue Shopping
                                    </Button>

                                    {/* payment button */}
                                    <Button asChild className="flex-1 cursor-pointer bg-gradient-to-l from-purple-800 to-fuchsia-600">
                                        <FlutterWaveButton {...fwConfig} />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>


            {/* Separate Receipt Modal */}
            <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Payment Receipt</DialogTitle>
                    </DialogHeader>

                    <div className='bg-white rounded-lg p-6 shadow-md max-w-md mx-auto'>
                        <h1 className='text-2xl font-bold text-center mb-4 text-purple-800'>Payment Complete</h1>
                        <div className='mb-6 p-3 bg-gray-50 rounded-md'>
                            <p className='font-medium mb-1'>Thank you for your purchase, {user?.fullName}!</p>
                            <p className='text-sm text-gray-600'>Transaction Reference: {paymentResponse?.tx_ref}</p>
                            <p className='text-sm text-gray-600'>Date: {new Date().toLocaleString()}</p>
                        </div>

                        <div className='border-t border-b border-gray-200 py-4 my-4'>
                            <p className='font-medium mb-2'>Items Purchased:</p>
                            <ul className='space-y-2'>
                                {purchasedItems.map((item) => (
                                    <li key={item.id} className='flex justify-between'>
                                        <span>{item.name} {item.quantity > 1 && `(x${item.quantity})`}</span>
                                        <span className='font-medium'>${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className='flex justify-between font-bold text-lg mb-4'>
                            <span>Total Amount Paid:</span>
                            <span>${purchaseTotal.toFixed(2)}</span>
                        </div>

                        <p className='text-sm text-gray-600 mt-4 text-center'>
                            A receipt has been sent to your email: <span className="text-purple-800 font-bold"> {mail} </span>
                        </p>

                        {/* Receipt download and close buttons */}
                        <div className="flex flex-col md:flex-row gap-2 mt-6">
                            <Button
                                className='flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 cursor-pointer'
                                onClick={downloadReceipt}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Receipt
                            </Button>

                            <Button
                                className='flex-1 bg-gradient-to-l from-purple-800 to-fuchsia-600 rounded-lg text-white font-medium cursor-pointer'
                                onClick={handleCloseReceiptModal}
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

function CartItem({ item, onRemove, onUpdateQuantity }) {
    return (
        <div className="flex gap-4 items-center">
            {/* product image */}
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                <Image src={item.image_url} alt={item.name} height={300} width={400} className="h-full w-full object-fit p-2" />
            </div>

            <div className="flex flex-1 flex-col">
                {/* product name&price */}
                <div className="flex justify-between text-base font-medium">
                    <h3>{item.name}</h3>
                    <p className="ml-4">${item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    {/* add and remove btn */}
                    <div className="flex items-center border rounded-md">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* delete button */}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onRemove(item.id)}>
                        <Trash2 className="h-4 w-4 cursor-pointer" />
                    </Button>
                </div>
            </div>
        </div>
    );
}