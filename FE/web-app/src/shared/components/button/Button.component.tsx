import React from "react";
import './Button.component.css'
import { BaseProp } from "../../model/base-prop.model";

type ButtonProp = BaseProp & {
    loading?: boolean;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
}

export default function Button(prop: ButtonProp) {
    return (
        <button onClick={prop.onClick} className={prop.className} disabled={prop.loading} style={{width:'fit-content'}}>
            <div className="content d-flex position-relative" >
                {prop.icon && <div className="me-1"> {prop.icon} </div>}
                <div className="w-100"> {prop.label} </div>

                {/* Loading */}
                { prop.loading && (
                    <div className="loading position-absolute top-0 start-0 w-100 h-100 align-content-center">
                        <div className="spinner-border" style={{width: '14px', height: '14px', fontSize: '8px'}}></div>
                    </div>
                )}
                
            </div>
            
            
        </button>
    );
}