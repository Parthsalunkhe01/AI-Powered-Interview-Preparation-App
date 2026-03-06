import React from "react";
import Navbar from "./layouts/Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;