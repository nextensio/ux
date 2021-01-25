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

var common = require('../../../common')

const fields = [
    {   
        key: "_id",
        label: "Tenant ID",
    },
    "name",
    "gateways",
    "domains",
    "image",
    "pods",
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
        key: 'users',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]


const TenantsView = (props) => {
    const initTableData = Object.freeze(
        []
    );
    const [usersData, updateUserData] = useState(initTableData);
    const [deleteModal, setDeleteModal] = useState(false);

    useEffect(() => {
        fetch(common.api_href('/api/v1/getalltenants'))
            .then(response => response.json())
            .then(data => updateUserData(data));
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/getalltenants'))
            .then(response => response.json())
            .then(data => updateUserData(data));
    }

    const handleAdd = (e) => {
        props.history.push('/tenants/add')
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/tenants/add',
            state: usersData[index]
        })
    }

    const handleDetails = (index) => {
        props.history.push('/tenant/' + usersData[index]._id + '/')
    }

    const handleDelete = (index) => {
        fetch(common.api_href('/api/v1/deltenant/') + usersData[index]._id)
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
                {handleRefresh()}
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const toggleDelete = () => {
        setDeleteModal(!deleteModal);
    }

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard className='border-primary shadow-lg'>
                        <CCardHeader className='bg-primary text-white'>
                            <strong>Tenants</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                itemsPerPageSelect
                                tableFilter={{placeholder:'By name, gateways...',label:'Search: '}}
                                noItemsView={{noItems:'No tenants exist '}}
                                sorter
                                pagination
                                scopedSlots={{
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CTooltip
                                                        content='Edit'
                                                        placement='bottom'
                                                    >
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
                                                    <CTooltip
                                                        content='Delete'
                                                        placement='bottom'
                                                    >
                                                        <CButton
                                                            color='light'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={toggleDelete}
                                                        >
                                                        <CModal show={deleteModal} onClose={toggleDelete}>
                                                            <CModalHeader className='bg-danger text-white py-n5' closeButton>
                                                                <strong>Confirm Deletion</strong>
                                                            </CModalHeader>
                                                            <CModalBody className='text-lg-left'>
                                                                <strong>Are you sure you want to delete this tenant?</strong>
                                                            </CModalBody>
                                                            <CModalFooter>
                                                                <CButton 
                                                                    color="danger"
                                                                    onClick={() => { handleDelete(index) }}
                                                                >Confirm</CButton>
                                                                <CButton
                                                                    color="secondary"
                                                                    onClick={toggleDelete}
                                                                >Cancel</CButton>
                                                            </CModalFooter>
                                                        </CModal>
                                                            <CIcon name='cil-delete' className='text-dark' />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                    'users':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CTooltip
                                                        content='Tenant Portal'
                                                        placement='bottom'
                                                    >
                                                        <CButton
                                                            color='light'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { handleDetails(index) }}
                                                        >
                                                            <CIcon name='cil-group' className='text-dark'/>
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                }}
                            />
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CButton size="large" color="primary" onClick={handleRefresh}>Refresh</CButton>
            <CButton size="large" color="secondary" onClick={handleAdd}>Add</CButton>
        </>
    )
}

export default withRouter(TenantsView)