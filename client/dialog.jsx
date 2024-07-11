import React from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"
import { v4 } from 'uuid'
import { Modal } from 'antd'

const data = observable({
    
    to_render: [],
    add(val) { this.to_render.push(val) },
    del(id) { 
    
        let i = this.to_render.findIndex(item => item.id == id)
        this.to_render.splice(i, 1)
    }
})

const type1 = function(props) {
    return (
        <Modal 
            open={true} 
            okText="Да"
            onOk={() => {props.close('si')}}
            cancelText="Нет"
            onCancel={() => {props.close('no')}}
        >
            {props.label}
        </Modal>
    )
}

const type2 = function(props) {
    return (
        <Modal 
            open={true} 
            title="type2"
            okText="Да"
            onOk={() => {props.close('да')}}
            cancelText="Нет"
            onCancel={() => {props.close('нет')}}
            width={200}
        >
            {props.label}
        </Modal>
    )
}

const dialogs = { type1, type2 }

const dialog = new Proxy({}, {

    get(target, prop) {

        return function(param) {

            return new Promise(resolve => {

                const id = v4()
                data.add({id, render: dialogs[prop]({...param, close: function (result) {
            
                    data.del(id)
                    resolve(result)
                } })}) 
            })            
        }
    }
})

// базовый класс для компонентов с возможностью асинхронного вызова диалогов
// let result = await this.dialog.type(data)
class DC extends React.Component {

    dialog = dialog
}

// компонент-обертка для получения функциональности асинхронного вызова диалогов
const Dialog = observer((props) => {

    return (
        <>
            {props.children}
            {data.to_render.map(item => (<div key={item.id}>{item.render}</div>))}
        </>
    )
})

export {Dialog, DC}