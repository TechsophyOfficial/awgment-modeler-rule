import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import KeycloakWrapper from './KeycloakWrapper';

declare const window: any;

window.renderRuleMFE = (containerId: string, history) => {
    ReactDOM.render(<App history={history} />, document.getElementById(containerId));
    serviceWorker.unregister();
};

window.unmountRuleMFE = (containerId: string) => {
    ReactDOM.unmountComponentAtNode(document.getElementById(containerId) as HTMLElement);
};

if (!document.getElementById('RuleMFE-container')) {
    ReactDOM.render(<KeycloakWrapper />, document.getElementById('root'));
    serviceWorker.unregister();
}
