import React, { useContext, useState } from 'react';

const ThemeContext = React.createContext()
const SettingsContext = React.createContext()

export function useTheme() {
    return useContext(ThemeContext)
}

export function Providers({ children }) {
    const [darkMode, setDarkMode] = useState(false)

    function toggleTheme() {
        setDarkMode(prevDarkTheme => !prevDarkTheme)
    }

    return (
        <ThemeContext.Provider value={{ darkMode: darkMode, toggleTheme: toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}