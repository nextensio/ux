import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCallout,
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
    CListGroup,
    CListGroupItem,
    CModal,
    CModalHeader,
    CModalBody,
    CModalTitle,
    CModalFooter,
    CRow,
    CInvalidFeedback,
    CTabContent,
    CTabPane,
    CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './tenantviews.scss'

var common = require('../../common')

const easyFields = [
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
        key: "delete",
        label: '',
        _style: { width: '1%' },
        sorter: false,
        filter: false
    }
]


const expertFields = [
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
        key: "isArray",
        label: "Multiple Values",
        _classes: "data-field"
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
    const initAttrObj = { name: '', appliesTo: '', type: 'String', isArray: '' }
    const initAttrObjEasy = { name: '', appliesTo: 'Users', type: 'String', isArray: '' }
    const [inuseAttr, updateInuseAttr] = useState(initAttrData);
    const [attributeData, updateAttributeData] = useState(initAttrObjEasy)
    const [policyData, updatePolicyData] = useState(Object.freeze([]))
    const [resetWarning, setResetWarning] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [cannotDeleteModal, setCannotDeleteModal] = useState(false)
    const [deleteItem, setDeleteItem] = useState(0);
    const [activeTab, setActiveTab] = useState("Overview")
    const [overwriteModal, setOverwriteModal] = useState(false);
    const [easyMode, setEasyMode] = useState(true)
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
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/tenant'), hdrs)
            .then(response => response.json())
            .then(data => {
                if (!data.Tenant.easymode) {
                    updateAttributeData(initAttrObj)
                }
                setEasyMode(data.Tenant.easymode)
            });
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => { updateInuseAttr(data) });
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
    }, []);

    const handleRefresh = (e) => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => { updateInuseAttr(data) });
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

    const reset = (e) => {
        updateErrObj({})
        updateAttributeData({ name: '', appliesTo: '', type: 'String', isArray: '' });
        setResetWarning(false);
    }

    // function used to update errObj
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
                name: attributeData.name, appliesTo: attributeData.appliesTo, type: attributeData.type, isArray: attributeData.isArray
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

    // Validation check, if attribute name is found in policy this function will return false,
    // otherwise we will return true. Output is used in the toggleDelete function.
    function validateDelete(item) {
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
                <CCol sm="12" lg="6">
                    <CCard className="roboto-font shadow rounded">
                        <CCardHeader>
                            Add New Attributes
                            <div className="text-muted small">
                                {easyMode ?
                                    "Define attribute set for Users." :
                                    "Define attribute set for Users, Apps and AppGroups."
                                }
                            </div>
                        </CCardHeader>
                        <CCardBody>
                            <CForm>
                                {!easyMode &&
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
                                                    <CInputRadio custom id="inline-radio2" name="appliesTo" value="Hosts" checked={attributeData.appliesTo == "Hosts"} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio2"><CIcon name="cil-link" /> Apps</CLabel>
                                                </CFormGroup>
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio3" name="appliesTo" value="Bundles" checked={attributeData.appliesTo == "Bundles"} onChange={handleChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio3"><CIcon name="cil-notes" /> AppGroups</CLabel>
                                                </CFormGroup>
                                            </div>
                                        </CCol>
                                        {errObj.appliesToErr == true ? <div className="invalid-form-text">Please select which category this attribute applies to.</div> : <></>}
                                    </CFormGroup>}
                                <CFormGroup>
                                    <CLabel htmlFor="nf-attribute">{easyMode ? "User Attribute Name" : "Attribute Name"}</CLabel>
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
                                        {' '}
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
                                                <CInputRadio custom id="inline-radio4" name="isArray" value={true} checked={attributeData.isArray == "true"} onChange={handleChange} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio4">True</CLabel>
                                            </CFormGroup>
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio5" name="isArray" value={false} checked={attributeData.isArray == "false"} onChange={handleChange} />
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio5">False</CLabel>
                                            </CFormGroup>
                                        </div>
                                    </CCol>
                                    {errObj.isArrayErr == true ? <div className="invalid-form-text">Please select whether or not this attribute will take multiple values.</div> : <></>}
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
                <CCol sm="12" lg="6">
                    <CCard className="roboto-font shadow rounded">
                        <CCardHeader>
                            Editor Information
                        </CCardHeader>
                        <CCardBody>
                            <CRow>
                                <CCol xs="4">
                                    <CListGroup id="list-tab" role="tablist">
                                        <CListGroupItem onClick={() => setActiveTab("Overview")} action active={activeTab === "Overview"} >Overview</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Applies To")} action active={activeTab === "Applies To"} >Applies To</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Type")} action active={activeTab === "Type"} >Type</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Arrays")} action active={activeTab === "Arrays"} >Arrays</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Examples")} action active={activeTab === "Examples"} >Examples</CListGroupItem>
                                        <CListGroupItem onClick={() => setActiveTab("Policies")} action active={activeTab === "Policies"} >Policies</CListGroupItem>
                                    </CListGroup>
                                </CCol>
                                <CCol xs="8">
                                    <CTabContent>
                                        <CTabPane active={activeTab === "Overview"} >
                                            <p>Attributes are a set of properties with values, ie key/value pairs. The keys are just strings, values can be
                                                one of string, array of strings, number, array of numbers, boolean, array of booleans.
                                            </p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Applies To"}>
                                            <p>Each attribute either applies to (ie is a property of) a User, App or AppGroup. If the same attribute/key
                                                is a property of all three, the same attribute can be defined three times choosing each as "Applies To"
                                            </p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Type"}>
                                            <p>Type indicates the type of the attribute's Value. It is either string, number or boolean</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Arrays"}>
                                            <p>Each attribute can have an array of values, each array element of the same Type</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Examples"}>
                                            <p>allowTeams: ["engineering", "support"] is an example of array of strings. trustScore: 90 is an example
                                                of a single number value attribute. allowedDays: [true, true, true, true, true, false, false] is an
                                                example where the attribute says that an app access is allowed only monday-friday
                                            </p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Policies"}>
                                            <p>Policies are written in an industry standard language getting wide acceptance - Rego. Rego provides
                                                simple constructs to do access control etc.., using the attributes and their values
                                            </p>
                                        </CTabPane>
                                    </CTabContent>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>

            <CRow>
                <CCol sm="12">
                    <CCard className="roboto-font shadow rounded">
                        <CCardHeader>
                            Existing Attributes
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                fields={easyMode ? easyFields : expertFields}
                                items={inuseAttr}
                                pagination
                                sorter
                                scopedSlots={{
                                    'appliesTo':
                                        (item, index) => {
                                            return (
                                                <td className="py-auto">
                                                    {appliesToStringifyPlural(item.appliesTo)}
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
                        You cannot delete this attribute. It is currently being used in a policy.
                    </CModalBody>
                    <CModalFooter>
                        <CButton
                            color="warning"
                            onClick={() => setCannotDeleteModal(!cannotDeleteModal)}
                        >Dismiss</CButton>
                    </CModalFooter>
                </CModal>
            </CRow>
        </>
    )
}

export default withRouter(AttributeEditor)
