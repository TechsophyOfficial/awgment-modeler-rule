import React from 'react';
import Wrapper from 'wrapper';
import ContextProvider from './ContextProvider';
import ThemeProvider from 'contexts/themeContext/ThemeState';
import Layout from 'components/layout';
import { StylesProvider, createGenerateClassName } from '@mui/styles';
import { StyledEngineProvider } from '@mui/material';

const App = ({ history }): React.ReactElement => {
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
                        <Wrapper>
                            <Layout />
                        </Wrapper>
                    </ContextProvider>
                </ThemeProvider>
            </StylesProvider>
        </StyledEngineProvider>
    );
};

export default App;
