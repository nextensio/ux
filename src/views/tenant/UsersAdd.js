import React, { lazy, useState, useEffect } from 'react'
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
    CInputCheckbox,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CInputRadio,
    CInvalidFeedback,
    CModal,
    CModalBody,
    CModalHeader,
    CModalFooter,
    CRow,
    CLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../common')

const UsersAdd = (props) => {
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

    // If the uid is not in email form, trigger this warning.
    const [invalidFormState, setInvalidFormState] = useState(false);

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
   
    const handleUserChange = (e) => {
        updateUserData({
            ...userData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleAttrChange = (e) => {
        let input 
        if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',').map(item => item.trim());
            updateUserAttrData({
                ...userAttrData,
                [e.target.name]: [input]
            })
        }
        else {
            input = e.target.value.trim().toString()
            updateUserAttrData({
                ...userAttrData,
                [e.target.name]: input
            })
        }
       
    }

    const handleAttrDateChange = (e) => {
        let input
        input = e.target.value.split('-')
        updateUserAttrData({
            ...userAttrData,
            [e.target.name]: [input]
        })
    }

    function checkErrObj() {
        if (Object.keys(errObj).length === 0) {
            return true
        } else {
            return false
        }
    }

    function validate() {
        var funcErrObj = {}
        var emailReg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailReg.test(String(userData.uid).toLowerCase())) {
            funcErrObj.uid = true
        }
        updateErrObj(funcErrObj)
        setTimeout(checkErrObj, 0)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) {
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
        if (Object.keys(userAttrData).length > 1) {
            e.preventDefault()
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: bearer },
                body: JSON.stringify(userAttrData),
            };
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
            } else {
                props.history.push('/tenant/' + props.match.params.id + '/users')
            }

    };

    return (
        <>
            <CCard>
                <CCardHeader>
                    <strong>Add User</strong>
                    <CButton onClick={() => {console.log(errObj)}}>LOG</CButton>
                    <CButton onClick={() => {console.log(userAttrData)}}>LOG</CButton>
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
                                        <CInput name="uid" placeholder={userData.uid} onChange={e => {handleUserChange(e); handleAttrChange(e)}} invalid={invalidFormState}/>
                                        <CInvalidFeedback visible={invalidFormState}>Please enter a valid email!</CInvalidFeedback>
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
                                        <CInput name="name" placeholder={userData.name} onChange={handleUserChange} />
                                    </CInputGroup>
                                </CFormGroup>
                            </CForm>
                            <div className="title py-3">Attributes</div>
                            {attrData.map(attr => {
                                return (
                                    <CForm>
                                        {attr.type == "String" && 
                                            <CFormGroup>
                                                <CLabel htmlFor="nf-password">{attr.name}</CLabel>
                                                <CInputGroup>
                                                    <CInput name={attr.name} placeholder={attr.name} onChange={handleAttrChange} />
                                                </CInputGroup>
                                                <CFormText>Use commas to delimit multiple values.</CFormText>
                                            </CFormGroup>
                                        }
                                        {attr.type == "Boolean" &&
                                            <>
                                                <div>
                                                    <CLabel>{attr.name}</CLabel>
                                                </div>
                                                <div className="mb-3">
                                                    <CFormGroup variant="custom-radio" inline>
                                                        <CInputRadio custom id="inline-radio1" name={attr.name} value={true} onChange={handleAttrChange} />
                                                        <CLabel variant="custom-checkbox" htmlFor="inline-radio1">True</CLabel>
                                                    </CFormGroup>
                                                    <CFormGroup variant="custom-radio" inline>
                                                        <CInputRadio custom id="inline-radio2" name={attr.name} value={false} onChange={handleAttrChange} />
                                                        <CLabel variant="custom-checkbox" htmlFor="inline-radio2">False</CLabel>
                                                    </CFormGroup>
                                                </div>
                                            </>
                                        }
                                        {attr.type == "Date" &&
                                            <CFormGroup>
                                                <CLabel>{attr.name}</CLabel>
                                                <CInputGroup>
                                                    <CInput type="date" id="date-input" name={attr.name} placeholder={attr.name} onChange={handleAttrDateChange} />
                                                </CInputGroup>
                                            </CFormGroup>
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