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


import { v4 as uid } from "uuid";
import { db, auth } from "../firebase";
import swal from 'sweetalert';
import Select from 'react-select';
const GroupChat = () => {

  const currentuser = auth.currentUser.uid;
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState();
  const [searchUser,setSearchUser] = useState([]);
  const [groupName,setGroupName]= useState();
  const [searchBoxStatus,setSearchBoxSatus] = useState(false);

  const getGroupUserIds =()=>
  {
    let users = new Array();
    selectedUsers.map((user)=>{
      users.push({user:user.value,readStatus:false});
    })
    users.push({user:currentuser,readStatus:false});
    return users;
  }

  function handleSelect(e) 
  {
      setSelectedUsers(e)
  }
  const addNewGroup = ()=>{  
    
    getGroupUserIds();
      swal("Enter Chat Room Name:", {
          content: "input",
        })
        .then((value) => {
          //swal(`You typed: ${value}`);
          swal({
              title: "Are you sure to Create?",
              text: value,
              icon: "warning",
              buttons: true,
              dangerMode: false,
            })
            .then((willCreate) => {
              if (willCreate) {

                 setDoc(doc(db, "group", uid), {
                  groupAdmin: currentuser,
                  groupName:groupName,
                  groupMemeber:getGroupUserIds(),
                  createdAt: Timestamp.fromDate(new Date()),
                  isOnline: true,
                });

                swal("Poof! Your Group '"+value+"' Created Successfully!",{icon: "success",});
                setGroupName(value)
                setSearchBoxSatus(true)
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
                                    </div>
                                    <button onClick={addNewGroup}>Add Group</button>
                            </div>
                </div>:null
            }
           
           <input type="text" value = {username} onChange={(e)=>setvalu(e)} />  
        </div>
    </>
  );
};

export default GroupChat;
