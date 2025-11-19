// Example: Updated Home Component with Infinite Scroll
// Copy this pattern to your Home.jsx file

import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { getHomePosts } from '../Interceptor/apiCall';

function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load initial posts when component mounts
  useEffect(() => {
    loadPosts(1);
  }, []);

  // Function to load posts
  const loadPosts = async (pageNum) => {
    if (loading) return; // Prevent duplicate requests
    
    try {
      setLoading(true);
      console.log(`Loading page ${pageNum}...`);
      
      // Make API call with pagination
      const response = await getHomePosts(pageNum, 10);
      
      // Handle response (supports both old and new format)
      const newPosts = response.data.posts || response.data;
      const pagination = response.data.pagination;
      
      // Update posts state
      if (pageNum === 1) {
        // First page - replace all posts
        setPosts(newPosts);
      } else {
        // Additional pages - append to existing posts
        setPosts(prevPosts => [...prevPosts, ...newPosts]);
      }
      
      // Update pagination state
      if (pagination) {
        setHasMore(pagination.hasMore);
        setPage(pagination.currentPage);
        console.log(`Loaded page ${pagination.currentPage} of ${pagination.totalPages}`);
      } else {
        // Old format without pagination
        setHasMore(newPosts.length > 0);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Function to load more posts (called by InfiniteScroll)
  const loadMorePosts = () => {
    if (!loading && hasMore) {
      loadPosts(page + 1);
    }
  };

  return (
    <div className="home-page">
      <InfiniteScroll
        dataLength={posts.length}
        next={loadMorePosts}
        hasMore={hasMore}
        loader={
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading more posts...</p>
          </div>
        }
        endMessage={
          <div className="end-message">
            <p>🎉 You've seen all posts!</p>
          </div>
        }
      >
        {posts.map((post, index) => (
          <div key={post._id || index} className="post-card">
            {/* Your existing post card component */}
            <div className="post-header">
              <img src={post.owner?.avatar} alt="avatar" />
              <span>{post.owner?.username}</span>
            </div>
            <div className="post-image">
              <img src={post.image} alt="post" />
            </div>
            <div className="post-actions">
              {/* Like, comment, share buttons */}
            </div>
            <div className="post-caption">
              {post.caption}
            </div>
          </div>
        ))}
      </InfiniteScroll>
      
      {/* Show loading state for initial load */}
      {loading && posts.length === 0 && (
        <div className="initial-loading">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      )}
    </div>
  );
}

export default Home;

/* 
 * CSS for loading states (add to your CSS file)
 */
/*
.loading-container {
  text-align: center;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.end-message {
  text-align: center;
  padding: 30px;
  color: #888;
  font-size: 16px;
}

.initial-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}
*/
