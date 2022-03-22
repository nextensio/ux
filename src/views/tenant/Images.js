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
                            <CIcon name="cil-input-power" className="text-primary" />
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Extender Binary (Data Center)</CCardTitle>
                            <CCardText>
                                chmod +x extender; ./extender -key [extender key]
                            </CCardText>
                            <CButton href="https://images.nextensio.net/stable/extender">Download</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cil-input-power" className="text-primary" />
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Extender Docker (Data Center)</CCardTitle>
                            <CCardText>
                                docker run -it -e NXT_SECRET=[extender key] -d nextensio/extender:latest
                            </CCardText>
                            <CButton href="https://hub.docker.com/r/nextensio/extender">Dockerhub</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cib-linux" />
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Linux</CCardTitle>
                            <CCardText>
                                Linux Client
                            </CCardText>
                            <CButton href="https://images.nextensio.net/stable/linux">Download</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cib-android-alt" className="text-success" />
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Android</CCardTitle>
                            <CCardText>
                                Android Client
                            </CCardText>
                            <CButton href="https://images.nextensio.net/stable/android.apk">Download</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cib-apple" className="text-secondary" />
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Mac</CCardTitle>
                            <CCardText>
                                Mac Client
                            </CCardText>
                            <CButton href="https://images.nextensio.net/stable/mac.zip">Download</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cib-app-store-ios" className="text-secondary" />
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>iOS Mobile</CCardTitle>
                            <CCardText>
                                iOS Client
                            </CCardText>
                            <CButton href="https://testflight.apple.com/join/MjzUkAzf">Download in TestFlight</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="3">
                    <CCard className="image-component">
                        <CCardImg className="py-5">
                            <CIcon name="cib-windows" className="text-secondary" />
                        </CCardImg>
                        <CCardBody>
                            <CCardTitle>Windows</CCardTitle>
                            <CCardText>
                                Windows Client
                            </CCardText>
                            <CButton href="https://images.nextensio.net/stable/windows.zip">Download</CButton>
                        </CCardBody>
                    </CCard>
                </CCol>

            </CRow>
        </>
    )
}

export default withRouter(Images)