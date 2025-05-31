"use client";
import {KindeProvider} from "@kinde-oss/kinde-auth-nextjs";
import React from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({children}: AuthProviderProps) => {
  return <KindeProvider>{children}</KindeProvider>;
};