'use client'

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const CookieConsent = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const hasAcceptedCookies = localStorage.getItem('cookiesAccepted');

        // If not, show the popup after a short delay
        if (!hasAcceptedCookies) {
            const timer = setTimeout(() => {
                setVisible(true);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookiesAccepted', 'true');
        setVisible(false);
    };

    const declineCookies = () => {
        // You might want to handle declined cookies differently
        localStorage.setItem('cookiesDeclined', 'true');
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white shadow-lg border-t border-gray-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 pr-4">
                        <h3 className="text-lg font-semibold mb-1">Cookie Notice</h3>
                        <p className="text-gray-600 text-sm">
                            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            className="text-gray-700 border-gray-300"
                            onClick={declineCookies}
                        >
                            Decline
                        </Button>
                        <Button
                            className="bg-gradient-to-l from-purple-800 to-fuchsia-600 text-white font-medium"
                            onClick={acceptCookies}
                        >
                            Accept All
                        </Button>
                    </div>

                    <button
                        onClick={() => setVisible(false)}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;