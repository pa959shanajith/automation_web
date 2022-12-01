import React, { useState, useEffect, Fragment } from 'react';
import { ModalContainer, ScrollBar, RedirectPage, Messages as MSG, setMsg, AnimatePageWrapper, AnimateDiv, updateScrollBar } from '../../global';
import { tagListToReplace } from './ListVariables';
import { updateScreen_ICE, fetchReplacedKeywords_ICE } from '../api';
import "../styles/ReplaceObjectModal.scss";
import PropTypes from 'prop-types'
import { Icon } from "@fluentui/react"

const RenderGroupItem = (props) =>{
    const {oldObj,newObj,keywords,newkeywords,COKMap,stateUpdate,val,saveGroupItem} = props;
    const [expanded,setExpanded] = useState(false);
    const handleSelectChange = (e,keyword) =>{
        if (e.target.value ) e.target.classList.remove("r-group__selectError")
        else return
        if (!COKMap[oldObj.objId]){
            COKMap[oldObj.objId] = {
               "keywordMap":{
                 [keyword]:e.target.value
               }
            }
        }
        else{
            COKMap[oldObj.objId]["keywordMap"][keyword] = e.target.value;
        }
        stateUpdate(COKMap);
    }
    
    return (
            <div className='r-group__container'>
                <div className="r-group__header">
                    <button className='r-group__expandButton' onClick={()=>{setExpanded(!expanded); updateScrollBar();}}><Icon iconName='chevron-right' styles={{root:{display:"flex",justifyContent:"center", height:"10px",transform: expanded?"rotate(90deg)":"rotate(0deg)", transition:"0.5s"}}} ></Icon></button>
                    <div className='r-header__mid'>
                        <span title={oldObj.title} className="r-header__objNames">{oldObj.title}</span>
                        <span title={newObj.title} className="r-header__objNames">{newObj.title}</span>
                    </div>
                    <button className='r-group__saveButton' data-test="Save" onClick={()=>{
                        if(keywords.length>0 && (!COKMap[oldObj.objId] || Object.keys(COKMap[oldObj.objId]["keywordMap"]).length !== keywords.length)){
                            setMsg({"CONTENT":"Please replace all the keywords of object.","VARIANT":"error"})
                            return
                        }
                        if(keywords.length>0 )
                            saveGroupItem(oldObj.objId,COKMap[oldObj.objId]["keywordMap"],newObj,val)
                        else                             
                            saveGroupItem(oldObj.objId,[],newObj,val)
                    }}>Save</button>
                </div>
                <div style={{display: expanded?"flex":"none",width:"100%",flex:1,flexDirection:"column"}}>
                    {keywords.map(((k_word,idx)=>{
                        const similarTagNames = (tagListToReplace.includes(oldObj.tag)?oldObj.tag:"element")===(tagListToReplace.includes(newObj.tag)?newObj.tag:"element")
                        return (
                            <div key={idx} className="r-group__item">
                                <div className='r-group__spacer'></div>
                                <div className='r-drop__container'>
                                    <span style={{width:"40%"}}> 
                                        <select className="r-group__select" value={k_word} title={k_word} disabled={true}>
                                            <option key={k_word+idx} value={k_word}>{k_word}</option>
                                        </select>
                                    </span>
                                    <span style={{width:"40%"}}> 
                                        {/** If we want to retain the selected mappings after saving also */}
                                        {/* defaultValue={(COKMap[oldObj.objId] && COKMap[oldObj.objId]["keywordMap"][k_word])? COKMap[oldObj.objId]["keywordMap"][k_word]: ""}  */}

                                        <select className="r-group__select" defaultValue={ similarTagNames && newkeywords.includes(k_word)?k_word:""} onFocus={(e)=>{e.target.value?e.target.classList.remove("r-group__selectError"):e.target.classList.add("r-group__selectError")}} onChange={(e)=>{handleSelectChange(e,k_word)}}>
                                            <option key={"notSelected"} value={""} title={"Select keyword"} disabled>{"Select keyword"}</option>
                                            { newkeywords && newkeywords.map((keyword, i) => <option key={keyword+i} title={keyword} value={keyword}>{keyword.slice(0,30) + (keyword.length>30?"...":"")}</option>) }
                                        </select>
                                    </span>
                                </div>
                            </div>
                        )
                    }))}
                </div>
            </div>
    );
}

const ReplaceObjectModal = props => {

    const [scrapedList, setScrapedList] = useState({});
    const [allScraped, setAllScraped] = useState([]);
    const [newScrapedList, setNewScrapedList] = useState({});
    const [selectedTag, setSelectedTag] = useState("");
    const [replace, setReplace] = useState({});
    const [showName, setShowName] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [custNames, setCustNames] = useState([]);
    const [replacingCustNm, setReplacingCustNm] = useState([]);
    const [activeTab, setActiveTab] = useState("ObjectReplacement");
    const [firstRender, setFirstRender] = useState(true);
    const [CrossObjKeywordMap, setCrossObjKeywordMap] = useState({});
    const [CORData,setCORData] = useState({})
    const [forceRender, setForceRender] = useState(false); // only used to re-render the replace-keyword screen
    const [objectsReplaced, setObjectsReplaced] = useState(false) // used to detect whether any object was replaced or not

    useEffect(() => {
        setFirstRender(false);
        let tempScrapeList = {};
        let tempNewScrapedList = {};
        let tempAllScraped = [];
        let tempCustNames = [];
        if (props.scrapeItems.length) {
            props.scrapeItems.forEach(object => {
                let elementType = object.tag;
                elementType = tagListToReplace.includes(elementType) ? elementType : 'Element';
                if (object.objId) {
                    if (!(object.xpath && object.xpath.split(";")[0] === "iris")) {
                        tempAllScraped.push(object);
                        if (tempScrapeList[elementType]) tempScrapeList[elementType] = [...tempScrapeList[elementType], object];
                        else tempScrapeList[elementType] = [object]
                    }
                }
                tempCustNames.push(object.custname);
            });
            setAllScraped(tempAllScraped);
            setCustNames(tempCustNames);
        }
        if (props.newScrapedData.length) {
            props.newScrapedData.forEach(newObj => {
                let elementType = newObj.tag;
                elementType = tagListToReplace.includes(elementType) ? elementType : 'Element';
                if (tempNewScrapedList[elementType]) tempNewScrapedList[elementType] = [...tempNewScrapedList[elementType], newObj];
                else tempNewScrapedList[elementType] = [newObj];
                if (!tempScrapeList[elementType]) tempScrapeList[elementType] = [];
            });
            setNewScrapedList(tempNewScrapedList);
        }
        setScrapedList(tempScrapeList);
    }, [])

    useEffect(()=>{
      updateScrollBar();
      if(activeTab==="keywordsReplacement" && !document.querySelector(".r-group__container")){
          _handleModalClose()
      }
    },[replace])
    
    useEffect(()=>{
        if(Object.keys(replace).length>0){
          Object.keys(replace).forEach((val_id,idx)=>{
            if(replace[val_id] && (tagListToReplace.includes(replace[val_id][0].tag)?replace[val_id][0].tag:"element")===(tagListToReplace.includes(replace[val_id][1].tag)?replace[val_id][1].tag:"element")){
              let keywords = CORData[replace[val_id][0].objId] ? CORData[replace[val_id][0].objId].keywords:[]
              keywords.forEach((keyword,idx1)=>{
                if (!CrossObjKeywordMap[replace[val_id][0].objId]){
                  CrossObjKeywordMap[replace[val_id][0].objId] = {
                    "keywordMap":{
                      [keyword]:keyword
                    }
                  }
                }
                else{
                  CrossObjKeywordMap[replace[val_id][0].objId]["keywordMap"][keyword] = keyword;
                }
                setCrossObjKeywordMap(CrossObjKeywordMap);
              })
            } 
          })
        }
    },[CORData])

    const onDragStart = (event, data) => event.dataTransfer.setData("object", JSON.stringify(data))

    const onDragOver = event => event.preventDefault();

    const onDrop = (event, currObject) => {
        let replacingCusts = [...replacingCustNm];
        if (replace[currObject.val]) setErrorMsg("Object already merged");
        else {
            let draggedObject = JSON.parse(event.dataTransfer.getData("object"));
            let replacing = {
                ...replace,
                [currObject.val]: [draggedObject, currObject],
                [draggedObject.val]: null
            }
            replacingCusts.push(draggedObject.custname);
            setReplacingCustNm(replacingCusts);
            setReplace(replacing);
            setErrorMsg("");
        }
    }

    const onUnlink = () => {
        let replacing = { ...replace };
        let replacingCusts = [...replacingCustNm];
        for (let customObjVal of selectedItems) {
            let scrapeObjVal = replacing[customObjVal][0].val;
            let replNm = replacing[customObjVal][0].custname;
            let indexOfItem = replacingCusts.indexOf(replNm);
            if (indexOfItem > -1) replacingCusts.splice(indexOfItem, 1);
            delete replacing[customObjVal];
            delete replacing[scrapeObjVal];
        }
        setReplacingCustNm(replacingCusts);
        setReplace(replacing);
        setSelectedItems([]);
        setShowName("");
    }

    const onShowAllObjects = () => setSelectedTag("");

    const onCustomClick = (showName, id) => {
        let updatedSelectedItems = [...selectedItems]
        let indexOfItem = selectedItems.indexOf(id);

        if (indexOfItem > -1) updatedSelectedItems.splice(indexOfItem, 1);
        else updatedSelectedItems.push(id);

        setShowName(showName);
        setSelectedItems(updatedSelectedItems);
    }

    const saveGroupItem = (oldObjId, keywordMap, newObjData,val) =>{
        props.setShowPop({
            'type': 'modal',
            'title': 'Warning !',
            'content': <div className="ss__dup_labels">
                Do you want to update the object and all dependent testcases ?
            </div>,
            'footer': <button onClick={() => {
                props.setShowPop("")
                let { screenId } = props.current_task;

                let arg = {
                    screenId,
                    replaceObjList:{
                        oldObjId,
                        newKeywordsMap:keywordMap,
                        "newObjectData":newObjData,
                        testcaseIds:!CORData[oldObjId] ? [] :CORData[oldObjId]["testcasesids"],
                    },
                    param: "crossReplaceScrapeData"
                }
                updateScreen_ICE(arg)
                        .then(response => {
                            if (response === "Invalid Session") return RedirectPage(props.history);
                            if (response==="Success") {
                                let rep = {...replace}
                                delete rep[val];
                                setReplace({...rep})
                                setForceRender(!forceRender)
                                setMsg(MSG.SCRAPE.SUCC_OBJ_TESTCASES_REPLACED)
                                if(!objectsReplaced)
                                    setObjectsReplaced(true)
                                /** comment the line below when retaining the selected mappings, for deleting only saved object */
                                setCrossObjKeywordMap((prevData) => {
                                  const newData = {...prevData}
                                  delete newData[oldObjId]
                                  return newData;
                                })

                                /** uncomment the line below when retaining the selected mappings, currently deleting all mappings after saving */
                                // setCrossObjKeywordMap({})
                            }
                            else {
                                setMsg(MSG.SCRAPE.ERR_REPLACE_OBJECT_FAILED)
                            }
                        })
                        .catch(error => {
                            setMsg(MSG.SCRAPE.ERR_REPLACE_OBJECT_FAILED)
                            console.err(error);
                        })

            }}>OK</button>
        })
    }

    const _handleModalClose  = () =>{
        props.fetchScrapeData()
            .then(resp => {
                if (resp === "success") {
                    if(objectsReplaced) // this is required inside only.
                        setMsg(MSG.SCRAPE.SUCC_REPLACE_SCRAPED)
                }
                else setMsg(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
            })
            .catch(err => {
                setMsg(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
            }); 
        props.setShow(false)
    }

    const handleReplaceKeywordClick = () =>{
        if (!Object.keys(replace).length) {
            setErrorMsg("Please select atleast one object to Replace");
            return;
        }
        let duplicateItm = false;
        let duplicateCusts = [];
        let object_list=[]
        let replacing = {...replace};
        for (let val in replacing) {
            if (replacing[val]) {
                object_list.push([replacing[val][0].objId, replacing[val][1]]);
                if(custNames.includes(replacing[val][1].custname) && !replacingCustNm.includes(replacing[val][1].custname)) {
                    duplicateItm = true;
                    duplicateCusts.push(replacing[val][1].custname);
                }
            }
        }

        if(duplicateItm) {
            props.setShowPop({
                'type': 'modal',
                'title': 'Replace Scrape data',
                'content': <div className="ss__dup_labels">
                    Please rename/delete duplicate scraped objects
                    <br/><br/>
                    Object characterstics are same for:
                    <ScrollBar hideXbar={true} thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)">
                        <div className="ss__dup_scroll">
                        { duplicateCusts.map((custname, i) => <span key={i} className="ss__dup_li">{custname}</span>) }
                        </div>
                    </ScrollBar>
                </div>,
                'footer': <button onClick={()=>props.setShowPop("")}>OK</button>
            })
        } else {
            props.setOverlay("Fetching Keywords for selected objects...")

            let { screenId,appType } = props.current_task;
            
            let arg = {
                screenId,    
                appType,                                  
                objMap: {},
            };

            let replacing = { ...replace };
            for (let val in replacing) {
                if (replacing[val]) {
                    let tag =  tagListToReplace.includes(replacing[val][1].tag) ? replacing[val][1].tag : 'element'
                    arg.objMap[replacing[val][0].objId] = tag;
                }
            }
            fetchReplacedKeywords_ICE(arg).then((res)=>{
                props.setOverlay(null)
                if(!(res==="fail")){
                    setCORData(res)
                    setErrorMsg("");
                    setActiveTab("keywordsReplacement")
                }
                else {
                    setMsg(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
                }
            }).catch((err)=>{
                props.setOverlay(null)
                console.log(err)
                setMsg(MSG.SCRAPE.ERR_REPLACE_SCRAPE)
            });
        }
    }
    
    return (
        <div data-test="replaceObject" className="ss__replaceObj">
            <ModalContainer
                title={activeTab === "ObjectReplacement"?"Replace Object":"Replace Keywords"}
                content={
                    <AnimatePageWrapper>
                        {activeTab === "ObjectReplacement" ?
                            <AnimateDiv key={`${activeTab}-0`} firstPage={true} firstRender={firstRender} >

                                <div className="ss__replaceObjBody">
                                    <div data-test="replaceObjectHeading" className="ss__ro_lbl ro__headerMargin">Please select the object type and then drag and drop the necessary objects to be replaced with the new objects</div>
                                    <div className="ss__ro_lists">
                                        <div data-test="replaceObjectScrapeObjectList" className="ss__ro_scrapeObjectList">
                                            <div data-test="replaceObjectLabel" className="ss__ro_lbl ro__lblMargin">Scraped Objects</div>
                                            <div className="ro_scrapeListContainer">
                                                <div className="ro_listCanvas">
                                                    <div className="ro_listMinHeight">
                                                        <div data-test="replaceObjectListContent" className="ro_listContent" id="roListId">
                                                            <ScrollBar scrollId="roListId" thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" verticalbarWidth='8px'>
                                                                <>
                                                                    {allScraped.map((object, i) => {
                                                                            let replaced = object.val in replace;
                                                                            return (<div data-test="replaceObjectListItem" key={i} title={object.title} className={"ss__ro_listItem" + (replaced ? " ro_replaced" : "")} draggable={replaced ? "false" : "true"} onDragStart={(e) => onDragStart(e, object)}>
                                                                                {object.title}
                                                                            </div>)
                                                                        })}
                                                                </>
                                                            </ScrollBar>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div data-test="replaceObjectCustomObjectList" className="ss__ro_customObjectList">
                                            <div data-test="replaceObjectCustomHeading" className="ss__ro_lbl ro__lblMargin">New Scraped Objects</div>
                                            <div className="ss__ro_customOutContainer">
                                                <div className="ro_listCanvas">
                                                    <div className="ro_listMinHeight">
                                                        <div className="ro_listContent" id="roListId">
                                                            <ScrollBar scrollId="roListId">
                                                                <div data-test="replaceObjectCustomContainer" className="ss__ro_customInContainer">
                                                                    {Object.keys(newScrapedList).map((elementType, i) => (
                                                                        <Fragment key={i}>
                                                                            <div data-test="replaceObjectTagHead" className="ro_tagHead" onClick={() => setSelectedTag(elementType === selectedTag ? "" : elementType)}>{elementType}</div>
                                                                            {selectedTag === elementType && <div className="ro_tagItemList">
                                                                                {newScrapedList[selectedTag].map((object, j) => <div data-test="replaceObjectCustomListItem" key={j} title={object.title} className={"ro_tagItems" + (selectedItems.includes(object.val) ? " ro_selectedTag" : "")} onDragOver={onDragOver} onDrop={(e) => onDrop(e, object)}>
                                                                                    {object.val in replace ?
                                                                                        <>
                                                                                            <span data-test="replaceObjectReplacedName" className="ro_replacedName" onClick={() => onCustomClick("", object.val)}>
                                                                                                {showName === object.val ? object.title : replace[object.val][0].title}
                                                                                            </span>
                                                                                            <span data-test="replaceObjectFlipName" className="ro_nameFlip" onClick={() => onCustomClick(object.val, object.val)}></span>
                                                                                        </> :
                                                                                        <span data-test="h3">{object.title}</span>}

                                                                                </div>)}
                                                                            </div>}
                                                                        </Fragment>
                                                                    ))}
                                                                </div>
                                                            </ScrollBar>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AnimateDiv> :
                            <AnimateDiv key={`${activeTab}-1`}>
                                <div className='ss__ro_lbl'>Please map the keywords of old objects with the new objects</div>
                                    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"auto", marginTop:"1rem"}}>
                                    <ScrollBar thumbColor="#321e4f" trackColor="rgb(211, 211, 211)" verticalbarWidth='8px'>
                                        {Object.keys(replace).map((val_id,idx)=>{
                                            let tag = ""
                                            if(replace[val_id])
                                                tag = tagListToReplace.includes(replace[val_id][1].tag) ? replace[val_id][1].tag : 'element'
                                            return replace[val_id]?
                                            <RenderGroupItem key={idx+forceRender} val={val_id} COKMap={CrossObjKeywordMap} saveGroupItem={saveGroupItem} stateUpdate={setCrossObjKeywordMap} 
                                            oldObj={replace[val_id][0]} newObj={replace[val_id][1]} keywords={CORData[replace[val_id][0].objId] ? CORData[replace[val_id][0].objId].keywords:[]} 
                                            newkeywords={CORData[replace[val_id][0].objId]?Object.keys(CORData.keywordList[tag]):[]}
                                            ></RenderGroupItem>
                                            :null
                                        })}
                                    </ScrollBar>
                                    </div>
                            </AnimateDiv>
                        }
                    </AnimatePageWrapper>
                }
                close={() => {
                    if(activeTab==="keywordsReplacement")
                        props.setShowPop({
                            'type': 'modal',
                            'title': 'Warning !',
                            'content': <div className="ss__dup_labels">
                                You have unsaved items ! Do you still want to exit replacing objects ?
                            </div>,
                            'footer': <button onClick={() => {
                                props.setShowPop("")
                                _handleModalClose()
                            }}>OK</button>
                        })
                    else
                        _handleModalClose() 
                }}
                footer={<>
                    <div className="ro_errorMsgContainer">
                        {errorMsg && <span data-test="errorMessage" className="ro_errorMsg">{errorMsg}</span>}
                    </div>
                    {activeTab === "ObjectReplacement" ?
                        (<>
                            {/* <button data-test="showAll" onClick={onShowAllObjects}>Show All Objects</button> */}
                            <button data-test="unLink" onClick={onUnlink} disabled={!selectedItems.length}>Un-Map</button>
                            <button data-test="submit" onClick={handleReplaceKeywordClick}>Replace Keywords</button>
                        </>) :
                        (<>
                            {/* <button data-test="go-back" onClick={() => setActiveTab("ObjectReplacement")}>Go Back</button> */}
                        </>)}
                </>}
            />
        </div>
    );
}
ReplaceObjectModal.propTypes={
    scrapeItems: PropTypes.arrayOf(PropTypes.object),
    current_task:PropTypes.object,
    fetchScrapeData:PropTypes.func,
    setShow:PropTypes.func,
    setShowPop:PropTypes.func,
    newScrapedData:PropTypes.arrayOf(PropTypes.object),
    setOverlay:PropTypes.func
}
export default ReplaceObjectModal;

