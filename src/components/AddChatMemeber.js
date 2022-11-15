import React, { useState } from 'react'
import swal from 'sweetalert';

const AddChatMemeber = () => {
    const [groupName,setGroupName]= useState();
    const [searchBoxStatus,setSearchBoxSatus] = useState(false);
    const addNewGroup =()=>{   
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
                  swal("Poof! Your Group '"+value+"' Created Successfully!", {
                    icon: "success",
                  });
                  setGroupName(value)
                  setSearchBoxSatus(true)
                } else {
                  swal("You have Cancel  Group Creation");
                }
              });
          });
    }
  return (
    <div>
        {
           searchBoxStatus?
           <div className="add-group-memeber-section">
                <div className='group-search-form'><input type="text" name='search_users' /></div>
                 <button onClick={()=>addNewGroup()}>+</button>
            </div>:null
        }
        <button className='add-chat-memeber-button' onClick={()=>searchBoxStatus?setSearchBoxSatus(false):setSearchBoxSatus(true)}>+</button>
    </div>
  )
}


export default AddChatMemeber