import React, { lazy, useState } from 'react'
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

var common = require('../../../common')

const TenantsEdit = (props) => {

    const initTenantData = Object.freeze({
        name: "",
        idp: "",
        gateways: "",
    });
    const [tenantData, updateTenantData] = useState(initTenantData);

    const handleChange = (e) => {
        updateTenantData({
            ...tenantData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: tenantData.name, idp: tenantData.idp, gateways: tenantData.gateways.split(',') }),
        };

        fetch(common.api_href('/api/v1/addtenant'), requestOptions)
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
                    props.history.push('/home/tenants/view')
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                Add Tenant
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Name</CLabel>
                        <CInput name="name" placeholder="Tenant Name" onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Identity Provider (IDP)</CLabel>
                        <CInput name="idp" placeholder="Link to Identity Provider (IDP)" onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Gateways</CLabel>
                        <CInput name="gateways" placeholder="List of gateway host names, comma seperated" onChange={handleChange} />
                    </CFormGroup>
                </CForm>
            </CCardBody>
            <CCardFooter>
                <CButton size="sm" color="primary" onClick={handleSubmit}>Submit</CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(TenantsEdit)