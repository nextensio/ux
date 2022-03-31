import React, { useEffect, useState } from 'react'
import {
    CButton,
    CCallout,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CCollapse,
    CDataTable,
    CInput,
    CInputGroup,
    CInvalidFeedback,
    CLabel,
    CRow,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CSelect,
    CTooltip,
    CTextarea
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { withRouter } from 'react-router-dom';
import '../tenantviews.scss'
import { useOktaAuth } from '@okta/okta-react';
import Map from './mapbox/Mapbox'

var common = require('../../../common')

const clusterFields = [
    {
        key: 'name',
        label: 'Gateway',
        _classes: 'data-head',
    }
]

const groupFields = [
    {
        key: 'show_details',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: "admGroup",
        label: "Name",
        _classes: "data-head",
    },
    {
        key: "delete",
        label: "",
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]

const keyFields = [
    {
        key: "name",
        label: "Name",
        _classes: "data-head",
    },
    {
        key: "delete",
        label: "",
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]

const Home = (props) => {
    const initConfigData = Object.freeze({
        gateway: "",
        image: "",
        apodrepl: ""
    });
    const [newClusterData, updateNewClusterData] = useState(initConfigData)
    const [gatewayData, updateGatewayData] = useState(Object.freeze([]));
    const [newClusterModal, setNewClusterModal] = useState(false)
    const [group, updateGroup] = useState("")
    const [groupDetails, setGroupDetails] = useState(-1);
    const [apiKey, updateAPIKey] = useState("")

    // When the user clicks on a gateway, make api call to see what existing image and apodrepl are for that gateway
    // Set as placeholder
    const [existingClusterDataByGateway, setExistingClusterDataByGateway] = useState(initConfigData)

    const [allGroups, updateAllGroups] = useState(Object.freeze([]))
    const [allKeys, updateAllKeys] = useState(Object.freeze([]))
    const [clusterErrObj, updateClusterErrObj] = useState(Object.freeze({}))
    const [groupConfigModal, setGroupConfigModal] = useState(false)
    const [keyConfigModal, setKeyConfigModal] = useState(false)
    const [grpAdmins, updateGrpAdmins] = useState([])

    const { oktaAuth, authState } = useOktaAuth();

    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
            'X-Nextensio-Group': common.getGroup(common.GetAccessToken(authState), props),
        },
    };

    // Gateways used for gateway configuration
    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allgateways'), hdrs)
            .then(response => response.json())
            .then(data => {
                var names = []
                for (var i = 0; i < data.length; i++) {
                    names.push(data[i].name);
                }
                names.sort()
                updateGatewayData(names)
            });

        // Fetch for Admin Groups
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alladmgroups'), hdrs)
            .then(response => response.json())
            .then(data => {
                let groups = []
                if (data.admgroups != null) {
                    for (let i = 0; i < data.admgroups.length; i++) {
                        groups.push({ admGroup: data.admgroups[i] })
                    }
                }
                updateAllGroups(groups)
            })
        // Fetch for API Keys
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alluserkeys'), hdrs)
            .then(response => response.json())
            .then(data => {
                let keys = []
                if (data.keys != null) {
                    for (let i = 0; i < data.keys.length; i++) {
                        keys.push({ name: data.keys[i].name })
                    }
                }
                updateAllKeys(keys)
            })
    }, []);

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenantcluster/' + newClusterData.gateway), hdrs)
            .then(response => response.json())
            .then(data => {
                setExistingClusterDataByGateway({
                    gateway: newClusterData.gateway,
                    apodrepl: data.TenantCl.apodrepl,
                    image: data.TenantCl.image,
                })
            });
    }, [newClusterData.gateway])


    function validateClusterFields() {
        let errs = {};
        const podRe = /^[-+]?\d+$/;
        if (newClusterData.gateway == "") {
            errs.gateway = true
        }
        if (!/\S/.test(newClusterData.image)) {
            errs.image = true
        }
        if (!podRe.test(String(newClusterData.apodrepl))) {
            errs.apodrepl = true
        }
        updateClusterErrObj(errs)
        return errs
    }

    const handleNewClusterDataChange = (e) => {
        updateNewClusterData({
            ...newClusterData,
            [e.target.name]: e.target.value
        })
    }

    const handleGroupChange = (e) => {
        updateGroup(e.target.value)
    }

    const handleKeyChange = (e) => {
        updateAPIKey(e.target.value)
    }

    const cancelGroupChange = (e) => {
        updateGroup("")
        setGroupConfigModal(!groupConfigModal)
    }

    const cancelKeyChange = (e) => {
        updateAPIKey("")
        setKeyConfigModal(!keyConfigModal)
    }

    const cancelNewClusterEdit = (e) => {
        setNewClusterModal(!newClusterModal)
        updateNewClusterData(initConfigData)
        setExistingClusterDataByGateway(initConfigData)
        updateClusterErrObj({})
    }

    const handleGroupCreate = (e) => {
        if (group === "all") {
            updateGroup("")
            alert("all is a reserved keyword, please choose another group name")
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
        }
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/admgroups/' + group), requestOptions)
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
                    let groups = [...allGroups]
                    groups.push({ admGroup: group })
                    updateAllGroups(groups)
                    updateGroup("")
                    setGroupConfigModal(!groupConfigModal)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleKeyCreate = (e) => {
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify({
                name: apiKey,
            }),
        }
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/userkey'), requestOptions)
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
                    let keys = [...allKeys]
                    keys.push({ name: apiKey })
                    updateAllKeys(keys)
                    updateAPIKey("")
                    setKeyConfigModal(!keyConfigModal)
                    prompt("Save the key - you will not be able to retrieve it again", data["key"])
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleGroupDelete = (item) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/admgroups/' + item.admGroup), hdrs)
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
                    let groups = [...allGroups]
                    let index = groups.indexOf(item)
                    groups.splice(index, 1)
                    updateAllGroups(groups)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleKeyDelete = (item) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/userkey/' + item.name), hdrs)
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
                    let keys = [...allKeys]
                    let index = keys.indexOf(item)
                    keys.splice(index, 1)
                    updateAllKeys(keys)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleClusterDataSubmit = (e) => {
        e.preventDefault()
        let errs = validateClusterFields()
        if (Object.keys(errs).length !== 0) {
            return
        }
        let apods = newClusterData.apodrepl
        apods = parseInt(apods, 10)
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify({
                gateway: newClusterData.gateway, image: newClusterData.image, apodrepl: apods,
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/tenantcluster'), requestOptions)
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
                    cancelNewClusterEdit(e)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    const getAdminsForGroup = (group) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/groupadms/' + group), hdrs)
            .then(response => response.json())
            .then(data => {
                let admins = data.grpadmins
                updateGrpAdmins(admins)
            })
    }

    const toggleGroupDetails = (item, index) => {
        getAdminsForGroup(item.admGroup)
        const currentGroupIndex = groupDetails
        if (index === currentGroupIndex) {
            setGroupDetails(-1)
        } else {
            setGroupDetails(index)
        }
    }

    function grpAdminsRender() {
        if (grpAdmins == null) {
            return <div>No admins for this group.</div>
        } else {
            return (grpAdmins.map(admin => {
                return (
                    <div>{admin}</div>
                )
            }))
        }
    }


    const showingIcon = <FontAwesomeIcon icon="angle-right" />
    const hidingIcon = <FontAwesomeIcon icon="angle-down" className="text-primary" />

    // NOTE: The "Gateway configuration" is shown only if the user is a superadmin (ie nextensio ppl).
    // Customers dont get to see any gateway configurations, they dont have to see it. 
    return (
        <>
            <CCallout color="primary">
                <h4 className="title">Advanced Configurations</h4>
            </CCallout>
            <CRow className="mb-4">
                {props.match.params.group == "superadmin" &&
                    <CCol md="4">
                        <CCard className="roboto-font border-rounded shadow element pb-n5">
                            <CCardHeader>
                                Gateway Configuration
                                <CButton
                                    className="float-right"
                                    color="info"
                                    onClick={() => setNewClusterModal(!newClusterModal)}
                                >
                                    <CIcon className="mr-1" name="cil-settings" />
                                    Configure
                                </CButton>
                            </CCardHeader>
                            <CCardBody className="mb-n4">
                                <CDataTable
                                    fields={clusterFields}
                                    itemsPerPageSelect
                                    sorter
                                />
                            </CCardBody>
                        </CCard>
                    </CCol>
                }
            </CRow>

            <CRow>

                <CCol md="4">
                    <CCard className="roboto-font border-rounded shadow element">
                        <CCardHeader>
                            Groups
                            <CButton
                                className="float-right"
                                color="info"
                                onClick={() => setGroupConfigModal(!groupConfigModal)}
                            >
                                Create
                            </CButton>
                        </CCardHeader>
                        <CCardBody className="mb-n4">
                            <CDataTable
                                items={allGroups}
                                fields={groupFields}
                                itemsPerPageSelect
                                sorter
                                pagination
                                clickableRows
                                onRowClick={(item, index) => { toggleGroupDetails(item, index) }}
                                scopedSlots={{
                                    'show_details':
                                        (item, index) => {
                                            return (
                                                <td className="py-auto">
                                                    {groupDetails === index ? hidingIcon : showingIcon}
                                                </td>
                                            )
                                        },
                                    'details':
                                        (item, index) => {
                                            // Match the row uid to the same uid in userAttrData
                                            // and return the object
                                            return (
                                                <CCollapse show={groupDetails === index}>
                                                    <CCardBody>
                                                        {groupDetails === index && grpAdminsRender()}
                                                    </CCardBody>
                                                </CCollapse>
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
                                                            onClick={() => handleGroupDelete(item)}
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
                    </CCard>
                </CCol>

                <CCol md="4">
                    <CCard className="roboto-font border-rounded shadow element">
                        <CCardHeader>
                            API Keys
                            <CButton
                                className="float-right"
                                color="info"
                                onClick={() => setKeyConfigModal(!keyConfigModal)}
                            >
                                Create
                            </CButton>
                        </CCardHeader>
                        <CCardBody className="mb-n4">
                            <CDataTable
                                items={allKeys}
                                fields={keyFields}
                                itemsPerPageSelect
                                sorter
                                pagination
                                scopedSlots={{
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
                                                            onClick={() => handleKeyDelete(item)}
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
                    </CCard>
                </CCol>

            </CRow>

            <CModal className="roboto-font" show={newClusterModal}>
                <CModalHeader className="bg-info text-white py-n5">Gateway Configuration</CModalHeader>
                <CModalBody>
                    <CRow className="mt-4">
                        <CCol sm="4">
                            <CLabel>Gateway</CLabel>
                        </CCol>
                        <CCol sm="8">
                            <CSelect name="gateway" custom onChange={handleNewClusterDataChange} value={newClusterData.gateway} invalid={clusterErrObj.gateway}>
                                <option value={undefined}>Please select a gateway</option>
                                {gatewayData.map(gateway => {
                                    return (
                                        <option key={gateway} value={gateway}>{gateway}</option>
                                    )
                                })}
                            </CSelect>
                        </CCol>
                    </CRow>
                    <CRow className="mt-4">
                        <CCol sm="4">
                            <CLabel>Image</CLabel>
                        </CCol>
                        <CCol sm="8">
                            <CInputGroup>
                                <CTextarea
                                    placeholder={existingClusterDataByGateway.image}
                                    disabled={!newClusterData.gateway}
                                    name="image"
                                    onChange={handleNewClusterDataChange}
                                    invalid={clusterErrObj.image}
                                    value={newClusterData.image} />
                                <CInvalidFeedback>This field cannot be left blank</CInvalidFeedback>
                            </CInputGroup>
                        </CCol>
                    </CRow>
                    <CRow className="my-4">
                        <CCol sm="4">
                            <CLabel>Compute Pods</CLabel>
                        </CCol>
                        <CCol sm="8">
                            <CInputGroup>
                                <CInput
                                    placeholder={existingClusterDataByGateway.apodrepl}
                                    type="number"
                                    disabled={!newClusterData.gateway}
                                    name="apodrepl"
                                    onChange={e => handleNewClusterDataChange(e)}
                                    invalid={clusterErrObj.apodrepl}
                                    value={newClusterData.apodrepl} />
                                <CInvalidFeedback>This field cannot be left blank</CInvalidFeedback>
                            </CInputGroup>
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="info"
                        onClick={handleClusterDataSubmit}
                    ><strong>Configure</strong></CButton>
                    <CButton
                        color="secondary"
                        onClick={cancelNewClusterEdit}
                    ><strong>Cancel</strong></CButton>
                </CModalFooter>
            </CModal>
            <CModal className="roboto-font" show={groupConfigModal}>
                <CModalHeader className="bg-info text-white py-n5">
                    Group Configuration
                </CModalHeader>
                <CModalBody>
                    <CLabel>Group Name</CLabel>
                    <CInputGroup>
                        <CInput onChange={handleGroupChange} />
                    </CInputGroup>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="info"
                        onClick={handleGroupCreate}
                    ><strong>Configure</strong></CButton>
                    <CButton
                        color="secondary"
                        onClick={cancelGroupChange}
                    ><strong>Cancel</strong></CButton>
                </CModalFooter>
            </CModal>

            <CModal className="roboto-font" show={keyConfigModal}>
                <CModalHeader className="bg-info text-white py-n5">
                    API Key Configuration
                </CModalHeader>
                <CModalBody>
                    <CLabel>Key Name</CLabel>
                    <CInputGroup>
                        <CInput onChange={handleKeyChange} />
                    </CInputGroup>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="info"
                        onClick={handleKeyCreate}
                    ><strong>Create</strong></CButton>
                    <CButton
                        color="secondary"
                        onClick={cancelKeyChange}
                    ><strong>Cancel</strong></CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default withRouter(Home)
