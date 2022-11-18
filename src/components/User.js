import React, { useEffect, useState } from "react";
import Img from "../image1.jpg";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase";
import iphoneNotificationBell from '../assets/noteficationsbells/iphone_sms_bell.mp3';

const User = ({ user1, user, selectUser, chat }) => {
  const user2 = user?.uid;
  const [data, setData] = useState("");

  useEffect(() => {
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let unsub = onSnapshot(doc(db, "lastMsg", id), (doc) => {
      setData(doc.data());
    });

    return () => unsub();
  }, []);
  const playBell = (url) => {
    const audio = new Audio(url);
    audio.play();
  }

  if (data?.from == user1 || data?.to==user1) {
    return (<>
      <a onClick={() => selectUser(user)} className="flex items-center px-4 py-3 text-lg text-gray-300 transition duration-150 ease-in-out cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-violet-500 focus:text-white active:bg-violet-600">
        <div className="relative mr-2">
          <img src={user.avatar || Img} alt="" width="64" height="64" className="rounded-full border-2"/>
          <span className= {`${user.isOnline ? "bg-green-400" : "bg-red-500"} avatar-status-online avatar-status-xl absolute bg-green-400 w-3 h-3 rounded-full bottom-0 right-0 border-2 border-white`}></span>
        </div>
        <div className="w-full pb-2">
          <div className="flex justify-between">
          {data?.from != user1 && data?.unread?playBell(iphoneNotificationBell):null}
            <span className="block ml-2 font-semibold text-gray-500 focus:text-white">{user.name}</span>
            <span className="block ml-2 text-sm text-gray-300 focus:text-white">11:38 AM</span>
          </div>
          {data?.from !== user1 && data?.unread && 
                  (
                  <div className="-mt-8 -ml-8">
                      <small className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-100">
                      <small>New</small>
                      </small>
                  </div> 
                  )
            }
          <span className="block ml-2 text-lg text-gray-300 focus:text-white">
            <strong>{data.from === user1 ? "Me:" : null}</strong>&nbsp;
          </span>
        </div>
      </a>

    

      {/* <div className={`user_wrapper ${chat.name === user.name && "selected_user"}`}
        onClick={() => selectUser(user)}  >
        <div className="user_info">
          <div className="user_detail">
            <img src={user.avatar || Img} alt="avatar" className="avatar" />
            <h6>{user.name}</h6>
            {data?.from != user1 && data?.unread?playBell(iphoneNotificationBell):null}
            {
            data?.from !== user1 && data?.unread && 
            (<small className="unread">New</small> )
            }
          </div>
          <div
            className={`user_status ${user.isOnline ? "online" : "offline"}`}
          ></div>
        </div>
        {data && (
          <p className="truncate">
            <strong>{data.from === user1 ? "Me:" : null}</strong>
            {data.text}
          </p>
        )}
      </div>
      
      <div
        onClick={() => selectUser(user)}
        className={`sm_container ${chat.name === user.name && "selected_user"}`}
      >
        <img
          src={user.avatar || Img}
          alt="avatar"
          className="avatar sm_screen"
        />
      </div> */}

    </>);

  }
  else {
    return (<></>);
  }
};

export default User;
