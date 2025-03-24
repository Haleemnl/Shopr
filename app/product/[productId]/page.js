
import ProductDetails from '@/components/ProductDetails'
import React from 'react'

const page = async ({ params }) => {


    const { productId } = await params
    return (
        <div>
            {/* page {productId} */}

            <ProductDetails
                productId={productId}
            />
        </div>
    )
}

export default page   