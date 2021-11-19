import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCardFooter,
    CCol,
    CForm,
    CFormGroup,
    CFormText,
    CLabel,
    CListGroup,
    CListGroupItem,
    CModal,
    CModalBody,
    CModalHeader,
    CModalFooter,
    CInput,
    CInvalidFeedback,
    CRow,
    CSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import CreatableSelect from 'react-select/creatable';
import './tenantviews.scss'

var common = require('../../common')

const TracingRule = (props) => {
    const initOperatorStatus = { "==": true, "!=": false, inequalities: false }
    const initSnippetType = { type: "User Attributes", isArray: "false" }
    const initSnippetData = ["User Attributes", "==", ""]

    const [uids, updateUids] = useState(Object.freeze([]))
    const [userAttrs, updateUserAttrs] = useState(Object.freeze([]))
    const [userAttrNames, updateUserAttrNames] = useState(Object.freeze([]))
    const [operatorStatus, updateOperatorStatus] = useState(initOperatorStatus)
    const [snippetData, updateSnippetData] = useState(initSnippetData)
    const [snippetType, updateSnippetType] = useState(initSnippetType)
    const [editingSnippet, setEditingSnippet] = useState("")
    const initRuleData = Object.freeze({
        rid: "",
        rule: []
    })
    const [ruleData, updateRuleData] = useState(initRuleData)
    const [editingRule, setEditingRule] = useState(Object.freeze({}))
    const [existingRules, updateExistingRules] = useState(Object.freeze([]))
    const [errObj, updateErrObj] = useState({})
    const [deleteModal, setDeleteModal] = useState(false)
    const [generatePolicyModal, setGeneratePolicyModal] = useState(false)
    const [invalidPolicyModal, setInvalidPolicyModal] = useState(false);


    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allusers'), hdrs)
            .then(response => response.json())
            .then(data => {
                var uids = []
                for (var i = 0; i < data.length; i++) {
                    uids.push({ value: data[i].uid, label: data[i].uid })
                }
                updateUids(uids)
            });
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                var userAttrObjs = []
                var userAttrNames = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users") {
                        userAttrObjs.push(data[i])
                        userAttrNames.push({ value: data[i].name, label: data[i].name })
                    }
                }
                updateUserAttrNames(userAttrNames)
                updateUserAttrs(userAttrObjs)
            })
    }, [])

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alltracereqrules'), hdrs)
            .then(response => response.json())
            .then(data => updateExistingRules(data))

    }, [])

    const handleChange = (e) => {
        updateRuleData({
            ...ruleData,
            [e.target.name]: e.target.value
        })
    }

    const handleLHSSelect = (e) => {
        let value = e.target.value
        let snip = [...snippetData]
        let type = snippetType.type
        let newType = getTypeFromLHS(value)
        if (newType != type) {
            getOperators(newType)
            updateSnippetData([value, "==", ""])
        } else {
            snip[0] = value
            updateSnippetData(snip)
        }
    }

    function getTypeFromLHS(value) {
        if (value == "User ID") {
            updateSnippetType({ type: "User ID", isArray: "false" })
            return "User ID"
        }
        if (value == "User Attributes") {
            updateSnippetType({ type: "User Attributes", isArray: "false" })
            return "User Attributes"
        }
        for (var i = 0; i < userAttrs.length; i++) {
            if (userAttrs[i].name == value) {
                updateSnippetType({ type: userAttrs[i].type, isArray: userAttrs[i].isArray })
                return userAttrs[i].type
            }
        }
    }

    function getOperators(type) {
        let ops = { "==": true, "!=": true, inequalities: true }
        if (type == "User Attributes") {
            ops["!="] = false
            ops.inequalities = false
        }
        if (type == "String" || type == "Boolean" || type == "User ID") {
            ops.inequalities = false
        }
        updateOperatorStatus(ops)
    }

    const handleOperatorSelect = (e) => {
        let value = e.target.value
        let snip = [...snippetData]
        snip[1] = value
        updateSnippetData(snip)
    }

    const handleRHS = (e) => {
        let value = e.target.value
        let snip = [...snippetData]
        snip[2] = value
        updateSnippetData(snip)
    }

    const handleRHSUid = (e) => {
        let value = e
        let snip = [...snippetData]
        snip[2] = value
        updateSnippetData(snip)
    }

    function mapObjValToString(val) {
        let stringifiedVal = val.map(option => {
            return option.value
        })
        return stringifiedVal.toString()
    }

    const pushSnippetToRule = (e) => {
        let snippet = [...snippetData]
        let rule = { ...ruleData }
        // test if every index of snippetIndex is filled
        // snippet example: [userAttr, operand, bundleAttr]
        let test = snippet.every(i => i != "")
        if (test) {
            if (editingSnippet) {
                removeSnippetFromRule(editingSnippet)
                setEditingSnippet("")
            }
            if (snippet[0] == "User ID" || snippet[0] == "User Attributes") {
                snippet[2] = mapObjValToString(snippet[2])
            }
            // Append the type for use later
            snippet.push(snippetType.type)
            // Append the isArray for use later
            snippet.push(snippetType.isArray)
            rule.rule.push(snippet)
            updateRuleData(rule)
            // Reset snippetData
            resetSnippetData()
        }
    }

    function resetSnippetData() {
        updateSnippetData(initSnippetData)
        updateOperatorStatus(initOperatorStatus)
        updateSnippetType(initSnippetType)
    }

    function mapStringValToObj(val) {
        let obj = val.split(",").map(i => {
            return { label: i, value: i }
        })
        return obj
    }

    const populateSnippetEditor = (item) => {
        if (item[0] == "User ID" || item[0] == "User Attributes") {
            item[2] = mapStringValToObj(item[2])
        }
        setEditingSnippet(item)
        let snippet = [...item]
        resetSnippetData()
        updateSnippetType({
            type: snippet[3],
            isArray: snippet[4]
        })
        getOperators(snippet[3])
        updateSnippetData(snippet.splice(0, 3))
    }

    const removeSnippetFromRule = (item) => {
        let rule = { ...ruleData }
        const index = rule.rule.indexOf(item)
        rule.rule.splice(index, 1)
        updateRuleData(rule)
    }

    function validate() {
        let err = {}
        if (!ruleData.rid) {
            err.rid = true
        } if (ruleData.rule.length == 0) {
            err.rule = true
        }
        updateErrObj(err)
        return err
    }

    const resetRuleData = (e) => {
        setDeleteModal(!deleteModal)
        updateRuleData({
            ...initRuleData,
        })
    }

    const handleSubmit = (e) => {
        let err = validate()
        if (Object.keys(err).length != 0) {
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                rid: ruleData.rid,
                rule: ruleData.rule
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/tracereqrule/'), requestOptions)
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
                    let rules = [...existingRules]
                    if (Object.keys(editingRule).length != 0) {
                        let index = rules.indexOf(editingRule)
                        rules.splice(index, 1)
                        setEditingRule({})
                    }
                    updateExistingRules([
                        ...rules,
                        ruleData
                    ])
                    updateRuleData({
                        ...initRuleData,
                    })
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleRuleDelete = (rule) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/tracereqrule/' + rule.rid), hdrs)
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
                }
                let existing = [...existingRules]
                let index = existing.indexOf(rule)
                existing.splice(index, 1)
                updateExistingRules(existing)
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const RHSComponent = (LHSValue) => {
        if (LHSValue == "User ID") {
            return (
                <CreatableSelect
                    name="uid"
                    options={uids}
                    value={snippetData[2]}
                    isSearchable
                    isMulti
                    onChange={handleRHSUid}
                />
            )
        } else if (LHSValue == "User Attributes") {
            return (
                <CreatableSelect
                    name="userAttrs"
                    options={userAttrNames}
                    value={snippetData[2]}
                    isSearchable
                    isMulti
                    onChange={handleRHSUid}
                />
            )
        } else {
            return (
                <CInput value={snippetData[2]} onChange={handleRHS} disabled={!snippetData[0]} />
            )
        }
    }

    // ------------------Policy generation functions-------------------------

    const generatePolicyFromTraceReqRules = (e, existingRules) => {
        // Trace policy generation
        // existingRules contains data in this format :
        //  [ruleid1, rule:[[snippet1], [snippet2], [snippet3], ..]]
        //  [ruleid2, rule:[[snippet1], [snippet2], ..]]
        //  [ruleid3, rule:[[snippet1], [snippet2], ..]]
        //  [ruleid4, rule:[[snippet1], [snippet2], [snippet3], ..]]
        //    and so on ...
        //  A snippet is of this form :
        //  [userattr, operator, const, type, isArray] where
        //  type == "string", "boolean", "number"
        //  isArray == "true" or "false"
        //  operator values are ==, !=, >, <, >=, <=

        let RetVal = [""]
        let RegoPolicy = ""
        RegoPolicy = generateTraceReqPolicyHeader(RegoPolicy)
        // for each entry/row in existingRules, generate Rego code
        for (var i = 0; i < existingRules.length; i++) {
            RegoPolicy = processTraceReqRule(e, existingRules[i], RegoPolicy, i)
        }
        RetVal[0] = ""
        RetVal[1] = RegoPolicy
        return RetVal
    }

    function getTraceReqRuleLeftToken(snippet) {
        return snippet[0]
    }

    function getTraceReqRuleRightToken(snippet) {
        return snippet[2]
    }

    function getTraceReqRuleOpToken(snippet) {
        return snippet[1]
    }

    function getTraceReqRuleTokenType(snippet) {
        return snippet[3]
    }

    function getTraceReqRuleTokenValue(name, snippet) {
        if (name === "User ID") {
            return "uid"
        }
        if (name === "User Attributes") {
            return "attr"
        }
        if (snippet[4] == "true") {
            return "array"
        } else {
            return "single"
        }
    }

    function traceReqRightTokenArray(rtok, uatype) {
        let rtokenarray = rtok.split(' ')
        // Now remove null string elements from array
        let newarray = [""]
        let j = 0
        let rtoken1 = ""
        for (var i = 0; i < rtokenarray.length; i++) {
            rtoken1 = rtokenarray[i].trim()
            if (rtoken1.length > 0) {
                if (uatype === "string") {
                    if (!rtoken1.startsWith('"')) {
                        rtoken1 = '"' + rtoken1
                    }
                    if (!rtoken1.endsWith('"')) {
                        rtoken1 += '"'
                    }
                } else if (uatype === "number") {
                    if (rtoken1.includes('"')) {
                        rtoken1 = rtoken1.replaceAll('"', ' ').trim()
                    }
                }
                newarray[j] = rtoken1
                j++
            }
        }
        return newarray
    }

    function traceReqCheckWildCard(rtok) {
        if (rtok.includes('*')) {
            return true
        }
        if (rtok.includes('?')) {
            return true
        }
        if (rtok.includes('[') && rtok.includes(']')) {
            return true
        }
        return false
    }

    function traceReqProcessWildCard(ltok, rtok, op, lts) {
        let Mexpr = "glob.match(" + rtok + ", [], input.user." + ltok + lts
        if (op === "==") {
            Mexpr = "    " + Mexpr + ")\n"
        } else {
            Mexpr = "    !" + Mexpr + ")\n"
        }
        return Mexpr
    }

    function traceReqProcessArray(ltok, rtarray, op, lts) {
        // When optoken is ==, we need
        //   foobararray := [value1, value2, value3, ..]
        //   input.user.uid == foobararray[_]
        // When optoken is !=, we need
        //   input.user.uid != value1
        //   input.user.uid != value2 and so on
        // Logical OR for == changes to logical AND for !=
        let Aexpr = ""
        if (op === "!=") {
            for (var i = 0; i < rtarray.length; i++) {
                Aexpr += "    input.user." + ltok + lts + " != " + rtarray[i] + "\n"
            }
        } else {
            Aexpr = "    " + ltok + "array := ["
            for (var i = 0; i < rtarray.length; i++) {
                if (i > 0) {
                    Aexpr += ", "
                }
                Aexpr += rtarray[i]
            }
            Aexpr += "]\n"
            Aexpr += "    input.user." + ltok + lts + " == " + ltok + "array[_]\n"
        }
        return Aexpr
    }

    function generateTraceReqPolicyHeader(policyData) {
        return policyData +
            "package user.tracing\ndefault request = {\"no\": [\"\"]}\n\n"
    }

    function processTraceReqRule(e, traceReqRule, policyData, ruleIndex) {
        let attrSpecified = 0
        let traceReqPolicyAttr = "** Error **"
        let traceReqAttrValue = "\"all\""
        let traceReq = "{\"" + traceReqRule.rid + "\": "
        let Exprs = ""
        ruleIndex += 1
        let RuleId = "tid" + ruleIndex.toString()
        let RuleStart = "request = " + RuleId + " {\n"
        if (ruleIndex > 1) {
            RuleStart = " else = " + RuleId + " {\n"
        }
        for (let snippet of traceReqRule.rule) {
            let ltoken = getTraceReqRuleLeftToken(snippet)
            let uavalue = getTraceReqRuleTokenValue(ltoken, snippet)
            let uatype = getTraceReqRuleTokenType(snippet).toLowerCase()
            let rtoken = getTraceReqRuleRightToken(snippet)
            let rtokenarray = [""]
            let optoken = getTraceReqRuleOpToken(snippet)

            // Do some pre-processing on rtoken to figure out more details.
            // rtoken is always a constant. Could be single value or array
            // of values.
            // Single value can have wild card if string type. Support only '*'
            // for now, with delimiter as '.'.
            // Multiple values can be entered as [x y z] or [x,y,z] or [x, y, z]
            // For string values, add double quotes if missing.
            // Always trim all values.
            // For processing array of values, first replace any comma with a
            // space, then split based on space. Remove any null strings to
            // compress array.
            // To search for anything other than a word or whitespace, use
            // 'const regex = /[^\w\s]/g' if using regexp matching (future).

            let haswildcard = false
            let issingle = true
            let lts = "[_]"
            let rts = "array[_]"

            rtoken = rtoken.trim()
            if (uavalue === "attr") {
		if (rtoken.includes(',')) {
                    rtoken = rtoken.replaceAll(',', ' ').trim()
		}
                traceReqAttrValue = traceReqRightTokenArray(rtoken, "string")
                attrSpecified = 1
            } else if ((uatype === "string") || (uavalue === "uid")) {
                // User attribute is string type. rtoken must be a string or
                // string array
                if (rtoken.includes(',')) {
                    rtoken = rtoken.replaceAll(',', ' ').trim()
                }
                if (rtoken.includes(' ')) {
                    // Seems to be case of multiple string values
                    issingle = false
                    rtokenarray = traceReqRightTokenArray(rtoken, "string")
                }
                if (issingle) {
                    haswildcard = traceReqCheckWildCard(rtoken)
                    if (!rtoken.startsWith('"')) {
                        rtoken = '"' + rtoken
                    }
                    if (!rtoken.endsWith('"')) {
                        rtoken += '"'
                    }
                }
            } else {
                if (rtoken.includes(',')) {
                    rtoken = rtoken.replaceAll(',', ' ').trim()
                }
                if (rtoken.includes(' ')) {
                    // Seems to be case of multiple non-string values
                    issingle = false
                    rtokenarray = traceReqRightTokenArray(rtoken, uatype)
                }
            }
            if (issingle) {
                rts = ""
            }
            if (uavalue != "array") {
                lts = ""
            }
            if (uavalue === "attr") {
                // Do nothing
            } else if (uavalue === "uid") {
                // ltoken is user id
                if (!issingle) {
                    // We have an array of values to match this attribute
                    Exprs += traceReqProcessArray("uid", rtokenarray, optoken, "")
                } else {
                    // We have a single value to match
                    if (haswildcard) {
                        // glob.match("*foo.com", [], input.user.uid)
                        Exprs += traceReqProcessWildCard("uid", rtoken, optoken, "")
                    } else {
                        Exprs += "    input.user.uid " + optoken + " " + rtoken + "\n"
                    }
                }
            } else {
                // ltoken is a user attribute.
                // It could be matched with a single value, or with multiple
                // values. If single value, it could have a wildcard.
                if (!issingle) {
                    // We have an array of values to match this attribute
                    Exprs += traceReqProcessArray(ltoken, rtokenarray, optoken, lts)
                } else {
                    // We have a single value to match
                    if (haswildcard && (uatype === "string")) {
                        Exprs += traceReqProcessWildCard(ltoken, rtoken, optoken, lts)
                    } else {
                        Exprs += "    input.user." + ltoken + lts
                        Exprs += " " + optoken + " " + rtoken + rts + "\n"
                    }
                }
            }
        }
        traceReq = traceReq + "[" + traceReqAttrValue + "]}\n"
        traceReqPolicyAttr = "    " + RuleId + " := " + traceReq
        let RuleEnd = "}"
        return policyData + RuleStart + Exprs + traceReqPolicyAttr + RuleEnd
    }

    // ------------------Policy generation functions end----------------------

    const triggerPolicyModal = (e) => {
        const retval = generatePolicyFromTraceReqRules(e, existingRules)
        if (!retval[0]) {
            setGeneratePolicyModal(true)
        } else (setInvalidPolicyModal(true))
    }

    const handlePolicyGeneration = (e) => {
        var retval = generatePolicyFromTraceReqRules(e, existingRules)
        var byteRego = retval[1].split('').map(function (c) { return c.charCodeAt(0) });
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                pid: "TracePolicy", tenant: props.match.params.id,
                rego: byteRego
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
                    setGeneratePolicyModal(false)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    const editExistingRule = (rule) => {
        updateRuleData(rule)
        setEditingRule(rule)
    }

    return (
        <>
            <CCard>
                <CCardHeader>
                    Existing Trace Rules
                    <CButton
                        className="float-right"
                        color="primary"
                        onClick={triggerPolicyModal}
                    >
                        <FontAwesomeIcon icon="bullseye" className="mr-1" />Generate Policy
                    </CButton>

                </CCardHeader>
                <CCardBody className="roboto-font">
                    <CListGroup>
                        {existingRules.length != 0 ?
                            existingRules.map(rule => {
                                return (
                                    <CListGroupItem color={editingRule == rule ? "warning" : "info"}>
                                        <strong>{rule.rid}</strong>
                                        <CButton
                                            className="float-right"
                                            color="danger"
                                            variant="outline"
                                            shape="square"
                                            size="sm"
                                            onClick={e => handleRuleDelete(rule)}
                                        >
                                            Delete
                                        </CButton>
                                        <CButton
                                            className="float-right mr-1"
                                            color="primary"
                                            variant="outline"
                                            shape="square"
                                            size="sm"
                                            onClick={e => editExistingRule(rule)}
                                        >
                                            Edit
                                        </CButton>
                                        <pre>{rule.rule.map(snippet => {
                                            return (
                                                <div>{snippet.slice(0, 3).join(' ')}</div>
                                            )
                                        })}
                                        </pre>
                                    </CListGroupItem>
                                )
                            })
                            :
                            <CListGroupItem color="warning">
                                <strong>No Rules Exist</strong>
                            </CListGroupItem>
                        }
                    </CListGroup>
                </CCardBody>
            </CCard>
            <CCard>
                <CCardHeader>
                    Rule Generator for Tracing
                </CCardHeader>
                <CCardBody className="roboto-font">
                    <CRow>
                        <CCol sm="12">
                            <CForm>
                                <CFormGroup className="mt-n3">
                                    <CLabel>Rule Name</CLabel>
                                    <CInput name="rid" value={ruleData.rid} onChange={handleChange} invalid={errObj.rid} />
                                    {!errObj.rid ?
                                        <CFormText>Enter a rule name. Ex: Rule to allow tracing for C-Suites...</CFormText>
                                        :
                                        <CInvalidFeedback>Please enter a valid name</CInvalidFeedback>
                                    }
                                </CFormGroup>
                            </CForm>
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol sm="12">
                            <CCard accentColor={(ruleData.rule.length == 0 && errObj.rule == true) ? "danger" : "success"}>
                                <CCardBody>
                                    <CRow>
                                        <CCol sm="12">
                                            <CLabel>Snippet Creator</CLabel>
                                            <div className="text-muted mb-2"><em>Type: {snippetType.type ? snippetType.type : "None"}</em></div>
                                        </CCol>
                                    </CRow>
                                    <CRow className="mb-3">
                                        <CCol sm="4">
                                            <CSelect value={snippetData[0]} custom onChange={handleLHSSelect} placeholder="User Attrs">
                                                <option value="User Attributes">User Attributes</option>
                                                <option value="User ID">User ID</option>
                                                {userAttrs.map((item, index) => {
                                                    return (
                                                        <option
                                                            value={item.name}
                                                        >
                                                            {item.name}
                                                        </option>
                                                    )
                                                })}
                                            </CSelect>
                                        </CCol>
                                        <CCol sm="4">
                                            <CSelect value={snippetData[1]} custom onChange={handleOperatorSelect} disabled={!snippetData[0]} >
                                                <option value="==">{'=='}</option>
                                                <option value="!=" hidden={!operatorStatus["!="]}>{'!='}</option>
                                                <option value=">=" hidden={!operatorStatus.inequalities}>{'>='}</option>
                                                <option value="<=" hidden={!operatorStatus.inequalities}>{'<='}</option>
                                                <option value=">" hidden={!operatorStatus.inequalities}>{'>'}</option>
                                                <option value="<" hidden={!operatorStatus.inequalities}>{'<'}</option>
                                            </CSelect>
                                        </CCol>
                                        <CCol sm="4">
                                            {RHSComponent(snippetData[0])}
                                        </CCol>
                                    </CRow>
                                    <CRow>
                                        <CCol sm="12">
                                            <CButton className="mt-3 mr-3" shape="pill" size="lg" color="danger" onClick={resetSnippetData}>Clear</CButton>
                                            <CButton className="mt-3" shape="pill" size="lg" color="success" onClick={pushSnippetToRule}>{editingSnippet ? "Modify" : "Add"}</CButton>
                                        </CCol>
                                    </CRow>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>

                    <CRow>
                        <CCol sm="12">
                            <CLabel>Current Rule</CLabel>
                            <CFormText>These snippets will be AND'ed together.</CFormText>
                            <div className="roboto-font bg-gray-100 text-dark" style={{ minHeight: '100px', padding: 10 }}>
                                <div hidden={!(ruleData.rule.length == 0 && errObj.rule == true)} className="text-danger">Please add at least one snippet!</div>

                                <CListGroup>
                                    {ruleData.rule.map((item, index) => {
                                        return (
                                            <div>
                                                <CListGroupItem
                                                    key={item}
                                                    value={item}
                                                    className="mb-1"
                                                    size="sm"
                                                    color={item == editingSnippet ? "warning" : "success"}
                                                >
                                                    {item.slice(0, 3).join(' ')}
                                                    <CButton
                                                        className="button-table float-right"
                                                        color='danger'
                                                        variant='ghost'
                                                        size="sm"
                                                        onClick={() => removeSnippetFromRule(item)}
                                                    >
                                                        <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                                                    </CButton>
                                                    <CButton
                                                        className="button-table float-right"
                                                        color='primary'
                                                        variant='ghost'
                                                        size="sm"
                                                        onClick={() => populateSnippetEditor(item)}
                                                    >
                                                        <FontAwesomeIcon icon="pen" size="lg" className="icon-table-edit" />
                                                    </CButton>
                                                </CListGroupItem>
                                            </div>
                                        )
                                    })}
                                </CListGroup>
                            </div>
                        </CCol>
                    </CRow>
                </CCardBody>
                <CCardFooter className="roboto-font">
                    <CRow className="mt-3">
                        <CCol sm="3">
                            <CButton block variant="outline" onClick={e => setDeleteModal(!deleteModal)} color="danger"><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                        </CCol>
                        <CCol sm="3">
                            <CButton block variant="outline" onClick={handleSubmit} color="success"><CIcon name="cil-arrow-right" /> <strong>{Object.keys(editingRule).length != 0 ? "Modify Rule" : "Create Rule"}</strong></CButton>
                        </CCol>
                    </CRow>
                </CCardFooter>
            </CCard>
            <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                <CModalHeader className='bg-danger text-white py-n5' closeButton>
                    <strong>Confirm Reset</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    <strong>Are you sure you want to reset this rule?</strong>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="danger"
                        onClick={resetRuleData}
                    >Confirm</CButton>
                    <CButton
                        color="secondary"
                        onClick={() => setDeleteModal(!deleteModal)}
                    >Cancel</CButton>
                </CModalFooter>
            </CModal>
            <CModal show={generatePolicyModal} className="roboto-font" onClose={() => setGeneratePolicyModal(!generatePolicyModal)}>
                <CModalHeader className='bg-success text-white py-n5' closeButton>
                    <strong>Are you sure you want to generate a policy?</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    Please ensure that all your rules are correctly configured before generating a policy.
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="success"
                        onClick={handlePolicyGeneration}
                    >Confirm</CButton>
                    <CButton
                        color="secondary"
                        onClick={() => setGeneratePolicyModal(!generatePolicyModal)}
                    >Cancel</CButton>
                </CModalFooter>
            </CModal>

            <CModal show={invalidPolicyModal} className="roboto-font" onClose={() => setInvalidPolicyModal(!invalidPolicyModal)}>
                <CModalHeader className='bg-warning text-white py-n5' closeButton>
                    <strong>There has been an error generating your policy.</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    Please check to make sure all your rules are correctly configured.
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="warning"
                        onClick={() => setInvalidPolicyModal(!invalidPolicyModal)}
                    >Ok.</CButton>
                </CModalFooter>
            </CModal>

        </>
    )
}

export default withRouter(TracingRule)
