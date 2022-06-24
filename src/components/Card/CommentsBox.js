import React, { useState } from 'react'
import EachComment from './EachComment';

function CommentsBox({ item_id, comments, sendComment }) {
    const [newComment, setNewComment] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(newComment.trim().length < 1){
            return
        }
        sendComment(item_id, newComment, () => setNewComment(""))
    }
    return (
        <div className='comment-box'>
            <form onSubmit={e => handleSubmit(e)}>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Enter comment!"
                />
                <button type='submit'>Send</button>
            </form>
            <div className='comment-list'>
                {comments?.slice(0).reverse().map((item, index) => {
                    return <EachComment
                        key={index}
                        item={item}
                    />
                })}
                {comments?.length === 0 && <div className='no-comment'>
                    <div className='empty'>No comments yet.</div>
                </div>}
            </div>

        </div>
    )
}

export default CommentsBox