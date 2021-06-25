import React, { lazy, useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CForm,
    CFormText,
    CInput,
    CInputRadio,
    CInputGroup,
    CInputGroupAppend,
    CInputGroupPrepend,
    CInputGroupText,
    CRow,
    CLabel,
    CCardHeader,
    CFormGroup,
    CCardFooter,
    CPopover,
    CInvalidFeedback,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

var common = require('../../common')

const UsersEdit = (props) => {
    // Change maxCharLength to whatever you want for maximum length of input fields.
    const maxCharLength = 20
    const [userState, updateUserState] = useState("");
    const [userAttrState, updateUserAttrState] = useState("");
    const [attrData, updateAttrData] = useState(Object.freeze([]));
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
            updateUserState(props.location.state)
        }
        fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
            .then(response => response.json())
            .then(data => {
                var fields = [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == 'Users') {
                        fields.push(data[i]);
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

    const toAttributeEditor = (e) => {
        props.history.push('/tenant/' + props.match.params.id + '/attreditor')
    }
   
    const handleUserChange = (e) => {
        updateUserState({
            ...userState,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleAttrChange = (e) => {
        let input
        let targetLen = e.target.value.length
        // if maxCharLength is reached trigger error Obj and message.
        if (targetLen === maxCharLength) {
            updateErrObj({
                ...errObj,
                [e.target.name]: true
            })
        } 
        if (targetLen < maxCharLength && errObj[e.target.name]) {
            delete errObj[e.target.name]
        }
        if (e.target.value.indexOf(',') > -1) {
            input = e.target.value.split(',')
            updateUserAttrState({
                ...userAttrState,
                [e.target.name]: [input]
            });
        }
        else {
            input = e.target.value.trim().toString()
            updateUserAttrState({
                ...userAttrState,
                [e.target.name]: input
            });
        }
    };

    function validate() {
        let errs = {}
        if (!/\S/.test(userState.name)) {
            errs.name = true
        }
        updateErrObj(errs)
        return errs
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        let errs = validate()
        if (Object.keys(errs).length !== 0) {
            return
        }
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
                <CButton onClick={() => console.log(userState)}>LOG</CButton>
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
                                    <CInput name="name" defaultValue={userState.name} onChange={handleUserChange} invalid={errObj.name}/>
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
                            var attribute = attr.name
                            return (
                                <CForm>
                                    {attr.type == "String" &&
                                        <CFormGroup>
                                            <CPopover 
                                                title="Popover title"
                                                content="If attribute is expected to have multiple values, use commas to delimit."
                                            >
                                                <FontAwesomeIcon icon="info-circle"/>
                                            </CPopover>
                                            {' '}<CLabel>{attribute}</CLabel>
                                            <CInput name={attribute} defaultValue={userAttrState[attribute]} onChange={handleAttrChange} maxLength={maxCharLength} invalid={errObj[attr.name]}/>
                                            {errObj[attr.name] ?
                                                <CInvalidFeedback>Max character length reached.</CInvalidFeedback> :
                                                <CFormText>Enter attribute value(s).</CFormText> 
                                            }
                                        </CFormGroup>
                                    }
                                    {attr.type == "Boolean" &&
                                        <>
                                            <div>
                                                <CLabel>{attribute}</CLabel>
                                            </div>
                                            <div className="mb-3">
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio1" name={attribute} value={true} checked={userAttrState[attribute] == 'true'} onChange={handleAttrChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio1">True</CLabel>
                                                </CFormGroup>
                                                <CFormGroup variant="custom-radio" inline>
                                                    <CInputRadio custom id="inline-radio2" name={attribute} value={false} checked={userAttrState[attribute] == 'false'} onChange={handleAttrChange} />
                                                    <CLabel variant="custom-checkbox" htmlFor="inline-radio2">False</CLabel>
                                                </CFormGroup>
                                            </div>
                                        </>
                                    }
                                    {attr.type == "Date" &&
                                        <CFormGroup>
                                            <CLabel>{attribute}</CLabel>
                                            <CInputGroup>
                                                <CInput type="date" id="date-input" name={attribute} defaultValue={userAttrState[attribute]} onChange={handleAttrChange} />
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
                    <strong>{" "}Confirm</strong>
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default withRouter(UsersEdit)