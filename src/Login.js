import React from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import OktaSignInWidget from './OktaSignInWidget';
import { useOktaAuth } from '@okta/okta-react';
import { withRouter } from 'react-router-dom';

const Login = ({ config }) => {
    const { oktaAuth, authState } = useOktaAuth();

    const history = useHistory();

    const onSuccess = (tokens) => {
        oktaAuth.handleLoginRedirect(tokens);
        history.push('/home');
    };

    const onError = (err) => {
        console.log('error logging in', err);
    };

    if (authState.isPending) return null;

    return authState.isAuthenticated ?
        <Redirect to='/home' /> :
        <OktaSignInWidget
            config={config}
            onSuccess={onSuccess}
            onError={onError} />;
};
export default withRouter(Login);