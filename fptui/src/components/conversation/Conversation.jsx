import { useState, useEffect} from "react"
import axios from "axios"
import "./conversation.css"

export default function Conversation({conversation}) {
    const owner_id = localStorage.getItem("user_id")
    const [user, setUser] = useState(null)
    useEffect(() => {
      const friendId = conversation.members.find(m => m.toString() !== owner_id)
      const getUser = async () => {
        try {
          if (owner_id) {
            const res = await axios.get('users/information/' + friendId)
            setUser(res.data)
          }
        }
        catch (err) {
          console.log(err)
        }
      }
      getUser()
    }, [conversation, owner_id])
    return (
      <div className="conversation">
        <img 
            src={user?.avatar}
            className="conversation__avatar" 
        />
        <span className="conversation__username">{`${user?.first_name} ${user?.last_name}`}</span>
      </div>
    )
}