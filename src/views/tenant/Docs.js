import React, { useState, useEffect } from 'react'
import {
    CBadge,
    CButton,
    CCallout,
    CCard,
    CCardBody,
    CCol,
    CListGroup,
    CListGroupItem,
    CTabContent,
    CTabPane,
    CRow,
} from '@coreui/react'
import { withRouter } from 'react-router-dom';
import './tenantviews.scss'

const Docs = (props) => {
    const [activeTab, setActiveTab] = useState("Getting Started")

    useEffect(() => {
        if (JSON.stringify(props.location.state) != 'null') {
            setActiveTab(props.location.state)
        }
    }, []);
    
    return (
        <>
            <CCallout color="primary">
                <h4 className="title">Documentation</h4>
                <CButton onClick={() => console.log(typeof JSON.stringify(props.location.state))}>propsState</CButton>
            </CCallout>
            <CRow>
                <CCol md="3">    
                    <CListGroup id="list-tab" role="tablist">
                        <CListGroupItem onClick={() => setActiveTab("Getting Started")} action active={activeTab === "Getting Started"} >Getting Started</CListGroupItem>
                        <CListGroupItem onClick={() => setActiveTab("Cluster Configuration")} action active={activeTab === "Cluster Configuration"} >Cluster Config</CListGroupItem>
                        <CListGroupItem onClick={() => setActiveTab("Images")} action active={activeTab === "Images"} >Images</CListGroupItem>
                        <CListGroupItem onClick={() => setActiveTab("Users")} action active={activeTab === "Users"} >Users</CListGroupItem>
                        <CListGroupItem onClick={() => setActiveTab("Bundles")} action active={activeTab === "Bundles"} >Bundles</CListGroupItem>
                        <CListGroupItem onClick={() => setActiveTab("Hosts")} action active={activeTab === "Hosts"} >Hosts</CListGroupItem>
                        <CListGroupItem onClick={() => setActiveTab("Attributes")} action active={activeTab === "Attributes"} >Attributes</CListGroupItem>
                        <CListGroupItem onClick={() => setActiveTab("Policies")} action active={activeTab === "Policies"} >Policies</CListGroupItem>
                    </CListGroup>
                </CCol>
                <CCol md="9">
                    <CCard>
                        <CCardBody>
                            <CRow>
                                <CCol xs="8">
                                    <CTabContent>
                                        <CTabPane active={activeTab === "Getting Started"} >
                                            <p>Velit aute mollit ipsum ad dolor consectetur nulla officia culpa adipisicing exercitation fugiat tempor. Voluptate deserunt sit sunt
                                            nisi aliqua fugiat proident ea ut. Mollit voluptate reprehenderit occaecat nisi ad non minim
                                            tempor sunt voluptate consectetur exercitation id ut nulla. Ea et fugiat aliquip nostrud sunt incididunt consectetur culpa aliquip
                                            eiusmod dolor. Anim ad Lorem aliqua in cupidatat nisi enim eu nostrud do aliquip veniam minim.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Cluster Configuration"}>
                                            <p>Cupidatat quis ad sint excepteur laborum in esse qui. Et excepteur consectetur ex nisi eu do cillum ad laborum. Mollit et eu officia
                                            dolore sunt Lorem culpa qui commodo velit ex amet id ex. Officia anim incididunt laboris deserunt
                                            anim aute dolor incididunt veniam aute dolore do exercitation. Dolor nisi culpa ex ad irure in elit eu dolore. Ad laboris ipsum
                                            reprehenderit irure non commodo enim culpa commodo veniam incididunt veniam ad.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Images"}>
                                            <p>Cupidatat quis ad sint excepteur laborum in esse qui. Et excepteur consectetur ex nisi eu do cillum ad laborum. Mollit et eu officia
                                            dolore sunt Lorem culpa qui commodo velit ex amet id ex. Officia anim incididunt laboris deserunt
                                            anim aute dolor incididunt veniam aute dolore do exercitation. Dolor nisi culpa ex ad irure in elit eu dolore. Ad laboris ipsum
                                            reprehenderit irure non commodo enim culpa commodo veniam incididunt veniam ad.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Users"}>
                                            <p>Ut ut do pariatur aliquip aliqua aliquip exercitation do nostrud commodo reprehenderit aute ipsum voluptate. Irure Lorem et laboris
                                            nostrud amet cupidatat cupidatat anim do ut velit mollit consequat enim tempor. Consectetur
                                            est minim nostrud nostrud consectetur irure labore voluptate irure. Ipsum id Lorem sit sint voluptate est pariatur eu ad cupidatat et
                                            deserunt culpa sit eiusmod deserunt. Consectetur et fugiat anim do eiusmod aliquip nulla
                                            laborum elit adipisicing pariatur cillum.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Bundles"}>
                                            <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                            sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                            aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                            nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                                            eiusmod eu pariatur culpa mollit in irure.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Hosts"}>
                                            <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                            sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                            aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                            nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                                            eiusmod eu pariatur culpa mollit in irure.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Attributes"}>
                                            <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                            sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                            aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                            nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                                            eiusmod eu pariatur culpa mollit in irure.</p>
                                        </CTabPane>
                                        <CTabPane active={activeTab === "Policies"}>
                                            <p>Irure enim occaecat labore sit qui aliquip reprehenderit amet velit. Deserunt ullamco ex elit nostrud ut dolore nisi officia magna
                                            sit occaecat laboris sunt dolor. Nisi eu minim cillum occaecat aute est cupidatat aliqua labore
                                            aute occaecat ea aliquip sunt amet. Aute mollit dolor ut exercitation irure commodo non amet consectetur quis amet culpa. Quis ullamco
                                            nisi amet qui aute irure eu. Magna labore dolor quis ex labore id nostrud deserunt dolor
                                            eiusmod eu pariatur culpa mollit in irure.</p>
                                        </CTabPane>
                                    </CTabContent>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default withRouter(Docs)