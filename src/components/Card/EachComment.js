import React from 'react'

function EachComment({ item }) {
    let timestamp = Number(item.timestamp.toString());
    let dateObject = new Date(timestamp);
    let date = dateObject.toLocaleDateString();
    let time = dateObject.toLocaleTimeString();
    
    return (
        <div className='each-comment'>
            <div className='header-section'>
                <div className='author'>
                    <img src="https://cdn.pixabay.com/photo/2013/07/13/12/07/avatar-159236__340.png"/>
                    {item.author.toString()}
                </div>
                <div className='date'>
                    {date} {time}
                </div>
            </div>
            <div className='content'>
                {item.content}
            </div>
        </div>
    )
}

export default EachComment