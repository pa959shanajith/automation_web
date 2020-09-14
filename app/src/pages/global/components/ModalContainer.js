import React from 'react';
import '../styles/ModalContainer.scss'

/*Component ModalContainer
  use: shows popup
  props:
    content : "content component"
    footer : "footer component"
    title : "title of the popup"
    close : "event on close"
*/

const ModalContainer = (props) => {
    return(
        <div className='modal__container'>
            <div className='modal__content modal-content modal-sm'>
                <div className='modal-header modal__header'>
                    <button onClick={(e)=>props.close(e)}>×</button>
                    <h4 className='modal-title'>{props.title}</h4>
                </div>
                <div className='modal-body modal__body'>
                    {props.content}
                </div>
                <div className='modal-footer modal__footer'>
                    {props.footer}
                </div>
            </div>
        </div>
    )
}

export default ModalContainer;