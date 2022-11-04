import React, {useEffect} from 'react';
import ScheduleHome from './containers/ScheduleHome'
import { useHistory } from 'react-router-dom';
import {RedirectPage} from '../global';
import ServiceBell from "@servicebell/widget";
import { useSelector} from 'react-redux';
export var history

/*Component App
  use: defines components for each url
*/

const Schedule = () => {
  const userInfo = useSelector(state=>state.login.userinfo);
    if(userInfo.isTrial){
        ServiceBell("init", "07e1c4e7d40744869cc8cca1ba485f2c");
    }
  history = useHistory();

  useEffect(()=>{
    if(window.localStorage['navigateScreen'] !== "scheduling"){
        RedirectPage(history, { reason: "screenMismatch" });
    }
  }, []);
  
  return (
      <ScheduleHome/>
  );
}

export default Schedule;