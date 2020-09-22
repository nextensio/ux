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

const BundleAttrEdit = (props) => {
    const initUserData = Object.freeze({
        bid: "",
        tenant: props.match.params.id,
        team: "",
        dept: "",
        IC: "",
        manager: "",
        nonemployee: "",
    });
    const [userData, updateUserData] = useState(initUserData);

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            if (Array.isArray(props.location.state.team)) {
                props.location.state.team = props.location.state.team.join();
            }
            if (Array.isArray(props.location.state.dept)) {
                props.location.state.dept = props.location.state.dept.join();
            }
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
                bid: userData.bid, tenant: userData.tenant, team: userData.team.split(',').map(function (item) {
                    return item.trim();
                }),
                dept: userData.dept.split(',').map(function (item) {
                    return item.trim();
                }),
                IC: userData.IC, manager: userData.manager,
                nonemployee: userData.nonemployee
            }),
        };
        fetch(common.api_href('/api/v1/addbundleattr'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/bundleattr/view')
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                Add User Attributes
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Bundle ID</CLabel>
                        <CInput name="bid" placeholder={userData.bid} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">IC</CLabel>
                        <CInput name="IC" placeholder={userData.IC} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Manager</CLabel>
                        <CInput name="manager" placeholder={userData.manager} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Non Employee</CLabel>
                        <CInput name="nonemployee" placeholder={userData.nonemployee} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User Departments (Comma Seperated)</CLabel>
                        <CInput name="dept" placeholder={userData.dept} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User Teams (Comma Seperated)</CLabel>
                        <CInput name="team" placeholder={userData.team} onChange={handleChange} />
                    </CFormGroup>
                </CForm>
            </CCardBody>
            <CCardFooter>
                <CButton size="sm" color="primary" onClick={handleSubmit}>Submit</CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(BundleAttrEdit)