import React, { useContext, useEffect } from 'react';
import ThemeContext from 'contexts/themeContext/theme-context';
import ConfirmationState from 'contexts/confirmationContext/ConfirmationState';
import NotificationState from 'contexts/notificationContext/NotificationState';
import SpinnerState from 'contexts/spinnerContext/SpinnerState';
import LayoutState from 'contexts/layoutContext/LayoutState';
import { getSelectedTheme, ThemeProps } from 'services/ThemeService';
import RuleState from 'contexts/ruleContext/RuleState';
import TabState from 'contexts/tabContext/TabState';
import { ThemeProvider, Theme } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material';
import AppConfig from '../src/appConfig';

declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface DefaultTheme extends Theme {}
}

const ContextProvider: React.FC = ({ children }) => {
    const { theme, updateTheme } = useContext(ThemeContext);
    const appData = useContext<any>(AppConfig);

    useEffect(() => {
        const setTheme = async () => {
            const GATEWAY_URL = `${appData.apiGatewayUrl}`;
            const selectedThemeRes = await getSelectedTheme(GATEWAY_URL);
            if (selectedThemeRes.success) {
                const selectedTheme = selectedThemeRes.data as ThemeProps;
                updateTheme(selectedTheme);
            }
        };
        setTheme();
        // eslint-disable-next-line
    }, []);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
                <SpinnerState>
                    <ConfirmationState>
                        <NotificationState>
                            <LayoutState>
                                <RuleState>
                                    <TabState>{children}</TabState>
                                </RuleState>
                            </LayoutState>
                        </NotificationState>
                    </ConfirmationState>
                </SpinnerState>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

export default ContextProvider;
