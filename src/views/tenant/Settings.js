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

const Settings = (props) => {
 
    return (
        <CCard>
            <CCardHeader>
                <strong>Settings</strong>
            </CCardHeader>
            <CCardBody className="roboto-font">
                <CRow>
                    <CCol sm="2">
                        <div><CIcon className="mr-3" name="cil-moon"/>Dark Mode</div>
                    </CCol>
                    <CCol sm="10">
                        <CSwitch className={'mx-1'} variant={'3d'} color={'primary'} defaultChecked/>
                    </CCol>
                </CRow>
            </CCardBody>
        </CCard>
    )
}

export default withRouter(Settings)