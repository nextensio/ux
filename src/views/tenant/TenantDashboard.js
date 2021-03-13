import React from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CWidgetProgressIcon,
  CRow,
  CCol,
} from '@coreui/react'

import { CIcon } from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';

const TenantDashboard = (props) => {
    // render
    return (
      <>
        <CRow className='justify-content-center'>
          <CCol sm='24' md='10'>
            <CCard 
              accentColor='primary'
              className='d-flex'
            >
              <CCardHeader>
                <strong>Welcome to {props.match.params.id}'s Dashboard</strong>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  <CCol sm='12' md='4'>
                    <CWidgetProgressIcon
                      header='1.889'
                      text='Users'
                      color='gradient-info'
                      inverse
                    >
                      <CIcon
                        name='cil-group'
                        height='36'
                      />
                    </CWidgetProgressIcon>
                  </CCol>
                  <CCol sm='12' md='4'>
                    <CWidgetProgressIcon
                      header='1.889'
                      text='Bundles Active'
                      color='gradient-success'
                      inverse
                    >
                      <CIcon
                        name='cil-notes'
                        height='36'
                      />
                    </CWidgetProgressIcon>
                  </CCol>
                  <CCol sm='12' md='4'>
                    <CWidgetProgressIcon
                      header='1.889'
                      text='Routers Online'
                      color='gradient-warning'
                      inverse
                    >
                      <CIcon
                        name='cil-router'
                        height='36'
                      />
                    </CWidgetProgressIcon>
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </>
    )
}

export default withRouter(TenantDashboard)