import React from 'react'
import { Redirect } from 'react-router-dom';
import {
    TheContent,
    TheHeader,
    TheSidebar,
    TheFooter,
} from './index'
import { useOktaAuth } from '@okta/okta-react';
import './home.scss'

var common = require('../../common')

const TheLayout = (props) => {

    const { oktaAuth, authState } = useOktaAuth();
    const token = common.GetAccessToken(authState);
    const userInfo = common.decodeToken(token);
    if (userInfo['usertype'] == 'superadmin') {
        return (
            <div className="c-app c-default-layout">
                <TheSidebar />
                <div className="c-wrapper">
                    <TheHeader />
                    <div className="c-body">
                        <TheContent />
                    </div>
                    <TheFooter />
                </div>
            </div>
        )
    } else {
        return <Redirect to={'/tenant/' + userInfo['tenant'] + '/' + userInfo['usertype'] + '/home'} />
    }
}

export default TheLayout
