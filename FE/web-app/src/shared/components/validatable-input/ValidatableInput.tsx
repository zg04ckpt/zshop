import React, { useEffect, useState } from "react";
import './ValidatableInput.css';
import { BaseProp } from "../../model/base-prop.model";
import { initial } from "lodash";

type InputProp<T> = BaseProp & {
    type: string;
    initVal?: string;
    valueChange: (val:string) => void;
    validator: (val:string) => string|null;
    compareValue?: string;
    compareErrorMessage?: string;
    isFormFocus?: boolean;
    isMultiLine?: boolean;
    pxWidth?: number;
}

export const ValidatableInput = <T,>(prop: InputProp<T>) => {

    const [value, setValue] = useState<string>('');
    const [error, setError] = useState<string|null>(null);
    const [focus, setFocus] = useState<boolean>(false);

    // 
    useEffect(() => {
        if (focus || prop.isFormFocus) {
            const err = prop.validator(value);
            if (err) {
                setError(err);
            } else if (prop.compareValue != undefined && value != prop.compareValue) {
                setError(prop.compareErrorMessage!);
            } else {
                setError(null);
            }
            prop.valueChange(value);
        }
    }, [value, focus, prop.compareValue, prop.isFormFocus]);

    useEffect(() => setValue(prop.initVal || ''), [prop.initVal]);

    return (
        <div className="validation-input" style={{
            width: prop.pxWidth? `${prop.pxWidth}px`:''
        }}>
            { prop.isMultiLine && <textarea value={value} onFocus={() => setFocus(true)} onChange={e => setValue(e.target.value)} className={`input ${error? 'invalid':''}`}></textarea> }
            { !prop.isMultiLine && <input value={value} onFocus={() => setFocus(true)} onChange={e => setValue(e.target.value)} className={`input ${error? 'invalid':''}`} type={prop.type}/> }
            <div className="error-mess">{ error && <div>{error}</div> }</div>
        </div>
    );
}
