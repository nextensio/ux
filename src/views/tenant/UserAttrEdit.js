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
        userid: "",
        tenant: props.match.params.id,
        maj_ver: "1",
        min_ver: "0",
        category: "",
        type: "",
        level: "",
        dept: "",
        team: ""

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
                userid: userData.userid, tenant: userData.tenant, category: userData.category,
                type: userData.type, level: userData.level, dept: userData.dept.split(','),
                team: userData.team.split(','), maj_ver: userData.maj_ver, min_ver: userData.min_ver
            }),
        };
        console.log(requestOptions)
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
                        <CInput name="userid" placeholder="Enter User ID" onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Category</CLabel>
                        <CInput name="category" placeholder="Enter Category" onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User Type</CLabel>
                        <CInput name="type" placeholder="Enter User Type" onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User Level</CLabel>
                        <CInput name="level" placeholder="Enter User Level" onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User Departments</CLabel>
                        <CInput name="dept" placeholder="Enter User Departments, comma seperated" onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">User Teams</CLabel>
                        <CInput name="team" placeholder="Enter User Teamsm comma seperated" onChange={handleChange} />
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