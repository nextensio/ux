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

var common = require('../../../common')

const CertsEdit = (props) => {
    const initUserData = Object.freeze({
        certid: "",
        cert: []
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
        if (e.target.name == "cert") {
            var target = e.target.value;
        } else {
            var target = e.target.value.trim();
        }
        updateUserData({
            ...userData,
            [e.target.name]: target
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        var ucode = userData.cert.split('').map(function (c) { return c.charCodeAt(0) });
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                certid: userData.certid,
                cert: ucode
            }),
        };
        fetch(common.api_href('/api/v1/addcert'), requestOptions)
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
                    props.history.push('/home/certs/view')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                Add Policy
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Certificate ID</CLabel>
                        <CInput name="certid" placeholder={userData.certid} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Certificate</CLabel>
                        <CTextarea name="cert" placeholder={userData.cert} onChange={handleChange} />
                    </CFormGroup>
                </CForm>
            </CCardBody>
            <CCardFooter>
                <CButton size="sm" color="primary" onClick={handleSubmit}>Submit</CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(CertsEdit)