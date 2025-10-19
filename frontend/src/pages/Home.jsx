import React, { useContext, useEffect } from "react";
import Card from "../components/home/post/Card";
import "../components/home/home.css";
import Right from "../components/home/rightbar/Right";
import { api } from "../Interceptor/apiCall";
import { url } from "../baseUrl";
import { useState } from "react";
import { Spinner } from "../assets/Spinner";
import { AuthContext } from "../context/Auth";
import StoryContainer from "../components/home/stories/StoryContainer";

export default function Home({ stories }) {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const context = useContext(AuthContext);
  useEffect(() => {
    api
      .get(`${url}/post/get/home`)
      .then((res) => {
        // Ensure the response is an array
        setPosts(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log(err);
        // Set to empty array on error to prevent map error
        setPosts([]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      setPosts([]);
    };
  }, []);

  useEffect(() => {
    context.handleActive("home");
  }, [context]);

  function filterPosts(id) {
    setPosts((posts) => posts.filter((item) => item._id !== id));
  }
  function filterUserPosts(uid) {
    setPosts((posts) => posts.filter((item) => item.owner !== uid));
  }
  function newPost(post) {
    setPosts((posta) => [post, ...posts]);
  }
  context.newpost = newPost;

  return (
    <div className="home min-h-screen">
      <div className="left-home">
        {/* Welcome Header */}
        <div style={{
          marginBottom: '28px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.7) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), rgba(139, 92, 246, 0.6), transparent)'
          }}></div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(139, 92, 246) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            letterSpacing: '-0.02em'
          }}>
            Welcome back, {context.auth?.username}!
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(148, 163, 184, 0.9)',
            fontWeight: '400'
          }}>
            Catch up with what your friends are sharing
          </p>
        </div>

        <div className="stories">
          <StoryContainer stories={stories} />
        </div>
        <div className="posts space-y-4">
          {posts?.length === 0 && loading && <Spinner />}

          {posts?.length === 0 && !loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 32px',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.7) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
              gap: '16px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.2)'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <p style={{
                fontSize: '20px',
                textAlign: 'center',
                color: 'rgba(226, 232, 240, 0.95)',
                fontWeight: '700',
                marginBottom: '4px'
              }}>
                No posts yet
              </p>
              <p style={{
                fontSize: '14px',
                textAlign: 'center',
                color: 'rgba(148, 163, 184, 0.9)',
                maxWidth: '320px',
                lineHeight: '1.6'
              }}>
                Follow more people to see their posts in your feed
              </p>
            </div>
          )}
          {Array.isArray(posts) &&
            posts.map((item) => (
              <Card
                filterUserPosts={filterUserPosts}
                filterPosts={filterPosts}
                key={item._id}
                id={item._id}
                img={item.files[0].link}
                likes={item.likes}
                saved={item.saved}
                userId={item.owner}
                avatar="https://1.gravatar.com/avatar/767fc9c115a1b989744c755db47feb60?s=200&r=pg&d=mp"
                username="karen__."
                caption={item.caption}
                comments={item.comments}
                time={item.createdAt}
              />
            ))}
        </div>
      </div>
      <div className="right-home">
        <Right />
      </div>
    </div>
  );
}
