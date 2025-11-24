import React, { useEffect, useState } from "react";
import { Image } from "../post/Image";

export const Masonary = ({ posts }) => {
  const [images, setImages] = useState([]);
  useEffect(() => {
    setImages(posts);
  }, [posts]);
  return (
    <div
      className="masonry-grid"
      style={{
        display: "grid",
        gridTemplateColumns: window.innerWidth < 768 
          ? "repeat(auto-fill, minmax(150px, 1fr))"
          : window.innerWidth < 1200
          ? "repeat(auto-fill, minmax(250px, 1fr))"
          : "repeat(auto-fill, minmax(300px, 1fr))",
        gap: window.innerWidth < 768 ? "12px" : "24px",
        padding: "4px",
      }}
    >
      {images?.map((item) => (
        <Image
          userId={item.owner}
          postId={item._id}
          likes={item.likes.length}
          comments={item.comments.length}
          key={item._id}
          src={item.files[0].link}
        ></Image>
      ))}
    </div>
  );
};
