import React from "react";
import '../styles/components/Loading.css';
import { BaseProp } from "../types/base";

type LoadingProp = BaseProp & {
    isShow: boolean;
}

export const Loading = (prop: LoadingProp) => {
    return (
        <>
            { prop.isShow && (
                <div className="loading">
                    <div className="loading-wrapper">
                        <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
                    </div>
                </div>
            ) }
        </>
    );
}
