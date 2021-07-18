import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardFooter,
    CCol,
    CForm,
    CInput,
    CRow,
    CLabel,
    CCardHeader,
    CFormGroup,
    CTextarea
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../common')

const Feedback = (props) => {
 
    return (
        <CCard>
            <CCardHeader>
                <strong>Feedback</strong>
                <div className="text-muted small">Feel free to leave us your criticism or praise, and we will respond within 24 hours.</div>
            </CCardHeader>
            <CCardBody className="roboto-font">
                <CRow>
                    <CCol sm="8">
                        <CForm>
                            <CFormGroup>
                                <CLabel>Subject</CLabel>
                                <CInput/>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>Description</CLabel>
                                <CTextarea 
                                    name="textarea-input" 
                                    id="textarea-input" 
                                    rows="9"
                                    placeholder="Content..." 
                                />
                            </CFormGroup>
                        </CForm>
                    </CCol>
                </CRow>
            </CCardBody>
            <CCardFooter>
                <CButton className="button-footer-success" color="success" variant="outline">
                    <CIcon name="cil-scrubber" />
                    <strong>{" "}Send</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(Feedback)