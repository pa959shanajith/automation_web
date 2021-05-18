import React, { useState ,useEffect } from 'react';
import { Fragment } from 'react';
import '../styles/AccStatusPanel.scss';


/*Component AccStatusPanel
  use: renders AccStatusPanel in report landing page
*/

const AccStatusPanel = ({arr,selectedScDetails,scDetails}) =>{
    const [data,setData] = useState({P:0,F:0,T:0,I:0})
    useEffect(()=>{
        if(Object.keys(arr).length>0 && arr.total !== 0){
            var inapplicable = parseFloat((arr.inapplicable / arr.total) * 100).toFixed();
            var passes = parseFloat((arr.passes / arr.total) * 100).toFixed();
            var violations = parseFloat((arr.violations / arr.total) * 100).toFixed();
            setData({inapplicable,passes,violations})
        }else{
            setData({inapplicable:0,passes:0,violations:0})
        }
    },[arr])
    if(Object.keys(arr).length<1 || scDetails.length < 1){
        return null;
    }
    return(
        <Fragment>
            <div className ='ar__status_panel'>
                <div  className='panel top-tile'>
                    <div className='ac__panel-head'>Report Data</div>
                    <div className='ac__panel-body'>
                        <div className='left-float'>
                            <div><span className='title'>Crawl Name</span><span className='content'>{scDetails[0].screenname}</span></div>
                            <div><span className='title'>URL</span><span className='content'>{scDetails[0].url}</span></div>
                            <div><span className='title'>Agent</span><span className='content ac__panel_title'>{scDetails[0].agent}</span></div>
                        </div>
                    </div>
                </div>
                <div className='panel'>
                    <div className='ac__panel-head'>Executions</div>
                    <div className='status-panel'>
                        <div className='status-row' style={{color:'#28a745'}}>
                            <span className='label'>Passes</span>
                            <span data-test="passes" className='perc'>{data.passes+'%'}</span>
                            <div className='progress'>
                                <div className='progress-bar' style={{width:data.passes+'%',background:'#28a745'}}></div>
                            </div>
                        </div>
                        <div className='status-row' style={{color:'#dc3545'}}>
                            <span className='label'>Violations</span>
                            <span data-test="violation" className='perc'>{data.violations+'%'}</span>
                            <div className='progress'>
                                <div className='progress-bar' style={{width:data.violations+'%',background:'#dc3545'}}></div>
                            </div>
                        </div>
                        <div className='status-row' style={{color:'#ffc107'}}>
                            <span className='label'>Inapplicable</span>
                            <span data-test="inapplicable" className='perc'>{data.inapplicable+'%'}</span>
                            <div className='progress'>
                                <div className='progress-bar' style={{width:data.inapplicable+'%',background:'#ffc107'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default AccStatusPanel