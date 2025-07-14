import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

export function AnimatedPage({ children, className = '' }: AnimatedPageProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`flex-1 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Özel animasyonlar için farklı varyantlar
export const slideVariants = {
  initial: {
    x: -100,
    opacity: 0
  },
  in: {
    x: 0,
    opacity: 1
  },
  out: {
    x: 100,
    opacity: 0
  }
};

export const scaleVariants = {
  initial: {
    scale: 0.8,
    opacity: 0
  },
  in: {
    scale: 1,
    opacity: 1
  },
  out: {
    scale: 0.8,
    opacity: 0
  }
};

export const fadeVariants = {
  initial: {
    opacity: 0
  },
  in: {
    opacity: 1
  },
  out: {
    opacity: 0
  }
};

// Stagger animasyonları için
export const staggerContainer = {
  initial: {},
  in: {
    transition: {
      staggerChildren: 0.1
    }
  },
  out: {}
};

export const staggerItem = {
  initial: {
    y: 20,
    opacity: 0
  },
  in: {
    y: 0,
    opacity: 1
  },
  out: {
    y: -20,
    opacity: 0
  }
};

// Hover efektleri
export const hoverScale = {
  scale: 1.05,
  transition: {
    type: 'spring',
    stiffness: 300,
    damping: 20
  }
};

export const hoverTap = {
  scale: 0.95,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 17
  }
};

// Loading spinner animasyonu
export const spinnerVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export default AnimatedPage; 