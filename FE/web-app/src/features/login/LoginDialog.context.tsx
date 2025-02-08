import React, { createContext, ReactNode, use, useContext, useState } from "react";


interface LoginDialogProp {
    isOpen: boolean;
    showLoginDialog: () => void;
    hideLoginDialog: () => void;
}

const LoginDialogContext = createContext<LoginDialogProp | null>(null);

export const LoginDialogProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [isOpen, setStatus] = useState<boolean>(false);

    const showLoginDialog = () => setStatus(true);
    const hideLoginDialog = () => setStatus(false);

    return (
        <LoginDialogContext.Provider value={{ isOpen, showLoginDialog, hideLoginDialog }}>
            {children}
        </LoginDialogContext.Provider>
    );
} 

export const useLoginDialog = ():LoginDialogProp => {
    const context = useContext(LoginDialogContext);
    if (!context)
        throw new Error("Context is not exist.");
    return context;
}
