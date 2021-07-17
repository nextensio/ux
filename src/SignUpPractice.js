import React, { useState } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardFooter,
    CCol,
    CContainer,
    CForm,
    CFormText,
    CInput,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CInvalidFeedback,
    CLabel,
    CRow
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';

var common = require('./common')


const SignUp = (props) => {
    const initSignupData = Object.freeze({
        email: "",
        tenant: ""
    });
    const [signupData, updateSignupData] = useState(initSignupData);
    const [errObj, updateErrObj] = useState({})

    function validate() {
        let errs = {}
        const emailRe = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const enterpriseRe = /^[a-z0-9]+$/;
        if (!emailRe.test(String(signupData.email).toLowerCase())){
            errs.email = true
        }
        if (!enterpriseRe.test(signupData.tenant)) {
            errs.tenant = true
        }
        updateErrObj(errs)
        return errs
    }

    const handleChange = (e) => {
        updateSignupData({
            ...signupData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        let errs = validate()
        if (Object.keys(errs).length !== 0) {
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: signupData.email.trim(), tenant: signupData.tenant.trim() }),
        };
        fetch(common.api_href('/api/v1/noauth/signup'), requestOptions)
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
                    alert("Please check your email, activate your account and then login here")
                    props.history.push('/login')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };
    
    return (
        // Create a new Enterprise. You will be the administrator for this Enterprise. You will receive an email from nextensio.okta.com asking you to verify your email id and set a password. Once you set a password, you can login and configure your Enterprise to use Nextensio!
        // An Enterprise ID, like pepsi / pepsi100 / sprite etc.. (One word with only lower case alphabets, numbers)
        // Email ID
        <div className="c-app c-default-layout flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md="9" lg="7" xl="6">
                        <CCard className="mx-4">
                            <CCardBody className="p-4">
                                <CForm>
                                    <h1>Sign Up</h1>
                                    <p className="text-muted">Create your account</p>
                                    <CInputGroup className="mb-3">
                                        <CLabel>Enterprise ID</CLabel>
                                        <CInputGroupPrepend>
                                            <CInputGroupText>
                                                <CIcon name="cil-user" />
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput type="text" name="tenant" onChange={handleChange} invalid={errObj.tenant}/>
                                        <CFormText>Enter your Enterprise ID.</CFormText>
                                        <CInvalidFeedback>Please only use lowercase alphanumeric for your Enterprise ID.</CInvalidFeedback>
                                    </CInputGroup>
                                    <CInputGroup className="mb-3">
                                        <CLabel>Email</CLabel>
                                        <CInputGroupPrepend>
                                            <CInputGroupText>
                                                <CIcon name="cil-envelope-closed"/>
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput type="text" name="email" onChange={handleChange} invalid={errObj.email}/>
                                        <CFormText>Enter your email.</CFormText>
                                        <CInvalidFeedback>Please enter a valid email.</CInvalidFeedback>
                                    </CInputGroup>
                                </CForm>
                            </CCardBody>
                            <CCardFooter className="p-4">
                            <CButton className="button-footer-success" color="success" variant="outline" onClick={handleSubmit}>
                                <CIcon email="cil-scrubber"/>
                                <strong>Signup!</strong>
                            </CButton>
                            </CCardFooter>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default withRouter(SignUp)