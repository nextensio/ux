import React from 'react'
import {
    CRow,
    CButton,
    CButtonGroup,
    CCard,
    CCardHeader,
    CCardBody,
    CCardFooter,
    CCallout,
    CCol,
    CDataTable,
    CEmbed,
    CLink,
    CProgress,
    CWidgetIcon,
    CWidgetProgressIcon,
} from '@coreui/react'

import { withRouter } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react'
import requestData from './RequestData'
import alertData from './AlertData'
import Map from './mapbox/Mapbox'
import TrafficChart from './TrafficChart'
import '../homeviews.scss'

const requestFields = [
    { key: 'date', _style: { width: '30%' } },
    { key: 'user', _style: { width: '20%' } },
    { key: 'request', _style: { width: '45%' } },
    {
        key: 'email',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: 'code',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]
const alertFields = [
    { key: 'status', label: null, _style: { width: '1%' } },
    { key: 'date', _style: { width: '20%' } },
    { key: 'message', label: 'Alert', _style: { width: '40%' } },
    {
        key: 'email',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: 'code',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]

const getIcon = (status) => {
    switch (status) {
        case 'healthy': return 'text-success'
        case 'overworked': return 'text-warning'
        case 'compromised': return 'text-danger'
        default: return 'primary'
    }
}

const DashboardView = () => {
    // render
    return (
        <>
            <CCallout color="primary" className="bg-title">
                <h4 className="title">Dashboard</h4>
            </CCallout>
            <CRow className="d-flex justify-content-between">
                <CCol xs="12" sm="6" lg="3">
                    <CWidgetIcon text="New Alerts" header="4" color="primary" iconPadding={false}>
                        <CIcon width={24} name="cil-bell" />
                    </CWidgetIcon>
                </CCol>
            </CRow>
            <CRow>
                <CCol xs="12" md="8">
                    <CCard>
                        <CCardHeader>
                            Gateways Heatmap
                            <div className="card-header-actions">
                                <CLink className="card-header-action">
                                    <CIcon className="text-primary" name="cil-settings" />
                                </CLink>
                                <CLink className="card-header-action">
                                    <CIcon className="text-primary" name="cil-x-circle" />
                                </CLink>
                            </div>
                        </CCardHeader>
                        <CCardBody className="parent-container">
                            <CEmbed>
                                <Map className="fit-snug" />
                            </CEmbed>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol xs="12" md="4">
                    <CWidgetProgressIcon
                        block
                        header="120,400"
                        text="Total Users"
                        color="primary"
                        inverse
                    >
                        <CIcon name="cil-group" height="36" />
                    </CWidgetProgressIcon>

                    <CWidgetProgressIcon
                        block
                        header="120,400"
                        text="Online Users"
                        color="primary"
                        inverse
                    >
                        <CIcon name="cil-group" height="36" />
                    </CWidgetProgressIcon>
                </CCol>
            </CRow>


            <CCard block>
                <CCardBody>
                    <CRow>
                        <CCol sm="5">
                            <h4 id="traffic" className="card-title mb-0">Traffic</h4>
                            <div className="small text-muted">November 2017</div>
                        </CCol>
                        <CCol sm="7" className="d-none d-md-block">
                            <CButton color="primary" className="float-right">
                                <CIcon name="cil-cloud-download" />
                            </CButton>
                            <CButtonGroup className="float-right mr-3">
                                {
                                    ['Day', 'Month', 'Year'].map(value => (
                                        <CButton
                                            color="outline-secondary"
                                            key={value}
                                            className="mx-0"
                                            active={value === 'Month'}
                                        >
                                            {value}
                                        </CButton>
                                    ))
                                }
                            </CButtonGroup>
                        </CCol>
                    </CRow>
                    <TrafficChart style={{ height: '300px', marginTop: '40px' }} />
                </CCardBody>
                <CCardFooter>
                    <CRow className="text-center">
                        <CCol md sm="12" className="mb-sm-2 mb-0">
                            <div className="text-muted">Visits</div>
                            <strong>29.703 Users (40%)</strong>
                            <CProgress
                                className="progress-xs mt-2"
                                precision={1}
                                color="success"
                                value={40}
                            />
                        </CCol>
                        <CCol md sm="12" className="mb-sm-2 mb-0 d-md-down-none">
                            <div className="text-muted">Unique</div>
                            <strong>24.093 Users (20%)</strong>
                            <CProgress
                                className="progress-xs mt-2"
                                precision={1}
                                color="info"
                                value={40}
                            />
                        </CCol>
                        <CCol md sm="12" className="mb-sm-2 mb-0">
                            <div className="text-muted">Pageviews</div>
                            <strong>78.706 Views (60%)</strong>
                            <CProgress
                                className="progress-xs mt-2"
                                precision={1}
                                color="warning"
                                value={40}
                            />
                        </CCol>
                        <CCol md sm="12" className="mb-sm-2 mb-0">
                            <div className="text-muted">New Users</div>
                            <strong>22.123 Users (80%)</strong>
                            <CProgress
                                className="progress-xs mt-2"
                                precision={1}
                                color="danger"
                                value={40}
                            />
                        </CCol>
                        <CCol md sm="12" className="mb-sm-2 mb-0 d-md-down-none">
                            <div className="text-muted">Bounce Rate</div>
                            <strong>Average Rate (40.15%)</strong>
                            <CProgress
                                className="progress-xs mt-2"
                                precision={1}
                                value={40}
                            />
                        </CCol>
                    </CRow>
                </CCardFooter>
            </CCard>
            <CRow>
                <CCol xs="12" md="6">
                    <CCard>
                        <CCardHeader>
                            Requests
            </CCardHeader>
                        <CCardBody className="parent-container">
                            <CDataTable
                                className="fit-snug"
                                items={requestData}
                                fields={requestFields}
                                scopedSlots={{
                                    'email':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CIcon name="cil-envelope-closed" />
                                                </td>
                                            )
                                        },
                                    'code':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CIcon name="cil-code" />
                                                </td>
                                            )
                                        },
                                }}
                            />
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol sm="12" lg="6">
                    <CCard>
                        <CCardHeader>
                            Alerts
            </CCardHeader>
                        <CCardBody className="parent-container">
                            <CDataTable
                                className="fit-snug"
                                items={alertData}
                                fields={alertFields}
                                scopedSlots={{
                                    'status':
                                        (item) => (
                                            <td>
                                                <CIcon name='cil-circle' className={getIcon(item.status)} />
                                            </td>
                                        ),
                                    'email':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CIcon name="cil-envelope-closed" />
                                                </td>
                                            )
                                        },
                                    'code':
                                        (item, index) => {
                                            return (
                                                <td className="py-1">
                                                    <CIcon name="cil-code" />
                                                </td>
                                            )
                                        },
                                }}
                            />
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(DashboardView)