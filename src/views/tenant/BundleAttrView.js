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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { DocsLink } from 'src/reusable'
import { withRouter } from 'react-router-dom';

const fields = [
    "tenant",
    "bid",
    "maj_ver",
    "min_ver",
    "team",
    "dept",
    "IC",
    "manager",
    "nonemployee",
    {
        key: 'edit',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]


const BundleAttrView = (props) => {

    const initTableData = Object.freeze(
        []
    );
    const [usersData, updateUserData] = useState(initTableData);

    useEffect(() => {
        fetch('http://127.0.0.1:8080/api/v1/getallbundleattr/' + props.match.params.id)
            .then(response => response.json())
            .then(data => updateUserData(data));
    }, []);

    const handleRefresh = (e) => {
        fetch('http://127.0.0.1:8080/api/v1/getallbundleattr/' + props.match.params.id)
            .then(response => response.json())
            .then(data => updateUserData(data));
    }

    const handleAdd = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/bundleattr/add')
    }

    const handleEdit = (index) => {
        console.log('ID is %d', index)
    }

    return (
        <>
            <CRow>
                <CCol xs="24" lg="12">
                    <CCard>
                        <CCardHeader>
                            User Attributes
                  <DocsLink name="CModal" />
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                items={usersData}
                                fields={fields}
                                itemsPerPage={15}
                                pagination
                                scopedSlots={{
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CButton
                                                        color="primary"
                                                        variant="outline"
                                                        shape="square"
                                                        size="sm"
                                                        onClick={() => { handleEdit(index) }}
                                                    >
                                                        Edit
                                            </CButton>
                                                </td>
                                            )
                                        }
                                }}
                            />
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CButton size="large" color="primary" onClick={handleRefresh}>Refresh</CButton>
            <CButton size="large" color="secondary" onClick={handleAdd}>Add</CButton>
        </>
    )
}

export default withRouter(BundleAttrView)