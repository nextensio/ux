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
    CEmbed,
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
    CSelect,
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
    const initSnippetType = { type: "", isArray: "" }
    const [policyData, updatePolicyData] = useState(initPolicyData);
    const [userAttrs, updateUserAttrs] = useState(Object.freeze([]));
    const [bundleAttrs, updateBundleAttrs] = useState(Object.freeze([]));
    const [hostAttrs, updateHostAttrs] = useState(Object.freeze([]));
    const [snippetType, updateSnippetType] = useState(Object.freeze(initSnippetType))

    const [dummySnippet, updateDummySnippet] = useState(Object.freeze(["", "", ""]))
    const [dummyCode, updateDummyCode] = useState(Object.freeze([]))
    const [snippetInputIndex, updateSnippetInputIndex] = useState(null)

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                let user = []
                let bundle = []
                let host = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users") {
                        user.push(data[i])
                    }
                    if (data[i].appliesTo == "Bundles") {
                        bundle.push(data[i])
                    }
                    if (data[i].appliesTo == "Hosts") {
                        host.push(data[i])
                    }
                }
                updateUserAttrs(user.sort())
                updateBundleAttrs(bundle.sort())
                updateHostAttrs(host.sort())
            });
    }, []);

    const handleDummyCode = (e) => {
        let snippet = [...dummySnippet]
        let code = [...dummyCode]
        // test if every index of dummySnippet is filled
        // dummySnippet example: [userAttr, operand, bundleAttr]
        let test = snippet.every(i => i != "")
        if (test) {
            // Increment colors index if length of colors array is not reached
            code.push(snippet)
            // Reset dummySnippet
            updateDummySnippet(["", "", ""])
            updateDummyCode(code)
            updateSnippetType(initSnippetType)
            updateSnippetInputIndex(null)
        }
    }

    function handleSnippetType(item) {
        // This function is used to keep track of
        // what type of attribute is selected
        let type = { ...snippetType }
        console.log(type)
        type.isArray = item.isArray
        type.type = item.type
        updateSnippetType(type)
    }

    const handleSnippet = (e, item, index) => {
        handleSnippetType(item)
        let dummy = [...dummySnippet]
        dummy[index] = item.name
        updateDummySnippet(dummy)
        if (snippetInputIndex == index) {
            updateSnippetInputIndex(null)
        }
    }

    const handleSnippetOperator = (e, item) => {
        let dummy = [...dummySnippet]
        dummy[1] = item
        updateDummySnippet(dummy)
    }

    const handleSnippetManualInput = (e, index) => {
        let dummy = [...dummySnippet]
        if (dummy[index] != "") {
            dummy[index] = ""
            updateDummySnippet(dummy)
        }
        updateSnippetInputIndex(index)
    }

    const handleSnippetIdInput = (e, item, index) => {
        let dummy = [...dummySnippet]
        dummy[index] = item
        let inputIndex = index == 0 ? 2 : 0
        updateDummySnippet(dummy)
        updateSnippetInputIndex(inputIndex)

    }

    const handleSnippetConst = (e, index) => {
        let dummy = [...dummySnippet]
        dummy[index] = e.target.value
        updateDummySnippet(dummy)
    }


    const removeSnippetFromCode = (e, item) => {
        let code = [...dummyCode]
        let index = code.indexOf(item)
        code.splice(index, 1)
        updateDummyCode(code)
    }

    const resetDummyCode = (e) => {
        updateDummySnippet(Object.freeze(["", "", ""]))
        updateDummyCode(Object.freeze([]))
    }

    // FOR ASHWIN --------------------------------------
    const generatePolicy = (e, dummyCode) => {
        // All you need to focus on is dummyCode object -->
        // dummyCode example:
        // [
        //  [userattr1 or const, operator, bundleattr1 or hostattr1 or const],
        //  [userattr2 or const, operator, bundleattr2 or hostattr2 or const],
        //  [userId, operator, userIdValue],
        //  [bundleIdValue or hostIdValue, operator, bundleId or hostId]
        // ]
        // What are the operator types? 
        //          ==, !=, >, <, >=, <=
        // Where can I find if it is applicationAccess or applicationRouting?
        //          policyData.pid == applicationAccess || applicationRouting 

        console.log('OPA code')
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
                <CButton onClick={e => console.log(snippetType)}>snippetType</CButton>
                <CButton onClick={e => console.log(dummySnippet)}>dummySnippet</CButton>
                <CButton onClick={e => console.log(snippetInputIndex)}>snippetInputIndex</CButton>

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
                                <option value={"applicationAccess"}>applicationAccess</option>
                                <option value={"applicationRouting"}>applicationRouting</option>
                            </CSelect>
                        </CInputGroup>
                    </CFormGroup>
                </CForm>

                <CRow>
                    <CCol md="5">
                        <CCard>
                            <CCardHeader>
                                Policy Builder
                                <div className="text-muted small">
                                    Select a user attribute, operand, and a bundle/host attribute to build your code!
                                </div>
                            </CCardHeader>
                            <CCardBody>
                                <CRow>
                                    <CCol sm="5">
                                        <CDropdown className="roboto-font mb-3">
                                            <CDropdownToggle size="sm" caret color="info">
                                                {snippetInputIndex == 0 ? "INPUT" :
                                                    dummySnippet[0] == "" ?
                                                        "User Attrs" :
                                                        dummySnippet[0]
                                                }
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem
                                                    size="sm"
                                                    color={0 == snippetInputIndex ? "success-light" : "transparent"}
                                                    onClick={e => handleSnippetManualInput(e, 0)}
                                                    disabled={2 == snippetInputIndex}
                                                >
                                                    INPUT
                                                </CDropdownItem>
                                                <CDropdownItem
                                                    size="sm"
                                                    color={"User ID" == dummySnippet[0] ? "success-light" : "transparent"}
                                                    onClick={e => handleSnippetIdInput(e, "User ID", 0)}
                                                >
                                                    User ID
                                                </CDropdownItem>
                                                <CDropdownItem divider />
                                                {userAttrs.map((item, index) => {
                                                    return (
                                                        <CDropdownItem
                                                            size="sm"
                                                            key={item.name}
                                                            color={item.name == dummySnippet[0] ? "success-light" : "transparent"}
                                                            onClick={e => handleSnippet(e, item, 0)}
                                                            disabled={!(snippetType.type == "" || (item.isArray == snippetType.isArray && item.type == snippetType.type))}
                                                        >
                                                            {item.name}
                                                        </CDropdownItem>
                                                    )
                                                })}
                                            </CDropdownMenu>
                                        </CDropdown>
                                    </CCol>
                                    <CCol sm="2">
                                        <CDropdown className="roboto-font mb-3">
                                            <CDropdownToggle size="sm" caret color="info">
                                                <strong>=</strong>
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem color={"==" == dummySnippet[1] ? "success-light" : "transparent"} onClick={e => handleSnippetOperator(e, '==', 1)}>{'=='}</CDropdownItem>
                                                <CDropdownItem color={"!=" == dummySnippet[1] ? "success-light" : "transparent"} onClick={e => handleSnippetOperator(e, '!=', 1)}>{'!='}</CDropdownItem>
                                                <CDropdownItem color={"<" == dummySnippet[1] ? "success-light" : "transparent"} onClick={e => handleSnippetOperator(e, '<', 1)}>{'<'}</CDropdownItem>
                                                <CDropdownItem color={">" == dummySnippet[1] ? "success-light" : "transparent"} onClick={e => handleSnippetOperator(e, '>', 1)}>{'>'}</CDropdownItem>
                                                <CDropdownItem color={"<=" == dummySnippet[1] ? "success-light" : "transparent"} onClick={e => handleSnippetOperator(e, '<=', 1)}>{'<='}</CDropdownItem>
                                                <CDropdownItem color={">=" == dummySnippet[1] ? "success-light" : "transparent"} onClick={e => handleSnippetOperator(e, '>=', 1)}>{'>='}</CDropdownItem>
                                            </CDropdownMenu>
                                        </CDropdown>
                                    </CCol>
                                    <CCol sm="5">
                                        {!policyData.pid ?
                                            <div className="roboto-font text-info">Select a Policy ID</div>
                                            :
                                            <CDropdown className="roboto-font mb-3">
                                                <CDropdownToggle size="sm" caret color="info">
                                                    {policyData.pid == "applicationAccess" ?
                                                        (snippetInputIndex == 2 ? "INPUT" :
                                                            dummySnippet[2] == "" ?
                                                                "Bundle Attrs" :
                                                                dummySnippet[2]) :
                                                        (snippetInputIndex == 2 ? "INPUT" :
                                                            dummySnippet[2] == "" ?
                                                                "Host Attrs" :
                                                                dummySnippet[2])}
                                                </CDropdownToggle>
                                                <CDropdownMenu>
                                                    {policyData.pid == "applicationAccess" ?
                                                        <div className="roboto-font">
                                                            <CDropdownItem
                                                                size="sm"
                                                                color={2 == snippetInputIndex ? "success-light" : "transparent"}
                                                                onClick={e => handleSnippetManualInput(e, 2)}
                                                                disabled={0 == snippetInputIndex}
                                                            >
                                                                INPUT
                                                            </CDropdownItem>
                                                            <CDropdownItem
                                                                size="sm"
                                                                color={"Bundle ID" == dummySnippet[2] ? "success-light" : "transparent"}
                                                                onClick={e => handleSnippetIdInput(e, "Bundle ID", 2)}
                                                            >
                                                                Bundle ID
                                                            </CDropdownItem>
                                                            <CDropdownItem divider />
                                                            {bundleAttrs.map((item, index) => {
                                                                return (
                                                                    <CDropdownItem
                                                                        size="sm"
                                                                        key={item.name}
                                                                        color={item.name == dummySnippet[2] ? "success-light" : "transparent"}
                                                                        onClick={e => handleSnippet(e, item, 2)}
                                                                        disabled={!(snippetType.type == "" || (item.isArray == snippetType.isArray && item.type == snippetType.type))}

                                                                    >
                                                                        {item.name}
                                                                    </CDropdownItem>
                                                                )
                                                            })}
                                                        </div>
                                                        :
                                                        <div>
                                                            <CDropdownItem
                                                                size="sm"
                                                                color={2 == snippetInputIndex ? "success-light" : "transparent"}
                                                                onClick={e => handleSnippetManualInput(e, 2)}
                                                                disabled={0 == snippetInputIndex}
                                                            >
                                                                INPUT
                                                            </CDropdownItem>
                                                            <CDropdownItem
                                                                size="sm"
                                                                color={"Host" == dummySnippet[2] ? "success-light" : "transparent"}
                                                                onClick={e => handleSnippetIdInput(e, "Host", 0)}
                                                            >
                                                                Host
                                                            </CDropdownItem>
                                                            <CDropdownItem
                                                                size="sm"
                                                                color={"route" == dummySnippet[2] ? "success-light" : "transparent"}
                                                                onClick={e => handleSnippetIdInput(e, "Route", 0)}
                                                            >
                                                                Route Tag
                                                            </CDropdownItem>
                                                            <CDropdownItem divider />
                                                            {hostAttrs.map((item, index) => {
                                                                return (
                                                                    <CDropdownItem
                                                                        size="sm"
                                                                        key={item.name}
                                                                        color={item.name == dummySnippet[2] ? "success-light" : "transparent"}
                                                                        onClick={e => handleSnippet(e, item, 2)}
                                                                        disabled={!(snippetType.type == "" || (item.isArray == snippetType.isArray && item.type == snippetType.type))}

                                                                    >
                                                                        {item.name}
                                                                    </CDropdownItem>
                                                                )
                                                            })}
                                                        </div>
                                                    }
                                                </CDropdownMenu>
                                            </CDropdown>
                                        }
                                    </CCol>
                                </CRow>

                                <CRow>
                                    <CCol sm="12">
                                        <CLabel className="roboto-font">Current</CLabel>
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol sm="5">
                                        {snippetInputIndex == 0 ?
                                            <CInput onChange={e => handleSnippetConst(e, 0)} />
                                            :
                                            <div className={dummySnippet[0] ? "code-box-active" : "code-box"}>{dummySnippet[0]}</div>
                                        }

                                    </CCol>
                                    <CCol sm="2">
                                        <div className={dummySnippet[1] ? "code-box-active" : "code-box"}>{dummySnippet[1]}</div>
                                    </CCol>
                                    <CCol sm="5">
                                        {snippetInputIndex == 2 ?
                                            <CInput onChange={e => handleSnippetConst(e, 2)} />
                                            :
                                            <div className={dummySnippet[2] ? "code-box-active" : "code-box"}>{dummySnippet[2]}</div>
                                        }
                                    </CCol>
                                </CRow>

                                <CRow>
                                    <CCol sm="12">
                                        <CButton className="mt-3" block color="success" onClick={handleDummyCode}>ADD</CButton>
                                    </CCol>
                                </CRow>

                                <CRow>
                                    <CCol sm="12">
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
                                                            size="sm"
                                                            color="success"
                                                        >
                                                            {item.join(' ')} <CButtonClose buttonClass="ml-1 text-white close" onClick={e => { removeSnippetFromCode(e, item); e.stopPropagation() }} />
                                                        </CButton>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                    </CCol>

                                </CRow>
                                <CRow className="mt-3">
                                    <CCol sm="12">
                                        <CButton className="button-footer-danger" variant="outline" color="danger" onClick={resetDummyCode}><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                                        <CButton className="button-footer-success" variant="outline" color="success"><strong>Convert</strong> <CIcon name="cil-arrow-right" /></CButton>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>

                    </CCol>
                    <CCol md="7">
                        <CCard>
                            <CCardHeader>OPA Policy</CCardHeader>
                            <CCardBody>
                                <CEmbed>
                                    <AceEditor
                                        className="editor"
                                        name="rego"
                                        mode="markdown"
                                        theme="tomorrow"
                                        onChange={handleRegoChange}
                                        fontSize={18}
                                        value={policyData.ucode}
                                        showPrintMargin={true}
                                        showGutter={true}
                                        highlightActiveLine={true}
                                        setOptions={{
                                            enableBasicAutocompletion: true,
                                            enableLiveAutocompletion: true,
                                            minLines: 10,
                                            maxLines: 1000,
                                            scrollPastEnd: true,
                                            autoScrollEditorIntoView: true,
                                            enableSnippets: true,
                                            tabSize: 2,
                                        }}
                                    />
                                </CEmbed>
                            </CCardBody>
                        </CCard>
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