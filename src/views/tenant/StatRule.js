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

    const [userAttrNames, updateUserAttrNames] = useState(Object.freeze([]))
    const [includedOrExcluded, updateIncludedOrExcluded] = useState("Included")
    const [selectedAttrs, updateSelectedAttrs] = useState(Object.freeze([]))

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

    const handlePermissionChange = (e) => {
        updateIncludedOrExcluded(e.target.value)
    }

    const handleSelectedAttrs = (e) => {
        updateSelectedAttrs(e)
    }

    return (
        <CCard className="roboto-font">
            <CCardHeader>
                Existing Stats Rule
                <CButton onClick={e => console.log(selectedAttrs)}>selected</CButton>
                <CButton
                    className="float-right"
                    color="primary"
                // onClick={triggerPolicyModal}
                >
                    <FontAwesomeIcon icon="bullseye" className="mr-1" />Generate Policy
                </CButton>
            </CCardHeader>
            <CCardBody>
                <CRow>
                    <CCol sm="3">
                        <CSelect name="includedOrExcluded" custom value={includedOrExcluded} onChange={handlePermissionChange}>
                            <option value="Included">Include</option>
                            <option value="Excluded">Exclude</option>
                        </CSelect>
                    </CCol>
                </CRow>
                <div className="mb-1 mt-5">User Attributes:</div>
                <CreatableSelect
                    name="userAttrs"
                    options={userAttrNames}
                    isSearchable
                    isMulti
                    onChange={handleSelectedAttrs}
                    value={selectedAttrs}
                />
            </CCardBody>
        </CCard>
    )
}

export default withRouter(StatRule)