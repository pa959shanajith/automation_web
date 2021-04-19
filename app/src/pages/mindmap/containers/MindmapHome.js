import React, { useState, Fragment } from 'react';
import { Header, FooterTwo as Footer,ActionBar,ReferenceBar} from '../../global'
import CreateOptions from '../components/CreateOptions.js'; 
import CreateNew from './CreateNew.js';
import CreateEnE from './CreateEnE.js'
import CreateAssign from './CreateAssign.js';
import '../styles/MindmapHome.scss';


/*Component MindmapHome
  use: renders mindmap plugins landing page 
  todo: 
    import header, footer, and list of side bar element for differnet page
*/

const MindmapHome = () => {
  const [options,setOptions] = useState(undefined)
  const createType = {
    'newmindmap': React.memo(() => (<CreateNew/>)),
    'importmindmap': React.memo(() => (<CreateNew importRedirect={true}/>)),
    'enemindmap': React.memo(() => (<CreateEnE/>)),
    'assignmap': React.memo(() => (<CreateAssign/>))
  }

  var Component = (!options)? null : createType[options];
  return (
    <div className='mp__container'>
      <Header/> 
      <div className='mp__body'>
        <ActionBar collapsible={true} collapse={options}>
          <div className="mp__ic_box">
            <div className="ic_box" >
              <img onClick={()=>setOptions(undefined)} alt='Create Mindmap' className={"thumb__ic"+(options!=='assignmap'? " selected_rb_thumb":"")} src="static/imgs/create.png"/>
                <span className="rb_box_title">Create</span>
            </div>
            <div className="ic_box" >
              <img onClick={()=>setOptions('assignmap')} alt='Assign Mindmap' className={"thumb__ic"+(options==='assignmap'? " selected_rb_thumb":"")} src="static/imgs/assign.png"/>
              <span className="rb_box_title">Assign</span>
            </div>
          </div>
        </ActionBar>
        {(!options)?
        <Fragment>
          <div className='mp__middle_container'>
            <CreateOptions setOptions={setOptions}/>
          </div>
          <ReferenceBar taskTop={true} collapsible={true} hideInfo={true}/>
        </Fragment>:
        <Component/>
        }
      </div>
      <div className='mp__footer'><Footer/></div>
    </div>
  );
}
export default MindmapHome;