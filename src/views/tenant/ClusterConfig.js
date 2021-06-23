import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CForm,
    CInput,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
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
        gateway: "",
        image: "registry.gitlab.com/nextensio/cluster/minion:latest",
    });
    const [configData, updateConfigData] = useState(initConfigData);
    // gateway data for the dropdown
    const [gatewayData, updategatewayData] = useState(Object.freeze([]));
    const [apodCount, setApodCount] = useState(0);

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allgateways'), hdrs)
            .then(response => response.json())
            .then(data => {
                var gatewayNames = []
                for (var i = 0; i < data.length; i++) {
                    gatewayNames.push(data[i].name);
                }
                gatewayNames.sort()
                updategatewayData(gatewayNames)
            });
    }, []);

    const handleChange = (e) => {
        updateConfigData({
            ...configData,
            [e.target.name]: e.target.value.trim()
        });
        if (e.target.name == "gateway") {
            fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenantcluster/' + e.target.value.trim()), hdrs)
                .then(response => response.json())
                .then(data => {
                    setApodCount(data.TenantCl.apodrepl)
                });
        }
    };

    const handleApodChange = (e) => {
        var input = e.target.value.trim().toString()
        setApodCount(parseInt(input, 10))
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!configData.gateway) {
            alert('please select a gateway');
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                gateway: configData.gateway, image: configData.image, apodrepl: apodCount,
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/tenantcluster'), requestOptions)
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
                    alert("Request succesful, modified values can be seen on page reload")
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
                <strong>Gateway Configuration</strong>
                <CButton onClick={e => console.log(configData)}>LOG</CButton>
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol sm="8">
                        <CForm>
                            <CFormGroup>
                                <CLabel>Gateway</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-sitemap" />
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CSelect name="gateway" custom onChange={handleChange}>
                                        <option value={undefined}>Please select a gateway</option>
                                        {gatewayData.map(gateway => {
                                            return (
                                                <option value={gateway}>{gateway}</option>
                                            )
                                        })}
                                    </CSelect>
                                </CInputGroup>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>Image</CLabel>
                                <CInput name="image" placeholder="registry.gitlab.com/nextensio/cluster/minion:latest" onChange={handleChange} />
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel>Ingress (user) compute pods: {apodCount}</CLabel>
                                <CInput name="apods" onChange={handleApodChange} />
                            </CFormGroup>
                        </CForm>
                    </CCol>
                </CRow>
            </CCardBody>
            <CCardFooter>
                <CButton className="button-footer-success" color="success" variant="outline" onClick={handleSubmit}>
                    <CIcon name="cil-scrubber" />
                    <strong>{" "}Add</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(ClusterConfig)
