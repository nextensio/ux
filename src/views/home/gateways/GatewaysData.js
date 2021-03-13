import React from 'react'
import {
    CBadge,
    CCard,
    CCardBody,
    CCardHeader,
    CCardGroup,
    CDropdown,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
} from '@coreui/react'

import { withRouter } from 'react-router-dom';
import { CChartBar, CChartPie } from '@coreui/react-chartjs'

const GatewaysData = () => {
    return(
        <>
            <CCardGroup deck className='mt-3'>
                <CCard>
                    <CCardHeader>
                    Network Log
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
                <CCard>
                    <CCardHeader>
                    Traffic by Tenant
                    </CCardHeader>
                    <CCardBody>
                    <CChartPie
                        datasets={[
                        {
                            backgroundColor: [
                            '#41B883',
                            '#E46651',
                            '#00D8FF',
                            '#DD1B16'
                            ],
                            data: [40, 20, 80, 10]
                        }
                        ]}
                        labels={['Tenant 1', 'Tenant 2', 'Tenant 3', 'Tenant 4']}
                        options={{
                        tooltips: {
                            enabled: true
                        }
                        }}
                    />
                    </CCardBody>
                </CCard>
            </CCardGroup>
        </>
    )
}

export default withRouter(GatewaysData)