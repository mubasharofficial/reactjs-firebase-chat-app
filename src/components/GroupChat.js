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
  const [groupName,setGroupName]= useState();
  const [searchBoxStatus,setSearchBoxSatus] = useState(false);
   const  createNewChatDocument = async(value)=>
  {
    const uuid= uuidv4();
    try{
      selectedUsers.push({label:'Group Admin',value:currentuser});
      
      let unsub =  await  setDoc(doc(db, "groupchat", uuid), {
      id:uuid,
       groupAdmin: currentuser,
       groupName: value,
       groupMemeber:selectedUsers
               ,
                messages:[
                 {senderId:currentuser,
                  senderName:'Group Admin',
                  text:'group create by Group Admin',
                  createdAt: Timestamp.fromDate(new Date()),
                  media:"",
                }
                 ],
       createdAt: Timestamp.fromDate(new Date()),
       groupstatus: false,
     });
     setSelectedUsers([]);
     return () => unsub();
     
     
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
                createNewChatDocument(value);

              } else {
                swal("You have Cancel  Group Creation");
              }
            });
        });
        setSearchBoxSatus(false);
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
    
    const tempUser = []
    const q = query(
      collection(db, "users"),
      where("uid", "!=", currentuser)
    );
    
    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        tempUser.push({ value: doc.id, label:doc.data().name})
      });
      setSearchUser(tempUser);
    } catch (err) {
      setErr(true);
    }

  }, []);


  return (
    <>
            <div className="p-3 d-flex justify-content-center   border-b-2 border-indigo-200">
            <button></button>
            <button onClick={()=>searchBoxStatus?setSearchBoxSatus(false):setSearchBoxSatus(true)}><svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path></svg></button>
          </div>
          
          <div>
            {
              searchBoxStatus?
              <div className=" pt-3">
                            <div className="d-flex justify-content-center pb-2">
                              <button  className="btn" onClick={()=>searchBoxStatus?setSearchBoxSatus(false):setSearchBoxSatus(true)}><i class="fa fa-arrow-left" aria-hidden="true"></i></button>
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
                                    <div className="d-flex justify-content-center p-2">
                                    <button className="btn" onClick={()=>addNewGroup()}><svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path></svg></button>
                                    
                                    </div>
                                    
                            </div>
                </div>:null
            }  
        </div>
    </>
  );
};

export default GroupChat;
