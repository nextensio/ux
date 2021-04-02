import React from 'react'
import {
  CBadge,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CLink,
  CImg
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const TheHeaderDropdown = () => {
    return (
        <CDropdown
            inNavclass
            className='c-header-nav-items mx-2'
            direction='down'
        >
            <CDropdownToggle className='c-header-nav-link' caret={false}>
                <div className='c-avatar'>
                    <CImg
                        src={'boris.jpg'}
                        className='c-avatar-img'
                        alt='user@nextensio.com'
                    />
                </div>
            </CDropdownToggle>
            <CDropdownMenu className='pt-0' placement='bottom-end'>
                <CDropdownItem
                    header
                    tag='div'
                    color='light'
                    className='text-center'
                >
                    <strong>Account</strong>
                </CDropdownItem>
                <CDropdownItem>
                    <CIcon name='cil-bell' className='mfe-2' />
                    Updates
                    <CBadge color='info' className='mfs-auto'>42</CBadge>
                </CDropdownItem>
                <CDropdownItem 
                    header
                    tag='div'
                    color='light'
                    className='text-center'
                >
                    <strong>Settings</strong>
                </CDropdownItem>
                <CDropdownItem>
                    <CIcon name='cil-user' className='mfe-2' />
                    Profile
                </CDropdownItem>
                <CDropdownItem>
                    <CIcon name='cil-settings' className='mfe-2' />
                    Settings
                </CDropdownItem>
                <CDropdownItem divider />
                <CDropdownItem>
                    <CLink to='/login'>
                        <CIcon name='cil-account-logout' className='mfe-2' />
                        Logout
                    </CLink>
                </CDropdownItem>
            </CDropdownMenu>
        </CDropdown>

    )
}

export default TheHeaderDropdown