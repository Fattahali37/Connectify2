import React from 'react'
import { useState } from 'react';
import { commentIcon, likeIconOutline } from '../../assets/svgIcons'
import { Dialog } from "@mui/material";
import './image.css'
import { Post } from '../dialog/Post'

export const Image = ({ src, likes, comments, postId, userId }) => {

  const [openDailog, setOpenDilaog] = React.useState(false);

  const handleClickOpen = () => {
    setOpenDilaog(true);
  };

  const handleCloseDialog = () => {
    setOpenDilaog(false);
  };

  const [show, setShow] = useState()

  return (
    <>
      <div 
        onClick={handleClickOpen} 
        className="explore-image-card" 
        onMouseOver={() => setShow(true)} 
        onMouseLeave={() => setShow(false)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: show ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: show 
            ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}
      >
        <img 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'all 0.3s ease',
            filter: show ? 'brightness(0.7)' : 'brightness(1)'
          }} 
          src={src} 
          alt="" 
        />
        {
          show && (
            <div 
              className="image-overlay" 
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.2s ease'
              }}
            >
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: '32px',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(10px)',
                padding: '16px 32px',
                borderRadius: '100px',
                border: '1px solid rgba(148, 163, 184, 0.2)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {likeIconOutline} 
                  <p style={{ 
                    marginLeft: '4px', 
                    fontWeight: '700',
                    fontSize: '16px',
                    color: 'rgba(226, 232, 240, 0.95)'
                  }}>
                    {likes}
                  </p>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {commentIcon} 
                  <p style={{ 
                    marginLeft: '4px', 
                    fontWeight: '700',
                    fontSize: '16px',
                    color: 'rgba(226, 232, 240, 0.95)'
                  }}>
                    {comments}
                  </p>
                </div>
              </div>
            </div>
          )
        }

      </div>
      <Dialog
        maxWidth="lg"
        open={openDailog}
        PaperProps={{
          sx: {
            minHeight: '95%',
            maxHeight: '95%',
            minWidth: '65vw',
            padding: 0,
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '16px'
          }
        }}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Post postId={postId} userId={userId} />
      </Dialog>
    </>

  )
}
