import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCallout,
    CCard,
    CCardHeader,
    CCardBody,
    CCol,
    CDataTable,
    CDropdown,
    CDropdownToggle,
    CDropdownItem,
    CDropdownMenu,
    CForm,
    CFormGroup,
    CFormText,
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
    CValidFeedback,
    CInvalidFeedback,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { reset } from 'enzyme/build/configuration';
import { useOktaAuth } from '@okta/okta-react';
import { introspect } from '@okta/okta-auth-js';
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
        key: 'show',
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false,
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
    const [appliesTo, setAttrAppliesTo] = useState('Users');
    const [attributeData, setAttributeData] = useState([{ name: '', appliesTo: '', type: 'String', isValid: 'noState' }])
    // isValid contains three states: "true", "false", and "noState", this property is used to ensure alphanumeric entry
    const [attributeWarning, setAttributeWarning] = useState(false);
    const [resetWarning, setResetWarning] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(0);

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

    const formText = (isValid) => {
        if (isValid == "noState") {
            return <CFormText className="help-block">Please enter an Attribute Name</CFormText>
        }
    }

    const handleAppliesToChange = (e) => {
        const value = e.target.value;
        setAttrAppliesTo(value);
        const values = [...attributeData];
        for (var v in values) {
            values[v].appliesTo = value;
        }
    }

    const handleAttributeChange = (e, index) => {
        const values = [...attributeData];
        if (e.target.value.length == 0) {
            values[index].isValid = "noState"
        }
        else if (e.target.value.match(/^[a-z0-9]+$/i) && e.target.value.length > 0) {
            values[index].isValid = "true"
        }
        else {
            values[index].isValid = "false";
        }
        values[index].appliesTo = appliesTo;
        values[index].name = e.target.value;
        setAttributeData(values)
    };

    const handleRemove = (index) => {
        if (attributeData.length === 1) {
            setAttributeWarning(true);
            return
        }
        const values = [...attributeData];
        values.splice(index, 1);
        setAttributeData(values);
    };

    const handleType = (e, index, type) => {
        const values = [...attributeData];
        values[index].type = type;
        setAttributeData(values);
    }

    const handleAdd = (e) => {
        const values = [...attributeData];
        values.push({ name: '', type: 'String', isValid: 'noState', appliesTo: appliesTo });
        setAttributeData(values)
        console.log(values)
    }

    const reset = (e) => {
        setAttrAppliesTo('');
        setAttributeData([{ name: '', type: 'Attribute Type', isValid: 'noState' }]);
        setResetWarning(false);
    }

    const commitAttrs = (e) => {
        // Remove empty rows, also remove elements that already exist
        var newData = [];
        for (var i = 0; i < attributeData.length; i++) {
            if (attributeData[i].name == '') {
                continue
            }
            var found = false;
            for (var j = 0; j < inuseAttr.length; j++) {
                if (inuseAttr[j].name == attributeData[i].name &&
                    inuseAttr[j].appliesTo == attributeData[i].appliesTo) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                var a = attributeData[i];
                newData.push({ name: a.name, appliesTo: a.appliesTo, type: a.type });
            }
        }
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(newData),
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
                    updateInuseAttr(inuseAttr.concat(newData));
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    }

    const toggleDelete = (index) => {
        setDeleteModal(!deleteModal);
        setDeleteIndex(index)
    }

    const handleDelete = (index) => {
        var delData = [];
        delData.push(inuseAttr[index]);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(delData),
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
                            <div className="text-muted small">Define attribute set for users and bundles.</div>
                        </CCardHeader>
                        <CCardBody>
                            <CForm>
                                <CFormGroup row>
                                    <CCol md="6">
                                        <CLabel>Attributes Apply To</CLabel>
                                    </CCol>
                                    <CCol md="6">
                                        <div className="float-right">
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio1" name="inline-radios" value="Users" onChange={(e) => handleAppliesToChange(e)} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio1"><CIcon name="cil-user" /> User</CLabel>
                                            </CFormGroup>
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio2" name="inline-radios" value="Bundles" onChange={(e) => handleAppliesToChange(e)} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio2"><CIcon name="cil-notes" /> AppGroup</CLabel>
                                            </CFormGroup>
                                        </div>
                                    </CCol>
                                </CFormGroup>

                                {attributeData.map((attribute, index) => {
                                    return (
                                        <CFormGroup>
                                            <CLabel htmlFor="nf-attribute">Attribute Name</CLabel>
                                            <CInputGroup>
                                                <CInput
                                                    name="attribute"
                                                    type="text"
                                                    placeholder="Enter Attribute.."
                                                    value={attribute.name}
                                                    onChange={(e) => handleAttributeChange(e, index)}
                                                    valid={attribute.isValid == "true"}
                                                    invalid={attribute.isValid == "false"}
                                                />
                                                <CDropdown className="input-group-append">
                                                    <CDropdownToggle caret color="success">
                                                        {attribute.type}
                                                    </CDropdownToggle>
                                                    <CDropdownMenu>
                                                        <CDropdownItem value={attribute.type.value} onClick={(e) => handleType(e, index, "String")}>String</CDropdownItem>
                                                        <CDropdownItem value={attribute.type.value} onClick={(e) => handleType(e, index, "Boolean")}>Boolean</CDropdownItem>
                                                        <CDropdownItem value={attribute.type.value} onClick={(e) => handleType(e, index, "Date")}>Date</CDropdownItem>
                                                        <CDropdownItem value={attribute.type.value} onClick={(e) => handleType(e, index, "Number")}>Number</CDropdownItem>
                                                    </CDropdownMenu>
                                                </CDropdown>
                                                {' '}
                                                <CButton shape="square" color="danger" onClick={() => handleRemove(index)}>
                                                    X
                                                </CButton>
                                                <CInvalidFeedback>Please use alphanumerics for your attribute Name!</CInvalidFeedback>
                                            </CInputGroup>
                                            {formText(attribute.isValid)}
                                            {/*show this if input field is empty*/}
                                        </CFormGroup>
                                    )
                                })}
                            </CForm>
                            <CButton className="float-right button-footer-success" variant="outline" color="success" onClick={(e) => commitAttrs(e)}><CIcon name="cil-scrubber" /> <strong>Commit</strong></CButton>
                            <CButton className="float-right button-footer-danger" variant="outline" color="danger" onClick={() => { setResetWarning(true) }}><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                            <CButton className="float-right button-footer-dark" variant="outline" color="dark" onClick={handleAdd}><CIcon name="cil-plus" /> <strong>More</strong></CButton>
                        </CCardBody>
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
                
                {/* Warning to be triggered if tenant attempts to delete attribute field when there is only one rendered*/}
                <CModal show={attributeWarning} onClose={() => setAttributeWarning(false)} color="danger">
                    <CModalHeader closeButton>
                        <CModalTitle>Attention!</CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        You need at least one attribute.
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="danger" onClick={() => setAttributeWarning(false)}>OK</CButton>
                    </CModalFooter>
                </CModal>

                {/* Warning to be triggered if tenant attempts to delete an attribute. Confirms deletion or cancels */}
                <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                    <CModalHeader className='bg-danger text-white py-n5' closeButton>
                        <strong>Confirm Deletion</strong>
                    </CModalHeader>
                    <CModalBody className='text-lg-left'>
                        <strong>Are you sure you want to delete this attribute?</strong>
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="danger"
                            onClick={() => { handleDelete(deleteIndex) }}
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
                                    'show':
                                        (item, index) => {
                                            return (
                                                <td className="py-2">
                                                    <CTooltip content='Show' className='bottom'>
                                                        <CButton
                                                            className='button-table'
                                                            color='primary'
                                                            variant='ghost'
                                                            size="sm"
                                                        >
                                                            <FontAwesomeIcon icon="angle-double-down" size="lg" className="icon-table-edit" />
                                                        </CButton>
                                                    </CTooltip>
                                                </td>
                                            )
                                        },
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
                                                            onClick={() => { toggleDelete(index) }}
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
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(AttributeEditor)