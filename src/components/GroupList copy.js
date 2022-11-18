import React, { useEffect, useState } from "react";
import Img from "../assets/group.png";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase";

const GroupList = ({ user1,group, selectgroup,groupName }) => {

  const selgroup=(g)=>{
    console.log(g)
  }
  return (
    <>
       
      <div className={`user_wrapper`}
        onClick={()=>selectgroup(group)}  >
        <div className="user_info">
          <div className="user_detail">
            <img src={Img} alt="avatar" className="avatar" />
            <h6>{groupName}</h6>
          </div>

        </div>
      </div>
    </>
  );
};

export default GroupList;
