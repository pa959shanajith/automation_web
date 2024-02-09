import React, {useState} from "react";
import { Dialog } from "primereact/dialog";
import CaptureModal from '../containers/CaptureScreen';
import DesignModal from '../containers/DesignTestStep';
import { TabView, TabPanel } from 'primereact/tabview';
import '../styles/NavigatetoCaptureDesign.scss'







function NavigatetoCaptureDesign(params) {
    const [visibleCaptureElement, setVisibleCaptureElement] = useState(true);
    const [visibleDesignStep, setVisibleDesignStep] = useState(true);
    const [activeIndex, setActiveIndex] = useState(params.designClick?1:0);

    const tabChnage =(e) =>{
       if(!params.designClick){
            if(params.fetchingDetails['children'].length > 0){
            setActiveIndex(e.index)
        }
     }
       else {
        if(params.fetchingDetails['parent']){
            setActiveIndex(e.index)
        }
       }
    }
    const headerTemplate = (
        <>
            <div>
                <h5 className='header_Groups'>{params.fetchingDetails['name']}</h5>
                <TabView className="tabView_captureDesign" activeIndex={activeIndex} onTabChange={(e)=>tabChnage(e)} >
                    <TabPanel header="Element Repository"></TabPanel>
                    <TabPanel header="Design Test Steps"></TabPanel>
                </TabView>
            </div>
        </>
    );

    // const onClose =()=>{
    //     params.setDesignClick(false);
    //     params.setVisibleCaptureAndDesign(false);
    // }
    return(
        <div className="captureDesign_dialog_div">
            <Dialog className='captureDesign_dialog_box' header={headerTemplate} visible={params.visibleCaptureAndDesign} position='right' style={{ width: '85%', color: 'grey', height: '95%', margin: '0px' }} onHide={()=>{params.setVisibleCaptureAndDesign(false);params.setDesignClick(false)}}>
                <div className='captureDesignGroups'>
                    
                {activeIndex === 0 ?<div>
                    <CaptureModal visibleCaptureElement={params.visibleCaptureAndDesign} setVisibleCaptureElement={params.setVisibleCaptureAndDesign} fetchingDetails={!params.designClick?params.fetchingDetails:params.fetchingDetails['parent']} testSuiteInUse={params.testSuiteInUse}/>
                    </div>  
                    :
                    <div>
                        <DesignModal  fetchingDetails={!params.designClick?params.fetchingDetails['children'][0]:params.fetchingDetails} appType={params.appType} visibleDesignStep={visibleDesignStep} setVisibleDesignStep={setVisibleDesignStep} impactAnalysisDone={params.impactAnalysisDone} testcaseDetailsAfterImpact={params.testcaseDetailsAfterImpact} setImpactAnalysisDone={params.setImpactAnalysisDone} testSuiteInUse={params.testSuiteInUse}/>
                    </div>  }   
                </div>
            </Dialog>
        </div>
    )
}
export default NavigatetoCaptureDesign;