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
    CDataTable,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CRow,
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
        key: "host",
        label: "Host ID",
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
    const [hostsData, updateHostData] = useState(initTableData);
    const [hostRuleData, updateHostRuleData] = useState(initTableData);
    const [hostAttrSet, updateHostAttrSet] = useState(initTableData)

    // Routing modal will be triggered if the user attempts to delete the route when only one exists
    const [routingModal, setRoutingModal] = useState(false);
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
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allhostattr'), hdrs)
            .then(response => response.json())
            .then(data => updateHostData(data));
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

    // Creates route objects in the hostData.config list
    // Each route object has a tag key and host attribute keys, with an empty strings as values
    // ex. {tag: '', userAttr1: '', userAttr2: '', userAttr3: '', ...etc}
    // then immediately pushes to DB
    const addTag = (e, item) => {
        const i = hostsData.indexOf(item);
        const data = [...hostsData]
        const routeDict = data[i].routeattrs[0]
        const keys = Object.keys(routeDict)
        const initObj = {}
        keys.forEach((key, index) => {
            initObj[key] = ""
        })
        data[i].routeattrs.push(initObj)
        updateHostData(data)
        e.stopPropagation()
        handleSubmit(e, hostsData[i])
    }

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

        let RegoPolicy = ""
        RegoPolicy = generateRoutePolicyHeader(RegoPolicy)
        // for each entry/row in hostRuleData, generate Rego code
        for (var i = 0; i < hostRuleData.length; i++) {
            RegoPolicy = processHostRule(e, hostRuleData[i], RegoPolicy)
        }
        return RegoPolicy
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

    function getHostRuleTokenType(name, snippet) {
        if (name === "User ID") {
            return "uid"
        }
        if (snippet[4] === "true") {
            return "array"
        } else {
            return "single"
        }
    }

    function generateRoutePolicyHeader(policyData) {
        return policyData +
            "package user.routing\ndefault route_tag = \"\"\n\n"
    }

    function processHostRule(e, hostRule, policyData) {
        let tagSpecified = 0
        let Exprs = ""
        let RuleStart = "route_tag = rtag {\n"
        let HostConst = "    input.host == " + hostRule.host + "\n"
        let routeTagValue = ""
        for (let snippet of hostRule.rule) {
            let ltoken = getHostRuleLeftToken(snippet)
            let rtoken = getHostRuleRightToken(snippet)
            let optoken = getHostRuleOpToken(snippet)

            if (ltoken === "tag") {
                routeTagValue = rtoken
                tagSpecified = 1
            } else {
                let uatype = getHostRuleTokenType(ltoken, snippet)
                if (uatype === "array") {
                    // ltoken is an array type user attribute
                    Exprs += "    input.user." + ltoken + "[_] " + optoken + " "
                } else if (uatype === "single") {
                    // ltoken is a single value user attribute
                    Exprs += "    input.user." + snippet[0] + " " + optoken + " "
                } else if (uatype === "uid") {
                    // ltoken is user id
                    Exprs += "    input.user.uid" + " " + optoken + " "
                }
                // rtoken is always a constant. Could be single value or array
                // of values. TBD: handling array of values
                Exprs += rtoken + "\n"
            }
        }
        let RuleEnd = "}\n\n"
        if (tagSpecified == 0) {
            // Error - route tag needs to be specified
            routeTagValue = "Error - ** route tag value unspecified **"
        }
        let routePolicyTag = "    rtag := " + routeTagValue + "\n"
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
                rules.map(rule => {
                    return (
                        <CCallout className="rule-callout-host" color="info">
                            <strong>{rule.rid}</strong>
                            <CButton
                                className="button-table float-right"
                                color='danger'
                                variant='ghost'
                                size="sm"
                                onClick={e => handleRuleDelete(rule)}
                            >
                                <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                            </CButton>
                            <CButton
                                className="button-table float-right"
                                color='primary'
                                variant='ghost'
                                size="sm"
                                onClick={e => { handleRuleEdit(rule) }}
                            >
                                <FontAwesomeIcon icon="pen" size="lg" className="icon-table-edit" />
                            </CButton>
                        </CCallout>
                    )
                }))
        } else {
            return (
                <CCallout className="rule-callout-host-none" color="warning">
                    <strong>No Rules Exist</strong>
                    <CButton className="float-right" disabled size="sm">
                        <FontAwesomeIcon className="text-danger" icon="ban" size="lg"></FontAwesomeIcon>
                    </CButton>
                </CCallout>
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
                                    Hosts
                                </CLink>
                            </CTooltip>
                            <CButton
                                color="primary"
                                className="float-right"
                                onClick={handlePolicyGeneration}
                            >
                                Generate Policy
                            </CButton>
                            <div className="text-muted small">Click on a row to see all routes</div>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={hostsData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{ placeholder: 'By user ID, name...', label: 'Search: ' }}
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
                                                        <>
                                                            {/**If host attributes exist, render below */}
                                                            {/**This button is used to add another route */}
                                                            <CButton
                                                                className="ml-auto"
                                                                color="primary"
                                                                size="sm"
                                                                onClick={(e) => { addTag(e, item) }}
                                                            >
                                                                Add Route
                                                            </CButton>
                                                            <table className="my-3 table table-outline d-sm-table">
                                                                <tr>
                                                                    <th className="attributes header roboto-font border-right my-auto">Routes</th>
                                                                    {routeConfig.map((route, i) => {
                                                                        return (
                                                                            <td className="attributes header roboto-font">
                                                                                {/**If the tag attribute is not an empty string, render the tag val
                                                                                     * else, render in progress
                                                                                     */}
                                                                                <div>
                                                                                    {route.tag != ""
                                                                                        ?
                                                                                        <CButton
                                                                                            className="button-table"
                                                                                            variant="ghost"
                                                                                            color="success"
                                                                                            size="sm"
                                                                                            onClick={e => handleAttrConfig(index, i)}
                                                                                        ><strong>{route.tag}</strong>
                                                                                        </CButton>
                                                                                        :
                                                                                        <CButton
                                                                                            className="button-table"
                                                                                            variant="ghost"
                                                                                            color="warning"
                                                                                            size="sm"
                                                                                            onClick={e => handleAttrConfig(index, i)}
                                                                                        ><strong>In Progress</strong>
                                                                                        </CButton>
                                                                                    }
                                                                                </div>
                                                                                <div>
                                                                                    <CButton
                                                                                        className="button-table"
                                                                                        variant="ghost"
                                                                                        color="primary"
                                                                                        size="sm"
                                                                                        onClick={e => handleRule(e, item.host, route.tag)}
                                                                                    >
                                                                                        <FontAwesomeIcon icon="fingerprint" className="icon-table-edit" />
                                                                                    </CButton>
                                                                                    <CButton
                                                                                        className="ml-1 button-table"
                                                                                        variant="ghost"
                                                                                        color="danger"
                                                                                        size="sm"
                                                                                        onClick={(e) => routeConfig.length > 1 ?
                                                                                            delConfig(e, item, i) :
                                                                                            setRoutingModal(true)}
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
                                                                <tr>
                                                                    <th className="attributes roboto-font border-right">
                                                                        <CBadge color="info">Rules</CBadge>
                                                                    </th>

                                                                    {routeConfig.map((route, i) => {
                                                                        return (
                                                                            <td>
                                                                                {matchRule(route.tag)}
                                                                            </td>
                                                                        )
                                                                    })}
                                                                </tr>
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


                                                            </table>
                                                        </>

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
            <CModal show={routingModal} onClose={() => setRoutingModal(!routingModal)}>
                <CModalHeader className='bg-danger text-white py-n5' closeButton>
                    <strong>Notice!</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    <strong>You need at least one route for this host.</strong>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="secondary"
                        onClick={() => setRoutingModal(!routingModal)}
                    >Ok</CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default withRouter(HostsView)
