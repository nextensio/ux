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
                bid: userData.bid, tenant: userData.tenant,
                team: team, dept: dept,
                IC: parseInt(userData.IC), manager: parseInt(userData.manager),
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
                    props.history.push('/tenant/' + props.match.params.id + '/bundleattr')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Add User Properties</strong>
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
                <CButton className="button-footer-success" color="success" variant="outline" onClick={handleSubmit}>
                    <CIcon name="cil-scrubber" />
                    <strong>{" "}Add</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(BundleAttrEdit)