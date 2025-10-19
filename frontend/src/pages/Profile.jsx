import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Image } from '../components/post/Image'
import { Spinner } from '../assets/Spinner'
import { url } from '../baseUrl'
import { api } from '../Interceptor/apiCall'
import { useContext } from 'react'
import { AuthContext } from '../context/Auth'
import { Dialog, DialogContent, DialogTitle, } from '@mui/material'
import { Followers } from '../components/dialog/Followers'
import Story from '../components/profile/Story'

export const Profile = ({ findStory, post = true }) => {
  const navigate = useNavigate()
  const context = useContext(AuthContext)
  const [user, setUser] = useState()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [iFollow, setIFollow] = useState(false)
  const [toggle, setToggle] = useState(1)
  const [followers, setFollowers] = useState(0)
  const params = useParams()

  useEffect(() => {
    api.get(`${url}/user/${params.username}`).then(resp => {
      setUser(resp.data)
      setFollowers(resp.data.followers.length)
      setIFollow(resp.data.followers.includes(context.auth._id))
      if (resp.data._id === context.auth._id) {
        context.handleActive("myprofile")
      } else {
        context.handleActive()
      }
    }).catch(err => console.log(err))
    return () => setUser()
  }, [context, params.username])

  useEffect(() => {
    if (!user) return
    if (post) {
      api.get(`${url}/post/userpost/${user?._id}`).then((data) => {
        setLoading(false)
        if (data) {
          setPosts(data.data);
        }
      }).catch(err => {
        console.log(err);
      })
    }
    if (!post) {
      api.get(`${url}/post/get/saved`).then((data) => {
        setLoading(false)
        if (data) {
          setPosts(data.data);
        }
      }).catch(err => {
        console.log(err);
      })
    }
    return () => {
      setPosts([])
    }
  }, [post, user])


  async function handleFollow() {
    api.get(`${url}/user/handlefollow/${user._id}`).then((res) => {
      if (res.data?.success) {
        setIFollow(prev => !prev)
      }
      if (iFollow) {
        setFollowers(f => f - 1)
      } else {
        setFollowers(f => f + 1)
      }
    })
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const [openMore, setMore] = React.useState(false);

  const handleClickMenu = () => {
    setMore(true);
  };
  const handleCloseMenu = () => {
    setMore(false);
  };

  const handShake = () => {
    if (!user) return
    api.post(`${url}/chat/handshake`, {
      "people": [user._id]
    }).then((res) => {
      navigate(`/chats/${res.data.roomId}`)
    }).catch(err => console.log(err))
  }

  return (
    <div className='home' style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
      {/* Modern Profile Header with Cover */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '280px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
        overflow: 'hidden'
      }}>
        {/* Decorative Background Pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        }}></div>
        
        {/* Blocked User Notification */}
        {user?.status === 'blocked' && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(239, 68, 68, 0.95)',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(220, 38, 38, 0.5)',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: '14px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
            zIndex: 10
          }}>
            ⚠️ Your account has been blocked by the admin
          </div>
        )}

        {/* Profile Avatar - Positioned at bottom */}
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5
        }}>
          <div style={{
            position: 'relative',
            padding: '4px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
            borderRadius: '50%',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <Story profile={true} avatar={user?.avatar} uid={user?._id} />
          </div>
        </div>
      </div>

      {/* Profile Info Section */}
      <div style={{
        marginTop: '80px',
        padding: '0 40px 40px',
        textAlign: 'center'
      }}>
        {/* Username and Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: '-0.02em'
          }}>
            {user?.username}
          </h1>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {user?._id !== context.auth._id && (
              <button
                onClick={() => handShake()}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'rgba(226, 232, 240, 0.95)',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
              >
                Message
              </button>
            )}

            {user?._id === context.auth._id ? (
              <button
                onClick={() => navigate('/accounts/edit')}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'rgba(226, 232, 240, 0.95)',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
              >
                Edit Profile
              </button>
            ) : iFollow ? (
              <button
                onClick={() => handleFollow()}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: 'rgba(226, 232, 240, 0.95)',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
              >
                Unfollow
              </button>
            ) : (
              <button
                onClick={() => handleFollow()}
                style={{
                  padding: '10px 24px',
                  fontSize: '14px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4)';
                }}
              >
                Follow
              </button>
            )}

            {user?._id === context.auth._id && (
              <button
                onClick={() => handleClickMenu()}
                className='no-style'
                style={{
                  padding: '10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.6) 100%)',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg aria-label="Options" color="rgba(226, 232, 240, 0.95)" fill="rgba(226, 232, 240, 0.95)" height="20" role="img" viewBox="0 0 24 24" width="20">
                  <circle cx="12" cy="12" fill="none" r="8.635" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
                  <path d="M14.232 3.656a1.269 1.269 0 0 1-.796-.66L12.93 2h-1.86l-.505.996a1.269 1.269 0 0 1-.796.66m-.001 16.688a1.269 1.269 0 0 1 .796.66l.505.996h1.862l.505-.996a1.269 1.269 0 0 1 .796-.66M3.656 9.768a1.269 1.269 0 0 1-.66.796L2 11.07v1.862l.996.505a1.269 1.269 0 0 1 .66.796m16.688-.001a1.269 1.269 0 0 1 .66-.796L22 12.93v-1.86l-.996-.505a1.269 1.269 0 0 1-.66-.796M7.678 4.522a1.269 1.269 0 0 1-1.03.096l-1.06-.348L4.27 5.587l.348 1.062a1.269 1.269 0 0 1-.096 1.03m11.8 11.799a1.269 1.269 0 0 1 1.03-.096l1.06.348 1.318-1.317-.348-1.062a1.269 1.269 0 0 1 .096-1.03m-14.956.001a1.269 1.269 0 0 1 .096 1.03l-.348 1.06 1.317 1.318 1.062-.348a1.269 1.269 0 0 1 1.03.096m11.799-11.8a1.269 1.269 0 0 1-.096-1.03l.348-1.06-1.317-1.318-1.062.348a1.269 1.269 0 0 1-1.03-.096" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
            )}
          </div>

          {/* Settings Dialog */}
          <Dialog
            PaperProps={{
              sx: {
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                minWidth: '380px',
                overflow: 'hidden'
              }
            }}
            onClose={handleCloseMenu}
            open={openMore}
          >
            <div>
              <div
                onClick={() => navigate('/accounts/reset')}
                style={{
                  padding: '16px 24px',
                  fontSize: '15px',
                  color: 'rgba(226, 232, 240, 0.95)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                  transition: 'all 0.2s ease',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Change password
              </div>
              <div
                onClick={() => context.logout()}
                style={{
                  padding: '16px 24px',
                  fontSize: '15px',
                  color: '#ef4444',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
                  transition: 'all 0.2s ease',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Logout
              </div>
              <div
                onClick={() => handleCloseMenu()}
                style={{
                  padding: '16px 24px',
                  fontSize: '15px',
                  color: 'rgba(148, 163, 184, 0.9)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(148, 163, 184, 0.05)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Cancel
              </div>
            </div>
          </Dialog>

          <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
              style: {
                borderRadius: '20px',
                minWidth: '400px',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                color: 'rgba(226, 232, 240, 0.95)'
              }
            }}
          >
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
              <p style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginTop: '-5px', marginBottom: '-3px' }}>{toggle === 2 ? "Followings" : "Followers"}</p>
            </DialogTitle>
            {
              <DialogContent style={{ marginTop: '-9px', minHeight: '5px' }} dividers>
                <Followers handleClose={handleClose} toggle={toggle} userId={user?._id} />
              </DialogContent>
            }
          </Dialog>
          <div className="bioandstuff" style={{ marginTop: '20px' }}>
            <p style={{ fontWeight: 'bold' }}>{user?.name}</p>
            <p style={{ marginTop: '4px', marginBottom: '3px' }}>{user?.bio ? user.bio : "-"}</p>
            {
              user?.website &&
              <a href={user?.website} target="_blank" style={{ marginTop: '10px', color: '#0e4378', fontWeight: 'normal' }} rel="noreferrer">{user?.website.replace('https://', '')}</a>
            }
          </div>
        </div>
      </div>
      <div className="highlights" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '88%', margin: 'auto', marginTop: '42px', }}>
        <div className="highlight-story" style={{ display: 'flex', flexDirection: 'column', marginRight: '35px' }}>
          <div className="imageuser storybox" style={{ width: '85px', height: '85px', borderRadius: '50%', border: '3px solid rgba(148, 163, 184, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', }}>
            <img src="https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
          </div>
          <p style={{ textAlign: 'center', marginTop: '4px', fontSize: '14px', fontWeight: 'bold', color: 'rgba(148, 163, 184, 0.9)' }}>Highlights</p>
        </div>
        <div className="highlight-story" style={{ display: 'flex', flexDirection: 'column', marginRight: '35px' }}>
          <div className="imageuser storybox" style={{ width: '85px', height: '85px', borderRadius: '50%', border: '3px solid rgba(148, 163, 184, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', }}>
            <img src="https://images.unsplash.com/photo-1666202566722-26e17e78cb07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80" style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
          </div>
          <p style={{ textAlign: 'center', marginTop: '4px', fontSize: '14px', fontWeight: 'bold', color: 'rgba(148, 163, 184, 0.9)' }}>Highlights</p>
        </div>
        <div className="highlight-story" style={{ display: 'flex', flexDirection: 'column', marginRight: '35px' }}>
          <div className="imageuser storybox" style={{ width: '85px', height: '85px', borderRadius: '50%', border: '3px solid rgba(148, 163, 184, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', }}>
            <img src="https://images.unsplash.com/photo-1666207482115-53756be8a995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80" style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
          </div>
          <p style={{ textAlign: 'center', marginTop: '4px', fontSize: '14px', fontWeight: 'bold', color: 'rgba(148, 163, 184, 0.9)' }}>Highlights</p>
        </div>
        <div className="highlight-story" style={{ display: 'flex', flexDirection: 'column', marginRight: '35px' }}>
          <div className="imageuser storybox" style={{ width: '85px', height: '85px', borderRadius: '50%', border: '3px solid rgba(148, 163, 184, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', }}>
            <img src="https://images.unsplash.com/photo-1666202566722-26e17e78cb07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80" style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
          </div>
          <p style={{ textAlign: 'center', marginTop: '4px', fontSize: '14px', fontWeight: 'bold', color: 'rgba(148, 163, 184, 0.9)' }}>Highlights</p>
        </div>
        <div className="highlight-story" style={{ display: 'flex', flexDirection: 'column', marginRight: '35px' }}>
          <div className="imageuser storybox" style={{ width: '82px', height: '82px', borderRadius: '50%', border: '1px solid rgba(148, 163, 184, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', }}>
            <svg aria-label="Plus icon" className="_ab6-" color="rgba(148, 163, 184, 0.9)" fill="rgba(148, 163, 184, 0.9)" height="44" role="img" viewBox="0 0 24 24" width="44"><path d="M21 11.3h-8.2V3c0-.4-.3-.8-.8-.8s-.8.4-.8.8v8.2H3c-.4 0-.8.3-.8.8s.3.8.8.8h8.2V21c0 .4.3.8.8.8s.8-.3.8-.8v-8.2H21c.4 0 .8-.3.8-.8s-.4-.7-.8-.7z"></path></svg>
          </div>
          <p style={{ textAlign: 'center', marginTop: '4px', fontSize: '14px', fontWeight: 'bold', color: 'rgba(148, 163, 184, 0.9)' }}>New</p>
        </div>

      </div>
      <div className="post-section" style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)', marginTop: '54px' }}>
        <div className="tab-select" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
          <Link to={`/${user?.username}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: '18px 18px', borderTop: post ? '1px solid rgba(226, 232, 240, 0.95)' : '', paddingTop: '22px', marginTop: '-0.5px', width: '79px', paddingRight: '4px' }}>
            <svg aria-label="" className="_ab6-" color="rgba(226, 232, 240, 0.95)" fill="rgba(226, 232, 240, 0.95)" height="12" role="img" viewBox="0 0 24 24" width="12"><rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line></svg>
            <p style={{ fontSize: '12.4px', color: post ? 'rgba(226, 232, 240, 0.95)' : 'rgba(148, 163, 184, 0.9)', marginLeft: '4px', fontWeight: post ? 'bold' : 'normal' }}>POSTS</p>
          </Link>
          {
            user?._id === context.auth._id &&
            <Link to={`/saved/${user?.username}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: '18px 18px', borderTop: !post ? '1px solid rgba(226, 232, 240, 0.95)' : '', paddingTop: '22px', marginTop: '-0.5px', width: '79px', paddingRight: '4px' }}>
              <svg aria-label="" className="_ab6-" color="rgba(226, 232, 240, 0.95)" fill="rgba(226, 232, 240, 0.95)" height="12" role="img" viewBox="0 0 24 24" width="12"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
              <p style={{ fontSize: '12.4px', color: !post ? 'rgba(226, 232, 240, 0.95)' : 'rgba(148, 163, 184, 0.9)', marginLeft: '4px', fontWeight: !post ? 'bold' : 'normal' }}>SAVED</p>
            </Link>
          }

        </div>
        <div className="post-content">
          {
            posts.length === 0 && loading && <Spinner />
          }

          {
            posts.length === 0 && !loading && <p style={{ textAlign: 'center', marginTop: '72px', width: '100%', fontWeight: 'bold', fontSize: '16px' }}>No posts to see</p>
          }

          {
            post ?
              <div className='grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', rowGap: '17px' }}>
                {
                  posts?.map(item =>
                    <Image userId={item.owner} postId={item._id} likes={item.likes.length} comments={item.comments.length} key={item._id} src={item.files[0].link}></Image>
                  )
                }

              </div> : <div className='grid' style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', rowGap: '17px' }}>
                {
                  posts?.map(item =>
                    <Image userId={item.owner} postId={item._id} likes={item.likes.length} comments={item.comments.length} key={item._id} src={item.files[0].link}></Image>
                  )
                }
              </div>
          }
        </div>
      </div>
    </div>
  )
}
