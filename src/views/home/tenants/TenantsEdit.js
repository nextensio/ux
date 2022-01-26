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
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../../common')

function validateEnterprise(tenant) {
    var re = /^[a-z0-9]+$/;
    return re.test(tenant)
}

const TenantsEdit = (props) => {

    const initTenantData = Object.freeze({
        _id: "unknown",
    });
    const [tenantData, updateTenantData] = useState(initTenantData);

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
        if (typeof props.location.state != 'undefined') {
            updateTenantData({
                _id: props.location.state._id,
                name: props.location.state.name,
            })
        }
    }, []);

    const handleChange = (e) => {
        updateTenantData({
            ...tenantData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateEnterprise(tenantData._id.trim())) {
            alert(tenantData._id.trim() + " <- has to be one word, only lower case alphabets and numbers allowed")
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify({
                _id: tenantData._id.trim(),
            }),
        };

        fetch(common.api_href('/api/v1/global/add/tenant'), requestOptions)
            .then(async response => {
                const data = await response.json();
                // check for error response
                if (data["Result"] != "ok") {
                    alert(data["Result"])
                }
                if (!response.ok) {
                    // get error message from body or default to response status
                    const error = (data && data.message) || response.status;
                    alert(error);
                    return Promise.reject(error);
                }
                // check for error response
                if (data["Result"] != "ok") {
                    alert(data["Result"])
                } else {
                    props.history.push('/home/tenants')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Add Tenant</strong>
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Enterprise ID</CLabel>
                        <CInput name="_id" placeholder={tenantData._id} onChange={handleChange} />
                    </CFormGroup>
                </CForm>
            </CCardBody>
            <CCardFooter>
                <CButton className="button-footer-success" color="success" variant="outline" onClick={handleSubmit}>
                    <CIcon name="cil-scrubber" />
                    <strong>{" "}Add</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(TenantsEdit)
