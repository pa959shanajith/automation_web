import axios from 'axios';
const url = "https://"+window.location.hostname+":8443";

/*Component RedirectPage
*/
export const logoutUser = () => {
    return new Promise((resolve, reject) => {
        axios(url+"/logoutUser", {
            method : 'POST',
            headers : {
                'Content-type' : "application/json"
            },
            data: {'param': 'logoutUser'},
            credentials : 'include'
        })
        .then(res => {
            if (res.status === 200) {
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err)
        })
    });
}

/*Component ResetSession
*/
export const keepSessionAlive = () => {
    return new Promise((resolve, reject)=>{
        axios(url+"/keepSessionAlive", {
            method : 'POST',
            credentials : 'include'
        })
        .then(res=>{
            if (res.status === 200) {
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err)
        })
    });
}

/*Component TaskContents
  api returns fail/inprogress
*/
export const updateTaskStatus = obj => {
    return new Promise((resolve, reject) => {
        axios(url+"/updateTaskstatus_mindmaps", {
            method: 'POST',
            headers : {
                'Content-type' : 'application/json'
            },
            data : {'obj': obj},
            credentials : 'include',
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status)
            }
        })
        .catch(err => {
            reject(err);
        })
    });
}

/*Component ChangePassword
  api returns "Invalid Session"/"success"/"same"/"incorrect"/"fail"
*/
export const resetPassword = (newpassword, currpassword) => {
    return new Promise((resolve, reject) => {
        axios(url+"/resetPassword", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            data: {'newpassword': newpassword, 'currpassword': currpassword},
            credentials : 'include'
        })
        .then(res => {
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}

/*Component Header
  api returns {"": ""}
*/
export const getRoleNameByRoleId = async(roleasarray) => {
    return new Promise((resolve, reject)=>{
        axios(url+"/getRoleNameByRoleId", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            data: {'action': "getRoleNameByRoleId", 'role': roleasarray},
            credentials : 'include'
        })
        .then(res=>{
            if (res.status === 200){
                resolve(res.data);
            }
            else{
                reject(res.status);
            }
        })
        .catch(err => {
            reject(err);
        })
    })
}