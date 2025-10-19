import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useMemo } from 'react'
import { useState } from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import defaultImg from '../../assets/dafault.png'
import { url } from '../../baseUrl';
import { AuthContext } from '../../context/Auth';
import { api } from '../../Interceptor/apiCall';
import { db } from '../../firebase'
import FavoriteIcon from '@mui/icons-material/Favorite';

export default function RoomName({ roomId }) {
    // console.log("roomcompoent  " + roomId);
    const q = useMemo(() => query(collection(db, roomId), orderBy("timestamp", "desc"), limit(1)), [roomId])

    const context = useContext(AuthContext)
    const [roomImage, setRoomImage] = useState()
    const [roomName, setRoomName] = useState('')
    const [lastmessage, setlastmessage] = useState('')
    const [online, setOnline] = useState(false)
    const [hasUnread, setHasUnread] = useState(false)
    useEffect(() => {
        api.get(`${url}/chat/${roomId}`).then(res => {
            const nameArr = res.data.people.filter(id => id !== context.auth._id)
            if (nameArr.length > 1) {
                return api.get(`${url}/user/get/${nameArr[0]}`).then(resp => {
                    return { data: { name: `${resp.data.name} and ${nameArr.length - 1} others`, avatar: "https://images.squarespace-cdn.com/content/v1/53eba949e4b0c2eda84a38cc/1592250464335-933Q01Q1A0JOXSIRDVSR/social.png?format=500w", username: '', online: false } }
                })
            }
            return api.get(`${url}/user/get/${nameArr[0]}`)
        }).then((resp => {
            setOnline(resp.data.online)
            setRoomName(resp.data.name)
            setRoomImage(resp.data.avatar)
        })).catch(err => console.log(err))
    }, [context.auth._id, roomId])

    useEffect(() => {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages = [];
            querySnapshot.forEach((doc) => {
                messages.push(doc.data());
            });
            // Check if messages array has items and the first message has a message property
            if (messages.length > 0 && messages[0]?.message) {
                setlastmessage(messages[0].message);
                
                // Check if this message is from someone else (unread)
                if (messages[0].uid !== context.auth._id) {
                    // Get last seen timestamp from localStorage
                    const lastSeenKey = `lastSeen_${roomId}_${context.auth._id}`;
                    const lastSeenTime = localStorage.getItem(lastSeenKey);
                    const messageTime = messages[0].timestamp?.toDate?.() || new Date();
                    
                    // If no last seen time or message is newer, mark as unread
                    if (!lastSeenTime || new Date(messageTime) > new Date(lastSeenTime)) {
                        setHasUnread(true);
                    } else {
                        setHasUnread(false);
                    }
                } else {
                    setHasUnread(false);
                }
            } else {
                setlastmessage('');
                setHasUnread(false);
            }
        });
        return () => unsubscribe()
    }, [q, roomId, context.auth._id])

    return (
        <Link 
            to={`/chats/${roomId}`} 
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', margin: "18px 0", paddingLeft: '22px', cursor: 'pointer', position: 'relative' }}
            onClick={() => {
                // Mark this room as seen when clicked
                const lastSeenKey = `lastSeen_${roomId}_${context.auth._id}`;
                localStorage.setItem(lastSeenKey, new Date().toISOString());
                setHasUnread(false);
            }}
        >
            <img style={{ borderRadius: '50%', width: '52px', height: '52px', backgroundColor: '#eaeaea', position: 'relative', objectFit: 'cover' }} src={roomImage || defaultImg} alt="" />
            {
                online &&
                <div style={{
                    backgroundColor: 'green', width: '15px', height: '15px', borderRadius: '50%', position: 'relative', top: '15px', left: '-9px', zIndex
                        : '99'
                }}></div>
            }
            <div className="nameandmsg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '12px', flex: 1 }}>
                <p style={{ fontSize: '13.75px', fontWeight: hasUnread ? 'bold' : 'normal' }}>{roomName ? roomName : "...."}</p>
                <p style={{ fontSize: '12px', color: hasUnread ? 'rgba(226, 232, 240, 0.95)' : 'rgba(148, 163, 184, 0.9)', fontWeight: hasUnread ? '600' : 'normal' }}>
                    {lastmessage === "like_true" ? <FavoriteIcon sx={{ fontSize: '18px', marginTop: '4px', color: '#e33636' }} /> : lastmessage.includes("http") ? "image" : lastmessage.length > 27 ? lastmessage.slice(0, 27) + "  ..." : lastmessage}
                </p>
            </div>
            {hasUnread && (
                <div style={{
                    backgroundColor: '#ff0000',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    marginRight: '20px',
                    flexShrink: 0
                }}></div>
            )}
        </Link>
    )
}
