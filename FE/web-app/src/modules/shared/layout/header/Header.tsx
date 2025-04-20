import React, { useEffect, useState } from "react"
import './Header.css'
import { defaultImageUrl, NextOrPrevBtn } from "../.."

export const Header = () => {
    const [current, setCurrent] = useState(0); // Zero-based index

    const banners = [
        {
            id: 1,
            url: 'https://res.cloudinary.com/dvk5yt0oi/image/upload/v1744384919/zshop/images/wmuqz6rsmy5lvmbp8fdh.png',
            label: 'Banner 1',
        },
        {
            id: 2,
            url: 'https://res.cloudinary.com/dvk5yt0oi/image/upload/v1744384919/zshop/images/rsz2izzusfeun0otkvuk.webp',
            label: 'Banner 2',
        },
        {
            id: 3,
            url: 'https://res.cloudinary.com/dvk5yt0oi/image/upload/v1744384919/zshop/images/i7foyqw5r2vtffqwzzuv.webp',
            label: 'Banner 3',
        },
        {
            id: 4,
            url: 'https://res.cloudinary.com/dvk5yt0oi/image/upload/v1744384919/zshop/images/iubj1aovqjfpfre955cy.webp',
            label: 'Banner 4',
        },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners.length]);

    // Handle manual navigation
    const handlePrev = () => {
        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const handleNext = () => {
        setCurrent((prev) => (prev + 1) % banners.length);
    };

    const handleIndicatorClick = (index: number) => {
        setCurrent(index);
    };

    return (
        <div className="header mb-4 position-relative">
            <div 
                id="banner" 
                className="carousel shadow-sm slide" data-bs-ride="carousel"
            >
                <div className="carousel-indicators">
                    {banners.map((banner, index) => (
                        <button
                            key={banner.id}
                            type="button"
                            data-bs-target="#banner"
                            data-bs-slide-to={index}
                            className={index === current ? 'active' : ''}
                            aria-label={`Slide ${index + 1}`}
                            onClick={() => handleIndicatorClick(index)}
                        />
                    ))}
                </div>
                <div className="carousel-inner">
                    {banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`carousel-item ${index === current ? 'active' : ''}`}
                        >
                            <img
                                src={banner.url}
                                className="d-block w-100"
                                alt={banner.label}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="position-absolute top-50 start-0 translate-middle">
                <NextOrPrevBtn type="prev" onClick={handleNext}/>
            </div>
            <div className="position-absolute top-50 start-100 translate-middle">
                <NextOrPrevBtn type="next" onClick={handleNext}/>
            </div>
        </div>
    );
};