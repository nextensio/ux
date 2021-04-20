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
    CCardFooter,
    CCardText
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';

var common = require('./common')

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateEnterprise(tenant) {
    var format = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
    return !format.test(tenant)
}
const SignUp = (props) => {
    const initSignupData = Object.freeze({
        email: "",
    });
    const [signupData, updateSignupData] = useState(initSignupData);

    useEffect(() => {
    }, []);

    const handleChange = (e) => {

        updateSignupData({
            ...signupData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateEmail(signupData.email.trim())) {
            alert(signupData.email + " <- is not a valid email id");
            return
        }
        if (!validateEnterprise(signupData.tenant.trim())) {
            alert(signupData.tenant + " <- has to be one word with no special characters")
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
        <CCard>
            <CCardHeader>
                <br></br><br></br><br></br><br></br>
                Create a new Enterprise. You will be the administrator for this Enterprise.
                You will receive an email from nextensio.okta.com asking you to verify your email
                id and set a password.
                Once you set a password, you can login and configure your Enterprise to use Nextensio!
                <br></br>
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">An Enterprise ID, like pepsi / pepsi100 / sprite etc.. (One word with upper/lower case alphabets, numbers or underscore)</CLabel>
                        <CInput name="tenant" placeholder="" onChange={handleChange} />
                        <CLabel htmlFor="nf-email">Your Email ID</CLabel>
                        <CInput name="email" placeholder="" onChange={handleChange} />
                    </CFormGroup>
                </CForm>
            </CCardBody>
            <CCardFooter>
                <CButton className="button-footer-success" color="success" variant="outline" onClick={handleSubmit}>
                    <CIcon email="cil-scrubber" />
                    <strong>Signup!</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(SignUp)