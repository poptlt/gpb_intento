import { useState } from 'react'
import request from './request.js'

export default function ({url, error_handler}) {

    const req = request({url, error_handler})

    return function({method, params, def}) {

        const [res, setRes] = useState(def)
        const [err, setErr] = useState(undefined)

        const obj = {
            data: res,
            loading: true,
            error: err,
        }

        req({method, params})
            .then((data) => {

                if (data.error) { setErr(data.error) }
                else { setRes(data.result) }

                obj.loading = false
            })

        return obj
    }
}


