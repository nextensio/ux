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
    CLabel,
    CListGroup,
    CListGroupItem,
    CInput,
    CInvalidFeedback,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CRow,
    CSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CreatableSelect from 'react-select/creatable';
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import './tenantviews.scss'

var common = require('../../common')

const TracingRule = (props) => {
    const [userAttrs, updateUserAttrs] = useState(Object.freeze([]))

    const [deleteModal, setDeleteModal] = useState(false)
    const initRuleData = Object.freeze({
        rule: []
    })
    const [ruleData, updateRuleData] = useState(initRuleData)

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
                var userAttrs = []
                for (var i = 0; i < data.length; i++) {
                    if (data[i].appliesTo == "Users") {
                        userAttrs.push({ label: data[i].name, value: data[i].name })
                    }
                }
                updateUserAttrs(userAttrs)
            })
    }, [])


    const resetRuleData = (e) => {
        setDeleteModal(!deleteModal)
        updateRuleData({
            ...initRuleData,
        })
    }

    const handleSubmit = (e) => {
        // const requestOptions = {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json', Authorization: bearer },
        //     body: JSON.stringify({
        //         host: ruleData.host, rid: ruleData.rid,
        //         rule: ruleData.rule,
        //     }),
        // };
        // fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/add/hostrule/'), requestOptions)
        //     .then(async response => {
        //         const data = await response.json();
        //         if (!response.ok) {
        //             // get error message from body or default to response status
        //             alert(error);
        //             const error = (data && data.message) || response.status;
        //             return Promise.reject(error);
        //         }
        //         // check for error response
        //         if (data["Result"] != "ok") {
        //             alert(data["Result"])
        //         } else {
        //             // bundle attribute http post must be run after bundle http post
        //             props.history.push('/tenant/' + props.match.params.id + '/hosts')
        //         }
        //     })
        //     .catch(error => {
        //         alert('Error contacting server', error);
        //     });
    }

    return (
        <CCard>
            <CCardHeader>
                Rule Generator for Tracing Users
            </CCardHeader>
            <CCardBody className="roboto-font">
                <CRow>
                    <CCol sm="12">
                        <CCard className="border-0">
                            <CCardBody>
                                <CRow>
                                    <CCol sm="12">
                                        <CLabel>Assign the User Attributes to perform tracing on.</CLabel>
                                    </CCol>
                                </CRow>
                                <CRow className="mb-3">
                                    <CCol sm="4">
                                        <CreatableSelect
                                            name="uid"
                                            options={userAttrs}
                                            isSearchable
                                            isMulti
                                        />
                                    </CCol>
                                </CRow>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CCardBody>
            <CCardFooter>
                <CRow className="mt-3">
                    <CCol sm="3">
                        <CButton block shape="square" variant="outline" onClick={e => setDeleteModal(!deleteModal)} color="danger"><CIcon name="cil-ban" /> <strong>Reset</strong></CButton>
                    </CCol>
                    <CCol sm="3">
                        <CButton block shape="square" variant="outline" onClick={handleSubmit} color="success"><CIcon name="cil-arrow-right" /> <strong>Create Rule</strong></CButton>
                    </CCol>
                </CRow>
            </CCardFooter>
            <CModal show={deleteModal} onClose={() => setDeleteModal(!deleteModal)}>
                <CModalHeader className='bg-danger text-white py-n5' closeButton>
                    <strong>Confirm Reset</strong>
                </CModalHeader>
                <CModalBody className='text-lg-left'>
                    <strong>Are you sure you want to reset this rule?</strong>
                </CModalBody>
                <CModalFooter>
                    <CButton
                        color="danger"
                        onClick={resetRuleData}
                    >Confirm</CButton>
                    <CButton
                        color="secondary"
                        onClick={() => setDeleteModal(!deleteModal)}
                    >Cancel</CButton>
                </CModalFooter>
            </CModal>
        </CCard >
    )
}

export default withRouter(TracingRule)