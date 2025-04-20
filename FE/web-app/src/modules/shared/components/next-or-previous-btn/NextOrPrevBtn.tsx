import React from "react";
import './NextOrPrevBtn.css';
import { BaseProp } from "../..";

type NextOrPrevBtnProp = BaseProp & {
    type: 'next'|'prev';
    onClick: () => void;
}

const NextOrPrevBtn = (prop: NextOrPrevBtnProp) => {
    return (
        <div 
            className="shadow-sm next-or-prev-btn text-center align-content-center"
            onClick={prop.onClick}
        >
            { prop.type == 'next' && <i className="fas fa-chevron-right"></i> }
            { prop.type == 'prev' && <i className="fas fa-chevron-left"></i> }
        </div>
    );
}

export default NextOrPrevBtn;