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

var common = require('../../common')

const UserAttrEdit = (props) => {
    const initUserData = Object.freeze({
        uid: "",
        tenant: props.match.params.id,
        category: "",
        type: "",
        level: "",
        dept: "",
        team: "",
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
        var dept = userData.dept
        if (userData.dept) {
            if (!Array.isArray(userData.dept)) {
                dept = userData.dept.split(',').map(function (item) {
                    return item.trim();
                })
            }
        } else {
            dept = []
        }
        var team = userData.team
        if (userData.team) {
            if (!Array.isArray(userData.team)) {
                team = userData.team.split(',').map(function (item) {
                    return item.trim();
                })
            }
        } else {
            team = []
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                uid: userData.uid, tenant: userData.tenant, category: userData.category,
                type: userData.type, level: parseInt(userData.level),
                dept: dept, team: team
            }),
        };
        fetch(common.api_href('/api/v1/adduserattr'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/userattr')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    return (
        <CCard accentColor='primary'>
            <CCardHeader>
                Add User Properties
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User ID</CLabel>
                        <CInput name="uid" placeholder={userData.uid} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Category</CLabel>
                        <CInput name="category" placeholder={userData.category} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User Type</CLabel>
                        <CInput name="type" placeholder={userData.type} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User Level</CLabel>
                        <CInput name="level" placeholder={userData.level} onChange={handleChange} />
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

export default withRouter(UserAttrEdit)