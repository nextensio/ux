import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCol,
    CDropdown,
    CDropdownMenu,
    CDropdownToggle,
    CDropdownItem,
    CForm,
    CFormGroup,
    CInput,
    CInputGroup,
    CInputRadio,
    CInvalidFeedback,
    CLabel,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
} from '@coreui/react'

import { AddAttributeApi } from '../apis/apis'

const AttributeEditorModal = ({ props, apiHdrs, userBundleOrHost, show, showFunc }) => {

    const assumedGroup = props.match.params.group

    const initAttributeData = {
        appliesTo: userBundleOrHost,
        isArray: "false",
        name: "",
        type: "String",
        group: assumedGroup
    }

    const [attributeData, updateAttributeData] = useState(initAttributeData)
    const [errObj, updateErrObj] = useState({})

    const handleType = (e, type) => {
        let isArray = attributeData.isArray
        if (type == "Boolean") {
            isArray = "false"
        }
        updateAttributeData({
            ...attributeData,
            type: type,
            isArray: isArray
        });
    }

    const handleChange = (e) => {
        updateAttributeData({
            ...attributeData,
            [e.target.name]: e.target.value
        });
    };

    function validate() {
        var errors = {}
        attributeData.name = attributeData.name.trim()
        // If the tenant does not input any value for name or select a type errObj will have typeErr
        if (attributeData.name == "") {
            errors.typeErr = true
        }
        if (attributeData.name[0] == "_") {
            alert("names starting with _ are reserved keywords, please choose another name");
            errors.typeErr = true
        }
        // We have some reserved keywords for uid and bid and tag
        if (attributeData.name == "uid") {
            alert("uid is a reserved keyword, please choose another name");
            errors.typeErr = true
        }
        if (attributeData.name == "bid") {
            alert("bid is a reserved keyword, please choose another name");
            errors.typeErr = true
        }
        if (attributeData.name == "tag" && attributeData.appliesTo == "Hosts") {
            alert("tag is a reserved keyword, please choose another name");
            errors.typeErr = true
        }
        // If the tenant does not select an appliesTo value errObj will have appliesToErr
        if (attributeData.appliesTo == "") {
            errors.appliesToErr = true
        }
        if (attributeData.isArray == "") {
            errors.isArrayErr = true
        }
        updateErrObj(errors)
        return errors
    }


    const handleSubmit = (e, tenantID, headers, payload) => {
        let errs = validate()
        if (Object.keys(errs).length !== 0) {
            return
        } else {
            AddAttributeApi(tenantID, headers, payload, showFunc)
        }
    }

    return (
        <CModal size="lg" show={show} className="roboto-font" onClose={(e) => showFunc(e)}>
            <CModalHeader className="bg-primary text-white py-n5">
                <strong>Add a {userBundleOrHost.slice(0, -1)} Attribute</strong>
            </CModalHeader>
            <CModalBody className="text-lg-left">
                <CForm>
                    <CFormGroup>
                        <CLabel>{userBundleOrHost.slice(0, -1)} Attribute Name</CLabel>
                        <CInputGroup>
                            <CInput name="name" placeholder="Enter Attribute.." value={attributeData.name} onChange={handleChange} invalid={errObj.typeErr} />
                            <CDropdown className="input-group-append">
                                <CDropdownToggle caret className="border-success bg-success-light text-success">
                                    {attributeData.type}
                                </CDropdownToggle>
                                <CDropdownMenu>
                                    <CDropdownItem onClick={(e) => handleType(e, "String")}>String</CDropdownItem>
                                    <CDropdownItem onClick={(e) => handleType(e, "Boolean")}>Boolean</CDropdownItem>
                                    <CDropdownItem onClick={(e) => handleType(e, "Number")}>Number</CDropdownItem>
                                    <CDropdownItem onClick={(e) => handleType(e, "Date")}>Date</CDropdownItem>
                                </CDropdownMenu>
                            </CDropdown>
                            <CInvalidFeedback>Please enter an attribute name and select a type.</CInvalidFeedback>
                        </CInputGroup>
                    </CFormGroup>
                    <CFormGroup row>
                        <CCol md="4">
                            <CLabel>Attribute Has Multiple Values</CLabel>
                        </CCol>
                        <CCol md="8">
                            <div>
                                <CFormGroup variant="custom-radio" inline>
                                    <CInputRadio custom id="inline-radio1"
                                        name="isArray"
                                        value="true"
                                        checked={attributeData.isArray == "true"}
                                        onChange={handleChange}
                                        disabled={attributeData.type == "Boolean"}
                                    />
                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio1">True</CLabel>
                                </CFormGroup>
                                <CFormGroup variant="custom-radio" inline>
                                    <CInputRadio custom id="inline-radio2"
                                        name="isArray"
                                        value="false"
                                        checked={attributeData.isArray == "false"}
                                        onChange={handleChange}
                                    />
                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio2">False</CLabel>
                                </CFormGroup>
                            </div>
                        </CCol>
                        {/* {errObj.isArrayErr == true ? <div className="invalid-form-text">Please select whether or not this attribute will take multiple values.</div> : <></>} */}
                    </CFormGroup>
                </CForm>
            </CModalBody>
            <CModalFooter>
                <CButton
                    color="primary"
                    onClick={e => handleSubmit(e, props.match.params.id, apiHdrs, attributeData)}
                >Create</CButton>
                <CButton
                    color="secondary"
                    onClick={(e) => showFunc(e)}
                >Cancel</CButton>
            </CModalFooter>
        </CModal>
    )
}

export default AttributeEditorModal