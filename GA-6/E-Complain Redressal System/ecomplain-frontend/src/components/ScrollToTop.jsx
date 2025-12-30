import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop Component
 * Automatically scrolls to top of page on route change
 */
function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        })
    }, [pathname])

    return null
}

export default ScrollToTop
