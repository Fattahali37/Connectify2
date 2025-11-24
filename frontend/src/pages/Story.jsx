import React, { useContext, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import Topbar from '../components/story/Topbar';
import ViewBox from '../components/story/ViewBox';
import { AuthContext } from '../context/Auth';

export default function Story() {
    // const params = useParams()
    const [query] = useSearchParams()
    const { findStory } = useContext(AuthContext)
    // console.log(query.get('id'));
    // console.log(params.userId);
    const stories = useMemo(() => findStory(query.get('id')), [findStory, query])
    // console.log(stories);
    return (
        <div style={{ width: '100%', height: '100vh', backgroundColor: '#1a1a1a', position: 'fixed', top: 0, left: 0, zIndex: 5555, overflow: 'hidden' }}>
            <Topbar />
            <div className="story_box_view" style={{ width: '100%', height: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
                <ViewBox profile={query.get('profile')} stories={stories} />
            </div>
        </div>
    )
}
