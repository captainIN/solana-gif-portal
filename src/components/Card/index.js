import './style.scss';
import React, { useState } from 'react'
import CommentsBox from './CommentsBox';

function Card({ item, sendComment }) {
    const [showComments, setShowComments] = useState(false)
    return (
        <div className='card'>
            <div className="gif-item">
                <img src={item.gifLink} />
                <div className='user-label'>
                    <img src="https://cdn.pixabay.com/photo/2013/07/13/12/07/avatar-159236__340.png"/>
                    {item.userAddress.toString()}
                </div>
                <div className='stats-card'>
                    <div className='stat'>{item.comments.length} Comments</div>
                </div>
            </div>

            <CommentsBox item_id={item.id} comments={item.comments} sendComment={sendComment} />
        </div>
    )
}

export default Card