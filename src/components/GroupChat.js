import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
  orderBy, startAt, endAt,onSnapshot 
} from "firebase/firestore";

import { v4 as uuidv4 } from 'uuid';
import { db, auth } from "../firebase";
import swal from 'sweetalert';
import Select from 'react-select';
const GroupChat = () => {
  const currentuser = auth.currentUser.uid;
  const [username, setUsername] = useState("");
  // const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const [errMessage,setErrMessage]=useState();
  const [selectedUsers, setSelectedUsers] = useState();
  const [searchUser,setSearchUser] = useState([]);
  const [groupname,setGroupName]= useState("");
  const [searchBoxStatus,setSearchBoxSatus] = useState(false);

   const  createNewChatDocument =()=>
  {
    const uuid= uuidv4();
    try{
     setDoc(doc(db, "groupchat", uuid), {
      id:uuid,
       groupAdmin: currentuser,
       groupName: groupname,
       groupMemeber:selectedUsers
               ,
                messages:[
                 {senderId:currentuser,
                  senderName:'Mobi',
                  text:'group create by Mobi',
                  createdAt: Timestamp.fromDate(new Date()),
                  media:"",
                }
                 ],
       createdAt: Timestamp.fromDate(new Date()),
       groupstatus: false,
     });
     
     setSelectedUsers([]);
    }
     catch(err)
     {
        setErr(true);
        setErrMessage(err);
     }
  }

  function handleSelect(e) 
  {
      setSelectedUsers(e)
  }
  const addNewGroup = ()=>{  
      swal("Enter Chat Room Name:", {
          content: "input",
        })
        .then((value) => {
         
          swal({
              title: "Are you sure to Create?",
              text: value,
              icon: "warning",
              buttons: true,
              dangerMode: false,
            })
            .then(  (willCreate)=> {
              if (willCreate) 
                {
                  
                swal("Poof! Your Group '"+value+"' Created Successfully!",{icon: "success",});
                setSearchBoxSatus(true)
                setGroupName(value)
                createNewChatDocument();
              } else {
                swal("You have Cancel  Group Creation");
              }
            });
        });
  }
  const handleFireBaseSearch = async (name) => {
    const ref = collection(db, "users");
    const q = query(ref, orderBy('name'), startAt(name), endAt(name+'\uf8ff'));
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setSearchUser([...searchUser,{value:doc.id,label:doc.data().name}])
    });
    
    } catch (err) {
      setErr(true);
    }
  };

  const handleFireBaseselectAll = async (name) => {
    const ref = collection(db, "users");
    const q = query(ref, orderBy('name'), startAt(name), endAt(name+'\uf8ff'));
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
      setSearchUser([...searchUser,{value:doc.id,label:doc.data().name}])
    });
    
    } catch (err) {
      setErr(true);
    }
  };

  const setvalu=(e)=>
  {
    setUsername(e.target.value);
    handleFireBaseSearch(username);

  }
  useEffect( async()=> {
    const querySnapshot = await getDocs(collection(db, "users"));
    const tempUser = []
    querySnapshot.forEach((doc) => {
      tempUser.push({ value: doc.id, label:doc.data().name})
    });
     setSearchUser(tempUser);

  }, []);

  console.log('groupname----<',groupname)
  return (
    <>
            <div className="d-flex justify-content-between user-chat-head  jext-justify p-3">
            <button> <i className="fa fa-user" aria-hidden="true"></i> </button>
            <button><i className="fa-solid fa-bell"></i></button>
            <button onClick={()=>searchBoxStatus?setSearchBoxSatus(false):setSearchBoxSatus(true)}><i className="fa-solid fa-message"></i></button>
          </div>
         
          <div>
            {
              searchBoxStatus?
              <div className="add-group-memeber-section pt-3">
                            <div className="d-flex justify-content-between user-chat-head  jext-justify p-3">
                              <button onClick={()=>searchBoxStatus?setSearchBoxSatus(false):setSearchBoxSatus(true)}><i class="fa fa-arrow-left" aria-hidden="true"></i></button>
                              <button onClick={()=>searchBoxStatus?setSearchBoxSatus(false):setSearchBoxSatus(true)}><i class="fa fa-users" aria-hidden="true"></i></button>
                            </div>
                                    <div className='group-search-form'>    
                                    <div className="user-search-dropdown-container">
                                              <Select
                                                    options={searchUser}
                                                    placeholder="Select Select"
                                                    value={selectedUsers}
                                                    onChange={handleSelect}
                                                    isSearchable={true}
                                                    isMulti
                                                />
                                    </div><br/>
                                    <button onClick={()=>addNewGroup()}>Add Group</button>
                            </div>
                </div>:null
            }
           
           <input type="text" value = {username} onChange={(e)=>setvalu(e)} />  
        </div>
    </>
  );
};

export default GroupChat;
