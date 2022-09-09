import React from 'react';
import { useKeycloak } from '@react-keycloak/web';
import App from './App';

const AppWrapper = ({ config }): React.ReactElement => {
    const { keycloak } = useKeycloak();
    return <>{keycloak.authenticated && <App config={config} />}</>;
};

export default AppWrapper;
