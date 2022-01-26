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
    CInputCheckbox,
    CInputRadio,
    CRow,
    CPagination,
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
        key: 'select',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: "uid",
        label: "User ID",
        _classes: "data-head"
    },
    {
        key: "name",
        label: "Name",
        _classes: "data-field",
    },
    {
        key: "type",
        label: "",
        _classes: "data-field",
        _style: { width: '1%' }
    },
    {
        key: "status",
        label: "",
        _classes: "data-field",
        _style: { width: '1%' },
    },
]

const UsersView = (props) => {

    const initTableData = Object.freeze(
        []
    );

    const [usersData, updateUserData] = useState(initTableData);
    const [userAttrData, updateUserAttrData] = useState(initTableData);
    const [userAttrSet, updateUserAttrSet] = useState(initTableData)
    const [uidData, updateUidData] = useState(Object.freeze({}))
    const [status, updateStatus] = useState(Object.freeze([]))
    const [statusModal, setStatusModal] = useState(false)
    const [statusPage, setStatusPage] = useState(0)
    const [zippedData, updateZippedData] = useState(initTableData)
    const [details, setDetails] = useState([]);

    const [adminGroups, updateAdminGroups] = useState(Object.freeze([]))
    const [userToGroup, updateUserToGroup] = useState(Object.freeze({}))
    const [selectedUsers, updateSelectedUsers] = useState(initTableData)

    const [userGroupError, updateUserGroupError] = useState(false)

    const [editTypeModal, setEditTypeModal] = useState(false)
    const [deleteModal, setDeleteModal] = useState(false);

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
        setDetails([]);
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allusers'), hdrs)
            .then(response => response.json())
            .then(data => {
                updateUserData(data)
            });
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alluserattr'), hdrs)
            .then(response => response.json())
            .then(data => {
                updateUserAttrData(data)
            })
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                let users = []
                for (let i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users") {
                        if (!data[i].name.startsWith('_')) {
                            users.push(data[i].name)
                        }
                    }
                }
                users.sort()
                updateUserAttrSet(users)
            })
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alladmgroups'), hdrs)
            .then(response => response.json())
            .then(data => {
                updateAdminGroups(data.AdmGroups)
            })
    }, []);

    // Might be an inefficient way of rendering both user and user attrs
    useEffect(() => {
        const zipper = []
        const uidObj = {}
        for (let i = 0; i < usersData.length; i++) {
            uidObj[usersData[i].uid] = true
            // Match userData object with userAttrData and combine the two into one
            if (userAttrData.find((obj) => obj.uid === usersData[i].uid)) {
                const zipObj = {
                    ...(userAttrData.find((obj) => obj.uid === usersData[i].uid))
                }
                zipObj['uid'] = usersData[i]['uid']
                zipObj['name'] = usersData[i]['name']
                zipObj['usertype'] = usersData[i]['usertype']
                zipper.push(zipObj)
            }
        }
        updateUidData(uidObj)
        updateZippedData(zipper)
    }, [usersData, userAttrData])

    const handleStatus = (e, item) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/userstatus/' + item.uid), hdrs)
            .then(response => response.json())
            .then(data => updateStatus(data))
        setStatusPage(0)
        setStatusModal(true)
        e.stopPropagation()
    }

    const handleRefresh = (e) => {
        setDetails([]);
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allusers'), hdrs)
            .then(response => response.json())
            .then(data => updateUserData(data));
    }

    // Passing uidData to handleAdd for validation
    // if a tenant tries to create a uid that already exists, I will reject this. 
    const handleAdd = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/' + props.match.params.group + '/users/add',
            state: uidData
        })
    }

    const handleEdit = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/' + props.match.params.group + '/users/edit',
            state: selectedUsers
        });
        setDetails([])
    }

    const toAttrEditor = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/' + props.match.params.group + '/attreditor'
        })
    }

    const handleDelete = (item) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/user/' + item.uid), hdrs)
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
    }

    const handleUserTypeSubmit = (e) => {
        if (!userToGroup.newGroup) {
            updateUserGroupError(true)
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/user/adminrole/' + userToGroup.uid + '/' + userToGroup.newGroup), requestOptions)
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
                    updateUserGroupError(false)
                    updateUserToGroup({})
                    setEditTypeModal(!editTypeModal)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const deleteAll = (e) => {
        // Remove items from table
        let zipped = [...zippedData]
        let uids = { ...uidData }
        let indexes = []
        for (let i = 0; i < selectedUsers.length; i++) {
            let index = zipped.indexOf(selectedUsers[i])
            indexes.push(index)
            delete uids[selectedUsers[i].uid]
            handleDelete(selectedUsers[i])
        }
        indexes.sort()
        for (let i = indexes.length - 1; i >= 0; i--) {
            zipped.splice(indexes[i], 1)
        }
        updateUidData(uids)
        updateZippedData(zipped)
        updateSelectedUsers([])
        setDeleteModal(!deleteModal)
    }

    function matchAttrs(item) {
        if (userAttrSet.length != 0) {
            return (
                <table className="table-attrs-bundle mr-3">
                    <tr>
                        <th className="attributes header">Key</th>
                        <th className="header">Value</th>
                    </tr>
                    {userAttrSet.map(attr => {
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
                    No attributes configured! <a className="text-info" onClick={toAttrEditor}>Click here</a> to create User attributes.
                </CCallout>
            )
        }
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

    const toggleDelete = (e) => {
        setDeleteModal(!deleteModal);
    }

    const handleSelectUsers = (e, item) => {
        let users = [...selectedUsers]
        if (users.includes(item)) {
            let index = users.indexOf(item)
            users.splice(index, 1)
        } else {
            users.push(item)
        }
        updateSelectedUsers(users)
        e.stopPropagation()
    }

    const handleType = (e, item) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/user/adminrole/' + item.uid), hdrs)
            .then(response => response.json())
            .then(data => {
                updateUserToGroup({
                    uid: item.uid,
                    currentGroup: data.UserRole,
                    newGroup: ""
                })
            });

        setEditTypeModal(!editTypeModal)
        e.stopPropagation()
    }

    const handleTypeChange = (e) => {
        updateUserToGroup({
            ...userToGroup,
            newGroup: e.target.value
        })
    }

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard className="roboto-font shadow large">
                        <CCardHeader>
                            <CTooltip content="Click for documentation">
                                <CLink
                                    color="primary"
                                    href="https://docs.nextensio.net/configurations/users.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Users
                                </CLink>
                            </CTooltip>
                            <div className="text-muted small">Click on a row to see attributes</div>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={zippedData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{ placeholder: 'By user ID, name...', label: 'Search: ' }}
                                noItemsView={{ noItems: 'No users exist ' }}
                                sorter
                                pagination
                                clickableRows
                                onRowClick={(item, index) => { toggleDetails(index) }}
                                scopedSlots={{
                                    'details':
                                        (item, index) => {
                                            // Match the row uid to the same uid in userAttrData
                                            // and return the object
                                            return (
                                                <CCollapse show={details.includes(index)}>
                                                    <CCardBody>
                                                        <CRow>
                                                            <CCol md="12">
                                                                {matchAttrs(item)}
                                                            </CCol>
                                                        </CRow>
                                                    </CCardBody>
                                                </CCollapse>
                                            )
                                        },
                                    'select':
                                        (item, index) => {
                                            return (
                                                <td className="py-auto pl-5">
                                                    <CInputCheckbox
                                                        onClick={e => handleSelectUsers(e, item)}
                                                        checked={selectedUsers.includes(item)}
                                                    />
                                                </td>
                                            )
                                        },
                                    'type':
                                        (item, index) => {
                                            return (
                                                <td className="py-2 ml-5">
                                                    <CButton
                                                        className="button-table"
                                                        color="warning"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => handleType(e, item)}
                                                    >
                                                        <FontAwesomeIcon icon="id-badge" size="lg" className="icon-table-edit" />
                                                    </CButton>
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
                                }}
                            />
                        </CCardBody>
                        <CCardFooter>
                            <CButton color="primary" variant="outline" onClick={handleRefresh}>
                                <CIcon name="cil-reload" />
                                <strong>{" "}Refresh</strong>
                            </CButton>
                            <CButton color="success" variant="outline" onClick={handleAdd}>
                                <CIcon name="cil-plus" />
                                <strong>{" "}Add</strong>
                            </CButton>

                            <CButton
                                className="float-right"
                                color="danger"
                                variant="outline"
                                disabled={selectedUsers.length === 0}
                                onClick={toggleDelete}
                            >
                                <FontAwesomeIcon icon="trash-alt" />
                                <strong>{" "}Delete</strong>
                            </CButton>
                            <CButton
                                className="float-right"
                                color="primary"
                                variant="outline"
                                disabled={selectedUsers.length === 0}
                                onClick={handleEdit}
                            >
                                <FontAwesomeIcon icon="pen" />
                                <strong>{" "}Edit</strong>
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
                <CModal show={deleteModal} className="roboto-font" onClose={() => setDeleteModal(!deleteModal)}>
                    <CModalHeader className='bg-danger text-white py-n5' closeButton>
                        <strong>Confirm Deletion</strong>
                    </CModalHeader>
                    <CModalBody className='text-lg-left'>
                        <strong>Are you sure you want to delete the selected Users?</strong>
                        <div><strong>You have {selectedUsers.length} selected.</strong></div>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="danger"
                            onClick={deleteAll}
                        >Confirm</CButton>
                        <CButton
                            color="secondary"
                            onClick={() => setDeleteModal(!deleteModal)}
                        >Cancel</CButton>
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
                <CModal show={editTypeModal} className="roboto-font" onClose={() => setEditTypeModal(!editTypeModal)}>
                    <CModalHeader className="bg-warning text-dark py-n5">
                        <strong>Edit Type for {userToGroup.uid}</strong>
                    </CModalHeader>
                    <CModalBody>
                        <CRow className="pt-3">
                            <CCol md="12">
                                Current Group: {userToGroup.currentGroup}
                            </CCol>
                        </CRow>
                        <CRow className="pt-3">
                            <CCol md="8">
                                Group
                            </CCol>
                            <CCol md="4">
                                {adminGroups != null ? adminGroups.map(adminGroup => {
                                    return (
                                        <div>
                                            <CInputRadio name="newGroup" value={adminGroup} checked={userToGroup.newGroup === adminGroup} onChange={handleTypeChange} /> {adminGroup}
                                        </div>
                                    )
                                }) :
                                    <div>
                                        You have no groups created
                                    </div>
                                }
                            </CCol>
                        </CRow>
                        <CRow>
                            <div className="invalid-form-text" hidden={!userGroupError}>You need to select a group.</div>
                        </CRow>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="warning"
                            onClick={handleUserTypeSubmit}
                        >Confirm</CButton>
                        <CButton
                            color="secondary"
                            onClick={() => setEditTypeModal(!editTypeModal)}
                        >Cancel</CButton>
                    </CModalFooter>

                </CModal>

            </CRow>
        </>
    )
}

export default withRouter(UsersView)
