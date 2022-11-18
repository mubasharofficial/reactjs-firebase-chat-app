import React, { useRef, useEffect } from "react";
import Moment from "react-moment";

const GroupMessage = ({ msg, user1 }) => {
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);

  if(msg?.from === user1)
  {
    return     <>
                        <li className="flex justify-end items-center space-x-4" ref={scrollRef}>
                            <div className="relative max-w-xl px-4 py-2 text-white font-semibold bg-violet-300 rounded shadow-lg">
                                <span className="block">
                                  {msg.media ? <img src={msg.media} alt={msg.text} /> : null}
                                  {msg.text}
                                </span>
                                <small className="text-inherit">
                                    <Moment fromNow>{msg.createdAt.toDate()}</Moment>
                                </small>
                            </div>
                            <img src="https://i.pinimg.com/474x/98/51/1e/98511ee98a1930b8938e42caf0904d2d.jpg" alt="" className="w-12 h-12 rounded-full border-2" />
                        </li>
              </>
  }
  else if (msg.from !== user1) 
  {
    return     <>
                    <li className="flex justify-start items-center space-x-4" ref={scrollRef}>
                        <img src="https://i.pinimg.com/originals/19/cf/78/19cf789a8e216dc898043489c16cec00.jpg" alt="" className="w-12 h-12 rounded-full border-2 shadow-lg" />
                        <div className="relative max-w-xl px-4 py-2 text-gray-700 font-semibold bg-white rounded shadow">
                            <span className="block">
                                {msg.media ? <img src={msg.media} alt={msg.text} /> : null}
                                {msg.text}
                            </span>
                            <small className="text-inherit">
                                <Moment fromNow>{msg.createdAt.toDate()}</Moment>
                            </small>
                        </div>
                    </li>
                </> 
  } else{
    return     <>
                  <li className="flex justify-start items-center space-x-4" ref={scrollRef}>
                      <img src="https://i.pinimg.com/originals/19/cf/78/19cf789a8e216dc898043489c16cec00.jpg" alt="" className="w-12 h-12 rounded-full border-2 shadow-lg" />
                      <div className="relative max-w-xl px-4 py-2 text-gray-700 font-semibold bg-white rounded shadow">
                          <span className="block">
                            No Message For You!
                          </span>
                          <small className="text-inherit">
                             Thank You!
                          </small>
                      </div>
                  </li>
              </> 
  }

  // return (
  //   <div
  //     className={`message_wrapper ${msg.senderId === user1 ? "own" : ""}`}
  //     ref={scrollRef}
  //   >
  //     <p className={msg.senderId === user1 ? "me" : "friend"}>
  //     <strong>{msg.senderId != user1 ? msg.senderName:null}</strong><br/>
  //       {msg.media ? <img src={msg.media} alt={msg.text} /> : null}
  //       {msg.text}
  //       <br />
  //       <small>
  //         <Moment fromNow>{msg.createdAt.toDate()}</Moment>
  //       </small>
  //     </p>
  //   </div>
  // );
};

export default GroupMessage;
