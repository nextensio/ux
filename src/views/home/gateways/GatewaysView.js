import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCardFooter,
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../homeviews.scss';
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../../common')

const fields = [
    {
        key: "name",
        _classes: 'data-head',
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

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/global/get/allgateways'), hdrs)
            .then(response => response.json())
            .then(data => updateUserData(data));
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/global/get/allgateways'), hdrs)
            .then(response => response.json())
            .then(data => updateUserData(data));
    }

    const handleAdd = (e) => {
        props.history.push('/home/gateways/add')
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/home/gateways/add',
            state: usersData[index]
        })
    }

    const handleDelete = (index) => {
        fetch(common.api_href('/api/v1/global/del/gateway/') + usersData[index].name, hdrs)
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
                { handleRefresh() }
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
            <CRow>
                <CCol xs="12" lg="6">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            Gateways
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                tableFilter={{ placeholder: 'By name...', label: 'Search: ' }}
                                itemsPerPageSelect
                                itemsPerPage={5}
                                pagination
                                sorter
                                hover
                                scopedSlots={{
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
                                                            onClick={(e) => {
                                                                handleEdit(index);
                                                                e.stopPropagation()
                                                            }}
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
                                                            onClick={(e) => {
                                                                toggleDelete(index);
                                                                e.stopPropagation()
                                                            }}
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
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(GatewaysView)