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

const FindSearchUser = ({selectUser,searchUser}) => {
  const  currentUser  = auth.currentUser.uid;
  console.log(searchUser)

  return (
                <>
                    {
                   
                    searchUser &&
                    searchUser?.uid!=currentUser?
                      (
                        <li className="border-b-4">
                            <a onClick={() =>{ 
                                      selectUser(searchUser);
                                    }
                                      } className="flex items-center px-4 py-3 text-lg text-gray-300 transition duration-150 ease-in-out cursor-pointer hover:bg-gray-100 focus:outline-none focus:bg-violet-500 focus:text-white active:bg-violet-600">
                                      <div className="relative mr-2">
                                        <img src={searchUser.avatar || Img} alt="" width="64" height="64" className="rounded-full border-2"/>
                                        <span className= {`${searchUser.isOnline ? "bg-green-400" : "bg-red-500"} avatar-status-online avatar-status-xl absolute bg-green-400 w-3 h-3 rounded-full bottom-0 right-0 border-2 border-white`}></span>
                                      </div>
                                      <div className="w-full pb-2">
                                        <div className="flex justify-between">
                                          <span className="block ml-2 font-semibold text-gray-500 focus:text-white">{searchUser.name}</span>
                                          <span className="block ml-2 text-sm text-gray-300 focus:text-white">11:38 AM</span>
                                        </div>
                                        <span className="block ml-2 text-lg text-gray-300 focus:text-white">
                                        </span>
                                      </div>
                                    </a>
                            </li>

                    ):null

                    }  
              </>
    );
};

export default FindSearchUser;
