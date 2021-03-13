import React from 'react'
import {
  CRow,
  CBadge,
  CCard,
  CCardHeader,
  CCardBody,
  CCol,
  CDataTable,
  CEmbed,
  CLink,
  CNav,
  CNavItem,
  CNavLink,
  CTabs,
  CTabContent,
  CTabPane
} from '@coreui/react'

import { withRouter } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react'
import alertData from './AlertData'
import Map from './mapbox/Mapbox'

const fields = [
  {key: 'status', label: null, _style: {width: '1%'}},
  {key: 'date', _style: {width: '20%'}},
  {key: 'message', _style: {width: '40%'}},
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

const getIcon = (status) =>{
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
        <CTabs activeTab="map">
          <CNav variant="pills">
            <CNavItem>
              <CNavLink data-tab="map">
                Map
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink data-tab="alerts">
                Alerts
              </CNavLink>
            </CNavItem>
          </CNav>
          <CTabContent>
            <CTabPane data-tab="map">
              <CRow className='mt-3'>
                <CCol lg='12'>
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
                    <CCardBody>
                      <CEmbed>
                        <Map />
                      </CEmbed>
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CTabPane>
            <CTabPane data-tab="alerts">
              <CRow className="mt-3">
                <CCol lg="12">
                  <CCard>
                    <CDataTable 
                      className="mt-3"
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
                  </CCard>
                </CCol>
              </CRow>
            </CTabPane>
          </CTabContent>
        </CTabs>
      </>
    )
}

export default withRouter(DashboardView)