import React, { useState, useRef, useEffect } from 'react';

interface ComparisonSliderProps {
    beforeImage: string;
    afterImage: string;
    beforeLabel?: string;
    afterLabel?: string;
    className?: string;
}

const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
    beforeImage,
    afterImage,
    beforeLabel = "2D Plan",
    afterLabel = "AI Render",
    className = ""
}) => {
    const [sliderPos, setSliderPos] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPos(percent);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        handleMove(e.touches[0].clientX);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isResizing) return;
        handleMove(e.clientX);
    };

    const handleMouseDown = () => setIsResizing(true);
    const handleMouseUp = () => setIsResizing(false);

    useEffect(() => {
        const globalMouseUp = () => setIsResizing(false);
        window.addEventListener('mouseup', globalMouseUp);
        window.addEventListener('touchend', globalMouseUp);
        return () => {
            window.removeEventListener('mouseup', globalMouseUp);
            window.removeEventListener('touchend', globalMouseUp);
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className={`comparison-slider ${className}`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
        >
            {/* Base Image (After) */}
            <div className="image-after">
                <img src={afterImage} alt={afterLabel} />
                <div className="label after">{afterLabel}</div>
            </div>

            {/* Clipped Image (Before) */}
            <div 
                className="image-before" 
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <img src={beforeImage} alt={beforeLabel} />
                <div className="label before">{beforeLabel}</div>
            </div>

            {/* Slider Handle */}
            <div 
                className="slider-handle" 
                style={{ left: `${sliderPos}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="handle-line" />
                <div className="handle-button">
                    <div className="arrows" />
                </div>
            </div>
        </div>
    );
};

export default ComparisonSlider;
