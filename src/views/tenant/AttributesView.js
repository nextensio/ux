import React, { useEffect, useState } from "react";
import {
    CButton,
    CCallout,
    CCard,
    CCardHeader,
    CCardBody,
    CCardFooter,
    CCol,
    CDataTable,
    CInputRadio,
    CModal,
    CModalHeader,
    CModalBody,
    CModalFooter,
    CRow,
    CTooltip,
} from '@coreui/react'

import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CIcon from '@coreui/icons-react'

import './tenantviews.scss'
import { func } from "prop-types";
import { AddAttributeApi } from '../../utilities/apis/apis'

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

    const assumedGroup = props.match.params.group

    var initAttrData = Object.freeze(
        []
    );
    const initAttrObjEasy = { name: '', appliesTo: 'Users', type: 'String', isArray: 'false', group: assumedGroup }
    const [attrColl, updateAttrColl] = useState(initAttrData);
    const [attributeData, updateAttributeData] = useState(initAttrObjEasy)
    const [policyData, updatePolicyData] = useState(Object.freeze([]))
    const [deleteModal, setDeleteModal] = useState(false);
    const [cannotDeleteModal, setCannotDeleteModal] = useState(false)
    const [deleteItem, setDeleteItem] = useState(0);
    const [adminGroups, updateAdminGroups] = useState(Object.freeze([]))
    const [editGroupModal, setEditGroupModal] = useState(false)

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

        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/' + props.location.state), hdrs)
            .then(response => response.json())
            .then(data => updateAttrColl(data))

        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allpolicies'), hdrs)
            .then(response => response.json())
            .then(data => {
                let policies = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].hasOwnProperty('rego')) {
                        let rego = String.fromCharCode(...data[i].rego);
                        policies.push(rego)
                    }
                }
                updatePolicyData(policies)
            })
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alladmgroups'), hdrs)
            .then(response => response.json())
            .then(data => {
                updateAdminGroups(data.admgroups)
            })
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/attrset/all'), hdrs)
            .then(response => response.json())
            .then(data => { updateAttrColl(data) });
    }

    const handleGroup = (e, item) => {
        updateAttributeData(item)
        setEditGroupModal(!editGroupModal)
    }

    const handleGroupChange = (e) => {
        updateAttributeData({
            ...attributeData,
            [e.target.name]: e.target.value
        })
    }

    const groupChangeConfirm = (e, item) => {
        if (editGroupModal) {
            console.log(attributeData)
            AddAttributeApi(props.match.params.id, hdrs.headers, attributeData, function () { })
        }
        setEditGroupModal(!editGroupModal)
    }

    // Validation check, if attribute name is found in policy this function will return false,
    // otherwise we will return true. Output is used in the toggleDelete function.
    function validateDelete(item) {
        if (item.name.startsWith('_')) {
            return false
        }
        for (let i = 0; i < policyData.length; i++) {
            if (item.appliesTo === "Users" && policyData[i].includes("input.user." + item.name)) {
                return false
            } else if (item.appliesTo === "Bundles" && policyData[i].includes("input.bundle." + item.name)) {
                return false
            } else if (item.appliesTo === "Hosts" && policyData[i].includes("input.host." + item.name)) {
                return false
            }
        }
        return true
    }

    const toggleDelete = (item) => {
        if (validateDelete(item)) {
            setDeleteModal(!deleteModal);
            setDeleteItem(item)
        } else {
            setCannotDeleteModal(!cannotDeleteModal)
        }
    }


    const handleDelete = (item) => {
        const requestOptions = {
            method: 'POST',
            headers: hdrs.headers,
            body: JSON.stringify(item),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/del/attrset'), requestOptions)
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    // get error message from body or default to response status
                    alert(error);
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }
                // check for error response
                if (data["Result"] != "ok") {
                    alert(data["Result"])
                } else {
                    let attrs = [...attrColl]
                    let index = attrs.indexOf(item)
                    attrs.splice(index, 1)
                    updateAttrColl(attrs)
                    setDeleteModal(!deleteModal);
                }

            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    function appliesToStringify(appliesTo) {
        switch (appliesTo) {
            case "Users":
                return "User"
            case "Bundles":
                return "AppGroup"
            case "Hosts":
                return "App"
        }
    }

    function appliesToStringifyPlural(appliesTo) {
        switch (appliesTo) {
            case "Users":
                return "Users"
            case "Bundles":
                return "AppGroups"
            case "Hosts":
                return "Apps"
        }
    }

    return (
        <>
            <CRow>
                <CCol sm="12">
                    <CCard className="roboto-font shadow rounded">
                        <CCardHeader>
                            {"Existing Attributes"}
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                fields={fields}
                                items={attrColl}
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
                                    'appliesTo':
                                        (item, index) => {
                                            return (
                                                <td className="py-auto">
                                                    {appliesToStringifyPlural(item.appliesTo)}
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
                                                        onClick={(e) => handleGroup(e, item)}
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
                                                            onClick={() => toggleDelete(item)}
                                                        >
                                                            <FontAwesomeIcon icon="trash-alt" size="lg" className="icon-table-delete" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },

                                }}
                            >
                            </CDataTable>
                        </CCardBody>
                        <CCardFooter>
                            <CButton className="button-footer-primary" color="primary" variant="outline" onClick={handleRefresh}>
                                <CIcon name="cil-reload" />
                                <strong>{" "}Refresh</strong>
                            </CButton>
                        </CCardFooter>
                    </CCard>
                </CCol>
            </CRow>

            {/* Warning to be triggered if tenant attempts to delete an attribute. Confirms deletion or cancels */}
            <CModal className="roboto-font" show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                <CModalHeader className='bg-danger text-white py-n5' closeButton>
                    <strong>Confirm Deletion</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    <strong>Are you sure you want to delete this attribute? This attribute will be deleted from every {appliesToStringify(deleteItem.appliesTo)}.</strong>
                    <CCallout color="danger">
                        <div><strong>Name: </strong><strong className="text-danger">{deleteItem.name}</strong></div>
                        <div><strong>Applies To: </strong><strong className="text-danger">{appliesToStringifyPlural(deleteItem.appliesTo)}</strong></div>
                        <div><strong>Type: </strong><strong className="text-danger">{deleteItem.type}</strong></div>
                        <div><strong>Multiple Values: </strong><strong className="text-danger">{deleteItem.isArray}</strong></div>
                    </CCallout>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="danger"
                        onClick={() => { handleDelete(deleteItem) }}
                    >Confirm</CButton>
                    <CButton
                        color="secondary"
                        onClick={() => setDeleteModal(!deleteModal)}
                    >Cancel</CButton>
                </CModalFooter>
            </CModal>
            <CModal className="roboto-font" show={cannotDeleteModal} onClose={() => setCannotDeleteModal(!cannotDeleteModal)}>
                <CModalHeader className="bg-warning text-dark py-n5" closeButton>
                    <strong>Attribute In Use!</strong>
                </CModalHeader>
                <CModalBody className="text-lg-left">
                    You cannot delete this attribute. It is either system defined or being used in a policy.
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="warning"
                        onClick={() => setCannotDeleteModal(!cannotDeleteModal)}
                    >Dismiss</CButton>
                </CModalFooter>
            </CModal>
            <CModal show={editGroupModal} className="roboto-font" onClose={() => setEditGroupModal(!editGroupModal)}>
                <CModalHeader className="bg-warning text-dark py-n5">
                    <strong>Edit Group Ownership for {attributeData.name}</strong>
                </CModalHeader>
                <CModalBody>
                    <CRow className="pt-3">
                        <CCol md="8">
                            <strong>Current Group Ownership</strong>
                        </CCol>
                        <CCol md="4">
                            <strong>{attributeData.group}</strong>
                        </CCol>
                    </CRow>
                    <CRow className="pt-3">
                        <CCol md="8">
                            <strong>New Group</strong>
                        </CCol>
                        <CCol md="4">
                            {adminGroups != null ? adminGroups.map(adminGroup => {
                                return (
                                    <div>
                                        <CInputRadio name="group" value={adminGroup} checked={attributeData.group === adminGroup} onChange={handleGroupChange} /> {adminGroup}
                                    </div>
                                )
                            }) :
                                <div>
                                    You have no groups created
                                </div>
                            }
                        </CCol>
                    </CRow>
                    <CRow>
                        <div className="invalid-form-text" hidden={true}>You need to select a group.</div>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="warning"
                        onClick={() => groupChangeConfirm()}
                    >Confirm</CButton>
                    <CButton
                        color="secondary"
                        onClick={() => setEditGroupModal(!editGroupModal)}
                    >Cancel</CButton>
                </CModalFooter>

            </CModal>
        </>
    )
}

export default AttributesView