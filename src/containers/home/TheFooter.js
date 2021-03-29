import React from 'react'
import { CFooter } from '@coreui/react'

const TheFooter = () => {
    return (
        <CFooter fixed={false}>
            <div className="mfs-auto">
                <span className="mr-1"></span>
                <a href="https://controller.nextensio.net" target="_blank" rel="noopener noreferrer">Nextensio Controller</a>
            </div>
        </CFooter>
    )
}

export default React.memo(TheFooter)
