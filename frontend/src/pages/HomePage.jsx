import { useEffect, useState } from "react";
import axios from "../utils/axios";
import PostCard from "../components/PostCard";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/post/homeposts");
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    
<>
<Navbar/>
    <div className=" max-w-5xl mx-auto px-4 py-8 ">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-400 rounded-xl focus:outline-none "
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
    </>
  );
};

export default HomePage;
