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
import '../homeviews.scss'



const DashboardView = () => {
    // render
    return (
        <>
            <CCallout color="primary" className="bg-title">
                <h4 className="title">Dashboard</h4>
            </CCallout>
        </>
    )
}

export default withRouter(DashboardView)