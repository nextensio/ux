import React, { useEffect, useState } from 'react'
import {
    CButton,
    CCallout,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CEmbed,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { withRouter } from 'react-router-dom';
import '../tenantviews.scss'
import { useOktaAuth } from '@okta/okta-react';
import Map from './mapbox/Mapbox'

var common = require('../../../common')

const Home = (props) => {

    const [clusterData, updateClusterData] = useState("")

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenantcluster/'), hdrs)
            .then(response => response.json())
            .then(data => {
                updateClusterData(data)
            });
    }, [])

    const toClusterConfig = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/clusterconfig')
    }

    return (
        <>
            <CCallout color="primary">
                <h4 className="title">Home</h4>
            </CCallout>
            <CRow>
                <CCol lg="12">
                    <CCard className="border-rounded shadow">
                        <CCardHeader>
                            <CIcon name="cib-kubernetes" /> Gateway Configuration
                            <CButton
                                className="float-right"
                                color="primary"
                                onClick={toClusterConfig}
                            >
                                <CIcon className="mr-1" name="cil-settings" />
                                Configure
                            </CButton>
                        </CCardHeader>
                    </CCard>
                </CCol>
            </CRow>
            <CRow>
                <CCol sm="12">
                    <CCard>
                        <CCardHeader className="bg-gradient-primary">
                            Gateways Heatmap
                        </CCardHeader>
                        <CCardBody className="parent-container">
                            <CEmbed>
                                <Map className="fit-snug" {...props} />
                            </CEmbed>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(Home)
