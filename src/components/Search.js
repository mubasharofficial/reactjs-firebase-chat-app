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

const Search = ({selectUser}) => {
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);

  const  currentUser  = auth.currentUser.uid;
  const handleSearch = async () =>
   {

    console.log('fetch user',username);
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
                
                  {err && <span>User not found!</span>}
                    {
                    user &&
                    user?.uid!=currentUser?
                      (
                      <div className="d-flex justify-content-around bg-white mt-1 mb-1 p-2 border border-primary" onClick={()=>{
                        selectUser(user);
                        setUsername("");
                        setUser(null);
                      }}>
                        <img src=
                        {user.avatar || Img}  alt="" width='60' height='60'  style={{borderRadius:"50%"}} />
                          <h6 className="mt-2">{user.name}</h6>
                      </div>
                    ):null

                    }
              </>
    );
};

export default Search;
