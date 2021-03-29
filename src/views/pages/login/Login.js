import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom';
import {
  CButton,
  CCard,
  CCardBody,
  CCardImg,
  CCardImgOverlay,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
  CLabel
} from '@coreui/react'
import CIcon from '@coreui/icons-react'


const Login = (props) => {
  const initLoginData = Object.freeze({
    username: "",
    password: ""
  });
  const [loginData, updateLoginData] = useState(initLoginData);

  const handleChange = (e) => {
    updateLoginData({
      ...loginData,
      [e.target.name]: e.target.value.trim()
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('logging in ', loginData);
    // TODO: Contact IDP etc..
    // If login is succesful, redirect to home page
    props.history.push('/');
  };

  return (
    <>
      <CContainer>
        <CRow>
          <CCol md="4">
            <CCard className="login-img-container">
              Welcome Back
              
              <CCardImg className="login-img" variant="top" src={"wfh.jpg"} alt="Remote Office" />
              
            </CCard>
          </CCol>
          
          <CCol md="8">
            <CCard className="p-4">
              <CCardBody>
                <CForm>
                  <h1>Login</h1>
                  <p className="text-muted">Sign In to Nextensio</p>
                  <CInputGroup className="mb-3">
                    <CInputGroupPrepend>
                      <CInputGroupText className="bg-primary text-white">
                        <CIcon name="cil-user"/>
                      </CInputGroupText>
                    </CInputGroupPrepend>
                    <CInput name="username" type="text" placeholder="Username" autoComplete="username" onChange={handleChange} />
                  </CInputGroup>
                  <CInputGroup className="mb-4">
                    <CInputGroupPrepend>
                      <CInputGroupText className="bg-primary text-white">
                        <CIcon name="cil-asterisk"/>
                      </CInputGroupText>
                    </CInputGroupPrepend>
                    <CInput name="password" type="password" placeholder="Password" autoComplete="current-password" onChange={handleChange} />
                  </CInputGroup>
                  <CRow>
                    <CCol xs="6">
                      <CButton color="primary" className="px-4" onClick={handleSubmit}>Login</CButton>
                    </CCol>
                    <CCol xs="6" className="text-right">
                      <CButton color="link" className="px-0">Forgot password?</CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}

export default withRouter(Login)
