import React, { useState, useEffect } from 'react'

import {
    CButton,
    CCard,
    CCardBody,
    CForm,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CLabel,
    CCardHeader,
    CFormGroup,
    CCardFooter,
    CSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import '../tenantviews.scss'
import RegoEditor from './RegoEditor'

var common = require('../../../common')

const PolicyAdd = (props) => {
    const initPolicyData = Object.freeze({
        pid: "",
        tenant: props.match.params.id,
        rego: ""
    });

    const [policyData, updatePolicyData] = useState(initPolicyData)

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };


    const handleChange = (e) => {
        const ucode = e.target.value.trim();
        updatePolicyData({
            ...policyData,
            pid: ucode
        })
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        var ucode = policyData.rego.split('').map(function (c) { return c.charCodeAt(0) });
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                pid: policyData.pid, tenant: policyData.tenant,
                rego: ucode
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/policy'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/' + props.match.params.group + '/policy')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Add Policy</strong>
            </CCardHeader>
            <CCardBody>
                <CForm>
                    <CFormGroup>
                        <CLabel htmlFor="nf-password">Policy ID</CLabel>
                        <CInputGroup>
                            <CInputGroupPrepend>
                                <CInputGroupText className="bg-primary-light text-primary">
                                    <CIcon name="cil-fingerprint" />
                                </CInputGroupText>
                            </CInputGroupPrepend>
                            <CSelect name="pid" custom onChange={handleChange}>
                                <option>Please select a policy</option>
                                <option value={"AccessPolicy"}>AccessPolicy</option>
                                <option value={"RoutePolicy"}>RoutePolicy</option>
                            </CSelect>
                        </CInputGroup>
                    </CFormGroup>
                </CForm>
                <RegoEditor {...props} />
            </CCardBody>
            <CCardFooter>
                <CButton className="button-footer-success" color="success" variant="outline" onClick={handleSubmit}>
                    <CIcon name="cil-scrubber" />
                    <strong>{" "}Add</strong>
                </CButton>
            </CCardFooter>
        </CCard >
    )
}

export default withRouter(PolicyAdd)
