import React, { useEffect, useState } from "react";
import Img from "../assets/group.png";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase";

const GroupList = ({ user1,group, selectgroup,groupName }) => {
  return (
    <>


<a onClick={() => selectgroup(group)} className="flex items-center px-4 py-3 text-lg text-gray-300 transition duration-150 ease-in-out cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-violet-500 focus:text-white active:bg-violet-600">
        <div className="relative mr-2">
          <img src={Img} alt="" width="64" height="64" className="rounded-full border-2" />
          <span className= "bg-green-400 avatar-status-online avatar-status-xl absolute bg-green-400 w-3 h-3 rounded-full bottom-0 right-0 border-2 border-white" ></span>
        </div>
        <div className="w-full pb-2">
          <div className="flex justify-between">
          {/* {data?.from != user1 && data?.unread?playBell(iphoneNotificationBell):null} */}
            <span className="block ml-2 font-semibold text-gray-500 focus:text-white">{groupName}</span>
            <span className="block ml-2 text-sm text-gray-300 focus:text-white">11:38 AM</span>
          </div>
          <span className="block ml-2 text-lg text-gray-300 focus:text-white">
            {/* <strong>{data.from === user1 ? "Me:" : null}</strong>&nbsp; */}
            {groupName}
            {/* {data?.from !== user1 && data?.unread && 
                  (<small className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75">New</small> ) 
            } */}
          </span>
        </div>
      </a>

       
      {/* <div className={`user_wrapper`}
        onClick={()=>selectgroup(group)}  >
        <div className="user_info">
          <div className="user_detail">
            <img src={Img} alt="avatar" className="avatar" />
            <h6>{groupName}</h6>
          </div>
        </div>
      </div> */}

    </>
  );
};

export default GroupList;
