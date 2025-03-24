'use client'

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

export function AutoCarosel() {
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: false })
    )


    const images = [
        {

            text: 'Welcome to Shopr, glad to have you',
            img1: '/electronics.webp',
            img2: '/motor.webp',
            text1: 'Electronics',
            text2: 'Automotive',

        },
        {

            text: 'Variety Gift Sets',
            img1: '/banner1.png',
            img2: '/banner2.png',
            text1: 'Shoes',
            text2: 'Seakers',
        },
        {

            text: 'Have a Great Ghopping Gxperience',
            img1: '/banner3.png',
            img2: '/banner4.png',
            text1: 'Gadgets',
            text2: 'Utensiles',
        },

    ]

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full mx-auto"
            // onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {images.map((image, index) => (
                    <CarouselItem key={index}>
                        <div className='w-full'>
                            <Card className='overflow-hidden'>
                                <CardContent className="p-0 w-full">
                                    <div className="w-full flex flex-col md:flex-row items-center gap-2 justify-between min-h-44 rounded-b-2xl bg-gradient-to-r from-purple-700 to-fuchsia-400 text-white p-5">

                                        <div className="  w-[90%] mx-auto p-5">

                                            {/* <div className="h-4 w-4 rounded-full animate-pulse bg-gradient-to-r from-red-700 to-pink-400 absolute right-20 top-4"></div> */}
                                            <p className="font-bold text-3xl">{image.text}</p>




                                        </div>

                                        <div className="flex  items-center justify-center  w-full  overflow-hidden">
                                            <div>
                                                <img src={image.img1} alt="" className="h-40 md:h-52 object-contain" />
                                                <p className="text-center">  {image.text1}</p>
                                            </div>

                                            <div className="">
                                                <img src={image.img2} alt="" className="h-40 md:h-52 object-contain" />
                                                <p className="text-center">{image.text2}</p>
                                            </div>

                                        </div>


                                    </div>
                                </CardContent>


                            </Card>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {/* <CarouselPrevious />
            <CarouselNext /> */}
        </Carousel>
    )
}
