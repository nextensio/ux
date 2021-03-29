import React from 'react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

const Logout = () => {

    const { oktaAuth, authState } = useOktaAuth();

    oktaAuth.signOut()

    return (
        <>
        </>
    )
}

export default withRouter(Logout)