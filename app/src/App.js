import React from 'react';
import { HashRouter as Router, Route ,Switch} from "react-router-dom";
import Login from './pages/login';
import Admin from './pages/admin';
import Mindmap from './pages/mindmap';
import {createStore,combineReducers} from 'redux';
import {Provider} from 'react-redux';
import mindmapReducer from './pages/mindmap/state/reducer.js'
import adminReducer from './pages/admin/state/reducer.js'
import 'bootstrap/dist/css/bootstrap.min.css';

/* combining multiple domains reducer */
const rootReducer = combineReducers({
  mindmap : mindmapReducer,
  admin : adminReducer
});

const store = createStore(rootReducer)

/*Component App
  use: defines components for each url
*/

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/admin" component={Admin} />
          <Route path="/mindmap" component={Mindmap} />
          <Route component={Login} />
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;