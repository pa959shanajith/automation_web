import React, { useState, useRef, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {getModules,getScreens} from '../api';
import '../styles/ToolbarMenu.scss';
import * as d3 from 'd3';
import * as actionTypes from '../state/action';
import PropTypes from 'prop-types'


/*Component ToolbarMenu
  use: renders tool bar menus of create new page
*/

const Toolbarmenu = ({setPopup,setBlockui,displayError}) => {
    const dispatch = useDispatch()
    const SearchInp = useRef()
    const selectBox = useSelector(state=>state.mindmap.selectBoxState)
    const selectNodes = useSelector(state=>state.mindmap.selectNodes)
    const copyNodes = useSelector(state=>state.mindmap.copyNodes)
    const prjList = useSelector(state=>state.mindmap.projectList)
    const initProj = useSelector(state=>state.mindmap.selectedProj)
    const moduleList = useSelector(state=>state.mindmap.moduleList)
    const [modlist,setModList] = useState(moduleList)
    const selectProj = async(proj) => {
        setBlockui({show:true,content:'Loading Modules ...'})
        dispatch({type:actionTypes.SELECT_PROJECT,payload:proj})
        var moduledata = await getModules({"tab":"tabCreate","projectid":proj,"moduleid":null})
        if(moduledata.error){displayError(moduledata.error);return;}
        var screendata = await getScreens(proj)
        if(screendata.error){displayError(screendata.error);return;}
        setModList(moduledata)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:moduledata})
        dispatch({type:actionTypes.SELECT_MODULE,payload:{}})
        if(screendata)dispatch({type:actionTypes.UPDATE_SCREENDATA,payload:screendata})
        SearchInp.current.value = ""
        setBlockui({show:false})
    }
    const searchModule = (val) =>{
        var filter = modlist.filter((e)=>e.name.toUpperCase().indexOf(val.toUpperCase())!==-1)
        dispatch({type:actionTypes.UPDATE_MODULELIST,payload:filter})
    }
    const CreateNew = () =>{
        dispatch({type:actionTypes.SELECT_MODULE,payload:{createnew:true}})
    }
    const clickSelectBox = () =>{
        d3.select('#pasteImg').classed('active-map',false)
        d3.select('#copyImg').classed('active-map',false)
        d3.selectAll('.ct-node').classed('node-selected',false)
        dispatch({type:actionTypes.UPDATE_COPYNODES,payload:{nodes:[],links:[]}})
        dispatch({type:actionTypes.UPDATE_SELECTNODES,payload:{nodes:[],links:[]}})
        dispatch({type:actionTypes.SELECT_SELECTBOX,payload:!selectBox})
    }
    const clickCopyNodes = () =>{
        if (d3.select('#pasteImg').classed('active-map')) {
            setPopup({
                title:'Error',
                content: 'Cannot copy when the Paste-map icon is active!',
                submitText:'Ok',
                show:true
            })
            return;
        }
        var val = copy({...selectNodes},setPopup,copyNodes)
        if(val){
            d3.select('#copyImg').classed('active-map',true)
            dispatch({type:actionTypes.UPDATE_COPYNODES,payload:selectNodes})
            dispatch({type:actionTypes.SELECT_SELECTBOX,payload:false})
            dispatch({type:actionTypes.UPDATE_SELECTNODES,payload:{nodes:[],links:[]}})
        }
    }
    const clickPasteNodes = () =>{
        if(d3.select('#pasteImg').classed('active-map')){
            //close paste
            dispatch({type:actionTypes.UPDATE_COPYNODES,payload:{nodes:[],links:[]}})
            d3.select('#pasteImg').classed('active-map',false)
            d3.selectAll('.ct-node').classed('node-selected',false)
            return;
        }
        if (!d3.select('#copyImg').classed('active-map')){
            setPopup({
                title:'Error',
                content: 'Please complete copy step first',
                submitText:'Ok',
                show:true
            })
            return;
        }
        d3.select('#copyImg').classed('active-map',false)
        paste({...copyNodes},setPopup)
    }
    var projectList = Object.entries(prjList)
    return(
        <Fragment>
        <div className='toolbar__header'>
            <label data-test="projectLabel">Project:</label>
            <select data-test="projectSelect" value={initProj} onChange={(e)=>{selectProj(e.target.value)}}>
                {projectList.map((e,i)=><option value={e[1].id} key={i}>{e[1].name}</option>)}
            </select>
            <span data-test="headerMenu" className='toolbar__header-menus'>
                <i className={"fa fa-crop fa-lg"+(selectBox?' active-map':'')} title="add a rectangle" onClick={clickSelectBox}></i>
                <i className="fa fa-files-o fa-lg" title="copy selected map" id='copyImg' onClick={clickCopyNodes}></i>
                <i className="fa fa-clipboard fa-lg" title="Paste map" id="pasteImg" onClick={clickPasteNodes}></i>
            </span>
            <span data-test="searchBox" className='toolbar__header-searchbox'>
                <input placeholder="Search Modules" ref={SearchInp} onChange={(e)=>searchModule(e.target.value)}></input>
                <img src={"static/imgs/ic-search-icon.png"} alt={'search'}/>
            </span>
            <button data-test="createNew" className='btn' title="Create New Mindmap" onClick={()=>CreateNew()}>Create New</button>
        </div>
        </Fragment>
    )
}

//check for paste errors and paste action
const paste = (copyNodes,setPopup) =>{
    var dNodes_c = copyNodes.nodes
    var module_check_flag = false
    if(dNodes_c.length === 0){
        setPopup({
            title:'Error',
            content:'Nothing to paste',
            submitText:'Ok',
            show:true
        })
        return false;
    }
    d3.select('#pasteImg').classed('active-map',true)
    d3.selectAll('.ct-node').classed('node-selected',false)
    module_check_flag = dNodes_c.some(e => e.type === 'scenarios'); // then check for dangling screen
    if (module_check_flag) {
        //highlight module
        d3.selectAll('[data-nodetype=modules]').classed('node-selected',true);
    } else {
        //highlight scenarios
        d3.selectAll('[data-nodetype=scenarios]').classed('node-selected',true);
    }
}

//check for dangling errors and and copy action
const copy = (selectNodes,setPopup,copyNodes) =>{
    var dNodes_c = selectNodes.nodes
    var dLinks_c = selectNodes.links
    var dangling_screen_check_flag = false
    var dangling_screen ;
    var dangling_screen_flag = false
    var ds_list = [];
    if(dNodes_c.length === 0){
        if(copyNodes.nodes.length>0){
            setPopup({
                title:'Warning',
                content:'Click on paste-map icon to paste copied nodes',
                submitText:'Ok',
                show:true
            })
            return false
        }
        setPopup({
            title:'Warning',
            content:'Nothing is copied',
            submitText:'Ok',
            show:true
        })
        return false;
    }
    dangling_screen_check_flag = dNodes_c.some(e => e.type === 'scenarios'); // then check for dangling screen
    if (dangling_screen_check_flag) {
        dNodes_c.forEach((e)=>{
            if (e.type === 'screens') {
                dangling_screen = true;
                dLinks_c.forEach((f)=>{
                    if (parseFloat(e.id) === parseFloat(f.target.id))
                        dangling_screen = false;
                })
                if (dangling_screen) {
                    dangling_screen_flag = true;
                    ds_list.push(e);
                }
            }
        })
    }
    if (dangling_screen_flag) {
        setPopup({
            title:'Error',
            content: 'dangling screen!!! validation failed!',
            submitText:'Ok',
            show:true
        })
        ds_list.forEach((e) =>{
            d3.select('#node_' + e.id).classed('node-error',true);
        });
        return false;
    }
    setPopup({
        title:'Success',
        content: 'Data Copied successfully',
        submitText:'Ok',
        show:true
    })
    return true;
}
Toolbarmenu.propTypes={
    setPopup:PropTypes.func,
    setBlockui:PropTypes.func,
    displayError:PropTypes.func
}
export default Toolbarmenu;