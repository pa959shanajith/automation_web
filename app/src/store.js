import { configureStore } from "@reduxjs/toolkit";
// import all the slices for the components 
// for example
// import loginReducer from './pages/login/loginSlice.js

import loginReducer from './pages/login/loginSlice'
import designSlice from "./pages/design/designSlice";
import configureSetupSlice from "./pages/execute/configureSetupSlice";
import adminSlice from "./pages/admin/adminSlice";
import globalSlice from "./pages/global/globalSlice";
import stepsSlice from './pages/landing/components/VerticalComponentsSlice';
import landingReducer from './pages/landing/LandingSlice';
import configurePageSlice from "./pages/execute/configurePageSlice";

export default configureStore({
    reducer: {
        // All the reducer from the slices needs to be combined here ex
        login: loginReducer,
        steps: stepsSlice,
        landing: landingReducer,
        design: designSlice,
        configsetup: configureSetupSlice,
        configpage: configurePageSlice,
        progressbar: globalSlice,
        admin: adminSlice,

    }
})