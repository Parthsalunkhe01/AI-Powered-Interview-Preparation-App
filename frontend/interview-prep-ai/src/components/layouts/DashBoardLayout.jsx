import React, { useContext } from "react";
import { UserContext } from "../../context/userContext";
import Navbar from "./Navbar";

const DashboardLayout = ({ children }) => {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {user && <div className="bg-background min-h-[calc(100vh-64px)]">{children}</div>}
    </div>
  );
};

export default DashboardLayout;