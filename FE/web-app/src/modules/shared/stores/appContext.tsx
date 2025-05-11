import { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { ConfirmDialogModel } from "../components/confirm-dialog/ConfirmDialog";

interface AppContextType {
    confirmDialogData: ConfirmDialogModel|null;
    showConfirmDialog: (data: ConfirmDialogModel) => void;
    hideConfirmDialog: () => void;
}

const AppContext = createContext<AppContextType|null>(null);

export const AppContextProvider:React.FC<{ children: ReactNode }> = ({ children }) => {
    // For confirm dialog
    const [confirmDialogState, setConfirmDialogState] = useState<ConfirmDialogModel|null>(null);
    const showConfirmDialog = (data: ConfirmDialogModel) => setConfirmDialogState(data);
    const hideConfirmDialog = () => setConfirmDialogState(null);

    return (
        <AppContext.Provider value={{ confirmDialogData: confirmDialogState, showConfirmDialog, hideConfirmDialog }}>
            {children}
        </AppContext.Provider>
    );
}

export const useAppContext = () => useContext(AppContext);