import React, { useState, useEffect } from 'react'
import {
    CButton,
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
        key: "__uid",
        label: "User ID",
        _classes: "data-head"
    },
    {
        key: "__name",
        label: "Name",
        _classes: "data-field",
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

const UsersView = (props) => {

    const initTableData = Object.freeze(
        []
    );
    const [usersData, updateUserData] = useState(initTableData);
    const [userAttrData, updateUserAttrData] = useState(initTableData);
    const [userAttrSet, updateUserAttrSet] = useState(initTableData)
    const [uidData, updateUidData] = useState("")
    const [zippedData, updateZippedData] = useState(initTableData);
    const [details, setDetails] = useState([]);

    const [deleteUid, setDeleteUid] = useState("");
    const [deleteModal, setDeleteModal] = useState(false);

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        setDetails([]);
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allusers'), hdrs)
            .then(response => response.json())
            .then(data => updateUserData(data));
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alluserattr'), hdrs)
            .then(response => response.json())
            .then(data => updateUserAttrData(data))
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(respone => respone.json())
            .then(data => {
                let users = []
                for (let i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users") {
                        users.push(data[i].name)
                    }
                }
                users.sort()
                updateUserAttrSet(users)
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
                zipObj['__uid'] = usersData[i]['uid']
                zipObj['__name'] = usersData[i]['name']
                zipper.push(zipObj)
            }
        }
        updateUidData(uidObj)
        updateZippedData(zipper)
    }, [usersData, userAttrData])

    const toAttributeEditor = (e) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/attreditor'
        })
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
            pathname: '/tenant/' + props.match.params.id + '/users/add',
            state: uidData
        })
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/users/edit',
            state: usersData[index]
        });
        setDetails([])
    }

    const confirmDelete = (uid) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/user/') + uid, hdrs)
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

    function matchAttrs(item) {
        return (
            <table className="table-attrs-bundle">
                <tr>
                    <th>Key</th>
                    <th>Value</th>
                </tr>
                {userAttrSet.map(attr => {
                    return (
                        <tr>
                            <td><strong>{attr}</strong></td>
                            <td>
                                {["", 0, false].includes(item[attr]) ?
                                    "Default Value Assigned" :
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
        setDeleteUid(item.uid)
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
                                            // Match the row uid to the same uid in userAttrData
                                            // and return the object
                                            return (
                                                <CCollapse show={details.includes(index)}>
                                                    <CCardBody className="roboto-font">
                                                        {matchAttrs(item)}
                                                    </CCardBody>
                                                </CCollapse>
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
                        <strong>Are you sure you want to delete {deleteUid}?</strong>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="danger"
                            onClick={() => confirmDelete(deleteUid)}
                        >Confirm</CButton>
                        <CButton
                            color="secondary"
                            onClick={() => setDeleteModal(!deleteModal)}
                        >Cancel</CButton>
                    </CModalFooter>
                </CModal>

            </CRow>
        </>
    )
}

export default withRouter(UsersView)