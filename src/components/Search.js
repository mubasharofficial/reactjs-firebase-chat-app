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
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          className="form-control text-center"
          placeholder="Find a user"
          onKeyDown={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
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
    </div>
  );
};

export default Search;
