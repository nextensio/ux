import React, { useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
} from '@coreui/react'
import { withRouter } from 'react-router-dom';


const Help = (props) => {
    useEffect(() => {
    }, []);

    return (
        <>
            <CRow className="mb-4">
                <CCol md="4">
                    <CCard className="roboto-font border-rounded shadow element pb-n5">
                        <CCardHeader>
                            <a target="_blank" href="https://docs.nextensio.net/">Documentation</a>
                        </CCardHeader>
                        <CCardBody className="mb-n4">
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CRow className="mb-4">
                <CCol md="4">
                    <CCard className="roboto-font border-rounded shadow element pb-n5">
                        <CCardHeader>
                            <a target="_blank" href="https://github.com/nextensio/tickets/issues">Ticketing</a>
                        </CCardHeader>
                        <CCardBody className="mb-n4">
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CRow className="mb-4">
                <CCol md="4">
                    <CCard className="roboto-font border-rounded shadow element pb-n5">
                        <CCardHeader>
                            <a target="_blank" href="https://join.slack.com/t/nextensio-community/shared_invite/zt-15br229n8-GDbNHrijOUnVcwL5LdGN1w">Slack</a>
                        </CCardHeader>
                        <CCardBody className="mb-n4">
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

        </>
    )
}

export default withRouter(Help)
