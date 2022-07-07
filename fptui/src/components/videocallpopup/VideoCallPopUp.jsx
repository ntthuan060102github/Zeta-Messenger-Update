import "./videocallpopup.css"
import VideocamIcon from '@mui/icons-material/Videocam'
import PhoneIcon from '@mui/icons-material/Phone'
import sound1 from "@/../../public/assets/audio/messenger1.mp3"
import sound2 from "@/../../public/assets/audio/messenger2.mp3"
import axios from "axios"
import {useEffect, useState} from "react"

export default function VideoCallPopUp (props) {
    const {chatSocket, setHasCall, isCaller, friend_id} = props
    const [friend, setFriend] = useState(null)
    
    useEffect(() => {
        const getFriend = async () => {
            const res = await axios.get("users/information/" + friend_id)
            setFriend(res.data)
        }
        getFriend()
    }, [friend_id])

    const callHandler = (action) => {
        chatSocket.current.send(JSON.stringify({
            "_type": "call_action",
            'call_id': action,
            'message_id': ""
        }));
    }

    return (
        <div className="pop-up">
            <audio loop autoPlay preload="auto">
                <source src={isCaller ? sound2 : sound1} type="audio/mpeg"/>
            </audio>
            <div className="pop-up__wrap">
                <div className="pop-up__top">
                    <img 
                        src={friend?.avatar} 
                        alt="" 
                        className="pop-up__avatar" 
                        />
                    <div className="pop-up__name">{`${friend?.first_name} ${friend?.last_name}`}</div>
                </div>
                <div className="pop-up__bottom">
                    {
                        !isCaller 
                        ? <VideocamIcon 
                            fontSize="inherit" 
                            className="pop-up__icon pop-up__icon__accept"
                            onClick={() => 
                                {
                                    callHandler("accept")
                                }
                            }
                        />
                        : <></>
                    }
                    <PhoneIcon 
                        fontSize="inherit" 
                        className="pop-up__icon pop-up__icon__refuse"
                        onClick={() => callHandler("refuse")}
                    />
                </div>
            </div>
        </div>
    )
}