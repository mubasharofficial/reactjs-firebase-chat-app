import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import Img from "../image1.jpg";
import { db, auth } from "../firebase";

const Search = ({selectUser,setFindUser}) => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const handleSearch = async () =>
   {

    const q = query(
      collection(db, "users"),
      where("name", "==", username),
    );

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setUser(doc.data());
      });
    } catch (err) {
      setErr(true);
    }
  setFindUser(user)
  };


  const handleKey = (e) => 
  {
    e.code === "Enter" && handleSearch();
  };

  return (
                <>
                  <div className="flex-1">
                  <div className="relative text-gray-600 border-2 rounded-full px-4 md:max-w-md">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                          <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" className="w-5 h-5 text-gray-300">
                          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                          </svg>
                      </span>
                      <input type="search" className="block w-full py-2 pl-8 rounded bg-transparent outline-none text-gray-300 font-normal text-sm
                      " name="search" placeholder="Search New Chat" 
                        onKeyDown={handleKey}
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        required />
                  </div>
                </div>
                <div className="">
                  {err && <span>User not found!</span>}
                </div>    
              </>
    );
};

export default Search;
