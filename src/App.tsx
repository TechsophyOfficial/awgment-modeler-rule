import React from 'react';
import Wrapper from 'wrapper';
import ContextProvider from './ContextProvider';
import ThemeProvider from 'contexts/themeContext/ThemeState';
import Layout from 'components/layout';
import { StylesProvider, createGenerateClassName } from '@mui/styles';
import { StyledEngineProvider } from '@mui/material';
import AppConfig from 'appConfig';

const App = ({ config }): React.ReactElement => {
    const generateClassName = createGenerateClassName({
        // disableGlobal: true,
        // productionPrefix: 'prod_rule_mfe-',
        seed: 'ruleMFE',
    });
    return (
        <StyledEngineProvider injectFirst>
            <StylesProvider generateClassName={generateClassName}>
                <ThemeProvider>
                    <ContextProvider>
                        <AppConfig.Provider value={config}>
                            <Wrapper>
                                <Layout />
                            </Wrapper>
                        </AppConfig.Provider>
                    </ContextProvider>
                </ThemeProvider>
            </StylesProvider>
        </StyledEngineProvider>
    );
};

export default App;
