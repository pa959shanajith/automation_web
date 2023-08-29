import {createSlice} from '@reduxjs/toolkit'

const initialState = {
    screenType: { name: 'Jira', code: 'JA' },
    intergrationLogin:{
        username:'',
        password:'',
        url:''
    },
    zephyrLogin:{
        url:'',
        username:'',
        password:'',
        token:''
    },
    AzureLogin:{
        username:'',
        password:'',
        url:''
    },
    selectedProject:'',
    selectedIssue:'',
    selectedZTCDetails: {
        selectedTCPhaseId: [],
        selectedTcId: [],
        selectedTCNames: [],
        selectedTCReqDetails:[]
    },
    selectedTestCase: [],
    syncedTestCases: [],
    selectedScenarioIds: [],
    mappedPair: [],
    selectedAvoproject:'',
    mappedTree:[],
    showOverlay:"",
    checkedTCPhaseIds: [],
    checkedTcIds: [],
    checkedTCNames: [],
    checkedTCReqDetails:[],
    checkedTreeIds:[],
    checkedParentIds:[],
    checkedProjectIds:[],
    checkedReleaseIds:[],
    reference:''
}

export const settingSlice=createSlice({
    name:'setting',
    initialState,
    reducers:{
        screenType:(state,action)=>{
            state.screenType = action.payload;
        },
        IntergrationLogin:(state,action) => {
            const { fieldName, value } = action.payload;
            state.intergrationLogin[fieldName] = value;
        },
        resetIntergrationLogin: (state) => {
            state.intergrationLogin = initialState.intergrationLogin;
          },
        resetScreen:(state) => {
            state.screenType = initialState.screenType;
          },
        selectedProject:(state,action) => {
            state.selectedProject =  action.payload
        },
        selectedIssue:(state,action) => {
            state.selectedIssue =  action.payload
        },
        selectedTCReqDetails:(state,action) => {
            state.selectedTCReqDetails =  action.payload
        },
        selectedTestCase:(state,action) => {
            state.selectedTestCase =  action.payload
        },
        syncedTestCases:(state,action) => {
            state.syncedTestCases =  action.payload
        },
        selectedScenarioIds:(state,action) => {
            state.selectedScenarioIds =  action.payload
        },
        mappedPair:(state,action) => {
            state.mappedPair =  action.payload
        },
        selectedAvoproject:(state,action) => {
            state.selectedAvoproject =  action.payload
        },
        mappedTree:(state,action) => {
            state.mappedTree =  action.payload
        },
        showOverlay:(state,action) =>{
            state.showOverlay =  action.payload
        },
        zephyrLogin:(state,action) => {
            const { fieldName, value } = action.payload;
            state.zephyrLogin[fieldName] = value;
        },
        resetZephyrLogin: (state) => {
            state.zephyrLogin = initialState.zephyrLogin;
          },
        AzureLogin:(state,action) => {
            const { fieldName, value } = action.payload;
            state.AzureLogin[fieldName] = value;
        },
        checkedTCPhaseIds: (state,action) => {
            state.checkedTCPhaseIds =  action.payload
        },
        checkedTcIds: (state,action) => {
            state.checkedTcIds =  action.payload
        },
        checkedTCNames: (state,action) => {
            state.checkedTCNames =  action.payload
        },
        checkedTCReqDetails: (state,action) => {
            state.checkedTCReqDetails =  action.payload
        },
        checkedTreeIds: (state,action) => {
            state.checkedTreeIds =  action.payload
        },
        checkedParentIds: (state,action) => {
            state.checkedParentIds =  action.payload
        },
        checkedProjectIds: (state,action) => {
            state.checkedProjectIds =  action.payload
        },
        checkedReleaseIds: (state,action) => {
            state.checkedReleaseIds =  action.payload
        }
    }
})
// export all the action creators
export const { 
    screenType,
    IntergrationLogin,
    resetIntergrationLogin,
    resetScreen,
    selectedProject,
    selectedIssue,
    selectedTCReqDetails,
    selectedTestCase,
    syncedTestCases,
    selectedScenarioIds,
    mappedPair,
    selectedAvoproject,
    mappedTree,
    showOverlay,
    zephyrLogin,
    resetZephyrLogin,
    AzureLogin,
    checkedTCPhaseIds,
    checkedTcIds,
    checkedTCNames,
    checkedTCReqDetails,
    checkedTreeIds,
    checkedParentIds,
    checkedProjectIds,
    checkedReleaseIds
     } = settingSlice.actions;
// export all the reducer 
export default settingSlice.reducer;