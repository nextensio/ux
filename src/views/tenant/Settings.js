import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCardGroup,
    CCardFooter,
    CCol,
    CRow,
    CSwitch
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { useTheme } from 'src/containers/tenant/Context';

var common = require('../../common')

const Settings = (props) => {
    const Theme = useTheme()
    const [easyMode, setEasyMode] = useState(true)

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
            'X-Nextensio-Group': common.getGroup(common.GetAccessToken(authState), props),
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenant'), hdrs)
            .then(response => response.json())
            .then(data => { setEasyMode(data.Tenant.easymode) });
    }, []);

    const toggleEasyMode = (e) => {
        Theme.toggleTheme()
        let newMode = !easyMode
        setEasyMode(newMode)
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify({
                "easymode": newMode
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/tenant'), requestOptions)
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    // get error message from body or default to response status
                    alert(error);
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }
                // check for error response
                if (data["Result"] != "ok") {
                    alert(data["Result"]);
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    return (
        <CCard>
            <CCardHeader>
                <strong>Settings</strong>
            </CCardHeader>
            <CCardBody className="roboto-font">
                <CRow className="mt-3">
                    <CCol sm="2">
                        <div>Enable Expert Mode</div>
                    </CCol>
                    <CCol sm="10">
                        <CSwitch className={'mx-1'} onChange={toggleEasyMode} variant={'3d'} color={'primary'} checked={!easyMode} />
                    </CCol>
                </CRow>
            </CCardBody>
        </CCard>
    )
}

export default withRouter(Settings)