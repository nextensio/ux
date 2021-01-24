import React from 'react'
import {
  CWidgetDropdown,
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle
} from '@coreui/react'

import { withRouter } from 'react-router-dom';
import { CIcon } from '@coreui/icons-react'
import ChartLineSimple from '../charts/ChartLineSimple'

const DashboardView = () => {
    // render
    return (
      <CRow>
        <CCol sm="12" lg="6">
          <CWidgetDropdown
            color="gradient-info"
            className="shadow"
            header="9.823"
            text="Gateways Online"
            footerSlot={
              <ChartLineSimple
                pointed
                className="mt-3 mx-3"
                style={{height: '70px'}}
                dataPoints={[1, 18, 9, 17, 34, 22, 11]}
                pointHoverBackgroundColor="info"
                options={{ elements: { line: { tension: 0.00001 }}}}
                label="Members"
                labels="months"
              />
            }
          >
            <CDropdown>
              <CDropdownToggle color="transparent">
                <CIcon name="cil-settings"/>
              </CDropdownToggle>
              <CDropdownMenu className="pt-0" placement="bottom-end">
                <CDropdownItem>Go to Gateway</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CWidgetDropdown>
        </CCol>
  
        <CCol sm="12" lg="6">
          <CWidgetDropdown
            color="gradient-warning"
            className="shadow"
            header="9.823"
            text="Tenants active"
            footerSlot={
              <ChartLineSimple
                pointed
                className="mt-3 mx-3"
                style={{height: '70px'}}
                dataPoints={[78, 81, 80, 45, 34, 12, 40]}
                options={{ elements: { line: { tension: 0.00001 }}}}
                label="Members"
                labels="months"
              />
            }
          >
            <CDropdown>
              <CDropdownToggle color="transparent">
                <CIcon name="cil-settings"/>
              </CDropdownToggle>
              <CDropdownMenu className="pt-0" placement="bottom-end">
                <CDropdownItem>Go to Tenants</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CWidgetDropdown>
        </CCol>
    </CRow>
    )
}

export default withRouter(DashboardView)