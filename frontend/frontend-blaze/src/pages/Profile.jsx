import React from "react";
import { useAccount } from "wagmi";
import MotionWrapper from "../components/MotionWrapper";

export default function Profile() {
  const { address, isConnected } = useAccount();

  return (
    <MotionWrapper>
      <h2 className="page-heading">Profile</h2>
      {isConnected ? <p className="muted">Connected: {address}</p> : <p className="error">Please connect wallet</p>}
    </MotionWrapper>
  );
}