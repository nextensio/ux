import React from 'react'
import {
  CRow,
  CCard,
  CCardHeader,
  CCardBody,
  CCallout,
  CCol,
  CDataTable,
  CEmbed,
  CLink,
  CWidgetIcon,
} from '@coreui/react'

import { withRouter } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react'
import alertData from './AlertData'
import Map from './mapbox/Mapbox'
import '../homeviews.scss'

const fields = [
  {key: 'status', label: null, _style: {width: '1%'}},
  {key: 'date', _style: {width: '20%'}},
  {key: 'message', label: 'Alert', _style: {width: '40%'}},
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
        <h6 className="subtitle mb-3">Welcome Back, Gopa</h6>
      <CRow className="d-flex justify-content-between">
        <CCol xs="12" sm="6" lg="3">
          <CWidgetIcon text="Income Saved" header="$9,401" color="success" iconPadding={false}>
            <CIcon width={24} name="cil-money"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="12" sm="6" lg="3">
          <CWidgetIcon text="GBs Reduced" header="4,400 GBs" color="info" iconPadding={false}>
            <CIcon width={24} name="cil-laptop"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="12" sm="6" lg="3">
          <CWidgetIcon text="New Requests" header="4" color="warning" iconPadding={false}>
            <CIcon width={24} name="cil-touch-app"/>
          </CWidgetIcon>
        </CCol>
        <CCol xs="12" sm="6" lg="3">
          <CWidgetIcon text="New Alerts" header="4" color="danger" iconPadding={false}>
            <CIcon width={24} name="cil-bell"/>
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
                  <CIcon name="cil-settings" />
                </CLink>
                <CLink className="card-header-action">
                  <CIcon name="cil-x-circle" />
                </CLink>
              </div>
            </CCardHeader>
            <CCardBody className="parent-container">
              <CEmbed>
                <Map className="fit-snug"/>
              </CEmbed>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol xs="12" md="6">
          <CCard>
            <CCardHeader>
              Requests
            </CCardHeader>
            <CCardBody>
              <table className="table table-hover table-outline mb-0 d-none d-sm-table">
                <thead className="thead-light">
                  <tr>
                    <th>DateTime</th>
                    <th>User</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>02/19 3:40PM</td>
                    <td>Mark</td>
                    <td>Please unblock Zoom</td>
                  </tr>
                  <tr>
                    <td>02/20 11:00AM</td>
                    <td>Amanda</td>
                    <td>Slow internet</td>
                  </tr>
                  <tr>
                    <td>02/21 9:04AM</td>
                    <td>Bill</td>
                    <td>Decrease bandwith</td>
                  </tr>
                  <tr>
                    <td>02/21 9:30AM</td>
                    <td>Jamie</td>
                    <td>Please unblock VSC</td>
                  </tr>
                </tbody>
              </table>
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
                fields={fields}
                scopedSlots = {{
                  'status':
                    (item)=>(
                      <td>
                        <CIcon name='cil-circle' className={getIcon(item.status)}/>
                      </td>
                    ),
                  'email':
                    (item, index) => {
                      return (
                        <td className="py-1">
                          <CIcon name="cil-envelope-closed"/>
                        </td>
                      )
                    },
                  'code':
                    (item, index) => {
                      return (
                        <td className="py-1">
                          <CIcon name="cil-code"/>
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