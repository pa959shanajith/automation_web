import React, { useState, useEffect, Fragment } from 'react';
import { ModalContainer, ScrollBar, RedirectPage } from '../../global';
import { tagList } from  './ListVariables';
import { updateScreen_ICE } from '../api';
import "../styles/MapObjectModal.scss";

const MapObjectModal = props => {

    const [scrapedList, setScrapedList] = useState({});
    const [nonCustomList, setNonCustomList] = useState([]);
    const [customList, setCustomList]  = useState({});
    const [selectedTag, setSelectedTag] = useState("");
    const [map, setMap] = useState({});
    const [showName, setShowName] = useState("");
    const [selectedItems, setSelectedItems] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(()=>{
        let tempScrapeList = {};
        let tempCustomList = {};
        let tempNonCustom = [];
        if (props.scrapeItems.length) {
            props.scrapeItems.forEach(object => {
                let elementType = object.tag;
                elementType = tagList.includes(elementType) ? elementType : 'Element';
                if (!object.objId) {}
                else if (object.isCustom) {
                    if (tempCustomList[elementType]) tempCustomList[elementType] = [...tempCustomList[elementType], object];
                    else tempCustomList[elementType] = [object]
                    if (!tempScrapeList[elementType]) tempScrapeList[elementType] = []
                }
                else {
                    tempNonCustom.push(object);
                    if (tempScrapeList[elementType]) tempScrapeList[elementType] = [...tempScrapeList[elementType], object];
                    else tempScrapeList[elementType] = [object]
                }
            });
            setScrapedList(tempScrapeList);
            setCustomList(tempCustomList);
            setNonCustomList(tempNonCustom);
        }
    }, [])

    const onDragStart = (event, data) => event.dataTransfer.setData("object", JSON.stringify(data))

    const onDragOver = event => event.preventDefault();

    const onDrop = (event, currObject) => {
        if (map[currObject.val]) setErrorMsg("Object already merged");
        else {
            let draggedObject = JSON.parse(event.dataTransfer.getData("object"));
            let mapping = { 
                ...map, 
                [currObject.val]: [draggedObject, currObject],
                [draggedObject.val]: null            
            }
            setMap(mapping);
            setErrorMsg("");
        }
    }

    const onUnlink = () => {
        let mapping = { ...map };
        for (let customObjVal of selectedItems) {
            let scrapeObjVal = mapping[customObjVal][0].val
            delete mapping[customObjVal];
            delete mapping[scrapeObjVal];
        }
        setMap(mapping);
        setSelectedItems([]);
        setShowName("");
    }

    const onShowAllObjects = () => setSelectedTag("");

    const submitMap = () => {

        if (!Object.keys(map).length) {
            setErrorMsg("Please select atleast one object to Map");
            return;
        }

        let { screenId, screenName, projectId, appType, versionnumber } = props.current_task;
        
        let arg = {
            projectId: projectId,
            screenId: screenId,
            screenName: screenName,
            userId: props.user_id,
            roleId: props.role,
            param: "mapScrapeData",
            appType: appType,
            objList: [],
            versionnumber: versionnumber
        };

        let mapping = {...map};
        for (let val in mapping) {
            if (mapping[val])
                arg.objList.push([mapping[val][0].objId, mapping[val][1].objId, mapping[val][1].custname]);
        }

        updateScreen_ICE(arg)
        .then(response => {
            if (response === "Invalid Session") return RedirectPage(props.history);
            else props.fetchScrapeData()
                    .then(resp => {
                        if (resp === "success") {
                            props.setShow(false);
                            props.setShowPop({title: 'Map Scrape Data', content: 'Mapped Scrape Data Successfully!'})
                        }
                        else props.setShowPop({title: 'Map Scrape Data', content: 'Mapped Scrape Data Failed!'})
                    })
                    .catch(err => {
                        props.setShowPop({title: 'Map Scrape Data', content: 'Mapped Scrape Data Failed!'})
                        console.err(err);
                    });
        })
        .catch(error => {
            props.setShowPop({title: 'Map Scrape Data', content: 'Mapped Scrape Data Failed!'})
            console.err(error);
        })
    }

    const onCustomClick = (showName, id) => {
        let updatedSelectedItems = [...selectedItems]
        let indexOfItem = selectedItems.indexOf(id);
        
        if (indexOfItem>-1) updatedSelectedItems.splice(indexOfItem, 1);
        else updatedSelectedItems.push(id);
        
        setShowName(showName);
        setSelectedItems(updatedSelectedItems);
    }

    return (
        <div className="ss__mapObj">
            <ModalContainer 
                title="Map Object"
                content={
                    <div className="ss__mapObjBody">
                        <div className="ss__mo_lbl headerMargin">Please select the objects to drag and drop</div>
                        <div className="ss__mo_lists">
                            <div className="ss__mo_scrapeObjectList">
                                <div className="ss__mo_lbl lblMargin">Scraped Objects</div>
                                <div className="mo_scrapeListContainer">
                                    <div className="mo_listCanvas">
                                        <div className="mo_listMinHeight">
                                            <div className="mo_listContent" id="moListId">
                                            <ScrollBar scrollId="moListId" thumbColor= "#321e4f" trackColor= "rgb(211, 211, 211)" verticalbarWidth='8px'>
                                            <>
                                            { (()=> selectedTag ? scrapedList[selectedTag] : nonCustomList)()
                                            .map((object, i) => {
                                                let mapped = object.val in map;
                                                return (<div key={i} className={"ss__mo_listItem"+(mapped ? " mo_mapped" : "")} draggable={ mapped ? "false" : "true"} onDragStart={(e)=>onDragStart(e, object)}>
                                                    {object.title}
                                                </div>)
                                            }) }
                                            </>
                                            </ScrollBar>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="ss__mo_customObjectList">
                                <div className="ss__mo_lbl lblMargin">Custom Objects</div>
                                <div className="ss__mo_customOutContainer">
                                <div className="mo_listCanvas">
                                <div className="mo_listMinHeight">
                                <div className="mo_listContent" id="moListId">
                                <ScrollBar scrollId="moListId">
                                <div className="ss__mo_customInContainer">
                                { Object.keys(customList).map((elementType, i) => (
                                    <Fragment key={i}>
                                    <div className="mo_tagHead" onClick={()=>setSelectedTag(elementType === selectedTag ? "" : elementType )}>{elementType}</div>
                                    { selectedTag === elementType && <div className="mo_tagItemList"> 
                                        {customList[selectedTag].map((object, j) => <div key={j} className={"mo_tagItems"+(selectedItems.includes(object.val) ? " mo_selectedTag" : "")} onDragOver={onDragOver} onDrop={(e)=>onDrop(e, object)}>
                                            { object.val in map ?
                                            <>
                                            <span className="mo_mappedName" onClick={()=>onCustomClick("", object.val)}>
                                                { showName === object.val ? object.title : map[object.val][0].title }
                                            </span>
                                            <span className="mo_nameFlip" onClick={()=>onCustomClick(object.val, object.val)}></span>
                                            </> : 
                                            <span>{object.title}</span> }
                                            
                                        </div>)} 
                                    </div> }
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
                }
                close={()=>props.setShow(false)}
                footer={<>
                    { errorMsg && <span className="mo_errorMsg">{errorMsg}</span>}
                    <button onClick={onShowAllObjects}>Show All Objects</button>
                    <button onClick={onUnlink} disabled={!selectedItems.length}>Un-Link</button>
                    <button onClick={submitMap}>Submit</button>
                </>}
            />
        </div>
    );
}

export default MapObjectModal;

