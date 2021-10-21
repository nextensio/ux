import React, { useContext, useState } from 'react';

const ThemeContext = React.createContext()
const SettingsContext = React.createContext()

export function useTheme() {
    return useContext(ThemeContext)
}

export function useSettingsChange() {
    return useContext(SettingsContext)
}

export function Providers({ children }) {
    const [darkMode, setDarkMode] = useState(false)
    const [settingsChange, updateSettingsChange] = useState(0)

    function toggleTheme() {
        setDarkMode(prevDarkTheme => !prevDarkTheme)
    }

    function toggleSettingsChange() {
        updateSettingsChange(settingsChange + 1)
    }

    return (
        <ThemeContext.Provider value={{ darkMode: darkMode, toggleTheme: toggleTheme }}>
            <SettingsContext.Provider value={{ settingsChange: settingsChange, toggleSettingsChange: toggleSettingsChange }}>
                {children}
            </SettingsContext.Provider>
        </ThemeContext.Provider>
    )
}