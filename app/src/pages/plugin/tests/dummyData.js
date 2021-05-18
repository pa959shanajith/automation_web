// To store data which will be used to simulate the tests. 
import * as actionTypes from '../state/action';


// Data for TaskSection.js
export const userInfo={
    "user_id": "5fb4fbf9f4da702833d7e09e",
    "username": "user.demo",
    "email_id": "user.demo@slkgroup.com",
    "additionalrole": [],
    "firstname": "user",
    "lastname": "demo",
    "role": "5db0022cf87fdec084ae49aa",
    "taskwflow": false,
    "token": "720",
    "dbuser": true,
    "ldapuser": false,
    "samluser": false,
    "openiduser": false,
    "rolename": "Test Lead",
    "pluginsInfo": [
      {
        "pluginName": "Integration",
        "pluginValue": true
      },
      {
        "pluginName": "APG",
        "pluginValue": false
      },
      {
        "pluginName": "Dashboard",
        "pluginValue": false
      },
      {
        "pluginName": "Mindmap",
        "pluginValue": true
      },
      {
        "pluginName": "Neuron Graphs",
        "pluginValue": false
      },
      {
        "pluginName": "Performance Testing",
        "pluginValue": false
      },
      {
        "pluginName": "Reports",
        "pluginValue": true
      },
      {
        "pluginName": "Utility",
        "pluginValue": true
      },
      {
        "pluginName": "Webocular",
        "pluginValue": false
      }
    ],
    "page": "plugin",
    "tandc": false
}

export const dummyPlugin={
  "pluginName": "Reports",
  "pluginValue": true,
  "image":"Reports"
}

export const dummyData=
{
  "appType": [
    "5db0022cf87fdec084ae49b6",
    "5db0022cf87fdec084ae49af"
  ],
  "appTypeName": [
    "Web",
    "Desktop"
  ],
  "cycles": {
    "5fb4fc98f4da702833d7e09f": [
      "5fb4fc98f4da702833d7e09f",
      "r1",
      "c1"
    ],
    "5fdde98cd2ce8ecfe9689649": [
      "5fdde98cd2ce8ecfe9689649",
      "r1",
      "c1"
    ]
  },
  "domains": [
    "Banking",
    "Banking"
  ],
  "projectId": [
    "5fb4fc98f4da702833d7e0a0",
    "5fdde98cd2ce8ecfe968964a"
  ],
  "projectName": [
    "test",
    "desk"
  ],
  "projecttypes": {
    "5db0022cf87fdec084ae49ae": "Generic",
    "5db0022cf87fdec084ae49af": "Desktop",
    "5db0022cf87fdec084ae49b0": "Mainframe",
    "5db0022cf87fdec084ae49b1": "MobileApp",
    "5db0022cf87fdec084ae49b2": "MobileWeb",
    "5db0022cf87fdec084ae49b3": "OEBS",
    "5db0022cf87fdec084ae49b4": "SAP",
    "5db0022cf87fdec084ae49b5": "System",
    "5db0022cf87fdec084ae49b6": "Web",
    "5db0022cf87fdec084ae49b7": "Webservice"
  },
  "releases": [
    [
      {
        "cycles": [
          {
            "_id": "5fb4fc98f4da702833d7e09f",
            "name": "c1"
          }
        ],
        "name": "r1"
      }
    ],
    [
      {
        "cycles": [
          {
            "_id": "5fdde98cd2ce8ecfe9689649",
            "name": "c1"
          }
        ],
        "name": "r1"
      }
    ]
  ]
}

export const dummyData1=
[
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "",
    "screenName": "",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "5fb4ffc5f4da702833d7e0a2",
    "scenarioName": "Scenario_username",
    "assignedTestScenarioIds": [
      "5fb4ffc5f4da702833d7e0a2"
    ],
    "taskDetails": [
      {
        "taskName": "Execute Scenario Scenario_username",
        "taskDescription": "Execute Scenario scenario Scenario_username",
        "taskType": "Execution",
        "subTaskType": "TestSuite",
        "subTaskId": "5fb50128f4da702833d7e0a6",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fb50128f4da702833d7e0a6"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f",
        "testsuiteid": "5fb4ffc5f4da702833d7e0a1",
        "testsuitename": "testsuitename",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fb50128f4da702833d7e0a6"
      }
    ],
    "scenarioFlag": "True",
    "releaseid": "",
    "cycleid": ""
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "",
    "screenName": "",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Execute Module_0",
        "taskDescription": "Execute module Module_0",
        "taskType": "Execution",
        "subTaskType": "TestSuite",
        "subTaskId": "5fc5cc6b110d9da9191c7bd9",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fc5cc6b110d9da9191c7bd9"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f",
        "testsuiteid": "5fbbf896f4da702833d7e0e1",
        "testsuitename": "Module_0",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fc5cc6b110d9da9191c7bd9"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "",
    "cycleid": ""
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "",
    "screenName": "",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "5fbbf896f4da702833d7e0e2",
    "scenarioName": "Scenario_login",
    "assignedTestScenarioIds": [
      "5fbbf896f4da702833d7e0e2"
    ],
    "taskDetails": [
      {
        "taskName": "Execute Scenario Scenario_login",
        "taskDescription": "Execute Scenario scenario Scenario_login",
        "taskType": "Execution",
        "subTaskType": "TestSuite",
        "subTaskId": "5fc5cc6b110d9da9191c7bda",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fc5cc6b110d9da9191c7bda"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f",
        "testsuiteid": "5fbbf896f4da702833d7e0e1",
        "testsuitename": "Module_0",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fc5cc6b110d9da9191c7bda"
      }
    ],
    "scenarioFlag": "True",
    "releaseid": "",
    "cycleid": ""
  },
  {
    "appType": "Web",
    "projectId": "",
    "screenId": "",
    "screenName": "",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Execute Batch batch1",
        "taskDescription": "Execute module Module_login",
        "taskType": "Execution",
        "subTaskType": "TestSuite",
        "subTaskId": "5fca36ed21f3b014dbfb600c",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fca36ed21f3b014dbfb600c"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f",
        "testsuiteid": "5fb4ffc5f4da702833d7e0a1",
        "testsuitename": "Module_login",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fca36ed21f3b014dbfb600c"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "",
    "cycleid": ""
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "5fbbf896f4da702833d7e0e3",
    "screenName": "Screen_login",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Scrape Screen_login",
        "taskDescription": "Scrape screen Screen_login",
        "taskType": "Design",
        "subTaskType": "Scrape",
        "subTaskId": "5fcb526921f3b014dbfb6011",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fcb526921f3b014dbfb6011"
        ],
        "status": "underReview",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "",
        "cycleid": "",
        "testsuiteid": "",
        "testsuitename": "",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fcb526921f3b014dbfb6011"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "r1",
    "cycleid": "5fb4fc98f4da702833d7e09f"
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "",
    "screenName": "",
    "testCaseId": "5fbbf896f4da702833d7e0e4",
    "versionnumber": 0,
    "testCaseName": "Testcase_login",
    "scenarioId": "5fbbf896f4da702833d7e0e2",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Design Testcase_login",
        "taskDescription": "Design testcase Testcase_login",
        "taskType": "Design",
        "subTaskType": "TestCase",
        "subTaskId": "5fcb7ab021f3b014dbfb6015",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fcb7ab021f3b014dbfb6015"
        ],
        "status": "underReview",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "",
        "cycleid": "",
        "testsuiteid": "",
        "testsuitename": "",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fcb7ab021f3b014dbfb6015"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "r1",
    "cycleid": "5fb4fc98f4da702833d7e09f"
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "5fb4ffc5f4da702833d7e0a3",
    "screenName": "Screen_test1",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Scrape Screen_test1",
        "taskDescription": "Scrape screen Screen_test1",
        "taskType": "Design",
        "subTaskType": "Scrape",
        "subTaskId": "5fd1e8be9250e82ce08d0297",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fd1e8be9250e82ce08d0297"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "",
        "cycleid": "",
        "testsuiteid": "",
        "testsuitename": "",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fd1e8be9250e82ce08d0297"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "r1",
    "cycleid": "5fb4fc98f4da702833d7e09f"
  },
  {
    "appType": "Desktop",
    "projectId": "5fdde98cd2ce8ecfe968964a",
    "screenId": "",
    "screenName": "",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Execute Module_d1",
        "taskDescription": "Execute module Module_d1",
        "taskType": "Execution",
        "subTaskType": "TestSuite",
        "subTaskId": "5fddea18d2ce8ecfe968964f",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fddea18d2ce8ecfe968964f"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fdde98cd2ce8ecfe9689649"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "r1",
        "cycleid": "5fdde98cd2ce8ecfe9689649",
        "testsuiteid": "5fdde9efd2ce8ecfe968964b",
        "testsuitename": "Module_d1",
        "projectidts": "5fdde98cd2ce8ecfe968964a",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fddea18d2ce8ecfe968964f"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "",
    "cycleid": ""
  },
  {
    "appType": "Desktop",
    "projectId": "5fdde98cd2ce8ecfe968964a",
    "screenId": "",
    "screenName": "",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "5fdde9efd2ce8ecfe968964c",
    "scenarioName": "Scenario_d1",
    "assignedTestScenarioIds": [
      "5fdde9efd2ce8ecfe968964c"
    ],
    "taskDetails": [
      {
        "taskName": "Execute Scenario Scenario_d1",
        "taskDescription": "Execute Scenario scenario Scenario_d1",
        "taskType": "Execution",
        "subTaskType": "TestSuite",
        "subTaskId": "5fddea18d2ce8ecfe9689650",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fddea18d2ce8ecfe9689650"
        ],
        "status": "assigned",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fdde98cd2ce8ecfe9689649"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "r1",
        "cycleid": "5fdde98cd2ce8ecfe9689649",
        "testsuiteid": "5fdde9efd2ce8ecfe968964b",
        "testsuitename": "Module_d1",
        "projectidts": "5fdde98cd2ce8ecfe968964a",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fddea18d2ce8ecfe9689650"
      }
    ],
    "scenarioFlag": "True",
    "releaseid": "",
    "cycleid": ""
  },
  {
    "appType": "Desktop",
    "projectId": "5fdde98cd2ce8ecfe968964a",
    "screenId": "5fdde9efd2ce8ecfe968964d",
    "screenName": "Screen_d1",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Scrape Screen_d1",
        "taskDescription": "Scrape screen Screen_d1",
        "taskType": "Design",
        "subTaskType": "Scrape",
        "subTaskId": "5fddea18d2ce8ecfe9689651",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fddea18d2ce8ecfe9689651"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fdde98cd2ce8ecfe9689649"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "",
        "cycleid": "",
        "testsuiteid": "",
        "testsuitename": "",
        "projectidts": "5fdde98cd2ce8ecfe968964a",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fddea18d2ce8ecfe9689651"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "r1",
    "cycleid": "5fdde98cd2ce8ecfe9689649"
  },
  {
    "appType": "Desktop",
    "projectId": "5fdde98cd2ce8ecfe968964a",
    "screenId": "",
    "screenName": "",
    "testCaseId": "5fdde9efd2ce8ecfe968964e",
    "versionnumber": 0,
    "testCaseName": "Testcase_d2",
    "scenarioId": "5fdde9efd2ce8ecfe968964c",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Design Testcase_d2",
        "taskDescription": "Design testcase Testcase_d2",
        "taskType": "Design",
        "subTaskType": "TestCase",
        "subTaskId": "5fddea18d2ce8ecfe9689652",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fddea18d2ce8ecfe9689652"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fdde98cd2ce8ecfe9689649"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "",
        "cycleid": "",
        "testsuiteid": "",
        "testsuitename": "",
        "projectidts": "5fdde98cd2ce8ecfe968964a",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fddea18d2ce8ecfe9689652"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "r1",
    "cycleid": "5fdde98cd2ce8ecfe9689649"
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "",
    "screenName": "",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Execute Module_test31",
        "taskDescription": "Execute module Module_test31",
        "taskType": "Execution",
        "subTaskType": "TestSuite",
        "subTaskId": "5fecc81dd2ce8ecfe96896a5",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fecc81dd2ce8ecfe96896a5"
        ],
        "status": "assigned",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f",
        "testsuiteid": "5fecc7e4d2ce8ecfe96896a1",
        "testsuitename": "Module_test31",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fecc81dd2ce8ecfe96896a5"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "",
    "cycleid": ""
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "",
    "screenName": "",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "5fecc7e4d2ce8ecfe96896a2",
    "scenarioName": "Scenario_test31",
    "assignedTestScenarioIds": [
      "5fecc7e4d2ce8ecfe96896a2"
    ],
    "taskDetails": [
      {
        "taskName": "Execute Scenario Scenario_test31",
        "taskDescription": "Execute Scenario scenario Scenario_test31",
        "taskType": "Execution",
        "subTaskType": "TestSuite",
        "subTaskId": "5fecc81dd2ce8ecfe96896a6",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fecc81dd2ce8ecfe96896a6"
        ],
        "status": "assigned",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f",
        "testsuiteid": "5fecc7e4d2ce8ecfe96896a1",
        "testsuitename": "Module_test31",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fecc81dd2ce8ecfe96896a6"
      }
    ],
    "scenarioFlag": "True",
    "releaseid": "",
    "cycleid": ""
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "5fecc7e5d2ce8ecfe96896a3",
    "screenName": "Screen_test31",
    "testCaseId": "",
    "versionnumber": 0,
    "testCaseName": "",
    "scenarioId": "",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Scrape Screen_test31",
        "taskDescription": "Scrape screen Screen_test31",
        "taskType": "Design",
        "subTaskType": "Scrape",
        "subTaskId": "5fecc81dd2ce8ecfe96896a7",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fecc81dd2ce8ecfe96896a7"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "",
        "cycleid": "",
        "testsuiteid": "",
        "testsuitename": "",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fecc81dd2ce8ecfe96896a7"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "r1",
    "cycleid": "5fb4fc98f4da702833d7e09f"
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "",
    "screenName": "",
    "testCaseId": "5fecc7e5d2ce8ecfe96896a4",
    "versionnumber": 0,
    "testCaseName": "Testcase_test31",
    "scenarioId": "5fecc7e4d2ce8ecfe96896a2",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Design Testcase_test31",
        "taskDescription": "Design testcase Testcase_test31",
        "taskType": "Design",
        "subTaskType": "TestCase",
        "subTaskId": "5fecc81dd2ce8ecfe96896a8",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fecc81dd2ce8ecfe96896a8"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "",
        "cycleid": "",
        "testsuiteid": "",
        "testsuitename": "",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fecc81dd2ce8ecfe96896a8"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "r1",
    "cycleid": "5fb4fc98f4da702833d7e09f"
  },
  {
    "appType": "Web",
    "projectId": "5fb4fc98f4da702833d7e0a0",
    "screenId": "",
    "screenName": "",
    "testCaseId": "5fb4ffc5f4da702833d7e0a4",
    "versionnumber": 0,
    "testCaseName": "Testcase_1",
    "scenarioId": "5fb4ffc5f4da702833d7e0a2",
    "scenarioName": "",
    "assignedTestScenarioIds": [],
    "taskDetails": [
      {
        "taskName": "Design Testcase_1",
        "taskDescription": "Design testcase Testcase_1",
        "taskType": "Design",
        "subTaskType": "TestCase",
        "subTaskId": "5fed78d4d2ce8ecfe96896b3",
        "assignedTo": "5fb4fbf9f4da702833d7e09e",
        "reviewer": "5fb4fbf9f4da702833d7e09e",
        "startDate": "",
        "expectedEndDate": "",
        "batchTaskIDs": [
          "5fed78d4d2ce8ecfe96896b3"
        ],
        "status": "inprogress",
        "reuse": "False",
        "releaseid": "r1",
        "cycleid": "5fb4fc98f4da702833d7e09f"
      }
    ],
    "testSuiteDetails": [
      {
        "assignedTime": "",
        "releaseid": "",
        "cycleid": "",
        "testsuiteid": "",
        "testsuitename": "",
        "projectidts": "5fb4fc98f4da702833d7e0a0",
        "assignedTestScenarioIds": "",
        "subTaskId": "5fed78d4d2ce8ecfe96896b3"
      }
    ],
    "scenarioFlag": "False",
    "releaseid": "r1",
    "cycleid": "5fb4fc98f4da702833d7e09f"
  }
]

export const dataDict={
  "project": {
    "5fb4fc98f4da702833d7e0a0": {
      "release": {
        "r1": [
          "5fb4fc98f4da702833d7e09f"
        ]
      },
      "domain": "Banking",
      "appType": {
        "Web": "5db0022cf87fdec084ae49b6"
      }
    },
    "": {
      "release": {
        "r1": [
          "5fb4fc98f4da702833d7e09f"
        ]
      },
      "appType": {}
    },
    "5fdde98cd2ce8ecfe968964a": {
      "release": {
        "r1": [
          "5fdde98cd2ce8ecfe9689649"
        ]
      },
      "domain": "Banking",
      "appType": {
        "Desktop": "5db0022cf87fdec084ae49af"
      }
    }
  },
  "apptypes": [
    "Web",
    "Desktop"
  ],
  "tasktypes": [
    "Execution",
    "Design"
  ],
  "projectDict": {
    "5fb4fc98f4da702833d7e0a0": "test",
    "5fdde98cd2ce8ecfe968964a": "desk"
  },
  "cycleDict": {
    "5fb4fc98f4da702833d7e09f": "c1",
    "5fdde98cd2ce8ecfe9689649": "c1"
  }
}

export const firstCall={type: actionTypes.SET_TASKSJSON, payload: dummyData1}
export const secondCall={type: actionTypes.SET_FD, payload: dataDict}

// Data for FilterDialog.js



export const filterData={
  "prjval": "Select Project",
  "relval": "Select Release",
  "cycval": "Select Cycle",
  "apptype": {},
  "tasktype": {}
}