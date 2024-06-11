import React from "react"
import serverGPB from './serverGPB'

let server

const params = {
    url: 'http://localhost/cgi-bin/test.cgi',
    test_delay: 3000,
    error_handler({error, retry, reset}) { 
      console.log('вызван error_handler:')
      console.log(error) 
    },
}

function get_server() {

    if (!server) server = serverGPB(params)
    return server
}

class GPBcomponent extends React.Component {

    srv = get_server()(this)

    componentDidMount() {

        if (this.props.data_parent) this.srv.parent(this.props.data_parent)
    }

    componentWillUnmount() { 

        
    }
}

export {get_server, GPBcomponent}

