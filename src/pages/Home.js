import React, { useEffect, useState } from "react";
import { db, auth, storage } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  getDocFromCache,
}
from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes,uploadBytesResumable } from "firebase/storage";
import { v4 as uuid } from 'uuid';
import User from "../components/User";
import GroupList from "../components/GroupList";
import GroupChat from "../components/GroupChat";
import MessageForm from "../components/MessageForm";
import Message from "../components/Message";
import GroupMessage from "../components/GroupMessage";
import groupImage from '../assets/group.png';
import Search from '../components/Search';
import FindSearchUser from '../components/FindSearchUser';

const Home = () => {
  const [CurrenUserData,setCurrenUserData] =  useState();
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [groupSelectedChat, setGroupSelectedChat] = useState();
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [chatGroups, setChatGroups] = useState([]);
  const [swtichChat,setSwitchChat] = useState(0);
  const [searchUser,setSearchUser] = useState();
  const user1 = auth.currentUser.uid;


  useEffect(() => {
    const usersRef = collection(db, "groupchat");
    // create query object
    const q = query(usersRef, where("id", "not-in", ['ba68e485-ac05-1111-b0e3-12312312312']));
    // execute query
    const unsub = onSnapshot(q, (querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      setChatGroups(users);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const usersRef = collection(db, "users");
    // create query object
    const q = query(usersRef, where("uid", "not-in", [user1]));
    // execute query
    const unsub = onSnapshot(q, (querySnapshot) => {
      let users = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      setUsers(users);
    });
    return () => unsub();
  }, []);

  const selectUser = async (user) =>
  {
  setChat(user);
    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    console.log('id created',id);
    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));
    onSnapshot(q, (querySnapshot) => 
    {
      let msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push(doc.data());
      });
      setMsgs(msgs);
    });
    setSwitchChat(1);
    // get last message b/w logged in user and selected user
    const docSnap = await getDoc(doc(db, "lastMsg", id));
    // if last message exists and message is from selected user
    if (docSnap.data() && docSnap.data().from !== user1) {
      // update last message doc, set unread to false
      await updateDoc(doc(db, "lastMsg", id), { unread: false });
    }
  };

  const selectgroup = async (group) => {

    setGroupSelectedChat(group);
    const usersRef = collection(db, "groupchat");
    // create query object
    const q = query(usersRef, where("id", "in", [group.id]));
    console.log(group.id);
    // execute query
    const unsub =  onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setGroupSelectedChat(doc.data());
      });
    });
    console.log(groupSelectedChat)
    setSwitchChat(2);
    return () => unsub();
   
    };
      
  const handleSubmit = async (e) => 
  {
     e.preventDefault();
     setSwitchChat(1);
    const user2 = chat.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let url;
    if (img) {
      const imgRef = ref(
        storage,
        `images/${new Date().getTime()} - ${img.name}`
      );
      const snap = await uploadBytes(imgRef, img);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = dlUrl;
    }
    
    await addDoc(collection(db, "messages", id, "chat"), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
    });

    await setDoc(doc(db, "lastMsg", id), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
      unread: true,
    });

    setText("");
    setImg("");
  };

  const handleSend = async (e) => 
  {
    e.preventDefault();
   
    if (img)
    {
      const storageRef = ref(storage, uuid());
      const uploadTask = uploadBytesResumable(storageRef, img);

      uploadTask.on(
        (error) => {
          //TODO:Handle Error
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "groupchat", groupSelectedChat.id), {
              messages: arrayUnion(
                {
                id: uuid(),
                senderId:user1,
                sendName:CurrenUserData.name,
                text,
                createdAt: Timestamp.fromDate(new Date()),
                media:downloadURL,
                status: true,
              }
              ),
            });
          });
        }
      );
    }
     else
    {
      await updateDoc(doc(db, "groupchat", groupSelectedChat.id), {
        messages: arrayUnion(
          {
            id: uuid(),
            senderId:user1,
            sendName:'static user',
            text,
            createdAt: Timestamp.fromDate(new Date()),
            media:"",
            status: true,
          }
        ),
      });
    }
    const docRef = doc(db, "groupchat", groupSelectedChat.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setGroupSelectedChat(docSnap.data())
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }

    setText("");
    setImg("");
  };
  
  const getUserInfo= async()=>{
    const docRef = doc(db, "users", user1);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          //console.log("Document data:", docSnap.data());
          setCurrenUserData(docSnap.data())
        } else {
          setCurrenUserData([]);
          // doc.data() will be undefined in this case
          //console.log("No such document!");
        }
  }

function userExists(username,groupMemberarray) {
 
  return groupMemberarray.some(function(el) {
    return el.value === username;
  }); 
}

const setFindUser=(finduser)=>{
  setSearchUser(finduser);
}

  return (
    
    
    <section className="">
        {/* Chat Section  */}

         {/* started main  chat coainter that contain all ting */}
        <div className="content-area-wrapper  pt-0   mx-auto p-0 h-[100vh] grid lg:grid-cols-12 gap-0 divide-x relative overflow-hidden border">
            {/* left side chat  person  */}
            <div className="left-side-bar hidden lg:block absolute lg:relative top-0 lg:top-none left-0 lg:left-none z-50 transition ease-in-out duration-500  max-w-sm lg:col-span-3">
                <div className="relative">
                   {/* Top Profile and Search Sidebar */}
                   <div className="relative container flex flex-col lg:flex-row space-x-2 justify-start items-center px-4 py-4 border-b">
                        {/* Mark X */}
                        <div className="block lg:hidden absolute top-3 right-2">
                            <ion-icon name="close" onclick="LeftBar(this)" className="w-5 h-5 text-gray-500 hover:text-gray-400"></ion-icon>
                        </div>
                        {/* TOp Right Profile */}
                        <div className="relative flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80" alt="" className="w-12 xl:14 h-12 xl:14  rounded-full border-2" />
                            <span className="avatar-status-online avatar-status-xl absolute bg-green-400 w-3 h-3 rounded-full bottom-0 right-0 border-2 border-white"></span>
                        </div>
                        {/* Search Bar */}
                        
                        <Search selectUser={selectUser} chat={chat}  user1={user1} setFindUser={setFindUser} />

                   </div>

                   {/* Chats and Contacts */}
                   <div className="flex flex-col overflow-y-auto max-h-[90vh]">
                        {/* Chats */}

                        <div className="container">
                            <ul className="overflow-auto h-auto">
                                <h2 className="my-2 mb-2 ml-4 text-2xl text-violet-400 font-semibold">Chats</h2>
                                <FindSearchUser selectUser={selectUser}  searchUser={searchUser}/>
                                <li>
                                     {users.map((user) => (
                                              <User
                                                key={user.uid}
                                                user={user}
                                                selectUser={selectUser}
                                                user1={user1}
                                                chat={chat}
                                              />
                                            ))}

                                </li>
                            </ul>
                        </div>

                   </div>
                </div>
            </div>
            {/* end left side chat person  */}
        
            {/* center chat section body started */}
            <div className="relative content-right lg:col-span-6" >
                {/* Top Bar */}
               
                {/* Chat Box Message */}

               {  
                  swtichChat===1? (
                          <>
                           <div className="flex pb-2 px-2 md:px-4 py-5 items-center justify-between border-b border-gray-200 bg-white">
                                  {/* Middle Top Profile Navbar */}
                                  <div className="flex items-center space-x-4">
                                      {/* Mobile Left Side Bar Hamburger */}
                                      <div className="block lg:hidden pt-2">
                                          <ion-icon name="menu" onclick="LeftBar(this)" className="w-5 h-5 text-gray-500 hover:text-gray-400"></ion-icon>
                                      </div>
                                      <div className="relative flex-shrink-0">
                                          <img src={chat.avatorPath||'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80' } alt="" className="w-12 h-12 rounded-full border-2" />
                                          <span className="avatar-status-online avatar-status-xl absolute bg-green-400 w-3 h-3 rounded-full bottom-0 right-0 border-2 border-white"></span>
                                      </div>
                                      <div className="flex flex-col leading-tight">
                                          <div className="text-xl mt-1 flex items-center">
                                              <span className="text-gray-700 font-medium mr-2">{chat.name} </span>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex justify-center items-center space-x-1 md:space-x-2">
                                      <button className=" inline-flex items-center justify-start rounded-full h-10 w-10 transition duration-500 ease-in-out">
                                          <svg className="w-6 h-6 text-gray-500 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                      </button>
                                      <button className=" inline-flex items-center justify-start rounded-full h-10 w-10 transition duration-500 ease-in-out">
                                          <svg className="w-6 h-6 text-gray-500 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                      </button>
                                      <button className="hidden md:block inline-flex items-center justify-start rounded-full h-10 w-10 transition duration-500 ease-in-out">
                                          <svg className="w-6 h-6 text-gray-500 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                      </button>
                                      <button className="inline-flex items-center justify-start rounded-full h-10 w-10 transition duration-500 ease-in-out">
                                          <svg className="w-6 h-6 text-gray-500 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                      </button>
                                      {/* Mobile Left Side Bar Hamburger */}
                                      <div className="block lg:hidden pt-2">
                                          <ion-icon name="menu" onclick="RightBar(this)" className="w-5 h-5 text-gray-500 hover:text-gray-400"></ion-icon>
                                      </div>
                                  </div>
                              </div>
                                      <div className="relative w-full p-6 overflow-y-auto h-[90vh] bg-opacity-25 bg-gradient-to-r from-violet-300 to-violet-100 bg-fixed">
                                        <ul className="space-y-2">

                                                       {msgs.length
                                                         ? msgs.map((msg, i) => (
                                                             <Message key={i} msg={msg} user1={user1} />
                                                           ))
                                                        : null}
                                        </ul>
                                      </div>
                                        <MessageForm
                                              handleSubmit={handleSubmit}
                                              text={text}
                                              setText={setText}
                                              setImg={setImg}
                                                          />
                          </>
                  )
                  :swtichChat===2? (
                                  <>
                                          <div className="flex pb-2 px-2 md:px-4 py-5 items-center justify-between border-b border-gray-200 bg-white">
                                          {/* Middle Top Profile Navbar */}
                                          <div className="flex items-center space-x-4">
                                              {/* Mobile Left Side Bar Hamburger */}
                                              <div className="block lg:hidden pt-2">
                                                  <ion-icon name="menu" onclick="LeftBar(this)" className="w-5 h-5 text-gray-500 hover:text-gray-400"></ion-icon>
                                              </div>
                                              <div className="relative flex-shrink-0">
                                                <img src={groupSelectedChat.media||'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bWFsZSUyMHByb2ZpbGV8ZW58MHx8MHx8&w=1000&q=80' } alt="" className="w-12 h-12 rounded-full border-2" />
                                                  <span className="avatar-status-online avatar-status-xl absolute bg-green-400 w-3 h-3 rounded-full bottom-0 right-0 border-2 border-white"></span>
                                              </div>
                                              <div className="flex flex-col leading-tight">
                                                  <div className="text-xl mt-1 flex items-center">
                                                      <span className="text-gray-700 font-medium mr-2">{groupSelectedChat.groupName} </span>
                                                  </div>
                                              </div>
                                          </div>

                                          <div className="flex justify-center items-center space-x-1 md:space-x-2">
                                              <button className=" inline-flex items-center justify-start rounded-full h-10 w-10 transition duration-500 ease-in-out">
                                                  <svg className="w-6 h-6 text-gray-500 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                              </button>
                                              <button className=" inline-flex items-center justify-start rounded-full h-10 w-10 transition duration-500 ease-in-out">
                                                  <svg className="w-6 h-6 text-gray-500 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                              </button>
                                              <button className="hidden md:block inline-flex items-center justify-start rounded-full h-10 w-10 transition duration-500 ease-in-out">
                                                  <svg className="w-6 h-6 text-gray-500 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                              </button>
                                              <button className="inline-flex items-center justify-start rounded-full h-10 w-10 transition duration-500 ease-in-out">
                                                  <svg className="w-6 h-6 text-gray-500 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                              </button>
                                              {/* Mobile Left Side Bar Hamburger */}
                                              <div className="block lg:hidden pt-2">
                                                  <ion-icon name="menu" onclick="RightBar(this)" className="w-5 h-5 text-gray-500 hover:text-gray-400"></ion-icon>
                                              </div>
                                          </div>
                                      </div>
                                            <div className="relative w-full p-6 overflow-y-auto h-[90vh] bg-opacity-25 bg-gradient-to-r from-violet-300 to-violet-100 bg-fixed">
                                                <ul className="space-y-2">
                                                              
                                                         {groupSelectedChat
                                                           ? groupSelectedChat.messages.map((msg, i) => (                        
                                                               <GroupMessage key={i} msg={msg} user1={user1} />
                                                             ))
                                                           : null}
                                                
                                                </ul>
                                            </div>
                                                         <MessageForm
                                                           handleSubmit={handleSend}
                                                           text={text}
                                                           setText={setText}
                                                           setImg={setImg}
                                                         />

                                  </>
                  )
                  :(
                    <div className="flex pb-2 px-2 md:px-4 py-5 items-center justify-between border-b border-gray-200 bg-white">
                    {/* Middle Top Profile Navbar */}
                          <div className="flex items-center space-x-4">
                              {/* Mobile Left Side Bar Hamburger */}
                              <div className="block lg:hidden pt-2">
                                  <ion-icon name="menu" onclick="LeftBar(this)" className="w-5 h-5 text-gray-500 hover:text-gray-400"></ion-icon>
                              </div>
                              
                              <div className="flex flex-col leading-tight">
                                  <div className="text-xl mt-1 flex items-center">
                                      <span className="text-gray-700 font-medium mr-2">{chat.name} </span>
                                  </div>
                              </div>
                          </div>
                    </div>
                  )

               }

                {/* bottom bar for typing */}


            </div>
            {/* center chat section body started */}

            
            
            {/* chat group section  */}
            <div className="right-side-bar hidden absolute top-0 right-0 z-50 transition ease-in-out duration-500 lg:relative lg:block max-w-sm lg:col-span-3">
                <div className="relative">
                   {/* Top Profile and Search Sidebar */}
                   {/* <div className="relative fixed container flex space-x-2 justify-start items-center px-4 py-4 border-b">
                        Mark X
                        <div className="absolute top-3 right-2 block lg:hidden">
                            <ion-icon name="close" onclick="RightBar(this)" className="w-5 h-5 text-gray-500 hover:text-gray-400"></ion-icon>
                        </div>
                        Search Bar
                        <div className="flex-1">
                            <div className="relative text-gray-600 border-2 rounded-full px-4 md:max-w-md">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                                    <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" className="w-5 h-5 text-gray-300">
                                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </span>
                                <input type="search" className="block w-full py-2 pl-8 rounded bg-transparent outline-none text-gray-300 font-normal text-md
                                " name="search" placeholder="Search Group" required />
                            </div>
                        </div>
                        <div> 
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path></svg>
                        </div>
                   </div> */}
                   
                   <GroupChat />
                   {/* Groups */}
                   <div className="flex flex-col overflow-y-auto max-h-[90vh]">
                        {/* Groups */}
                        <div className="container">
                            <ul className="overflow-auto h-auto">
                                <h2 className="my-2 mb-2 ml-4 text-2xl text-violet-400 font-semibold">Groups</h2>
                                <li>

                                {     Object.entries(chatGroups)?.sort((a, b) => b[1].date - a[1].date).map((group) => (
                                       userExists(user1,group[1].groupMemeber)===true?
                                       <GroupList key={group.id}  
                                       group={group[1]} 
                                       groupName={group[1].groupName} 
                                       selectgroup={selectgroup}
                                       />:null
                                    ))

                                }

                                
                                </li>
                            </ul>
                        </div>
                   </div>
                </div>
            </div>
            {/* chat group section  */}

        </div>
        {/* ended main  chat coainter that contain all ting */}

    </section>







    
    
    
    
    
    // <div className="home_container">
    //   <div className="users_container">
    //     <GroupChat />
    //     <Search selectUser={selectUser} chat={chat}  user1={user1}/>
    //     {users.map((user) => (
    //       <User
    //         key={user.uid}
    //         user={user}
    //         selectUser={selectUser}
    //         user1={user1}
    //         chat={chat}
    //       />
    //     ))}
    //     <div className="chat-group d-flex justify-content-around">
    //          <p>GROUP</p>
    //          <img src={groupImage} width="50" height="50" />
    //     </div>
    //     {

    //     Object.entries(chatGroups)?.sort((a, b) => b[1].date - a[1].date).map((group) => (
    //       userExists(user1,group[1].groupMemeber)===true?
    //       <GroupList key={group.id}  
    //       group={group[1]} 
    //       groupName={group[1].groupName} 
    //       selectgroup={selectgroup}
    //       />:null
    //     ))

    //     }

    //   </div>
    //   <div className="messages_container">

    //     {  
    //     swtichChat===1? (
    //           <>
    //             <div className="messages_user">
    //               <h3>{chat.name}</h3>
    //             </div>
    //             <div className="messages">
    //               {msgs.length
    //                 ? msgs.map((msg, i) => (
    //                     <Message key={i} msg={msg} user1={user1} />
    //                   ))
    //                 : null}
    //             </div>

    //             <MessageForm
    //               handleSubmit={handleSubmit}
    //               text={text}
    //               setText={setText}
    //               setImg={setImg}
    //             />
    //         </>
    //     ) 
    //     :swtichChat===2? (
    //       <>
    //         <div className="messages_user">
    //           <h3>{groupSelectedChat.groupName}</h3>
    //         </div>
    //         <div className="messages">
    //           {groupSelectedChat
    //             ? groupSelectedChat.messages.map((msg, i) => (                        
    //                 <GroupMessage key={i} msg={msg} user1={user1} />
    //               ))
    //             : null}
    //         </div>
    //         <MessageForm
    //           handleSubmit={handleSend}
    //           text={text}
    //           setText={setText}
    //           setImg={setImg}
    //         />
    //       </>
    //     ) : (
    //       <h3 className="no_conv">Select a user to start conversation</h3>
    //     )
    //     }   
         
    //   </div>
   
    // </div>
  );
};

export default Home;
