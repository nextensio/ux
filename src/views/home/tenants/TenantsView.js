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
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CNav,
    CNavItem,
    CNavLink,
    CTabs,
    CTabContent,
    CTabPane,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { CChartBar, CChartPie } from '@coreui/react-chartjs'
import usersUsageData from './UsersUsageData'
import bundlesUsageData from './BundlesUsageData'
import { useOktaAuth } from '@okta/okta-react';

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

const usersUsageFields = [
    "name",
    {
        key: 'data',
        label: 'GBs Consumed',
        sorter: true
    }
]

const bundlesUsageFields = [
    "name",
    {
        key: 'data',
        label: 'GBs Consumed',
        sorter: true
    }
]

const TenantsView = (props) => {
    const initTableData = Object.freeze(
        []
    );
    const [usersInterval, setUsersInterval] = useState('month');
    const [bundlesInterval, setBundlesInterval] = useState('month');
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
        fetch(common.api_href('/api/v1/getalltenants'), hdrs)
            .then(response => response.json())
            .then(data => updateUserData(data));
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/getalltenants'), hdrs)
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
        fetch(common.api_href('/api/v1/deltenant/') + usersData[index]._id, hdrs)
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
            <CTabs activeTab="catalog">
                <CNav variant="pills">
                    <CNavItem>
                        <CNavLink data-tab="catalog">
                            Catalog
                        </CNavLink>
                    </CNavItem>
                    <CNavItem>
                        <CNavLink data-tab="activity">
                            Activity
                        </CNavLink>
                    </CNavItem>
                </CNav>
                <CTabContent>
                    <CTabPane data-tab="catalog">
                        <CRow className='mt-3'>
                            <CCol xs="24" lg="12">
                                <CCard>
                                    <CCardHeader>
                                        <strong>Tenants</strong>
                                    </CCardHeader>
                                    <CCardBody>
                                        <CDataTable
                                            items={usersData}
                                            fields={fields}
                                            itemsPerPageSelect
                                            tableFilter={{placeholder:'By name, gateways...',label:'Search: '}}
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
                                                                        onClick={() => {toggleDelete(index)}}
                                                                    >
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
                        <CButton size="large" color="primary" onClick={handleRefresh}>Refresh</CButton>
                        <CButton size="large" color="secondary" onClick={handleAdd}>Add</CButton>
                    </CTabPane>
                </CTabContent>
                <CTabContent>
                    <CTabPane data-tab="activity">
                        <CRow className='mt-3'>
                            <CCol lg='6'>
                                <CCard>
                                    <CCardHeader>
                                        Top Users
                                    </CCardHeader>
                                    <CCardBody>
                                        <CDropdown className='d-flex justify-content-end mb-3'>
                                            <CDropdownToggle caret color="primary">
                                                Time Frame          
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem onClick={() => {setUsersInterval('month')}}>By Month</CDropdownItem>
                                                <CDropdownItem onClick={() => {setUsersInterval('week')}}>By Week</CDropdownItem>
                                                <CDropdownItem onClick={() => {setUsersInterval('day')}}>By Day</CDropdownItem>
                                            </CDropdownMenu>
                                        </CDropdown>
                                        <CDataTable 
                                            items={usersUsageData}
                                            fields={usersUsageFields}
                                            dark
                                            scopedSlot={{
                                                'data':
                                                    (item) => {
                                                        return (
                                                            <td>
                                                                {item.data.month}
                                                            </td>
                                                        )
                                                    }
                                            }}
                                        />
                                    </CCardBody>
                                </CCard>
                                <CCard className='mt-3'>
                                    <CCardHeader>
                                    Network Log for ...
                                    </CCardHeader>
                                    <CCardBody>
                                        <CDropdown className='d-flex justify-content-end'>
                                            <CDropdownToggle caret color="primary">
                                                Time Frame          
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem>By Month</CDropdownItem>
                                                <CDropdownItem>By Week</CDropdownItem>
                                                <CDropdownItem>By Day</CDropdownItem>
                                            </CDropdownMenu>
                                        </CDropdown>
                                        <CChartBar
                                            datasets={[
                                            {
                                                label: 'GB Traffic',
                                                backgroundColor: '#f87979',
                                                data: [40, 20, 12, 39, 10, 40, 39]
                                            }
                                            ]}
                                            labels={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                                            options={{
                                            tooltips: {
                                                enabled: true
                                            }
                                            }}
                                        />
                                    </CCardBody>
                                </CCard>
                            </CCol>
                            <CCol lg='6'>
                                <CCard>
                                    <CCardHeader>
                                        Top Bundles
                                    </CCardHeader>
                                    <CCardBody>
                                        <CDropdown className='d-flex justify-content-end mb-3'>
                                            <CDropdownToggle caret color="primary">
                                                Time Frame          
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem onClick={() => {setBundlesInterval('month')}}>By Month</CDropdownItem>
                                                <CDropdownItem onClick={() => {setBundlesInterval('week')}}>By Week</CDropdownItem>
                                                <CDropdownItem onClick={() => {setBundlesInterval('day')}}>By Day</CDropdownItem>
                                            </CDropdownMenu>
                                        </CDropdown>
                                        <CDataTable
                                            items={bundlesUsageData}
                                            fields={bundlesUsageFields}
                                            dark
                                        />
                                    </CCardBody>
                                </CCard>
                            </CCol>
                        </CRow>
                    </CTabPane>
                </CTabContent>
            </CTabs>
        </>
    )
}

export default withRouter(TenantsView)