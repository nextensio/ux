import React, { lazy, useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CCallout,
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
import { CChartRadar } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
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
        _classes: 'data-head',
        sorter: false,
        filter: false
    },
    {
        key: 'delete',
        label: '',
        _style: { width: '1%' },
        _classes: 'data-head',
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
        fetch(common.api_href('/api/v1/getallgateways'), hdrs)
            .then(response => response.json())
            .then(data => updateUserData(data));
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/getallgateways'), hdrs)
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
        fetch(common.api_href('/api/v1/delgateway/') + usersData[index].name, hdrs)
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
            <CCallout color="primary" className="bg-title">
                <h4 className="title">Gateways</h4>
            </CCallout>
            <CRow>
                <CCol xs="12" lg="6">
                    <CCard>
                        <CCardHeader className="card-header">
                            Gateways <small>click on a row to see data on gateway</small>
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
                <CCol xs="12" lg="6">
                    <CCard>
                        <CCardHeader>
                            Highest Traffic Gateways <small> in GBs</small>
                        </CCardHeader>
                        <CCardBody>
                            <CChartRadar
                                datasets={[
                                {
                                    label: 'Last Week',
                                    backgroundColor: 'rgba(179,181,198,0.2)',
                                    borderColor: 'rgba(179,181,198,1)',
                                    pointBackgroundColor: 'rgba(179,181,198,1)',
                                    pointBorderColor: '#fff',
                                    pointHoverBackgroundColor: '#fff',
                                    pointHoverBorderColor: 'rgba(179,181,198,1)',
                                    tooltipLabelColor: 'rgba(179,181,198,1)',
                                    data: [65, 59, 90, 81, 56, 55, 40]
                                },
                                {
                                    label: 'This Week',
                                    backgroundColor: 'rgba(255,99,132,0.2)',
                                    borderColor: 'rgba(255,99,132,1)',
                                    pointBackgroundColor: 'rgba(255,99,132,1)',
                                    pointBorderColor: '#fff',
                                    pointHoverBackgroundColor: '#fff',
                                    pointHoverBorderColor: 'rgba(255,99,132,1)',
                                    tooltipLabelColor: 'rgba(255,99,132,1)',
                                    data: [28, 48, 40, 19, 96, 27, 100]
                                }
                                ]}
                                options={{
                                    aspectRatio: 1.5,
                                    tooltips: {
                                        enabled: true
                                }
                                }}
                                labels={[
                                    'gateway.hosting1', 'gateway.hosting2', 'gateway.hosting3', 
                                    'gateway.hosting4', 'gateway.hosting5', 'gateway.hosting6', 
                                    'gateway.hosting7'
                                ]}
                            />
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(GatewaysView)