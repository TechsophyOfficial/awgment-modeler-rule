import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import KeycloakWrapper from './KeycloakWrapper';

declare const window: any;

window.renderRuleMFE = (containerId: string) => {
    fetch('../config.json')
        .then(async (r) => r.json())
        .then((config) => {
            ReactDOM.render(<App config={config} />, document.getElementById(containerId));
        });
    serviceWorker.unregister();
};

window.unmountRuleMFE = (containerId: string) => {
    ReactDOM.unmountComponentAtNode(document.getElementById(containerId) as HTMLElement);
};

if (!document.getElementById('RuleMFE-container')) {
    fetch('../config.json')
        .then(async (r) => r.json())
        .then((config) => {
            console.log(config);
            ReactDOM.render(<KeycloakWrapper config={config} />, document.getElementById('root'));
        });
    serviceWorker.unregister();
}
