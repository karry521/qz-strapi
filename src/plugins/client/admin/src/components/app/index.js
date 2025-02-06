import { useEffect } from 'react'

const App = () => {

    useEffect(() => {
        const handHeight = () => {
            const vh = window.innerHeight * 0.01

            document.documentElement.style.setProperty('--vh', `${vh}px`)
        }

        handHeight()

        window.addEventListener('resize', handHeight)

        return () => {
            window.removeEventListener('resize', handHeight)
        }
    }, [])

    return null
}

export default App