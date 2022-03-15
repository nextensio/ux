import React, { useState, useEffect } from 'react'
import {
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
    CPopover,
    CPagination,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './tenantviews.scss'
import AttributeEditorModal from 'src/utilities/modals/AttributeEditorModal';

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
        label: "AppGroup ID",
        _classes: "data-head"
    },
    {
        key: "__name",
        _classes: "data-field"
    },
    {
        key: "__cpodrepl",
        label: "Compute Pods",
        _classes: "data-field"
    },
    {
        key: "__services",
        label: "Apps",
        _classes: "data-field",
        _style: { width: '1%' }
    },
    {
        key: "status",
        label: "Status",
        _classes: "data-field",
        _style: { width: '1%' }
    },
    {
        key: 'rule',
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


const BundlesView = (props) => {

    const initTableData = Object.freeze(
        []
    );

    const [easyMode, setEasyMode] = useState(true);
    const [bundleData, updateBundleData] = useState(initTableData);
    const [bundleAttrData, updateBundleAttrData] = useState(initTableData);
    const [bundleRuleData, updateBundleRuleData] = useState(initTableData);
    const [bundleAttrSet, updateBundleAttrSet] = useState(initTableData)
    const [status, updateStatus] = useState(Object.freeze([]))
    const [statusModal, setStatusModal] = useState(false)
    const [statusPage, setStatusPage] = useState(0)
    const [currentServices, updateCurrentServices] = useState(initTableData)

    // Used to check if bid already exists in bundlesAdd page
    const [bidData, updateBidData] = useState("");
    const [zippedData, updateZippedData] = useState(initTableData)

    const [details, setDetails] = useState([]);
    const [invalidPolicyModal, setInvalidPolicyModal] = useState(false);
    const [generatePolicyModal, setGeneratePolicyModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteBid, setDeleteBid] = useState("");
    const [keyModal, setKeyModal] = useState(false);
    const [addAttrModal, setAddAttrModal] = useState(false)
    const [keyBid, setKeyBid] = useState("");

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
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenant'), hdrs)
            .then(response => response.json())
            .then(data => { setEasyMode(data.Tenant.easymode) });
    }, []);

    useEffect(() => {
        setDetails([]);
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/bundlerules/all'), hdrs)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                updateBundleRuleData(data)
            });
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundles'), hdrs)
            .then(response => response.json())
            .then(data => updateBundleData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allbundleattr'), hdrs)
            .then(response => response.json())
            .then(data => updateBundleAttrData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/all'), hdrs)
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
            pathname: '/tenant/' + props.match.params.id + '/' + props.match.params.group + '/bundles/add',
            state: bidData
        })
    }

    const handleRule = (item) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/' + props.match.params.group + '/bundles/rule',
            state: [item.bid, "Add"]
        })
    }

    const handleRuleEdit = (item) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/' + props.match.params.group + '/bundles/rule',
            state: [item, "Edit"]
        })
    }

    const handleEdit = (item) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/' + props.match.params.group + '/bundles/edit',
            state: item
        });
        setDetails([]);
    }

    const toAttrEditor = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/' + props.match.params.group + '/attreditor'
        })
    }

    const handleDelete = (bid) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/bundle/' + bid), hdrs)
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
        // Need group id in api
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/bundlerule/' + rule.bid + '/' + rule.rid + '/' + props.match.params.group), hdrs)
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
                let rules = [...bundleRuleData]
                let index = rules.indexOf(rule)
                rules.splice(index, 1)
                updateBundleRuleData(rules)
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
                <>
                    <CCallout color="info" className="text-info">
                        <strong>Rules</strong>
                    </CCallout>

                    <CListGroup>
                        {rules.map(rule => {
                            return (
                                <>
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
                                        <CListGroup className="py-3">
                                            {rule.rule.map(snippet => {
                                                return (
                                                    <CListGroupItem className="border-0">{snippet.slice(0, 3).join(' ')}</CListGroupItem>
                                                )
                                            })}
                                        </CListGroup>
                                    </CListGroupItem>
                                </>
                            )
                        })}
                    </CListGroup>
                </>
            )
        } else {
            return (
                <>
                    <CCallout color="warning" className="text-warning">
                        <strong>Rules</strong>
                    </CCallout>
                    <CListGroupItem color="warning">
                        <strong>No Rules Exist</strong>
                    </CListGroupItem>
                </>
            )
        }
    }

    function matchAttrs(item) {
        if (bundleAttrSet.length != 0) {
            return (
                <table className="table-attrs-bundle">
                    <tr>
                        <th className="attributes header">Key</th>
                        <th className="header">Value</th>
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
        } else {
            return (
                <CCallout color="warning">
                    No attributes configured! <a className="text-info" onClick={toAttrEditor}>Click here</a> to create AppGroup attributes.
                </CCallout>
            )
        }
    }

    const handleStatus = (e, item) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/bundlestatus/' + item.bid), hdrs)
            .then(response => response.json())
            .then(data => updateStatus(data))
        setStatusPage(0)
        setStatusModal(true)
        e.stopPropagation()
    }

    const handleServices = (item) => {
        if (item.__services == null) {
            return
        }
        let services = item.__services.sort()
        updateCurrentServices(services)
    }

    const servicesHeader = (
        <h4 className="my-2 ml-2">
            Services
        </h4>
    )

    const servicesContent = (
        <div className="pb-3">
            {currentServices.map(service => {
                return (
                    <div>{service}</div>
                )
            })}
        </div>
    )

    const handlePolicyGeneration = (e) => {
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/policy/generate/AccessPolicy'), requestOptions)
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


    // --------------Policy generation now in controller--------------------

    const generatePolicyFromBundleRules = (e, bundleRuleData) => {
        let RetVal = [""]
        RetVal[0] = ""
        RetVal[1] = ""
        return RetVal
    }

    // ------------------Policy generation functions end----------------------

    const triggerPolicyModal = (e) => {
        const retval = generatePolicyFromBundleRules(e, bundleRuleData)
        if (!retval[0]) {
            setGeneratePolicyModal(true)
        } else (setInvalidPolicyModal(true))
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

    const triggerAddAttr = (e) => {
        setAddAttrModal(!addAttrModal)
    }

    const showingIcon = <FontAwesomeIcon icon="angle-right" />
    const hidingIcon = <FontAwesomeIcon icon="angle-down" className="text-primary" />

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard className="roboto-font shadow large">
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
                            {easyMode ?
                                <CButton
                                    className="float-right"
                                    color="primary"
                                    onClick={triggerPolicyModal}
                                >
                                    <FontAwesomeIcon icon="bullseye" className="mr-1" />Generate Policy
                                </CButton>
                                :
                                <CButton
                                    className="float-right"
                                    color="primary"
                                    onClick={triggerAddAttr}
                                >
                                    <FontAwesomeIcon icon="bullseye" className="mr-1" /> Add Attribute
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
                                    '__services':
                                        (item, index) => {
                                            return (
                                                <td className="py-2 ml-5">
                                                    <CPopover header={servicesHeader} content={servicesContent}>
                                                        <CButton
                                                            className="button-table"
                                                            color='info'
                                                            variant='ghost'
                                                            size="sm"
                                                            onMouseOver={() => handleServices(item)}
                                                        >
                                                            <FontAwesomeIcon icon="list-ul" size="lg" className="icon-table-info" />
                                                        </CButton>
                                                    </CPopover>
                                                </td>
                                            )
                                        },
                                    'status':
                                        (item, index) => {
                                            return (
                                                <td className="py-2 ml-5">
                                                    <CButton
                                                        className="button-table"
                                                        color='info'
                                                        variant='ghost'
                                                        size="sm"
                                                        onClick={e => handleStatus(e, item)}
                                                    >
                                                        <FontAwesomeIcon icon="battery-three-quarters" size="lg" className="icon-table-info" />
                                                    </CButton>
                                                </td>
                                            )
                                        },
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
                                                        <CRow>
                                                            <CCol sm="12">
                                                                {easyMode ?
                                                                    <>
                                                                        {matchRule(item)}
                                                                    </>
                                                                    :
                                                                    <>
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
                            onClick={e => handlePolicyGeneration(e, bundleRuleData)}
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
                <CModal show={statusModal} className="roboto-font" onClose={() => setStatusModal(!statusModal)}>
                    <CModalHeader className="bg-info text-white py-n5" closeButton>
                        <strong>Status</strong>
                    </CModalHeader>
                    <CModalBody className="text-lg-left">
                        {status.length != 0 ?
                            <div className="pb-3">
                                <div>There are {status.length} statuses to show.</div>
                                <CCallout color="info">
                                    <div>Device: {status[statusPage].device ? status[statusPage].device : <div className="text-warning">None</div>}</div>
                                    <div>Gateway: {status[statusPage].gateway ? status[statusPage].gateway : <div className="text-warning">None</div>}</div>
                                    <div>Health: {status[statusPage].health ? status[statusPage].health : <div className="text-warning">None</div>}</div>
                                    <div>Source: {status[statusPage].source ? status[statusPage].source : <div className="text-warning">None</div>}</div>
                                </CCallout>
                                <CPagination
                                    className="mt-5"
                                    activePage={statusPage}
                                    pages={status.length}
                                    onActivePageChange={(i) => setStatusPage(i)}
                                    doubleArrows={false}
                                />
                            </div> :
                            <div>
                                No status to show.
                            </div>
                        }
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="info" onClick={() => setStatusModal(!statusModal)}>
                            Ok
                        </CButton>
                    </CModalFooter>
                </CModal>
                <AttributeEditorModal props={props} apiHdrs={hdrs.headers} userBundleOrHost={"Bundles"} show={addAttrModal} showFunc={triggerAddAttr} />

            </CRow>
        </>
    )
}

export default withRouter(BundlesView)
