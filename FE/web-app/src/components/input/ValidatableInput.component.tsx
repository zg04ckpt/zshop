import React, { useEffect, useState } from "react";
import './ValidatableInput.component.css';
import { BaseProp } from "../../base/Base.prop";

type InputProp<T> = BaseProp & {
    type: string;
    valueChange: (val:string) => void;
    validator: (val:string) => string|null;
    compareValue?: string;
    compareErrorMessage?: string;
    isFormFocus?: boolean 
}

const ValidatableInput = <T,>(prop: InputProp<T>) => {

    const [value, setValue] = useState<string>('');
    const [error, setError] = useState<string|null>(null);
    const [focus, setFocus] = useState<boolean>(false);

    // 
    useEffect(() => {
        if (focus || prop.isFormFocus) {
            const err = prop.validator(value);
            debugger
            if (err) {
                setError(err);
            } else if (prop.compareValue != undefined && value != prop.compareValue) {
                setError(prop.compareErrorMessage!);
            } else {
                setError(null);
            }
        }
        prop.valueChange(value);
    }, [value, focus, prop.compareValue, prop.isFormFocus]);

    // // This input value is valid when error == null
    // useEffect(() => {
    //     prop.validChange(!error);
    // }, [error]);

    return (
        <div className="validation-input">
            <input onFocus={() => setFocus(true)} onChange={e => setValue(e.target.value)} className={`${error? 'invalid':''}`} type={prop.type}/>
            <div className="error-mess">{ error && <div>{error}</div> }</div>
        </div>
    );
}

export default ValidatableInput;