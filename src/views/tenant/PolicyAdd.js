import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools"

import {
    CButton,
    CButtonClose,
    CCard,
    CCardBody,
    CCol,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CForm,
    CInput,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CLabel,
    CPopover,
    CCardHeader,
    CFormGroup,
    CCardFooter,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useOktaAuth } from '@okta/okta-react';
import './tenantviews.scss'

var common = require('../../common')
require(`ace-builds/src-noconflict/theme-tomorrow`)
require(`ace-builds/src-noconflict/mode-markdown`)

const PolicyAdd = (props) => {
    const initPolicyData = Object.freeze({
        pid: "",
        tenant: props.match.params.id,
        rego: []
    });
    const [policyData, updatePolicyData] = useState(initPolicyData);
    const [userAttrs, updateUserAttrs] = useState(Object.freeze([]));
    const [bundleAttrs, updateBundleAttrs] = useState(Object.freeze([]));
    const [hostAttrs, updateHostAttrs] = useState(Object.freeze([]));
    const [bundleOrHostAttrs, updateBundleOrHostAttrs] = useState("Bundle Attrs")
    const [dummyCodeSnippet, updateDummyCodeSnippet] = useState(Object.freeze(["", "", ""]))
    const [dummyCode, updateDummyCode] = useState(Object.freeze([]))

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    const colors = ["success", "primary", "info", "warning", "danger", "dark"]
    const [colorIndex, setColorIndex] = useState(0)

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                let user = []
                let bundle = []
                let host = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users") {
                        user.push(data[i].name)
                    }
                    if (data[i].appliesTo == "Bundles") {
                        bundle.push(data[i].name)
                    }
                    if (data[i].appliesTo == "Hosts") {
                        host.push(data[i].name)
                    }
                }
                updateUserAttrs(user.sort())
                updateBundleAttrs(bundle.sort())
                updateHostAttrs(host.sort())
            });
    }, []);

    function swapBetweenBundleAndHost() {
        if (bundleOrHostAttrs == "Bundle Attrs") {
            updateBundleOrHostAttrs("Host Attrs")
        } else {
            updateBundleOrHostAttrs("Bundle Attrs")
        }
    }

    function handleDummyCode(dummy) {
        let code = [...dummyCode]
        let test = dummy.every(i => i != "")
        let index = colorIndex
        if (test) {
            dummy.push(index)
            if (index < colors.length) {
                setColorIndex(index + 1)
            }
            code.push(dummy)
            updateDummyCodeSnippet(["", "", ""])
            updateDummyCode(code)
        }
    }

    const handleDummyCodeSnippet = (e, item, index) => {
        let dummy = [...dummyCodeSnippet]
        dummy[index] = item
        updateDummyCodeSnippet(dummy)
        handleDummyCode(dummy)
    }

    const snippetColorChange = (e, item) => {
        let code = [...dummyCode]
        let codeIndex = code.indexOf(item)
        let colorIdx = item[3]
        if (colorIdx < colors.length) {
            colorIdx = colorIdx + 1
        } else {
            colorIdx = 0
        }
        code[codeIndex][3] = colorIdx
        updateDummyCode(code)
    }

    const removeSnippetFromCode = (e, item) => {
        let code = [...dummyCode]
        let index = code.indexOf(item)
        code.splice(index, 1)
        updateDummyCode(code)
    }

    const resetDummyCode = (e) => {
        updateDummyCodeSnippet(Object.freeze(["", "", ""]))
        updateDummyCode(Object.freeze([]))
    }

    function handleRegoChange(newValue) {
        updatePolicyData({
            ...policyData,
            rego: newValue
        })
    }

    const handleChange = (e) => {
        var ucode = e.target.value.trim();
        updatePolicyData({
            ...policyData,
            [e.target.name]: ucode
        });
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
                    props.history.push('/tenant/' + props.match.params.id + '/policy')
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
                            <CInput name="pid" onChange={handleChange} />
                        </CInputGroup>
                    </CFormGroup>
                </CForm>

                <CRow>
                    <CCol md="5">
                        <CCard>
                            <CCardHeader>
                                Policy Builder
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol md="4">
                                        <CDropdown className="roboto-font mb-3">
                                            <CDropdownToggle size="sm" caret color="info">
                                                User Attrs
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                {userAttrs.map((item, index) => {
                                                    return (
                                                        <CDropdownItem
                                                            size="sm"
                                                            key={item}
                                                            color={item == dummyCodeSnippet[0] ? "success" : "transparent"}
                                                            onClick={e => handleDummyCodeSnippet(e, item, 0)}
                                                        >
                                                            {item}
                                                        </CDropdownItem>
                                                    )
                                                })}
                                            </CDropdownMenu>
                                        </CDropdown>
                                    </CCol>
                                    <CCol md="2">
                                        <CDropdown className="roboto-font">
                                            <CDropdownToggle size="sm" caret color="info">
                                                <strong>=</strong>
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem color={"==" == dummyCodeSnippet[1] ? "success" : "transparent"} onClick={e => handleDummyCodeSnippet(e, '==', 1)}>{'=='}</CDropdownItem>
                                                <CDropdownItem color={"!=" == dummyCodeSnippet[1] ? "success" : "transparent"} onClick={e => handleDummyCodeSnippet(e, '!=', 1)}>{'!='}</CDropdownItem>
                                                <CDropdownItem color={"<" == dummyCodeSnippet[1] ? "success" : "transparent"} onClick={e => handleDummyCodeSnippet(e, '<', 1)}>{'<'}</CDropdownItem>
                                                <CDropdownItem color={">" == dummyCodeSnippet[1] ? "success" : "transparent"} onClick={e => handleDummyCodeSnippet(e, '>', 1)}>{'>'}</CDropdownItem>
                                                <CDropdownItem color={"<=" == dummyCodeSnippet[1] ? "success" : "transparent"} onClick={e => handleDummyCodeSnippet(e, '<=', 1)}>{'<='}</CDropdownItem>
                                                <CDropdownItem color={">=" == dummyCodeSnippet[1] ? "success" : "transparent"} onClick={e => handleDummyCodeSnippet(e, '>=', 1)}>{'>='}</CDropdownItem>
                                            </CDropdownMenu>
                                        </CDropdown>
                                    </CCol>
                                    <CCol md="4">
                                        <CDropdown className="roboto-font mb-3">
                                            <CDropdownToggle size="sm" caret color="info">
                                                {bundleOrHostAttrs}
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                {bundleOrHostAttrs == "Bundle Attrs" ?
                                                    <div className="roboto-font">
                                                        {bundleAttrs.map((item, index) => {
                                                            return (
                                                                <div>
                                                                    <CDropdownItem
                                                                        size="sm"
                                                                        key={item}
                                                                        color={item == dummyCodeSnippet[2] ? "success" : "transparent"}
                                                                        onClick={e => handleDummyCodeSnippet(e, item, 2)}
                                                                    >
                                                                        {item}
                                                                    </CDropdownItem>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    :
                                                    <div>
                                                        {hostAttrs.map((item, index) => {
                                                            return (
                                                                <div>
                                                                    <CDropdownItem
                                                                        size="sm"
                                                                        key={item}
                                                                        color={item == dummyCodeSnippet[2] ? "success" : "transparent"}
                                                                        onClick={e => handleDummyCodeSnippet(e, item, 2)}
                                                                    >
                                                                        {item}
                                                                    </CDropdownItem>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                }
                                            </CDropdownMenu>
                                        </CDropdown>
                                    </CCol>
                                    <CCol md="2">
                                        <CButton color="info" size="sm" onClick={swapBetweenBundleAndHost}><CIcon name="cil-swap-horizontal" /></CButton>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol md="12">
                                        <CLabel className="roboto-font">Current</CLabel>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol md="4">
                                        <div className="code-box">{dummyCodeSnippet[0]}</div>
                                    </CCol>
                                    <CCol md="2">
                                        <div className="code-box">{dummyCodeSnippet[1]}</div>
                                    </CCol>
                                    <CCol md="4">
                                        <div className="code-box">{dummyCodeSnippet[2]}</div>
                                    </CCol>
                                </CRow>

                                <CRow>
                                    <CCol md="12">
                                        <CLabel className="roboto-font mt-3">
                                            <CPopover
                                                title="Popover title"
                                                content="Click on snippets to change color. Same colors will be AND chained together."
                                            >
                                                <FontAwesomeIcon icon="info-circle" />
                                            </CPopover>
                                            {' '}Draft
                                        </CLabel>
                                        <div><small></small></div>
                                        <div className="roboto-font bg-gray-100 text-dark" style={{ minHeight: '100px', padding: 10 }}>
                                            {dummyCode.map((item, index) => {
                                                return (
                                                    <div>
                                                        <CButton
                                                            key={item}
                                                            value={item}
                                                            className="mb-1"
                                                            onClick={e => snippetColorChange(e, item)}
                                                            color={colors[item[3]]}
                                                            size="sm"
                                                        >
                                                            {item.slice(0, 3).join(' ')} <CButtonClose buttonClass="ml-1 text-white close" onClick={e => removeSnippetFromCode(e, item)} />
                                                        </CButton>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                    </CCol>

                                </CRow>
                                <CRow className="mt-3">
                                    <CCol md="12">
                                        <CButton className="button-footer-danger" variant="outline" color="danger" onClick={resetDummyCode}><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                                        <CButton className="button-footer-success" variant="outline" color="success"><CIcon name="cil-scrubber" /> <strong>Convert</strong></CButton>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>

                    </CCol>
                    <CCol>
                        <CLabel>OPA Policy</CLabel>
                        <AceEditor
                            name="rego"
                            mode="markdown"
                            theme="tomorrow"
                            onChange={handleRegoChange}
                            fontSize={18}
                            editorProps={{ $blockScrolling: true }}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                tabSize: 2,
                            }}
                        />
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

export default withRouter(PolicyAdd)