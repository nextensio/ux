import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { oktaAuthConfig, oktaSignInConfig } from './common';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import Root from './Root';
import { OktaAuth } from '@okta/okta-auth-js';
import './scss/style.scss';

// Containers
const HomeLayout = React.lazy(() => import('./containers/home/TheLayout'));
const TenantLayout = React.lazy(() => import('./containers/tenant/TheLayout'));

// Pages
const Login = React.lazy(() => import('./Login'));

const oktaAuth = new OktaAuth(oktaAuthConfig);

const AppSecure = () => {
    const history = useHistory();

    const customAuthHandler = () => {
        history.push('/login');
    };
    if (process.env.REACT_APP_IGNORE_AUTH == "true") {
        // NOTE NOTE: This is only for local testbeds, this is NOT a production setting
        // TODO: This is cumbersome to add the route in two places, one as secure and one
        // as non-secure, need to find a better way to do this to allow local testbeds to
        // work without being secure / without needing okta etc..
        return (
            <Security
                oktaAuth={oktaAuth}
                onAuthRequired={customAuthHandler}
            >
                <Switch>
                    <Route path="/tenant/:id" name="Tenant" render={props => <TenantLayout {...props} />} />
                    <Route path="/home" name="Home" render={props => <HomeLayout {...props} />} />
                    <Route path='/' exact={true} render={props => <HomeLayout {...props} />} />
                </Switch>
            </Security>
        );

    } else {

        return (
            <Security
                oktaAuth={oktaAuth}
                onAuthRequired={customAuthHandler}
            >
                <Switch>
                    <SecureRoute path="/tenant/:id" name="Tenant" render={props => <TenantLayout {...props} />} />
                    <SecureRoute path="/home" name="Home" render={props => <HomeLayout {...props} />} />
                    <Route path='/' exact={true} component={Root} />
                    <Route path='/login' render={() => <Login config={oktaSignInConfig} />} />
                    <Route path='/login/callback' component={LoginCallback} />
                </Switch>
            </Security>
        );
    }
}

export default AppSecure;
