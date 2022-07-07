import VideocamIcon from '@mui/icons-material/Videocam';
import "./topbar.css"
import axios from 'axios'
import {useState, useEffect} from "react"

export default function Topbar(props) {
    const {chatSocket, friend_id} = props 
    const [friend, setFriend] = useState(null)
    const videoCallHandler = async () => {
        let data = await axios.get("users/conversation/video-connecting")
        data = data.data.data
        data['sender'] = localStorage.getItem("user_id")
        // console.log(data)
        chatSocket.current.send(JSON.stringify({
            "_type": "call",
            'call_id': data,
            'message_id': ""
        }));
    }
    useEffect(() => {
        const getFriend = async () => {
            const f = await axios.get("users/information/" + friend_id)
            setFriend(f.data)
        }
        getFriend()
    }, [])
    return (
        <div className="topbar__container">
            <div className="topbar__left">
                <img src={friend?.avatar} alt="" className="topbar__avatar"/>
            </div>
            <div className="topbar__right">
                <VideocamIcon 
                    fontSize="large" 
                    className="topbar__call"
                    onClick={videoCallHandler}/>
            </div>
        </div>
    )
}