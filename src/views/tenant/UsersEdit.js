import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CForm,
    CFormText,
    CInput,
    CInputCheckbox,
    CInputGroup,
    CInputGroupAppend,
    CInputGroupPrepend,
    CInputGroupText,
    CRow,
    CLabel,
    CCardHeader,
    CFormGroup,
    CCardFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

var common = require('../../common')

const UsersEdit = (props) => {
    const [userState, updateUserState] = useState("");
    const [userAttrState, updateUserAttrState] = useState("");
    const [attrData, updateAttrData] = useState(Object.freeze([]));

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        if (typeof props.location.state != 'undefined') {
            updateUserState(props.location.state)
        }
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

    useEffect(() => {
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/alluserattr'), hdrs)
            .then(response => response.json())
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].uid == userState.uid) {
                        // remove email, gateway, pod from userAttrState
                        // ...rest is all the user attributes
                        var {uid, _email, _gateway, _pod, ...rest} = data[i]
                        updateUserAttrState({uid, ...rest})
                    }
                }
            })
    }, [props, userState]);
   
    const handleUserChange = (e) => {
        updateUserState({
            ...userState,
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
        updateUserAttrState({
            ...userAttrState,
            [e.target.name]: input
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify({uid: userState.uid, name: userState.name}),
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
                   handleAttrSubmit(e)
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    // user attribute http post function
    const handleAttrSubmit = (e) => {
        Object.keys(userAttrState).forEach(key => {
            if (userAttrState[key].length == 0) {
                userAttrState[key] = null
            }
        })
        e.preventDefault()
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(userAttrState),
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
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Edit Details for {userState.uid}</strong>
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
                                    <CInput name="uid" value={userState.uid} readOnly/>
                                    <CInputGroupAppend>
                                        <CInputGroupText>
                                            <CIcon name="cil-lock-locked"/>
                                        </CInputGroupText>
                                    </CInputGroupAppend>
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
                                    <CInput name="name" defaultValue={userState.name} onChange={handleUserChange} />
                                </CInputGroup>
                            </CFormGroup>
                        </CForm>
                        <div className="title py-3">Attributes</div>
                        {attrData.map(attr => {
                            return (
                                <CForm>
                                    <CFormGroup>
                                        <CLabel>{attr}</CLabel>
                                        <CInputGroup>
                                            <CInput name={attr} defaultValue={userAttrState[attr]} value={userAttrState[attr]} onChange={handleAttrChange} />
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
                    <strong>{" "}Confirm</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(UsersEdit)