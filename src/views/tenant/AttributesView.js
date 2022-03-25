import React, { useEffect, useState } from "react";
import {
    CButton,
    CCard,
    CCardHeader,
    CCardBody,
    CCardFooter,
    CDataTable,
    CTooltip
} from '@coreui/react'

import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CIcon from '@coreui/icons-react'

import './tenantviews.scss'

var common = require('../../common')

const fields = [
    {
        key: "accessable",
        label: '',
        _style: { width: '1%' },
    },
    {
        key: "name",
        _classes: "data-head"
    },
    {
        key: "type",
        _classes: "data-field"
    },
    {
        key: "isArray",
        label: "Multiple Values",
        _classes: "data-field"
    },
    {
        key: "group",
        label: "Group",
        _classes: "data-field"
    },
    {
        key: "editGroup",
        label: "",
        _style: { width: '1%' },
        sorter: false,
        filter: false
    },
    {
        key: "delete",
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]

const AttributesView = (props) => {

    const [attrs, updateAttrs] = useState([])
    const [userBundleOrHost, updateUserBundleOrHost] = useState("")

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: bearer,
            'X-Nextensio-Group': common.getGroup(common.GetAccessToken(authState), props),
        },
    };

    useEffect(() => {
        updateUserBundleOrHost(props.location.state)
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/' + props.location.state), hdrs)
            .then(response => response.json())
            .then(data => updateAttrs(data))
    })



    return (
        <CCard className="roboto-font shadow rounded">
            <CCardHeader className="bg-primary">
                {userBundleOrHost.slice(0, -1)} Attributes
            </CCardHeader>
            <CCardBody>
                <CDataTable
                    fields={fields}
                    items={attrs}
                    pagination
                    sorter
                    scopedSlots={{
                        'accessable':
                            (item, index) => {
                                return (
                                    <td className="py-auto">
                                        <CIcon
                                            name="cil-circle"
                                            className={
                                                item.name[0] == "_" || (item.group !== props.match.params.group)
                                                    ? "text-danger"
                                                    : "text-success"
                                            }
                                        />
                                    </td>
                                )
                            },
                        'editGroup':
                            (item, index) => {
                                return (
                                    <td className="py-2">
                                        <CButton
                                            className="button-table"
                                            color="warning"
                                            variant="ghost"
                                            size="sm"
                                            disabled={item.name[0] !== "_"}
                                        // onClick={(e) => handleGroup(e, item)}
                                        >
                                            <FontAwesomeIcon icon="id-badge" size="lg" className="icon-table-edit" />
                                        </CButton>
                                    </td>
                                )
                            },
                        'delete':
                            (item, index) => {
                                return (
                                    <td className="py-2">
                                        <CTooltip content='Delete' className='bottom'>
                                            <CButton
                                                className="button-table"
                                                color='danger'
                                                variant='ghost'
                                                size="sm"
                                                disabled={item.name[0] == "_" || (item.group !== props.match.params.group)}
                                            // onClick={() => toggleDelete(item)}
                                            >
                                                <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                                            </CButton>
                                        </CTooltip>
                                    </td>
                                )
                            },

                    }}
                />
            </CCardBody>
            <CCardFooter>

            </CCardFooter>
        </CCard>
    )
}

export default AttributesView