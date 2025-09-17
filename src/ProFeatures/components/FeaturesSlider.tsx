import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect } from '@wordpress/element';
import FeatureCard from './FeatureCard';
import {
    shippingImg,
    paymentImg,
    smartImg,
    storeImg,
    brandingImg,
    supportImg,
} from '../Images';
import { __ } from '@wordpress/i18n';

function FeaturesSlider() {
    const features = [
        {
            title: __( 'Effortless Shipping Management', 'dokan-lite' ),
            description: __(
                'Let vendors set flexible shipping rates by distance, weight, price, or items.',
                'dokan-lite'
            ),
            image: shippingImg,
        },
        {
            title: __( 'Popular Payment Gateways', 'dokan-lite' ),
            description: __(
                'Accept payments with popular gateways like PayPal, Stripe, Mangopay, Razorpay, and more.',
                'dokan-lite'
            ),
            image: paymentImg,
        },
        {
            title: __( 'Smart Product Management', 'dokan-lite' ),
            description: __(
                'Give vendors bulk edit tools, featured ads, and addons for smarter selling.',
                'dokan-lite'
            ),
            image: smartImg,
        },
        {
            title: __( 'Advanced Store Management', 'dokan-lite' ),
            description: __(
                'Increase engagement with store follows and builtin ticket based support.',
                'dokan-lite'
            ),
            image: storeImg,
        },
        {
            title: __( 'Customizable Branding', 'dokan-lite' ),
            description: __(
                'Customize vendor dashboards with unique colors and seamless theme support.',
                'dokan-lite'
            ),
            image: brandingImg,
        },
        {
            title: __( '24/7 Super Fast Premium Support', 'dokan-lite' ),
            description: __(
                'Enjoy 24/7 premium support from experts to keep your marketplace running smooth.',
                'dokan-lite'
            ),
            image: supportImg,
        },
    ];

    const [ canScrollLeft, setCanScrollLeft ] = useState( false );
    const [ canScrollRight, setCanScrollRight ] = useState( true );
    const [ isScrolling, setIsScrolling ] = useState( false );
    const scrollRef = useRef< HTMLDivElement >( null );

    const checkScrollability = () => {
        if ( scrollRef.current ) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft( scrollLeft > 0 );
            setCanScrollRight( scrollLeft < scrollWidth - clientWidth - 5 ); // Adding small buffer
        }
    };

    const scrollToNextCard = ( direction: 'left' | 'right' ) => {
        if ( isScrolling || ! scrollRef.current ) {
            return;
        }

        setIsScrolling( true );
        const cardWidth = 258 + 24; // Card width (258px) + gap (24px from space-x-6)
        const scrollAmount = direction === 'right' ? cardWidth : -cardWidth;

        // Custom smooth scrolling animation
        const startScrollLeft = scrollRef.current.scrollLeft;
        const targetScrollLeft = startScrollLeft + scrollAmount;
        const duration = 400; // Longer duration for more noticeable smoothness
        const startTime = performance.now();

        const animateScroll = ( currentTime ) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min( elapsed / duration, 1 );

            // Easing function for smooth animation (ease-out)
            const easeOut = 1 - Math.pow( 1 - progress, 3 );

            if ( scrollRef.current ) {
                scrollRef.current.scrollLeft =
                    startScrollLeft + scrollAmount * easeOut;
            }

            if ( progress < 1 ) {
                requestAnimationFrame( animateScroll );
            } else {
                // Animation complete
                setIsScrolling( false );
                checkScrollability();
            }
        };

        requestAnimationFrame( animateScroll );
    };

    const handleScrollClick = ( direction: 'left' | 'right' ) => {
        if ( isScrolling ) {
            return;
        }
        scrollToNextCard( direction );
    };

    useEffect( () => {
        checkScrollability();
    }, [] );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl leading-[130%] tracking-normal">
                    Curated Features for Your Thriving Marketplace
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={ () => handleScrollClick( 'left' ) }
                        disabled={ ! canScrollLeft || isScrolling }
                        className={ `w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200 ${
                            canScrollLeft && ! isScrolling
                                ? 'border-[#7C3AED] bg-white text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white cursor-pointer'
                                : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                        }` }
                        aria-label="Scroll left"
                    >
                        <span className="text-lg font-bold">
                            <ChevronLeft />
                        </span>
                    </button>
                    <button
                        onClick={ () => handleScrollClick( 'right' ) }
                        disabled={ ! canScrollRight || isScrolling }
                        className={ `w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200 ${
                            canScrollRight && ! isScrolling
                                ? 'border-[#7C3AED] bg-white text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white cursor-pointer'
                                : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                        }` }
                        aria-label="Scroll right"
                    >
                        <span className="text-lg font-bold">
                            <ChevronRight />
                        </span>
                    </button>
                </div>
            </div>

            <div
                ref={ scrollRef }
                className="flex overflow-x-auto space-x-6 scrollbar-hide"
            >
                { features.map( ( feature, index ) => (
                    <FeatureCard key={ index } { ...feature } />
                ) ) }
            </div>
        </div>
    );
}

export default FeaturesSlider;
