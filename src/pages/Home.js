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

const Home = () => {
  const [CurrenUserData,setCurrenUserData] =  useState();
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [groupSelectedChat, setGroupSelectedChat] = useState();
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [chatGroups, setChatGroups] = useState([]);
  const [swtichChat,setSwitchChat] = useState(1);

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

  return (
    <div className="home_container">
      <div className="users_container">
        <GroupChat />
        <Search selectUser={selectUser} chat={chat}  user1={user1}/>
        {users.map((user) => (
          <User
            key={user.uid}
            user={user}
            selectUser={selectUser}
            user1={user1}
            chat={chat}
          />
        ))}
        <div className="chat-group d-flex justify-content-around">
             <p>GROUP</p>
             <img src={groupImage} width="50" height="50" />
        </div>
        {

        Object.entries(chatGroups)?.sort((a, b) => b[1].date - a[1].date).map((group) => (
          userExists(user1,group[1].groupMemeber)===true?
          <GroupList key={group.id}  
          group={group[1]} 
          groupName={group[1].groupName} 
          selectgroup={selectgroup}
          />:null
        ))

        }

      </div>
      <div className="messages_container">

        {  
        swtichChat===1? (
              <>
                <div className="messages_user">
                  <h3>{chat.name}</h3>
                </div>
                <div className="messages">
                  {msgs.length
                    ? msgs.map((msg, i) => (
                        <Message key={i} msg={msg} user1={user1} />
                      ))
                    : null}
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
            <div className="messages_user">
              <h3>{groupSelectedChat.groupName}</h3>
            </div>
            <div className="messages">
              {groupSelectedChat
                ? groupSelectedChat.messages.map((msg, i) => (                        
                    <GroupMessage key={i} msg={msg} user1={user1} />
                  ))
                : null}
            </div>
            <MessageForm
              handleSubmit={handleSend}
              text={text}
              setText={setText}
              setImg={setImg}
            />
          </>
        ) : (
          <h3 className="no_conv">Select a user to start conversation</h3>
        )
        }

        {
        

        }     
         
      </div>
   
    </div>
  );
};

export default Home;
