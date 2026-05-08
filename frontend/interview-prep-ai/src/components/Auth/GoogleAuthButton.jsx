import React, { useState, useContext } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { toast } from "react-hot-toast";

const GoogleAuthButton = () => {
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      
      const response = await axiosInstance.post(API_PATHS.AUTH.GOOGLE, {
        credential,
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        toast.success("Welcome! Authentication successful.");
        
        if (response.data.hasBlueprint) {
          navigate("/dashboard");
        } else {
          navigate("/blueprint");
        }
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      const message = err.response?.data?.message || "Google authentication failed. Please try again.";
      toast.error(message);
    }
  };

  const handleError = () => {
    toast.error("Google Sign-In failed. Please try again.");
  };

  return (
    <div className="flex justify-center w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        shape="pill"
        width="100%"
        text="continue_with"
      />
    </div>
  );
};

export default GoogleAuthButton;
