import React, { lazy, useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CButtonGroup,
    CCard,
    CCardBody,
    CCollapse,
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
    CWidgetSimple
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../homeviews.scss'

var common = require('../../../common')

const fields = [
    {
        key: 'show_details',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: "certid",
        label: "Certificate ID",
        _classes: "data-head",
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


const CertsView = (props) => {

    const initTableData = Object.freeze(
        []
    );
    const [usersData, updateUserData] = useState(initTableData);
    const [details, setDetails] = useState([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(0);

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
        setDetails([])
        fetch(common.api_href('/api/v1/global/get/allcerts'), hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].hasOwnProperty('cert')) {
                        data[i].cert = String.fromCharCode(...data[i].cert);
                    }
                }
                updateUserData(data);
            });
    }, []);

    const handleRefresh = (e) => {
        setDetails([]);
        fetch(common.api_href('/api/v1/global/get/allcerts'), hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].hasOwnProperty('cert')) {
                        data[i].cert = String.fromCharCode(...data[i].cert);
                    }
                }
                updateUserData(data);
            });
    }

    const handleAdd = (e) => {
        props.history.push('/home/certs/add')
    }

    const handleEdit = (index) => {
        props.history.push({
            pathname: '/home/certs/add',
            state: usersData[index]
        });
        setDetails([])
    }

    const handleDelete = (index) => {
        setDetails([])
        fetch(common.api_href('/api/v1/global/del/cert/') + usersData[index].certid, hdrs)
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

    const toggleDelete = (index) => {
        setDeleteModal(!deleteModal);
        setDeleteIndex(index)
    }

    const showingIcon = <FontAwesomeIcon icon="angle-right" />
    const hidingIcon = <FontAwesomeIcon icon="angle-down" className="text-primary" />

    return (
        <>
            <CRow>
                <CCol xs="12" lg="6">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            <strong>Certificates</strong>
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                itemsPerPageSelect
                                itemsPerPageSelect={5}
                                tableFilter={{ placeholder: 'By certicate ID...', label: 'Search: ' }}
                                sorter
                                pagination
                                clickableRows
                                onRowClick={(item, index) => { toggleDetails(index) }}
                                scopedSlots={{
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip
                                                        content='edit'
                                                        placement='top'
                                                    >
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
                                                    <CTooltip
                                                        content='Delete'
                                                        placement='top'
                                                    >
                                                        <CButton
                                                            className="button-table"
                                                            color='danger'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { toggleDelete(index) }}
                                                        >
                                                            <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
                                    'show_details':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip
                                                        content={details.includes(index) ? 'Hide' : 'Details'}
                                                        placement='top'
                                                    >
                                                        <CButton
                                                            className="button-table"
                                                            color='primary'
                                                            variant='ghost'
                                                            size="sm"
                                                            onClick={() => { toggleDetails(index) }}
                                                        >
                                                            {details.includes(index) ? hidingIcon : showingIcon}
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
                                                        <strong>Details:{'\n'}</strong>
                                                        <pre>
                                                            {item.cert}
                                                        </pre>
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
                    <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                        <CModalHeader className='bg-danger text-white py-n5' closeButton>
                            <strong>Confirm Deletion</strong>
                        </CModalHeader>
                        <CModalBody className='text-lg-left'>
                            <strong>Are you sure you want to delete this certificate?</strong>
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

export default withRouter(CertsView)