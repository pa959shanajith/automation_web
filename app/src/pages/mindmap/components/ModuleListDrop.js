import React, { useState, Fragment, useRef, useEffect } from 'react';
import { useSelector, useDispatch} from 'react-redux';
import {getModules, populateScenarios}  from '../api'
import {ScrollBar,ModalContainer,Messages as MSG, setMsg} from '../../global';
import {ScreenOverlay} from '../../global';
import * as d3 from 'd3';
import * as actionTypes from '../state/action';
import '../styles/ModuleListDrop.scss'
import {IconDropdown} from '@avo/designcomponents';
import ImportMindmap from'../components/ImportMindmap.js';
import { style } from 'd3';



const ModuleListDrop = (props) =>{
    const dispatch = useDispatch()
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const proj = useSelector(state=>state.mindmap.selectedProj)
    const moduleSelect = useSelector(state=>state.mindmap.selectedModule)
    const moduleSelectlist = useSelector(state=>state.mindmap.selectedModulelist)
    const [moddrop,setModdrop]=useState(true)
    const [warning,setWarning]=useState(false)
    const [loading,setLoading] = useState(false)
    const [selectedModuleList,setSelectedModuleList] = useState([]);
    const isAssign = props.isAssign
    const [options,setOptions] = useState(undefined)
    const [modlist,setModList] = useState(moduleList)
    const SearchInp = useRef()
    const SearchMdInp = useRef()
    const [modE2Elist, setModE2EList] = useState(moduleList)
    const [importPop,setImportPop] = useState(false)
    const [blockui,setBlockui] = useState({show:false})
    const [scenarioList,setScenarioList] = useState([])
    const [initScList,setInitScList] = useState([]) 
    const filterSc = props.filterSc
    const [selectedSc,setSelctedSc] = useState([])
    const [isE2EOpen, setIsE2EOpen] = useState(false);
    const [collapse, setCollapse] = useState(false);
    
  

    useEffect(()=> {
        if(moduleList.length > 0) {
            
            selectModule(moduleList[0]._id, moduleList[0].name, moduleList[0].type, false); 
        }
        setWarning(false)
     },[])
    
    const displayError = (error) =>{
        setLoading(false)
        setMsg(error)
    }
    const collapsed =()=> setCollapse(!collapse)
    const CreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
        dispatch({type:actionTypes.INIT_ENEPROJECT,payload:undefined})

    }
    const clickCreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
        dispatch({type:actionTypes.INIT_ENEPROJECT,payload:{proj, isE2ECreate: true}});
        setIsE2EOpen(isE2EOpen)

    }
    const searchModule = (val) =>{
        var filter = modlist.filter((e)=>(e.type === 'basic' && (e.name.toUpperCase().indexOf(val.toUpperCase())!==-1) || e.type === 'endtoend'))
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
     const loadModule = async(modID) =>{
        setWarning(false)
        setBlockui({show:true,content:"Loading Module ..."}) 
        // dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
        dispatch({type:actionTypes.INIT_ENEPROJECT,payload:undefined})
       
        if(moduleSelect._id === modID){
            dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        }
        var req={
            tab:"endToend",
            projectid:proj,
            version:0,
            cycId: null,
            modName:"",
            moduleid:modID
        }
        
        var res = await getModules(req)
        if(res.error){displayError(res.error);return}
        dispatch({type:actionTypes.SELECT_MODULE,payload:res})
        setBlockui({show:false})
    }
    const [isModuleSelectedForE2E, setIsModuleSelectedForE2E] = useState('');

    // normal module selection
            const selectModule = async (id,name,type,checked) => {
                var modID = id
                var type = name
                var name = type
                // below code about scenarios fetching
                setSelctedSc([])
                    if (isE2EOpen){
                        setBlockui({content:'loading scenarios',show:true})
                        //loading screen
                        var res = await populateScenarios(modID)
                        if(res.error){displayError(res.error);return}
                        // props.setModName(name)
                        setIsModuleSelectedForE2E(id);
                        setScenarioList(res)
                        setInitScList(res)
                        setBlockui({show:false})
                        return;}
                        if(Object.keys(moduleSelect).length===0){
                            loadModule(modID)
                            return;
                        }else{
                            setWarning(modID)
                        }
        d3.selectAll('.ct-node').classed('node-selected',false)
        //     return;
        // }
        d3.select('#pasteImg').classed('active-map',false)
        d3.select('#copyImg').classed('active-map',false)
        d3.selectAll('.ct-node').classed('node-selected',false)
        if(Object.keys(moduleSelect).length===0){
            loadModule(modID)
            return;
        }else{
            setWarning({modID, type: name})
        }
        
    }
    
    //E2E properties
    const selectModules= async(e) => {
        // setSelctedSc([])
        var modID = e.currentTarget.getAttribute("value")
        var type = e.currentTarget.getAttribute("type")
        var name = e.currentTarget.getAttribute("name")
        if(Object.keys(moduleSelect).length===0){
            loadModuleE2E(modID)
            return;
        }else{
            setWarning({modID, type});
        }
    }    
    const loadModuleE2E = async(modID) =>{
        setWarning(false)
        setIsE2EOpen(true)
        setCollapse(true)
        setBlockui({show:true,content:"Loading Module ..."})   
        dispatch({type:actionTypes.INIT_ENEPROJECT,payload:{proj, isE2ECreate: true}});
        // dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        if(moduleSelect._id === modID){
            dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
        }
        var req={
            tab:"endToend",
            projectid:proj,
            version:0,
            cycId: null,
            modName:"",
            moduleid:modID
        }
        var res = await getModules(req)
        if(res.error){displayError(res.error);return}
        dispatch({type:actionTypes.SELECT_MODULE,payload:res})
        setBlockui({show:false})
    }
    const addScenario = (e) => {	
        var sceId = e.currentTarget.getAttribute("value")	
        var sceName = e.currentTarget.getAttribute("title")	
        var scArr = {...selectedSc}	
        if(scArr[sceId]){	
            delete scArr[sceId] 	
        }else{	
            scArr[sceId] = sceName	
        }        	
        setSelctedSc(scArr)	
    }	
    const clickAdd = () =>{	
        if(Object.keys(selectedSc).length<1)return;	
        dispatch({type:actionTypes.UPDATE_SCENARIOLIST,payload:selectedSc})	
    }
    // E2E search button
    const searchModule_E2E = (val) =>{
        var initmodule = modE2Elist
        if(!initmodule){
            initmodule = moduleList
            setModE2EList(moduleList)
        }
        var filter = initmodule.filter((e)=>(e.type==='endtoend'&&(e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)||e.type==='basic'))
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
    const setOptions1 = (data) =>{
        setOptions(data)
      }
    const createType = {
        'importmodules':React.memo(() => (<CreateNew importRedirect={true}/>))
    }
    const selectedCheckbox=(e,arg="checkbox")=>{
        let modID = e.target.getAttribute("value")
        if(arg==='checkbox'){

            let selectedModList = [];
            if(moduleSelectlist.length>0){
                selectedModList=moduleSelectlist;              
            }
            if(selectedModList.indexOf(modID)===-1){
                selectedModList.push(modID);
            }else{
                selectedModList = selectedModList.filter(item => item !== modID)
            }              
            dispatch({type:actionTypes.SELECT_MODULELIST,payload:[...selectedModList]})         
            return;
        }
    }
      
    return(
        <Fragment>
             {loading?<ScreenOverlay content={'Loading Mindmap ...'}/>:null}
            {warning.modID?<ModalContainer 
                title='Confirmation'
                close={()=>setWarning(false)}
                footer={<Footer modID={warning.modID} loadModule={warning.type ==='endtoend' ? loadModuleE2E : loadModule} setWarning={setWarning} />}
                content={<Content/>} 
                modalClass='modal-sm'
            />:null}
            <div className='wholeContainer'>
            <div className='fullContainer pxBlack'>
                <div className='leftContainer pxBlack' style={{ display:"flex"}}>
                    <div className='modulesBox' >
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <img src="static/imgs/node-modules.png" alt="modules" style={{display:"flex",position:'',width:'1.7rem',height:'1.7rem',margin: '5px -82px 3px -17px'}}/>
                            <h6 id='moduleStyle' style={{ marginTop:'0.5rem'}}>
                                    Modules
                            </h6>

                            <IconDropdown items={[ 
                                {
                                    key: 'csv',
                                    text: 'Create New',
                                    onClick: () => {CreateNew()
                                    }
                                },
                                {
                                    key: 'image',
                                    text: 'Import Module',
                                    onClick:()=>{setImportPop(true);}}
                                ]} style={{width:'1.67rem',height:'1.67rem', marginLeft:'15rem', border: 'white', marginTop:'0.2rem'}} placeholderIconName = 'plusIcon'
                            />  
                            {importPop?<ImportMindmap setBlockui={setBlockui} displayError={displayError} setImportPop={setImportPop} isMultiImport={true} />:null}
                        </div>
                        <div className='searchBox pxBlack' style={{display:'flex'}}>
                            <input placeholder="Search Modules" ref={SearchInp} onChange={(e)=>searchModule(e.target.value)}/>
                            <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                        </div>
                        <div className='moduleList'>
                            {moduleList.map((e,i)=>{
                                if(e.type==="basic")
                                return(
                                    <div key={i}>
                                            <div data-test="modules" value={e._id}  className={'toolbar__module-box'+((moduleSelect._id===e._id  )?" selected":"")} style={(moduleSelect._id===e._id || e._id===isModuleSelectedForE2E)?   {backgroundColor:'#EFE6FF'}:{}  }  title={e.name} type={e.type}>                                    
                                                <div className='modClick' value={e._id} style={{display:'flex',flexDirection:'row'}} >
                                                {<input type="checkbox" className="checkBox" value={e._id} onChange={(e)=>selectedCheckbox(e,"checkbox") } checked={moduleSelectlist.includes(e._id)}  />}  
                                                <span  onClick={(e)=>selectModule(e.target.getAttribute("value"), e.target.getAttribute("name"), e.target.getAttribute("type"), e.target.checked)} className='modNme' value={e._id} style={{textOverflow:'ellipsis',textAlign:'left',width:'7rem'}}>{e.name}</span>
                                                </div>
                                            </div>
                                    </div>
                                    )
                            })}
                        </div>
                    </div>
                    <div className='section-dividers'></div>
                    <div className='endToEnd'>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:'center', }}>
                        <img src="static/imgs/node-endtoend.png" alt="modules" style={{display:"flex",width:'1.7rem',height:'1.7rem',margin: '5px -82px 3px -17px'}}/>
                            <h6 id='Endto' style={{margin: '5px -82px 3px -17px'}}>
                                    End to End Flows
                            </h6>
                            <IconDropdown items={[ 
                                {
                                    key: 'csv',
                                    text: 'Create New',
                                    onClick: () => {clickCreateNew();
                                        collapsed();
                                        setIsE2EOpen(true);
                                    }
                                },
                                ]}
                                 style={{width:'1.67rem',height:'1.67rem', marginLeft:'15rem', border: 'white', marginTop:'0.3rem'}} placeholderIconName = 'plusIcon'
                            />  
                        </div>
                        <div className='searchBox pxBlack' style={{display:'flex'}}>
                            <input placeholder="Search Modules" ref={SearchInp} onChange={(e)=>searchModule_E2E(e.target.value)}/>
                            <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
                        </div>
                        <div className='moduleList'>
                        {moduleList.map((e,i)=>{
                            if(e.type==="endtoend")
                            return(
                                    <div key={i}  data-test="individualModules" name={e.name} value={e._id} type={e.type} className={'toolbar__module-box'+((moduleSelect._id===e._id)?" selected":"")} style={moduleSelect._id===e._id?  {backgroundColor:'#EFE6FF'}:{} }   onClick={(e)=>selectModules(e)} title={e.name} >
                                       <div style={{textOverflow:'ellipsis', width:'9rem',overflow:'hidden',textAlign:'left'}}> <span style={{textOverflow:'ellipsis'}} className='modNmeE2E'>{e.name}</span></div>
                                    </div>
                            )
                        })}
                        </div>
                    </div>
                </div>
                </div>
                <div className='scenarioListBox' style={{width:collapse? "13%":"0%"}}>
                    <div style={{display:"flex", flexDirection:"column", width:"100%"}}>
                        <div style={{display:'flex',justifyContent:'space-between'}}>
                    <div style={{paddingTop:'0.3rem',marginLeft:'1.3rem'}}><h5><b>Scenarios</b></h5></div>
                    <div style={{marginRight:'-0.5rem',marginTop:'-0.4rem',cursor:'pointer'}} onClick={()=> {setIsE2EOpen(false);collapsed();  
                    }}><img src="static/imgs/X_button.png" alt="cross button" /></div></div>
                        <div className='scenarioList'>
                           <div style={{display: scenarioList.length==0? '':'none', textAlign:'center', marginTop:'3rem'}}><h7 >Please select a module to display <br></br> it's scenarios</h7></div> 
                              
                                {scenarioList.map((e, i) => {
                                    
                                    return (
                                        <div className='scenarios'>
                                            <div key={i + 'scenario'} onClick={(e) => addScenario(e)} className={'dropdown_scenarios' + (selectedSc[e._id] ? ' selected' : '')} title={e.name} value={e._id} >
                                                <span style={{textOverflow:"ellipsis"}}>
                                                {e.name}</span></div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className='AddBut'>
                                <div onClick={clickAdd} style={{opacity: scenarioList.length==0? '0.3':'', width:'2.3rem',height:'1.5rem', marginLeft:'.7rem',marginBottom:'0.7rem',textAlign:'center', alignContent:'center',backgroundColor:'$white',cursor:'pointer'}}className={'btn.' + (selectedSc.length < 1 ? ' disabled' : '')}><img src="static/imgs/AddButton.png" alt="AddButton" /></div>
                            </div>
                    </div>
                
                </div>
                <div className='collapseButtonDiv' ><img className='collapseButton' style={{ cursor: !isE2EOpen ? 'no-drop' : 'pointer', transform: isE2EOpen && collapse ? 'rotate(0deg)' : 'rotate(180deg)', }} onClick={isE2EOpen ? collapsed : null} src='static/imgs/collapseButton.png' /> </div>
               </div>
            
            <div data-test="dropDown" onClick={()=>{
                    dispatch({type:actionTypes.SELECT_MODULELIST,payload:[]})
                }}>
                
            </div>
        </Fragment>
    );
}

//content for moduleclick warning popup
const Content = () => (
    <p>Unsaved work will be lost if you continue. Do you want to continue?</p>
)

//footer for moduleclick warning popup
const Footer = (props) => (
    <div className='toolbar__module-warning-footer'>
        <button className='btn-yes' onClick={()=>props.loadModule(props.modID)}>Yes</button>
        <button onClick={()=>{props.setWarning(false)}}>No</button>
    </div>
)

export default ModuleListDrop;