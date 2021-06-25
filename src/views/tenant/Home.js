import React, { useState } from 'react'
import {
    CButton,
    CCallout,
    CCard,
    CCardBody,
    CCardHeader,
    CCardFooter,
    CCol,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { withRouter } from 'react-router-dom';
import './tenantviews.scss'

const Home = (props) => {
    const toClusterConfig = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/clusterconfig')
    }
    return(
        <>
            <CCallout color="primary">
                <h4 className="title">Home</h4>
            </CCallout>
            <CRow>
                <CCol lg="6">
                    <CCard className="border-rounded shadow">
                        <CCardHeader>
                            <CIcon name="cil-chart"/> Telemetry 
                            <CButton 
                                className="float-right" 
                                color="primary"
                            >
                                <CIcon className="mr-1" name="cil-external-link"/>
                                Navigate
                            </CButton>
                        </CCardHeader>
                        <CCardBody>
                            View statistics on your networking using Kiali.
                        </CCardBody>
                        
                    </CCard>
                </CCol>
                <CCol lg="6">
                    <CCard className="border-rounded shadow">
                        <CCardHeader>
                            <CIcon name="cib-kubernetes"/> Cluster Configuration
                            <CButton 
                                className="float-right" 
                                color="primary"
                                onClick={toClusterConfig}
                            >
                                <CIcon className="mr-1" name="cil-settings"/>
                                Configure
                            </CButton>
                        </CCardHeader>
                        <CCardBody>
                            Sorry, you do not have any configuration yet.
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(Home)