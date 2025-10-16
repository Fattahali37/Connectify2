import React from 'react'
import Story from './Story'

export default function StoryContainer({ stories }) {
    return (
        <>
            {Array.isArray(stories) && stories.length === 0 && <p style={{ margin: 'auto', textAlign: 'center' }}>Nothing to see here</p>}
            {
                Array.isArray(stories) && stories.map(story =>
                    <Story key={story[0].id} id={story[0].id} owner={story[0].owner} seen={[]} />
                )
            }
        </>
    )
}
