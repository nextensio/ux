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

    // array of all the attributes you are allowed to access based on token admin group
    const [accessibleUserAttrs, updateAccessibleUserAttrs] = useState(Object.freeze([]))

    // array of all the attributes you are allowed to access based on admin group in object format 
    // ({value: <accessibleUserAttr>, label: <accessibleUserAttr>}). Needed for CreateableSelect library
    const [accessibleUserAttrsForRHS, updateAccessibleUserAttrsForRHS] = useState(Object.freeze([]))


    const [operatorStatus, updateOperatorStatus] = useState(initOperatorStatus)
    const [snippetData, updateSnippetData] = useState(initSnippetData)
    const [snippetType, updateSnippetType] = useState(initSnippetType)
    const [editingSnippet, setEditingSnippet] = useState("")
    const initRuleData = Object.freeze({
        rid: "",
        group: "",
        version: 0,
        admin: "",
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
            'Content-Type': 'application/json',
            Authorization: bearer,
            'X-Nextensio-Group': common.getGroup(common.GetAccessToken(authState), props),
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
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/all'), hdrs)
            .then(response => response.json())
            .then(data => {
                var user = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users" && data[i].name[0] != "_") {
                        user.push(data[i])
                    }
                }
                updateUserAttrs(user)
            })
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/Users'), hdrs)
            .then(response => response.json())
            .then(data => {
                var userAttrNames = []
                var userAttrObjs = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].name) {
                        userAttrNames.push(data[i].name)
                        userAttrObjs.push({ value: data[i].name, label: data[i].name })
                    }
                }
                updateAccessibleUserAttrs(userAttrNames)
                updateAccessibleUserAttrsForRHS(userAttrObjs)
            })
    }, [])

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tracereqrules/all'), hdrs)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                updateExistingRules(data)
            })

    }, [])

    // Returns true if the attributes are part of your admin group
    function getAccessibleAttributes(userAttr) {
        if (userAttr === "User ID") {
            return true
        } else if (accessibleUserAttrs.includes(userAttr)) {
            return true
        } else {
            return false
        }
    }

    // Checks if the userID is already used in a snippet for the rule
    // Returns true if it is
    function userIDActiveInRule() {
        for (let i = 0; i < ruleData.rule.length; i++) {
            if (ruleData.rule[i][0] === "User ID") {
                return true
            }
        }
        return false
    }

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
            headers: hdrs.headers,
            body: JSON.stringify({
                rid: ruleData.rid,
                group: props.match.params.group,
                version: ruleData.version,
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
        // Need group id in api
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/tracereqrule/' + rule.rid + '/' + props.match.params.group), hdrs)
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
                    options={accessibleUserAttrsForRHS}
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

    // ---------------Policy generation now in controller---------------------

    const generatePolicyFromTraceReqRules = (e, existingRules) => {
        let RetVal = [""]
        RetVal[0] = ""
        RetVal[1] = ""
        return RetVal
    }

    // ------------------Policy generation functions end----------------------

    const triggerPolicyModal = (e) => {
        const retval = generatePolicyFromTraceReqRules(e, existingRules)
        if (!retval[0]) {
            setGeneratePolicyModal(true)
        } else (setInvalidPolicyModal(true))
    }

    const handlePolicyGeneration = (e) => {
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/policy/generate/TracePolicy'), requestOptions)
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
                                        <CFormText>Enter a rule name (a trace request name) to trace one or more specific flows.
                                            Multiple rules can be specified to trace different groups of flows</CFormText>
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
                                                <option hidden={userIDActiveInRule()} value="User ID">User ID</option>
                                                {userAttrs.map((item, index) => {
                                                    if (getAccessibleAttributes(item.name)) {
                                                        return (
                                                            <option
                                                                value={item.name}
                                                            >
                                                                {item.name}
                                                            </option>
                                                        )
                                                    }

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
                                                    disabled={!getAccessibleAttributes(item[0])}
                                                    className="mb-1"
                                                    size="sm"
                                                    color={item == editingSnippet ? "warning" : "success"}
                                                >
                                                    {item.slice(0, 3).join(' ')}
                                                    {getAccessibleAttributes(item[0])
                                                        ?
                                                        <>
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
                                                        </>
                                                        :
                                                        <CButton
                                                            size="sm"
                                                            className="float-right"
                                                            disabled
                                                        >
                                                            <FontAwesomeIcon icon="lock" size="lg" />
                                                        </CButton>
                                                    }
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
                    <CButton className="button-footer-danger" variant="outline" variant="outline" onClick={e => setDeleteModal(!deleteModal)} color="danger"><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                    <CButton className="button-footer-success" variant="outline" variant="outline" onClick={handleSubmit} color="success"><CIcon name="cil-scrubber" /> <strong>{Object.keys(editingRule).length != 0 ? "Modify" : "Create"}</strong></CButton>
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
