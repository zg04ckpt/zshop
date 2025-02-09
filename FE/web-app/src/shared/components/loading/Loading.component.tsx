import React from "react";
import './Loading.component.css';
import { BaseProp } from "../../model/base-prop.model";

type LoadingProp = BaseProp & {
    isShow: boolean;
}

const Loading = (prop: LoadingProp) => {
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

export default Loading;