import React, { lazy, useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CButtonGroup,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CProgress,
    CRow,
    CCallout,
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

var common = require('../../common')

const fields = [
    "user",
    "route",
    "tag",
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


const PolicyView = (props) => {

    const initTableData = Object.freeze(
        []
    );
    const [usersData, updateUserData] = useState(initTableData);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(0);

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/getallroutes/') + props.match.params.id, hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    var ru = data[i].route.split(":");
                    data[i].user = ru[0];
                    data[i].route = ru[1];
                }
                updateUserData(data);
            });
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/getallroutes/') + props.match.params.id, hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    var ru = data[i].route.split(":");
                    data[i].user = ru[0];
                    data[i].route = ru[1];
                }
                updateUserData(data);
            });
    }

    const handleAdd = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/route/add')
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenant/' + props.match.params.id + '/route/add',
            state: usersData[index]
        });
    }

    const handleDelete = (index) => {
        fetch(common.api_href('/api/v1/delroute/') + props.match.params.id + '/' + usersData[index].user + ":" + usersData[index].route, hdrs)
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
                {handleRefresh()}
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const toggleDelete = (index) => {
        setDeleteModal(!deleteModal);
        setDeleteIndex(index)
    }

    return (
        <>
            <CRow>
                <CCol xs="12" lg="6">
                    <CCard className='border-primary'>
                        <CCardHeader className='bg-primary text-white'>
                            <strong>Routes</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{placeholder:'By user, route...',label:'Search: '}}
                                noItemsView={{noItems:'No routes exist '}}
                                sorter
                                pagination
                                scopedSlots={{
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CTooltip content='Edit' placement='bottom'>
                                                        <CButton
                                                            color='light'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { handleEdit(index) }}
                                                        >
                                                            <CIcon name='cil-pencil' className='text-dark'/>
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                    'delete':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CTooltip content='Delete' className='text-dark'>
                                                        <CButton
                                                            color='light'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { toggleDelete(index) }}
                                                        >
                                                            <CIcon name='cil-delete' className='text-dark' />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        }
                                }}
                            />
                            <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                                <CModalHeader className='bg-danger text-white py-n5' closeButton>
                                    <strong>Confirm Deletion</strong>
                                </CModalHeader>
                                <CModalBody className='text-lg-left'>
                                    <strong>Are you sure you want to delete this route?</strong>
                                </CModalBody>
                                <CModalFooter>
                                    <CButton 
                                        color="danger"
                                        onClick={() => { handleDelete(deleteIndex) }}
                                    >Confirm</CButton>
                                    <CButton
                                        color="secondary"
                                        onClick={() => setDeleteModal(!deleteModal)}
                                    >Cancel</CButton>
                                </CModalFooter>
                            </CModal>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CButton size="large" color="primary" onClick={handleRefresh}>Refresh</CButton>
            <CButton size="large" color="secondary" onClick={handleAdd}>Add</CButton>
        </>
    )
}

export default withRouter(PolicyView)