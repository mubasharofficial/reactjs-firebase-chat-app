import React, { useRef, useEffect } from "react";
import Moment from "react-moment";

const GroupMessage = ({ msg, user1 }) => {
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);
  return (

              <>
              <li className={`flex ${msg.from === user1 ? "justify-end" : "justify-start"}  items-center space-x-4`} ref={scrollRef} >
              <img src="https://i.pinimg.com/474x/98/51/1e/98511ee98a1930b8938e42caf0904d2d.jpg" alt="" className="w-12 h-12 rounded-full border-2 shadow-lg" />
              <div className="relative max-w-xl px-4 py-2 text-gray-700 font-semibold bg-white rounded shadow">
                  <span className="block">
                  {msg.text}
                  {msg.media ? <img src={msg.media} alt={msg.text} /> : null}
                  </span>
                      <small>
                        <Moment fromNow>{msg.createdAt.toDate()}</Moment>
                      </small>
              </div>
          </li>

          </>

    // <div
    //   className={`message_wrapper ${msg.senderId === user1 ? "own" : ""}`}
    //   ref={scrollRef}
    // >
    //   <p className={msg.senderId === user1 ? "me" : "friend"}>
    //   <strong>{msg.senderId != user1 ? msg.senderName:null}</strong><br/>
    //     {msg.media ? <img src={msg.media} alt={msg.text} /> : null}
    //     {msg.text}
    //     <br />
    //     <small>
    //       <Moment fromNow>{msg.createdAt.toDate()}</Moment>
    //     </small>
    //   </p>
    // </div>
  );
};

export default GroupMessage;
