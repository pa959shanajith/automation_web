import React, { useState, useRef } from 'react';
import { Messages as MSG, VARIANT, setMsg, ModalContainer, ScrollBar, ScreenOverlay, Footer } from '../../global';
import '../styles/Agents.scss';
import AgentsList from './AgentsList';
import { Toast } from "primereact/toast";
import { Button } from 'primereact/button';
import { TabMenu } from 'primereact/tabmenu';
import { InputText } from 'primereact/inputtext';

/* Component Agents */

const Agents = () => {
    const [loading, setLoading] = useState(false);
    const toast = useRef();
    const [activeIndex, setActiveIndex] = useState(0);
    const [showConfirmPop, setShowConfirmPop] = useState(false);


    const ConfirmPopup = () => (
        <ModalContainer
            show={showConfirmPop}
            title={showConfirmPop.title}
            content={showConfirmPop.content}
            close={() => setShowConfirmPop(false)}
            footer={
                <>
                    <Button outlined label="No" size='small' onClick={() => setShowConfirmPop(false)}></Button>
                    <Button label="Yes" size='small' onClick={showConfirmPop.onClick}></Button>
                </>
            }
        />
    );
    const showMessageBar = (message, selectedVariant) => (
        setMsg(MSG.CUSTOM(message, VARIANT[selectedVariant]))
    );


    const toastError = (erroMessage) => {
        if (erroMessage.CONTENT) {
            toast.current.show({ severity: erroMessage.VARIANT, summary: 'Error', detail: erroMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'error', summary: 'Error', detail: erroMessage, life: 5000 });
    }

    const toastSuccess = (successMessage) => {
        if (successMessage.CONTENT) {
            toast.current.show({ severity: successMessage.VARIANT, summary: 'Success', detail: successMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'success', summary: 'Success', detail: successMessage, life: 5000 });
    }

    const toastWarn = (warnMessage) => {
        if (warnMessage.CONTENT) {
            toast.current.show({ severity: warnMessage.VARIANT, summary: 'Warning', detail: warnMessage.CONTENT, life: 5000 });
        }
        else toast.current.show({ severity: 'warn', summary: 'Warning', detail: warnMessage, life: 5000 });
    }

    return (<>
        <Toast ref={toast} position="bottom-center" baseZIndex={1300} />
        {loading ? <ScreenOverlay content={loading} /> : null}
        {showConfirmPop && <ConfirmPopup />}
        <div className='agent-container'>
            <AgentsList toastError={toastError} toastSuccess={toastSuccess} toastWarn={toastWarn} setShowConfirmPop={setShowConfirmPop} showMessageBar={showMessageBar} setLoading={setLoading} />
        </div>
    </>);
}

export default Agents;