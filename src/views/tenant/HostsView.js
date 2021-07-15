import React, { useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CCollapse,
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

    // Routing modal will be triggered if the user attempts to delete the route when only one exists
    const [routingModal, setRoutingModal] = useState(false);
    const [details, setDetails] = useState([]);
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
    }, []);

    const toDocs = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/documentation',
            state: "Hosts"
        });
    }

    const handleRefresh = (e) => {
        setDetails([])
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allhostattr'), hdrs)
            .then(response => response.json())
            .then(data => updateHostData(data));
    }

    const handleAdd = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/hosts/add')
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/hosts/edit',
            state: hostsData[index]
        });
        setDetails([])
    }

    const handleAttrConfig = (index, configIndex) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/hosts/routeconfig',
            state: [hostsData[index], configIndex]
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

    const showingIcon = <FontAwesomeIcon icon="angle-right" />
    const hidingIcon = <FontAwesomeIcon icon="angle-down" className="text-primary" />

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            <strong>Hosts</strong>
                            <CButton 
                                className="float-right" 
                                color="primary"
                                onClick={toDocs}
                            >
                                <CIcon className="mr-1" name="cil-info"/>
                                Host Docs
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
                                                        {/** 
                                                         * If item.routeattrs[0] has only one key:val pair 
                                                         * i.e. only tag exists ==> {tag: ""} then we ask the 
                                                         * tenant to configure attributes.
                                                         */}
                                                        {Object.entries(routeConfig[0]).length === 1
                                                            ? <div className="roboto-font">
                                                                You have no attributes configured on this host.
                                                                {' '}<a className="text-primary" onClick={() => { handleEdit(index) }}>
                                                                    <FontAwesomeIcon icon="pen" /> Click Here
                                                                </a>
                                                                {' '}to add attributes
                                                            </div>
                                                            :
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
                                                                        <th className="attributes header roboto-font border-right mt-auto">Attributes</th>
                                                                        {routeConfig.map((route, i) => {
                                                                            return (
                                                                                <td className="attributes header roboto-font">
                                                                                    {/**If the tag attribute is not an empty string, render the tag val
                                                                                     * else, render in progress
                                                                                     */}
                                                                                    <div>
                                                                                        {route.tag != ""
                                                                                            ? <CBadge color="success">{route.tag}</CBadge>
                                                                                            : <CBadge color="warning">In Progress</CBadge>
                                                                                        }
                                                                                    </div>
                                                                                    <div>
                                                                                        <CButton
                                                                                            className=" button-table"
                                                                                            variant="ghost"
                                                                                            color="primary"
                                                                                            size="sm"
                                                                                            onClick={() => { handleAttrConfig(index, i) }}
                                                                                        >
                                                                                            <FontAwesomeIcon icon="key" className="icon-table-edit" />
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
                                                                    {/**
                                                                        * Iterate over the routeattrs property keys (which are just the attributes)
                                                                        * One table column will be the attributes
                                                                        * the other will be the assigned attribute values
                                                                        */}
                                                                    {Object.keys(routeConfig[0]).filter(key => {
                                                                        if (key != "tag") {
                                                                            return true
                                                                        }
                                                                    }).map(key => {
                                                                        return (
                                                                            <tr>
                                                                                <th className="attributes roboto-font border-right">{key}</th>

                                                                                {/** If the attribute has a value assigned, print it, otherwise print no val assigned */}
                                                                                {routeConfig.map((route, i) => {
                                                                                    return (
                                                                                        <td className="roboto-font">
                                                                                            {[false, 0, "",].indexOf(route[key]) > -1 || 
                                                                                            (Array.isArray(route[key]) && route[key].length === 1 && [false, 0, ""].indexOf(route[key][0]) > -1)?
                                                                                                <div className="text-warning">
                                                                                                    Default value assigned
                                                                                                </div>
                                                                                            :
                                                                                                <div>
                                                                                                    {Array.isArray(route[key]) 
                                                                                                    ? <div>{route[key].join(' & ')}</div>
                                                                                                    : <div>{route[key].toString()}</div>
                                                                                                    }
                                                                                                </div>
                                                                                            }
                                                                                        </td>

                                                                                    )
                                                                                })}
                                                                            </tr>
                                                                        )
                                                                    })}
                                                                </table>
                                                            </>
                                                        }
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