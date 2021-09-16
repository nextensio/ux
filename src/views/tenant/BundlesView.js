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
    const [bundleData, updateBundleData] = useState(initTableData);
    const [bundleAttrData, updateBundleAttrData] = useState(initTableData);
    const [bundleRuleData, updateBundleRuleData] = useState(initTableData);
    const [bundleAttrSet, updateBundleAttrSet] = useState(initTableData)

    // Used to check if bid already exists in bundlesAdd page
    const [bidData, updateBidData] = useState("");
    const [zippedData, updateZippedData] = useState(initTableData);

    const [details, setDetails] = useState([]);
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

    const toAttributeEditor = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/attreditor'
        })
    }

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

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/bundles/edit',
            state: zippedData[index]
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

    function getBundleRuleTokenType(name, snippet) {
        if (name === "User ID") {
            return "uid"
        }
        if (snippet[4] == "true") {
            return "array"
        } else {
            return "single"
        }
    }

    function generateAccessPolicyHeader(policyData) {
        return policyData +
            "package app.access\nallow = is_allowed\ndefault is_allowed = false\n\n"
    }

    function processBundleRule(e, bundleRule, policyData) {
        let Exprs = ""
        let RuleStart = "is_allowed {\n"
        let BidConst = "    input.bid == " + bundleRule.bid + "\n"
        for (let snippet of bundleRule.rule) {
            let ltoken = getBundleRuleLeftToken(snippet)
            let rtoken = getBundleRuleRightToken(snippet)
            let optoken = getBundleRuleOpToken(snippet)

            let uatype = getBundleRuleTokenType(ltoken)
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
        let RuleEnd = "}\n\n"
        return policyData + RuleStart + BidConst + Exprs + RuleEnd
    }

    // ------------------Policy generation functions end----------------------

    function matchRule(item) {
        let rules = []
        for (var i = 0; i < bundleRuleData.length; i++) {
            if (item.bid == bundleRuleData[i].bid) {
                rules.push(bundleRuleData[i])
            }
        }
        if (rules.length != 0) {
            return (
                rules.map(rule => {
                    return (
                        <CCallout className="rule-callout-bundle" color="info">
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
                                onClick={e => handleRuleEdit(rule)}
                            >
                                <FontAwesomeIcon icon="pen" size="lg" className="icon-table-edit" />
                            </CButton>

                        </CCallout>
                    )
                }))
        } else {
            return (
                <CCallout className="rule-callout-bundle-none" color="warning">
                    <strong>No Rules Exist</strong>
                    <CButton className="float-right" disabled size="sm">
                        <FontAwesomeIcon className="text-danger" icon="ban" size="lg"></FontAwesomeIcon>
                    </CButton>
                </CCallout>
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
                            <td>{attr}</td>
                            <td>
                                {["", 0, false].includes(item[attr]) ?
                                    "Default Value Assigned" :
                                    Array.isArray(item[attr]) ?
                                        item[attr].length == 1 && ["", 0, false].includes(item[attr][0]) ?
                                            "Default Value Assigned" :
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
                            <strong>AppGroup</strong>
                            <CLink
                                className="float-right"
                                color="primary"
                                href="https://docs.nextensio.net/configurations/appgroups.html"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <CIcon className="mr-1" name="cil-info" />
                                AppGroup Docs
                            </CLink>
                            <div className="text-muted small">Click on a row to see rules</div>
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
                                                            <CCol sm="6">
                                                                <h4 className="text-primary"><u>Attributes</u></h4>
                                                                {matchAttrs(item)}
                                                            </CCol>
                                                            <CCol sm="6">
                                                                <h4 className="text-primary"><u>Rules</u></h4>
                                                                {matchRule(item)}
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
                <CModal show={keyModal} onClose={() => setKeyModal(!keyModal)}>
                    <CModalHeader className='bg-primary text-white py-n5' closeButton>
                        <strong>Copy key to /opt/nextensio/connector.key in Data Center</strong>
                    </CModalHeader>
                    <CModalBody className='text-lg-left'>
                        {keyBid}
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
