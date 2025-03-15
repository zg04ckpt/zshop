import React from "react";
import './ReviewComment.css';
import { BaseProp, defaultImageUrl } from "../../../shared";

type ReviewCommentProp = BaseProp & {

}

const ReviewComment = (prop: ReviewCommentProp) => {
    return (
        <div className={prop.className}>
            <div className="d-flex">
                {/* Reviewer avt */}
                <div className="">
                    <img className="user-img" src={defaultImageUrl} alt="" />
                </div>
                <div className="d-flex flex-column ms-2">
                    {/* Header */}
                    <div className="d-flex header">
                        <div className="fw-bold action-text">nguyencao142</div>
                        <div className="text-secondary ms-2">• 3 ngày trước</div>
                    </div>

                    {/* Rate */}
                    <div className="d-flex rate align-items-center">
                        <i className='bx bxs-star me-1'></i>
                        <i className='bx bxs-star me-1'></i>
                        <i className='bx bxs-star me-1'></i>
                        <i className='bx bxs-star me-1'></i>
                        <i className='bx bxs-star me-1'></i>
                        <div className="rate-float">(4.5)</div>
                    </div>

                    {/* Comment */}
                    <p className="max-3-lines">Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia aliquid dolor, optio nisi suscipit, deleniti molestiae sit vel nam voluptas a? Quia inventore alias doloribus molestiae fugit eveniet quas itaque?</p>

                    {/* Review images / video */}
                    <div className="d-flex">

                        <div className="review-video me-2 position-relative pointer-hover">
                            <img src={defaultImageUrl} alt="" />
                            <div className="review-video-tag align-items-center justify-content-between d-flex position-absolute">
                                <i className='bx bxs-video-recording'></i>
                                <div className="duration me-1">00:23</div>
                            </div>
                        </div>

                        <img className="review-image me-2 pointer-hover" src={defaultImageUrl} alt="" />
                    </div>
                </div>
            </div>
        </div>
        
    );
}

export default ReviewComment;