import React, { lazy, useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
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

var common = require('../../../common')

const fields = [
    {   
        key: "name",
        _classes: 'font-weight-bold'
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
]

const GatewaysView = (props) => {
    const initTableData = Object.freeze(
        []
    );
    const [usersData, updateUserData] = useState(initTableData);
    const [deleteModal, showDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(0);

    useEffect(() => {
        fetch(common.api_href('/api/v1/getallgateways'))
            .then(response => response.json())
            .then(data => updateUserData(data));
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/getallgateways'))
            .then(response => response.json())
            .then(data => updateUserData(data));
    }

    const handleAdd = (e) => {
        props.history.push('/gateways/add')
    }
    
    const handleEdit = (index) => {
        props.history.push({
            pathname: '/gateways/add',
            state: usersData[index]
        })
    }

    const handleDelete = (index) => {
        fetch(common.api_href('/api/v1/delgateway/') + usersData[index].name)
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
                // automatically handle refresh after deleting entry, close confirm delete modal
                showDeleteModal(!deleteModal);
                {handleRefresh()}
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }
    const toggleDelete = (index) => {
        showDeleteModal(!deleteModal);
        setDeleteIndex(index)
    }

    return (
        <>  
            <CRow className='mt-3'>
                <CCol xs="12" lg="6">
                    <CCard className='border-primary'>
                        <CCardHeader className='bg-primary text-white'>
                            <strong>Gateways</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                tableFilter={{placeholder:'By name...', label:'Search: '}}
                                itemsPerPageSelect
                                itemsPerPage={5}
                                pagination
                                sorter
                                hover
                                clickableRows
                                onRowClick={(e) => props.history.push(`/gateways/data`)}
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
                                                            onClick={(e) => { 
                                                                handleEdit(index);
                                                                e.stopPropagation() 
                                                            }}
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
                                                            onClick={(e) => { 
                                                                toggleDelete(index);
                                                                e.stopPropagation()
                                                             }}
                                                        >
                                                            <CIcon name='cil-delete' className='text-dark' />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        }
                                }}
                            />
                            <CModal show={deleteModal} onClose={() => showDeleteModal(!deleteModal)}>
                                <CModalHeader className='bg-danger text-white py-n5' closeButton>
                                    <strong>Confirm Deletion</strong>
                                </CModalHeader>
                                <CModalBody className='text-lg-left'>
                                    <strong>Are you sure you want to delete this gateway?</strong>
                                </CModalBody>
                                <CModalFooter>
                                    <CButton 
                                        color="danger"
                                        onClick={() => { handleDelete(deleteIndex) }}
                                    >Confirm</CButton>
                                    <CButton
                                        color="secondary"
                                        onClick={() => showDeleteModal(!deleteModal)}
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

export default withRouter(GatewaysView)