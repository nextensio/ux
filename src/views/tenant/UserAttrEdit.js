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
    CInputGroup,
    CInputGroupPrepend,
    CInputGroupText,
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

const initAttrData = [
    "uid"
];

const UserAttrEdit = (props) => {
    const initUserData = Object.freeze({
    });
    const [userData, updateUserData] = useState(initUserData);
    const [attrData, updateAttrData] = useState(initAttrData);

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    useEffect(() => {
        getAttrs();
        if (typeof props.location.state != 'undefined') {
            updateUserData(props.location.state)
        }
    }, []);

    const getAttrs = () => {
        fetch(common.api_href('/api/v1/getallattrset/' + props.match.params.id), hdrs)
            .then(response => response.json())
            .then(data => {
                var fields = [];
                for (var i = 0; i < initAttrData.length; i++) {
                    fields.push(initAttrData[i]);
                }
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == 'Users') {
                        fields.push(data[i].name);
                    }
                }
                updateAttrData(fields);
            });
    }

    const handleChange = (e) => {
        updateUserData({
            ...userData,
            [e.target.name]: e.target.value.trim()
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        userData["tenant"] = props.match.params.id;
        console.log(userData);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: bearer },
            body: JSON.stringify(userData),
        };
        fetch(common.api_href('/api/v1/adduserattr'), requestOptions)
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
                    props.history.push('/tenant/' + props.match.params.id + '/userattr')
                }
            })
            .catch(error => {
                alert('Error contacting server', error);
            });
    };

    return (
        <CCard>
            <CCardHeader>
                <strong>Add User Properties</strong>
            </CCardHeader>
            <CCardBody>
                {attrData.map((attr, index) => {
                    if (attr == "uid") {
                        return (
                            <CFormGroup>
                                <CLabel htmlFor="nf-attribute">User Id</CLabel>
                                <CInput name="bid" placeholder={userData[attr]} onChange={handleChange} />
                            </CFormGroup>
                        );
                    } else {
                        return (
                            <CFormGroup>
                                <CLabel htmlFor="nf-attribute">{attr}</CLabel>
                                <CInput name={attr} placeholder={userData[attr]} onChange={handleChange} />
                            </CFormGroup>
                        )
                    }
                })}
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

export default withRouter(UserAttrEdit)