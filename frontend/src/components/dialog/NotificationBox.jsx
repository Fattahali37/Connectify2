import React, { useEffect, useState } from 'react'
import { url } from '../../baseUrl'
import { api } from '../../Interceptor/apiCall'
import { Notification } from '../notification/Notification'
import { Spinner } from '../../assets/Spinner'

export const NotificationBox = () => {
    const [noti, setNoti] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        // Fetch notifications
        console.log("📧 Fetching notifications for current user...");
        api.get(`${url}/user/view/notifications`).then((res) => {
            console.log("📧 Notifications response:", res.data);
            console.log("📧 Number of notifications:", res.data?.length || 0);
            // Ensure the response is an array
            setNoti(Array.isArray(res.data) ? res.data : [])
        }).catch((err) => {
            console.log(err)
            // Set to empty array on error to prevent map error
            setNoti([])
        }).finally(() => {
            setLoading(false)
        })
        
        // Mark all notifications as read when opening the notification box
        // Add slight delay to ensure component is mounted
        const markReadTimer = setTimeout(() => {
            api.put(`${url}/user/notifications/mark-read`)
                .then((response) => {
                    console.log('✅ Notifications marked as read:', response.data);
                })
                .catch((err) => {
                    console.error('❌ Error marking notifications as read:', err);
                    console.error('Error details:', err.response?.data);
                });
        }, 300);
        
        return () => clearTimeout(markReadTimer);
    }, [])
    return (
        <div style={{ fontSize: '14px', fontFamily: 'Poppins', padding: '15px 0px', marginTop: '-5px' }}>
            {
                noti?.length === 0 && loading && <Spinner />
            }
            {
                noti?.length === 0 && !loading && <p style={{ fontSize: '14px', textAlign: 'center', marginTop: '39px' }}>Nothing to see here</p>
            }
            {
                Array.isArray(noti) && noti.map(item =>
                    <Notification key={item._id} seen={item.seen} userId={item.user} content={item.content} postId={item.postId} NotificationType={item.NotificationType} followbtn={item.NotificationType === 3} time={item.time} />
                )
            }

        </div>
    )
}
