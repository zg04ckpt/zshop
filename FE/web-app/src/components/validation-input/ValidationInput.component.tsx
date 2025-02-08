import React, { useEffect, useState } from "react";
import './ValidationInput.component.css';
import { BaseProp } from "../../base/Base.prop";

type ValidationInputProp = BaseProp & {
    type: string;
    valueChange: (val:any) => void;
    errorMessage?: string | null;
    onFocus?: () => void;
}

const ValidationInput = (prop: ValidationInputProp) => {

    return (
        <div className="validation-input">
            <input onFocus={() => prop.onFocus? prop.onFocus(): {}} onChange={e => prop.valueChange(e.target.value)} className={`${prop.errorMessage? 'invalid':''}`} type={prop.type}/>
            <div className="error-mess">{ prop.errorMessage && <div>{prop.errorMessage}</div> }</div>
        </div>
    );
}

export default ValidationInput;