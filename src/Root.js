import React from 'react';
import { useHistory } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';


const Home = () => {
    const { oktaAuth, authState } = useOktaAuth();

    const history = useHistory();

    if (authState.isPending) return null;
    history.push('/home');
    return (
        <>
        </>
    );
};
export default Home;