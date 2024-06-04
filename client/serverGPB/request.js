import axios from 'axios'

export default function ({
    url, 
    timeout = 10000, 
    delay = 50,
    test_delay = 0,
    error_handler
}) {

    const queue = []

    function reset() {

        queue.splice(0, queue.length)
        exec_requests();
    }   

    async function exec_requests() {

        if (queue.length) {

            const batch = []

            let id = 0

            while (queue.length && batch.length <= 10) {

                batch.push({...queue.shift(), id})
                id++
            }

            const to_send = batch.map(item => ({
                method: item.method, 
                params: item.params, 
                id: item.id
            }))
        
            try {

                const res = await axios({
                    method: 'post',
                    url,
                    timeout,
                    data: JSON.stringify(to_send),
                    headers: {'Content-Type': 'application/json'},
                })

                if (test_delay) await new Promise(resolve => setTimeout(() => resolve(), test_delay))
                
                if (Array.isArray(res.data)) {

                    res.data.forEach(receive => {

                        const resolve = batch.find(send => send.id == receive.id).resolve
                        
                        if (receive.error) resolve({error: receive.error})
                        else resolve( {result: receive.result} )
                    })

                    setTimeout(exec_requests, delay)
                }
                else {

                    error_handler({
                        error: {code: 'SYSTEM'}, 
                        retry: exec_requests, 
                        reset
                    })

                    return
                }
            } 
            
            catch(error) { 
                
                error_handler({
                    error, 
                    retry: exec_requests, 
                    reset
                }) 
            }
        }

        else setTimeout(exec_requests, delay)
    }

    setTimeout(exec_requests, delay)

    return function({method, params = []}) {

        return new Promise(async (resolve, reject) => {
            queue.push({method, params, resolve, reject})
        })
    }
}