import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCardFooter,
    CCol,
    CForm,
    CFormGroup,
    CFormText,
    CInput,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CInvalidFeedback,
    CModal,
    CModalBody,
    CModalHeader,
    CModalFooter,
    CPopover,
    CRow,
    CSelect,
    CLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

var common = require('../../common')

const UsersAdd = (props) => {
    // Change maxCharLength to whatever you want for maximum length of input fields.
    const maxCharLength = 20
    const initUserData = Object.freeze({
        uid: "",
        name: ""
    });
    const initUserAttrData = Object.freeze({
        uid: ""
    });
    const [userData, updateUserData] = useState(initUserData);
    const [userAttrData, updateUserAttrData] = useState(initUserAttrData);

    // Object that has existing uid as key vals
    const [existingUidData, updateExistingUidData] = useState("");
    const [attrData, updateAttrData] = useState(Object.freeze([]));


    // If the uid already exists in tenant db, ask if the tenant 
    // wants to overwrite the existing entry
    const [overwriteModal, setOverwriteModal] = useState(false);
    const [overwriteUid, setOverwriteUid] = useState("");
    const [errObj, updateErrObj] = useState({})

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateExistingUidData(props.location.state)
        }
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                var dataObjs = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == 'Users') {
                        dataObjs.push(data[i]);
                    }
                }
                updateAttrData(dataObjs);
            });
    }, []);
    
    const toAttributeEditor = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/attreditor')
    }

    const handleUserChange = (e) => {
        updateUserData({
            ...userData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleLengthCheck = (e) => {
        // length check to ensure bad guy does not send a massive string to DB
        let targetLen = e.target.value.length
        let attrName = e.target.name
        // if maxLength is reached trigger error Obj and message.
        if (targetLen === maxCharLength) {
            updateErrObj({
                ...errObj,
                [attrName + "Length"]: true
            })
        } 
        if (targetLen < maxCharLength && errObj[attrName + "Length"]) {
            delete errObj[attrName + "Length"]
        }
    }

    const handleAttrChange = (e) => {
        let input 
        handleLengthCheck(e)
        input = e.target.value.trim()
        updateUserAttrData({
            ...userAttrData,
            [e.target.name]: input
        })
    }

    const handleMultiStringAttrChange = (e) => {
        let input
        handleLengthCheck(e)
        // Check if input contains comma, if so separate the values
        if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => item.trim());
        } else {
            input = e.target.value.trim()
        }
        updateUserAttrData({
            ...userAttrData,
            [e.target.name]: [input]
        })
    }

    const handleSingleNumberAttrChange = (e) => {
        let input = parseInt(e.target.value)
        handleLengthCheck(e)
        updateUserAttrData({
            ...userAttrData,
            [e.target.name]: input
        })

    }
    const handleMultiNumberAttrChange = (e) => {
        let input
        var intRegex = /^[-+]?\d+$/
        const attrName = e.target.name
        if (e.target.value.trim() === "") {
            input = 0
        }
        // Check if input contains comma, if so separate the values
        else if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => {
                if (intRegex.test(item.trim())) {
                    return parseInt(item.trim())
                } else {
                    // ERR! will be a keyword string used in the validation function
                    return "ERR!"
                }
            })
        } else {
            if (intRegex.test(e.target.value.trim())) {
                input = parseInt(e.target.value.trim())
            } else {
                // ERR! will be a keyword string used in the validation function
                input = "ERR!"
            }
        }
        updateUserAttrData({
            ...userAttrData,
            [attrName]: [input]
        })
    }

    const handleSingleBoolAttrChange = (e) => {
        let input
        if (e.target.value === "true") {
            input = true
        } else if (e.target.value === "false") {
            input = false
        }
        updateUserAttrData({
            ...userAttrData,
            [e.target.name]: input
        })
    }

    const handleMultiBoolAttrChange = (e) => {
        let input
        if (e.target.value.trim() === "") {
            input = false
            // Check if input contains comma, if so separate the values
        } else if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => {
                if (item.trim().toLowerCase() === "true") {
                    return true
                } else if (item.trim().toLowerCase() === "false") {
                    return false
                } else {
                    // ERR! will be a keyword string used in the validation function
                    return "ERR!"
                }
            })
        } else {
            if (e.target.value.trim().toLowerCase() === "true") {
                input = true
            } else if (e.target.value.trim().toLowerCase() === "false") {
                input = false
            } else {
                // ERR! will be a keyword string used in the validation function
                input = "ERR!"
            }
        }
        updateUserAttrData({
            ...userAttrData,
            [e.target.name]: [input]
        })
    }

    const handleSingleDateAttrChange = (e) => {
        let input 
        // convert to Epoch GMT
        input = new Date(e.target.value).getTime() / 1000
        updateUserAttrData({
            ...userAttrData,
            [e.target.name]: input
        })
    }
    const handleMultiDateAttrChange = (e) => {
        let input
        // Regex for YYYY-MM-DD format
        const dateRe = /^\d{4}-\d{2}-\d{2}$/;
        if (e.target.value.trim() === "") {
            input = ""
        // Check if input contains comma, if so separate the values
        } else if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => {
                // convert to Epoch GMT
                if (dateRe.test(item.trim())) {
                    return new Date(item.trim()).getTime() / 1000
                } else {
                    // ERR! will be a keyword string used in the validation function
                    return "ERR!"
                }
            })
        } else {
            if (dateRe.test(e.target.value.trim())) {
                input = new Date(e.target.value.trim()).getTime() / 1000
            } else {
                input = "ERR!"
            }
        }
        updateUserAttrData({
            ...userAttrData,
            [e.target.name]: [input]
        })
    }

    function fillEmptyInputs() {
        let attrState = {...userAttrData}
        attrData.forEach((item) => { 
            if (!(item.name in attrState)) { 
                if (item.isArray == "true") {
                    if (item.type == "String" || item.type == "Date") {
                        attrState[item.name] = [""]
                    } 
                    if (item.type == "Number") {
                        attrState[item.name] = [0]
                    }
                    if (item.type == "Boolean") {
                        attrState[item.name] = [false]
                    }
                }
                if (item.isArray == "false") {
                    if (item.type == "String" || item.type == "Date") {
                        attrState[item.name] = ""
                    } 
                    if (item.type == "Number") {
                        attrState[item.name] = 0
                    }
                    if (item.type == "Boolean") {
                        attrState[item.name] = false
                    }
                }
            }
        })
        updateUserAttrData(attrState)
        return attrState
    }

    function validate(attrState) {
        let errs = {}
        const emailRe = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRe.test(String(userData.uid).toLowerCase())){
            errs.uid = true
        }
        if (!/\S/.test(userData.name)) {
            errs.name = true
        } 
        attrData.forEach((item) => { 
            if (item.isArray == "true" && JSON.stringify(attrState[item.name]).includes("ERR!")) {
                errs[item.name] = true
            }
        })
        
        updateErrObj(errs)
        return errs
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        let attrState = fillEmptyInputs()
        let errs = validate(attrState)
        if (Object.keys(errs).length != 0) {
            return
        }
        if (userData.uid in existingUidData && overwriteModal == false) {
            setOverwriteModal(true)
            setOverwriteUid(userData.uid)
            return
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({uid: userData.uid, name: userData.name}),
        };
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/user'), requestOptions)
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
                // user attribute http post must be run after user http post
                    handleAttrSubmit(e)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    // user attribute http post function
    const handleAttrSubmit = (e) => {
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(userAttrData),
        };
        console.log(userAttrData)
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/userattr'), requestOptions)
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
                }
                else {
                    props.history.push('/tenant/' + props.match.params.id + '/users')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            })

    };

    return (
        <>
            <CCard>
                <CCardHeader>
                    <strong>Add User</strong>
                    <CButton onClick={() => {console.log(userAttrData)}}>userAttrData</CButton>
                    <CButton onClick={() => {console.log(errObj)}}>ERR</CButton>
                    <CButton onClick={() => console.log(attrData)}>attrData</CButton>
                    <CButton onClick={fillEmptyInputs}>Function</CButton>
                </CCardHeader>
                <CCardBody className="roboto-font">
                    <CRow>
                        <CCol sm="8">
                            <CForm>
                                <CFormGroup>
                                    <CLabel>User ID</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-user"/>
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput name="uid" placeholder={userData.uid} onChange={e => {handleUserChange(e); handleAttrChange(e)}} invalid={errObj.uid}/>
                                        <CInvalidFeedback>Please enter a valid email!</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                                <CFormGroup>
                                    <CLabel>Name</CLabel>
                                    <CInputGroup>
                                        <CInputGroupPrepend>
                                            <CInputGroupText className="bg-primary-light text-primary">
                                                <CIcon name="cil-tag"/>
                                            </CInputGroupText>
                                        </CInputGroupPrepend>
                                        <CInput name="name" placeholder={userData.name} onChange={handleUserChange} invalid={errObj.name}/>
                                        <CInvalidFeedback>Please enter a value.</CInvalidFeedback>
                                    </CInputGroup>
                                </CFormGroup>
                            </CForm>
                            <div className="title py-3">Attributes</div>
                            {attrData.length === 0 &&
                                <div><FontAwesomeIcon icon="info-circle" className="text-info"/>{' '}
                                You have no attributes for AppGroups. <a className="text-primary" onClick={toAttributeEditor}>Click here</a> to add an attribute.
                                </div>
                            }
                            {attrData.map(attr => {
                                return (
                                    <CForm>
                                        {attr.type == "String" && 
                                            <>
                                                {attr.isArray == "true" ?
                                                    <CFormGroup>
                                                        <CPopover 
                                                            title="Popover title"
                                                            content="This attribute has been defined as string type and accepts multiple values."
                                                        >
                                                            <FontAwesomeIcon icon="info-circle"/>
                                                        </CPopover>
                                                        {' '}<CLabel>{attr.name}</CLabel>
                                                        <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleMultiStringAttrChange} maxLength={maxCharLength} invalid={errObj[attr.name + "Length"]}/>
                                                        {errObj[attr.name + "Length"] ?
                                                            <CInvalidFeedback>Max character length reached.</CInvalidFeedback> :
                                                            <CFormText>Enter attribute values. Use commas to delimit.</CFormText> 
                                                        }
                                                    </CFormGroup>
                                                :
                                                    <CFormGroup>
                                                        <CPopover 
                                                            title="Popover title"
                                                            content="This attribute has been defined as string type and accepts a single value."
                                                        >
                                                            <FontAwesomeIcon icon="info-circle"/>
                                                        </CPopover>
                                                        {' '}<CLabel>{attr.name}</CLabel>
                                                        <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleAttrChange} maxLength={maxCharLength} invalid={errObj[attr.name + "Length"]}/>
                                                        {errObj[attr.name + "Length"] ?
                                                            <CInvalidFeedback>Max character length reached.</CInvalidFeedback> :
                                                            <CFormText>Enter attribute value.</CFormText> 
                                                        }
                                                    </CFormGroup>
                                                }
                                            </>
                                        }
                                        {attr.type == "Number" && 
                                            <>
                                                {attr.isArray == "true" ?
                                                    <CFormGroup>
                                                        <CPopover 
                                                            title="Popover title"
                                                            content="This attribute has been defined as number type and accepts multiple values."
                                                        >
                                                            <FontAwesomeIcon icon="info-circle"/>
                                                        </CPopover>
                                                        {' '}<CLabel>{attr.name}</CLabel>
                                                        <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleMultiNumberAttrChange} invalid={errObj[attr.name]}/>
                                                        {errObj[attr.name] ?
                                                            <CInvalidFeedback>This attribute is designated for integers. Do not leave hanging commas.</CInvalidFeedback> :
                                                            <CFormText>Enter attribute values. Use commas to delimit.</CFormText> 
                                                        }
                                                    </CFormGroup>
                                                :
                                                    <CFormGroup>
                                                        <CPopover 
                                                            title="Popover title"
                                                            content="This attribute has been defined as number type and accepts a single value."
                                                        >
                                                            <FontAwesomeIcon icon="info-circle"/>
                                                        </CPopover>
                                                        {' '}<CLabel>{attr.name}</CLabel>
                                                        <CInput type="number" name={attr.name} placeholder={attr.name} onChange={handleSingleNumberAttrChange}/>
                                                        <CFormText>Enter attribute value.</CFormText> 
                                                    </CFormGroup>
                                                }
                                            </>
                                        }
                                        {attr.type == "Boolean" &&
                                            <>
                                                {attr.isArray == "true" ?
                                                    <CFormGroup>
                                                        <CPopover 
                                                            title="Popover title"
                                                            content="This attribute has been defined as boolean type and accepts multiple values."
                                                        >
                                                            <FontAwesomeIcon icon="info-circle"/>
                                                        </CPopover>
                                                        {' '}<CLabel>{attr.name}</CLabel>
                                                        <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleMultiBoolAttrChange} invalid={errObj[attr.name]}/>
                                                        {errObj[attr.name] ?
                                                            <CInvalidFeedback>This attribute is designated for booleans. Do not leave hanging commas.</CInvalidFeedback> :
                                                            <CFormText>Enter attribute values. Use commas to delimit.</CFormText> 
                                                        }
                                                    </CFormGroup>
                                                :
                                                    <CFormGroup>
                                                        <CLabel>{attr.name}</CLabel>
                                                        <CSelect name={attr.name} custom onChange={handleSingleBoolAttrChange}>
                                                            <option value={undefined}>Please select a boolean</option>
                                                            <option value={true}>True</option>
                                                            <option value={false}>False</option>
                                                        </CSelect>
                                                    </CFormGroup>
                                                }
                                            </>
                                        }
                                        {attr.type == "Date" &&
                                            <>
                                            {attr.isArray == "true" ?
                                                <CFormGroup>
                                                    <CPopover 
                                                        title="Popover title"
                                                        content="This attribute has been defined as date type and accepts multiple values."
                                                    >
                                                        <FontAwesomeIcon icon="info-circle"/>
                                                    </CPopover>
                                                    {' '}<CLabel>{attr.name}</CLabel>
                                                    <CInput type="text" name={attr.name} placeholder={attr.name} onChange={handleMultiDateAttrChange} invalid={errObj[attr.name]}/>
                                                    {errObj[attr.name] ?
                                                        <CInvalidFeedback>Please enter your format as YYYY-MM-DD. Do not leave hanging commas.</CInvalidFeedback> :
                                                        <CFormText>Enter attribute values. Use commas to delimit.</CFormText> 
                                                    }
                                                </CFormGroup>
                                            :
                                                <CFormGroup>
                                                    <CLabel>{attr.name}</CLabel>
                                                    <CInputGroup>
                                                        <CInput type="date" id="date-input" name={attr.name} placeholder={attr.name} onChange={handleSingleDateAttrChange} />
                                                    </CInputGroup>
                                                </CFormGroup>
                                            }
                                            </>
                                        }
                                    </CForm>
                                )
                            })}
                        </CCol>
                    </CRow>
                </CCardBody>
                <CCardFooter>
                    <CButton className="button-footer-success" color="success" variant="outline" onClick={handleSubmit}>
                        <CIcon name="cil-scrubber" />
                        <strong>{" "}Add</strong>
                    </CButton>
                </CCardFooter>
            </CCard>
            <CModal show={overwriteModal} onClose={() => setOverwriteModal(!overwriteModal)}>
                <CModalHeader className='bg-danger text-white py-n5' closeButton>
                    <strong>Are you sure you want to overwrite?</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    <strong>{overwriteUid} already exists in your user collection. Submitting will overwrite the entry.
                        Do you wish to proceed?
                    </strong>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="danger"
                        onClick={handleSubmit}
                    >Confirm</CButton>
                    <CButton
                        color="secondary"
                        onClick={() => setOverwriteModal(!overwriteModal)}
                    >Cancel</CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default withRouter(UsersAdd)
