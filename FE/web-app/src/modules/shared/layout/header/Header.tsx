import React from "react"
import './Header.css'
import { defaultImageUrl } from "../.."

export const Header = () => {
    
    const testData = []
    for (let i = 0; i < 5; i++) {
        testData.push(i)
    }

    return (
        <div className="header mb-4">
            <div id="topTests" className="carousel slide pointer-event shadow-sm mt-2" data-bs-ride="carousel">
                <div className="carousel-indicators">
                    { testData.map(e => <>
                        <div  
                            data-bs-target="#topTests" 
                            data-bs-slide-to={e} 
                            className={`${e == 0? 'active':''}`}
                            aria-label="item.name"></div>
                    </>) }
                </div>
                <div className="carousel-inner">
                    { testData.map(e => <>
                        <div className={`carousel-item ${e == 0? 'active':''}`}>
                            <img className="d-block w-100" src={defaultImageUrl}/>
                            <div className="carousel-caption d-none d-md-block">
                                <h3 style={{color: 'rgb(181, 181, 181)'}}>{e}</h3>
                            </div>
                        </div>
                    </>) }

                    
                </div>
                <a className="position-absolute translate-middle-y toggle-btn top-50 ms-2" href="#topTests" role="button" data-bs-slide="prev">
                    <i className='bx bx-chevron-left fs-1 py-5 toggle-btn'></i>
                </a>
                <a className="position-absolute translate-middle-y toggle-btn top-50 end-0 me-2" href="#topTests" role="button" data-bs-slide="next">
                    <i className='bx bx-chevron-right fs-1 py-5 toggle-btn'></i>
                </a>
            </div>

        </div>
    )
}