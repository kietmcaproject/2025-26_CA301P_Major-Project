// Framer Motion Animation Configuration
// Reusable animation variants for consistent animations across the app

// Page transition variants
export const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
}

// Fade in variants
export const fadeIn = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { opacity: 0 }
}

// Slide up variants
export const slideUp = {
    initial: { opacity: 0, y: 30 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
}

// Scale variants for cards
export const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    }
}

// Stagger container for list items
export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

// Stagger item variants
export const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    }
}

// Tab content transition
export const tabContent = {
    initial: { opacity: 0, x: 20 },
    animate: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: {
        opacity: 0,
        x: -20,
        transition: { duration: 0.2, ease: 'easeIn' }
    }
}

// Button hover/tap animations
export const buttonTap = {
    scale: 0.98
}

export const buttonHover = {
    scale: 1.02,
    transition: { duration: 0.2 }
}

// Card hover animation
export const cardHover = {
    y: -8,
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
}

// Dialog/Modal animation
export const modalBackdrop = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
}

export const modalContent = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 20,
        transition: { duration: 0.2 }
    }
}

// Spring animation for bouncy effects
export const springAnimation = {
    type: 'spring',
    stiffness: 300,
    damping: 20
}

// Statistics card counter animation config
export const counterAnimation = {
    duration: 1.5,
    ease: [0.4, 0, 0.2, 1]
}
