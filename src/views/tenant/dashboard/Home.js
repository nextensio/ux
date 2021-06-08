import React, { useState } from 'react'
import {
    CBadge,
    CButton,
    CButtonGroup,
    CCallout,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CDataTable,
    CProgress,
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { withRouter } from 'react-router-dom';
import { CChartBar, CChartDoughnut } from '@coreui/react-chartjs'
import usersUsageData from './UsersUsageData'
import bundlesUsageData from './BundlesUsageData'
import '../tenantviews.scss'

const usersUsageFields = [
    {
        key: "name",
        _classes: "data-head",
        sorter: true,
    },
    {
        key: 'data',
        label: 'GBs Consumed',
        sorter: true
    }
]

const bundlesUsageFields = [
    {
        key: "name",
        _classes: 'data-head',
        sorter: true,
    },
    {
        key: 'data',
        label: 'GBs Consumed',
        sorter: true
    }
]

const Home = (props) => {
    const [user, setUser] = useState('');
    const [bundle, setBundle] = useState('');
    const toClusterConfig = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/clusterconfig')
    }
    return(
        <>
            <CCallout color="primary" className="bg-title mb-3">
                <h4 className="title">Home</h4>
            </CCallout>
            <CRow>
                <CCol lg="4">
                    <CCard className="shadow border-rounded">
                        <CChartDoughnut
                            className="py-5"
                            datasets={[
                                {
                                    backgroundColor: [
                                        '#2eb85c',
                                        '#39f'
                                    ],
                                    data: [4700, 8900]
                                }
                            ]}
                            labels={['Users Online', 'Total Users']}
                            options={{
                                tooltips: {
                                    enabled: true
                                }
                            }}
                        />
                    </CCard>
                </CCol>
                <CCol lg="8">
                    <CCard className="border-rounded shadow">
                        <CCardHeader>
                            Cluster Configuration
                            <CButton 
                                className="float-right" 
                                color="primary"
                                onClick={toClusterConfig}
                            >
                                <CIcon className="mr-1" name="cil-settings"/>
                                Configure
                            </CButton>
                        </CCardHeader>
                        <CCardBody>
                            Sorry, you do not have any configuration yet.
                        </CCardBody>
                    </CCard>
                </CCol>
                
            </CRow>
            <CRow>
                <CCol lg="12">
                    <CCard>
                        <CCardHeader>
                            Top Accessed Apps
                        </CCardHeader>
                        <CCardBody>
                            <CRow className="mb-3">
                                <CCol md="3" className="d-flex justify-content-center">
                                    <CBadge color="danger">Youtube</CBadge>
                                </CCol>
                                <CCol md="9">
                                    <CProgress color="success" className="bg-white" value={1300} max={1300} showValue/>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol md="3" className="d-flex justify-content-center">
                                    <CBadge color="info">Zoom</CBadge>
                                </CCol>
                                <CCol md="9">
                                    <CProgress striped className="bg-white" value={1140} max={1300} showValue/>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol md="3" className="d-flex justify-content-center">
                                    <CBadge color="danger">GMail</CBadge>
                                </CCol>
                                <CCol md="9">
                                    <CProgress striped className="bg-white" value={1120} max={1300} showValue/>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol md="3" className="d-flex justify-content-center">
                                    <CBadge color="info">Github</CBadge>
                                </CCol>
                                <CCol md="9">
                                    <CProgress striped className="bg-white" value={1000} max={1300} showValue/>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol md="3" className="d-flex justify-content-center">
                                    <CBadge color="warning">Stack Overflow</CBadge>
                                </CCol>
                                <CCol md="9">
                                    <CProgress striped className="bg-white" value={880} max={1300} showValue/>
                                </CCol>
                            </CRow>
                            <CRow className="mb-3">
                                <CCol md="3" className="d-flex justify-content-center">
                                    <CBadge color="info">LinkedIn</CBadge>
                                </CCol>
                                <CCol md="9">
                                    <CProgress striped className="bg-white" value={770} max={1300} showValue/>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CRow>
                <CCol lg='6'>
                    <CCard>
                        <CCardHeader>
                            Top Bandwidth Consuming Users
                        </CCardHeader>
                        <CCardBody>
                            <CButtonGroup className="float-right mr-3 mb-3">
                                {
                                    ['Day', 'Week', 'Month'].map(value => (
                                        <CButton
                                            color="outline-secondary"
                                            key={value}
                                            className="mx-0"
                                            active={value === 'Week'}
                                        >
                                            {value}
                                        </CButton>
                                    ))
                                }
                            </CButtonGroup>
                            <CDataTable 
                                items={usersUsageData}
                                fields={usersUsageFields}
                                sorter
                                hover
                                clickableRows
                                onRowClick={(item) => setUser(item.name)}
                            />
                        </CCardBody>
                    </CCard>
                    <CCard className='mt-3'>
                        <CCardHeader>
                        Network Log for {user}
                        </CCardHeader>
                        <CCardBody>
                            <CButtonGroup className="float-right mr-3">
                                {
                                    ['Day', 'Week', 'Month'].map(value => (
                                        <CButton
                                            color="outline-secondary"
                                            key={value}
                                            className="mx-0"
                                            active={value === 'Week'}
                                        >
                                            {value}
                                        </CButton>
                                    ))
                                }
                            </CButtonGroup>
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
                            Top Bandwidth Consuming Apps
                        </CCardHeader>
                        <CCardBody>
                            <CButtonGroup className="float-right mr-3 mb-3">
                                {
                                    ['Day', 'Week', 'Month'].map(value => (
                                        <CButton
                                            color="outline-secondary"
                                            key={value}
                                            className="mx-0"
                                            active={value === 'Week'}
                                        >
                                            {value}
                                        </CButton>
                                    ))
                                }
                            </CButtonGroup>
                            <CDataTable
                                items={bundlesUsageData}
                                fields={bundlesUsageFields}
                                hover
                                sorter
                                clickableRows
                                onRowClick={(item) => setBundle(item.name)}
                            />
                        </CCardBody>
                    </CCard>
                    <CCard className='mt-3'>
                        <CCardHeader>
                        Bundle activity for {bundle}
                        </CCardHeader>
                        <CCardBody>
                            <CButtonGroup className="float-right mr-3">
                                {
                                    ['Day', 'Week', 'Month'].map(value => (
                                        <CButton
                                            color="outline-secondary"
                                            key={value}
                                            className="mx-0"
                                            active={value === 'Week'}
                                        >
                                            {value}
                                        </CButton>
                                    ))
                                }
                            </CButtonGroup>
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

export default withRouter(Home)