import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { oktaAuthConfig, CALLBACK_PATH } from './common';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import Root from './Root';
import { OktaAuth } from '@okta/okta-auth-js';
import './scss/style.scss';

// Containers
const HomeLayout = React.lazy(() => import('./containers/home/TheLayout'));
const TenantLayout = React.lazy(() => import('./containers/tenant/TheLayout'));

// Pages
const SignUp = React.lazy(() => import('./SignUp'));

const oktaAuth = new OktaAuth(oktaAuthConfig);

const AppSecure = () => {
    const history = useHistory();

    const restoreOriginalUri = () => {
        // Callback function to restore URI during login
    };

    return (
        <Security
            oktaAuth={oktaAuth}
            restoreOriginalUri={restoreOriginalUri}
        >
            <Switch>
                <SecureRoute path="/tenant/:id/:group" name="Tenant" render={props => <TenantLayout {...props} />} />
                <SecureRoute path="/home" name="Home" render={props => <HomeLayout {...props} />} />
                <Route path='/' exact={true} component={Root} />
                <Route path='/signup' render={() => <SignUp />} />
                <Route path={CALLBACK_PATH} exact={true} component={LoginCallback} />
            </Switch>
        </Security>
    );
}

export default AppSecure;
