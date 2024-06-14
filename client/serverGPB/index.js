import request from './request'
import { makeObservable, observable, computed, action } from 'mobx'

const stringify = JSON.stringify
// JSON.stringify в принципе не гарантирует идентичность строки, полученной из одного и того же объекта
// import stringify from 'json-stable-stringify'

export default function ({url, 
    timeout = 10000, 
    delay = 50,
    test_delay = 0,
    error_handler}) {

    const req = request({url, timeout, delay, test_delay, error_handler})

    let data_cache = {
    
        view: {},
        ref_key: {},
        ref_key_proxy: new Map()
    }

    const empty_ref = {
        data: undefined,
        loading: false,
        error: undefined,
        reset: () => {},
        reload: () => {}
    }

    class query_result {

        constructor({method, params}) {

            this.method = method
            this.params = params

            makeObservable(this, {
                data: observable,
                loading: observable,
                error: observable,
                set_data: action,
                set_error: action,
            }) 
        }   

        method = undefined
        params = undefined

        data = undefined
        loading = true
        error = undefined
        promise = undefined

        set_data(data) {
            
            this.data = data
            this.loading = false
            this.error = undefined
        }

        set_error(error) {
            this.data = undefined
            this.loading = false
            this.error = error
        }
    }
    
    function query({method, params}) {

        const obj = new query_result({method, params})

        const promise = new Promise((resolve, reject) => {
            req({method, params})
                .then((data) => {
                
                    if (data.error) {
                                
                        obj.set_error(data.error)
                        resolve(undefined)
                    }
                    else {
         
                        obj.set_data(data.result)
                        resolve(data.result)
                    }
                })
                .catch((err) => { console.log(`какая-то непредвиденная ошибка ${err}`) })
            })

        obj.promise = promise

        return obj
    }
    
    class view_result {

        constructor({method, params, def}) {

            this.method = method
            this.params = params
            this.def = def
            this.data = def

            makeObservable(this, {
                data: observable,
                loading: observable,
                error: observable,
                set_data: action,
                set_error: action,
                reset: action,
                reload: action,
            }) 
        }   

        method = undefined
        params = undefined
        def = undefined

        data = undefined
        loading = true
        error = undefined
        promise = undefined

        set_data(data) {
            
            this.data = data
            this.loading = false
            this.error = undefined
        }

        set_error(error) {
            this.data = undefined
            this.loading = false
            this.error = error
        }

        reset() {

            this.data = this.def
            this.loading = true
            this.error = undefined

            this.promise = new Promise((resolve, reject) => {
                req({method: this.method, params: this.params})
                    .then((data) => {
                    
                        if (data.error) {
                                    
                            this.set_error(data.error)
                            resolve(undefined)
                        }
                        else {
             
                            this.set_data(data.result)
                            resolve(data.result)
                        }
                    })
                    .catch((err) => { console.log(`какая-то непредвиденная ошибка ${err}`) })
                })
        }
        
        reload() {

            this.promise = new Promise((resolve, reject) => {
                req({method: this.method, params: this.params})
                    .then((data) => {
                    
                        if (data.error) {
                                    
                            this.set_error(data.error)
                            resolve(undefined)
                        }
                        else {
             
                            this.set_data(data.result)
                            resolve(data.result)
                        }
                    })
                    .catch((err) => { console.log(`какая-то непредвиденная ошибка ${err}`) })
                })
        }
    }

    function view({method, params, def}) { 
    
        if (!data_cache.view[method]) data_cache.view[method] = {}

        if (!data_cache.view[method][stringify(params)]) data_cache.view[method][stringify(params)] = {}
        
        if (data_cache.view[method][stringify(params)][stringify(def)]) 
            return data_cache.view[method][stringify(params)][stringify(def)]
        
        const obj = new view_result({method, params, def})
        
        data_cache.view[method][stringify(params)][stringify(def)] = obj

        const promise = new Promise((resolve, reject) => {
            req({method, params})
                .then((data) => {
                
                    if (data.error) {
                                
                        obj.set_error(data.error)
                        resolve(undefined)
                    }
                    else {
         
                        obj.set_data(data.result)
                        resolve(data.result)
                    }
                })
                .catch((err) => { console.log(`какая-то непредвиденная ошибка ${err}`) })
            })

        obj.promise = promise

        return obj
    }

    function server_action({method, params}) { 
        
        return {method, params} 
    }
     



    let keys_queue = new Proxy([], {
        get(target, prop) {
            if (prop === 'push') return (obj) => {
                if (!target.includes(obj)) target.push(obj)
            }
            else return target[prop]
        }
    })  
    
    async function get_ref_key() {

        if(keys_queue.length) {

            let qnt = 0

            let for_send = []

            while (keys_queue.length && qnt < 100) {

                let cur = keys_queue.shift()

                for_send.push({ref: cur.ref, key: cur.key})

                qnt++
            }

            let res = await req({method: 'ref_key', params: [for_send]})

            let data = {}

            if (res.error) error_handler({error: res.error})
            
            else data = res.result
             
            for_send.forEach(item => {

                let line = data.find(l => l.ref == item.ref && l.key == item.key)

                let value = line ? line.value : undefined

                let objs = data_cache.ref_key[item.ref][item.key]
               
                let defs = Object.keys(objs)
                defs.forEach(def_key => objs[def_key].set_data(value))
            })
        }
    }

    setInterval(get_ref_key, 50)

    class ref_key_proxy {

        constructor({ref, key, def}) {

            this.ref = ref
            this.key = key
            this.def = def

            makeObservable(this, {
                data: computed,
                loading: computed,
            })            
        }

        get data() {

            if (this.ref.data) {

                const obj = ref_key({ref: this.ref.data, key: this.key, def: this.def})
                return obj.data
            }
            else return this.def
        } 

        get loading() {

            if (this.ref.data) {

                const obj = ref_key({ref: this.ref.data, key: this.key, def: this.def})
                return obj.loading
            }
            else return true
        } 
    }




    class ref_key_result {

        constructor({ref, key, def}) {

            this.ref = ref
            this.key = key
            this.def = def
            this.data = def

            makeObservable(this, {
                data: observable,
                loading: observable,
                set_data: action,
                reset: action,
                reload: action,
            }) 
        }   

        ref = undefined
        key = undefined
        def = undefined
        _resolve = undefined
        promise = new Promise(resolve => _resolve = resolve)

        data = undefined
        loading = true

        set_data(data) {
            this.data = data
            this._resolve(data)
            this.loading = false
        }

        reset() {

            this.data = this.def
            this.loading = true
            keys_queue.push(this)
        }
        
        reload() {
            keys_queue.push(this)
        }
    }    




    // class ref_key_result {

    //     constructor({ref, key, def}) {

    //         this.ref = ref
    //         this.key = key
    //         this.def = def
    //         this.data = def

    //         makeObservable(this, {
    //             data: observable,
    //             loading: observable,
    //             set_data: action,
    //             reset: action,
    //             reload: action,
    //         }) 
    //     }   

    //     ref = undefined
    //     key = undefined
    //     def = undefined

    //     data = undefined
    //     loading = true

    //     set_data(data) {
    //         this.data = data
    //         this.loading = false
    //     }

    //     reset() {

    //         this.data = this.def
    //         this.loading = true
    //         keys_queue.push(this)
    //     }
        
    //     reload() {
    //         keys_queue.push(this)
    //     }
    // }


    function ref_key({ref, key, def}) {

        if (ref instanceof ref_key_result) {

            if (!data_cache.ref_key_proxy.has(ref)) data_cache.ref_key_proxy.set(ref, {})
            
            let keys = data_cache.ref_key_proxy.get(ref)
            
            if (!keys[key]) keys[key] = {}

            if (keys[key][stringify(def)]) return keys[key][stringify(def)]
            
            else {

                let obj = new ref_key_proxy({ref, key, def})
                keys[key][stringify(def)] = obj
                return obj
            }
        }

        else {

            if (!data_cache.ref_key[ref]) data_cache.ref_key[ref] = {}

            if (!data_cache.ref_key[ref][key]) data_cache.ref_key[ref][key] = {}
            
            if (data_cache.ref_key[ref][key][stringify(def)]) 
                return data_cache.ref_key[ref][key][stringify(def)]


            const obj = new ref_key_result({ref, key, def})
            
            data_cache.ref_key[ref][key][stringify(def)] = obj

            keys_queue.push(obj)

            return obj
        }
    }




    const proxy_key = {
    
        get(target, prop) {
    
            let obj = {...target()}
    
            if (obj.wait_arg) throw new Error('ожидается вызов функции с аргументом')
    
            if (obj.type) {
    
                if (['query', 'view', 'action'].includes(obj.type)) obj.method.push(prop)  
                    
                else if (obj.type == 'ref') {
                    obj.key = prop
                    obj.wait_arg = 'ref_key'
                }
    
                else throw new Error('так не бывает')                    
            }
    
            else {
    
                if (prop == 'view' ) {
                    obj.type = 'view'
                    obj.wait_arg = 'view'
                    obj.method = []
                }
    
                else if (prop == 'action') {
                    obj.type = 'action'
                    obj.method = []
                }
    
                else if (prop == 'ref') {
                    obj.type = 'ref'
                    obj.wait_arg = 'ref'
                }
    
                else {
                    obj.type = 'query'
                    obj.method = [prop]
                }   
            }
            return new Proxy (() => obj, proxy_key)         
        },
    
        apply(target, thisArg, args) {
    
            let obj = {...target()}
    
            if (obj.wait_arg) {
    
                if (obj.wait_arg == 'view') obj.default = args[0]
    
                else if (obj.wait_arg == 'ref') obj.ref = args[0]
                
                else if (obj.wait_arg == 'ref_key') {
    
                    
                    return obj.ref ? 
                        ref_key({ref: obj.ref, key: obj.key, def: args[0]})
                        : empty_ref
                } 
                else throw new Error('так не бывает')
                obj.wait_arg = undefined
                return new Proxy (() => obj, proxy_key)                               
            }
            else {
    
                obj.params = args
    
                if (obj.type == 'query') return query({
                    method: obj.method.join('.'), 
                    params: obj.params
                })

                else if (obj.type == 'view') return view({
                    method: obj.method.join('.'), 
                    params: obj.params, 
                    def: obj.default
                })

                else if (obj.type == 'action') return server_action({
                    method: obj.method.join('.'), 
                    params: obj.params
                })
                else throw 'что-то не то'
            }            
        }       
    }
    
    return new Proxy(() => ({}), proxy_key)  
}
