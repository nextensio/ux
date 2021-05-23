import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCardGroup,
    CCardFooter,
    CCol,
    CContainer,
    CForm,
    CFormGroup,
    CFormText,
    CInput,
    CInputCheckbox,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CInvalidFeedback,
    CLabel,
    CRow,
    CSwitch
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';

var common = require('../../common')

const Settings = () => {
 
    return (
        <CCard>
            <CCardHeader>
                <strong>Settings</strong>
            </CCardHeader>
            <CCardBody className="roboto-font">
                <CRow>
                    <CForm>
                        <CFormGroup>
                            <CLabel>User ID</CLabel>
                            <CSwitch></CSwitch>
                        </CFormGroup>
                    </CForm>
                </CRow>
            </CCardBody>
        </CCard>
    )
}

export default withRouter(Settings)