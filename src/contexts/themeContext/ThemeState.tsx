import React, { useReducer } from 'react';
import { INITIAL_THEME, UPDATE_THEME } from 'constants/actions';
import ThemeContext from './theme-context';
import themeReducer from './theme-reducer';
import { createTheme } from '@mui/material';

const ThemeState = ({ children }) => {
    const [themeState, dispatch] = useReducer(themeReducer, INITIAL_THEME);

    const updateTheme = (data) => {
        let newTheme = INITIAL_THEME;
        if (data) {
            newTheme = createTheme({
                typography: {
                    fontFamily: data.fonts.font,
                    fontSize: data.fonts.fontSize,
                },
                palette: {
                    mode: 'light',
                    primary: {
                        main: data.colors.textColor,
                        light: '#95CBF7',
                    },
                    secondary: {
                        main: data.colors.headerColor,
                    },
                    error: {
                        main: '#f65656',
                    },
                },
            });
        }
        dispatch({ type: UPDATE_THEME, payload: newTheme });
    };

    return (
        <ThemeContext.Provider value={{ theme: themeState, updateTheme: updateTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeState;
