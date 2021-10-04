import React, { useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CCallout,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CCollapse,
    CLink,
    CListGroup,
    CListGroupItem,
    CRow,
    CDataTable,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './tenantviews.scss'

var common = require('../../common')

const fields = [
    {
        key: 'show_details',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: "__bid",
        label: "Bundle ID",
        _classes: "data-head"
    },
    {
        key: "__name",
        _classes: "data-field"
    },
    {
        key: "__services",
        label: "Apps",
        _classes: "data-field"
    },
    {
        key: "__cpodrepl",
        label: "Compute Pods",
        _classes: "data-field"
    },
    {
        key: 'rule',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: 'edit',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: 'delete',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: 'key',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
]


const BundlesView = (props) => {

    const initTableData = Object.freeze(
        []
    );
    const [easyMode, setEasyMode] = useState(true);
    const [bundleData, updateBundleData] = useState(initTableData);
    const [bundleAttrData, updateBundleAttrData] = useState(initTableData);
    const [bundleRuleData, updateBundleRuleData] = useState(initTableData);
    const [bundleAttrSet, updateBundleAttrSet] = useState(initTableData)

    // Used to check if bid already exists in bundlesAdd page
    const [bidData, updateBidData] = useState("");
    const [zippedData, updateZippedData] = useState(initTableData);

    const [details, setDetails] = useState([]);
    const [policyModal, setPolicyModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteBid, setDeleteBid] = useState("");
    const [keyModal, setKeyModal] = useState(false);
    const [keyBid, setKeyBid] = useState("");

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };


    useEffect(() => {

        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenant'), hdrs)
            .then(response => response.json())
            .then(data => { setEasyMode(data.Tenant.easymode) });
    }, []);

    useEffect(() => {
        setDetails([]);
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundles'), hdrs)
            .then(response => response.json())
            .then(data => updateBundleData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundleattr'), hdrs)
            .then(response => response.json())
            .then(data => updateBundleAttrData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundlerules'), hdrs)
            .then(response => response.json())
            .then(data => updateBundleRuleData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                let bundles = []
                for (let i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Bundles") {
                        bundles.push(data[i].name)
                    }
                }
                bundles.sort()
                updateBundleAttrSet(bundles)
            });
    }, []);

    useEffect(() => {
        const zipper = []
        const bidObj = {}
        for (let i = 0; i < bundleData.length; i++) {
            bidObj[bundleData[i].bid] = true;
            // Match bundleData object with bundleAttrData by bid and combine the two into one
            if (bundleAttrData.find((obj) => obj.bid === bundleData[i].bid)) {
                const zipObj = {
                    ...bundleAttrData.find((obj) => obj.bid === bundleData[i].bid)
                }
                zipObj['__bid'] = bundleData[i]['bid']
                zipObj['__name'] = bundleData[i]['name']
                zipObj['__services'] = bundleData[i]['services']
                zipObj['__cpodrepl'] = bundleData[i]['cpodrepl']
                zipObj['__key'] = bundleData[i]['sharedkey']
                zipper.push(zipObj)

            }
        }
        updateZippedData(zipper)
        updateBidData(bidObj)
    }, [bundleData, bundleAttrData])

    const handleRefresh = (e) => {
        setDetails([]);
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundles'), hdrs)
            .then(response => response.json())
            .then(data => updateBundleData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundleattr'), hdrs)
            .then(response => response.json())
            .then(data => {
                updateBundleAttrData(data)
            });
    }

    const handleAdd = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/bundles/add',
            state: bidData
        })
    }

    const handleRule = (item) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/bundles/rule',
            state: [item.bid, "Add"]
        })
    }

    const handleRuleEdit = (item) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/bundles/rule',
            state: [item, "Edit"]
        })
    }

    const handleEdit = (item) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/bundles/edit',
            state: item
        });
        setDetails([]);
    }

    const handleDelete = (bid) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/bundle/') + bid, hdrs)
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
                setDeleteModal(!deleteModal);
                handleRefresh()
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleRuleDelete = (rule) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/bundlerule/' + rule.bid + '/' + rule.rid), hdrs)
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
                let index = bundleRuleData.indexOf(rule)
                bundleRuleData.splice(index, 1)
                handleRefresh()
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
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

    const toggleDelete = (item) => {
        setDeleteModal(!deleteModal);
        setDeleteBid(item.bid)
    }

    function matchRule(item) {
        let rules = []
        for (var i = 0; i < bundleRuleData.length; i++) {
            if (item.bid == bundleRuleData[i].bid) {
                rules.push(bundleRuleData[i])
            }
        }
        if (rules.length != 0) {
            return (
                <CListGroup>
                    {rules.map(rule => {
                        return (
                            <CListGroupItem color="info">
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
                                    onClick={e => handleRuleEdit(rule)}
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
                    })}
                </CListGroup>
            )
        } else {
            return (
                <CListGroupItem color="warning">
                    <strong>No Rules Exist</strong>
                    <CButton
                        className="float-right"
                        color="primary"
                        variant="outline"
                        shape="square"
                        size="sm"
                        onClick={() => { handleRule(item) }}
                    >
                        Create Rule
                    </CButton>
                </CListGroupItem>
            )
        }
    }

    function matchAttrs(item) {
        return (
            <table className="table-attrs-bundle">
                <tr>
                    <th>Key</th>
                    <th>Value</th>
                </tr>
                {bundleAttrSet.map(attr => {
                    return (
                        <tr>
                            <td><strong>{attr}</strong></td>
                            <td>
                                {["", 0, false].includes(item[attr]) ?
                                    <div className="text-warning">Default Value Assigned</div> :
                                    Array.isArray(item[attr]) ?
                                        item[attr].length == 1 && ["", 0, false].includes(item[attr][0]) ?
                                            <div className="text-warning">Default Value Assigned</div> :
                                            item[attr].join(' & ') :
                                        item[attr].toString()
                                }
                            </td>
                        </tr>
                    )
                })}
            </table>
        )
    }


    const handlePolicyGeneration = (e) => {
        var ucode = generatePolicyFromBundleRules(e, bundleRuleData)
        var byteRego = ucode.split('').map(function (c) { return c.charCodeAt(0) });
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                pid: "testApplicationAccess", tenant: props.match.params.id,
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
                    setPolicyModal(true)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };


    // ------------------Policy generation functions-------------------------

    const generatePolicyFromBundleRules = (e, bundleRuleData) => {
        // Access policy generation
        // bundleRuleData contains data in this format :
        //  [bid1, ruleid1, rule:[[snippet1], [snippet2], [snippet3], ..]]
        //  [bid1, ruleid2, rule:[[snippet1], [snippet2], ..]]
        //  [bid2, ruleid1, rule:[[snippet1], [snippet2], ..]]
        //  [bid3, ruleid1, rule:[[snippet1], [snippet2], [snippet3], ..]]
        //  [bid3, ruleid2, rule:[[snippet1], ..]]
        //    and so on ...
        //  A snippet is of this form :
        //  [userattr, operator, const, type, isArray] where
        //  type == "string", "boolean", "number"
        //  isArray == "true" or "false"
        //  operator values are ==, !=, >, <, >=, <=

        let RegoPolicy = ""
        RegoPolicy = generateAccessPolicyHeader(RegoPolicy)
        // for each entry/row in bundleRuleData, generate Rego code
        for (var i = 0; i < bundleRuleData.length; i++) {
            RegoPolicy = processBundleRule(e, bundleRuleData[i], RegoPolicy)
        }
        return RegoPolicy
    }

    function getBundleRuleLeftToken(snippet) {
        return snippet[0]
    }

    function getBundleRuleRightToken(snippet) {
        return snippet[2]
    }

    function getBundleRuleOpToken(snippet) {
        return snippet[1]
    }

    function getBundleRuleTokenType(snippet) {
        return snippet[3]
    }

    function getBundleRuleTokenValue(name, snippet) {
        if (name === "User ID") {
            return "uid"
        }
        if (snippet[4] == "true") {
            return "array"
        } else {
            return "single"
        }
    }

    function bundleRightTokenArray(rtok, uatype) {
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

    function bundleCheckWildCard(rtok) {
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

    function bundleProcessWildCard(ltok, rtok, op, lts) {
        let Mexpr = "glob.match(" + rtok + ", [], input.user." + ltok + lts
        if (op === "==") {
            Mexpr = "    " + Mexpr + ")\n"
        } else {
            Mexpr = "    !" + Mexpr + ")\n"
        }
        return Mexpr
    }

    function bundleProcessArray(ltok, rtarray, op, lts) {
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

    function generateAccessPolicyHeader(policyData) {
        return policyData +
            "package app.access\nallow = is_allowed\ndefault is_allowed = false\n\n"
    }

    function processBundleRule(e, bundleRule, policyData) {
        let Exprs = ""
        let RuleStart = "is_allowed {\n"
        let BidConst = "    input.bid == \"" + bundleRule.bid + "\"\n"
        for (let snippet of bundleRule.rule) {
            let ltoken = getBundleRuleLeftToken(snippet)
            let uavalue = getBundleRuleTokenValue(ltoken, snippet)
            let uatype = getBundleRuleTokenType(snippet).toLowerCase()
            let rtoken = getBundleRuleRightToken(snippet)
            let rtokenarray = [""]
            let optoken = getBundleRuleOpToken(snippet)

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
            if ((uatype === "string") || (uavalue === "uid")) {
                // User attribute is string type. rtoken must be a string or
                // string array
                if (rtoken.includes(',')) {
                    rtoken = rtoken.replaceAll(',', ' ').trim()
                }
                if (rtoken.includes(' ')) {
                    // Seems to be case of multiple string values
                    issingle = false
                    rtokenarray = bundleRightTokenArray(rtoken, uatype)
                }
                if (issingle) {
                    haswildcard = bundleCheckWildCard(rtoken)
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
                    // Seems to be case of multiple string values
                    issingle = false
                    rtokenarray = bundleRightTokenArray(rtoken, uatype)
                }
            }

            if (issingle) {
                rts = ""
            }
            if (uavalue != "array") {
                lts = ""
            }
            if (uavalue === "uid") {
                // ltoken is user id
                if (!issingle) {
                    // We have an array of values to match this attribute.
                    Exprs += bundleProcessArray("uid", rtokenarray, optoken, "")
                } else {
                    // We have a single value to match
                    if (haswildcard) {
                        // glob.match("*foo.com", [], input.user.uid)
                        Exprs += bundleProcessWildCard("uid", rtoken, optoken, "")
                    } else {
                        // input.user.uid <op> "value"
                        Exprs += "    input.user.uid " + optoken + " " + rtoken + "\n"
                    }
                }
            } else {
                // ltoken is an array type user attribute
                // It could be matched with a single value, or with multiple
                // values. If single value, it could have a wildcard.
                if (!issingle) {
                    // We have an array of values to match this attribute
                    Exprs += bundleProcessArray(ltoken, rtokenarray, optoken, lts)
                } else {
                    // We have a single value to match
                    if (haswildcard && (uatype === "string")) {
                        Exprs += bundleProcessWildCard(ltoken, rtoken, optoken, lts)
                    } else {
                        Exprs += "    input.user." + ltoken + lts
                        Exprs += " " + optoken + " " + rtoken + rts + "\n"
                    }
                }
            }
        }
        let RuleEnd = "}\n\n"
        return policyData + RuleStart + BidConst + Exprs + RuleEnd
    }

    // ------------------Policy generation functions end----------------------



    const toggleKey = (item) => {
        setKeyModal(!keyModal);
        let obj = zippedData.find((obj) => obj.bid === item['__bid']);
        if (obj) {
            setKeyBid(obj['__key']);
        } else {
            setKeyBid('Cannot find key');
        }
    }

    const copyKey = (key) => {
        const tempInput = document.createElement('input')
        tempInput.value = key
        document.body.appendChild(tempInput)
        tempInput.select()
        document.execCommand('copy')
        document.body.removeChild(tempInput)
    }

    const showingIcon = <FontAwesomeIcon icon="angle-right" />
    const hidingIcon = <FontAwesomeIcon icon="angle-down" className="text-primary" />

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard className="shadow large">
                        <CCardHeader>
                            <CTooltip content="Click for documentation">
                                <CLink
                                    color="primary"
                                    href="https://docs.nextensio.net/configurations/appgroups.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    AppGroups
                                </CLink>
                            </CTooltip>
                            {easyMode &&
                                <CButton
                                    className="float-right"
                                    color="primary"
                                    onClick={handlePolicyGeneration}
                                >
                                    <FontAwesomeIcon icon="bullseye" className="mr-1" />Generate Policy
                                </CButton>
                            }
                            <div className="text-muted small">Click on a row to see rules and attributes</div>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={zippedData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{ placeholder: 'By AppGroup ID, name...', label: 'Search: ' }}
                                noItemsView={{ noItems: 'No AppGroup exists ' }}
                                sorter
                                pagination
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
                                                    <CCardBody className="roboto-font">
                                                        <CRow>

                                                            <CCol sm="12">
                                                                {easyMode ?
                                                                    <>
                                                                        <CCallout color="info" className="text-info"><strong>Rules</strong></CCallout>
                                                                        {matchRule(item)}
                                                                    </>
                                                                    :
                                                                    <>
                                                                        <CCallout color="info" className="text-info"><strong>Attributes</strong></CCallout>
                                                                        {matchAttrs(item)}
                                                                    </>
                                                                }
                                                            </CCol>
                                                        </CRow>

                                                    </CCardBody>
                                                </CCollapse>
                                            )
                                        },
                                    'rule':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip
                                                        content='Rule'
                                                        placement='top'
                                                    >
                                                        <CButton
                                                            className="button-table"
                                                            color='primary'
                                                            variant='ghost'
                                                            size="sm"
                                                            disabled={!easyMode}
                                                            onClick={() => { handleRule(item) }}
                                                        >
                                                            <FontAwesomeIcon icon="fingerprint" size="lg" className="icon-table-edit" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip
                                                        content='Edit'
                                                        placement='top'
                                                    >
                                                        <CButton
                                                            className="button-table"
                                                            color='primary'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { handleEdit(item) }}
                                                        >
                                                            <FontAwesomeIcon icon="pen" size="lg" className="icon-table-edit" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                    'delete':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip
                                                        content='Delete'
                                                        placement='top'
                                                    >
                                                        <CButton
                                                            className="button-table"
                                                            color='danger'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { toggleDelete(item) }}
                                                        >
                                                            <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                    'key':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip
                                                        content='Key'
                                                        placement='top'
                                                    >
                                                        <CButton
                                                            className="button-table"
                                                            color='primary'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { toggleKey(item) }}
                                                        >
                                                            <FontAwesomeIcon icon="key" size="lg" className="icon-table-edit" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        }
                                }}
                            />
                        </CCardBody>
                        <CCardFooter>
                            <CButton className="button-footer-primary" color="primary" variant="outline" onClick={handleRefresh}>
                                <CIcon name="cil-reload" />
                                <strong>{" "}Refresh</strong>
                            </CButton>
                            <CButton className="button-footer-success" color="success" variant="outline" onClick={handleAdd}>
                                <CIcon name="cil-plus" />
                                <strong>{" "}Add</strong>
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
                <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                    <CModalHeader className='bg-danger text-white py-n5' closeButton>
                        <strong>Confirm Deletion</strong>
                    </CModalHeader>
                    <CModalBody className='text-lg-left'>
                        <strong>Are you sure you want to delete {deleteBid}?</strong>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="danger"
                            onClick={() => handleDelete(deleteBid)}
                        >Confirm</CButton>
                        <CButton
                            color="secondary"
                            onClick={() => setDeleteModal(!deleteModal)}
                        >Cancel</CButton>
                    </CModalFooter>
                </CModal>
                <CModal show={policyModal} onClose={() => setPolicyModal(!policyModal)}>
                    <CModalHeader className='bg-success text-white py-n5' closeButton>
                        <strong>Policy has been generated.</strong>
                    </CModalHeader>
                    <CModalBody className='text-lg-left'>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="success"
                            onClick={() => setPolicyModal(!policyModal)}
                        >Ok.</CButton>
                    </CModalFooter>
                </CModal>
                <CModal className="roboto-font" show={keyModal} onClose={() => setKeyModal(!keyModal)}>
                    <CModalHeader className='bg-primary text-white py-n5' closeButton>
                        <strong>Copy key to /opt/nextensio/connector.key in Data Center</strong>
                    </CModalHeader>
                    <CModalBody className='wrap'>
                        <div>{keyBid}</div>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="secondary"
                            onClick={() => copyKey(keyBid)}
                        >Copy</CButton>
                    </CModalFooter>
                </CModal>
            </CRow>
        </>
    )
}

export default withRouter(BundlesView)
