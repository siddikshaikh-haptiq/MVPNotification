import {useState, useEffect} from 'react';
import {Dimensions, ScaledSize} from 'react-native';

interface ResponsiveBreakpoints {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

const breakpoints: ResponsiveBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({window}) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const isSmall = dimensions.width < breakpoints.sm;
  const isMedium = dimensions.width >= breakpoints.sm && dimensions.width < breakpoints.md;
  const isLarge = dimensions.width >= breakpoints.md && dimensions.width < breakpoints.lg;
  const isXLarge = dimensions.width >= breakpoints.lg;

  return {
    width: dimensions.width,
    height: dimensions.height,
    isSmall,
    isMedium,
    isLarge,
    isXLarge,
    breakpoints,
  };
};

