import React from 'react';

/**
 * Avatar component to display user profile picture or initials.
 * 
 * @param {Object} props
 * @param {string} props.src - URL of the profile picture
 * @param {string} props.name - Name of the user (used for initials and alt text)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size class (default: 'w-10 h-10')
 * @param {string} props.fallbackColor - Background color for initials (default: 'bg-primary')
 */
export default function Avatar({
    src,
    name = 'User',
    className = '',
    size = 'w-10 h-10',
    fallbackColor = 'bg-primary'
}) {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    // Handle relative URLs
    const imageUrl = src && !src.startsWith('http')
        ? `${import.meta.env.VITE_API_URL || 'https://task-manger-backend-z2yz.onrender.com/api'}${src}`
        : src;

    return (
        <div className={`${size} ${fallbackColor} rounded-full flex items-center justify-center overflow-hidden ${className}`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('avatar-fallback-active');
                    }}
                />
            ) : (
                <span className="text-white font-medium text-sm">
                    {initials}
                </span>
            )}
            {/* Fallback text if image fails to load and is hidden */}
            {imageUrl && (
                <span className="hidden avatar-fallback-text text-white font-medium text-sm">
                    {initials}
                </span>
            )}
            <style>{`
        .avatar-fallback-active .avatar-fallback-text {
          display: inline;
        }
      `}</style>
        </div>
    );
}
