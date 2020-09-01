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

var common = require('../../common')

const UserAttrEdit = (props) => {
    const initUserData = Object.freeze({
        ID: "",
        tenant: props.match.params.id,
        majver: "",
        minver: "",
    });
    const [userData, updateUserData] = useState(initUserData);

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
                ID: userData.ID, tenant: userData.tenant, majver: userData.majver,
                minver: userData.minver
            }),
        };
        fetch(common.api_href('/api/v1/addattrhdr'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/attrhdr/view')
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                Add Attribute Headers
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User ID</CLabel>
                        <CInput name="ID" placeholder="Enter User ID" onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Major version</CLabel>
                        <CInput name="majver" placeholder="Enter Major Version" onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Minor Version</CLabel>
                        <CInput name="minver" placeholder="Enter Minor Version" onChange={handleChange} />
                    </CFormGroup>
                </CForm>
            </CCardBody>
            <CCardFooter>
                <CButton size="sm" color="primary" onClick={handleSubmit}>Submit</CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(UserAttrEdit)