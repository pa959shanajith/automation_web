import React, { useState, useEffect } from 'react';
import {ScrollBar} from '../../global';
import { useHistory, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as actionTypes from "../../plugin/state/action";
import "../styles/ReferenceBar.scss";

// props - 
const ReferenceBar = (props) => {

    const [collapse, setCollapse] = useState(false);
    const [taskList, setTaskList] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [searchItems, setSearchItems] = useState([]);
    const [showTask, setShowTask] = useState(false);
    const tasksJson = useSelector(state=>state.plugin.tasksJson);
    const filterDat = useSelector(state=>state.plugin.FD);

    // const nums = [1,2,3,4,5,6,7,8,9,11,22,33];
    // const nums = [44,55,66,77,88,99,11,222,333,444,555,666,777,888,999];
    // const nums = [1,2,3,4,5,6,7,8,9,11,22,33,44,55,66,77,88,99,11,222,333,444,555,666,777,888,999];

    useEffect(()=>{
            // if(window.location.pathname != '/mindmap'){
            //     $("#mindmapCSS1, #mindmapCSS2").remove();
            // } else if(window.location.pathname != "/neuronGraphs") {
            //     $("#nGraphsCSS").remove();
            // }
            if (Object.keys(tasksJson)!==0){
                setTaskList([]);
            }
            let counter = 1;
            let lenght_tasksJson = tasksJson.length;
            let task_list = [];
            for(let i=0; i < lenght_tasksJson; i++) {
                let testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
                let tasktype = tasksJson[i].taskDetails[0].taskType;
                let taskname = tasksJson[i].taskDetails[0].taskName;
                let dataobj = {
                    'scenarioflag':tasksJson[i].scenarioFlag,
                    'apptype':tasksJson[i].appType,
                    'projectid':tasksJson[i].projectId,
                    'screenid':tasksJson[i].screenId,
                    'screenname':tasksJson[i].screenName,
                    'testcaseid':tasksJson[i].testCaseId,
                    'testcasename':tasksJson[i].testCaseName,
                    'scenarioid':tasksJson[i].scenarioId,
                    'taskname':taskname,
                    'taskdes':tasksJson[i].taskDetails[0].taskDescription,
                    'tasktype':tasksJson[i].taskDetails[0].taskType,
                    'subtask':tasksJson[i].taskDetails[0].subTaskType,
                    'subtaskid':tasksJson[i].taskDetails[0].subTaskId,
                    'assignedtestscenarioids':tasksJson[i].assignedTestScenarioIds,
                    'assignedto':tasksJson[i].taskDetails[0].assignedTo,
                    'startdate':tasksJson[i].taskDetails[0].startDate,
                    'exenddate':tasksJson[i].taskDetails[0].expectedEndDate,
                    'status':tasksJson[i].taskDetails[0].status,
                    'versionnumber':tasksJson[i].versionnumber,
                    'batchTaskIDs':tasksJson[i].taskDetails[0].batchTaskIDs,
                    'releaseid':tasksJson[i].taskDetails[0].releaseid,
                    'cycleid':tasksJson[i].taskDetails[0].cycleid,
                    'reuse':tasksJson[i].taskDetails[0].reuse
                }
                dataobj = JSON.stringify(dataobj)
                task_list.push({'panel_idx': i, 'counter': counter, 'testSuiteDetails': testSuiteDetails, 'dataobj': dataobj, 'taskname': taskname, 'tasktype': tasktype});
                
                // let limit = 45;
                // let chars = $("#panelBlock_"+i+"").children().find('span.assignedTaskInner').text();
                // if (chars.length > limit) {
                //    let visiblePart = chars.substr(0, limit-1);
                //    let dots = $("<span class='dots'>...</span>");
                //    let hiddenPart = chars.substr(limit-1);
                //    let assignedTaskText = visiblePart + hiddenPart;
                //    $("#panelBlock_"+i+"").children().find('span.assignedTaskInner').text(visiblePart).attr('title',assignedTaskText).append(dots);
                // }
                counter++;
            }
            setTaskList(task_list);
    }, [tasksJson]);

    const onSearchHandler = event => {
        searchTask(event.target.value)
        setSearchValue(event.target.value);
    };

    const searchTask = (value) => {
        let items = taskList;
        let filteredItem = [];
        let counter = 1;
        items.forEach(item => {
            if (item.taskname.toLowerCase().indexOf(value.toLowerCase()) > -1) {
                item.type_counter = counter++;
                filteredItem.push(item)
            }
        });
        setSearchItems(filteredItem);
    }


    return (
        <div className="ref__bar">
            { props.collapsible && <div className={"caret__ref_bar " + (collapse && " caret_ref_collapsed") } onClick={()=>setCollapse(!collapse)}>
                {collapse ? "<" : ">"}
            </div>}
            { !collapse && 
            // <ScrollBar>
            <div className="ref__content">
                <div className="rb_upper_contents">
                        {props.children}
                        				
                {showTask && <div className="task_pop">
                    <h4 className="pop__header" onClick={()=>setShowTask(false)}><span className="pop__title">My task(s)</span><img className="task_close_arrow" src="static/imgs/ic-arrow.png"/></h4>
                    <div className="input_group">
                        <span className="search_task__ic_box">
                            <img className="search_task__ic" src="static/imgs/ic-search-icon.png"/>
                        </span>
                        <input className="search_task__input" onChange={onSearchHandler} value={searchValue} placeholder="Seach My task(s)"/>
                    </div>
                    <div className="task_pop__list">
                        <div className="task_pop__overflow">
                            <ScrollBar thumbColor= "#fff" trackColor= "#46326b" >
                                <div className="task_pop__content">
                                    <TaskContents items={searchValue ? searchItems : taskList} filterDat={filterDat} taskJson={tasksJson} />
                                </div>
                            </ScrollBar>
                        </div>
                    </div>
                </div>}
                    <div className="ic_box" onClick={()=>setShowTask(!showTask)}><img className={"rb__ic-task thumb__ic " + (showTask && "active_rb_thumb")} src="static/imgs/ic-task.png"/><span className="rb_box_title">Tasks</span></div>
                    { !props.hideInfo && <div className="ic_box"><img className="rb__ic-info thumb__ic" src="static/imgs/ic-info.png"/><span className="rb_box_title">Info</span></div>}
                </div>
                <div className="rb__bottom_content">
                <div className="ic_box"><img className="rb__ic-assist thumb__ic" src="static/imgs/ic-assist.png"/><span className="rb_box_title">Assist</span></div>
                </div>
            </div>
            // </ScrollBar>
        }
        </div>
    );
}

const TaskContents = ({items, filterDat, taskJson}) => {

    const [showPanel, setShowPanel] = useState("");

    useEffect(()=>{
        setShowPanel("");
    }, [items]);

    return (
        <>
        {items.length !== 0 ? 
        <>
        {items.map(item=>{
            return <TaskPanel item={item} showPanel={showPanel} setShowPanel={setShowPanel} filterDat={filterDat} taskJson={taskJson} />
        })}
        </>
        : null }
        </>
    );

}

const TaskPanel = ({item, showPanel, setShowPanel, filterDat, taskJson}) => {

    const taskSuiteDetails = item.testSuiteDetails;
    const dataobj = item.dataobj;

    const history = useHistory();
    const dispatch = useDispatch();
    const [desc, setDesc] = useState(null);
    const [rel, setRel] = useState(null);
    const [cyc, setCyc] = useState(null);
    const [appType, setAppType] = useState(null);
    const [descId, setDescId] = useState(null);
    const [redirectTo, setRedirectTo] = useState("");

    const taskRedirection = event => {
        event.preventDefault();
            
        let dataobj_json=JSON.parse(dataobj)
        let taskObj = {};
        if(dataobj_json.status==='assigned'){
            dataobj_json.status='inprogress';
        }
        taskObj.testSuiteDetails = JSON.parse(taskSuiteDetails);
        taskObj.scenarioFlag = dataobj_json.scenarioflag;
        taskObj.assignedTestScenarioIds = dataobj_json.assignedtestscenarioids;
        taskObj.screenId = dataobj_json.screenid;
        taskObj.screenName = dataobj_json.screenname;
        taskObj.projectId = dataobj_json.projectid;
        taskObj.taskName = dataobj_json.taskname;
        taskObj.versionnumber = dataobj_json.versionnumber;
        taskObj.testCaseId = dataobj_json.testcaseid;
        taskObj.testCaseName = dataobj_json.testcasename;
        taskObj.appType = dataobj_json.apptype;
        taskObj.status=dataobj_json.status;
        taskObj.scenarioId = dataobj_json.scenarioid;
        taskObj.batchTaskIDs=dataobj_json.batchTaskIDs;
        taskObj.subTask = dataobj_json.subtask; 
        taskObj.subTaskId=dataobj_json.subtaskid;
        taskObj.releaseid = dataobj_json.releaseid;
        taskObj.cycleid = dataobj_json.cycleid;
        taskObj.reuse = dataobj_json.reuse;
    
        // DISPATCH
        dispatch({type: actionTypes.SET_CT, payload: taskObj});
        // window.localStorage['_CT'] = JSON.stringify(taskObj);
        if(dataobj_json.subtask === "Scrape"){
            window.localStorage['navigateScreen'] = "Scrape";
            window.localStorage['navigateScrape'] = true;
            setRedirectTo("/scrape")
            // history.replace('/scrape')
            // $window.location.assign("/design");

        }
        else if(dataobj_json.subtask === "TestCase"){
            window.localStorage['navigateScreen'] = "TestCase";
            window.localStorage['navigateTestcase'] = true;
            // setRedirectTo("/plugin")
            history.replace("/plugin")
            // $window.location.assign("/designTestCase");
        }
        else if(dataobj_json.subtask === "TestSuite"){
            window.localStorage['navigateScreen'] = "TestSuite";
            // setRedirectTo("/plugin")
            history.replace("/plugin")
            // $window.location.assign("/execute");
        }
        else if(dataobj_json.subtask === "Scheduling"){
            window.localStorage['navigateScreen'] = "scheduling";
            // setRedirectTo("/plugin")
            history.replace("/plugin")
            // $window.location.assign("/scheduling");
        }
    }

    const expandDetails = event =>{
        event.preventDefault();
        
        if (showPanel === item.panel_idx) setShowPanel(null);
        else setShowPanel(item.panel_idx)

        let data_object = JSON.parse(dataobj)
        let tdes = data_object['taskdes']
        
        let clktask = taskJson[item.panel_idx];
        let maintask = clktask;
        if(clktask.taskDetails[0].taskType != 'Design')
            clktask = clktask.testSuiteDetails[0];
        
        setDescId(item.panel_idx);
        setDesc(tdes);
        setRel(filterDat.idnamemaprel[clktask.releaseid]);
        setCyc(filterDat.idnamemapcyc[clktask.cycleid]);
        setAppType(maintask.appType);
    }


    return (  
        <>
        {
            redirectTo ? <Redirect to={redirectTo} /> : 
            <>
            <div className={"rb__task-panel " + (showPanel === item.panel_idx ? "rb__active-task" : "")} panel-id={item.panel_idx}>
            <div className="rb__panel-content" id={`panelBlock_${item.panel_idx}`}>
                <h4 className="rb__task-num">{item.counter}</h4>
                <span className="rb__assign-task" onClick={taskRedirection} >{item.taskname}</span>
                <div className="rb__tasktype-btndiv">
                    <button className="rb__tasktype-btn" onClick={expandDetails}>{item.tasktype}</button>
                </div>
            </div>
            { showPanel === item.panel_idx &&
            <div className="rb__task-description" description-id={descId}>
                <div>Description: {desc}</div>
                <div>Release: {rel}</div>
                <div>Cycle: {cyc}</div>
                <div>Apptype: {appType}</div>
            </div>
            }
            </div>
        </>
        }
        </>
    );
}

export default ReferenceBar;