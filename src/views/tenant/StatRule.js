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
    CModal,
    CModalBody,
    CModalHeader,
    CModalFooter,
    CInput,
    CInvalidFeedback,
    CRow,
    CSelect
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { withRouter } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import CreatableSelect from 'react-select/creatable';
import './tenantviews.scss'

var common = require('../../common')

const StatRule = (props) => {

    const initRule = ["User Attributes", "==", []]
    const [userAttrNames, updateUserAttrNames] = useState(Object.freeze([]))
    const [ruleSnippet, updateRuleSnippet] = useState(initRule)

    const { oktaAuth, authState } = useOktaAuth();
    const bearer = "Bearer " + common.GetAccessToken(authState);
    const hdrs = {
        headers: {
            Authorization: bearer,
        },
    };

    fetch(common.api_href('/api/v1/tenant/' + props.match.params.id + '/get/allattrset'), hdrs)
        .then(response => response.json())
        .then(data => {
            var userAttrNames = []
            for (var i = 0; i < data.length; i++) {
                if (data[i].appliesTo == "Users") {
                    userAttrNames.push({ value: data[i].name, label: data[i].name })
                }
            }
            updateUserAttrNames(userAttrNames)
        })

    const handleOperator = (e) => {
        let rule = [...ruleSnippet]
        rule[1] = e.target.value
        updateRuleSnippet(rule)
    }

    const handleSelectedAttrs = (e) => {
        let values = e
        let rule = [...ruleSnippet]
        let selected = []
        for (let i = 0; i < values.length; i++) {
            selected.push(values[i].value)
        }
        rule[2] = selected
        updateRuleSnippet(rule)
    }

    return (
        <CCard className="roboto-font">
            <CCardHeader>
                Existing Stats Rule <CButton onClick={e => console.log(ruleSnippet)}>rule</CButton>
                <CButton
                    className="float-right"
                    color="primary"
                // onClick={triggerPolicyModal}
                >
                    <FontAwesomeIcon icon="bullseye" className="mr-1" />Generate Policy
                </CButton>
            </CCardHeader>
            <CCardBody className="roboto-font">
                <CRow>
                    <CCol sm="3">
                        <div>
                            User Attributes
                        </div>
                    </CCol>
                    <CCol sm="3">
                        <CSelect name="operator" custom value={ruleSnippet[1]} onChange={handleOperator}>
                            <option value="==">==</option>
                            <option value="!=">!=</option>
                        </CSelect>
                    </CCol>
                    <CCol sm="6">
                        <CreatableSelect
                            name="userAttrs"
                            options={userAttrNames}
                            isSearchable
                            isMulti
                            onChange={handleSelectedAttrs}
                        />
                    </CCol>
                </CRow>
            </CCardBody>
        </CCard>
    )
}

export default withRouter(StatRule)