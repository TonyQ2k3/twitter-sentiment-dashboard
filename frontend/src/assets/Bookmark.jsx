

export default function Bookmark({ filled = false }) {
    if (filled) {
        return (
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path 
                d="M6.5 3C5.67 3 5 3.67 5 4.5v15.5l7-3.5 7 3.5V4.5c0-.83-.67-1.5-1.5-1.5h-11z" 
                fill="url(#bookmark-gradient)" 
                />
                <defs>
                    <linearGradient id="bookmark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                </defs>
            </svg>
        )
    }
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M5 4.5C5 3.67 5.67 3 6.5 3h11c.83 0 1.5.67 1.5 1.5V20l-7-3.5L5 20V4.5z" 
            stroke="url(#bookmark-stroke-gradient)" 
        />
        <defs>
            <linearGradient id="bookmark-stroke-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
        </defs>
        </svg>
    )
}