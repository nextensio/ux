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
    CCardFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';

var common = require('../../common')

const BundlesEdit = (props) => {
    const initUserData = Object.freeze({
        bid: "",
        tenant: props.match.params.id,
        name: "",
        services: ""
    });
    const [userData, updateUserData] = useState(initUserData);

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bid: userData.bid, tenant: userData.tenant, name: userData.name,
                services: userData.services.split(',').map(function (item) {
                    return item.trim();
                })
            }),
        };
        fetch(common.api_href('/api/v1/addbundle'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/bundles/view')
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                Add User
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Bundle ID</CLabel>
                        <CInput name="bid" placeholder={userData.bid} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Bundle Name</CLabel>
                        <CInput name="name" placeholder={userData.name} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Services, comma seperated</CLabel>
                        <CInput name="services" placeholder={userData.services} onChange={handleChange} />
                    </CFormGroup>
                </CForm>
            </CCardBody>
            <CCardFooter>
                <CButton size="sm" color="primary" onClick={handleSubmit}>Submit</CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(BundlesEdit)