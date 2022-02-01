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
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CRow,
    CSelect,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CreatableSelect from 'react-select/creatable';
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import './tenantviews.scss'

var common = require('../../common')

const HostsRule = (props) => {
    const initOperatorStatus = { "==": true, "!=": true, inequalities: true }
    const initSnippetType = { type: "", isArray: "" }
    const initSnippetData = ["", "==", ""]

    const [host, setHost] = useState("")
    const [tag, setTag] = useState("")
    const [uids, updateUids] = useState(Object.freeze([]))

    const [userAttrs, updateUserAttrs] = useState(Object.freeze([]))

    // array of all the attributes you are allowed to access based on admin group
    const [accessibleUserAttrs, updateAccessibleUserAttrs] = useState(Object.freeze([]))

    const [operatorStatus, updateOperatorStatus] = useState(initOperatorStatus)
    const [snippetData, updateSnippetData] = useState(initSnippetData)
    const [snippetType, updateSnippetType] = useState(initSnippetType)
    const [editingSnippet, setEditingSnippet] = useState("")
    const [deleteModal, setDeleteModal] = useState(false)
    const [lockInfoModal, setLockInfoModal] = useState(false)
    const [lock, setLock] = useState(false)

    const initRuleData = Object.freeze({
        host: "",
        rid: "",
        rule: []
    })

    const [ruleData, updateRuleData] = useState(initRuleData)
    const [errObj, updateErrObj] = useState({})

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
        if (typeof props.location.state != 'undefined') {
            // props.location.state is an array. Either the second index is a tag value ie finance for finance.yahoo.com
            // or it is Edit, which means that we are editing an existing rule
            if (props.location.state[1] == "Edit") {
                let rule = props.location.state[0]
                updateRuleData(rule)
                setHost(rule.host)
                // Iterate over the rule.rule array to find the tag value
                for (var i = 0; i < rule.rule.length; i++) {
                    if (rule.rule[i][0] == "tag") {
                        setTag(rule.rule[i][2])
                        return
                    }
                }
                setLock(typeof ruleData.group === 'undefined' || ruleData.group == "")
            }
            // This logic block executes if we are adding a new rule
            else {
                updateRuleData({
                    ...ruleData,
                    host: props.location.state[0],
                    rule: [["tag", "==", props.location.state[1], "Route", "false"]]
                })
                setHost(props.location.state[0])
                setTag(props.location.state[1])
                setLock(typeof ruleData.group === 'undefined' || ruleData.group == "")
            }
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
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/Users'), hdrs)
            .then(response => response.json())
            .then(data => {
                var user = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].name) {
                        user.push(data[i].name)
                    }
                }
                updateAccessibleUserAttrs(user)
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
        for (var i = 0; i < userAttrs.length; i++) {
            if (userAttrs[i].name == value) {
                updateSnippetType({ type: userAttrs[i].type, isArray: userAttrs[i].isArray })
                return userAttrs[i].type
            }
        }
    }

    function getOperators(type) {
        let ops = { ...initOperatorStatus }
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
            if (snippet[0] == "User ID") {
                let uids = snippet[2].map(option => {
                    return option.value
                })
                const stringifiedVal = uids.toString()
                snippet[2] = stringifiedVal
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

    const populateSnippetEditor = (item) => {
        if (item[0] == "User ID") {
            let uids = item[2].split(",").map(uid => {
                return { label: uid, value: uid }
            })
            item[2] = uids
        }
        setEditingSnippet(item)
        let snippet = [...item]
        resetSnippetData()
        updateSnippetType({
            ...snippetType,
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

    const resetRuleData = (e) => {
        setDeleteModal(!deleteModal)
        updateRuleData({
            ...initRuleData,
            host: host,
            rule: [["tag", "==", tag, "Route", "false"]]
        })
    }

    const lockRule = (e) => {
        setLock(!lock)
        setLockInfoModal(!lockInfoModal)
        lockHostRule();
    }

    function validate() {
        let err = {}
        if (!ruleData.rid) {
            err.rid = true
        } if (ruleData.rule.length <= 1) {
            err.rule = true
        }
        updateErrObj(err)
        return err
    }

    const handleSubmit = (e) => {
        let err = validate()
        if (Object.keys(err) != 0) {
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify({
                host: ruleData.host, rid: ruleData.rid,
                rule: ruleData.rule,
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/hostrule/'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/' + props.match.params.group + '/hosts')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const lockHostRule = () => {
        let err = validate()
        if (Object.keys(err) != 0) {
            return
        }
        var group = "";
        if (lock) {
            group = props.match.params.group;
        }
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify({
                host: ruleData.host, rid: ruleData.rid,
                group: group,
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/lockhostrule/'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/' + props.match.params.group + '/hosts')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    return (
        <CCard className="roboto-font">
            <CCardHeader>
                Rule Generator for {tag}.{ruleData.host}
                <div className="float-right">
                    {lock ? "Unlock Rule" : "Lock Rule"}
                    <CButton className="ml-3" color="primary" onClick={() => setLockInfoModal(!lockInfoModal)}>
                        <FontAwesomeIcon icon={lock ? "lock" : "lock-open"} />
                    </CButton>
                </div>
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol sm="12">
                        <CForm>
                            <CFormGroup className="mt-n3">
                                <CLabel>Rule Name</CLabel>
                                <CInput name="rid" value={ruleData.rid} onChange={handleChange} invalid={errObj.rid} />
                                {!errObj.rid ?
                                    <CFormText>Enter a rule name. Ex: Rule to route C-Suites...</CFormText>
                                    :
                                    <CInvalidFeedback>Please enter a valid name</CInvalidFeedback>}
                            </CFormGroup>
                        </CForm>
                    </CCol>
                </CRow>
                <CRow>
                    <CCol sm="12">
                        <CCard accentColor={(ruleData.rule.length <= 1 && errObj.rule == true) ? "danger" : "success"}>
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
                                        {snippetData[0] == "User ID" ?
                                            <CreatableSelect
                                                name="uid"
                                                options={uids}
                                                value={snippetData[2]}
                                                isSearchable
                                                isMulti
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
                            <div hidden={!(ruleData.rule.length <= 1 && errObj.rule == true)} className="text-danger">Please add at least one non-tag snippet!</div>

                            <CListGroup>
                                <CListGroupItem
                                    className="mb-1"
                                    size="sm"
                                    color="success"
                                    disabled={!getAccessibleAttributes("tag")}
                                >
                                    tag == {tag}
                                    <CButton
                                        size="sm"
                                        className="float-right"
                                        disabled
                                    >
                                        <FontAwesomeIcon icon="lock" size="lg" />
                                    </CButton>
                                </CListGroupItem>
                                {ruleData.rule.filter((item, index) => {
                                    if (item[0] == "tag") {
                                        return false
                                    } else {
                                        return true
                                    }
                                }).map(item => {
                                    return (
                                        <div>
                                            <CListGroupItem
                                                key={item}
                                                value={item}
                                                className="mb-1"
                                                size="sm"
                                                disabled={!getAccessibleAttributes(item[0])}
                                                color={item == editingSnippet ? "warning" : "success"}
                                            >
                                                {item.slice(0, 3).join(' ')}
                                                {getAccessibleAttributes(item[0]) ?
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
            <CCardFooter>
                <CButton className="button-footer-danger" variant="outline" onClick={e => setDeleteModal(!deleteModal)} color="danger"><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                <CButton className="button-footer-success" variant="outline" onClick={handleSubmit} color="success"><CIcon name="cil-scrubber" /> <strong>Create</strong></CButton>
            </CCardFooter>
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
            <CModal className="roboto-font" show={lockInfoModal}>
                <CModalFooter>
                    <CButton
                        color="success"
                        onClick={lockRule}
                    >{lock ? "Unlock" : "Lock"}</CButton>
                </CModalFooter>
            </CModal>
        </CCard>
    )
}

export default withRouter(HostsRule)

