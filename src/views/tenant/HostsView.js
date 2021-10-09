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
    CFormGroup,
    CLabel,
    CLink,
    CDataTable,
    CInput,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CRow,
    CTooltip,
    CListGroup,
    CListGroupItem,
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
        key: "host",
        label: "Application URL",
        _style: { width: '30%' },
        _classes: "data-head"
    },
    {
        key: "name",
        _style: { width: '30%' },
        _classes: "data-field"
    },
    {
        key: "routes",
        _classes: "data-field",
        _style: { width: '20%' },
        sorter: false
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
    }
]

const HostsView = (props) => {
    const initTableData = Object.freeze(
        []
    );

    // Example of what a final JSON version might look like
    // { host: google.com, name: google,  
    // 
    // routeattrs: [{tag: limited, OSVersion: linux windows, employeeLevel: 3, location: east},
    //          {tag: unlimited, OSVersion: linux windows, employeeLevel: 1, location: east},
    //          {tag: premium, OSVersion: linux windows, employeeLevel: any, location: west}]
    // }
    //
    const [easyMode, setEasyMode] = useState(true)
    const [hostsData, updateHostData] = useState(initTableData);
    const [hostRuleData, updateHostRuleData] = useState(initTableData);
    const [hostAttrSet, updateHostAttrSet] = useState(initTableData)

    const [addRouteModal, setAddRouteModal] = useState(false);
    const [addRoute, updateAddRoute] = useState("")
    const [addRouteItem, updateAddRouteItem] = useState("")
    const [details, setDetails] = useState([]);
    const [policyModal, setPolicyModal] = useState(false);
    const [deleteHost, setDeleteHost] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        setDetails([])
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenant'), hdrs)
            .then(response => response.json())
            .then(data => { setEasyMode(data.Tenant.easymode) });
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allhostrules'), hdrs)
            .then(response => response.json())
            .then(data => updateHostRuleData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                let hosts = []
                for (let i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Hosts") {
                        hosts.push(data[i].name)
                    }
                }
                updateHostAttrSet(hosts)
            });
    }, []);

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allhostattr'), hdrs)
            .then(response => response.json())
            .then(data => updateHostData(data));

    }, [addRouteModal]);

    const handleRefresh = (e) => {
        setDetails([])
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allhostattr'), hdrs)
            .then(response => response.json())
            .then(data => updateHostData(data));
    }

    const handleAdd = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/hosts/add')
    }

    const handleRule = (e, host, routetag) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/hosts/rule',
            state: [host, routetag]
        })
    }

    const handleRuleEdit = (item) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/hosts/rule',
            state: [item, "Edit"]
        })
    }

    const handleAttrConfig = (index, configIndex) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/hosts/routeconfig',
            state: [hostsData[index], configIndex]
        });
        setDetails([])
    }


    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/hosts/edit',
            state: hostsData[index]
        });
        setDetails([])
    }

    const triggerRouteAdd = (e, item) => {
        setAddRouteModal(!addRouteModal)
        updateAddRouteItem(item)
        e.stopPropagation()
    }

    const handleRouteAdd = (e) => {
        updateAddRoute(e.target.value)
    }

    // Creates route objects in the hostData.config list
    // Each route object has a tag key and host attribute keys, with an empty strings as values
    // ex. {tag: '', hostAttr1: '', hostAttr2: '', hostAttr3: '', ...etc}
    // then immediately pushes to DB
    const addTag = (e, item) => {
        let routeObj = {}
        hostAttrSet.map(attr => {
            routeObj[attr] = ""
        })
        routeObj.tag = addRoute
        item.routeattrs.push(routeObj)
        e.stopPropagation()
        handleSubmit(e, item)
        updateAddRouteItem("")
        updateAddRoute("")
        setAddRouteModal(!addRouteModal)
    }
    //

    // deletes a route object from the hostData.routeattrs list
    // immediately pushes this change to the DB
    const delConfig = (e, item, configIndex) => {
        const i = hostsData.indexOf(item);
        const data = [...hostsData]
        data[i].routeattrs.splice(configIndex, 1)
        updateHostData(data)
        e.stopPropagation()
        handleSubmit(e, hostsData[i])
    }

    // I noticed a bug where sorting the items in the data table causes the indexes to not 
    // point to the correct entry. So, use item to delete entry instead of index.
    const toggleDelete = (item) => {
        setDeleteHost(item.host)
        setDeleteModal(true)
    }

    const confirmDelete = (host) => {
        // The IP/Mask combo will be sent as IP_Mask since the / will get interpreted
        // as an element in the URL path
        host = host.replace("/", "_")
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/hostattr/') + host, hdrs)
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

    const handleSubmit = (e, host) => {
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(host),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/hostattr'), requestOptions)
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
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    const handleRuleDelete = (rule) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/hostrule/' + rule.host + '/' + rule.rid), hdrs)
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
                let index = hostRuleData.indexOf(rule)
                hostRuleData.splice(index, 1)
                handleRefresh()
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handlePolicyGeneration = (e) => {
        var ucode = generatePolicyFromHostRules(e, hostRuleData)
        var byteRego = ucode.split('').map(function (c) { return c.charCodeAt(0) });
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                pid: "testApplicationRouting", tenant: props.match.params.id,
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

    const generatePolicyFromHostRules = (e, hostRuleData) => {
        // Route policy generation
        // hostRuleData contains data in this format :
        //  [host1, ruleid1, rule:[[snippet1], [snippet2], [snippet3], ..]]
        //  [host1, ruleid2, rule:[[snippet1], [snippet2], ..]]
        //  [host2, ruleid1, rule:[[snippet1], [snippet2], ..]]
        //  [host3, ruleid1, rule:[[snippet1], [snippet2], [snippet3], ..]]
        //  [host3, ruleid2, rule:[[snippet1], ..]]
        //    and so on ...
        //  A snippet is of this form :
        //  [userattr, operator, const, type, isArray] where
        //  type == "string", "boolean", "number"
        //  isArray == "true" or "false"
        //  operator values are ==, !=, >, <, >=, <=

        RetVal = [""]
        let RegoPolicy = ""
        RegoPolicy = generateRoutePolicyHeader(RegoPolicy)
        // for each entry/row in hostRuleData, generate Rego code
        for (var i = 0; i < hostRuleData.length; i++) {
            RegoPolicy = processHostRule(e, hostRuleData[i], RegoPolicy)
        }
        RetVal[0] = ""
        RetVal[1] = RegoPolicy
        return RetVal
    }

    function getHostRuleLeftToken(snippet) {
        return snippet[0]
    }

    function getHostRuleRightToken(snippet) {
        return snippet[2]
    }

    function getHostRuleOpToken(snippet) {
        return snippet[1]
    }

    function getHostRuleTokenType(snippet) {
        return snippet[3]
    }

    function getHostRuleTokenValue(name, snippet) {
        if (name === "User ID") {
            return "uid"
        }
        if (name === "tag") {
            return "tag"
        }
        if (snippet[4] == "true") {
            return "array"
        } else {
            return "single"
        }
    }

    function hostRightTokenArray(rtok, uatype) {
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

    function hostCheckWildCard(rtok) {
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

    function hostProcessWildCard(ltok, rtok, op, lts) {
        let Mexpr = "glob.match(" + rtok + ", [], input.user." + ltok + lts
        if (op === "==") {
            Mexpr = "    " + Mexpr + ")\n"
        } else {
            Mexpr = "    !" + Mexpr + ")\n"
        }
        return Mexpr
    }

    function hostProcessArray(ltok, rtarray, op, lts) {
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

    function generateRoutePolicyHeader(policyData) {
        return policyData +
            "package user.routing\ndefault route_tag = \"\"\n\n"
    }

    function processHostRule(e, hostRule, policyData) {
        let tagSpecified = 0
        let routePolicyTag = "** Error **"
        let routeTagValue = "deny"
        let Exprs = ""
        let RuleStart = "route_tag = rtag {\n"
        let HostConst = "    input.host == \"" + hostRule.host + "\"\n"
        for (let snippet of hostRule.rule) {
            let ltoken = getHostRuleLeftToken(snippet)
            let uavalue = getHostRuleTokenValue(ltoken, snippet)
            let uatype = getHostRuleTokenType(snippet).toLowerCase()
            let rtoken = getHostRuleRightToken(snippet)
            let rtokenarray = [""]
            let optoken = getHostRuleOpToken(snippet)

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
            if (ltoken === "tag") {
                routeTagValue = rtoken
                tagSpecified = 1
            } else if ((uatype === "string") || (uavalue === "uid")) {
                // User attribute is string type. rtoken must be a string or
                // string array
                if (rtoken.includes(',')) {
                    rtoken = rtoken.replaceAll(',', ' ').trim()
                }
                if (rtoken.includes(' ')) {
                    // Seems to be case of multiple string values
                    issingle = false
                    rtokenarray = hostRightTokenArray(rtoken, uatype)
                }
                if (issingle) {
                    haswildcard = hostCheckWildCard(rtoken)
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
                    rtokenarray = hostRightTokenArray(rtoken, uatype)
                }
            }
            if (issingle) {
                rts = ""
            }
            if (uavalue != "array") {
                lts = ""
            }
            if (uavalue === "tag") {
                routePolicyTag = "    rtag := \"" + routeTagValue + "\"\n"
            } else if (uavalue === "uid") {
                // ltoken is user id
                if (!issingle) {
                    // We have an array of values to match this attribute
                    Exprs += hostProcessArray("uid", rtokenarray, optoken, "")
                } else {
                    // We have a single value to match
                    if (haswildcard) {
                        // glob.match("*foo.com", [], input.user.uid)
                        Exprs += hostProcessWildCard("uid", rtoken, optoken, "")
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
                    Exprs += hostProcessArray(ltoken, rtokenarray, optoken, lts)
                } else {
                    // We have a single value to match
                    if (haswildcard && (uatype === "string")) {
                        Exprs += hostProcessWildCard(ltoken, rtoken, optoken, lts)
                    } else {
                        Exprs += "    input.user." + ltoken + lts
                        Exprs += " " + optoken + " " + rtoken + rts + "\n"
                    }
                }
            }
        }
        let RuleEnd = "}\n\n"
        return policyData + RuleStart + HostConst + Exprs + routePolicyTag + RuleEnd
    }

    // ------------------Policy generation functions end----------------------

    const matchRule = (tag) => {
        let rules = []
        for (var i = 0; i < hostRuleData.length; i++) {
            for (var j = 0; j < hostRuleData[i].rule.length; j++) {
                if (hostRuleData[i].rule[j][3] == "Route" && hostRuleData[i].rule[j][2] == tag) {
                    rules.push(hostRuleData[i])
                }
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
                            </CListGroupItem>
                        )
                    })}
                </CListGroup>
            )
        } else {
            return (
                <CListGroup>
                    <CListGroupItem className="d-flex align-items-center" color="warning">
                        <strong>No Rules Exist</strong>
                        <CButton className="ml-auto" disabled size="sm">
                            <FontAwesomeIcon className="text-danger" icon="ban" size="lg"></FontAwesomeIcon>
                        </CButton>
                    </CListGroupItem>
                </CListGroup>
            )
        }
    }

    function matchAttrs(item) {
        if (Array.isArray(item)) {
            if (item.length == 1 && ["", 0, false].includes(item[0])) {
                return (
                    <td className="text-warning">Default value</td>
                )
            }
            else {
                return (
                    <td>{item}</td>
                )
            }
        }
        else {
            if (["", 0, false].includes(item)) {
                return (
                    <td className="text-warning">Default value</td>
                )
            }
            else {
                return (
                    <td>{item.toString()}</td>
                )
            }
        }
    }

    const showingIcon = <FontAwesomeIcon icon="angle-right" />
    const hidingIcon = <FontAwesomeIcon icon="angle-down" className="text-primary" />

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            <CTooltip content="Click for Documentation">
                                <CLink
                                    color="primary"
                                    href="https://docs.nextensio.net/configurations/hosts.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Applications
                                </CLink>
                            </CTooltip>
                            {easyMode &&
                                <CButton
                                    color="primary"
                                    className="float-right"
                                    onClick={handlePolicyGeneration}
                                >
                                    <FontAwesomeIcon icon="bullseye" className="mr-1" /> Generate Policy
                                </CButton>
                            }
                            <div className="text-muted small">Click on a row to see all routes</div>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={hostsData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{ placeholder: 'By Application URL, name...', label: 'Search: ' }}
                                noItemsView={{ noItems: 'No hosts exist ' }}
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
                                    'routes':
                                        (item, index) => {
                                            return (
                                                <td className="py-auto">
                                                    <CBadge color="success">{item.routeattrs.length}</CBadge>
                                                </td>
                                            )
                                        },
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip content='Edit' placement='top'>
                                                        <CButton
                                                            className="button-table"
                                                            color='primary'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { handleEdit(index) }}
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
                                                    <CTooltip content='Delete' className='bottom'>
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
                                    'details':
                                        (item, index) => {
                                            const routeConfig = item.routeattrs
                                            return (
                                                <CCollapse show={details.includes(index)}>
                                                    <CCardBody>
                                                        {/**This button is used to add another route */}
                                                        <CButton
                                                            className="float-right mb-3"
                                                            color="primary"
                                                            size="sm"
                                                            onClick={e => triggerRouteAdd(e, item)}
                                                        >
                                                            Add Route
                                                        </CButton>
                                                        {routeConfig.length ?
                                                            <table className="my-3 table">
                                                                <tr>
                                                                    <th className="attributes header roboto-font border-right">Routes</th>
                                                                    {routeConfig.map((route, i) => {
                                                                        return (
                                                                            <td className="attributes header roboto-font">
                                                                                <strong className="text-success">{route.tag}</strong>
                                                                                <div>
                                                                                    {easyMode ?
                                                                                        <CButton
                                                                                            className="button-table"
                                                                                            variant="ghost"
                                                                                            color="primary"
                                                                                            size="sm"
                                                                                            onClick={e => handleRule(e, item.host, route.tag)}
                                                                                        >
                                                                                            <FontAwesomeIcon icon="fingerprint" className="icon-table-edit" />
                                                                                        </CButton>
                                                                                        :
                                                                                        <CButton
                                                                                            className="button-table"
                                                                                            variant="ghost"
                                                                                            color="primary"
                                                                                            size="sm"
                                                                                            onClick={e => handleAttrConfig(index, i)}
                                                                                        >
                                                                                            <FontAwesomeIcon icon="pen" className="icon-table-edit" />

                                                                                        </CButton>

                                                                                    }
                                                                                    <CButton
                                                                                        className="ml-1 button-table"
                                                                                        variant="ghost"
                                                                                        color="danger"
                                                                                        size="sm"
                                                                                        onClick={(e) => delConfig(e, item, i)}
                                                                                    >
                                                                                        {/**
                                                                                             * You can delete routes until there is only one left,
                                                                                             * if you try to delete a route when only one exists, a popup will
                                                                                             * occur telling you this is not possible. 
                                                                                             */}
                                                                                        <FontAwesomeIcon icon="trash-alt" className="icon-table-delete" />
                                                                                    </CButton>
                                                                                </div>
                                                                            </td>
                                                                        )
                                                                    })}
                                                                </tr>
                                                                {easyMode ?

                                                                    <tr>
                                                                        <th className="attributes roboto-font border-right">
                                                                            <CCallout color="info">Rules</CCallout>
                                                                        </th>

                                                                        {routeConfig.map((route, i) => {
                                                                            return (
                                                                                <td>
                                                                                    {matchRule(route.tag)}
                                                                                </td>
                                                                            )
                                                                        })}
                                                                    </tr>
                                                                    :
                                                                    <>
                                                                        {hostAttrSet.map(attr => {
                                                                            return (
                                                                                <tr>
                                                                                    <th className="attributes roboto-font border-right">{attr}</th>
                                                                                    {routeConfig.map((route, i) => {
                                                                                        return (
                                                                                            <>
                                                                                                {matchAttrs(route[attr])}
                                                                                            </>
                                                                                        )
                                                                                    })}
                                                                                </tr>
                                                                            )
                                                                        })}
                                                                    </>
                                                                }
                                                            </table> :
                                                            <CCallout className="roboto-font" color="warning"><strong>No routes configured for {item.host}. Click Add Route to add a route.</strong></CCallout>}

                                                    </CCardBody>
                                                </CCollapse>
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
            </CRow>

            <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                <CModalHeader className='bg-danger text-white py-n5' closeButton>
                    <strong>Confirm Deletion</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    <strong>Are you sure you want to delete {deleteHost}?</strong>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="danger"
                        onClick={() => confirmDelete(deleteHost)}
                    >Confirm</CButton>
                    <CButton
                        color="secondary"
                        onClick={() => setDeleteModal(!deleteModal)}
                    >Cancel</CButton>
                </CModalFooter>
            </CModal>

            <CModal show={addRouteModal} className="roboto-font" onClose={() => setAddRouteModal(!addRouteModal)}>
                <CModalHeader className='bg-success text-white py-n5' closeButton>
                    <strong>Enter your route name</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    <strong>{addRoute}.{addRouteItem.host && addRouteItem.host}</strong>
                    <CFormGroup className="mt-3">
                        <CLabel>Name</CLabel>
                        <CInput value={addRoute} onChange={handleRouteAdd} />
                    </CFormGroup>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="success"
                        onClick={e => addTag(e, addRouteItem)}
                    >Confirm</CButton>
                    <CButton
                        color="secondary"
                        onClick={() => setAddRouteModal(!addRouteModal)}
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
        </>
    )
}

export default withRouter(HostsView)
