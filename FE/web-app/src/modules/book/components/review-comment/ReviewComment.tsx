import React, { useState } from "react";
import './ReviewComment.css';
import { BaseProp, convertDateToTimeSpan, defaultImageUrl } from "../../../shared";
import { BookReviewListItemDTO } from "../../types/book";
import { Rating } from "@mui/material";
import { PhotoSlider } from "react-photo-view";

type ReviewCommentProp = BaseProp & {
    data: BookReviewListItemDTO
}

const ReviewComment = (prop: ReviewCommentProp) => {
    const [showImages, setShowImages] = useState<boolean>(false);

    return (
        <div className={`${prop.className} review-comment`}>
            <div className="d-flex">
                {/* Reviewer avt */}
                <div className="">
                    <img className="user-img rounded-pill border border-1 border-info p-1" src={prop.data.userAvatarUrl} alt="" />
                </div>
                <div className="d-flex flex-column ms-2">
                    {/* Header */}
                    <div className="d-flex header">
                        <div className="fw-bold action-text">{prop.data.userName}</div>
                        <div className="text-secondary ms-2">• {convertDateToTimeSpan(prop.data.createdAt)}</div>
                    </div>

                    {/* Rate */}
                    <Rating name="half-rating-read" defaultValue={prop.data.rate} precision={0.5} readOnly />

                    {/* Comment */}
                    <p className="max-3-lines">{prop.data.content}</p>

                    {/* Review images / video */}
                    <div className="d-flex">

                        {/* <div className="review-video me-2 position-relative pointer-hover">
                            <img src={defaultImageUrl} alt="" />
                            <div className="review-video-tag align-items-center justify-content-between d-flex position-absolute">
                                <i className='bx bxs-video-recording'></i>
                                <div className="duration me-1">00:23</div>
                            </div>
                        </div> */}

                        {prop.data.imageUrls.map(e => <>
                            <img className="review-image me-2 pointer-hover" onClick={() => setShowImages(true)} src={e} alt="" />
                        </>)}
                    </div>
                </div>
            </div>

            <PhotoSlider 
                visible={showImages}
                onClose={() => setShowImages(false)}
                images={prop.data.imageUrls.map(e => ({key: e, src: e}))}/>
        </div>
        
    );
}

export default ReviewComment;