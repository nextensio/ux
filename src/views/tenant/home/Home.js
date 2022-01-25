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
    CDropdown,
    CDropdownToggle,
    CDropdownItem,
    CDropdownMenu,
    CEmbed,
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { withRouter } from 'react-router-dom';
import '../tenantviews.scss'
import { useOktaAuth } from '@okta/okta-react';
import Map from './mapbox/Mapbox'

var common = require('../../../common')

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

const idpFields = [
    {
        key: "name",
        label: "Name",
        _classes: "data-head",
    },
    {
        key: "provider",
        _classes: "data-field"
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

    // When the user clicks on a gateway, make api call to see what existing image and apodrepl are for that gateway
    // Set as placeholder
    const [existingClusterDataByGateway, setExistingClusterDataByGateway] = useState(initConfigData)
    const [idpJson, updateIdpJson] = useState(Object.freeze({}))

    const [allIdps, updateAllIdps] = useState("")
    const [allGroups, updateAllGroups] = useState(Object.freeze([]))
    const [clusterErrObj, updateClusterErrObj] = useState(Object.freeze({}))
    const [idpErrObj, updateIdpErrObj] = useState(Object.freeze({}))
    const [groupConfigModal, setGroupConfigModal] = useState(false)
    const [grpAdmins, updateGrpAdmins] = useState([])


    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    const idTokenJson = common.decodeToken(bearer)

    useEffect(() => {
        if (props.match.params.group != idTokenJson.usertype) {
            window.location.href = '/tenant/' + props.match.params.id + '/' + idTokenJson.usertype + '/'
        }
    }, [])

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
        // Fetch for Idps
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allidps'), hdrs)
            .then(response => response.json())
            .then(data => {
                updateAllIdps(data)
            })
        // Fetch for Admin Groups
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alladmgroups'), hdrs)
            .then(response => response.json())
            .then(data => {
                let groups = []
                if (data.AdmGroups != null) {
                    for (let i = 0; i < data.AdmGroups.length; i++) {
                        groups.push({ admGroup: data.AdmGroups[i] })
                    }
                }
                updateAllGroups(groups)
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

    const getAdminsForGroup = (group) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/groupadms/' + group), hdrs)
            .then(response => response.json())
            .then(data => {
                let admins = data.GrpAdmins
                updateGrpAdmins(admins)
            })
    }

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

    function validateIdpFields() {
        let errs = {}
        if (!idpJson.name) {
            errs.name = true
        } if (!idpJson.client) {
            errs.clientId = true
        } if (!idpJson.secret) {
            errs.clientSecret = true
        } if (idpJson.provider === "OIDC") {
            if (!idpJson.issuer) {
                errs.issuer = true
            } if (!idpJson.auth) {
                errs.authEndpoint = true
            } if (!idpJson.token) {
                errs.tokenEndpoint = true
            } if (!idpJson.jwks) {
                errs.jwksEndpoint = true
            }
        }
        updateIdpErrObj(errs)
        return errs
    }

    const updateIdpProvider = (value) => {
        updateIdpJson({
            provider: value
        })
    }

    const handleIdpJsonChange = (e) => {
        if (e.target.name == "name") {
            let words = e.target.value.split(/\s+/);
            if (words.length != 1) {
                alert("IDP Name has to be one single word " + words)
                return
            }
        }
        updateIdpJson({
            ...idpJson,
            [e.target.name]: e.target.value
        })
    }

    const handleNewClusterDataChange = (e) => {
        updateNewClusterData({
            ...newClusterData,
            [e.target.name]: e.target.value
        })
    }

    const handleIdpSubmit = (e) => {
        let errs = validateIdpFields()
        if (Object.keys(errs).length !== 0) {
            return
        }
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(idpJson),
        };

        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/idp'), requestOptions)
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
                    let idps = [...allIdps]
                    idps.push(idpJson)
                    updateAllIdps(idps)
                    resetIdpJson()
                }

            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleIdpDelete = (item) => {
        console.log('/api/v1/tenant/' + props.match.params.id + '/del/idp/' + item.name)
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/idp/' + item.name), hdrs)
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
                    let index = allIdps.indexOf(item)
                    let idps = [...allIdps]
                    idps.splice(index, 1)
                    updateAllIdps(idps)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleGroupChange = (e) => {
        updateGroup(e.target.value)
    }

    const resetIdpJson = () => {
        updateIdpJson({})
        updateIdpErrObj({})
    }

    const cancelGroupChange = (e) => {
        updateGroup("")
        setGroupConfigModal(!groupConfigModal)
    }

    const cancelNewClusterEdit = (e) => {
        setNewClusterModal(!newClusterModal)
        updateNewClusterData(initConfigData)
        setExistingClusterDataByGateway(initConfigData)
        updateClusterErrObj({})
    }

    const handleGroupCreate = (e) => {
        const requestOptions = {
            method: 'POST',
            headers: { Authorization: bearer },
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
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
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

    return (
        <>
            <CCallout color="primary">
                <h4 className="title">Home</h4>
            </CCallout>

            <CRow className="mb-4">
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
                            />
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md="4">
                    <CCard className="roboto-font border-rounded shadow element pb-n5">
                        <CCardHeader>
                            Identity Provider Configuration
                            <CDropdown className="float-right">
                                <CDropdownToggle caret color="info">
                                    <CIcon className="mr-1" name="cil-plus" />Add Identity Provider
                                </CDropdownToggle>
                                <CDropdownMenu>
                                    <CDropdownItem onClick={() => updateIdpProvider("Facebook")}>
                                        Add Facebook
                                    </CDropdownItem>
                                    <CDropdownItem onClick={() => updateIdpProvider("Google")}>
                                        Add Google
                                    </CDropdownItem>
                                    <CDropdownItem onClick={() => updateIdpProvider("LinkedIn")}>
                                        Add LinkedIn
                                    </CDropdownItem>
                                    <CDropdownItem onClick={() => updateIdpProvider("Microsoft")}>
                                        Add Microsoft
                                    </CDropdownItem>
                                    <CDropdownItem onClick={() => updateIdpProvider("OIDC")}>
                                        Add OpenID Connect IdP
                                    </CDropdownItem>
                                </CDropdownMenu>
                            </CDropdown>
                        </CCardHeader>
                        <CCardBody className="mb-n4">
                            <CDataTable
                                fields={idpFields}
                                items={allIdps}
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
                                                            onClick={() => handleIdpDelete(item)}
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
            </CRow>

            <CRow>
                <CCol sm="12">
                    <CCard>
                        <CCardHeader className="bg-gradient-primary">
                            Gateways Heatmap
                        </CCardHeader>
                        <CCardBody className="parent-container">
                            <CEmbed>
                                <Map className="fit-snug" {...props} />
                            </CEmbed>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CModal closeOnBackdrop={false} className="roboto-font" show={idpJson.provider}>
                <CModalHeader className="bg-info text-white py-n5">
                    <strong>Add Identity Provider - {idpJson.provider}</strong>
                </CModalHeader>
                <CModalBody>
                    <CLabel><strong>General Settings</strong></CLabel>
                    <CRow className="mt-4">
                        <CCol sm="4">
                            <CLabel>Name</CLabel>
                        </CCol>
                        <CCol sm="8">
                            <CInputGroup>
                                <CInput name="name" onChange={e => handleIdpJsonChange(e)} invalid={idpErrObj.name} />
                                <CInvalidFeedback>This field cannot be left blank</CInvalidFeedback>
                            </CInputGroup>
                        </CCol>
                    </CRow>
                    <CRow className="mt-4">
                        <CCol sm="4">
                            <CLabel>Matching domain</CLabel>
                        </CCol>
                        <CCol sm="8">
                            <CInputGroup>
                                <CInput name="domain" onChange={e => handleIdpJsonChange(e)} invalid={idpErrObj.domain} />
                                <CInvalidFeedback>Domain cannot be empty</CInvalidFeedback>
                            </CInputGroup>
                        </CCol>
                    </CRow>
                    <CRow className="mt-4">
                        <CCol sm="4">
                            <CLabel>Client ID</CLabel>
                        </CCol>
                        <CCol sm="8">
                            <CInputGroup>
                                <CInput name="client" onChange={e => handleIdpJsonChange(e)} invalid={idpErrObj.clientId} />
                                <CInvalidFeedback>Client ID cannot be empty</CInvalidFeedback>
                            </CInputGroup>
                        </CCol>
                    </CRow>
                    <CRow className="mt-4 pb-4 border-bottom">
                        <CCol sm="4">
                            <CLabel>Client Secret</CLabel>
                        </CCol>
                        <CCol sm="8">
                            <CInputGroup>
                                <CInput name="secret" onChange={e => handleIdpJsonChange(e)} invalid={idpErrObj.clientSecret} />
                                <CInvalidFeedback>Client Secret cannot be empty</CInvalidFeedback>
                            </CInputGroup>
                        </CCol>
                    </CRow>
                    {idpJson.provider === "OIDC" &&
                        <>
                            <CLabel className="mt-3"><strong>Endpoints</strong></CLabel>
                            <CRow className="mt-4">
                                <CCol sm="4">
                                    <CLabel>Issuer</CLabel>
                                </CCol>
                                <CCol sm="8">
                                    <CInputGroup>
                                        <CInput name="issuer" onChange={e => handleIdpJsonChange(e)} invalid={idpErrObj.issuer} />
                                        <CInvalidFeedback>This field cannot be left blank</CInvalidFeedback>
                                    </CInputGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4">
                                <CCol sm="4">
                                    <CLabel>Authorization Endpoint</CLabel>
                                </CCol>
                                <CCol sm="8">
                                    <CInputGroup>
                                        <CInput name="auth" onChange={e => handleIdpJsonChange(e)} invalid={idpErrObj.authEndpoint} />
                                        <CInvalidFeedback>This field cannot be left blank</CInvalidFeedback>
                                    </CInputGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4">
                                <CCol sm="4">
                                    <CLabel>Token Endpoint</CLabel>
                                </CCol>
                                <CCol sm="8">
                                    <CInputGroup>
                                        <CInput name="token" onChange={e => handleIdpJsonChange(e)} invalid={idpErrObj.tokenEndpoint} />
                                        <CInvalidFeedback>This field cannot be left blank</CInvalidFeedback>
                                    </CInputGroup>
                                </CCol>
                            </CRow>
                            <CRow className="mt-4 pb-4">
                                <CCol sm="4">
                                    <CLabel>JWKS Endpoint</CLabel>
                                </CCol>
                                <CCol sm="8">
                                    <CInputGroup>
                                        <CInput name="jwks" onChange={e => handleIdpJsonChange(e)} invalid={idpErrObj.jwksEndpoint} />
                                        <CInvalidFeedback>This field cannot be left blank</CInvalidFeedback>
                                    </CInputGroup>
                                </CCol>
                            </CRow>
                        </>
                    }
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="info"
                        onClick={handleIdpSubmit}
                    >
                        <strong>Add Identity Provider</strong>
                    </CButton>
                    <CButton
                        color="secondary"
                        onClick={resetIdpJson}
                    >
                        <strong>Cancel</strong>
                    </CButton>
                </CModalFooter>
            </CModal>
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
                                <CInput
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
        </>
    )
}

export default withRouter(Home)
