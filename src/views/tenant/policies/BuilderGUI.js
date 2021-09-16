import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CCollapse,
    CDataTable,
    CForm,
    CFormGroup,
    CInput,
    CInputCheckbox,
    CInvalidFeedback,
    CLabel,
    CListGroup,
    CListGroupItem,
    CCardHeader,
    CRow,
    CSelect,
} from '@coreui/react'
import { useOktaAuth } from '@okta/okta-react';
import CIcon from '@coreui/icons-react'
import BidDropdown from './BidDropdown'
import HostDropdown from './HostDropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

var common = require('../../../common')

const BuilderGUI = (props) => {
    const initPolicyData = Object.freeze({
        pid: "",
        tenant: props.ID,
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

    // State which is used to determine if user is going to input a value
    const [inputStatus, updateInputStatus] = useState(false)
    const [snippetData, updateSnippetData] = useState(Object.freeze(["", "==", ""]))
    // State used to keep track of which operators are allowed. (Strings only allow != and ==, Bundle ID 
    // only allows ==)
    const [operatorStatus, updateOperatorStatus] = useState(initOperatorStatus)
    const [details, setDetails] = useState([]);

    const [ruleRepo, updateRuleRepo] = useState(Object.freeze([]))

    const accessFields = [
        {
            key: 'show_details',
            label: '',
            style: { width: '1%' },
            sorter: false,
            filter: false,
        }, {
            key: 'name',
            label: 'Rule Name',
            _classes: 'data-head',
        }, {
            key: 'bid',
            label: 'Bundle',
            _classes: 'data-head'
        }
    ]

    const routingFields = [
        {
            key: 'show_details',
            label: '',
            style: { width: '1%' },
            sorter: false,
            filter: false,
        }, {
            key: 'name',
            label: 'Rule Name',
            _classes: 'data-head',
        }, {
            key: 'host',
            label: 'Host',
            _classes: 'data-head'
        }, {
            key: 'routes',
            label: 'Routes',
            _classes: 'data-head'
        }
    ]

    const initRuleData = Object.freeze({
        name: "",
        code: []
    })
    const [ruleData, updateRuleData] = useState(initRuleData)
    const [errObj, updateErrObj] = useState(Object.freeze({}))

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.ID + '/get/allattrset'), hdrs)
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


    useEffect(() => {
        let policy = { ...policyData }
        policy.pid = props.PID
        updatePolicyData(policy)
        if (props.PID == "applicationAccess") {
            updateRuleData({
                ...initRuleData,
                bid: ""
            })
        } if (props.PID == "applicationRouting") {
            updateRuleData({
                ...initRuleData,
                host: "",
                routes: []
            })
        }
    }, [props])

    const handleChange = (e) => {
        updateRuleData({
            ...ruleData,
            [e.target.name]: e.target.value
        })
    }

    const handleInputStatus = (e) => {
        let snippet = [...snippetData]
        snippet[2] = ""
        updateSnippetData(snippet)
        updateInputStatus(!inputStatus)
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

    const handleOperatorSelect = (e) => {
        let value = e.target.value
        let snip = [...snippetData]
        snip[1] = value
        updateSnippetData(snip)
    }

    const handleRHSSelect = (e) => {
        let value = e.target.value
        let snip = [...snippetData]
        snip[2] = value
        updateSnippetData(snip)
    }


    function getTypeFromLHS(value) {
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
        }
        updateOperatorStatus(ops)
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
            // Append if input for use later
            snippet.push(inputStatus.toString())
            rule.code.push(snippet)
            updateRuleData(rule)
            // Reset snippetData
            resetSnippetData()
        }
    }

    const populateSnippetEditor = (item) => {
        let snippet = [...item]

        resetSnippetData()
        updateSnippetType({
            ...snippetType,
            type: snippet[3]
        })
        updateInputStatus(snippet[4] == "true")
        updateSnippetData(snippet.splice(0, 3))
    }

    const removeSnippetFromRule = (item) => {
        let rule = { ...ruleData }
        const index = rule.code.indexOf(item)
        rule.code.splice(index, 1)
        updateRuleData(rule)
    }

    function resetSnippetData() {
        updateSnippetData(["", "", ""])
        updateOperatorStatus(initOperatorStatus)
        updateSnippetType(initSnippetType)
        updateInputStatus(false)
    }

    const createRule = (e) => {
        let err = validate()
        if (Object.keys(err).length != 0) {
            return
        }
        updateRuleRepo([...ruleRepo, ruleData])
        updateRuleData(initRuleData)
    }

    const toggleDetails = (index) => {
        const position = details.indexOf(index)
        let newDetails = details.slice()
        if (position !== -1) {
            newDetails.splice(position, 1)
        } else {
            newDetails = [...details, index]
        }
        setDetails(newDetails)
    }


    // ------------------Policy generation functions-------------------------

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

        let ptype = getPolicyType()
        let nohdr = policyHasData()
        if (ptype == "Access") {
            generateAccessPolicy(e, dummyCode, nohdr)
        } else if (ptype == "Route") {
            generateRoutePolicy(e, dummyCode, nohdr)
        }
    }

    function getPolicyType() {
        if (policyData.pid === "applicationAccess") {
            return "Access"
        } else if (policyData.pid === "applicationRouting") {
            return "Route"
        } else {
            return "Unknown"
        }
    }

    function policyHasData() {
        if (policyData.rego.length > 36) {
            return true
        }
        return false
    }

    function getLeftToken(snippet) {
        return snippet[0]
    }

    function getRightToken(snippet) {
        return snippet[2]
    }

    function getOpToken(snippet) {
        return snippet[1]
    }

    function getTokenType(name, appliesTo) {
        if (appliesTo == "Users") {
            for (var i = 0; i < userAttrs.length; i++) {
                if (name == userAttrs[i].name) {
                    if (userAttrs[i].isArray == "true") {
                        return "array"
                    } else {
                        return "single"
                    }
                }
            }
            return "const"
        }
        else if (appliesTo == "Bundles") {
            for (var i = 0; i < bundleAttrs.length; i++) {
                if (name == bundleAttrs[i].name) {
                    if (bundleAttrs[i].isArray == "true") {
                        return "array"
                    } else {
                        return "single"
                    }
                }
            }
            return "const"
        }
        else if (appliesTo == "Hosts") {
            for (var i = 0; i < hostAttrs.length; i++) {
                if (name == hostAttrs[i].name) {
                    if (hostAttrs[i].isArray == "true") {
                        return "array"
                    } else {
                        return "single"
                    }
                }
            }
            return "const"
        }
    }

    function generateAccessPolicy(e, dummyCode, nohdr) {
        // Access policy generation
        //  Assume a snippet is of one of these two forms and of same color (for single rule)
        //  [userattr, operator, const | AppGroupAttr],
        //  ["Bundle ID", ==, const] (optional)
        let indexNeeded = 0
        let bidSelected = 0
        let Exprs = ""
        let accessPolicyHdr = "package app.access\nallow = is_allowed\ndefault is_allowed = false\n\n"
        if (nohdr) {
            // Policy exists, we are appending a rule, so skip header lines
            accessPolicyHdr = ""
        }
        let accessPolicyRuleStart = "is_allowed {\n"
        let accessPolicyBidConst = ""
        for (let snippet of dummyCode) {
            let ltoken = getLeftToken(snippet)
            let rtoken = getRightToken(snippet)
            let optoken = getOpToken(snippet)

            if (ltoken === "Bundle ID") {
                accessPolicyBidConst = "    input.bid == " + rtoken + "\n"
                bidSelected = 1
            } else {
                let uatype = getTokenType(ltoken, "Users")
                let batype = getTokenType(rtoken, "Bundles")
                if (uatype === "array") {
                    // ltoken is an array type user attribute
                    Exprs += "    input.user." + ltoken + "[_] " + optoken + " "
                } else if (uatype === "single") {
                    // ltoken is a single value user attribute
                    Exprs += "    input.user." + snippet[0] + " " + optoken + " "
                } else if (uatype === "const") {
                    // ltoken is not a user attribute. This will happen in the case of User Ids.
                    Exprs += "    input.user.uid" + " " + optoken + " "
                }
                if (batype === "array") {
                    // rtoken is an array type AppGroup attribute
                    Exprs += "data.bundles[bundle]." + rtoken + "[_]\n"
                    indexNeeded = 1
                } else if (batype === "single") {
                    // rtoken is a single value AppGroup attribute
                    Exprs += "data.bundles[bundle]." + rtoken + "\n"
                    indexNeeded = 1
                } else if (batype === "const") {
                    // rtoken is not an AppGroup attribute but a constant
                    Exprs += rtoken + "\n"
                }
            }
        }
        let accessPolicyRuleEnd = "}\n\n"
        let accessPolicyRuleIndex = ""
        let accessPolicy = ""
        let accessPolicyBidAttr = ""
        if (indexNeeded === 1) {
            // One or more user attribute match expressions need values from AppGroup attributes collection
            accessPolicyRuleIndex = "    some bundle\n"
            accessPolicyBidAttr = "    input.bid == data.bundles[bundle].bid\n"
        } else if (bidSelected === 0) {
            // All user attribute match expressions use constants but bundle ID match unspecified
            accessPolicyBidConst = "Error - ** Bundle ID match missing **\n"
        }
        accessPolicy = accessPolicyHdr + accessPolicyRuleStart + accessPolicyRuleIndex + accessPolicyBidConst +
            accessPolicyBidAttr + Exprs + accessPolicyRuleEnd
        handleRegoChange(policyData.rego + accessPolicy)
        // resetDummyCode(e)
    }

    function generateRoutePolicy(e, dummyCode, nohdr) {
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
        if (nohdr) {
            // Policy exists, we are appending a rule, so skip header lines
            routePolicyHdr = ""
        }
        let routePolicyHostConst = ""
        let routeTagValue = ""
        for (let snippet of dummyCode) {
            let ltoken = getLeftToken(snippet)
            let rtoken = getRightToken(snippet)
            let optoken = getOpToken(snippet)

            if (ltoken === "Host") {
                routePolicyHostConst = "    input.host == " + rtoken + "\n"
                hostSelected = 1
            } else if (ltoken === "Route") {
                routeTagValue = rtoken
                tagSpecified = 1
            } else {
                let uatype = getTokenType(ltoken, "Users")
                let hatype = getTokenType(rtoken, "Hosts")
                if (uatype === "array") {
                    // ltoken is an array type user attribute
                    Exprs += "    input.user." + ltoken + "[_] " + optoken + " "
                } else if (uatype === "single") {
                    // ltoken is a single valuer user attribute
                    Exprs += "    input.user." + ltoken + " " + optoken + " "
                } else if (uatype === "const") {
                    // ltoken is not a user attribute. This will happen in the case of User Ids.
                    Exprs += "    input.user.uid" + " " + optoken + " "
                }
                if (hatype === "array") {
                    // rtoken is an array type Host attribute
                    Exprs += "data.hosts[hostidx].routeattrs[route]." + rtoken + "[_]\n"
                    indexNeeded = 1
                } else if (hatype === "single") {
                    // rtoken is a single value Host attribute
                    Exprs += "data.hosts[hostidx].routeattrs[route]." + rtoken + "\n"
                    indexNeeded = 1
                } else if (hatype === "const") {
                    //rtoken is not a Host attribute but a constant
                    Exprs += rtoken + "\n"
                }
            }
        }
        let routePolicyRuleEnd = "}\n\n"
        let routePolicyRuleIndex = ""
        let routePolicy = ""
        let routePolicyHostAttr = ""
        if (tagSpecified == 0) {
            // Error - route tag needs to be specified
            routeTagValue = "Error - ** route tag value unspecified **"
        }
        let routePolicyRuleStart = "route_tag = rtag {\n"
        let routePolicyTag = "    rtag := " + routeTagValue + "\n"
        if (indexNeeded === 1) {
            // One or more user attribute match expressions need values from AppGroup attributes collection
            routePolicyRuleIndex = "    some hostidx\n    some route\n"
            routePolicyHostAttr = "    input.host == data.hosts[hostidx].host\n"
            routePolicyTag = "    rtag := data.hosts[hostidx].routeattrs[route].tag\n"
        } else if (hostSelected === 0) {
            // All user attribute match expressions use constants but bundle ID match unspecified
            routePolicyHostConst = "Error - ** Host match missing **\n"
        }
        routePolicy = routePolicyHdr + routePolicyRuleStart + routePolicyRuleIndex + routePolicyHostConst +
            routePolicyHostAttr + Exprs + routePolicyTag + routePolicyRuleEnd
        handleRegoChange(policyData.rego + routePolicy)
        // resetDummyCode(e)
    }

    // ------------------Policy generation functions end----------------------

    function handleRegoChange(newValue) {
        updatePolicyData({
            ...policyData,
            rego: newValue
        })
    }

    function validate() {
        let errors = {}
        if (!ruleData.name) {
            errors.name = true
        } if (policyData.pid == "applicationAccess" && !ruleData.bid) {
            errors.bid = true
        } if (policyData.pid == "applicationRouting") {
            if (!ruleData.host) {
                errors.host = true
            } if (!ruleData.routes) {
                errors.routes = true
            }
        } if (ruleData.code.length == 0) {
            errors.code = true
        }
        updateErrObj(errors)
        return errors
    }

    const bidHandler = data => updateRuleData({
        ...ruleData,
        bid: data
    })

    const hostHandler = data => updateRuleData({
        ...ruleData,
        host: data
    })

    const routeHandler = data => updateRuleData({
        ...ruleData,
        routes: data
    })

    const showingIcon = <FontAwesomeIcon icon="angle-right" />
    const hidingIcon = <FontAwesomeIcon icon="angle-down" className="text-primary" />

    return (
        <CRow>
            <CCol md="5">
                <CCard>
                    <CCardHeader>
                        Policy Builder
                    </CCardHeader>
                    <CCardBody className="roboto-font">
                        <CRow>
                            <CCol sm="12">
                                <CForm>
                                    {policyData.pid ?
                                        <CFormGroup className="mt-n3">
                                            <CLabel>Rule Name</CLabel>
                                            <CInput name="name" placeholder="Rule for ..." value={ruleData.name} onChange={handleChange} invalid={errObj.name} />
                                            <CInvalidFeedback>Please enter a valid name</CInvalidFeedback>
                                        </CFormGroup>
                                        :
                                        <div className="roboto-font text-info mb-3">Select a Policy ID first.</div>
                                    }

                                    {policyData.pid == "applicationAccess" &&
                                        <>
                                            <BidDropdown ID={props.ID} BID={bidHandler} />
                                        </>
                                    }
                                    {policyData.pid == "applicationRouting" &&
                                        <>
                                            <HostDropdown {...props} Host={hostHandler} Route={routeHandler} />
                                        </>
                                    }
                                </CForm>
                            </CCol>
                        </CRow>
                        {policyData.pid &&
                            <>
                                <CRow>
                                    <CCol sm="12">
                                        <CCard>
                                            <CCardBody>
                                                <CRow>
                                                    <CCol sm="12">
                                                        <CLabel className="roboto-font">Snippet</CLabel>
                                                        <div className="text-muted mb-2">
                                                            <em>Type: {!snippetType.type ? "None" : snippetType.type}</em>
                                                            <CFormGroup className="float-right" variant="custom-checkbox">
                                                                <CInputCheckbox
                                                                    custom
                                                                    id="inputStatus"
                                                                    name="inputStatus"
                                                                    checked={inputStatus}
                                                                    onChange={handleInputStatus}
                                                                />
                                                                <CLabel variant="custom-checkbox" htmlFor="inputStatus"><em>Input</em></CLabel>
                                                            </CFormGroup>
                                                        </div>
                                                    </CCol>
                                                </CRow>
                                                <CRow>
                                                    <CCol sm="4">
                                                        <CSelect value={snippetData[0]} custom onChange={handleLHSSelect} placeholder="User Attrs">
                                                            <option value="">User Attrs</option>
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
                                                        <CSelect value={snippetData[1]} custom onChange={handleOperatorSelect} disabled={!snippetData[0]}>
                                                            <option value="==">{'=='}</option>
                                                            <option value="!=">{'!='}</option>
                                                            <option value=">=" hidden={!operatorStatus.inequalities}>{'>='}</option>
                                                            <option value="<=" hidden={!operatorStatus.inequalities}>{'<='}</option>
                                                            <option value=">" hidden={!operatorStatus.inequalities}>{'>'}</option>
                                                            <option value="<" hidden={!operatorStatus.inequalities}>{'<'}</option>
                                                        </CSelect>
                                                    </CCol>
                                                    <CCol sm="4">
                                                        {policyData.pid == "applicationAccess" &&
                                                            <>
                                                                {inputStatus ?
                                                                    <CInput disabled={!snippetData[0]} value={snippetData[2]} onChange={handleRHSSelect} placeholder="Enter value" />
                                                                    :
                                                                    <CSelect value={snippetData[2]} custom onChange={handleRHSSelect} disabled={!snippetData[0]}>
                                                                        <option>Bundle Attrs</option>
                                                                        {bundleAttrs.map((item, index) => {
                                                                            return (
                                                                                <option
                                                                                    value={item.name}
                                                                                    hidden={item.type != snippetType.type}
                                                                                >
                                                                                    {item.name}
                                                                                </option>
                                                                            )
                                                                        })}
                                                                    </CSelect>
                                                                }
                                                            </>
                                                        }
                                                        {policyData.pid == "applicationRouting" &&
                                                            <>
                                                                {inputStatus ?
                                                                    <CInput disabled={!snippetData[0]} value={snippetData[2]} onChange={handleRHSSelect} placeholder="Enter value..." />
                                                                    :
                                                                    <CSelect value={snippetData[2]} custom onChange={handleRHSSelect} disabled={!snippetData[0]}>
                                                                        <option>Host Attrs</option>
                                                                        {hostAttrs.map((item, index) => {
                                                                            return (
                                                                                <option
                                                                                    value={item.name}
                                                                                    hidden={item.type != snippetType.type}
                                                                                >
                                                                                    {item.name}
                                                                                </option>
                                                                            )
                                                                        })}
                                                                    </CSelect>
                                                                }
                                                            </>
                                                        }
                                                    </CCol>
                                                </CRow>
                                                <CRow>
                                                    <CCol sm="6">
                                                        <CButton className="mt-3" block color="danger" onClick={resetSnippetData}>Clear</CButton>
                                                    </CCol>
                                                    <CCol sm="6">
                                                        <CButton className="mt-3" block color="success" onClick={pushSnippetToRule}>Add</CButton>
                                                    </CCol>
                                                </CRow>
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                </CRow>

                                <CRow>
                                    <CCol sm="12">
                                        <CLabel className="roboto-font mt-3">
                                            Draft
                                        </CLabel>
                                        <div className="roboto-font bg-gray-100 text-dark" style={{ minHeight: '100px', padding: 10 }}>
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
                                <CRow className="mt-3">
                                    <CCol sm="6">
                                        <CButton block color="danger"><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                                    </CCol>
                                    <CCol sm="6">
                                        <CButton block color="success" onClick={createRule}><CIcon name="cil-arrow-right" /> <strong>Create</strong></CButton>
                                    </CCol>
                                </CRow>
                            </>}
                    </CCardBody>
                </CCard>

            </CCol>
            <CCol md="7">
                <CCard>
                    <CCardHeader>
                        Existing Rules
                    </CCardHeader>
                    <CCardBody>
                        <CDataTable
                            items={ruleRepo}
                            fields={policyData.pid == "applicationAccess" ? accessFields : routingFields}
                            clickableRows
                            onRowClick={(item, index) => { toggleDetails(index) }}
                            scopedSlots={{
                                'show_details':
                                    (item, index) => {
                                        return (
                                            <td className="py-auto">
                                                {details.includes(index) ? hidingIcon : showingIcon}
                                            </td>
                                        )
                                    },
                                'details':
                                    (item, index) => {
                                        return (
                                            <CCollapse show={details.includes(index)}>
                                                <CCardBody>
                                                    <strong className="roboto-font text-primary">Code{'\n'}</strong>
                                                    <pre>
                                                        {item.code.map((item, index) => {
                                                            return (
                                                                <div>
                                                                    {item.slice(0, 3).join(' ')}
                                                                </div>
                                                            )
                                                        })}
                                                    </pre>
                                                </CCardBody>
                                            </CCollapse>
                                        )
                                    }
                            }}
                        />
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    )
}

export default BuilderGUI
