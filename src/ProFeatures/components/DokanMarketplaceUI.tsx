import { useEffect, useRef, useState } from '@wordpress/element';
import {
    iftsyImg,
    bidCuriousImg,
    bootstrapImg,
    designAddictImg,
    parsiankalaImg,
    zakartoImg,
    avatar1,
    avatar2,
    avatar3,
    avatar4,
    avatar5,
    avatar6,
    avatar7,
    avatar8,
    avatar9,
    avatar10,
    avatar11,
    g2Logo,
    trustpilotLogo,
    capterraLogo,
    wordpressLogo,
} from '../Images';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MarketplaceCard from './MarketplaceCard';
import { __ } from '@wordpress/i18n';

function DokanMarketplaceUI() {
    const [ activeTab, setActiveTab ] = useState( 'Marketplace' );
    const [ canScrollLeft, setCanScrollLeft ] = useState( false );
    const [ canScrollRight, setCanScrollRight ] = useState( false );
    const [ isScrolling, setIsScrolling ] = useState( false );
    const scrollRef = useRef< HTMLDivElement >( null );

    const marketplaces = [
        {
            name: 'Ifesty',
            country: 'Brazil',
            flag: '🇧🇷',
            img: iftsyImg,
            siteLink: 'https://ifesty.com.br/?v=3cb56c81f4b8',
        },
        {
            name: 'BidCurios',
            country: 'India',
            flag: '🇮🇳',
            img: bidCuriousImg,
            siteLink: 'https://www.bidcurios.com/',
        },
        {
            name: 'Bootstrap',
            country: 'USA',
            flag: '🇺🇸',
            img: bootstrapImg,
            siteLink: 'https://themes.getbootstrap.com/',
        },
        {
            name: 'Parsiankala',
            country: 'USA',
            flag: '🇺🇸',
            img: parsiankalaImg,
            siteLink: 'https://parsiankala.com/',
        },
        {
            name: 'DesignAddict',
            country: 'USA',
            flag: '🇺🇸',
            img: designAddictImg,
            siteLink: 'https://designaddict.com/',
        },
        {
            name: 'Zakarto',
            country: 'USA',
            flag: '🇺🇸',
            img: zakartoImg,
            siteLink: 'https://www.zakarto.com/',
        },
    ];

    const testimonials = [
        {
            name: 'christian d.',
            role: 'SEO, Small business',
            content:
                'As a Webmaster in Argentina for 25+ years, I’ve tested all the multi-vendor WordPress plugins and this is by far the best.',
            img: avatar1,
            logo: g2Logo,
            noScale: true,
        },
        {
            name: 'upcodestudios',
            role: 'Self-employed',
            content:
                'Dokan is the best multivendor solution I’ve seen in 10 years of web development.',
            img: avatar2,
            logo: wordpressLogo,
        },
        {
            name: 'Jonathan D.',
            role: 'Sales assistant Retail',
            content:
                'Dokan made my dream a reality. For a small yearly cost, it offers features worth thousandsa true game-changer.',
            img: avatar3,
            logo: capterraLogo,
        },
        {
            name: 'Neels V.',
            role: 'Founder, Small business',
            content: 'Perfect for adding services offerings to WooCommerce.',
            img: avatar4,
            logo: g2Logo,
            noScale: true,
        },
        {
            name: 'asmaraldn',
            role: 'Self-employed',
            content: 'Dokan Lite has been a game-changer for my marketplace!',
            img: avatar5,
            logo: wordpressLogo,
        },
        {
            name: 'Melvin R',
            role: 'Desarrollador web',
            content:
                'If you want the ease of WordPress with WooCommerce’s flexibility, this is the best plugin out there.',
            img: avatar6,
            logo: capterraLogo,
        },
        {
            name: 'cheazeh',
            role: 'Self-employed',
            content: 'Been using it for over a yearhands down, the best!',
            img: avatar7,
            logo: wordpressLogo,
        },
        {
            name: 'Karisa Joshua',
            role: 'Self-employed',
            content:
                'Incredible experience with Dokan’s serviceprofessional, kind, and truly went above and beyond.',
            img: avatar8,
            logo: trustpilotLogo,
        },
        {
            name: 'Corrado G.',
            role: 'Titolare',
            content:
                'Dokan has improved a lot over the years and made it easy for me to build a marketplace.',
            img: avatar9,
            logo: capterraLogo,
        },
        {
            name: 'Omar Wyllie',
            role: 'St. Vincent & Grenadines',
            content:
                'Just installed a few hours agooff to a good start! Support was fast and helpful via live chat.',
            img: avatar10,
            logo: trustpilotLogo,
        },
        {
            name: 'franklinlucas',
            role: 'Self-employed',
            content:
                'Amazing plugin. Easy to use and very well-organized team.',
            img: avatar11,
            logo: wordpressLogo,
        },
    ];

    const tabs = [ 'Marketplace', 'Testimonial' ];

    const checkScrollability = () => {
        if ( scrollRef.current ) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const hasOverflow = scrollWidth > clientWidth + 1; // Adding small buffer for precision

            setCanScrollLeft( scrollLeft > 0 );
            setCanScrollRight(
                hasOverflow && scrollLeft < scrollWidth - clientWidth - 5
            );
        }
    };

    const scrollToNextCard = ( direction: 'left' | 'right' ) => {
        if ( isScrolling || ! scrollRef.current ) {
            return;
        }

        setIsScrolling( true );
        // Calculate card width based on active tab
        let cardWidth = activeTab === 'Marketplace' ? 274.51 + 24 : 220 + 24; // Card width + gap (24px from gap-6)

        const currentScreenWidth = window.innerWidth;
        if ( currentScreenWidth < 768 ) {
            cardWidth = scrollRef.current.offsetWidth + 24;
        }

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

    // Reset and check when tab changes
    useEffect( () => {
        // Clear any ongoing scroll
        setIsScrolling( false );
        setCanScrollLeft( false );
        setCanScrollRight( false );

        // Reset scroll position
        if ( scrollRef.current ) {
            scrollRef.current.scrollLeft = 0;
        }

        // Check scrollability after content renders - multiple attempts with increasing delays
        setTimeout( () => checkScrollability(), 100 );
        setTimeout( () => checkScrollability(), 300 );
        setTimeout( () => checkScrollability(), 600 );
        setTimeout( () => checkScrollability(), 1000 );
    }, [ activeTab ] );

    // Initial setup
    useEffect( () => {
        // Force a recheck after component mounts
        const checkAfterMount = () => {
            setTimeout( () => checkScrollability(), 200 );
            setTimeout( () => checkScrollability(), 500 );
            setTimeout( () => checkScrollability(), 1000 );
            setTimeout( () => checkScrollability(), 1500 );
        };

        checkAfterMount();

        // Add window resize listener
        const handleResize = () => {
            setTimeout( () => checkScrollability(), 100 );
        };

        window.addEventListener( 'resize', handleResize );

        return () => {
            window.removeEventListener( 'resize', handleResize );
        };
    }, [] );

    const data = activeTab === 'Marketplace' ? marketplaces : testimonials;

    return (
        <div>
            { /* Tabs */ }
            <div className="flex justify-center items-center gap-8 mb-6">
                { tabs.map( ( tab ) => (
                    <button
                        key={ tab }
                        onClick={ () => setActiveTab( tab ) }
                        className={ `text-base md:text-lg font-medium transition relative ${
                            activeTab === tab
                                ? 'text-purple-700'
                                : 'text-gray-500'
                        }` }
                    >
                        { tab }
                        { activeTab === tab && (
                            <span className="absolute left-0 -bottom-1 h-[2px] w-full bg-purple-700" />
                        ) }
                    </button>
                ) ) }
            </div>

            { /* Title */ }
            <div className="text-center mb-4">
                <h2 className="font-bold text-[24px] leading-[130%] tracking-[0%] text-center inline-block">
                    { activeTab === 'Marketplace'
                        ? __(
                              'Dokan Powered Marketplace Across the Globe',
                              'dokan-lite'
                          )
                        : __(
                              'Great People, Great Minds Choose Dokan',
                              'dokan-lite'
                          ) }
                </h2>
            </div>

            { /* Cards Container */ }
            <div className="relative">
                { /* Scroll Buttons */ }
                <div className="flex absolute md:!relative z-10 justify-between md:!justify-end w-full h-2/4 md:!h-auto items-end md:!items-center md:gap-2 mb-8 mt-5 md:!-mt-12">
                    <button
                        onClick={ () => handleScrollClick( 'left' ) }
                        disabled={ ! canScrollLeft || isScrolling }
                        className={ `w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200 shadow-[0_4px_20px_0px_#00000029] md:shadow-none ${
                            canScrollLeft && ! isScrolling
                                ? 'border-[#7C3AED] bg-white text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white cursor-pointer'
                                : 'border-gray-300 bg-white text-gray-400 cursor-not-allowed'
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
                        className={ `w-8 h-8 flex items-center justify-center rounded-full border transition-all duration-200 shadow-[0_4px_20px_0px_#00000029] md:shadow-none ${
                            canScrollRight && ! isScrolling
                                ? 'border-[#7C3AED] bg-white text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white cursor-pointer'
                                : 'border-gray-300 bg-white text-gray-400 cursor-not-allowed'
                        }` }
                        aria-label="Scroll right"
                    >
                        <span className="text-lg font-bold">
                            <ChevronRight />
                        </span>
                    </button>
                </div>
                <div
                    ref={ scrollRef }
                    className="overflow-x-auto flex gap-6 scrollbar-hide scroll-auto touch-pan-x"
                    onScroll={ checkScrollability } // Add scroll event listener
                >
                    { data.map( ( item, index ) => (
                        <div
                            key={ `${ activeTab }-${ index }` }
                            className="flex-shrink-0 w-full md:!w-auto" // Changed from snap-start shrink-0
                        >
                            { activeTab === 'Marketplace' ? (
                                <MarketplaceCard item={ item } />
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between w-full md:!w-[220px] h-[214px] opacity-100">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={ item.img }
                                                alt={ item.name }
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                            <div>
                                                <h4 className="text-[14px] font-semibold text-gray-900">
                                                    { item.name }
                                                </h4>
                                                <p className="text-[12px] text-gray-500">
                                                    { item.role }
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-[12px] text-gray-600 leading-[140%]">
                                            { item.content }
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center mt-auto pt-3">
                                        <div className="w-12 h-8">
                                            <img
                                                src={ item.logo }
                                                alt="Logo"
                                                className={ `w-full h-full object-contain ${
                                                    item.noScale
                                                        ? 'ml-[-10px]'
                                                        : 'scale-[1.3] ml-[15px]'
                                                }` }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) }
                        </div>
                    ) ) }
                </div>
            </div>
        </div>
    );
}
export default DokanMarketplaceUI;
