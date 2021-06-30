import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardHeader,
    CCardBody,
    CCardFooter,
    CCol,
    CDataTable,
    CDropdown,
    CDropdownToggle,
    CDropdownItem,
    CDropdownMenu,
    CForm,
    CFormGroup,
    CInput,
    CInputGroup,
    CInputRadio,
    CLabel,
    CModal,
    CModalHeader,
    CModalBody,
    CModalTitle,
    CModalFooter,
    CRow,
    CInvalidFeedback,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './tenantviews.scss'

var common = require('../../common')

const fields = [
    {
        key: "name",
        _classes: "data-head"
    },
    {
        key: "appliesTo",
        _classes: "data-field"
    },
    {
        key: "type",
        _classes: "data-field"
    },
    {
        key: "edit",
        label: '',
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

const AttributeEditor = (props) => {
    var initAttrData = Object.freeze(
        []
    );
    const [inuseAttr, updateInuseAttr] = useState(initAttrData);
    const [attributeData, updateAttributeData] = useState({ name: '', appliesTo: '', type: 'String'})
    const [resetWarning, setResetWarning] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteItem, setDeleteItem] = useState(0);
    const [overwriteModal, setOverwriteModal] = useState(false);
    // This object will contain any error messages used when validating attribute. 
    const [errObj, updateErrObj] = useState({})

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => { updateInuseAttr(data); });
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => { updateInuseAttr(data); });
    }

    const handleChange = (e) => {
        updateAttributeData({
            ...attributeData,
            [e.target.name]: e.target.value
        });
    };

    const handleType = (e, type) => {
        updateAttributeData({
            ...attributeData,
            type: type
        });
    }

    function resetErrs() {
        updateErrObj({})
    }

    const reset = (e) => {
        updateAttributeData({ name: '', appliesTo: '', type: 'String'});
        setResetWarning(false);
    }
    
    // function used to update errObj
    function validate() {
        var errors = {}
        // We have some reserved keywords for uid and bid, hosts dont have the
        // the issue because every user added attribute in hosts is sent under field
        // name "routeattrs" - wish we had done the same for user and bundle
        if (attributeData.name == "uid" && attributeData.appliesTo == "Users") {
            alert("uid is a reserved keyword, please choose another name");
            errors.typeErr = true
        }
        if (attributeData.name == "bid" && attributeData.appliesTo == "Bundles") {
            alert("bid is a reserved keyword, please choose another name");
            errors.typeErr = true
        }
        // If the tenant does not select an appliesTo value errObj will have appliesToErr
        if (attributeData.appliesTo == "") {
            errors.appliesToErr = true
        }
        // If the tenant does not input any value for name or select a type errObj will have typeErr
        if (attributeData.name.trim() == "") {
            errors.typeErr = true
        }
        updateErrObj(errors)
        return errors
    }

    const commitAttrs = (e) => {
        let errs = validate()
        if (Object.keys(errs).length !== 0) {
            return
        }            
        for (var i = 0; i < inuseAttr.length; i++) {
            if (inuseAttr[i].name == attributeData.name &&
                inuseAttr[i].appliesTo == attributeData.appliesTo) {
                setOverwriteModal(true)
                return
            }
        }
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({
                name: attributeData.name, appliesTo: attributeData.appliesTo, type: attributeData.type,
            }),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/attrset'), requestOptions)
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
                    alert(data["Result"]);
                } else {
                    updateInuseAttr(inuseAttr.concat(attributeData));
                    reset()
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
        
    }

    const toggleDelete = (item) => {
        setDeleteModal(!deleteModal);
        setDeleteItem(item)
    }

    const handleDelete = (item) => {
        let index = inuseAttr.indexOf(item)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
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
                    inuseAttr.splice(index, 1);
                    updateInuseAttr(inuseAttr);
                }
                setDeleteModal(!deleteModal);
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    return (
        <>
            <CRow>
                <CCol sm="12" lg="6">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            Add New Attributes
                            <CButton onClick={e => console.log(Object.keys(errObj).length)}>ERR</CButton>
                            <CButton onClick={e => console.log(attributeData)}>ATTR</CButton>
                            <div className="text-muted small">Define attribute set for users, bundles and hosts.</div>
                        </CCardHeader>
                        <CCardBody>
                            <CForm>
                                <CFormGroup row>
                                    <CCol md="4">
                                        <CLabel>Attribute Applies To</CLabel>
                                    </CCol>
                                    <CCol md="8">
                                        <div>
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio1" name="appliesTo" value="Users" checked={attributeData.appliesTo == "Users"} onChange={handleChange} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio1"><CIcon name="cil-user" /> User</CLabel>
                                            </CFormGroup>
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio2" name="appliesTo" value="Bundles" checked={attributeData.appliesTo == "Bundles"} onChange={handleChange} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio2"><CIcon name="cil-notes" /> AppGroup</CLabel>
                                            </CFormGroup>
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio3" name="appliesTo" value="Hosts" checked={attributeData.appliesTo == "Hosts"} onChange={handleChange} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio3"><CIcon name="cil-input-power" /> Host</CLabel>
                                            </CFormGroup>
                                        </div>
                                    </CCol>
                                    {errObj.appliesToErr == true ? <div className="invalid-form-text">Please select which category this attribute applies to.</div> : <></>}
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel htmlFor="nf-attribute">Attribute Name</CLabel>
                                    <CInputGroup>
                                        <CInput name="name" placeholder="Enter Attribute.." value={attributeData.name} onChange={handleChange} invalid={errObj.typeErr}/>
                                        <CDropdown className="input-group-append">
                                            <CDropdownToggle caret className="border-success bg-success-light text-success">
                                                {attributeData.type}
                                            </CDropdownToggle>
                                            <CDropdownMenu>
                                                <CDropdownItem onClick={(e) => handleType(e, "String")}>String</CDropdownItem>
                                                <CDropdownItem onClick={(e) => handleType(e, "Boolean")}>Boolean</CDropdownItem>
                                                <CDropdownItem onClick={(e) => handleType(e, "Date")}>Date</CDropdownItem>
                                            </CDropdownMenu>
                                        </CDropdown>
                                        {' '}
                                        <CInvalidFeedback>Please enter an attribute name and select a type.</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                            </CForm>
                        </CCardBody>
                        <CCardFooter>
                            <CButton className="button-footer-danger" variant="outline" color="danger" onClick={() => { setResetWarning(true) }}><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                            <CButton className="button-footer-success" variant="outline" color="success" onClick={(e) => commitAttrs(e)}><CIcon name="cil-scrubber" /> <strong>Add</strong></CButton>
                        </CCardFooter>
                    </CCard>
                    <CModal show={resetWarning} onClose={() => setResetWarning(false)} color="danger">
                        <CModalHeader closeButton>
                            <CModalTitle>Attention!</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            Are you sure you want to reset new attributes?
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="danger" onClick={reset}>Reset</CButton>
                            <CButton color="secondary" onClick={() => setResetWarning(false)}>Cancel</CButton>
                        </CModalFooter>
                    </CModal>
                </CCol>

                {/* Warning to be triggered if tenant attempts to delete an attribute. Confirms deletion or cancels */}
                <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                    <CModalHeader className='bg-danger text-white py-n5' closeButton>
                        <strong>Confirm Deletion</strong>
                    </CModalHeader>
                    <CModalBody className='text-lg-left'>
                        <strong>Are you sure you want to delete this attribute?</strong>
                        <div>Name: {deleteItem.name}</div>
                        <div>Applies To: {deleteItem.appliesTo}</div>
                        <div>Type: {deleteItem.type}</div>
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
            </CRow>

            <CRow>
                <CCol sm="12">
                    <CCard className="shadow rounded">
                        <CCardHeader>
                            Existing Attributes
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                fields={fields}
                                items={inuseAttr}
                                scopedSlots={{
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip content='Edit' className='bottom'>
                                                        <CButton
                                                            className="button-table"
                                                            color='primary'
                                                            variant='ghost'
                                                            size="sm"
                                                        >
                                                            <FontAwesomeIcon icon="pen" size="lg" className="icon-table-edit" />
                                                        </CButton>
                                                    </CTooltip>
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
                                                            onClick={() => {toggleDelete(item)}}
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
        </>
    )
}

export default withRouter(AttributeEditor)
