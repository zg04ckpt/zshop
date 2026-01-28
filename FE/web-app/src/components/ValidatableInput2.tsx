import React, { useEffect, useRef, useState } from "react";
import '../styles/components/ValidatableInput2.css';
import { TextField } from "@mui/material";
import { BaseProp } from "../types/base";

type InputProp<T> = BaseProp & {
    label: string;
    type: string;
    initVal?: string;
    valueChange: (val:string) => void;
    validator: (val:string) => string|null;
    compareValue?: string;
    compareErrorMessage?: string;
    isFormFocus?: boolean;
    isMultiLine?: boolean;
    isMaxWidth?: boolean;
    pxWidth?: number;
}

export const ValidatableInput2 = <T,>(prop: InputProp<T>) => {
    const [error, setError] = useState<string|null>(null);
    useEffect(() => {
        if (prop.isFormFocus) {
            setError(prop.validator(prop.initVal ?? ''));
        }
    }, [prop.isFormFocus]);

    return (
        <div className="validation-input-2">
            <TextField
                multiline={prop.isMultiLine}
                className={prop.className}
                size="small"
                fullWidth={prop.isMaxWidth}
                error={error != null}
                type={prop.type}
                label={prop.label}
                value={prop.initVal ?? ''}
                helperText={error}
                onChange={e => {
                    prop.valueChange(e.target.value);
                    setError(prop.validator(e.target.value));
                }}
            />
        </div>
    );
}
