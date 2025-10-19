import React, { useEffect } from 'react'
import { Masonary } from '../components/explore/Masonary'
import '../components/home/home.css'
import { api } from '../Interceptor/apiCall'
import { url } from '../baseUrl'
import { useState } from 'react'
import { Spinner } from '../assets/Spinner'
import { useContext } from 'react'
import { AuthContext } from "../context/Auth";


export default function Explore() {
  const [posts, setPost] = useState([])
  const [loading, setLoading] = useState(true)

  const context = useContext(AuthContext)


  useEffect(() => {
    api.get(`${url}/post/get/explore`).then(res => {
      console.log(res.data);
      setPost(res.data)
    }).finally(() => {
      setLoading(false)
    })

    return () => {
      setPost([])
    }
  }, [])


  useEffect(() => {
    context.handleActive("explore")
  }, [context])

  return (
    <div className='explore-page' style={{
      width: 'calc(100% - 280px)',
      minHeight: '100vh',
      padding: '32px 40px',
      marginLeft: '280px',
      background: 'linear-gradient(180deg, rgb(2, 6, 23) 0%, rgb(15, 23, 42) 50%, rgb(2, 6, 23) 100%)',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Background decorative gradients */}
      <div style={{
        content: '',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      
      {/* Content Container */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Section */}
        <div style={{
          marginBottom: '40px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '24px',
          padding: '32px 40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>
            Explore
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'rgba(148, 163, 184, 0.9)',
            fontWeight: '400'
          }}>
            Discover amazing content from the community
          </p>
        </div>

        {/* Posts Grid Container */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4) 0%, rgba(30, 41, 59, 0.4) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          minHeight: '400px'
        }}>
          {
            posts.length === 0 && loading && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Spinner />
              </div>
            )
          }
          {
            posts.length === 0 && !loading && (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(148, 163, 184, 0.6)" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p style={{
                  fontWeight: '600',
                  fontSize: '20px',
                  color: 'rgba(226, 232, 240, 0.95)',
                  marginBottom: '8px'
                }}>
                  No posts yet
                </p>
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(148, 163, 184, 0.9)',
                  maxWidth: '400px'
                }}>
                  Be the first to share something amazing with the community!
                </p>
              </div>
            )
          }
          {posts.length > 0 && <Masonary posts={posts} />}
        </div>
      </div>
    </div>
  )
}
