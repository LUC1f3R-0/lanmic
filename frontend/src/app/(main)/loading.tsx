"use client";

import React, { useEffect, useState } from "react";

const Loader = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const containerStyle: React.CSSProperties = {
    height: "100vh",
    width: "100vw",
    fontFamily: "Helvetica, Arial, sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
    margin: 0,
    padding: 0,
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 9999,
  };

  const loaderStyle: React.CSSProperties = {
    height: "20px",
    width: "250px",
    position: "relative",
  };

  const createDotStyle = (
    color: string,
    delay: number
  ): React.CSSProperties => ({
    height: "20px",
    width: "20px",
    borderRadius: "50%",
    position: "absolute",
    backgroundColor: color,
    top: 0,
    left: 0,
    animation: `loaderMove 3s ease-in-out infinite ${delay}s`,
  });

  const textStyle: React.CSSProperties = {
    position: "absolute",
    top: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    fontWeight: "bold",
    fontSize: "16px",
    color: "#333",
  };

  return (
    <>
      <style>{`
        @keyframes loaderMove {
          0%, 15% { 
            transform: translateX(0px); 
          }
          45%, 65% { 
            transform: translateX(230px); 
          }
          95%, 100% { 
            transform: translateX(0px); 
          }
        }
      `}</style>

      <div style={containerStyle}>
        <div style={loaderStyle}>
          <div style={createDotStyle("#8cc759", 0.5)} />
          <div style={createDotStyle("#8c6daf", 0.4)} />
          <div style={createDotStyle("#ef5d74", 0.3)} />
          <div style={createDotStyle("#f9a74b", 0.2)} />
          <div style={createDotStyle("#60beeb", 0.1)} />
          <div style={createDotStyle("#fbef5a", 0)} />
          <div style={textStyle}>Loading{dots}</div>
        </div>
      </div>
    </>
  );
};

export default Loader;
