import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { GPBcomponent } from './server'
import TestComponent from './TestComponent'

// import serverGPB from './serverGPB'

// const srv = serverGPB({
//   url: 'http://localhost/cgi-bin/test.cgi',
//   test_delay: 3000,
//   error_handler({error, retry, reset}) { 
//     console.log('вызван error_handler:')
//     console.log(error) 
//   },
// })

// let obj = srv.view('пока нет ответа :(').ping()

// let list_obj = srv.view([]).get_list()

export default observer(
    class App extends GPBcomponent {


      render() {
        return (
          <>
          <div className='App'>

          {/* <input value={a} onChange={(event) => setA(event.target.value)}/>
          +
          <input value={b} onChange={(event) => setB(event.target.value)}/>
          =
          {srv.view('?').math.sum(a, b).data}
          {(srv.view('?').math.sum(a, b).loading) ? 'сервер считает' : ''}

          <h1>ping: {obj.loading ? 'loading' : ''} {obj.data}</h1>
          <button onClick={() => obj.reset()}>reset ping</button>
          <button onClick={() => obj.reload()}>reload ping</button>

          <br></br>{srv.view([]).get_list().loading ? 'сейчас подгрузится список' : undefined}
          <ul>{
            srv.view([]).get_list().data.map((ref) => (
              <li key={ref}>
                ссылка: {ref} 
                ссылка ссылки: {srv.ref(ref).name().data}
                ключ от ссылки ссылки: {srv.ref(srv.ref(ref).name()).name('default').data}
                "{srv.ref(srv.ref(ref).name()).name('default').loading ? 'еще загружается' : ''}"
              </li>  
            ))
          }</ul>
          <button onClick={() => list_obj.reset()}>reset список</button> */}

            <TestComponent data_parent={this}/>
          </div>
          </>
        )
    }
  }
)

