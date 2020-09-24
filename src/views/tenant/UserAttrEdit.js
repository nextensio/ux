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
                uid: userData.uid, tenant: userData.tenant, category: userData.category,
                type: userData.type, level: parseInt(userData.level),
                dept: userData.dept.split(',').map(function (item) {
                    return item.trim();
                }),
                team: userData.team.split(',').map(function (item) {
                    return item.trim();
                })
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
                    props.history.push('/tenant/' + props.match.params.id + '/userattr/view')
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