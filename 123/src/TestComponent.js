import React from "react"
import { observer } from 'mobx-react'
import { GPBcomponent } from './server'

export default observer(
    class Test extends GPBcomponent {


        render() {



            return ( 
                <>
                    
                    <h1>{this.srv.view().ping().data}</h1>
                    <h1>{this.srv.loading ? 'идет загрузка' : ''}</h1>
                </>
            )
        }
    }
)
