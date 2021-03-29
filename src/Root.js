import React from 'react';
import { useHistory } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { oktaSignInConfig } from './common';

const Login = React.lazy(() => import('./Login'));

const Home = () => {
    const { oktaAuth, authState } = useOktaAuth();

    const history = useHistory();

    if (authState.isPending) return null;

    if (authState.isAuthenticated) {
        return (
            <Login config={oktaSignInConfig} />
        );
    } else {
        history.push('/home');
        return (
            <>
            </>
        );
    }
};
export default Home;