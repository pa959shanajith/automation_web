import React ,  { useState } from 'react';
import LeftPanel from './LeftPanel'
import CreateUser from './CreateUser'
import Project from './Project'
import ProjectAssign from './ProjectAssign'
import {Header,FooterTwo} from '../../global'
import '../styles/AdminHome.scss'

/*Component AdminHome
  use: renders Admin landing page (footer,header,sidebars,middle saection)
  todo: 
*/

const AdminHome = () => {
  const [middleScreen,setMiddleScreen] = useState("createUser")
  const [showEditUser,setShowEditUser] = useState(false)
  const [resetMiddleScreen,setResetMiddleScreen] =useState({createUser:true,tokenTab:true,projectTab:true,assignProjectTab:true})
  return (
    <div className='admin-container'>
      <Header />
      <LeftPanel resetMiddleScreen={resetMiddleScreen} setResetMiddleScreen={setResetMiddleScreen} middleScreen={middleScreen} setMiddleScreen={setMiddleScreen} setShowEditUser={setShowEditUser}/>
      {/* <!--Middle Panel--> */}
      <div id="middle-content-section" style={{ overflow: "auto"  }}>
          <div className="containerWrap">
              {(middleScreen==="createUser")?<CreateUser resetMiddleScreen={resetMiddleScreen} showEditUser={showEditUser} setShowEditUser={setShowEditUser} setMiddleScreen={setMiddleScreen} middleScreen={middleScreen}/>:null}
              {(middleScreen==="tokenTab")?null:null}
              {(middleScreen==="provisionTa")?null:null}
              {(middleScreen==="projectTab")?<Project resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
              {(middleScreen==="assignProjectTab")?<ProjectAssign resetMiddleScreen={resetMiddleScreen} setMiddleScreen={setMiddleScreen}/>:null}
              {(middleScreen==="ldapConfigTab")?null:null}
              {(middleScreen==="samlConfigTab")?null:null}
              {(middleScreen==="oidcConfigTab")?null:null}
              {(middleScreen==="sessionTab")?null:null}
              {(middleScreen==="preferencesTab")?null:null}
          </div>
      </div>  
      { /* <!--Right Panel--> */}
      <div id="right-dependencies-section"></div>
      <FooterTwo />
    </div>
  );
}

export default AdminHome;