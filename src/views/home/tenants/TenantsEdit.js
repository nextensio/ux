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

var common = require('../../../common')

const TenantsEdit = (props) => {

    const initTenantData = Object.freeze({
        curid: "unknown",
        name: "",
        gateways: "",
        image: "",
        pods: 0,
    });
    const [tenantData, updateTenantData] = useState(initTenantData);

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateTenantData({
                curid: props.location.state._id,
                name: props.location.state.name,
                gateways: props.location.state.gateways.join(),
                image: props.location.state.image,
                pods: props.location.state.pods
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
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                curid: tenantData.curid,
                name: tenantData.name,
                gateways: tenantData.gateways.split(',').map(function (item) {
                    return item.trim();
                }),
                image: tenantData.image, pods: parseInt(tenantData.pods),
            }),
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
                        <CInput name="name" placeholder={tenantData.name} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Gateways (Comma seperated)</CLabel>
                        <CInput name="gateways" placeholder={tenantData.gateways} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Dataplane Image</CLabel>
                        <CInput name="image" placeholder={tenantData.image} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Number of pods</CLabel>
                        <CInput name="pods" placeholder={tenantData.pods} onChange={handleChange} />
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