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
    CInvalidFeedback,
    CRow,
    CLabel,
    CCardHeader,
    CFormGroup,
    CCardFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import './tenantviews.scss'

var common = require('../../common')

const HostEdit = (props) => {
    const initHostData = Object.freeze({
        host: "",
        name: "",
        routeattrs: [],
    });
    const [hostData, updateHostData] = useState(initHostData);
    const [errObj, updateErrObj] = useState({});

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    const handleChange = (e) => {
        updateHostData({
            ...hostData,
            [e.target.name]: e.target.value.trim()
        });
    };

    function validate() {
        let errs = {}
        // regex to check if IP Address/mask
        const reIP = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/[0-9][0-9]?$/;
        // regex to check if URL
        const reURL = /^([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]+:[0-9]+$/gi;
        // special host name to indicate that all default internet traffic needs
        // to be sent to nextensio
        const nextensioURL = 'nextensio-default-internet'
        if (!(reIP.test(hostData.host) || reURL.test(String(hostData.host).toLowerCase()) || hostData.host == nextensioURL)) {
            errs.host = true
        }
        if (!/\S/.test(hostData.name)) {
            errs.name = true
        }
        updateErrObj(errs)
        return errs
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        let errs = validate()
        if (Object.keys(errs).length !== 0) {
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(hostData),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/hostattr'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/hosts')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Add an Application</strong>
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol sm="8">
                        <CForm>
                            <CFormGroup>
                                <CLabel>Application URL</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-link" />
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput name="host" placeholder="google.com" onChange={handleChange} invalid={errObj.host} />
                                    <CInvalidFeedback>Please enter a valid URL!</CInvalidFeedback>
                                </CInputGroup>
                            </CFormGroup>
                            <CFormGroup>
                                <CLabel htmlFor="nf-email">Name</CLabel>
                                <CInputGroup>
                                    <CInputGroupPrepend>
                                        <CInputGroupText className="bg-primary-light text-primary">
                                            <CIcon name="cil-tag" />
                                        </CInputGroupText>
                                    </CInputGroupPrepend>
                                    <CInput name="name" placeholder="google" onChange={handleChange} invalid={errObj.name} />
                                    <CInvalidFeedback>Please enter a value.</CInvalidFeedback>
                                </CInputGroup>
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

export default withRouter(HostEdit)
