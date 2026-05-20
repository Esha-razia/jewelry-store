import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import { Link } from 'react-router-dom';

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data } = await axios.get('/api/blog');
        setPosts(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading blog posts', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading blog...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Error: {error}</div>;

  return (
    <div className="blog-list fade-in" style={{ marginTop: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Our Blog</h1>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {posts.map((post) => (
          <Link key={post._id} to={`/blog/${post.slug || post._id}`}> 
            <BlogCard post={post} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
