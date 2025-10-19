import React, { useEffect, useState } from 'react'
import { Image } from '../post/Image'

export const Masonary = ({ posts }) => {
    const [images, setImages] = useState([])
    useEffect(() => {
        setImages(posts)
    }, [posts])
    return (
        <div className='masonry-grid' style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '24px',
            padding: '4px'
        }}>
            {
                images?.map(item =>
                    <Image userId={item.owner} postId={item._id} likes={item.likes.length} comments={item.comments.length} key={item._id} src={item.files[0].link}></Image>
                )
            }
        </div>
    )
}
