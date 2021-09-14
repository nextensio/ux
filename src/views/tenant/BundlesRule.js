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
    CInput,
    CInvalidFeedback,
    CRow,
    CSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Select from 'react-select'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import './tenantviews.scss'

var common = require('../../common')

const BundlesRule = (props) => {
    const initOperatorStatus = { "==": true, "!=": true, inequalities: true }
    const initSnippetType = { type: "", isArray: "" }
    const initSnippetData = ["", "==", ""]

    const [uids, updateUids] = useState(Object.freeze([]))
    const [userAttrs, updateUserAttrs] = useState(Object.freeze([]))
    const [operatorStatus, updateOperatorStatus] = useState(initOperatorStatus)
    const [snippetData, updateSnippetData] = useState(initSnippetData)
    const [snippetType, updateSnippetType] = useState(initSnippetType)
    const initRuleData = Object.freeze({
        bid: "",
        name: "",
        code: []
    })
    const [ruleData, updateRuleData] = useState(initRuleData)
    const [errObj, updateErrObj] = useState({})

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateRuleData({
                ...ruleData,
                bid: props.location.state
            })
        }
    }, [])

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
                var user = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users") {
                        user.push(data[i])
                    }
                }
                updateUserAttrs(user)
            })
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
            updateSnippetType({ type: "User ID", isArray: null })
            return "User ID"
        }
        for (var i = 0; i < userAttrs.length; i++) {
            if (userAttrs[i].name == value) {
                updateSnippetType({ type: userAttrs[i].type, isArray: userAttrs[i].isArray })
                return userAttrs[i].type
            }
        }
    }

    function getOperators(type) {
        let ops = { ...initOperatorStatus }
        if (type == "String" || type == "Boolean") {
            ops.inequalities = false
        } if (type == "User ID") {
            ops.inequalities = false
            ops["!="] = false
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
        let value = e.value
        let snip = [...snippetData]
        snip[2] = value
        updateSnippetData(snip)
    }

    const pushSnippetToRule = (e) => {
        let snippet = [...snippetData]
        let rule = { ...ruleData }
        // test if every index of snippetIndex is filled
        // snippet example: [userAttr, operand, bundleAttr]
        let test = snippet.every(i => i != "")
        if (test) {
            // Append the type for use later
            snippet.push(snippetType.type)
            rule.code.push(snippet)
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

    const populateSnippetEditor = (item) => {
        let snippet = [...item]
        resetSnippetData()
        updateSnippetType({
            ...snippetType,
            type: snippet[3]
        })
        getOperators(snippet[3])
        updateSnippetData(snippet.splice(0, 3))
    }

    const removeSnippetFromRule = (item) => {
        let rule = { ...ruleData }
        const index = rule.code.indexOf(item)
        rule.code.splice(index, 1)
        updateRuleData(rule)
    }

    function validate() {
        let err = {}
        if (!ruleData.name) {
            err.name = true
        } if (ruleData.code.length == 0) {
            err.code = true
        }
        updateErrObj(err)
        return err
    }

    const handleSubmit = (e) => {
        let err = validate()
        if (Object.keys(err).length != 0) {
            return
        }
        let rule = JSON.stringify(ruleData.code)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                bid: ruleData.bid, rid: ruleData.name,
                rule: rule
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/bundlerule/'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/bundles')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    return (
        <CCard>
            <CCardHeader>
                Rule Generator for {ruleData.bid}
                <CButton onClick={e => console.log(JSON.stringify(ruleData.code))}>ruleData</CButton>
            </CCardHeader>
            <CCardBody className="roboto-font">

                <CRow>
                    <CCol sm="12">
                        <CForm>
                            <CFormGroup className="mt-n3">
                                <CLabel>Rule Name</CLabel>
                                <CInput name="name" className="mb-3" value={ruleData.name} onChange={handleChange} invalid={errObj.name} />
                                {!errObj.name ?
                                    <CFormText>Enter a rule name. Ex: Rule to allow access for C-Suites...</CFormText>
                                    :
                                    <CInvalidFeedback>Please enter a valid name</CInvalidFeedback>
                                }
                            </CFormGroup>
                        </CForm>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol sm="12">
                        <CCard>
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
                                            <option value="">User Attrs</option>
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
                                        {snippetData[0] == "User ID" ?
                                            <Select
                                                name="uid"
                                                options={uids}
                                                isSearchable
                                                onChange={handleRHSUid}
                                            />
                                            :
                                            <CInput value={snippetData[2]} onChange={handleRHS} disabled={!snippetData[0]} />
                                        }
                                    </CCol>
                                </CRow>
                                <CRow>
                                    <CCol sm="12">
                                        <CButton className="mt-3 mr-3" shape="pill" size="lg" color="danger" onClick={resetSnippetData}>Clear</CButton>
                                        <CButton className="mt-3" shape="pill" size="lg" color="success" onClick={pushSnippetToRule}>Add</CButton>
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>

                <CRow>
                    <CCol sm="12">
                        <CLabel>Current Rule</CLabel>
                        <div className="roboto-font bg-gray-100 text-dark" style={{ minHeight: '100px', padding: 10 }}>
                            <div hidden={!errObj.code && ruleData.length != 0} className="text-danger">Please add at least one snippet!</div>

                            <CListGroup>
                                {ruleData.code.map((item, index) => {
                                    return (
                                        <div>
                                            <CListGroupItem
                                                key={item}
                                                value={item}
                                                className="mb-1"
                                                size="sm"
                                                color="success"
                                            >
                                                {item}
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
            <CCardFooter>
                <CRow className="mt-3">
                    <CCol sm="3">
                        <CButton block color="danger"><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                    </CCol>
                    <CCol sm="3">
                        <CButton block onClick={handleSubmit} color="success"><CIcon name="cil-arrow-right" /> <strong>Create Rule</strong></CButton>
                    </CCol>
                </CRow>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(BundlesRule)

