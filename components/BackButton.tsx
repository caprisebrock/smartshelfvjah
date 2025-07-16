import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  ariaLabel?: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
}

const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  ariaLabel = 'Back', 
  className = '',
  variant = 'default' 
}) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (to) {
      router.push(to);
    } else {
      // Default navigation paths based on current route
      const currentPath = router.pathname;
      
      switch (currentPath) {
        case '/my-learning':
          router.push('/');
          break;
        case '/add-resource':
          router.push('/my-learning');
          break;
        case '/progress':
          router.push('/');
          break;
        case '/ask-ai':
          router.push('/');
          break;
        case '/notes':
          router.push('/my-learning');
          break;
        case '/calendar':
          router.push('/');
          break;
        case '/history':
          router.push('/');
          break;
        case '/insights':
          router.push('/');
          break;
        case '/stats':
          router.push('/');
          break;
        case '/session':
          router.push('/');
          break;
        case '/profile':
          router.push('/');
          break;
        default:
          router.back();
      }
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'ghost':
        return 'bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 border-0 shadow-none hover:shadow-md';
      case 'outline':
        return 'bg-transparent hover:bg-gray-50 text-gray-700 hover:text-gray-900 border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md';
      default:
        return 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg';
    }
  };

  return (
    <button
      aria-label={ariaLabel}
      onClick={handleClick}
      className={`
        group inline-flex items-center justify-center w-11 h-11 rounded-xl
        font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-opacity-50
        hover:scale-105 active:scale-95
        ${getVariantStyles()}
        ${className}
      `}
      type="button"
    >
      <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
    </button>
  );
};

export default BackButton; 