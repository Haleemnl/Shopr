import React from 'react';
export default function PaymentSuccess({ paymentDetails }) {
    return (
        <div className='payment-success-page'>
            {/* Success icon (use an actual icon, e.g., from FontAwesome) */}
            <div className='success-icon'>✔️</div>
            <h1>Payment Successful!</h1>
            <p>Thank you, {paymentDetails?.customer?.name}.</p>
            <div className='transaction-details'>
                <p>
                    Your payment of{' '}
                    <span>
                        {paymentDetails?.currency} {paymentDetails?.amount}
                    </span>{' '}
                    has been processed successfully.
                </p>
                <p>
                    Transaction Reference: <span>{paymentDetails?.tx_ref}</span>
                </p>
            </div>
        </div>
    );
}