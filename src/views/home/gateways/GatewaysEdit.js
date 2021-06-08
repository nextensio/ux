import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardGroup,
    CCardFooter,
    CCol,
    CContainer,
    CForm,
    CInput,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CRow,
    CLabel,
    CCardHeader,
    CFormGroup,
    CFormText,
    CSelect,
    CInputGroupAppend
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../../common')

const GatewaysEdit = (props) => {
    const initGwData = Object.freeze({
        name: "",
        location: "",
        region: "",
        zone: "",
        provider: ""
    });
    const providers = ['AWS', 'Azure', 'Digital Ocean', 'Google Cloud']
    const [gwData, updateGwData] = useState(initGwData);

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateGwData({
                name: props.location.state.name,
            })
        }
    }, []);

    const handleChange = (e) => {
        updateGwData({
            ...gwData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                name: gwData.name + '.nextensio.net', location: gwData.location, region: gwData.region,
                zone: gwData.zone, provider: gwData.provider
            }),
        };
        fetch(common.api_href('/api/v1/global/add/gateway'), requestOptions)
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
                    props.history.push('/home/gateways')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Add Gateway</strong>
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-email">Hostname</CLabel>
                        <CInputGroup>
                            <CInput name="name" placeholder={gwData.name} onChange={handleChange} />
                            <CInputGroupAppend>
                                <CInputGroupText>
                                    .nextensio.net
                                </CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                        <CFormText>DNS name is (Hostname).nextensio.net</CFormText>
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel>Location</CLabel>
                        <CInput name="location" placeholder={gwData.location} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel>Region</CLabel>
                        <CInput name="region" placeholder={gwData.region} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel>Zone</CLabel>
                        <CInput name="zone" placeholder={gwData.zone} onChange={handleChange} />
                    </CFormGroup>
                    <CFormGroup>
                        <CLabel>Provider</CLabel>
                        <CInputGroup>
                            <CSelect name="provider" custom onChange={handleChange}>
                                <option value={undefined}>Please select a provider</option>
                                {providers.map(provider => {
                                    return (
                                        <option value={provider}>{provider}</option>
                                    )
                                })}
                            </CSelect>
                        </CInputGroup>
                    </CFormGroup>
                </CForm>
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

export default withRouter(GatewaysEdit)