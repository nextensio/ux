import React, { lazy, useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CButtonClose,
    CButtonToolbar,
    CCallout,
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
    CNav,
    CNavLink,
    CNavItem,
    CRow,
    CTabs,
    CTabContent,
    CTabPane,
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
        key: "host",
        label: "Host ID",
        _classes: "data-head"
    },
    {
        key: "name",
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
    // config: [{route: limited, OSVersion: linux windows, employeeLevel: 3, location: east},
    //          {route: unlimited, OSVersion: linux windows, employeeLevel: 1, location: east},
    //          {route: premium, OSVersion: linux windows, employeeLevel: any, location: west}]
    // }
    //
    const [hostsData, updateHostData] = useState(initTableData);

    // Routing modal will be triggered if the user attempts to delete the route when only one exists
    const [routingModal, setRoutingModal] = useState(false);
    const [details, setDetails] = useState([]);
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
            pathname: '/tenant/' + props.match.params.id + '/hosts/attrconfig',
            state: [hostsData[index], configIndex]
        });
        setDetails([])
    }

    // Creates route objects in the hostData.config list
    // Each route object has a route key and host attribute keys, with an empty strings as values
    // ex. {route: '', userAttr1: '', userAttr2: '', userAttr3: '', ...etc}
    // then immediately pushes to DB
    const addConfig = (e, item) => {
        const i = hostsData.indexOf(item);
        const data = [...hostsData]
        const configDict = data[i].config[0]
        const keys = Object.keys(configDict)
        const initObj = {}
        keys.forEach((key, index) => {
            initObj[key] = ""
        })
        data[i].config.push(initObj)
        updateHostData(data)
        e.stopPropagation()
        handleSubmit(e, hostsData[i])
    }

    // deletes a route object from the hostData.config list
    // immediately pushes this change to the DB
    const delConfig = (e, item, configIndex) => {
        const i = hostsData.indexOf(item);
        const data = [...hostsData]
        data[i].config.splice(configIndex, 1)
        updateHostData(data)
        e.stopPropagation()
        handleSubmit(e, hostsData[i])
    }

    const handleDelete = (e, index) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/hostattr/') + hostsData[index].host, hdrs)
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
                handleRefresh()
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
        e.stopPropagation()
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

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            <strong>Hosts</strong>
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
                                onRowClick={(item, index) => {toggleDetails(index)}}
                                scopedSlots={{
                                    'routes':
                                        (item, index) => {
                                            return (
                                                <td className="py-auto">
                                                    <CBadge color="success">{item.config.length}</CBadge>
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
                                                            onClick={(e) => { 
                                                                handleDelete(e, index);
                                                             }}
                                                        >
                                                            <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                    'details':
                                        (item, index) => {
                                            return (
                                                <CCollapse show={details.includes(index)}>
                                                    <CCardBody>
                                                        <CTabs activeTab={"0"}>
                                                            <CNav variant="tabs">
                                                                {/*item is the config property with form {route: routename, userattrs: ...} */}
                                                                {item.config.map((routeConfig, i) => {
                                                                    return (
                                                                        <div>
                                                                            {/* 
                                                                            * If the routename is not defined (an empty string) the tab will display In Progress...,
                                                                            * otherwise it will display the route name
                                                                            */}
                                                                            {(routeConfig.route == "") 
                                                                                ? 
                                                                                <CNavItem>
                                                                                    <CNavLink data-tab={i.toString()} onClick={((e) => e.stopPropagation())}>
                                                                                        In Progress...
                                                                                    </CNavLink>
                                                                                </CNavItem> 
                                                                                : 
                                                                                <CNavItem>
                                                                                    <CNavLink data-tab={i.toString()} onClick={(e) => e.stopPropagation()}>
                                                                                        {routeConfig.route}
                                                                                    </CNavLink>
                                                                                </CNavItem>}
                                                                        </div>
                                                                    )
                                                                })}
                                                                <CButton color="dark" variant="ghost" size="sm" className="add-tab ml-2" onClick={(e) => {addConfig(e, item)}}><CIcon name="cil-plus"/></CButton>
                                                            </CNav>
                                                            
                                                            <CTabContent>
                                                                {item.config.map((routeConfig, i) => {
                                                                    // destructure the routeConfig object {route: routename, attr: val, attr: val}
                                                                    // into routename and {attr: val, attr: val, attr: val}
                                                                    const {route, ...configAttrs} = routeConfig;
                                                                    return (
                                                                        <CTabPane data-tab={i.toString()}>
                                                                            <CRow>
                                                                                <CCol sm="6">
                                                                                    {Object.entries(configAttrs).length != 0
                                                                                        ? 
                                                                                        <div>
                                                                                            {/**
                                                                                             * If the routename is undefined (an empty string), print Almost done and include
                                                                                             * a link for the tenant to assign values to the host attributes
                                                                                             * else print route.hostName
                                                                                             */}
                                                                                            {route != ''
                                                                                                ?
                                                                                                <div className="roboto-font">
                                                                                                    <strong className="roboto-font text-primary">Route: </strong><text className="roboto-font">{route + "." + item.host}</text>
                                                                                                </div>
                                                                                            :
                                                                                                <div className="roboto-font">Almost done.
                                                                                                    {' '}<a className="text-primary" onClick={()=>{handleAttrConfig(index, i)}}><FontAwesomeIcon icon="key"/> Click Here</a>
                                                                                                    {' '}to define your route and assign attribute values
                                                                                                </div>
                                                                                            }
                                                                                        </div>
                                                                                        : <></>
                                                                                    }
                                                                                   
                                                                                </CCol>
                                                                                <CCol sm="6">
                                                                                    {/**
                                                                                     * If there are attributes assigned to this host, render buttons to delete route,
                                                                                     * and to assign values to attributes + define the route
                                                                                     * Else, just render a button to delete the route.
                                                                                     */}
                                                                                    {Object.entries(configAttrs).length != 0 
                                                                                        ?
                                                                                        <CButtonToolbar className="d-flex float-right">
                                                                                            <CButton 
                                                                                                color="primary"
                                                                                                shape="square"
                                                                                                size="sm"
                                                                                                onClick={()=>{handleAttrConfig(index, i)}}
                                                                                            >
                                                                                                <FontAwesomeIcon icon="key" className="text-white"/> Assign
                                                                                            </CButton>
                                                                                            <CButton
                                                                                                className="ml-1"
                                                                                                color="danger"
                                                                                                shape="square"
                                                                                                size="sm"
                                                                                                onClick={(e) => item.config.length > 1 ? 
                                                                                                    delConfig(e, item, i) : 
                                                                                                    setRoutingModal(true)}
                                                                                            >
                                                                                                {/**
                                                                                                 * You can delete routes until there is only one left,
                                                                                                 * if you try to delete a route when only one exists, a popup will
                                                                                                 * occur telling you this is not possible. 
                                                                                                 */}
                                                                                                Delete Route
                                                                                            </CButton>
                                                                                        </CButtonToolbar>
                                                                                        :
                                                                                        <CButton
                                                                                            className="d-flex float-right"
                                                                                            color="danger"
                                                                                            shape="square"
                                                                                            size="sm"
                                                                                            onClick={(e) => item.config.length > 1 ? 
                                                                                                delConfig(e, item, i) : 
                                                                                                setRoutingModal(true)}
                                                                                        >
                                                                                            Delete Route
                                                                                        </CButton>
                                                                                    }
                                                                                    
                                                                                </CCol>
                                                                            </CRow>
                                                                            {/**
                                                                             * If there are no attributes assigned to this host, print a message with link 
                                                                             * for tenant to navigate to HostAttrs page where they can assign attributes,
                                                                             * else render a table where you can see all attributes + the values
                                                                             */}
                                                                            {Object.entries(configAttrs).length === 0 
                                                                            ?   <div className="roboto-font">
                                                                                    You have no attributes configured on this host. 
                                                                                    {' '}<a className="text-primary" onClick={() => { handleEdit(index) }}>
                                                                                        <FontAwesomeIcon icon="pen"/> Click Here
                                                                                    </a>
                                                                                    {' '}to add attributes
                                                                                </div>
                                                                            :
                                                                                <table className="my-3 table table-outline d-sm-table">
                                                                                    <tr>
                                                                                        <th className="attributes header roboto-font">Attributes</th>
                                                                                        <td className="attributes header roboto-font"><strong>Values</strong></td>
                                                                                    </tr>
                                                                                    {/**
                                                                                     * Iterate over the config property keys (which are just the attributes)
                                                                                     * One table column will be the attributes
                                                                                     * the other will be the assigned attribute values
                                                                                     */}
                                                                                    {Object.keys(configAttrs).map(key => {
                                                                                        return (
                                                                                            <tr>
                                                                                                <th className="attributes roboto-font">{key}</th>
                                                                                                <td className="roboto-font">
                                                                                                    {/** If the attribute has a value assigned, print it, otherwise print no val assigned */}
                                                                                                    {configAttrs[key] == "" 
                                                                                                        ? <div className="text-warning">No value assigned</div>
                                                                                                        : configAttrs[key]
                                                                                                    }
                                                                                                </td>
                                                                                            </tr>
                                                                                        ) 
                                                                                    })}
                                                                                </table>
                                                                                
                                                                            }
                                                                        </CTabPane>
                                                                    )
                                                                })}
                                                            </CTabContent>
                                                        </CTabs>
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