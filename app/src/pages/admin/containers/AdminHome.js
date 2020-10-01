import React ,  { useState } from 'react';
import LeftPanel from './LeftPanel'
import CreateUser from './CreateUser'
import Project from './Project'
import ProjectAssign from './ProjectAssign'
import OidcConfig from './OidcConfig'
import {Header,FooterTwo,ReferenceBar, ScrollBar} from '../../global'
import '../styles/AdminHome.scss'
import SamlConfig from './SamlConfig';
import Preferences from './Preferences';
import SessionManagement from './SessionManagement';
import IceProvision from './IceProvision';
import TokenManagement from './TokenMangement';

/*Component AdminHome
  use: renders Admin landing page (footer,header,sidebars,middle saection)
  todo: 
*/

const AdminHome = () => {
  const [middleScreen,setMiddleScreen] = useState("createUser")
  const [showEditUser,setShowEditUser] = useState(false)
  const [resetMiddleScreen,setResetMiddleScreen] =useState({tokenTab:true,provisionTa:true,Preferences:true,sessionTab:true,createUser:true,projectTab:true,assignProjectTab:true,samlConfigTab:true,oidcConfigTab:true})
  return (
    <div className='admin-container'>
        <Header />
        <div className="admin__mid_section">
            <LeftPanel resetMiddleScreen={resetMiddleScreen} setResetMiddleScreen={setResetMiddleScreen} middleScreen={middleScreen} setMiddleScreen={setMiddleScreen} setShowEditUser={setShowEditUser}/>
            <div id="middle-content-section">
                <div className="abs-div">
                    <div className="min-h">
                        <div className='admin-container-wrap'>
                            <ScrollBar thumbColor="#929397">
                            <div className="containerWrap admin-containerWrap-pad ">
                                {(middleScreen==="createUser")?<CreateUser resetMiddleScreen={resetMiddleScreen} showEditUser={showEditUser} setShowEditUser={setShowEditUser} setMiddleScreen={setMiddleScreen} middleScreen={middleScreen}/>:null}
                                {(middleScreen==="tokenTab")?<TokenManagement resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/> :null}
                                {(middleScreen==="provisionTa")?<IceProvision resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen} />:null}
                                {(middleScreen==="projectTab")?<Project resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="assignProjectTab")?<ProjectAssign resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
                                {(middleScreen==="ldapConfigTab")?null:null}
                                {(middleScreen==="samlConfigTab")?<SamlConfig resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                                {(middleScreen==="oidcConfigTab")?<OidcConfig resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                                {(middleScreen==="sessionTab")?<SessionManagement resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen}  />:null}
                                {(middleScreen==="Preferences")?<Preferences resetMiddleScreen={resetMiddleScreen} middleScreen={middleScreen} />:null}
                            </div>
                            </ScrollBar>
                        </div>
                    </div>    
                </div>
            </div>  
            <ReferenceBar taskTop={false} hideInfo={true} hideTask={true}/>
        </div>
        <div className='admin-footer'><FooterTwo /></div>
    </div>
  );
}

export default AdminHome;