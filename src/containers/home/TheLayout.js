import React, { useState, useEffect } from 'react'
import { Redirect } from 'react-router-dom';
import {
    CSpinner,
} from '@coreui/react'
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
    const initTenantData = Object.freeze({
        tenant: "",
        type: ""
    });
    const [TenantData, updateTenantData] = useState(initTenantData);

    const { oktaAuth, authState } = useOktaAuth();
    const token = common.GetAccessToken(authState);
    const userInfo = common.decodeToken(token);
    const bearer = "Bearer " + common.GetAccessToken(authState);

    const hdrs = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
            'X-Nextensio-Group': common.getGroup(common.GetAccessToken(authState), props),
        },
    };


    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + userInfo['tenant'] + '/get/tenant'), hdrs)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                console.log(userInfo['tenant'])
                updateTenantData({ tenant: data.Tenant._id, type: data.Tenant.type })
            });
    }, []);

    // We need the tenant type till we can show the appropriate page

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
    } else if (TenantData.type == '') {
        return (
            <div className="HomeView">
                <CSpinner />
            </div>
        )
    } else if ((userInfo['usertype'] == 'admin') && (TenantData.type == 'MSP')) {
        return <Redirect to={'/tenant/' + userInfo['tenant'] + '/' + userInfo['usertype'] + '/msp'} />
    } else {
        return <Redirect to={'/tenant/' + userInfo['tenant'] + '/' + userInfo['usertype'] + '/home'} />
    }
}

export default TheLayout
