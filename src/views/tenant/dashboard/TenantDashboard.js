import React, { lazy, useState, useEffect } from 'react'
import {
    CCallout,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CDataTable,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { CChartBar } from '@coreui/react-chartjs'
import usersUsageData from './UsersUsageData'
import bundlesUsageData from './BundlesUsageData'
import '../tenantviews.scss'

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

const TenantsDashboard = () => {
    const [user, setUser] = useState('');
    const [bundle, setBundle] = useState('');
    const [usersInterval, setUsersInterval] = useState('month');
    const [bundlesInterval, setBundlesInterval] = useState('month');
    return (
        <>
            <CCallout color="primary" className="bg-title">
                <h4 className="title"></h4>
            </CCallout>
            <CRow className='mt-3'>
                <CCol lg='6'>
                    <CCard>
                        <CCardHeader>
                            Top Users
                        </CCardHeader>
                        <CCardBody>
                            <CDropdown className='d-flex justify-content-end mb-3'>
                                <CDropdownToggle caret color="primary">
                                    {usersInterval}
                                </CDropdownToggle>
                                <CDropdownMenu>
                                    <CDropdownItem onClick={() => { setUsersInterval('month') }}>By Month</CDropdownItem>
                                    <CDropdownItem onClick={() => { setUsersInterval('week') }}>By Week</CDropdownItem>
                                    <CDropdownItem onClick={() => { setUsersInterval('day') }}>By Day</CDropdownItem>
                                </CDropdownMenu>
                            </CDropdown>
                            <CDataTable
                                items={usersUsageData}
                                fields={usersUsageFields}
                                dark
                                clickableRows
                                onRowClick={(item) => setUser(item.name)}
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
                            Network Log for {user}
                        </CCardHeader>
                        <CCardBody>
                            <CDropdown className='d-flex justify-content-end'>
                                <CDropdownToggle caret color="primary">
                                    {bundlesInterval}
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
                                    <CDropdownItem onClick={() => { setBundlesInterval('month') }}>By Month</CDropdownItem>
                                    <CDropdownItem onClick={() => { setBundlesInterval('week') }}>By Week</CDropdownItem>
                                    <CDropdownItem onClick={() => { setBundlesInterval('day') }}>By Day</CDropdownItem>
                                </CDropdownMenu>
                            </CDropdown>
                            <CDataTable
                                items={bundlesUsageData}
                                fields={bundlesUsageFields}
                                clickableRows
                                onRowClick={(item) => setBundle(item.name)}
                                dark
                            />
                        </CCardBody>
                    </CCard>
                    <CCard className='mt-3'>
                        <CCardHeader>
                            Bundle activity for {bundle}
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
            </CRow>
        </>
    )
}

export default withRouter(TenantsDashboard)