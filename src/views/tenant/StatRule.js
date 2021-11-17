import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCardFooter,
    CCallout,
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

const StatRule = (props) => {

    const initRule = ["User Attributes", "==", []]
    const [userAttrNames, updateUserAttrNames] = useState(Object.freeze([]))
    const [ruleSnippet, updateRuleSnippet] = useState(initRule)
    const [errObj, updateErrObj] = useState(Object.freeze({}))
    const [existingRule, updateExistingRule] = useState(Object.freeze([]))

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
                var userAttrNames = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users") {
                        userAttrNames.push({ value: data[i].name, label: data[i].name })
                    }
                }
                updateUserAttrNames(userAttrNames)
            })
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/statsrule'), hdrs)
            .then(response => response.json())
            .then(data => {
                updateExistingRule(data)
            })
    }, [])

    const handleOperator = (e) => {
        let rule = [...ruleSnippet]
        rule[1] = e.target.value
        updateRuleSnippet(rule)
    }

    const handleSelectedAttrs = (e) => {
        let rule = [...ruleSnippet]
        rule[2] = e
        updateRuleSnippet(rule)
    }

    function validate() {
        let errs = {}
        if (ruleSnippet[2].length == 0) {
            errs.attributes = true
        }
        updateErrObj(errs)
        return errs
    }

    function renderExistingRule() {
        if (existingRule.length == 0) {
            return (
                <CCallout color="warning">
                    <strong>You have no rule configured yet!</strong>
                </CCallout>
            )
        } else {
            return (
                <CListGroupItem color="info">
                    <strong>{existingRule[0].rid}</strong>
                    <CButton
                        className="float-right"
                        color="danger"
                        variant="outline"
                        shape="square"
                        size="sm"
                        onClick={e => handleRuleDelete(existingRule[0])}
                    >
                        Delete
                    </CButton>
                    <CButton
                        className="float-right mr-1"
                        color="primary"
                        variant="outline"
                        shape="square"
                        size="sm"
                        onClick={e => handleRuleEdit(existingRule[0])}
                    >
                        Edit
                    </CButton>
                    <div>{existingRule[0].rule[0].join(" ")}</div>
                </CListGroupItem>
            )
        }
    }


    const handleSubmit = (e) => {
        let err = validate()
        if (Object.keys(err).length != 0) {
            return
        }

        // Destructure selected attrs from Obj to string, comma delimited
        // [{label: label, value: value}, label: label2, value: value2} 
        // ----> 
        // value1,value2
        let snip = [...ruleSnippet]
        let attrVals = []
        for (let i = 0; i < snip[2].length; i++) {
            attrVals.push(snip[2][i].value)
        }
        snip[2] = attrVals.toString()
        const ruleObj = { rid: "StatsRule", rule: [snip] }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(ruleObj)
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/statsrule/'), requestOptions)
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
                    updateExistingRule([ruleObj])
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleRuleEdit = (rule) => {
        let formattedRule = rule.rule[0]
        formattedRule[2] = rule.rule[0][2].split(",").map(attr => {
            return (
                { label: attr, value: attr }
            )
        })
        updateRuleSnippet(formattedRule)
    }

    const handleRuleDelete = (rule) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/statsrule/' + rule.rid), hdrs)
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
                updateExistingRule([])
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    // ------------------Policy generation functions-------------------------

    const generatePolicyFromStatsRule = (e, existingRule) => {
       // Stats policy generation
        // existingRule contains data in this format :
        //  [ruleid, rule:[[snippet]]]
	//  where ruleid = "StatsRule"
        //  snippet is of this form :
        //  ["User Attributes", operator, [array of attribute names], "string", "true"] where
        //  operator is either == or !=

        let RetVal = [""]
        let RegoPolicy = ""
        RegoPolicy = generateStatsPolicyHeader(RegoPolicy)
        RegoPolicy = processStatsRule(e, existingRule[0], RegoPolicy)
        RetVal[0] = ""
        RetVal[1] = RegoPolicy
        return RetVal
    }

    function getStatsRuleLeftToken(snippet) {
        return snippet[0]
    }

    function getStatsRuleRightToken(snippet) {
        return snippet[2]
    }

    function getStatsRuleOpToken(snippet) {
        return snippet[1]
    }

    function getStatsRuleTokenType(snippet) {
        return "string"
    }

    function getStatsRuleTokenValue(name, snippet) {
        if (name === "User Attributes") {
            return "attr"
        }
        return "array"
    }

    function statsRightTokenArray(rtok, uatype) {
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

    function generateStatsPolicyHeader(policyData) {
        return policyData +
            "package user.stats\ndefault attributes = {\"exclude\": [\"uid\", \"maj_ver\", \"min_ver\", \"_hostname\", \"_model\", \"_osMinor\", \"_osPatch\", \"_osName\"]}\n\n"
    }

    function processStatsRule(e, statsRule, policyData) {
        let attrSpecified = 0
        let statsAttrValue = "[\"all\"]"
        let RuleStart = "attributes = select {\n"
	let statsPolicyAttr = "    select := "
        for (let snippet of statsRule.rule) {
            let ltoken = getStatsRuleLeftToken(snippet)
            let uavalue = getStatsRuleTokenValue(ltoken, snippet)
            let uatype = getStatsRuleTokenType(snippet).toLowerCase()
            let rtoken = getStatsRuleRightToken(snippet)
            let rtokenarray = [""]
            let optoken = getStatsRuleOpToken(snippet)

            // rtoken is always an array of string values.
            // For string values, add double quotes if missing.
            // Always trim all values.
            // For processing array of values, first replace any comma with a
            // space, then split based on space. Remove any null strings to
            // compress array.

            rtoken = rtoken.trim()
	    if (rtoken.includes(',')) {
                rtoken = rtoken.replaceAll(',', ' ').trim()
	    }
            statsAttrValue = statsRightTokenArray(rtoken, "string")

	    let incexc = "include"
	    if (optoken === "!=") {
		incexc = "exclude"
	    }
            let attrList = "{\"" + incexc + "\": "
            attrList = attrList + "[" + statsAttrValue + "]}\n"
            statsPolicyAttr = statsPolicyAttr + attrList
	    break
        }
        let RuleEnd = "}"
        return policyData + RuleStart + statsPolicyAttr + RuleEnd
    }

    // ------------------Policy generation functions end----------------------

    return (
        <CRow>
            <CCol md="6">
                <CCard className="roboto-font">
                    <CCardHeader>
                        Stats Rule Creator
                        <div className="text-muted small">
                            Only one stats rule can exist.
                        </div>
                    </CCardHeader>
                    <CCardBody className="roboto-font">
                        <CRow>
                            <CCol sm="3">
                                <div>
                                    User Attributes
                                </div>
                            </CCol>
                            <CCol sm="3">
                                <CSelect name="operator" custom value={ruleSnippet[1]} onChange={handleOperator}>
                                    <option value="==">==</option>
                                    <option value="!=">!=</option>
                                </CSelect>
                            </CCol>
                            <CCol sm="6">
                                <CreatableSelect
                                    name="userAttrs"
                                    className="mb-3"
                                    options={userAttrNames}
                                    isSearchable
                                    isMulti
                                    value={ruleSnippet[2]}
                                    onChange={handleSelectedAttrs}
                                />
                                {errObj.attributes && <div className="invalid-form-text">Please select at least one User Attribute.</div>}
                            </CCol>
                        </CRow>
                    </CCardBody>
                    <CCardFooter>
                        <CRow>
                            <CCol sm="3">
                                <CButton shape="square" variant="outline" block onClick={handleSubmit} color="success"><CIcon name="cil-arrow-right" /> <strong>Create Rule</strong></CButton>
                            </CCol>
                        </CRow>
                    </CCardFooter>
                </CCard>
            </CCol>
            <CCol md="6">
                <CCard className="roboto-font">
                    <CCardHeader>
                        Existing Rule

                    </CCardHeader>
                    <CCardBody>
                        {renderExistingRule()}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default withRouter(StatRule)