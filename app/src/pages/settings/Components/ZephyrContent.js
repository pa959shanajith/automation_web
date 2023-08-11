import { React, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from 'primereact/dialog';
import * as api from '../api';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Checkbox } from 'primereact/checkbox';
import { Tree } from 'primereact/tree';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { TabMenu } from 'primereact/tabmenu';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { InputSwitch } from "primereact/inputswitch";
import AvoConfirmDialog from "../../../globalComponents/AvoConfirmDialog";
import { RedirectPage, Messages as MSG, setMsg } from '../../global';
import {
    resetIntergrationLogin, resetScreen, selectedProject,
    selectedIssue, selectedTCReqDetails, selectedTestCase,
    syncedTestCases, mappedPair, selectedScenarioIds,
    selectedAvoproject, showOverlay,checkedTCPhaseIds,checkedTcIds,checkedTCNames,checkedTCReqDetails,
    checkedTreeIds,checkedParentIds,checkedProjectIds,checkedReleaseIds
} from '../settingSlice';
import "../styles/ZephyrContent.scss";


const ZephyrContent = ({ domainDetails , setToast }) => {
    const uploadFileRef = useRef();
    const dispatch = useDispatch();
    const mappedData = useSelector(state => state.setting.mappedPair);
    const mappedTreeList = useSelector(state => state.setting.mappedTree);
    const selectedZphyrPhaseIds = useSelector(state=> state.setting.checkedTCPhaseIds);
    const selectedZphyrTCIds = useSelector(state=> state.setting.checkedTcIds);
    const selectedZphyrTCNames = useSelector(state=> state.setting.checkedTCNames);
    const selectedZphyrTCReqs = useSelector(state=> state.setting.checkedTCReqDetails);
    const selectedZphyrTreeIds = useSelector(state=> state.setting.checkedTreeIds);
    const selectedZphyrParentIds = useSelector(state=> state.setting.checkedParentIds);
    const selectedZphyrProjIds = useSelector(state=> state.setting.checkedProjectIds);
    const selectedZphyrReleaseIds = useSelector(state=> state.setting.checkedReleaseIds);


    const [activeIndex, setActiveIndex] = useState(0);
    const [checked, setChecked] = useState(false);
    const [checkedAvo, setCheckedAvo] = useState(false);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const [treeData, setTreeData] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [selectedLeftNodes, setselectedLeftNodes] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectetestcase, setSelectedtestcase] = useState(null);
    const dispatchAction = useDispatch();
    const [avoProjectsList, setAvoProjectsList] = useState(null);
    const [listofScenarios, setListofScenarios] = useState([]);
    const [showNote, setShowNote] = useState(false);
    const [importMap, setImportMap] = useState(false);
    const [fileData, setFileData] = useState(null);
    const [selectSheet, setSelectSheet] = useState(null);
    const [selectZephyrProject, setSelectZephyrProject] = useState(null);
    const [selectZephyrRelease, setSelectZephyrRelease] = useState(null);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectedAvoKeys, setSelectedAvoKeys] = useState([]);
    const [error, setError] = useState('');
    const [fileUpload, setFiledUpload] = useState(undefined);
    const [sheetList, setSheetList] = useState([]);
    const dropdownRef = useRef();
    const [projectDetails , setProjectDetails]=useState([]);
    const [releaseArr, setReleaseArr] = useState([]);
    const [avoProjects , setAvoProjects]= useState(null);
    const [selectedRel, setSelectedRel] = useState("Select Release");
    const [testCases, setTestCases] = useState([]);
    const [modules, setModules] = useState([]);
    const [enableBounce, setEnableBounce] = useState(false);
    const [isMutipleSelected,setMultipleSelected] = useState(false);
    const [isMutipleScn,setMultipleScn] = useState(false);

    const [data, setData] = useState([
        {
            key: "grandparent1",
            label: "Grandparent 1",
            children: [
                {
                    key: "parent1",
                    label: "Parent 1",
                    children: [
                        {
                            key: "children1",
                            label: "Children 1",
                            children: [
                                { key: "child1", label: "Child 1" },
                                { key: "child2", label: "Child 2" },
                            ],
                        }

                    ],
                },
            ],
        },
        {
            key: "grandparent2",
            label: "Grandparent 2",
            children: [
                {
                    key: "parent2",
                    label: "Parent 2",
                    children: [
                        {
                            key: "children1",
                            label: "Children 1",
                            children: [
                                { key: "child1", label: "Child 1" },
                                { key: "child2", label: "Child 2" },
                            ],
                        }

                    ],
                },
            ],
        },
    ]);

    const avotestcases = [
        {
            key: "screnario1",
            label: "Scenario 1",
            children: [
                { key: "testCase1", label: "Testcase 1" },
                { key: "testCase2", label: "Testcase 2" },
            ],
        },
        {
            key: "screnario2",
            label: "Scenario 2",
            children: [
                { key: "testCase3", label: "Testcase 3" },
                { key: "testCase4", label: "Testcase 4" },
            ],
        }
    ]

    const testcaseAvo = [
        { name: 'testcase1', code: 'NY' },
        { name: 'testcase2', code: 'RM' },
        { name: 'testcase3', code: 'LDN' },
    ];

    const zephyrProj = [
        { name: 'project 1', code: 'NY' },
        { name: 'project 2', code: 'RM' },
        { name: 'project 3', code: 'LDN' },
        { name: 'project 4', code: 'IST' },
    ];

    const zephyrRelease = [
        { name: 'Release 1', code: 'NY' },
        { name: 'Release 2', code: 'RM' },
        { name: 'Release 3', code: 'LDN' },
        { name: 'Release 4', code: 'IST' },
    ];

    const zephyrTestCase = [
        {
            id: 1,
            name: 'Test Case 1',
            avoassure: 'AvoTestCase 1',
        },
        {
            id: 2,
            name: 'Test Case 2',
            avoassure: 'Avo TestCase 2'
        },
        {
            id: 3,
            name: 'Test Case 3',
            avoassure: 'Avo TestCase 3'
        },
    ];

    const avoTestCase = [
        {
            id: 1,
            name: 'Test Case 1',
            Zephyr: 'Zephyr TestCase 1',
        },
        {
            id: 2,
            name: 'Test Case 2',
            zephyr: 'Zephyr TestCase 2'
        },
        {
            id: 3,
            name: 'Test Case 3',
            zephyr: 'Zephyr TestCase 3'
        },
    ];
    useEffect(() => {
        setMultipleSelected(false);
        setMultipleScn(false);
        setselectedLeftNodes([]);
        dispatchAction(checkedTcIds([]));
        dispatchAction(checkedTCNames([]));
        dispatchAction(checkedTCReqDetails([]));
        dispatchAction(checkedTreeIds([]));
        dispatchAction(checkedParentIds([]));
        dispatchAction(checkedProjectIds([]));
        dispatchAction(checkedReleaseIds([]));
    },[])

    const upload = () => {
        setError('')
        setFiledUpload(undefined)
        uploadFile({ uploadFileRef, setSheetList, setError, setFiledUpload, dispatch })
    }


    const handleTabChange = (index) => {
        setActiveIndex(index);
    };
    const showLogin = () => {
        dispatchAction(resetIntergrationLogin());
        dispatchAction(resetScreen());
        dispatchAction(selectedProject(''));
        dispatchAction(selectedTestCase([]));
        setAvoProjectsList([]);
        setListofScenarios([]);
        dispatchAction(selectedAvoproject(''))
    };

    const onCheckboxChange = (nodeKey) => {
        const nodeIndex = selectedNodes.indexOf(nodeKey);
        let newSelectedNodes = isMutipleSelected ? [] : [...selectedNodes];
        if (nodeIndex !== -1) {
            newSelectedNodes.splice(nodeIndex, 1);
        } else {
            newSelectedNodes.push(nodeKey);
        }
        setMultipleScn(newSelectedNodes.length > 1 ? true:false);
        setSelectedNodes(newSelectedNodes);
        dispatchAction(selectedScenarioIds(newSelectedNodes));
    }

    const TreeNodeCheckbox = (node) => {
        if (node.data.type === 'scenario') {
            return (
                <div style={{ width: '100%' }}>
                    <Checkbox
                        checked={selectedNodes.includes(node.key)}
                        onChange={() => onCheckboxChange(node.key)}
                    />
                    <span className="scenario_label">{node.label} </span>
                    {
                        node.checked && <i className="pi pi-times unmap_icon" style={{ float: 'right' }} onClick={() => handleUnSync(node)}></i>
                    }

                </div>)
        }
        else if (node.data.type === 'testcase') {
            return (
                <div style={{ width: '100%' }}>
                    <span>{node.label} </span>
                    {/* <i className="pi pi-times" style={{ float: 'right'}} ></i> */}
                </div>
            )
        }
    };

    const handleUnSync = async (node) => {
        // let unSyncObj = [];
        // if (Object.keys(node).length) {
        //     let findMappedId = viewMappedFiles.filter((item) => item.testscenarioid === node.key);
        //     if (findMappedId && findMappedId.length) {
        //         unSyncObj.push({
        //             'mapid': findMappedId[0]._id,
        //             'testCaseNames': [].concat(secondOption && secondOption.name === 'Story' ? findMappedId[0].userStoryId : findMappedId[0].TestSuiteId ),
        //             'testid': [].concat(null),
        //             'testSummary': [].concat(null)
        //         })
        //         let args = Object.values(unSyncObj);
        //         args['screenType'] = selectedscreen.name === 'Azure DevOps' ? 'Azure': selectedscreen.name ;
        //         const saveUnsync = await api.saveUnsyncDetails(args);
        //         if (saveUnsync.error){  
        //             setToast("error", "Error", 'Failed to Unsync'); 
        //         }
		// 		else if(saveUnsync === "unavailableLocalServer"){
        //                 setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
        //                 return
        //             }
		// 		else if(saveUnsync === "scheduleModeOn"){
        //             setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
        //             return
        //         }
		// 		else if(saveUnsync === "fail"){
        //             setToast("error", "Error", MSG.INTEGRATION.ERR_SAVE.CONTENT);
        //             return
        //         }
		// 		else if(saveUnsync == "success"){
        //             callViewMappedFiles()
        //             setToast("success", "Success", 'Unsynced');
        //         }

        //     }

        //     let unsyncMap = treeData.map((item) => item.key == node.key ? { ...item, checked: false, children: [] } : item);
        //     let unsyncMappedData = mappedData.filter((item) => item.scenarioId[0] !== node.key);
        //     setTreeData(unsyncMap);
        //     dispatchAction(mappedTree(unsyncMap));
        //     dispatchAction(mappedPair(unsyncMappedData));
        // }
    }


    const footerIntegrations = (
        <div className='btn-11'>
            {activeIndex === 0 && (
                <div className="btn__2">
                    <Button label="Save" severity="primary" className='btn1' />
                    <Button label="Back" onClick={showLogin} size="small" className="logout__btn" />
                </div>)}

            {activeIndex === 1 && (
                <Button label="Back" onClick={showLogin} size="small" className="cancel__btn" />)}

        </div>
    );

    const uploadFile = async ({ uploadFileRef, setSheetList, setError, setFiledUpload, dispatch }) => {
        var file = uploadFileRef.current.files[0]
        if (!file) {
            return;
        }
        var extension = file.name.substr(file.name.lastIndexOf('.') + 1)
        dispatch(showOverlay('Uploading...'));
        try {
            const result = await read(file)
            if (extension === 'xls' || extension === 'xlsx') {
                var res = await api.excelToZephyrMappings({ 'content': result, 'flag': "sheetname" })
                dispatch(showOverlay(''));
                if (res.error) { setError(res.error); return; }
                if (res.length > 0) {
                    setFiledUpload(result)
                    setSheetList(res)
                } else {
                    setError("File is empty")
                }
            }
            else {
                setError("File is not supported")
            }
            dispatch(showOverlay(''));
        } catch (err) {
            dispatch(showOverlay(''));
            setError("invalid File!")
        }
    }


    function read(file) {
        return new Promise((res, rej) => {
            var reader = new FileReader();
            reader.onload = function () {
                res(reader.result);
            }
            reader.onerror = () => {
                rej("fail")
            }
            reader.onabort = () => {
                rej("fail")
            }
            reader.readAsBinaryString(file);
        })
    }

    // const checkboxTemplate = (node) => {
    //     return (
    //         <div style={{ width: '100%' }}>
    //             <Checkbox
    //                 checked={selectedNodes.includes(node.key)}
    //                 onChange={() => onCheckboxChange(node.key)}
    //             />
    //             <span>{node.label} </span>
    //             <i className="pi pi-times" style={{ float: 'right' }}></i>
    //         </div>
    //     );
    // };
    const confirmPopupMsg = (
        <div> <p>Note : If you import already mapped testcases will be unmapped</p></div>
    )

    const importMappingFooter = (
        <>
        <Button label='Import' size='small' severity="primary"></Button>
        </>
    )

    // const onCheckboxChange = (nodeKey) => {
    //     const nodeIndex = selectedNodes.indexOf(nodeKey);
    //     const newSelectedNodes = [...selectedNodes];
    //     if (nodeIndex !== -1) {
    //         newSelectedNodes.splice(nodeIndex, 1);
    //     } else {
    //         newSelectedNodes.push(nodeKey);
    //     }
    //     setSelectedNodes(newSelectedNodes);
    // };
    const handleProject= async(e)=>{
        const projectId = e.target.value;
        const releaseData = await api.zephyrProjectDetails_ICE(projectId.id, '6440e7b258c24227f829f2a4');
        if (releaseData.error)
            setToast('error','Error',releaseData.error);
        else if (releaseData === "unavailableLocalServer")
            setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
        else if (releaseData === "scheduleModeOn")
            setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
        else if (releaseData === "Invalid Session"){
            setToast('error','Error','Invalid Session');
        }
        else if (releaseData === "invalidcredentials")
            setToast('error','Error',MSG.INTEGRATION.ERR_INVALID_CRED.CONTENT);
        else if (releaseData) {
            setProjectDetails([]);
            setReleaseArr(releaseData);
            setSelectZephyrProject(projectId);
            getProjectScenarios();
            // setSelectedRel("Select Release");
            // clearSelections();
        }
    }

    const onReleaseSelect = async(event) => {
        const releaseId = event.target.value;
        const testAndScenarioData = await api.zephyrCyclePhase_ICE(releaseId.id, '6440e7b258c24227f829f2a4');
        if (testAndScenarioData.error)
             setToast('error','Error',testAndScenarioData.error);
        else if (testAndScenarioData === "unavailableLocalServer")
             setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
        else if (testAndScenarioData === "scheduleModeOn")
             setToast('error','Error',MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
        else if (testAndScenarioData === "Invalid Session"){
            setToast('error','Error','Invalid Session');
        }
        else if (testAndScenarioData) {
            const convertToTree = convertDataStructure(testAndScenarioData.project_dets);
            setProjectDetails(convertToTree);
            // setAvoProjects(testAndScenarioData.avoassure_projects);  
            setSelectedRel(releaseId);
        }
    }

    function convertDataStructure(input) {
        let output = [];
      
        Object.entries(input).forEach(([cycleName, items]) => {
          let cycle = {
            key: cycleName,
            label: cycleName,
            children: []
          };
      
          items.forEach((item) => {
            let [key, label] = Object.entries(item)[0];
            cycle.children.push({
              key,
              label,
              children: [{}]
            });
          });
      
          output.push(cycle);
        });
      
        return output;
      }

    const getProjectScenarios = async () => {
        // It needs to be change
        const projectScenario = await api.getAvoDetails("6440e7b258c24227f829f2a4");
        if (projectScenario.error)
            setToast("error", "Error", projectScenario.error);
        else if (projectScenario === "unavailableLocalServer")
            setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE);
        else if (projectScenario === "scheduleModeOn")
            setToast("error", "Error", MSG.GENERIC.WARN_UNCHECK_SCHEDULE);
        else if (projectScenario === "Invalid Session") {
            setToast("error", "Error", 'Invalid Session');
        }
        else if (projectScenario && projectScenario.avoassure_projects && projectScenario.avoassure_projects.length) {
            // setProjectDetails(projectScenario.project_dets);
            setAvoProjectsList(projectScenario.avoassure_projects);
            setAvoProjects(projectScenario.avoassure_projects.map((el, i) => { return { label: el.project_name, value: el.project_id, key: i } }));
            onAvoProjectChange(projectScenario.avoassure_projects);
            // setSelectedRel(releaseId);  
            // clearSelections();
        }
    }

    const onAvoProjectChange = async (scnData) => {
        dispatchAction(selectedAvoproject(reduxDefaultselectedProject.projectId));
        if (scnData.length) {
            let filterScns = scnData.filter(el => el.project_id === reduxDefaultselectedProject.projectId)[0]['scenario_details'] || [];
            setListofScenarios(filterScns);

            let treeData = selectedAvoproject
                ? filterScns.map((scenario) => ({
                    key: scenario._id,
                    label: scenario.name,
                    data: { type: 'scenario' },
                    checked: false,
                    children: mappedTreeList
                }))

                : []
            setTreeData(treeData);
        }
    }

    const TreeNodeProjectCheckbox = (node) => {
        if (node.children) {
            return (
                <div>
                    <span>{node.label}</span>
                </div>
            );
        } else {
            return (
                <div>
                    <Checkbox
                        checked={selectedLeftNodes.includes(node.key)}
                        onChange={(e) => {
                            onLeftCheckboxChange(node)
                            // console.log(e,' its selected e');
                            // if (e.checked) {
                            //     setSelectedKeys([...selectedKeys, node.key]);
                            // } else {
                            //     setSelectedKeys(selectedKeys.filter((key) => key !== node.key));
                            // }
                        }}
                    />
                    <span>{node.label}</span>
                </div>
            );
        }
    };

    const onLeftCheckboxChange = (nodeKey) => {
        console.log(nodeKey);
        const nodeIndex = selectedLeftNodes.indexOf(nodeKey.key);
        const newSelectedNodes = isMutipleScn ? [] : [...selectedLeftNodes];
        let newSelectedZphyrTCIds = isMutipleScn ? [] : [ ...selectedZphyrTCIds ];
        let newSelectedZphyrTCNames = isMutipleScn ? [] : [ ...selectedZphyrTCNames ]; 
        let newSelectedZphyrTCReqs = isMutipleScn ? [] : [ ...selectedZphyrTCReqs ];
        let newSelectedZphyrTreeIds = isMutipleScn ? [] : [ ...selectedZphyrTreeIds ];
        let newSelectedZphyrParentIds = isMutipleScn ? [] : [ ...selectedZphyrParentIds ];
        let newSelectedZphyrProjIds = isMutipleScn ? [] : [ ...selectedZphyrProjIds ];
        let newSelectedZphyrRelIds = isMutipleScn ? [] : [ ...selectedZphyrReleaseIds ];


        if (nodeIndex !== -1) {
            newSelectedNodes.splice(nodeIndex, 1);
            newSelectedZphyrTCIds.splice(nodeIndex, 1);
            newSelectedZphyrTCNames.splice(nodeIndex, 1);
            newSelectedZphyrTCReqs.splice(nodeIndex, 1);
            newSelectedZphyrTreeIds.splice(nodeIndex, 1);
            newSelectedZphyrParentIds.splice(nodeIndex, 1);
            newSelectedZphyrProjIds.splice(nodeIndex, 1);
            newSelectedZphyrRelIds.splice(nodeIndex, 1);
        } else {
            newSelectedNodes.push(nodeKey.key);
            newSelectedZphyrTCIds.push(nodeKey.key);
            newSelectedZphyrTCNames.push(nodeKey.label);
            newSelectedZphyrTCReqs.push(nodeKey.reqdetails);
            newSelectedZphyrTreeIds.push(String(nodeKey.cyclePhaseId));
            newSelectedZphyrParentIds.push(nodeKey.parentId);
            newSelectedZphyrProjIds.push(parseInt(selectZephyrProject.id));
            newSelectedZphyrRelIds.push(parseInt(selectedRel.id));
        }
        setMultipleSelected(newSelectedZphyrTCIds.length > 1 ? true:false);
        setselectedLeftNodes(newSelectedNodes);
        dispatchAction(checkedTcIds(newSelectedZphyrTCIds));
        dispatchAction(checkedTCNames(newSelectedZphyrTCNames));
        dispatchAction(checkedTCReqDetails(newSelectedZphyrTCReqs));
        dispatchAction(checkedTreeIds(newSelectedZphyrTreeIds));
        dispatchAction(checkedParentIds(newSelectedZphyrParentIds));
        dispatchAction(checkedProjectIds(newSelectedZphyrProjIds));
        dispatchAction(checkedReleaseIds(newSelectedZphyrRelIds));
    }

    const handleNodeToggle = async (nodeobj) => {
        if(Object.keys(nodeobj).length && nodeobj.node && !isNaN(parseInt(nodeobj.node.key))){
            setEnableBounce(true);
            const data = await api.zephyrTestcaseDetails_ICE("testcase", nodeobj.node.key);
        if (data.error)
                setToast('error','Error',data.error);
            else if (data === "unavailableLocalServer")
                setToast('error','Error',MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
            else if (data === "scheduleModeOn")
                setToast('error','Error',MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
            else if (data === "Invalid Session"){
                setToast('error','Error','Invalid Session');
            }
            else {
                if(data.testcases.length){
                    updateChildrenData(projectDetails,data.testcases,data.modules);
                }
                if(data.modules.length && !data.testcases.length){
                    updateModuleData(nodeobj.node.key,data.modules);
                }
                setTestCases(data.testcases);
                setModules(data.modules);
                // setCollapse(false);
            }
        }
        setEnableBounce(false);
       
    }

    const  updateChildren =  (node, keyToUpdate, newChildren) => {
        if (!node.children) return node;
    
        const updatedChildren = node.children.map(child => {
            if (child.key === keyToUpdate) {
                return {
                    ...child,
                    children: [
                        ...(child.children || []),
                        ...newChildren.map(obj => {
                            const key = Object.keys(obj)[0];
                            const label = obj[key];
                            return { key, label, children: [] };
                        })
                    ]
                };
            } else if (child.children) {
                return updateChildren(child, keyToUpdate, newChildren);
            }
            return child;
        });
    
        return {
            ...node,
            children: updatedChildren
        };
    }

    



    const updateModuleData = (selectedkey,modules) => {
        if(projectDetails.length && modules.length){
            const findParent = (nodes, parentId, processedNodes,item) => {
                if(item){
                    for (let i = 0; i < nodes.length; i++) {
                        const node = nodes[i];
                        // && (!node.children || node.children.length < totalLen)
                        if (!processedNodes.has(node.key) && node.key === parentId) {
                            processedNodes.add(node.key);
                            if (!node.children) {
                                node.children = [];
                            } else {
                                // Remove empty object from children if exists
                                node.children = node.children.filter((child) => Object.keys(child).length > 0);
                            }
                           
                                    const existingChild = node.children.find(child => child.key === Object.keys(item)[0]);
                                    if(!existingChild){
                                        const additionalChildren = modules.map((obj) => ({
                                            key: Object.keys(obj)[0],
                                            label: Object.values(obj)[0],
                                            children: [{}],
                                            type: 'folder'
                                        }));
                                        node.children.push(...additionalChildren);
                                    }
                            return true;
                        } else if (node.children) {
                            const foundInChild = findParent(node.children, parentId, processedNodes,item);
                            if (foundInChild) return true;
                        }
                    }
                }
                
                return false;
            };
            modules.forEach((item) => {
                findParent(projectDetails, selectedkey, new Set(),item);
            });
            
        }
    }

    const updateChildrenData = (firstArray, secondArray, modules) => {
        let additionalChildrenAdded = false;
        let totalLen = secondArray.length + modules.length;
    
        const findParent = (nodes, parentId, processedNodes,item) => {
            if(item){
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    // && (!node.children || node.children.length < totalLen)
                    if (!processedNodes.has(node.key) && node.key === parentId && node.type !== 'testcase' && (!node.children ||  (node.children.length === 1 || node.children.length < totalLen))) {
                        processedNodes.add(node.key);
                        if (!node.children) {
                            node.children = [];
                        } else {
                            // Remove empty object from children if exists
                            node.children = node.children.filter((child) => Object.keys(child).length > 0);
                        }
                       
                        if(node && node.type !== 'testcase'){
                            if (modules.length && !additionalChildrenAdded) {
                                const existingChild = node.children.some(child => 
                                    modules.some(obj => child.key === Object.keys(obj)[0])
                                );
                                if(!existingChild){
                                    const additionalChildren = modules.map((obj) => ({
                                        key: Object.keys(obj)[0],
                                        label: Object.values(obj)[0],
                                        children: [{}],
                                        type: 'folder'
                                    }));
                                    node.children.push(...additionalChildren);
                                }
                                    
                                additionalChildrenAdded = true;
                            }
                            const existingChild = node.children.find(child => child.key === String(item.id));
                            if (!existingChild) {
                                node.children.push({
                                    key: String(item.id),
                                    label: item.name,
                                    type: 'testcase',
                                    cyclePhaseId:item.cyclePhaseId || '',
                                    parentId:item.parentId || parentId,
                                    reqdetails:item.reqdetails || []
                                });
                            }
                        }
                        return true;
                    } else if (node.children) {
                        const foundInChild = findParent(node.children, parentId, processedNodes,item);
                        if (foundInChild) return true;
                    }
                }
            }
            
            return false;
        };
    
        secondArray.forEach((item) => {
            const { parentId } = item;
            findParent(firstArray, parentId, new Set(),item);
        });
    };
    
    
      


    return (
        <>
            <div ref={dropdownRef}>
                {/* <Dialog header={selectedscreen.name ? `Manage Integration: ${selectedscreen.name} Integration` : 'Manage Integrations'} className='zephyrDialog' visible={visible} style={{ width: '70vw', height: '45vw', overflowX: 'hidden' }} onHide={onHide} footer={footerIntegrations}> */}
                    <div>
                        <div className="tab__cls1">
                            {activeIndex === 0 && <img className='import_img' src="static/imgs/import_icon.svg" id="lll" onClick={() => setShowNote(true)} />}
                            <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                                <TabPanel header="Mapping">
                                    <div className="zephyr__mapping">
                                        <div className="card_zephyr1">
                                            <Card className="mapping_zephyr_card1">
                                                {enableBounce && <div className="bouncing-loader">
                                                    <div></div>
                                                    <div></div>
                                                    <div></div>
                                                </div>}
                                                
                                                <div className="dropdown_div1">
                                                    <div className="dropdown-zephyr1">
                                                        <span>Select Project <span style={{ color: 'red' }}>*</span></span>
                                                        <span className="release_span"> Select Release<span style={{ color: 'red' }}>*</span></span>
                                                    </div>
                                                    <div className="dropdown-zephyr2">
                                                        {/* <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={selectZephyrProject} className="dropdown_project" options={zephyrProj} onChange={(e) => setSelectZephyrProject(e)} placeholder="Select Project" /> */}
                                                        <Dropdown value={selectZephyrProject} onChange={(e) => handleProject(e)} options={domainDetails} optionLabel="name"
                                                            placeholder="Select a City" className="project_dropdown" />
                                                        <Dropdown value={selectedRel} onChange={(e) => onReleaseSelect(e)} options={releaseArr} optionLabel="name"
                                                            placeholder="Select a City" className="release_dropdown" />
                                                        {/* <Dropdown style={{ width: '11rem', height: '2.5rem' }} value={selectZephyrRelease} className="dropdown_release" options={zephyrRelease} onChange={(e) => setSelectZephyrRelease(e)} placeholder="Select Release" /> */}
                                                    </div>

                                                </div>
                                                {selectZephyrProject && selectedRel && (<div className='zephyrdata-card1'>
                                                    <Tree
                                                        value={projectDetails}
                                                        selectionMode="single"
                                                        selectionKeys={selectedKeys}
                                                        onSelectionChange={(e) => setSelectedKeys(e.value)}
                                                        nodeTemplate={TreeNodeProjectCheckbox}
                                                        onExpand={handleNodeToggle}

                                                    />
                                                </div>)}
                                            </Card>
                                        </div>

                                        <div>
                                            <div className="card_zephyr2">
                                                <Card className="mapping_zephyr_card2">
                                                    <div className="dropdown_div1">
                                                        <div className="dropdown-zephyr">
                                                            <span>Selected Project <span style={{ color: 'red' }}>*</span></span>
                                                        </div>
                                                        <div className="dropdown-zephyr">
                                                            {/* <Dropdown options={avoProjects} style={{ width: '11rem', height: '2.5rem' }} value={selectedAvo} onChange={(e) => onAvoProjectChange(e)} className="dropdown_project" placeholder="Select Project" /> */}
                                                            <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>

                                                        </div>

                                                        <div className="avotest__zephyr">
                                                            <Tree value={treeData} selectionMode="single" selectionKeys={selectedAvoKeys} onSelectionChange={(e) => setSelectedAvoKeys(e.value)} nodeTemplate={TreeNodeCheckbox} className="avoProject_tree" />
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        </div>
                                        <span>
                                            {/* <img className="map__btn__zephyr" src="static/imgs/map_button_icon.svg" /> */}
                                            <Button className="map__btn__zephyr" label='Map' severity='primary' size='small'></Button>
                                        </span>
                                    </div>


                                </TabPanel>

                                <TabPanel header="View Mapping">
                                    <Card className="view_map_zephyr">
                                        <div className="flex justify-content-flex-start toggle_btn">
                                            <span>Zephyr Testcase to Avo Assure Testcase</span>
                                            <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                                            <span>Avo Assure Testcase to Zephyr Testcase</span>
                                        </div>

                                        {checked ? (<div className="accordion_testcase">
                                            <Accordion multiple activeIndex={0} >
                                                {avoTestCase.map((testcase) => (
                                                    <AccordionTab header="Avo Assure Testcase">
                                                        <span>{testcase.Zephyr}</span>
                                                    </AccordionTab>))}
                                            </Accordion>
                                        </div>

                                        ) : (

                                            <div className="accordion_testcase">
                                                <Accordion multiple activeIndex={0}>
                                                    {zephyrTestCase.map((testCase) => (
                                                        <AccordionTab header="Zephyr Testcase">
                                                            <span>{testCase.avoassure}</span>
                                                        </AccordionTab>))}
                                                </Accordion>
                                            </div>
                                        )}
                                    </Card>

                                </TabPanel>

                            </TabView>

                            <AvoConfirmDialog
                                visible={showNote}
                                onHide={() => setShowNote(false)}
                                showHeader={false}
                                message={confirmPopupMsg}
                                icon="pi pi-exclamation-triangle"
                                accept={() => { setImportMap(true); }} />

                        </div>
                    </div>
                    <Dialog header="Import mappings" visible={importMap} onHide={() => { setImportMap(false); setFiledUpload(undefined) }} style={{ height: fileUpload && selectZephyrProject ?'96vh':fileUpload ? '46vh' : '28vh', width: fileUpload && selectZephyrProject ?'36vw':fileUpload ? '39vw' : '28vw' }} footer={importMappingFooter}>
                        <div>
                            <div>
                                <label>Upload Excel File: </label>
                                <input type='file' accept=".xls, .xlsx" onChange={upload} ref={uploadFileRef} />
                            </div>
                            <div className='dropdown_lists'>
                                {fileUpload && (
                                    <>
                                        <div>
                                            <label>Select Sheet:</label>
                                            <Dropdown
                                                value={selectSheet}
                                                options={[...sheetList.map((sheet) => ({ label: sheet, value: sheet })),]}
                                                onChange={(e) => setSelectSheet(e.value)}
                                                placeholder="Select Sheet"
                                                className='excelSheet_dropdown'
                                            />
                                        </div>
                                        <div>
                                            <label>Select Project:</label>
                                            <Dropdown
                                                value={selectZephyrProject}
                                                onChange={(e) => setSelectZephyrProject(e.value)}
                                                options={zephyrProj}
                                                optionLabel="name"
                                                placeholder="Select Project"
                                                className='selectProject_dropdown'/>
                                                
                                        </div>
                                        <div>
                                            <label>Select Release:</label>
                                            <Dropdown
                                                value={selectZephyrRelease}
                                                onChange={(e) => setSelectZephyrRelease(e.value)}
                                                options={zephyrRelease}
                                                optionLabel="name"
                                                placeholder="Select Release"
                                                className='selectRelease_dropdown'/>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div>
                                {fileUpload && selectZephyrProject &&(
                                    <>
                                        <div>
                                            <div className='zephyrdata-card1 selectPhase'>
                                                <label>
                                                    Select Phase/Module
                                                </label>
                                                <Tree
                                                    value={data}
                                                    selectionMode="checkbox"
                                                    selectionKeys={selectedKeys}
                                                    onSelectionChange={(e) => setSelectedKeys(e.value)}

                                                />
                                            </div>
                                            <div>
                                            <label>Select AVO Project:</label>
                                            <Dropdown value={selectetestcase} onChange={(e) => setSelectedtestcase(e.value)} options={testcaseAvo} optionLabel="name" 
                placeholder="Select AVO Project" className='testcase_data_2'/>

                                            </div>
                                        </div>

                                    </>
                                )}
                            </div>
                        </div>
                    </Dialog>
                {/* </Dialog> */}
            </div>
        </>)
}
export default ZephyrContent;