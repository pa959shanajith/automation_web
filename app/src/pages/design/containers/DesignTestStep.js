import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails, getNotificationGroups } from '../api';
import { Messages as MSG,ScreenOverlay, setMsg,RedirectPage,ModalContainer,Thumbnail} from "../../global";
import { getObjNameList, getKeywordList } from "../components/UtilFunctions";
import * as DesignApi from "../api";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Accordion, AccordionTab } from 'primereact/accordion';
import '../styles/DesignTestStep.scss';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { TestCases, copiedTestCases, SaveEnable, Modified } from '../designSlice';
import { InputText } from 'primereact/inputtext';
import Select from "react-select";


const DesignModal = (props) => {
    const toast = useRef();
    const testcaseDropdownRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.landing.userinfo);
    const copiedContent = useSelector(state => state.design.copiedTestCases);
    const modified = useSelector(state => state.design.Modified);
    const saveEnable = useSelector(state => state.design.SaveEnable);
    const mainTestCases = useSelector(state => state.design.TestCases);
    const [showTable, setShowTable] = useState(false);
    const [selectedSpan, setSelectedSpan] = useState(null);
    const [visibleDependentTestCaseDialog, setVisibleDependentTestCaseDialog] = useState(false);
    const [testCases, setTestCases] = useState(null);
    const [addedTestCase, setAddedTestCase] = useState([]);
    const [overlay, setOverlay] = useState("");
    const [keywordList, setKeywordList] = useState(null);
    const [keywordListTable, setKeywordListTable] = useState([]);
    const [testCaseData, setTestCaseData] = useState([]);
    const [testScriptData, setTestScriptData] = useState(null);
    const [stepSelect, setStepSelect] = useState({ edit: false, check: [], highlight: [] });
    const [draggable, setDraggable] = useState(false);
    const [objNameList, setObjNameList] = useState(null);
    const [changed, setChanged] = useState(false);
    const [headerCheck, setHeaderCheck] = useState(false);
    const [draggedFlag, setDraggedFlag] = useState(false);
    const [reusedTC, setReusedTC] = useState(false);
    const [pastedTC, setPastedTC] = useState([]);
    const [showPopup, setShow] = useState({});
    const [debugEnable, setDebugEnable] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [testCaseIDsList, setTestCaseIDsList] = useState([]);
    const [testcaseList, setTestcaseList] = useState([]);
    const [dependencyTestCaseFlag, setDependencyTestCaseFlag] = useState(false);
    const [deleteTestDialog, setDeleteTestDialog] = useState(false);
    const [testCase, setTestCase] = useState(null)
    const [selectedTestCases,setSelectedTestCases]=useState(null);
    const [selectedOptions, setSelectedOptions] = useState(null);
    const [disableStep, setDisableStep] = useState(true);
    const [idx, setIdx] = useState(0);
    const [imported, setImported] = useState(false);
    const [showConfirmPop, setShowConfirmPop] = useState(false);
    const [screenLavelTestSteps, setScreenLevelTastSteps] = useState([]);
    const [newtestcase, setnewtestcase] = useState([screenLavelTestSteps.testCases]);
    const [rowExpandedName,setRowExpandedName] = useState({name:'',id:''});
    const [selectedTestCase, setSelectedTestCase] = useState(null);
    let runClickAway = true;
    const emptyRowData = {
        "stepNo": '',
        "objectName": ' ',
        "custname": '',
        "keywordVal": '',
        "inputVal": [""],
        "outputVal": '',
        "remarks": "",
        "url": ' ',
        "appType": props.appType,
        "addDetails": "",
        "cord": '',
        "addTestCaseDetails": "",
        "addTestCaseDetailsInfo": ""
    };
    let screenLevelTestCases=[]
    const parentScreen = props.fetchingDetails["parent"]["children"];
    // useEffect(()=>{
    //     const parentScreenId = () =>{
    //         for (var i = 0; i < parentScreen.length; i++) {
    //             if (props.fetchingDetails["name"] === parentScreen[i].name) {
    //                 setIdx(i);
    //                 return setShow({
    //                     name: parentScreen[i].name,
    //                     id: parentScreen[i]._id,
    //                     parentName:props.fetchingDetails["parent"]['name'],
    //                     parent_id:props.fetchingDetails["parent"]['_id'], 
    //                     projectId:parentScreen[i].projectID, 
    //                 });
    //             }
    //         }
    //         return 0;
    //     }
    //     parentScreenId();
    // },[parentScreen, props.fetchingDetails,idx])
    useEffect(() => {
        if (draggedFlag) {
            setStepSelect({ edit: false, check: [], highlight: [] });
            setDraggedFlag(false);
        }
    }, [draggedFlag])

    useEffect(() => {
        let shouldDisable = false;
        dispatch(TestCases(testCaseData))
        //eslint-disable-next-line
        for (let value of testCaseData) {
            if (value.custname === "" || value.custname === "OBJECT_DELETED") {
                shouldDisable = true;
            }
        }
        // Object.values(testCaseData).forEach(value => {
        //     if (value.custname === "" || value.custname==="OBJECT_DELETED") {
        //         shouldDisable = true;         
        //      }
        //     });
        setDebugEnable(shouldDisable);
    }, [dispatch, testCaseData]);

    useEffect(() => {
        setChanged(true);
    }, [saveEnable]);

    useEffect(() => {
        if (imported) {
            fetchTestCases()
            .then(data=>{
                if (data==="success") 
                    setMsg(MSG.DESIGN.SUCC_TC_IMPORT);
                else 
                    setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                setImported(false)
                setStepSelect({edit: false, check: [], highlight: []});
                setChanged(false);
                // headerCheckRef.current.indeterminate = false;
            })
            .catch(error=>console.error("Error: Fetch TestCase Failed ::::", error));
        }
        //eslint-disable-next-line
    }, [imported]);
    const ConfirmPopups = () => (
        <ModalContainer 
            title={showConfirmPop.title}
            content={showConfirmPop.content}
            close={()=>setShowConfirmPop(false)}
            footer={
                <>
                <button onClick={showConfirmPop.onClick}>Yes</button>
                <button onClick={()=>setShowConfirmPop(false)}>No</button>
                </>
            }
        />
    )

    useEffect(() => {
        if (Object.keys(userInfo).length) {
            //  && Object.keys(props.current_task).length) {
            for(var i = 0 ; i<parentScreen.length; i++){
                fetchTestCases(i)
                .then(data => {
                    data !== "success" &&
                        setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                    //     setEdit(false);
                    // setStepSelect({ edit: false, check: [], highlight: [] });
                    // // headerCheckRef.current.indeterminate = false;
                    // setDraggable(false);
                    // setChanged(false);
                    // setHeaderCheck(false);
                    // setIsUnderReview(props.current_task.status === "underReview")
                })
                .catch(error => console.error("Error: Fetch TestCase Failed ::::", error));
            }
            setScreenLevelTastSteps(screenLevelTestCases)
        }
        //eslint-disable-next-line
    }, [userInfo, setScreenLevelTastSteps]);

    useEffect(() => {
        const scenarioId = props.fetchingDetails.parent.parent["_id"];
        let dependentTestCases = [];
        DesignApi.getTestcasesByScenarioId_ICE(scenarioId)
            .then(data => {
                if (data === "Invalid Session") return RedirectPage(navigate);
                else {
                    for (let i = 0; i < data.length; i++) {
                        dependentTestCases.push({ 'testCaseID': data[i].testcaseId, 'testCaseName': data[i].testcaseName, 'checked': false, 'tempId': i })
                    }
                    let testCases = [];
                    let disableAndBlock = true
                    let dtcLength = dependentTestCases.length;
                    for (let i = dtcLength - 1; i >= 0; i--) {
                        let tc = dependentTestCases[i];
                        tc.disableAndBlock = disableAndBlock;
                        // if (Object.keys(props.checkedTc).length <= 0 && !disableAndBlock) {
                        //     tc.checked = true;
                        // }

                        // if ((i in props.checkedTc) && !disableAndBlock) tc.checked = true;
                        if (tc.testCaseName === props.fetchingDetails.name) disableAndBlock = false;

                        testCases.push(tc);
                    }

                    testCases.reverse();
                    setTestcaseList(testCases);
                    // console.log(testCases);
                }
            })
            .catch(error => console.error("ERROR::::", error));
        //eslint-disable-next-line
    }, []);

    const fetchTestCases = (j) => {
        return new Promise((resolve, reject) => {
            // let { testCaseName, versionnumber, screenName, screenId, projectId, testCaseId, appType } = props.current_task;
            let deleteObjectFlag = false;

            setOverlay("Loading...");

            DesignApi.readTestCase_ICE(userInfo, props.fetchingDetails['parent']['children'][j]["_id"], props.fetchingDetails['parent']['children'][j]["name"], 0 /** versionNumber */, props.fetchingDetails["parent"]["name"])
                .then(data => {
                    if (data === "Invalid Session") return;

                    let taskObj = props.current_task
                    if (data.screenName && data.screenName !== taskObj.screenName) {
                        taskObj.screenName = data.screenName;
                        // dispatch({type: pluginActions.SET_CT, payload: taskObj});
                    }

                    if (data.del_flag) {
                        deleteObjectFlag = true; // Flag for DeletedObjects Popup
                        // props.setDisableActionBar(true); //disable left-top-section
                    }
                    // else props.setDisableActionBar(false); //enable left-top-section

                    // setHideSubmit(data.testcase.length === 0);
                    // setReusedTC(data.reuse);

                    DesignApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails.parent['_id'], props.fetchingDetails.projectID, props.fetchingDetails['parent']['children'][j]["_id"])
                        .then(scriptData => {
                            if (scriptData === "Invalid Session") return;

                            setTestScriptData(scriptData.view);
                            // props.setMirror(scriptData.mirror);

                            // DesignApi.getKeywordDetails_ICE(props.appType)
                            //     .then(keywordData => {
                            //         if (keywordData === "Invalid Session") return;

                            //         setKeywordList(keywordData);
                            DesignApi.getKeywordDetails_ICE(props.appType)
                            .then(keywordData => {
                                if (keywordData === "Invalid Session") return RedirectPage(navigate);
                                let sortedKeywordList = {};
                                for(let object in keywordData) {
                                    let firstList = [];
                                    let secondList = [];
                                    for(let keyword in keywordData[object]){
                                        if(keywordData[object][keyword]['ranking']){
                                            firstList[keywordData[object][keyword]['ranking'] - 1] = ({
                                                [keyword] : keywordData[object][keyword]
                                            });
                                        } else {
                                            secondList.push(({
                                                [keyword] :keywordData[object][keyword]
                                            }));
                                        }
                                    };
                                    // console.log('firstList', firstList);
                                    // console.log('secondList', secondList);
                                    secondList = [...firstList, ...secondList];
                                    // console.log('secondList2', secondList);
                                    
                                    let keyWordObject = {};
                                    // secondList = secondList.forEach((keyword) => {
                                    //     keyWordObject[[Object.keys(keyword)[0]]] = Object.values(keyword)[0]
                                    // });
                                    
                                    for(let keyword of secondList){
                                        if(keyword&& Object.keys(keyword)[0] && Object.values(keyword)[0])
                                            keyWordObject[[Object.keys(keyword)[0]]] = Object.values(keyword)[0];
                                        // console.log('Object.keys(keyword)[0]', Object.keys(keyword)[0]);
                                        // console.log('Object.values(keyword)[0]', Object.values(keyword)[0]);
                                    }
                                    // console.log('keyWordObject', keyWordObject);
                                    // sortedKeywordList[object] = secondList.reduce((kerwordobjects, currentKeyword) => {
                                    //     return ({...kerwordobjects, [Object.keys(currentKeyword)[0]]: Object.values(currentKeyword)[0]})
                                    // }, {});
                                    // console.log('sortedKeywordList[object]', sortedKeywordList[object]);
                                    // sortedKeywordList[object] = { ...secondList };
                                    sortedKeywordList[object] = keyWordObject;
                                }
                                setKeywordList(sortedKeywordList);
                                    let testcaseArray = [];
                                    if (data === "" || data === null || data === "{}" || data === "[]" || data.testcase.toString() === "" || data.testcase === "[]") {
                                        // testcaseArray.push(emptyRowData);
                                        // props.setDisableActionBar(true);
                                        setOverlay("");
                                    } else {
                                        let testcase = data.testcase;

                                        for (let i = 0; i < testcase.length; i++) {
                                            if ("comments" in testcase[i]) {
                                                delete testcase[i];
                                                testcase = testcase.filter(n => n !== null);
                                            } else {
                                                if (props.appType === "Webservice") {
                                                    if (testcase[i].keywordVal === "setHeader" || testcase[i].keywordVal === "setHeaderTemplate") {
                                                        testcase[i].inputVal[0] = testcase[i].inputVal[0].split("##").join("\n")
                                                    }
                                                }
                                                testcase[i].stepNo = (i + 1).toString();
                                                let temp = testcase[i].keywordVal
                                                testcase[i].keywordVal = testcase[i].keywordVal[0].toLowerCase() + testcase[i].keywordVal.slice(1,)
                                                testcaseArray.push(testcase[i]);
                                            }
                                        }
                                        setOverlay("");
                                    }
                                    setDraggable(false);
                                    screenLevelTestCases.push({name:parentScreen[j].name,testCases:testcaseArray.length?testcaseArray:[emptyRowData],id:parentScreen[j]._id})
                                    console.log("screen", screenLevelTestCases)
                                    setTestCaseData([...testCaseData,testcaseArray]);
                                    setnewtestcase([...newtestcase, testcaseArray]); 
                                    setPastedTC([]);
                                    setObjNameList(getObjNameList(props.appType, scriptData.view));
                                    let msg = deleteObjectFlag ? "deleteObjs" : "success"
                                    resolve(msg);
                                })
                                .catch(error => {
                                    setOverlay("");
                                    setTestCaseData([]);
                                    setTestScriptData(null);
                                    setKeywordList(null);
                                    setObjNameList(null);
                                    setMsg("Error getObjectType method! \r\n ", error);
                                    setMsg(MSG.DESIGN.ERR_FETCH_TC);
                                    reject("fail");
                                });
                    })
                    .catch(error => {
                        setOverlay("");
                        setTestCaseData([]);
                        setTestScriptData(null);
                        setKeywordList(null);
                        setObjNameList(null);
                        setMsg(MSG.DESIGN.ERR_FETCH_TC);
                        setMsg("Error getObjectType method! \r\n " + (error));
                        reject("fail");
                    });
            })
            .catch(error => {
                setOverlay("");
                setTestCaseData([]);
                setTestScriptData(null);
                setKeywordList(null);
                setObjNameList(null);
                setMsg(MSG.DESIGN.ERR_FETCH_TC);
                setMsg("Error getTestScriptData method! \r\n " + (error));
                reject("fail");
            });
        });
    };


    const saveTestCases = (e, confirmed) => {
        if (userInfo.role !== "Viewer") {
            if (reusedTC && !confirmed) {
                setShowConfirmPop({ 'title': 'Save Testcase', 'content': 'Testcase has been reused. Are you sure you want to save?', 'onClick': () => { setShowConfirmPop(false); saveTestCases(null, true) } });
                return;
            }
            let testCaseId = '';
            let testCaseName = '';
            let versionnumber = 0;
            let screenId = props.fetchingDetails['parent']['_id'];
            for (var k=0; screenLavelTestSteps.length>k;k++){
                if(screenLavelTestSteps[k].name === rowExpandedName.name){
                       testCaseName = screenLavelTestSteps[k].name;
                       testCaseId = screenLavelTestSteps[k].id
                }
            }


            // let { screenId, testCaseId, testCaseName, versionnumber } = props.current_task;
            let import_status = false;

            if (String(screenId) !== "undefined" && String(testCaseId) !== "undefined") {
                let errorFlag = false;
                let testCases = [...newtestcase]

                for (let i = 0; i < testCases.length; i++) {
                    // let step = i + 1
                    // testCases[i].stepNo = step;

                    if (!testCases[i].custname || !testCases[i].keywordVal) {
                        let col = "Object Name";
                        if (!testCases[i].keywordVal) col = "keyword";
                        // setMsg(MSG.CUSTOM(`Please select ${col} Name a`));
                        errorFlag = true;
                        break;
                    } else {
                        // testCases[i].custname = testCases[i].custname.trim();
                         if (testCases[i].keywordVal === 'SwitchToFrame' && String(testScriptData) !== "undefined") {
                            let scriptData = [...testScriptData];
                            for (let j = 0; j < scriptData.length; j++) {
                                if (!(['@Browser', '@Oebs', '@Window', '@Generic', '@Custom'].includes(scriptData[j].custname)) && scriptData[j].url !== "") {
                                    testCases[i].url = scriptData[j].url;
                                    break;
                                }
                            }
                        }
                        if (["setHeader", "setHeaderTemplate"].includes(testCases[i].keywordVal)) {
                            if (typeof (testCases[i].inputVal) === "string") testCases[i].inputVal = testCases[i].inputVal.replace(/[\n\r]/g, '##');
                            else testCases[i].inputVal[0] = testCases[i].inputVal[0].replace(/[\n\r]/g, '##');
                        }
                    }
                    // if (!testCases[i].url) testCases[i].url = "";
                    
                    // if (!testCases[i].cord) testCases[i].cord = "";

                }

                if (!errorFlag) {
                    if(props.fetchingDetails['name'] === showPopup.name){
                        DesignApi.updateTestCase_ICE(testCaseId, testCaseName, testCases, userInfo, 0 /**versionnumber*/, import_status, pastedTC)
                        .then(data => {
                            if (data === "Invalid Session") return;
                            if (data === "success") {
                                if (props.appType.toLowerCase() === "web" && Object.keys(modified).length !== 0) {
                                    let scrape_data = {};
                                    // let { appType, projectId, testCaseId, versionnumber } = props.current_task;

                                    DesignApi.getScrapeDataScreenLevel_ICE(props.appType, props.fetchingDetails['parent']['_id'], props.fetchingDetails.projectID, testCaseId)
                                        .then(res => {
                                            scrape_data = res;
                                            let modifiedObjects = [];
                                            for (let i = 0; i < scrape_data.view.length; i++) {
                                                if (scrape_data.view[i].custname in modified) {
                                                    scrape_data.view[i].xpath = modified[scrape_data.view[i].custname];
                                                    modifiedObjects.push(scrape_data.view[i]);
                                                }
                                            }
                                            let params = {
                                                'deletedObj': [],
                                                'modifiedObj': modifiedObjects,
                                                'addedObj': {...scrape_data, view: []},
                                                'testCaseId': testCaseId,
                                                'userId': userInfo.user_id,
                                                'roleId': userInfo.role,
                                                'versionnumber': versionnumber,
                                                'param': 'DebugModeScrapeData',
                                                'orderList': scrape_data.orderlist
                                            }
                                    
                                            DesignApi.updateScreen_ICE(params)
                                            .then(data1 => {
                                                if (data1 === "Invalid Session") return ;
                                                
                                                if (data1 === "Success") {            
                                                    fetchTestCases()
                                                    .then(msg=>{
                                                        setChanged(false);
                                                        msg === "success"
                                                        ? setMsg(MSG.DESIGN.SUCC_TC_SAVE)
                                                        : setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND)
                                                    })
                                                    .catch(error => {
                                                        setMsg(MSG.DESIGN.ERR_FETCH_TC);
                                                        setMsg("Error: Fetch TestCase Failed ::::", error)
                                                    });
                                                } else setMsg(MSG.DESIGN.ERR_SAVE_TC);
                                            })
                                            .catch(error => {
                                                setMsg(MSG.DESIGN.ERR_SAVE_TC);
                                                setMsg("Error::::", error)
                                            })
                                })
                                .catch(error=> {
                                    setMsg(MSG.DESIGN.ERR_SAVE_TC);
                                    setMsg("Error:::::", error)
                                });
                            }
                            else{
                                fetchTestCases()
                                .then(data=>{
                                    setChanged(false);
                                    data === "success" 
                                    ? setMsg(MSG.DESIGN.SUCC_TC_SAVE) 
                                    : setMsg(MSG.DESIGN.WARN_DELETED_TC_FOUND);
                                })
                                .catch(error=>{
                                    setMsg(MSG.DESIGN.ERR_FETCH_TC);
                                    setMsg("Error: Fetch TestCase Failed ::::", error)
                                });
                            }
                        } else setMsg(MSG.DESIGN.ERR_SAVE_TC);
                    })
                    .catch(error => { 
                        setMsg(MSG.DESIGN.ERR_SAVE_TC);
                        setMsg("Error::::", error);
                    });
                    errorFlag = false;
                    }
                }
            } else setMsg(MSG.DESIGN.ERR_UNDEFINED_SID_TID);
        }
        setStepSelect({edit: false, check: [], highlight: []});
        // headerCheckRef.current.indeterminate = false;
        setHeaderCheck(false);
        setDebugEnable(false);
    }

    const addRow = () => {
        let oldScreenLevelTestSTeps=[...screenLavelTestSteps]
        // let newData = [];
        // for(var n=0; screenLavelTestSteps.length>n;n++){
        //     if(screenLavelTestSteps[n].name === rowExpandedName){
        //         let oldTestCases = [...screenLavelTestSteps[n].testCases]
        //         let emptyRowDataIndex={...emptyRowData,stepNo:String(oldTestCases.length+1)}
        //         let emptyAddedRow=[...oldTestCases,emptyRowDataIndex]
        //         newData.push(emptyAddedRow)
        //     }
        // }
        // console.log("data",newData)
        let testCaseUpdated = screenLavelTestSteps.find((screen) => screen.name === rowExpandedName.name);
        console.log(testCaseUpdated);
        let emptyRowDataIndex = { ...emptyRowData, stepNo: String(testCaseUpdated.testCases.length + 1) };
        let data = [...testCaseUpdated.testCases, emptyRowDataIndex];
        let updatedTestCase = { ...testCaseUpdated, testCases: data };
        screenLavelTestSteps.find((screen, index) =>
        screen.name === rowExpandedName.name?oldScreenLevelTestSTeps.splice(index, 1, updatedTestCase):oldScreenLevelTestSTeps)
        setScreenLevelTastSteps(oldScreenLevelTestSTeps);
            console.log("date",screenLavelTestSteps)
        //         let emptyAddedRow=[...oldTestCases,emptyRowDataIndex]
    }

    const getKeywords = useCallback(objectName => getKeywordList(objectName, keywordList, props.appType, testScriptData), [keywordList, props.appType, testScriptData]);

    const getRowPlaceholders = useCallback((obType, keywordName) => keywordList[obType][keywordName], [keywordList])

    //Debug function

    const debugTestCases = selectedBrowserType => {
        setVisibleDependentTestCaseDialog(false);
        let testcaseID = [];
        let browserType = [];

        if (props.appType !== "MobileWeb" && props.appType !== "Mainframe") browserType.push(selectedBrowserType);

        // globalSelectedBrowserType = selectedBrowserType;5

        if (dependencyTestCaseFlag) testcaseID = testCaseIDsList;
        else testcaseID.push(props.fetchingDetails['_id']);
        setOverlay('Debug in Progress. Please Wait...');
        // ResetSession.start();
        DesignApi.debugTestCase_ICE(browserType, testcaseID, userInfo, props.appType)
            .then(data => {
                setOverlay("");
                // ResetSession.end();
                if (data === "Invalid Session") return ;
                else if (data === "unavailableLocalServer")  setMsg(MSG.GENERIC.UNAVAILABLE_LOCAL_SERVER)
                else if (data === "success") setMsg(MSG.DESIGN.SUCC_DEBUG)
                else if (data === "fail") setMsg(MSG.DESIGN.ERR_DEBUG)
                else if (data === "Terminate") setMsg(MSG.DESIGN.WARN_DEBUG_TERMINATE)
                else if (data === "browserUnavailable") setMsg(MSG.DESIGN.WARN_UNAVAILABLE_BROWSER)
                else if (data === "scheduleModeOn") setMsg(MSG.GENERIC.WARN_UNCHECK_SCHEDULE)
                else if (data === "ExecutionOnlyAllowed") setMsg(MSG.GENERIC.WARN_EXECUTION_ONLY)
                else if (data.status === "success"){
                    let rows={}
                    mainTestCases.forEach((testCase, index) => {
                        if (index + 1 in data) {
                            rows[testCase.custname] = data[index + 1].xpath;
                        }
                    });
                    dispatch(Modified(rows));
                    dispatch(SaveEnable(!saveEnable))
                    setMsg(MSG.DESIGN.SUCC_DEBUG);
                } else {
                    setMsg(data);
                }										
            })
            .catch(error => {
                setOverlay("");
                // ResetSession.end();
                setMsg(MSG.DESIGN.ERR_DEBUG);
                setMsg("Error while traversing while executing debugTestcase method! \r\n " + (error.data));
            });
    };

    const handleSpanClick = (index) => {
        if (selectedSpan === index) {
            setSelectedSpan(null);
        } else {
            setSelectedSpan(index);
        }
    };

    const toggleTableVisibility = (e) => {
        setShowTable(true);
        console.log(e)
    };
    const handleAdd = () => {
        const update = { ...testCases };
        const addTestcaseData = {};
        const TestIDPresent = addedTestCase.filter(item => {
            return item.testCaseID === testCases.testCaseID
        });
        // console.log("TestIDPresent", TestIDPresent);
        if (TestIDPresent.length > 0) {
            toastError("Duplicate Dependent Testcase found");
        }
        else {
            addTestcaseData["testCaseID"] = update.testCaseID;
            addTestcaseData["testCaseName"] = update.testCaseName;
            addTestcaseData["disableAndBlock"] = update.disableAndBlock;
            addTestcaseData["checked"] = true;
            setTestCaseIDsList([...testCaseIDsList, update.testCaseID])
            setAddedTestCase([...addedTestCase, addTestcaseData]);
            setDependencyTestCaseFlag(true);
            setTestCases(null);
        }
    };

    const toastError = (errMessage) => {
        toast.current.show({ severity: 'error', summary: 'Error', detail: errMessage, life: 10000 });
    }

    const history = useNavigate();
    const hiddenInput = useRef(null);

    const exportTestCase =  () => {
        let testCaseId = props.fetchingDetails['_id'];
        let testCaseName = props.fetchingDetails['name'];
        // let versionnumber = fetchingDetails.versionnumber;
        
        DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName, 0)
        .then(response => {
                if (response === "Invalid Session") return RedirectPage(history);
                
                let responseData;
                if (typeof response === 'object') responseData = JSON.stringify(response.testcase, null, 2);
                let filename = testCaseName + ".json";

                let testCaseBlob = new Blob([responseData], {
                    type: "text/json"
                })

                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(new Blob([responseData], {
                        type: "text/json;charset=utf-8"
                    }), filename);
                }
                else {
                    let a = document.createElement('a');
                    a.download = filename;
                    a.href = window.URL.createObjectURL(testCaseBlob);
                    a.target = '_blank';
                    // document.body.appendChild(a);
                    a.click();
                    // document.body.removeChild(a);
                  } 
            })
            .catch(error => console.error("ERROR::::", error));
    }
    const onInputChange = (event) => {
        let testCaseId = props.fetchingDetails['_id'];
        let testCaseName = props.fetchingDetails['name'];
        // let versionnumber = fetchingDetails.versionnumber;
        // let appType = appType;
        let import_status = true;
        let flag = false;

        let file = event.target.files[0];
        let reader = new FileReader();
        reader.onload = function (e) {
            try{
                hiddenInput.current.value = '';
                if (file.name.split('.').pop().toLowerCase() === "json") {
                    setOverlay("Loading...");
                    let resultString = JSON.parse(reader.result);
                    if (!Array.isArray(resultString)) 
                        throw MSG.DESIGN.ERR_FILE_FORMAT
                    for (let i = 0; i < resultString.length; i++) {
                        if (!resultString[i].appType)
                            throw MSG.DESIGN.ERR_JSON_IMPORT
                        if (
                            resultString[i].appType.toLowerCase() !== "generic" && 
                            resultString[i].appType.toLowerCase() !== "pdf" &&
                            resultString[i].appType !== props.appType
                        ) 
                            throw MSG.DESIGN.ERR_NO_MATCH_APPTYPE
                    }
                    DesignApi.updateTestCase_ICE(testCaseId, testCaseName, resultString, userInfo, 0, import_status)
                        .then(data => {
                            setOverlay("");
                            if (data === "Invalid Session") RedirectPage(history);
                            if (data === "success") setImported(true);
                        })
                        .catch(error => {
                            setOverlay("");
                            console.error("ERROR::::", error)
                        });
                    
                } else throw  setMsg(MSG.DESIGN.ERR_FILE_FORMAT);
            }
            catch(error){
                setOverlay("");
                if (typeof(error)==="object") setMsg(error);
                else setMsg(MSG.DESIGN.ERR_TC_JSON_IMPORT)
                console.error(error);
            }
        }
        reader.readAsText(file);
    }

    const importTestCase = (overWrite) => {
        
        let testCaseId = props.fetchingDetails['_id'];
        let testCaseName = props.fetchingDetails['name'];
        // let versionnumber = fetchingDetails.versionnumber;
        if(overWrite) setShowConfirmPop(false);

        
        DesignApi.readTestCase_ICE(userInfo, testCaseId, testCaseName , 0 )
        .then(response => {
                if (response === "Invalid Session") RedirectPage(history);
                if (response.testcase && response.testcase.length === 0 || overWrite) {
                    // hiddenInput.current.click();
                    // document.getElementById("importTestCaseField").click();
                }
                else{
                    setShowConfirmPop({'title': 'Table Consists of Data', 'content': 'Import will erase your old data. Do you want to continue?', 'onClick': ()=>importTestCase(true)});
                }
            })
        .catch(error => console.error("ERROR::::", error));
    }
    const lowerList = [
        {'title': 'Import Test Case', 'tooltip':'Import TestCase', 'img': 'static/imgs/ic-import-script.png', 'action': ()=>importTestCase()},
        {'title': 'Export Test Case', 'tooltip':'Export TestCase', 'img': 'static/imgs/ic-export-script.png', 'action': ()=>exportTestCase(),}
    ]
    const headerTemplate = (
        <>
            <div>
                <h5 className='dailog_header1'>Design Test Step</h5>
                <h4 className='dailog_header2'>{props.fetchingDetails["parent"]["name"]}</h4>
                <img className="screen_btn" src="static/imgs/ic-screen-icon.png" alt='screen icon' />
                <div className='btn__grp'>
                {/* {lowerList.map((icon, i) => <Thumbnail key={i} title={icon.title} tooltip={icon.tooltip} img={icon.img} action={icon.action} disable={icon.disable}/>)}
                    <input id="importTestCaseField" type="file" style={{display: "none"}} ref={hiddenInput} onChange={onInputChange} accept=".json"/> */}
                    <Button size='small' icon='pi pi-file-import' title='Import Test Steps' onClick={()=>importTestCase(props.fetchingDetails)} outlined/>
                    <Button size='small' icon='pi pi-file-export'  title='Export Test Steps' onClick={()=>exportTestCase(props.fetchingDetails)} outlined/>
                    <Button size='small' onClick={() => { DependentTestCaseDialogHideHandler(); setVisibleDependentTestCaseDialog(true) }} label='Debug' title='Debug' outlined></Button>
                    <Button size='small' label='Add Test Step' title='Add Test Step' onClick={()=>addRow()}></Button>
                </div>
            </div>
        </>
    );

    const footerTemplate = (
        <>
            <div className='btn__grp'>
               <Button size='small' label='Save' title='Save' onClick={saveTestCases} outlined></Button>
              {selectedTestCases &&  <Button size='small' label='Delete' title='Delete' onClick={()=>setDeleteTestDialog(true)}></Button>}
            </div>
        </>
    );

    const emptyMessage = (
        <div className='empty__msg1'>
            <div className='empty__msg'>
                <img className="not_captured_ele" src="static/imgs/ic-capture-notfound.png" alt="No data available" />
                <p className="not_captured_message">No Design Step yet</p>
            </div>
            <Button size='small' className="btn-design-single" label='Design Test Steps' onClick={()=>addRow()}></Button>
        </div>
    );

    const footerContent = (
        <div>
            <Button label="Cancel" size='small' onClick={() => DependentTestCaseDialogHideHandler()} className="p-button-text" />
            <Button label="Debug" size='small' onClick={() => debugTestCases('1')} autoFocus />
        </div>
    );
    const [objName, setObjName] = useState(null);
    const [objType, setObjType] = useState(null);
    
    const elementEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={objNameList}
                onChange={(e) => {options.editorCallback(e.value);setKeywordListTable(getKeywords(e.value).keywords);setKeyword(getKeywords(e.value).keywords[0]);setObjName(e.value);setObjType(getKeywords(e.value).obType); const caseData = getKeywords(e.target.value)
                    const placeholders = getRowPlaceholders(caseData.obType, caseData.keywords[0]);
                    setInput("");
                    setOutput("");
                    // setKeywordList(caseData.keywords);
                    setObjType(caseData.obType);
                    setOutputPlaceholder(placeholders.outputval);
                    setInputPlaceholder(placeholders.inputval);}}
                placeholder="Select a custname"
            />
        );
    };
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(10);
    const [inputPlaceholder, setInputPlaceholder] = useState('');
    const [outputPlaceholder, setOutputPlaceholder] = useState('');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [ ID, setID] = useState(0);
    const [focused, setFocused] = useState(true);
    const [keywords, setKeywords] = useState(null);
    const [allkeyword, setAllKeyword] = useState([]);

    const onKeySelect = event => {
        if (event.value === 'show all') {
            setEndIndex(keywordListTable.length);
        }
        else{
            // const placeholders = getRowPlaceholders(objType, event.value);
            // setOutputPlaceholder(placeholders.outputval);
            // setInputPlaceholder(placeholders.inputval);
            setKeywords(event.value);
            setSelectedOptions(event);
            setAllKeyword(optionKeyword);
            // testcaseDropdownRef.current.focus();
            testcaseDropdownRef.current.blur();
            document.dispatchEvent(new KeyboardEvent('keypress', { key: " " }));
        }
    };
    const submitChanges = event => {
        if (event.keyCode === 13){
            console.log({rowIdx: ID, operation: "row", objName: objName, keyword: keywords, inputVal: input, outputVal: output, appType: props.appType });
            // setStepSelect(oldState=>({...oldState, highlight: []}));
        }
        else if (event.keyCode === 27) {
            // setStepSelect(oldState=>({...oldState, highlight: []}));
        }
    }
    useEffect(()=>{
        if(screenLavelTestSteps.length>0){
            const testCase = screenLavelTestSteps.map((testCase)=>{return testCase.testCases})
            let caseData = null;
            let placeholders = null;
            let data = null;
            if(testCase.length>0){
                for(var i = 0; testCase.length>i; i++){
                    let obj = !testCase[i].custname ? objNameList[0] : testCase[i].custname;
                    caseData = getKeywords(obj)
                    data=obj;
                }
            }
            // let obj = !testCase.custname ? objNameList : testCase.custname;
            // caseData = getKeywords(obj)
            setObjName(data);
            let key = (!caseData.keywords.includes(testCase.keywordVal) || !testCase.custname) ? caseData.keywords[0] : testCase.keywordVal;
            placeholders = getRowPlaceholders(caseData.obType, key);
            setObjType(caseData.obType);
            setKeywordListTable(caseData.keywords)
            setOutputPlaceholder(placeholders.outputval);
            setInputPlaceholder(placeholders.inputval);
        }
    },[getKeywords, getRowPlaceholders, objNameList, screenLavelTestSteps])
    const optionKeyword = keywordListTable?.slice(startIndex, endIndex + 1).map((keyword, i) => {
        if (i < endIndex) {
            return {
                value: keyword,
                label: keywordList[objType] && keyword !== "" && keywordList[objType][keyword] && keywordList[objType][keyword].description !== undefined ? keywordList[objType][keyword].description : "",
                tooltip: keywordList[objType] && keyword !== "" && keywordList[objType][keyword] && keywordList[objType][keyword].tooltip !== undefined ? keywordList[objType][keyword].tooltip : ""
            }
        }
        else {
            return {
                value: "show all",
                label: "Show All"
            }
        }});
console.log(optionKeyword)
        const getOptionLabel = (option) => {
            return (
              <div title={option.tooltip}>
                {option.label}
              </div>
            );
          };

        const customStyles = {
            menuList: (base) => ({
              ...base,
              FontSize: 100,
              width: 200,
              fontSize: 14,
              background: "white",
              height:200,
            }),
            menuPortal: base => ({ 
                ...base, 
                zIndex: 9999
             }),
            menu: base => ({ 
                ...base, 
                zIndex: 9999 
            }),
            control: (base) => ({
              ...base,
              height: 25,
              minHeight: 35,
              width: 150
            }),
            option: (base) =>({
                ...base,
                padding: "3px",
              fontFamily: "Lato Web",
            })
          };
    const keywordEditor = (options) => {
        // setKeywordListTable(getKeywords(options.rowData.custname).keywords)
        // setObjName(options.rowData.custname);
        // setObjType(getKeywords(options.rowData.custname).obType)
        // // setKeyword(getKeywords(options.rowData.custname).keywords[0])
        setFocused(true);
        return (
            // <Dropdown
            //     value={keyword.length>0?keyword:options.value}
            //     options={keywordListTable.length>0?keywordListTable:getKeywords(options.rowData.custname).keywords}
            //     onChange={(e) => {options.editorCallback(e.value);setKeyword([]);}}
            //     placeholder="Select a keywords"
            // />
            // <Select className='select-option' value={selectedOptions} id="testcaseDropdownRefID" ref={testcaseDropdownRef} onChange={(e)=>{options.editorCallback(e.value);onKeySelect(e.value)}} onKeyDown={submitChanges} title={keywordList[objType] && keyword !== "" && keywordList[objType][keyword] && keywordList[objType][keyword].tooltip !== undefined ? keywordList[objType][keyword].tooltip : ""} closeMenuOnSelect={false} options={optionKeyword} menuPortalTarget={document.body} getOptionLabel={getOptionLabel} styles={customStyles} menuPlacement="auto" isSearchable={false} placeholder='Select'/>
            <div>
                        <span className="keyword_col" title={keywordList[objType] && keywords !== "" && keywordList[objType][keyword] && keywordList[objType][keyword].tooltip !== undefined ? keywordList[objType][keyword].tooltip : ""} >
                            {focused ?
                                <>
                                    <Select className='select-option' value={selectedOptions} id="testcaseDropdownRefID" ref={testcaseDropdownRef} onChange={(e)=>{options.editorCallback(e.value);onKeySelect(e)}} onKeyDown={(e)=>{options.editorCallback(e.value);submitChanges()}} title={keywordList[objType] && keywords !== "" && keywordList[objType][keyword] && keywordList[objType][keyword].tooltip !== undefined ? keywordList[objType][keyword].tooltip : ""}  closeMenuOnSelect={false} options={optionKeyword} menuPortalTarget={document.body} getOptionLabel={getOptionLabel} styles={customStyles} menuPlacement="auto" isSearchable={false} placeholder='Select'/>
                                </> :
                                <div className="d__row_text" title={keywordList[objType] && keywords !== "" && keywordList[objType][keyword] && keywordList[objType][keyword].tooltip !== undefined ? keywordList[objType][keyword].tooltip : ""}>{keywordList[objType] && keywords !== "" && keywordList[objType][keyword] && keywordList[objType][keyword].description !== undefined ? keywordList[objType][keyword].description : "--"}</div>}
                           </span>
                    </div>
        );
    };

    const inputEditor = (options) => {
        return <InputText type="text" style={{width:'10rem'}} value={options.value} onChange={(e) => {options.editorCallback(e.target.value);setInput(e.target.value)}} placeholder={inputPlaceholder} />;
    };
    const outputEditor = (options) => {
        return <InputText type="text" style={{width:'10rem'}} value={options.value} onChange={(e) => {options.editorCallback(e.target.value);setOutput(e.target.value)}} placeholder={outputPlaceholder} />;
    };

    const onRowEditComplete = (e) => {
        let testcase = [...newtestcase];
        let { newData, index } = e;
        testcase[index] = newData;
        setID(index)
        setnewtestcase(testcase); 
        setFocused(false);
        
    };
        
    const deleteProduct = () => {
        let testcases = newtestcase.filter(function(objFromA) {
            return !selectedTestCases.find(function(objFromB) {
                return objFromA.stepNo === objFromB.stepNo
                
            })
        })
        
        setnewtestcase(testcases);
        setDeleteTestDialog(false);
        setTestCase(emptyRowData);
        setSelectedTestCases(null)
        setMsg(MSG.CUSTOM('success full deleted test steps'));
    };
        const hideDeleteProductDialog = () => {
            setDeleteTestDialog(false);
        };
        
        const deleteProductDialogFooter = (
            <React.Fragment>
                <Button label="No" icon="pi pi-times" outlined onClick={hideDeleteProductDialog} />
                <Button label="Yes" icon="pi pi-check" severity="danger" onClick={deleteProduct} />
            </React.Fragment>
        );
        const reorderTestCases=(e)=>{
                const reorderedTestcase=e.value
                const newReorderedTestCases=reorderedTestcase.map((testcase,idx)=>{
                    return {...testcase, [testcase.stepNo]:idx+1}
                })
                setnewtestcase(newReorderedTestCases)
        }

    const DependentTestCaseDialogHideHandler = () => {
        setVisibleDependentTestCaseDialog(false);
        setDependencyTestCaseFlag(false);
        setTestCases(null);
        setTestCaseIDsList([]);
        setAddedTestCase([]);
    }
    const allowExpansion = (rowData) => {
        return rowData.testCases.length > 0;
    };
    const [expandedRows, setExpandedRows] = useState(null);
    const onRowExpand = (event) => {
        let _expandedRow={}
        screenLavelTestSteps.forEach(testcase=>{if(event.data.id===testcase.id){
            _expandedRow[`${testcase.id}`]=false
        }
        else{
        _expandedRow[`${testcase.id}`]=null
        }}
        )
        setExpandedRows(_expandedRow)
        setRowExpandedName({name:event.data.name,id:event.data.id});
        toast.current.show({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
    };

    const onRowCollapse = (event) => {
        setRowExpandedName({});
        toast.current.show({ severity: 'success', summary: 'Product Collapsed', detail: event.data.name, life: 3000 });
    };
    
    const rowExpansionTemplate = (data) => {
        return (
            <div className="p-1">
                    <DataTable
                        value={data.testCases.length>0?data.testCases:[]}
                        selectionMode="checkbox" selection={selectedTestCases}
                        onSelectionChange={(e) => setSelectedTestCases(e.value)}  
                        emptyMessage={newtestcase.length === 0?emptyMessage:null} onRowEditComplete={onRowEditComplete}
                        rowReorder editMode="row" reorderableRows onRowReorder={(e) => reorderTestCases(e)} resizableColumns showGridlines size='small' >
                            <Column style={{ width: '3em' ,textAlign: 'center' }} rowReorder />
                            <Column selectionMode="multiple" style={{ width: '3em' ,textAlign: 'center' }} />
                            <Column field="custname" header="Element Name" editor={(options) => elementEditor(options)} ></Column>
                            <Column field="keywordVal" header="Keyword" editor={(options) => keywordEditor(options)}  ></Column>
                            <Column field="inputVal" header="Input" bodyStyle={{maxWidth:'10rem', textOverflow:'ellipsis',textAlign: 'left',paddingLeft: '0.5rem',paddinfRight:'0.5rem'}} editor={(options) => inputEditor(options)} ></Column>
                            <Column field="outputVal" header="Output" bodyStyle={{maxWidth:'10rem',textOverflow: 'ellipsis',textAlign: 'left',paddingLeft: '0.5rem', paddinfRight:'0.5rem'}} editor={(options) => outputEditor(options)} ></Column>
                            <Column field="remarks" header="Remarks" />
                            <Column rowEditor field="action" header="Actions" bodyStyle={{ textAlign: 'center' }} ></Column>
                    </DataTable>
            </div>
        );
    }
    
    const rowTog=(e)=>{
        let _expandedRow={}
        if(Object.keys(e.data).length){
            screenLavelTestSteps.forEach(testcase=>{if(selectedTestCase.id===testcase.id){
                _expandedRow[`${testcase.id}`]=true
            }})
        }
    setExpandedRows(_expandedRow)
    }
    return (
        <>
        {overlay && <ScreenOverlay content={overlay} />}
        { showConfirmPop && ConfirmPopups() }
        <Toast ref={toast} position="bottom-center" baseZIndex={1000} />
            <Dialog className='design_dialog_box' header={headerTemplate} position='right' visible={props.visibleDesignStep} style={{ width: '73vw', color: 'grey', height: '95vh', margin: '0px' }} onHide={() => props.setVisibleDesignStep(false)} footer={footerTemplate} >
                <div className='toggle__tab'>
                    <Toast ref={toast} />
                    <DataTable value={screenLavelTestSteps.length>0?screenLavelTestSteps:[]} expandedRows={expandedRows} onRowToggle={(e) => rowTog(e)}
                            onRowExpand={onRowExpand} onRowCollapse={onRowCollapse} selectionMode="single" selection={selectedTestCase}
                            onSelectionChange={e => { setSelectedTestCase({name:e.value.name,id:e.value.id})}} rowExpansionTemplate={rowExpansionTemplate}
                            dataKey="id" tableStyle={{ minWidth: '60rem' }}>
                        <Column expander={allowExpansion} style={{ width: '5rem' }} />
                        <Column field="name" header="Name" sortable />
                    </DataTable>
                </div>
            </Dialog>

            <Dialog className="debug__object__modal" header="Design:Sign up screen 1" style={{ height: "31.06rem", width: "47.06rem" }} visible={visibleDependentTestCaseDialog} onHide={DependentTestCaseDialogHideHandler} footer={footerContent}>
                <div className='debug__btn'>
                    <div className={"debug__object"}>
                        <span className='debug__opt'>
                            <p className='debug__otp__text'>Choose Browsers</p>
                        </span>
                        <span className='browser__col'>
                            <span onClick={() => handleSpanClick(1)} className={selectedSpan === 1 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/ic-explorer.png'></img>Internet Explorer {selectedSpan === 1 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                            <span onClick={() => handleSpanClick(2)} className={selectedSpan === 2 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/chorme.png' />Google Chrome {selectedSpan === 2 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                            <span onClick={() => handleSpanClick(3)} className={selectedSpan === 3 ? 'browser__col__selected' : 'browser__col__name'}><img className='browser__img' src='static/imgs/fire-fox.png' />Mozilla Firefox {selectedSpan === 3 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                            <span onClick={() => handleSpanClick(4)} className={selectedSpan === 4 ? 'browser__col__selected' : 'browser__col__name'} ><img className='browser__img' src='static/imgs/edge.png' />Microsoft Edge {selectedSpan === 4 && <img className='sel__tick' src='static/imgs/ic-tick.png' />}</span>
                        </span>
                    </div>
                    <div>
                        <div className='design__fst__card'>
                            <span>Add Dependent Test Case (Optional)</span>
                            <div className='add__test__case'>
                                <Dropdown className='add__depend__test' value={testCases} onChange={(e) => setTestCases(e.value)} options={testcaseList} optionLabel="testCaseName"
                                    placeholder="Select"></Dropdown>
                                <Button size='small' label='Add' className='add__btn' onClick={handleAdd}></Button>
                            </div>
                        </div>
                        <div className='design__snd__card'>
                            <div className='design__thr__card'>
                                <span className='design__thr__card'>
                                    <p>Added Dependent Test Cases</p>
                                    <p>Clear</p>
                                </span>
                            </div>
                            <div>
                                {addedTestCase.map((value, index) => (
                                    <div key={index}>
                                        <p className={addedTestCase.length > 0 ? 'text__added__step' : ''}>{value.testCaseName}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>
            <Dialog visible={deleteTestDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {newtestcase && (
                        <span>
                            Are you sure you want to delete?
                        </span>
                    )}
                </div>
            </Dialog>
        </>
    )
}
export default DesignModal;