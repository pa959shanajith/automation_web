import React, { useState } from 'react';
import { ModalContainer } from '../../global';
import { resetPassword } from '../api';
import '../styles/ChangePassword.scss';

/*
    Component: Change Password Modal Popup
    Uses: Renders the modal Popup for changing password
    Props: setShow -> setState for displaying and hiding modal
            setSuccessPass -> successPass setState to flip the flag once change pass is success

*/

const ChangePassword = ({setShow, setSuccessPass}) => {

    const [currpassword, setCurrPassword] = useState("");
    const [newpassword, setNewPassword] = useState("");
    const [confpassword, setConfPassword] = useState("");
    const [currPassError, setCurrPassError] = useState(false);
    const [newPassError, setNewPassError] = useState(false);
    const [confPassError, setConfPassError] = useState(false);
    const [passwordValidation, setPasswordValid] = useState("");

    const handleClose = () => setShow(false);
    const showSuccessPopup = () => setSuccessPass(true);

    const currPassHandler = event => {
        let val = event.target.value.replace(/\s/g, "");
        resetErrorFlags();
        setCurrPassword(val);
    }

    const newPassHandler = event => {
        let val = event.target.value.replace(/\s/g, "");
        resetErrorFlags();
        setNewPassword(val);
    }

    const confPasshandler = event => {
        let val = event.target.value.replace(/\s/g, "");
        resetErrorFlags();
        setConfPassword(val);
    }


     const resetFields = event => {
        event.preventDefault();
		setCurrPassword("");
		setNewPassword("");
		setConfPassword("");
		resetErrorFlags();
    };
    
    const resetErrorFlags = () => {
        setCurrPassError(false);
        setNewPassError(false);
        setConfPassError(false);
        setPasswordValid("");
    }
    
    const resetPass = event => {
        event.preventDefault();
        resetErrorFlags();
        
        let regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if (!currpassword) {
			setCurrPassError(true);
			setPasswordValid("Current Password field is empty.");
		} else if (!newpassword) {
			setNewPassError(true);
			setPasswordValid("New Password field is empty.");
		} else if (!regexPassword.test(newpassword)) {
			setNewPassError(true);
			setPasswordValid("Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase, length should be minimum 8 characters and maximum 16 characters..");
		} else if (!confpassword) {
			setConfPassError(true);
			setPasswordValid("Confirm Password field is empty.");
		} else if (newpassword !== confpassword) {
			setConfPassError(true);
			setPasswordValid("New Password and Confirm Password do not match");
		} else {
			resetPassword(newpassword, currpassword)
			.then(data => {
                if(data === "Invalid Session") setPasswordValid("Invalid Session")
                else if(data === "success") {
					handleClose();
					showSuccessPopup();
				} else if(data === "same"){
					setNewPassError(true);
					setConfPassError(true);
					setPasswordValid("Sorry! You can't use the existing password again");
				} else if(data === "incorrect") {
					setCurrPassError(true);
					setPasswordValid("Current Password is incorrect");
                } else if(data == "reusedPass" || data == "insuff" || data == "same") {
					setNewPassError(true);
					setConfPassError(true);
					if (data == "same") setPasswordValid("New Password provided is same as old password");
					else if (data == "insuff") setPasswordValid("Password must contain atleast 1 special character, 1 numeric, 1 uppercase and lowercase alphabet, length should be minimum 8 characters and maximum 16 characters.");
					else setPasswordValid("Password provided does not meet length, complexity or history requirements of application.");
				} else if(data === "fail") setPasswordValid("Failed to Change Password")
				else if(/^2[0-4]{10}$/.test(data)) setPasswordValid("Invalid Request")
            })
            .catch(error => {
				setCurrPassError(true);
				setPasswordValid("Failed to Authenticate Current Password.");
			});
		}
    };

    const Content = () => (
        <div className="pass_inputs_container">
            <input className={"reset_pass_inputs " + (currPassError ? "error_reset_field" : "")} placeholder="Current Password" type="password" onChange={currPassHandler} value={currpassword} />
            <input className={"reset_pass_inputs " + (newPassError ? "error_reset_field" : "")} placeholder="New Password" type="password" onChange={newPassHandler} value={newpassword} />
            <input className={"reset_pass_inputs " + (confPassError ? "error_reset_field" : "")} placeholder="Confirm Password" type="password" onChange={confPasshandler} value={confpassword}/>
            <span className={"pass_valid_err " + (passwordValidation ? "" : "hide_pass_valid")}>{passwordValidation ? passwordValidation : "none"}</span>
        </div>
    );

    const Footer = () => (
        <div className="reset_dialog_btns">
            <button className="clear_reset_fields" onClick={resetFields}>Clear</button>
            <button className="submit_reset" onClick={resetPass}>Submit</button>
        </div>
    );

    return (
        <ModalContainer
        close={handleClose}
        title={"Change Password"}
        content={Content()}
        footer={Footer()}
        />
    );
}

export default ChangePassword;