import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import { InputSwitch } from "primereact/inputswitch";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import { Tree } from 'primereact/tree';
import { Paginator } from 'primereact/paginator';
import { Checkbox } from 'primereact/checkbox';
import { useSelector, useDispatch } from 'react-redux';
import * as api from '../api.js';
import { selectedProject, mappedTree } from '../settingSlice';
import { getProjectsMMTS } from '../../design/api';
import { enableSaveButton, mappedPair, updateTestrailMapping } from "../settingSlice";
import { Messages as MSG } from '../../global';

const TestRailContent = ({ domainDetails, ref, setToast }) => {
    // use states, refs
    const [testRailProjectsName, setTestRailProjectsName] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [updatedTreeData, setUpdatedTreeData] = useState([]);
    const [rows, setRows] = useState([]);
    const [projectSuites, setProjectSuites] = useState([]);
    const [sectionData, setSectionData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTestRailNodeFirstTree, setSelectedTestRailNodeFirstTree] = useState({});
    const [selectedTestRailNodesSecondTree, setSelectedTestRailNodesSecondTree] = useState([]);
    const [checked, setChecked] = useState(false);
    const toast = useRef();

    // constants, variables
    const projectDetails = JSON.parse(localStorage.getItem("DefaultProject"));
    const dropDownStyle = { width: '11rem', height: '2.5rem' };

    // use selectors
    const dispatch = useDispatch();
    const currentProject = useSelector(state => state.setting.selectedProject);
    const reduxDefaultselectedProject = useSelector((state) => state.landing.defaultSelectProject);
    const isTestrailMapped = useSelector(state => state.setting.updateTestrailMapping);
    const mappedData = useSelector(state => state.setting.mappedPair);


    const handleTabChange = (index) => {
        setActiveIndex(index);
    };

    const onDropdownChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        dispatch(selectedProject(e.value));
        setSelectedTestRailNodeFirstTree({});
        setSelectedTestRailNodesSecondTree([]);
        setSectionData([]);

        const testrailTestSuites = await api.getSuitesTestrail_ICE({
            TestRailAction: "getSuites",
            projectId: e.value.id
        });

        if (testrailTestSuites.error)
            setToast("error", "Error", testrailTestSuites.error);

        if (testrailTestSuites.length > 0) {
            const _testrailTestSuites = testrailTestSuites.map((suite, index) => ({
                ...suite,
                key: `${index}`
            }));

            setProjectSuites(_testrailTestSuites);
            setLoading(false);
        };
    };

    // Fetching AVO testcases
    useEffect(() => {
        const fetchAvoModules = async () => {
            const getModulesData = await getProjectsMMTS(projectDetails.projectId);
            const testCasesList = getModulesData[0].mindmapList?.flatMap(({ scenarioList, ...rest }) => (
                scenarioList.map(scenario => ({
                    ...scenario,
                    children: [],
                    checked: false,
                    testcaseType: "parent",
                    testSuite: {
                        ...rest
                    }
                }))
            )).map((obj, index) => {
                return { ...obj, key: index }
            });

            setUpdatedTreeData(() => testCasesList);
        };

        fetchAvoModules();
    }, []);

    // Fetching Testrail test suites, test  sections & test  cases
    useEffect(() => {
        const fetchSections = async () => {
            setLoading(true);
            try {
                const testSection = [];

                for (let i = 0; i < projectSuites.length; i++) {
                    const suite = projectSuites[i];
                    const sections = await api.getSectionsTestrail_ICE({
                        "projectId": currentProject.id,
                        "suiteId": suite.id,
                        "testrailAction": "getSections"
                    });

                    for (let index = 0; index < sections.length; index++) {
                        sections[index] = {
                            ...sections[index],
                            key: `${projectSuites[i].key}-${index}`
                        };
                    }

                    testSection.push({
                        ...suite,
                        children: sections || []
                    });
                }

                const fetchTestCases = async (projectId, suiteId, sectionId, outerIndex) => {
                    try {
                        const response = await api.getTestcasesTestrail_ICE({
                            projectId,
                            suiteId,
                            sectionId,
                            testrailAction: "getTestCases"
                        });

                        const testCaseDetails = [];

                        if (response.length > 0) {
                            for (let i = 0; i < response.length; i++) {
                                const testCase = response[i];
                                const testCaseWithType = {
                                    ...testCase,
                                    type: "testcase",
                                    name: testCase.title,
                                    key: `${outerIndex}-${i}`
                                };
                                testCaseDetails.push(testCaseWithType);
                            }
                        }
                        setLoading(false);
                        return testCaseDetails;
                    } catch (error) {
                        console.error("Error fetching test cases:", error);
                        return [];
                    }
                };


                const organizeSectionsIntoHierarchy = async (sections, parentId = null) => {
                    const result = [];

                    for (let i = 0; i < sections.length; i++) {
                        const section = sections[i];
                        if (section.parent_id === parentId) {
                            const children = await organizeSectionsIntoHierarchy(sections, section.id);
                            const newItem = { ...section, children };

                            if (children.length === 0) {
                                newItem.type = "parent";
                                newItem.key = `${section.key}-${i}`
                                const { suite_id, id: sectionId } = newItem;
                                newItem.children = await fetchTestCases(currentProject.id, suite_id, sectionId, `${section.key}-${i}`);
                            }

                            result.push(newItem);
                        }
                    }

                    return result;
                }

                const testCaseData = [];

                for (let i = 0; i < testSection.length; i++) {
                    const section = testSection[i];
                    const organizedHierarchy = await organizeSectionsIntoHierarchy(section.children) || [];

                    testCaseData.push({
                        ...section,
                        children: organizedHierarchy
                    });
                    setLoading(false);
                }

                setSectionData((sectionData) => testCaseData);
                setLoading(false);
            }
            catch (error) {
                console.log(error);
            }
        };

        fetchSections();
    }, [projectSuites]);

    const treeCheckboxTemplateFirstTree = (node) => {
        if (node?.type === "testcase") {
            return <>
                <Checkbox
                    value={node?.id}
                    checked={selectedTestRailNodeFirstTree.id === node.id}
                    onChange={(e) => handleNodeToggleFirstTree(node)}
                />
                <span className="scenario_label">{node.name}</span>
            </>
        }
        else return <span className="scenario_label">{node.name}</span>
    };

    const treeCheckboxTemplateSecondTree = (node) => {
        if (node.testcaseType === "parent") {
            return <>
                <Checkbox
                    value={node}
                    checked={selectedTestRailNodesSecondTree.includes(node._id)}
                    onChange={(e) => handleNodeToggleSecondTree(e, node)}
                    disabled={!Object.keys(selectedTestRailNodeFirstTree)?.length}
                />
                <span className="scenario_label">{node.name} - {node.testSuite?.name}</span>
            </>
        }
        else return <span className="scenario_label">{node.name}</span>
    };


    const handleNodeToggleFirstTree = (node) => {
        if (selectedTestRailNodeFirstTree.id === node.id) {
            setSelectedTestRailNodeFirstTree({});
        } else {
            setSelectedTestRailNodeFirstTree({ id: node.id, name: node.name, suite_id: node.suite_id });
        }
    };

    const handleNodeToggleSecondTree = (e, node) => {
        const selectedNodes = [...selectedTestRailNodesSecondTree];

        if (e.checked) {
            selectedNodes.push(node._id);
        } else {
            const nodeIndex = selectedNodes.indexOf(node._id);
            if (nodeIndex !== -1) {
                selectedNodes.splice(nodeIndex, 1);
            }
        }

        setSelectedTestRailNodesSecondTree(selectedNodes);
    };

    const handleSync = () => {
        let scenarioIdsList = [];
        const { id, name, suite_id } = selectedTestRailNodeFirstTree;

        const data = updatedTreeData?.map((item) => {
            if (selectedTestRailNodesSecondTree.includes(item._id)) {
                scenarioIdsList.push(item._id);
                return { ...item, checked: true, children: [{ _id: id, name: name, testcaseType: "children", suite_id }] }
            } else {
                return { ...item, checked: false }
            }
        });

        const mappedData = {
            "mappedDetails": [
                {
                    "projectid": [currentProject.id],
                    "suiteid": [suite_id], // testrail suite id
                    "testid": [id], // testrail test id
                    "testname": [name], // selected calm test case name
                    "scenarioid": scenarioIdsList // selected avo test case id
                }
            ]
        };

        setUpdatedTreeData((updatedTreeData) => data);
        if (selectedTestRailNodesSecondTree.length === 0 || Object.keys(selectedTestRailNodeFirstTree)?.length === 0) {
            dispatch(enableSaveButton(false));
        } else {
            dispatch(enableSaveButton(true));
        }
        dispatch(mappedPair(mappedData));
        setSelectedTestRailNodeFirstTree({});
        setSelectedTestRailNodesSecondTree([]);
    }

    const fetchMappedTestcases = async () => {
        const data = await api.viewTestrailMappedList();
        setRows(data);
        dispatch(updateTestrailMapping(false));
    };

    const handleUnSyncmappedData = async (items, scenario = null, testCaseNames = null) => {
        if (Object.keys(items).length) {
            let findMappedId = rows.filter((row) => row._id === items._id);
            if (findMappedId && findMappedId.length) {
                const unSyncObj = [];
                if (scenario != null) {
                    unSyncObj.push({
                        'mapid': items._id,
                        'testscenarioid': items?.testscenarioid?.filter((scenarioid) => scenarioid == scenario)
                    });
                } else if (testCaseNames != null) {
                    unSyncObj.push({
                        'mapid': items._id,
                        'testCaseNames': items?.testname?.filter((name) => name == testCaseNames)
                    });
                }

                let args = Object.values(unSyncObj);
                args['screenType'] = "Testrail";

                const saveUnsync = await api.saveUnsyncDetails(args);

                if (saveUnsync.error)
                    setToast("error", "Error", 'Failed to Unsync');
                else if (saveUnsync === "unavailableLocalServer")
                    setToast("error", "Error", MSG.INTEGRATION.ERR_UNAVAILABLE_ICE.CONTENT);
                else if (saveUnsync === "scheduleModeOn")
                    setToast("info", "Info", MSG.GENERIC.WARN_UNCHECK_SCHEDULE.CONTENT);
                else if (saveUnsync === "fail")
                    setToast("error", "Error", MSG.INTEGRATION.ERR_SAVE.CONTENT);
                else if (saveUnsync == "success") {
                    fetchMappedTestcases();
                    setToast("success", "Success", 'Mapped data unsynced successfully');
                }
            }

            const removeTestCase = updatedTreeData.map((data) => {
                if (data._id == scenario) {
                    if (data.children && data.children.length > 0) {
                        const filteredChildren = data.children.filter((child) => child._id != items.testid[0]);
                        console.log("filteredChildren", filteredChildren);

                        return {
                            ...data,
                            children: filteredChildren
                        };
                    }
                    return data;
                } else
                    return data;
            });

            dispatch(mappedTree(removeTestCase));
            setUpdatedTreeData((prevTreeData) => removeTestCase);
        }
    }

    useEffect(() => {
        setTestRailProjectsName(domainDetails?.projects);
    }, [domainDetails?.projects]);

    useEffect(() => {
        if (isTestrailMapped) fetchMappedTestcases();
    }, [isTestrailMapped]);

    return (
        <div className="tab__cls">
            <div className="tab__cls">
                <TabView activeIndex={activeIndex} onTabChange={(e) => handleTabChange(e.index)}>
                    <TabPanel header="Mapping">
                        <div className="data__mapping">
                            <div className="card_data1">
                                <Card className="mapping_data_card1">
                                    <div className="dropdown_div">
                                        <div className="dropdown-map1">
                                            <span>Select TestRail Projects <span style={{ color: 'red' }}>*</span></span>
                                        </div>
                                        <div className="dropdown-map2">
                                            <Dropdown style={dropDownStyle} className="dropdown_project" placeholder="Select Project" optionLabel="name" options={testRailProjectsName} value={currentProject} onChange={(e) => onDropdownChange(e)} />
                                        </div>
                                    </div>
                                    <div className='zephyrdata-card1'>

                                        {
                                            sectionData.length > 0 ?
                                                <Tree
                                                    value={sectionData}
                                                    selectionMode="single"
                                                    selectionKeys={selectedTestRailNodeFirstTree}
                                                    nodeTemplate={treeCheckboxTemplateFirstTree}
                                                />
                                                :
                                                (loading && <div className="bouncing-loader">
                                                    <div></div>
                                                    <div></div>
                                                    <div></div>
                                                </div>)
                                        }
                                        {/* <div className="jira__paginator">
                                                <Paginator
                                                    first={currentZepPage - 1}
                                                    rows={itemsPerPage}
                                                    totalRecords={projectDetails.length}
                                                    onPageChange={(e) => setCurrentZepPage(e.page + 1)}
                                                    totalPages={totalPages} // Set the totalPages prop
                                                />
                                            </div> */}
                                    </div>
                                </Card>
                            </div>
                            <div>
                                <div className="card_data2">
                                    <Card className="mapping_data_card2">
                                        <div className="dropdown_div">
                                            <div className="dropdown-map">
                                                <span>Project <span style={{ color: 'red' }}>*</span></span>
                                            </div>
                                            <div className="dropdown-map">
                                                {/* <Dropdown options={avoProjects} style={{ width: '11rem', height: '2.5rem' }} value={selectedAvo} onChange={(e) => onAvoProjectChange(e)} className="dropdown_project" placeholder="Select Project" /> */}
                                                <span className="selected_projName" title={reduxDefaultselectedProject.projectName}>{reduxDefaultselectedProject.projectName}</span>
                                            </div>

                                            <div>
                                                <div className="avotest__data">
                                                    <Tree value={updatedTreeData}
                                                        selectionMode="multiple"
                                                        selectionKeys={selectedTestRailNodesSecondTree}
                                                        nodeTemplate={treeCheckboxTemplateSecondTree}
                                                        className="avoProject_tree" />
                                                </div>
                                                <div className="testcase__AVO__jira__paginator">
                                                    {/* <Paginator
                                                            first={indexOfFirstScenario}
                                                            rows={scenariosPerPage}
                                                            totalRecords={listofScenarios.length}
                                                            onPageChange={onPageAvoChange}
                                                        /> */}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                            <span>
                                <Button className="map__btn" label="Map" size="small" onClick={() => handleSync()} />
                            </span>
                        </div>
                    </TabPanel>
                    <TabPanel header="View Mapping">
                        <Card className="view_map_card">
                            <div className="flex justify-content-flex-start toggle_btn">
                                <span>TestRail Testcase to Avo Assure Testcase</span>
                                <InputSwitch checked={checked} onChange={(e) => setChecked(e.value)} />
                                <span>Avo Assure Testcase to TestRail Testcase</span>
                            </div>
                            {checked ? (
                                <div className="accordion_testcase">
                                    <Accordion multiple activeIndex={0}>
                                        {rows?.map((item) => (
                                            item.testname?.map((name) => (
                                                <AccordionTab key={item._id} header={<span>{name}</span>}>
                                                    {item.testscenarioname.map((scenario, index) => (
                                                        <div className='unsync-icon' key={index}>
                                                            <span>{scenario}</span>
                                                            <i className="pi pi-times" onClick={() => handleUnSyncmappedData(item, item.testscenarioid[index], null)} />
                                                        </div>
                                                    ))}
                                                </AccordionTab>
                                            ))
                                        ))}
                                    </Accordion>
                                </div>
                            ) : (
                                <div className="accordion_testcase">
                                    <Accordion multiple activeIndex={0}>
                                        {rows?.map((item) => (
                                            item.testscenarioname?.map((testname) => (
                                                <AccordionTab key={item._id} header={<span>{testname}</span>}>
                                                    {item.testname?.map((test, index) => (
                                                        <div className='unsync-icon' key={index}>
                                                            <p>{test}</p>
                                                            <i className="pi pi-times cross_icon_zephyr" onClick={() => handleUnSyncmappedData(item, null, item.testname[index])} />
                                                        </div>
                                                    ))}
                                                </AccordionTab>
                                            ))
                                        )
                                        )}
                                    </Accordion>
                                </div>
                            )}
                        </Card>
                    </TabPanel>
                </TabView>
            </div>
        </div>
    )
}

export default TestRailContent;