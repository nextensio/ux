import React, { lazy, useState, useEffect } from 'react'
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
    CFormText,
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
    CValidFeedback,
    CInvalidFeedback,
   
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import './homeviews.scss'
import { reset } from 'enzyme/build/configuration';

const fields = [
    {
        key: "name",
        _classes: 'data-head',
    },
    {  
        key: "userOrBundle",
        _classes: 'data-head'
    },
    {
        key: "numAttributes",
        _classes: 'data-head'
    },
    {
        key: 'show',
        label: '',
        _style: { width: '1%' },
        _classes: 'data-head',
        sorter: false,
        filter: false,
    },
    {
        key: "edit",
        label: '',
        _style: { width: '1%' },
        _classes: 'data-head',
        sorter: false,
        filter: false
    },
    {
        key: "delete",
        label: '',
        _style: { width: '1%' },
        _classes: 'data-head',
        sorter: false,
        filter: false
    }
]

const AttributeEditor = () => {
    const id = 0;
    const initTableData = Object.freeze(
        []
    );
    const [classData, setClassData] = useState(initTableData);
    const [className, setClassName] = useState('');
    const [userOrBundle, setUserOrBundle] = useState('');
    const [attributeData, setAttributeData] = useState([{name: '', type: 'Attribute Type', isValid: 'noState'}])
    // isValid contains three states: "true", "false", and "noState", this property is used to ensure alphanumeric entry
    const [attributeWarning, setAttributeWarning] = useState(false);
    const [resetWarning, setResetWarning] = useState(false);

    const formText = (isValid) => {
        if (isValid == "noState") {
            return <CFormText className="help-block">Please enter an Attribute Name</CFormText>
        }
    }

    const handleClassChange = (e) => {
        const value = e.target.value;
        setClassName(value)
    };

    const handleUserBundleChange = (e) => {
        const value = e.target.value;
        setUserOrBundle(value);
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
        values.push({name: '', type: 'Attribute Type', isValid: 'noState'});
        setAttributeData(values)
    }

    const validType = (type) => {
        if (type == "String" || type == "Boolean" || type == "Number") {
            return true
        }
        else {
            return false
        }
    }

    const validTypeStyling = (type) => {
        if (validType(type)) {
            return "success"
        }
        else {
            return "dark"
        }
    }

    const validAttributeStyling = (type, isValid) => {
        if (validType(type) && isValid == "true") {
            return ["success", "success"]
        }
        else {
            return ["secondary", "transparent"]
        }
    }

    
    const reset = (e) => {
        setClassName('');
        setUserOrBundle('');
        setAttributeData([{name: '', type: 'Attribute Type', isValid: 'noState'}]);
        setResetWarning(false);
    }

    const createClass = (e, id) => {
        const currentClass = {id: '', name: '', userOrBundle: '', attributes: '', numAttributes: ''};
        const values = [...classData]
        // Create the class
        currentClass.id = id;
        currentClass.name = className;
        currentClass.userOrBundle = userOrBundle;
        currentClass.attributes = attributeData;
        currentClass.numAttributes = attributeData.length;
        values.push(currentClass);
        setClassData(values);
        id++;
        {reset()};
    }

    return (
        <>
            <CCallout color="primary" className="bg-title">
                <h4 className="title">Create an Attribute</h4>
            </CCallout>
                <h6 className="subtitle mb-3">Welcome to the Attribute editor. Here you can create a class with attributes. 
                Classes and attributes are used to describe your users and bundles. Add as many as you like!</h6>
            <CRow>
                <CCol sm="12" lg="6">
                    <CCard>
                        <CCardHeader>
                            Creator
                        </CCardHeader>
                        <CCardBody>
                            <CForm>
                                <CFormGroup row>
                                    <CCol md="6">
                                        <CLabel>Users or Bundles Class?</CLabel>
                                    </CCol>
                                    <CCol md="6">
                                        <div className="float-right">
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio1" name="inline-radios" value="Users" onChange={(e) => handleUserBundleChange(e)}/>
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio1"><CIcon name="cil-user"/> User</CLabel>
                                            </CFormGroup>
                                            <CFormGroup variant="custom-radio" inline>
                                                <CInputRadio custom id="inline-radio2" name="inline-radios" value="Bundles" onChange={(e) => handleUserBundleChange(e)}/>
                                                <CLabel variant="custom-checkbox" htmlFor="inline-radio2"><CIcon name="cil-notes"/> Bundle</CLabel>
                                            </CFormGroup>
                                        </div>
                                    </CCol>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel htmlFor="nf-class">Class Name</CLabel>
                                    <CInput
                                        name="class"
                                        type="text"
                                        placeholder="Enter Class.."
                                        autoComplete="class"
                                        value={className}
                                        onChange={(e) => handleClassChange(e)}
                                    />
                                    <CFormText className="help-block">Please enter a name for your Class</CFormText>
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
                                                    valid={attribute.isValid =="true"}
                                                    invalid={attribute.isValid =="false"}
                                                />
                                                <CDropdown className="input-group-append">
                                                    <CDropdownToggle caret color={validTypeStyling(attribute.type)}>
                                                        {attribute.type}
                                                    </CDropdownToggle>
                                                    <CDropdownMenu>
                                                        <CDropdownItem value={attribute.type.value} onClick={(e)=>handleType(e, index, "String")}>String</CDropdownItem>
                                                        <CDropdownItem value={attribute.type.value} onClick={(e)=>handleType(e, index, "Boolean")}>Boolean</CDropdownItem>
                                                        <CDropdownItem value={attribute.type.value} onClick={(e)=>handleType(e, index, "Number")}>Number</CDropdownItem>
                                                    </CDropdownMenu>
                                                </CDropdown>
                                                {' '}
                                                <CButton color="danger" onClick={() => handleRemove(index)}>
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
                            <CButton className="float-right" color="danger" onClick={() => {setResetWarning(true)}}><CIcon name="cil-ban" /> Reset</CButton>
                            <CButton className="float-right" color="dark" onClick={handleAdd}><CIcon name="cil-plus"/> Add Another Attribute</CButton>
                        </CCardBody>
                    </CCard>
                    <CModal show={resetWarning} onClose={()=>setResetWarning(false)} color="danger">
                        <CModalHeader closeButton>
                            <CModalTitle>Attention!</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            Are you sure you want to reset this class?
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="danger" onClick={reset}>Reset</CButton>
                            <CButton color="secondary" onClick={()=>setResetWarning(false)}>Cancel</CButton>
                        </CModalFooter>
                    </CModal>
                </CCol>

                <CCol sm="12" lg="6">
                    <CCard>
                        <CCardHeader>
                            Draft
                        </CCardHeader>
                        <CCardBody>
                            <CListGroup accent>
                                <CListGroupItem accent="primary">
                                    <div class="d-flex justify-content-between">
                                        <td>
                                            <strong>Class Name: </strong>{className}
                                        </td>
                                        <td>
                                            <strong>For: </strong>{userOrBundle}
                                        </td>
                                    </div>
                                </CListGroupItem>
                                    {attributeData.map((attribute, index) => {
                                        return (
                                            <CListGroupItem key={index} accent={validAttributeStyling(attribute.type, attribute.isValid)[0]} color={validAttributeStyling(attribute.type, attribute.isValid)[1]}>
                                                <div class="d-flex justify-content-between">
                                                    <td value={attribute.name.value}>
                                                        <strong>Attribute: </strong>{attribute.isValid == "false" ? "ERROR" : attribute.name}
                                                    </td>
                                                    <td value={attribute.type.value} >
                                                        <strong>Type: </strong>{attribute.type}
                                                    </td>
                                                </div>
                                            </CListGroupItem>
                                        )
                                    })}
                            </CListGroup>
                        </CCardBody>
                        <CCardFooter>
                            <CButton className="float-right" color="success" onClick={(e) => createClass(e, id)}><CIcon name="cil-scrubber" /> Confirm Class</CButton>
                        </CCardFooter>
                    </CCard>
                    <CModal show={attributeWarning} onClose={()=>setAttributeWarning(false)} color="danger">
                        <CModalHeader closeButton>
                            <CModalTitle>Attention!</CModalTitle>
                        </CModalHeader>
                        <CModalBody>
                            You need at least one attribute for your class. Please enter an 
                            attribute and try again!
                        </CModalBody>
                        <CModalFooter>
                            <CButton color="danger" onClick={()=>setAttributeWarning(false)}>OK</CButton>
                        </CModalFooter>
                    </CModal>
                </CCol>
            </CRow>

            <CRow>
                <CCol sm="12">
                    <CCard>
                        <CCardHeader>
                            Created Classes
                        </CCardHeader>
                        <CCardBody>
                            <CDataTable
                                fields={fields}
                                items={classData}
                                scopedSlots = {{
                                    'show':
                                        (item,index) => {
                                            return(
                                                <td className="py-2 bg-title">
                                                    <CIcon name="cil-plus"/>
                                                </td>
                                            )
                                        },
                                    'edit':
                                        (item, index) => {
                                            return (
                                                <td className="py-2 bg-title">
                                                    <CIcon name="cil-pencil"/>
                                                </td>
                                            )
                                        },
                                    'delete':
                                        (item, index) => {
                                            return (
                                                <td className="py-2 bg-title">
                                                    <CIcon name="cil-delete"/>
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