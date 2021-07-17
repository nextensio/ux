import React, { useState } from 'react'
import {
    CButton,
    CCallout,
    CCard,
    CCardBody,
    CCardImg,
    CCardTitle,
    CCardText,
    CCol,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { withRouter } from 'react-router-dom';
import './tenantviews.scss'

const Images = () => {
    return (
        <>
            <CCallout color="primary">
                <h4 className="title">Images</h4>
            </CCallout>
            <CRow>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cil-input-power" className="text-primary"/>
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Connector</CCardTitle>
                            <CCardText>
                                Connector Image for use in Data Center Servers
                            </CCardText>
                            <CButton href="http://nextensio-images.s3-website-us-west-1.amazonaws.com/stable/connector">Download</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cib-linux"/>
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Linux</CCardTitle>
                            <CCardText>
                                Linux Agent
                            </CCardText>
                            <CButton href="http://nextensio-images.s3-website-us-west-1.amazonaws.com/stable/linux">Download</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cib-android-alt" className="text-success"/>
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Android</CCardTitle>
                            <CCardText>
                                Android Agent
                            </CCardText>
                            <CButton href="http://nextensio-images.s3-website-us-west-1.amazonaws.com/stable/android.apk">Download</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cib-apple" className="text-secondary"/>
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Mac</CCardTitle>
                            <CCardText>
                                Mac Agent
                            </CCardText>
                            <CButton href="http://nextensio-images.s3-website-us-west-1.amazonaws.com/stable/mac.zip">Download</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(Images)