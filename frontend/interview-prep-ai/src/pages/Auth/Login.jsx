import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/Helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPath";
import { UserContext } from "../../context/userContext";

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const context = useContext(UserContext);
  //console.log("UserContext inside Login:", context); // 👈 see if this logs properly

  const { updateUser } = context;

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return;
    }

    if (!password) {
      setError("Please enter a valid password.")
      return;
    }

    setError("");

    try {
      console.log("Calling:", axiosInstance.defaults.baseURL + API_PATHS.AUTH.LOGIN);
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data)

        // Intelligent Redirection
        if (response.data.hasBlueprint) {
          navigate("/dashboard");
        } else {
          navigate("/blueprint");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.")
      }
    }
  };
  return <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
    <h3 className="text-lg font-semibold text-black">
      Welcome Back
    </h3>
    <p className="text-xs text-slate-700 mt-[5px] mb-6">
      Please enter your details to log in
    </p>

    <form onSubmit={handleLogin}>
      <Input
        value={email}
        onChange={({ target }) => setEmail(target.value)}
        label="Email Address"
        placeholder="xyz@gmail.com"
        type="text"
      />
      <Input
        value={password}
        onChange={({ target }) => setPassword(target.value)}
        label="Password"
        placeholder="Min 8 Characters"
        type="password"
      />

      {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
      <button type="submit" className="h-10 w-full text-white bg-black hover:bg-[#f4cfc3] rounded transition-colors duration-300">
        LOGIN
      </button>

      <p className="text-[13px] text-slate-800 mt-3">
        Don't have an account?{" "}
        <button
          className="font-medium text-primary underline cursor-pointer"
          onClick={() => {
            setCurrentPage("signUp");
          }}
        >
          SignUp
        </button>
      </p>
    </form>
  </div>
};

export default Login;