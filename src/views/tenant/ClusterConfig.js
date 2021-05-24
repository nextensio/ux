import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CForm,
    CFormText,
    CInput,
    CInputCheckbox,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CInvalidFeedback,
    CRow,
    CSelect,
    CLabel,
    CCardHeader,
    CFormGroup,
    CCardFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import './tenantviews.scss'

var common = require('../../common')

const ClusterConfig = (props) => {
    const initConfigData = Object.freeze({
        cluster: "",
        image: "",
        apods: "",
        cpods: "",
    });
    const [configData, updateConfigData] = useState(initConfigData);
    // gw data for the dropdown
    const [clusterData, updateClusterData] = useState(Object.freeze([]));

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/global/get/allgateways'), hdrs)
            .then(response => response.json())
            .then(data => {
                var clusterNames = []
                for (var i = 0; i < data.length; i++) {
                    clusterNames.push(data[i].cluster);
                }
                clusterNames.sort()
                updateClusterData(clusterNames)
            });
    }, []);

    const handleChange = (e) => {
        updateConfigData({
            ...configData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                cluster: configData.cluster, image: configData.image, apods: configData.apods,
                cpods: configData.cpods
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/bundle'), requestOptions)
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
                    // bundle attribute http post must be run after bundle http post
                    return
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

   
    return (
        <CCard>
            <CCardHeader>
                <strong>Cluster Configuration</strong>
                <CButton onClick={e => console.log(configData)}>LOG</CButton>
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol sm="8">
                        <CForm>
                            <CFormGroup>
                                <CLabel>Cluster</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-sitemap"/>
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CSelect name="cluster" custom onChange={handleChange}>
                                    </CSelect>
                                </CInputGroup>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>Image</CLabel>
                                <CInput name="image" onChange={handleChange}/>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>APods</CLabel>
                                <CInput name="apods" onChange={handleChange}/>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>CPods</CLabel>
                                <CInput name="cpods" onChange={handleChange}/>
                            </CFormGroup>
                        </CForm>
                    </CCol>
                </CRow>
            </CCardBody>
            <CCardFooter>
                <CButton className="button-footer-success" color="success" variant="outline">
                    <CIcon name="cil-scrubber" />
                    <strong>{" "}Add</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(ClusterConfig)
