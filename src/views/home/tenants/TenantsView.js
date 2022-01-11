import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CForm,
    CFormGroup,
    CFormText,
    CInput,
    CInputGroup,
    CLabel,
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

var common = require('../../../common')

const fields = [
    {
        key: "_id",
        label: "Tenant ID",
        _classes: "data-head",
    },
    {
        key: "domains",
        _classes: "data-field"
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

const TenantsView = (props) => {
    const initTableData = Object.freeze(
        []
    );
    const [tenantsData, updateTenantData] = useState(initTableData);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(0);

    const [group, setGroup] = useState("")
    const [groupModal, setGroupModal] = useState(false)
    const [redirItem, setRedirItem] = useState(Object.freeze({}))

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    console.log(props)

    useEffect(() => {
        fetch(common.api_href('/api/v1/global/get/alltenants'), hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    data[i].domains = JSON.stringify(data[i].domains)
                }
                updateTenantData(data)
            });
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/global/get/alltenants'), hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    data[i].domains = JSON.stringify(data[i].domains)
                }
                updateTenantData(data)
            });
    }

    const handleAdd = (e) => {
        props.history.push('/home/tenants/add')
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/home/tenants/add',
            state: tenantsData[index]
        })
    }

    const confirmRedir = (item) => {
        window.location.href = '/tenant/' + item._id + '/' + group + '/'
    }

    const handleDelete = (index) => {
        fetch(common.api_href('/api/v1/global/del/tenant/') + tenantsData[index]._id, hdrs)
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
                { handleRefresh() }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const handleGroupChange = (e) => {
        setGroup(e.target.value)
    }

    const handleRedirConfiguration = (item) => {
        setRedirItem(item)
        setGroupModal(!groupModal)
    }

    const toggleDelete = (index) => {
        setDeleteModal(!deleteModal);
        setDeleteIndex(index)
    }

    return (
        <>
            <CRow className='mt-3'>
                <CCol xs="24" lg="12">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            <strong>Tenants</strong>
                            <div className="text-muted small">Click on a row to navigate to Tenants page</div>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={tenantsData}
                                fields={fields}
                                tableFilter={{ placeholder: 'By name, gateways...', label: 'Search: ' }}
                                itemsPerPageSelect
                                itemsPerPage={5}
                                pagination
                                sorter
                                hover
                                clickableRows
                                onRowClick={(item) => { handleRedirConfiguration(item) }}
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
                                                                toggleDelete(index)
                                                                e.stopPropagation()
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
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

                    {/* Modal for group selection */}
                    <CModal className="roboto-font" show={groupModal} onClose={() => setGroupModal(!groupModal)}>
                        <CModalHeader className="bg-info text-white py-n5">Input your group.</CModalHeader>
                        <CModalBody>
                            <CForm>
                                <CFormGroup>
                                    <CLabel>Group Name</CLabel>
                                    <CInputGroup>
                                        <CInput onChange={handleGroupChange} />
                                    </CInputGroup>
                                    <CFormText>Input your group name. Leaving it as blank will give you superadmin privileges.</CFormText>
                                </CFormGroup>
                            </CForm>

                        </CModalBody>
                        <CModalFooter>
                            <CButton
                                color="success"
                                onClick={() => confirmRedir(redirItem)}
                            >
                                Confirm
                            </CButton>
                            <CButton
                                color="secondary"
                                onClick={() => setGroupModal(!groupModal)}
                            >Cancel</CButton>
                        </CModalFooter>
                    </CModal>

                    <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                        <CModalHeader className='bg-danger text-white py-n5' closeButton>
                            <strong>Confirm Deletion</strong>
                        </CModalHeader>
                        <CModalBody className='text-lg-left'>
                            <strong>Are you sure you want to delete this tenant?</strong>
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
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(TenantsView)
