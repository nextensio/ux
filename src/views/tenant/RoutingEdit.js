import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardGroup,
    CCol,
    CContainer,
    CForm,
    CInput,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CRow,
    CLabel,
    CCardHeader,
    CFormGroup,
    CFormText,
    CCardFooter,
    CTextarea
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../common')

const PolicyEdit = (props) => {
    const initUserData = Object.freeze({
        user: "",
        route: "",
        tenant: props.match.params.id,
        tag: "",
    });
    const [userData, updateUserData] = useState(initUserData);

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateUserData(props.location.state)
        }
    }, []);

    const handleChange = (e) => {
        updateUserData({
            ...userData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                route: userData.user + ":" + userData.route, tenant: userData.tenant,
                tag: userData.tag
            }),
        };
        fetch(common.api_href('/api/v1/addroute'), requestOptions)
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
                    alert(data["Result"])
                } else {
                    props.history.push('/tenant/' + props.match.params.id + '/route/view')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                Add Route
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User id</CLabel>
                        <CInput name="user" placeholder={userData.user} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Route Name</CLabel>
                        <CInput name="route" placeholder={userData.route} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Route Tag</CLabel>
                        <CInput name="tag" placeholder={userData.tag} onChange={handleChange} />
                    </CFormGroup>
                </CForm>
            </CCardBody>
            <CCardFooter>
                <CButton size="sm" color="primary" onClick={handleSubmit}>Submit</CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(PolicyEdit)