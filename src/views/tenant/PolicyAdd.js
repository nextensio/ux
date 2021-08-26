import React, { useState, useEffect } from 'react'
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
import { useOktaAuth } from '@okta/okta-react';
import './tenantviews.scss'

var common = require('../../common')
require(`ace-builds/src-noconflict/theme-tomorrow`)
require(`ace-builds/src-noconflict/mode-markdown`)

const PolicyAdd = (props) => {
    const initPolicyData = Object.freeze({
        pid: "",
        tenant: props.match.params.id,
        rego: ""
    });
    const initSnippetType = { type: "", isArray: "" }
    const initOperatorStatus = { "==": true, "!=": true, inequalities: true }
    const [policyData, updatePolicyData] = useState(initPolicyData);
    const [userAttrs, updateUserAttrs] = useState(Object.freeze([]));
    const [bundleAttrs, updateBundleAttrs] = useState(Object.freeze([]));
    const [hostAttrs, updateHostAttrs] = useState(Object.freeze([]));

    // State used to keep track of attribute type and array property. Only same types can be compared
    // for example string == string or boolean != boolean
    const [snippetType, updateSnippetType] = useState(Object.freeze(initSnippetType))
    // State used to keep track of which operators are allowed. (Strings only allow != and ==, Bundle ID 
    // only allows ==)
    const [operatorStatus, updateOperatorStatus] = useState(initOperatorStatus)
    // State which holds [leftHandAttribute, operator, rightHandAttribute]
    const [dummySnippet, updateDummySnippet] = useState(Object.freeze(["", "", ""]))
    // State which holds all dummySnippets
    const [dummyCode, updateDummyCode] = useState(Object.freeze([]))
    // State which is used to determine if user is going to input a value
    const [snippetInput, updateSnippetInput] = useState(false)
    // State which is true if Host is in dummyCode, if so Route will not be disabled
    const [hostFound, setHostFound] = useState(false)

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
                updateUserAttrs(user)
                updateBundleAttrs(bundle)
                updateHostAttrs(host)
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
            if (snippet[0] == "Host") {
                setHostFound(true)
            }
            // Reset dummySnippet
            updateDummySnippet(["", "", ""])
            updateDummyCode(code)
            updateOperatorStatus(initOperatorStatus)
            updateSnippetType(initSnippetType)
            updateSnippetInput(false)
        }
    }

    function handleSnippetType(item) {
        // This function is used to keep track of
        // what type of attribute is selected as well as 
        // its array status
        let type = { ...snippetType }
        type.isArray = item.isArray
        type.type = item.type
        updateSnippetType(type)
        disableOperators(type)
    }

    const handleSnippet = (e, item, index) => {
        handleSnippetType(item)
        let dummy = [...dummySnippet]
        dummy[index] = item.name
        updateDummySnippet(dummy)
        if (index == 2 && snippetInput == true) {
            updateSnippetInput(false)
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
        updateSnippetInput(true)
    }

    const handleSnippetIdClick = (e, item) => {
        let dummy = [...dummySnippet]
        let type = { ...snippetType }
        dummy[0] = item
        if (["User ID", "Bundle ID", "Host", "Route"].includes(item)) {
            type.isArray = "false"
            type.type = "String"
        }
        updateDummySnippet(dummy)
        updateSnippetInput(true)
        updateSnippetType(type)
        disableOperators(type)
    }

    const handleSnippetInputChange = (e, index) => {
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

    const resetSnippetCode = (e) => {
        updateDummySnippet(Object.freeze(["", "", ""]))
        updateOperatorStatus(initOperatorStatus)
        updateSnippetType(initSnippetType)
        updateSnippetInput(false)
    }

    const resetDummyCode = (e) => {
        setHostFound(false)
        updateDummySnippet(Object.freeze(["", "", ""]))
        updateDummyCode(Object.freeze([]))
        updateOperatorStatus(initOperatorStatus)
        updateSnippetType(initSnippetType)
        updateSnippetInput(false)
    }

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

        if (policyData.pid === "applicationAccess") {
            // Access policy generation
            //  Assume a snippet is of one of these two forms and of same color (for single rule)
            //  [userattr, operator, const | AppGroupAttr],
            //  ["Bundle ID", ==, const] (optional)
            let indexNeeded = 0
            let bidSelected = 0
            let Exprs = ""
            let accessPolicyHdr = "package app.access\nallow = is_allowed\ndefault is_allowed = false\n\n"
            if (policyData.rego.length > 36) {
                // Policy exists, we are appending a rule, so skip header lines
                accessPolicyHdr = ""
            }
            let accessPolicyRuleStart = "is_allowed {\n"
            let accessPolicyBid = ""
            for (let snippet of dummyCode) {
                if (snippet[0] === "Bundle ID") {
                    accessPolicyBid = "    input.bid == " + snippet[2] + "\n"
                    bidSelected = 1
                } else {
                    let uatype = getAttrIsArray(snippet[0], "Users")
                    let batype = getAttrIsArray(snippet[2], "Bundles")
                    if (uatype === "true") {
                        // snippet[0] is an array type user attribute
                        Exprs += "    input.user." + snippet[0] + "[_] " + snippet[1] + " "
                    } else if (uatype === "false") {
                        // snippet[0] is a scalar user attribute
                        Exprs += "    input.user." + snippet[0] + " " + snippet[1] + " "
                    } else if (uatype === "none") {
                        // snippet[0] is not a user attribute. This will happen in the case of User Ids.
                        Exprs += "    input.user.uid" + " " + snippet[1] + " "
                    }
                    if (batype === "true") {
                        // snippet[2] is an array type AppGroup attribute
                        Exprs += "data.bundles[bundle]." + snippet[2] + "[_]\n"
                        indexNeeded = 1
                    } else if (batype === "false") {
                        // snippet[2] is a scalar AppGroup attribute
                        Exprs += "data.bundles[bundle]." + snippet[2] + "\n"
                        indexNeeded = 1
                    } else if (batype === "none") {
                        // snippet[2] is not an AppGroup attribute but a constant
                        Exprs += snippet[2] + "\n"
                    }
                }
            }
            let accessPolicyRuleEnd = "}\n\n"
            let accessPolicyRuleIndex = ""
            let accessPolicy = ""
            if (indexNeeded === 1) {
                // One or more user attribute match expressions need values from AppGroup attributes collection
                accessPolicyRuleIndex = "    some bundle\n"
                accessPolicyBid = "    input.bid == data.bundles[bundle].bid\n"
            } else if (bidSelected === 0) {
                // All user attribute match expressions use constants but bundle ID match unspecified
                accessPolicyBid = "Error - ** Bundle ID match missing **\n"
            }
            accessPolicy = accessPolicyHdr + accessPolicyRuleStart + accessPolicyRuleIndex + accessPolicyBid + Exprs + accessPolicyRuleEnd
            handleRegoChange(policyData.rego + accessPolicy)
            resetDummyCode(e)
        }
        if (policyData.pid === "applicationRouting") {
            // Routing policy generation
            //  Assume a snippet is of one of these two forms and of same color (for single rule)
            //  [userattr, operator, const | HostRouteAttr],
            //  ["Host ID", ==, const]  (optional)
            //  [routeTag, ==, const]
            let indexNeeded = 0
            let hostSelected = 0
            let tagSpecified = 0
            let Exprs = ""
            let routePolicyHdr = "package user.routing\ndefault route_tag = \"\"\n\n"
            if (policyData.rego.length > 36) {
                // Policy exists, we are appending a rule, so skip header lines
                routePolicyHdr = ""
            }
            let routePolicyHost = ""
            let routeTagValue = ""
            for (let snippet of dummyCode) {
                if (snippet[0] === "Host") {
                    routePolicyHost = "    input.host == " + snippet[2] + "\n"
                    hostSelected = 1
                } else if (snippet[0] === "Route") {
                    routeTagValue = snippet[2]
                    tagSpecified = 1
                } else {
                    let uatype = getAttrIsArray(snippet[0], "Users")
                    let hatype = getAttrIsArray(snippet[2], "Hosts")
                    if (uatype === "true") {
                        // snippet[0] is an array type user attribute
                        Exprs += "    input.user." + snippet[0] + "[_] " + snippet[1] + " "
                    } else if (uatype === "false") {
                        // snippet[0] is a scalar user attribute
                        Exprs += "    input.user." + snippet[0] + " " + snippet[1] + " "
                    } else if (uatype === "none") {
                        // snippet[0] is not a user attribute. This will happen in the case of User Ids.
                        Exprs += "    input.user.uid" + " " + snippet[1] + " "
                    }
                    if (hatype === "true") {
                        // snippet[2] is an array type Host attribute
                        Exprs += "data.hosts[hostidx].routeattrs[route]." + snippet[2] + "[_]\n"
                        indexNeeded = 1
                    } else if (hatype === "false") {
                        // snippet[2] is a scalar Host attribute
                        Exprs += "data.hosts[hostidx].routeattrs[route]." + snippet[2] + "\n"
                        indexNeeded = 1
                    } else if (hatype === "none") {
                        // snippet[2] is not a Host attribute but a constant
                        Exprs += snippet[2] + "\n"
                    }
                }
            }
            let routePolicyRuleEnd = "}\n\n"
            let routePolicyRuleIndex = ""
            let routePolicy = ""
            if (tagSpecified == 0) {
                // Error - route tag needs to be specified
                routeTagValue = "Error - ** route tag value unspecified **"
            }
            let routePolicyRuleStart = "route_tag = rtag {\n"
            let routePolicyTag = "    rtag := " + routeTagValue + "\n"
            if (indexNeeded === 1) {
                // One or more user attribute match expressions need values from AppGroup attributes collection
                routePolicyRuleIndex = "    some hostidx\n    some route\n"
                routePolicyHost = "    input.host == data.hosts[hostidx].host\n"
                routePolicyTag = "    rtag := data.hosts[hostidx].routeattrs[route].tag\n"
            } else if (hostSelected === 0) {
                // All user attribute match expressions use constants but bundle ID match unspecified
                routePolicyHost = "Error - ** Host match missing **\n"
            }
            routePolicy = routePolicyHdr + routePolicyRuleStart + routePolicyRuleIndex + routePolicyHost + Exprs + routePolicyTag + routePolicyRuleEnd
            handleRegoChange(policyData.rego + routePolicy)
            resetDummyCode(e)
        }
    }

    function getAttrIsArray(name, appliesTo) {
        if (appliesTo == "Users") {
            for (var i = 0; i < userAttrs.length; i++) {
                if (name == userAttrs[i].name) {
                    return userAttrs[i].isArray
                }
            } return "none"
        }
        else if (appliesTo == "Bundles") {
            for (var i = 0; i < bundleAttrs.length; i++) {
                if (name == bundleAttrs[i].name) {
                    return bundleAttrs[i].isArray
                }
            } return "none"
        }
        else if (appliesTo == "Hosts") {
            for (var i = 0; i < hostAttrs.length; i++) {
                if (name == hostAttrs[i].name) {
                    return hostAttrs[i].isArray
                }
            } return "none"
        }
    }

    function disableOperators(type) {
        let operators = { ...operatorStatus }
        if (["String", "Boolean"].includes(type.type)) {
            updateOperatorStatus({
                ...operators,
                inequalities: false
            })
        }
    }

    function handleRegoChange(newValue) {
        updatePolicyData({
            ...policyData,
            rego: newValue
        })
    }

    const handleChange = (e) => {
        const ucode = e.target.value.trim();
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allpolicies'), hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].pid == ucode) {
                        const rego = String.fromCharCode(...data[i].rego);
                        updatePolicyData({
                            ...policyData,
                            pid: ucode,
                            rego: rego
                        })
                        return
                    }
                } updatePolicyData({
                    ...policyData,
                    pid: ucode,
                    rego: ""
                })
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
                <CButton onClick={e => console.log(policyData)}>policyDatas</CButton>
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
                                                {dummySnippet[0] == "" ?
                                                    "User Attrs" :
                                                    dummySnippet[0]
                                                }
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                {policyData.pid == "" &&
                                                    <CDropdownItem
                                                        size="sm"
                                                        className="text-info"
                                                        disabled
                                                    >
                                                        Select PID
                                                    </CDropdownItem>
                                                }
                                                {policyData.pid == "applicationAccess" &&
                                                    <CDropdownItem
                                                        size="sm"
                                                        color={"Bundle ID" == dummySnippet[0] ? "success-light" : "transparent"}
                                                        onClick={e => handleSnippetIdClick(e, "Bundle ID")}
                                                    >
                                                        Bundle ID
                                                    </CDropdownItem>
                                                }
                                                {policyData.pid == "applicationRouting" &&
                                                    <>
                                                        <CDropdownItem
                                                            size="sm"
                                                            color={"Host" == dummySnippet[0] ? "success-light" : "transparent"}
                                                            onClick={e => handleSnippetIdClick(e, "Host")}
                                                        >
                                                            Host
                                                        </CDropdownItem>
                                                        <CDropdownItem
                                                            size="sm"
                                                            color={"route" == dummySnippet[0] ? "success-light" : "transparent"}
                                                            onClick={e => handleSnippetIdClick(e, "Route")}
                                                            disabled={!hostFound}
                                                        >
                                                            Route
                                                        </CDropdownItem>
                                                    </>
                                                }
                                                <CDropdownItem divider />
                                                <CDropdownItem
                                                    size="sm"
                                                    color={"User ID" == dummySnippet[0] ? "success-light" : "transparent"}
                                                    onClick={e => handleSnippetIdClick(e, "User ID")}
                                                >
                                                    User ID
                                                </CDropdownItem>
                                                {userAttrs.map((item, index) => {
                                                    return (
                                                        <CDropdownItem
                                                            size="sm"
                                                            key={item.name}
                                                            color={item.name == dummySnippet[0] ? "success-light" : "transparent"}
                                                            onClick={e => handleSnippet(e, item, 0)}
                                                            disabled={!(snippetType.type == "" || item.type == snippetType.type)}
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
                                                <CDropdownItem color={"==" == dummySnippet[1] ? "success-light" : "transparent"} disabled={!operatorStatus['==']} onClick={e => handleSnippetOperator(e, '==', 1)}>{'=='}</CDropdownItem>
                                                <CDropdownItem color={"!=" == dummySnippet[1] ? "success-light" : "transparent"} disabled={!operatorStatus['!=']} onClick={e => handleSnippetOperator(e, '!=', 1)}>{'!='}</CDropdownItem>
                                                <CDropdownItem color={"<" == dummySnippet[1] ? "success-light" : "transparent"} disabled={!operatorStatus.inequalities} onClick={e => handleSnippetOperator(e, '<', 1)}>{'<'}</CDropdownItem>
                                                <CDropdownItem color={">" == dummySnippet[1] ? "success-light" : "transparent"} disabled={!operatorStatus.inequalities} onClick={e => handleSnippetOperator(e, '>', 1)}>{'>'}</CDropdownItem>
                                                <CDropdownItem color={"<=" == dummySnippet[1] ? "success-light" : "transparent"} disabled={!operatorStatus.inequalities} onClick={e => handleSnippetOperator(e, '<=', 1)}>{'<='}</CDropdownItem>
                                                <CDropdownItem color={">=" == dummySnippet[1] ? "success-light" : "transparent"} disabled={!operatorStatus.inequalities} onClick={e => handleSnippetOperator(e, '>=', 1)}>{'>='}</CDropdownItem>
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
                                                        (snippetInput == true ? "Input" :
                                                            dummySnippet[2] == "" ?
                                                                "Bundle Attrs" :
                                                                dummySnippet[2]) :
                                                        (snippetInput == true ? "Input" :
                                                            dummySnippet[2] == "" ?
                                                                "Host Attrs" :
                                                                dummySnippet[2])}
                                                </CDropdownToggle>
                                                <CDropdownMenu>
                                                    {policyData.pid == "applicationAccess" ?
                                                        <div className="roboto-font">
                                                            <CDropdownItem
                                                                size="sm"
                                                                color={snippetInput == true ? "success-light" : "transparent"}
                                                                onClick={e => handleSnippetManualInput(e, 2)}
                                                            >
                                                                Input
                                                            </CDropdownItem>
                                                            <CDropdownItem divider />
                                                            {bundleAttrs.map((item, index) => {
                                                                return (
                                                                    <CDropdownItem
                                                                        size="sm"
                                                                        key={item.name}
                                                                        color={item.name == dummySnippet[2] ? "success-light" : "transparent"}
                                                                        onClick={e => handleSnippet(e, item, 2)}
                                                                        disabled={!(snippetType.type == "" || item.type == snippetType.type)}

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
                                                                color={snippetInput == true ? "success-light" : "transparent"}
                                                                onClick={e => handleSnippetManualInput(e, 2)}
                                                            >
                                                                Input
                                                            </CDropdownItem>

                                                            <CDropdownItem divider />
                                                            {hostAttrs.map((item, index) => {
                                                                return (
                                                                    <CDropdownItem
                                                                        size="sm"
                                                                        key={item.name}
                                                                        color={item.name == dummySnippet[2] ? "success-light" : "transparent"}
                                                                        onClick={e => handleSnippet(e, item, 2)}
                                                                        disabled={!(snippetType.type == "" || item.type == snippetType.type)}

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
                                        <div className={dummySnippet[0] ? "code-box-active" : "code-box"}>{dummySnippet[0]}</div>
                                        <div className="text-help mt-1">Type: {snippetType.type == "" ? "None" : snippetType.type}</div>
                                    </CCol>
                                    <CCol sm="2">
                                        <div className={dummySnippet[1] ? "code-box-active" : "code-box"}>{dummySnippet[1]}</div>
                                    </CCol>
                                    <CCol sm="5">
                                        {snippetInput == true ?
                                            <CInput onChange={e => handleSnippetInputChange(e, 2)} />
                                            :
                                            <div className={dummySnippet[2] ? "code-box-active" : "code-box"}>{dummySnippet[2]}</div>
                                        }
                                    </CCol>
                                </CRow>

                                <CRow>
                                    <CCol sm="6">
                                        <CButton className="mt-3" block color="danger" onClick={resetSnippetCode}>Clear</CButton>
                                    </CCol>
                                    <CCol sm="6">
                                        <CButton className="mt-3" block color="success" onClick={handleDummyCode}>Add</CButton>
                                    </CCol>
                                </CRow>

                                <CRow>
                                    <CCol sm="12">
                                        <CLabel className="roboto-font mt-3">
                                            Draft
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
                                    <CCol sm="6">
                                        <CButton block color="danger" onClick={resetDummyCode}><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                                    </CCol>
                                    <CCol sm="6">
                                        <CButton block color="success" onClick={e => generatePolicy(e, dummyCode)}><CIcon name="cil-arrow-right" /> <strong>Convert</strong></CButton>
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
                                    <div className="editor-wrapper">
                                        <AceEditor
                                            className="editor"
                                            name="rego"
                                            mode="markdown"
                                            theme="tomorrow"
                                            onChange={handleRegoChange}
                                            fontSize={18}
                                            value={policyData.rego}
                                            showPrintMargin={true}
                                            showGutter={true}
                                            highlightActiveLine={true}
                                            setOptions={{
                                                enableBasicAutocompletion: true,
                                                enableLiveAutocompletion: true,
                                                minLines: 30,
                                                maxLines: 1000,
                                                scrollPastEnd: true,
                                                autoScrollEditorIntoView: true,
                                                enableSnippets: true,
                                                tabSize: 2,
                                            }}
                                        />
                                    </div>
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
