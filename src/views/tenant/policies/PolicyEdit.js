import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools"
import {
    CButton,
    CCard,
    CCardBody,
    CForm,
    CInput,
    CInputGroup,
    CInputGroupAppend,
    CInputGroupPrepend,
    CInputGroupText,
    CLabel,
    CCardHeader,
    CFormGroup,
    CCardFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../../common')
require(`ace-builds/src-noconflict/theme-tomorrow`)
require(`ace-builds/src-noconflict/mode-markdown`)

const PolicyEdit = (props) => {
    const initPolicyData = Object.freeze({
        pid: "",
        tenant: props.match.params.id,
        rego: []
    });
    const [policyData, updatePolicyData] = useState(initPolicyData);

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updatePolicyData(props.location.state)
        }
    }, []);

    function handleRegoChange(newValue) {
        updatePolicyData({
            ...policyData,
            rego: newValue
        })
    }

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
                <strong>Edit Policy ID: {policyData.pid}</strong>
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
                            <CInput name="pid" value={policyData.pid} readOnly />
                            <CInputGroupAppend>
                                <CInputGroupText>
                                    <CIcon name="cil-lock-locked" />
                                </CInputGroupText>
                            </CInputGroupAppend>
                        </CInputGroup>
                    </CFormGroup>
                    <CLabel>OPA Policy</CLabel>
                    <AceEditor
                        name="rego"
                        mode="markdown"
                        theme="tomorrow"
                        onChange={handleRegoChange}
                        fontSize={18}
                        value={policyData.rego.toString()}
                        editorProps={{ $blockScrolling: true }}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                            tabSize: 2,
                        }}
                    />
                </CForm>
            </CCardBody>
            <CCardFooter>
                <CButton className="button-footer-success" color="success" variant="outline" onClick={handleSubmit}>
                    <CIcon name="cil-scrubber" />
                    <strong>{" "}Confirm</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(PolicyEdit)