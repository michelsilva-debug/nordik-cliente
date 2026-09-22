import { useContext } from "react";
import { TenantContext } from "../contexts/tenant-context";

export const useTenant = () => useContext(TenantContext);
