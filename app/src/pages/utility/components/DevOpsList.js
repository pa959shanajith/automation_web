import React, { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { ScrollBar, Messages as MSG, setMsg, VARIANT, ModalContainer } from '../../global';
import { SearchBox, Dialog } from '@avo/designcomponents';
import { fetchConfigureList, deleteConfigureKey, execAutomation, getQueueState, deleteExecutionListId } from '../api';
import {v4 as uuid} from 'uuid';
import CheckboxTree from 'react-checkbox-tree';

import "../styles/DevOps.scss";

const DevOpsList = ({ setShowConfirmPop, setCurrentIntegration, url, showMessageBar, setLoading }) => {
    const [copyToolTip, setCopyToolTip] = useState("Click To Copy");
    const [searchText, setSearchText] = useState("");
    const [configList, setConfigList] = useState([]);
    const [executionQueue, setExecutionQueue] = useState(false);
    const [filteredList, setFilteredList] = useState(configList);

    const copyTokenFunc = () => {
        const data = url;
        if (!data) {
            setCopyToolTip("Nothing to Copy!");
            setTimeout(() => {
                setCopyToolTip("Click to Copy");
            }, 1500);
            return;
        }
        const x = document.getElementById('api-url');
        x.select();
        document.execCommand('copy');
        setCopyToolTip("Copied!");
        setTimeout(() => {
            setCopyToolTip("Click to Copy");
        }, 1500);
    }

    const copyConfigKey = (key) => {
        if (navigator.clipboard.writeText(key)) {
            setCopyToolTip("Copied!");
            setTimeout(() => {
                setCopyToolTip("Click to Copy");
            }, 1500);
        }
    }
    const deleteDevOpsConfig = (key) => {
        setLoading('Please Wait...');
        setTimeout(async () => {
            const deletedConfig = await deleteConfigureKey(key);
            if(deletedConfig.error) {
                if(deletedConfig.error.CONTENT) {
                    setMsg(MSG.CUSTOM(deletedConfig.error.CONTENT,VARIANT.ERROR));
                } else {
                    setMsg(MSG.CUSTOM("Error While Deleting DevOps Configuration",VARIANT.ERROR));
                }
            }else {
                const configurationList = await fetchConfigureList();
                if(configurationList.error) {
                    if(configurationList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching DevOps Configuration List",VARIANT.ERROR));
                    }
                }else {
                    setConfigList(configurationList);
                }
                setMsg(MSG.CUSTOM("DevOps Configuration deleted successfully",VARIANT.SUCCESS));
            }
            setLoading(false);
        }, 500);
        setShowConfirmPop(false);
    }
    const [confirmExecuteNow, setConfirmExecuteNow] = useState(false);
    const getCurrentQueueState = async () => {
        setLoading('Please Wait...');
        const queueList = await getQueueState();
        if(queueList.error) {
            if(queueList.error.CONTENT) {
                setMsg(MSG.CUSTOM(queueList.error.CONTENT,VARIANT.ERROR));
            } else {
                setMsg(MSG.CUSTOM("Error While Fetching Execution Queue List",VARIANT.ERROR));
            }
        }else {
            let nodesCollection = [];
            for (let item in queueList) {
                let nodeItem = {
                    value: item,
                    label: item+'   :   '+queueList[item][0][0].configurename,
                    showCheckbox: false
                }
                let nodeItemChildren = [];
                let nodeItemChildrenIndex = 1;
                for (let executionNode of queueList[item]) {
                    let executionItem = {
                        value: item+nodeItemChildrenIndex,
                        label: <div className="devOps_terminate_icon">Execution {nodeItemChildrenIndex}   <img src={"static/imgs/cicd_terminate.png"} title="Terminate Execution" alt="Terminate icon" onClick={async () => {
                                const deleteExecutionFromQueue = await deleteExecutionListId({configurekey: item, executionListId: executionNode[0].executionListId});
                                if(deleteExecutionFromQueue.status !== 'pass') {
                                    setMsg(MSG.CUSTOM("Error While Removing Execution from Execution Queue",VARIANT.ERROR));
                                }else {
                                    getCurrentQueueState();
                                }
                            }}/></div>,
                        showCheckbox: false,
                        // className: 'devOps_terminate_style',
                        children: executionNode.map((executionRequest) => ({
                            label: 'Module : '+executionRequest.modulename+',   Status: '+executionRequest.status,
                            value: executionRequest.executionListId+executionRequest.moduleid,
                            showCheckbox: false
                        }))
                    };
                    nodeItemChildrenIndex++;
                    nodeItemChildren.push(executionItem);
                }
                nodeItem['children'] = nodeItemChildren;
                nodesCollection.push(nodeItem);
            }
            setExecutionQueue({
                list: nodesCollection,
                expanded: []
            });
        }
        setLoading(false);
    }
    const onClickDeleteDevOpsConfig = (name, key) => {
        setShowConfirmPop({'title': 'Delete DevOps Configuration', 'content': <p>Are you sure, you want to delete <b>{name}</b> Configuration?</p>, 'onClick': ()=>{ deleteDevOpsConfig(key) }});
    }
    const handleSearchChange = (value) => {
        let filteredItems = configList.filter(item => (item.configurename.toLowerCase().indexOf(value.toLowerCase()) > -1) || (item.project.toLowerCase().indexOf(value.toLowerCase()) > -1) || (item.release.toLowerCase().indexOf(value.toLowerCase()) > -1));
        setFilteredList(filteredItems);
        setSearchText(value);
    }
    const getIntegrationSelected = (integration) => {
        let selectedIntegration = '';
        Object.keys(integration).forEach((currentInteg) => {
            if(integration[currentInteg].url !== '') {
                selectedIntegration = currentInteg;
            }
        });
        if(selectedIntegration === 'qtest') selectedIntegration = 'qTest'
        if(selectedIntegration === 'alm') selectedIntegration = 'ALM'
        if(selectedIntegration === 'zephyr') selectedIntegration = 'Zephyr'
        return selectedIntegration;
    }
    const handleEdit = (item) => {
        setCurrentIntegration({
            name: item.configurename,
            key: item.configurekey,
            selectValues: [
                { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '30%', disabled: false, selectedName: '' },
                { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
                { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
            ],
            scenarioList: getScenarioList(item.executionRequest.batchInfo, item.executionRequest.selectedModuleType),
            selectedModuleType: item.executionRequest.selectedModuleType,
            avoAgentGrid: 'cicdanyagentcanbeselected',
            browsers: item.executionRequest.browserType,
            integration: getIntegrationSelected(item.executionRequest.integration),
            executionType: item.executionRequest.executiontype,
            isHeadless: item.executionRequest.isHeadless,
            executionRequest: item.executionRequest
        });
        return;
    }
    const getScenarioList = (batchInfo, selectedModulesType) => {
        let scenarioList = [];
        for(let batch of batchInfo)
            for(let suiteIndex=0; suiteIndex<batch.suiteDetails.length; suiteIndex++) {
                if(selectedModulesType === 'normalExecution') scenarioList.push(batch.suiteDetails[suiteIndex].scenarioId)
                else if(selectedModulesType === 'batchExecution') scenarioList.push(batch.batchname+batch.testsuiteId+suiteIndex+batch.suiteDetails[suiteIndex].scenarioId)
                else {
                    scenarioList.push(batch.batchname+batch.testsuiteId+suiteIndex+batch.suiteDetails[suiteIndex].scenarioId)}
            }
        return scenarioList;
    }
    useEffect(() => {
        (() => {
            setLoading('Please Wait...');
            setTimeout(async () => {
                const configurationList = await fetchConfigureList();
                if(configurationList.error) {
                    if(configurationList.error.CONTENT) {
                        setMsg(MSG.CUSTOM(configurationList.error.CONTENT,VARIANT.ERROR));
                    } else {
                        setMsg(MSG.CUSTOM("Error While Fetching DevOps Configuration List",VARIANT.ERROR));
                    }
                }else {
                    setConfigList(configurationList);
                }
                setLoading(false);
            }, 500);
        })()
    }, []);

    return (<>
        {
            executionQueue && 
            <Dialog
                hidden = {executionQueue === false}
                onDismiss = {() => setExecutionQueue(false)}
                title = 'Manage Execution Queue'
                minWidth = '60rem' >
                    {
                        (executionQueue.list.length > 0 ) ? <CheckboxTree
                            showNodeIcon={false} className='devOps_checkbox_tree' nodes={executionQueue.list} expanded={executionQueue.expanded} onExpand={(expanded) => setExecutionQueue({...executionQueue, expanded: expanded}) } /> : 
                            <p>You have nothing pending to execute. Try to Execute any Configure Key and come here. </p>
                    }
            </Dialog>
        }
        {
            confirmExecuteNow && <Dialog
                hidden = {confirmExecuteNow === false}
                onDismiss = {() => setConfirmExecuteNow(false)}
                title = 'Confirm Execute Now'
                minWidth = '60rem'
                confirmText = 'Confirm'
                declineText = 'Cancel'
                onDecline={() => setConfirmExecuteNow(false)}
                onConfirm = {async () => {
                    const temp = await execAutomation(confirmExecuteNow.configurekey);
                    if(temp.status !== "pass") {
                        if(temp.error && temp.error.CONTENT) {
                            setMsg(MSG.CUSTOM(temp.error.CONTENT,VARIANT.ERROR));
                        } else {
                            setMsg(MSG.CUSTOM("Error While Adding Configuration to the Queue",VARIANT.ERROR));
                        }
                    }else {
                        setMsg(MSG.CUSTOM("Execution Added to the Queue",VARIANT.SUCCESS));
                    }
                    setConfirmExecuteNow(false);
                }} >
                    Are you sure you want to execute <b>{confirmExecuteNow.configname}</b> now?
            </Dialog>
        }
        <div className="page-taskName" >
            <span data-test="page-title-test" className="taskname">
                DevOps Integration Configuration
            </span>
        </div>
        <div className="api-ut__btnGroup">
            <button data-test="submit-button-test" onClick={() => setCurrentIntegration({
                    name: '',
                    key: uuid(),
                    selectValues: [
                        { type: 'proj', label: 'Select Project', emptyText: 'No Projects Found', list: [], selected: '', width: '30%', disabled: false, selectedName: '' },
                        { type: 'rel', label: 'Select Release', emptyText: 'No Release Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
                        { type: 'cyc', label: 'Select Cycle', emptyText: 'No Cycles Found', list: [], selected: '', width: '25%', disabled: true, selectedName: '' },
                    ],
                    scenarioList: [],
                    avoAgentGrid: 'cicdanyagentcanbeselected',
                    browsers: [],
                    selectedModuleType: 'normalExecution',
                    integration: '',
                    executionType: 'asynchronous',
                    isHeadless: false
                })} >New Configuration</button>
            { configList.length > 0 && <>
                <div className='searchBoxInput'>
                    <SearchBox placeholder='Enter Text to Search' width='20rem' value={searchText} onClear={() => handleSearchChange('')} onChange={(event) => event && event.target && handleSearchChange(event.target.value)} />
                </div>
                <div className="api-ut__btnGroup">
                    <button onClick={() => getCurrentQueueState() }>Manage Execution Queue</button>
                </div>
                <div>
                    <span className="api-ut__inputLabel" style={{fontWeight: '700'}}>DevOps Integration API url : </span>
                    <span className="api-ut__inputLabel"><input type="text" value={url} data-test="req-body-test" className="req-body" autoComplete="off" id="api-url" name="request-body" style={{width:"25%"}} placeholder='https: &lt;&lt;Avo Assure&gt;&gt;/execAutomation' />
                        <label>
                            <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} />
                            <div style={{fontSize:"24px"}}>
                                <i className="fa fa-files-o icon" style={{fontSize:"24px"}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyTokenFunc() }} ></i>
                            </div>
                        </label>
                    </span>
                </div>
            </> }
        </div>
        { configList.length > 0 ? <>
            { /* Table */ }
            <div className="d__table" style={{ flex: 0 }}>
                <div className="d__table_header">
                    <span className=" d__step_head tkn-table__sr_no tkn-table__head" >#</span>
                    <span className="d__obj_head tkn-table__name tkn-table__head" >Name</span>
                    <span className="d__key_head tkn-table__key tkn-table__head" >Configuration Key</span>
                    <span className="d__inp_head tkn-table__project tkn-table__head" >Project</span>
                    <span className="d__out_head tkn-table__project tkn-table__head" >Release</span>
                    <span className="details_col d__det_head tkn-table__button" >Action</span>
                </div>
            </div>
            <div id="activeUsersToken" className="wrap active-users-token">
                <ScrollBar scrollId='activeUsersToken' thumbColor="#929397" >
                <table className = "table table-hover sessionTable" id="configList">
                    <tbody>
                        {
                            searchText.length > 0 && filteredList.length > 0 && filteredList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__name" data-for="name" data-tip={item.configurename}> <ReactTooltip id="name" effect="solid" backgroundColor="black" /><React.Fragment>{item.configurename}</React.Fragment> </td>
                                <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td>
                                <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td>
                                <td className="tkn-table__button">
                                     <button style={{ marginRight: '10%' }} onClick={()=>setConfirmExecuteNow({ configurekey: item.configurekey, configname: item.configurename})} >Execute Now</button>
                                     <img style={{ marginRight: '10%' }} onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> &nbsp;
                                     <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
                                </td>
                            </tr>)
                        }
                        {
                            searchText.length == 0 && configList.length > 0 && configList.map((item, index) => <tr key={item.configurekey} className='tkn-table__row'>
                                <td className="tkn-table__sr_no"> {index+1} </td>
                                <td className="tkn-table__name" data-for="name" data-tip={item.configurename}> <ReactTooltip id="name" effect="solid" backgroundColor="black" />{item.configurename} </td>
                                <td className="tkn-table__key"> <span className="tkn_table_key_value tkn_table_key_value">{ item.configurekey }</span> <ReactTooltip id="copy" effect="solid" backgroundColor="black" getContent={[() => { return copyToolTip }, 0]} /> <i className="fa fa-files-o icon" style={{fontSize:"16px", float: 'right'}} data-for="copy" data-tip={copyToolTip} onClick={() => { copyConfigKey(item.configurekey) }} ></i></td>
                                <td className="tkn-table__project" data-for="project" data-tip={item.project}> <ReactTooltip id="project" effect="solid" backgroundColor="black" /> {item.project} </td>
                                <td className="tkn-table__project" data-for="release" data-tip={item.release}> <ReactTooltip id="release" effect="solid" backgroundColor="black" /> {item.release} </td>
                                <td className="tkn-table__button">
                                     <button style={{ marginRight: '10%' }} onClick={()=>setConfirmExecuteNow({ configurekey: item.configurekey, configname: item.configurename})} >Execute Now</button>
                                     <img style={{ marginRight: '10%' }} onClick={() => handleEdit(item)} src="static/imgs/EditIcon.svg" className="action_icons" alt="Edit Icon"/> &nbsp;
                                     <img onClick={() => onClickDeleteDevOpsConfig(item.configurename, item.configurekey)} src="static/imgs/DeleteIcon.svg" className="action_icons" alt="Delete Icon"/>
                                      </td>
                            </tr>)
                        }
                    </tbody>
                </table>
                </ScrollBar>
            </div>
        </> : <div className="no_config_img"> <img src="static/imgs/no-devops-config.svg" alt="Empty List Image"/> </div> }
    </>);
}

export default DevOpsList;