import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardGroup,
    CCol,
    CContainer,
    CForm,
    CInput,
    CInputCheckbox,
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
    CInvalidFeedback,
    CRow,
    CLabel,
    CCardHeader,
    CFormGroup,
    CFormText,
    CCardFooter
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
    const [attrData, updateAttrData] = useState(Object.freeze([]));
    const [invalidFormState, setInvalidFormState] = useState(false);


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
            .then(data => {
                var fields = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == 'Users') {
                        fields.push(data[i].name);
                    }
                }
                fields.sort()
                updateAttrData(fields);
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
            input = e.target.value.split(',')
        }
        else {
            input = e.target.value.trim().toString()
        }
        updateUserAttrData({
            ...userAttrData,
            [e.target.name]: input
        });
    };

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validateEmail(userData.uid)) {
            setInvalidFormState(true)
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
        <CCard>
            <CCardHeader>
                <strong>Add User</strong>
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
                                    <CInput name="name" placeholder={userData.name} onChange={handleUserChange} />
                                </CInputGroup>
                            </CFormGroup>
                        </CForm>
                        <div className="title py-3">Attributes</div>
                        {attrData.map(attr => {
                            return (
                                <CForm>
                                    <CFormGroup>
                                        <CLabel htmlFor="nf-password">{attr}</CLabel>
                                        <CInputGroup>
                                            <CInput name={attr} placeholder={attr} onChange={handleAttrChange} />
                                        </CInputGroup>
                                        <CFormText>Use commas to delimit multiple values.</CFormText>
                                    </CFormGroup>
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
    )
}

export default withRouter(UsersAdd)