import "./message.css"
import { useEffect, useState } from "react"
import axios from "axios"
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function Message({message, own}) {
    const [other, setOther] = useState(null)
    const [isRecalled, setIsRecalled] = useState(message?.is_recalled)
    const [messageOptionsMenu, setMessageOptionsMenu] = useState(false)

    const recallMessage = async () => {
        try {
            const res = await axios.put("users/message/" + message?.id + "/")
            if (res.status === 200) {
                setIsRecalled(true)
                setMessageOptionsMenu(false)
            }
        }
        catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        const get_other = async () =>
        {
            try {
                if (!own) {
                    const res = await axios.get("users/information/" + message['sender'])
                    // setOther(res)
                    setOther(res?.data)
                }
            }
            catch(e) {
                
            }
        }
        get_other()
    }, [message])
    
    return (
        <div className={own ? "message own" : "message"}>
            <div className="message__top">
                <img 
                    src={other?.avatar}
                    alt="" 
                    className="message__avatar" 
                />
                <div className="message__body">
                    {own ? <MoreVertIcon 
                        onClick={(e) => {
                                setMessageOptionsMenu(!messageOptionsMenu)
                            }
                        } 
                        className="icon"/> : <></>}
                    {
                        messageOptionsMenu 
                        ? (
                            <ul className="message__menu">
                                <li className="message__option" onClick={recallMessage}>recall</li>
                            </ul> 
                        )
                        : <></>
                    }
                    {
                        !isRecalled 
                        ?       
                            <>      
                                <video 
                                    controls 
                                    className={
                                        message?.type === "V" 
                                        ? "message__file" 
                                        : "message__file no_active"
                                    }
                                >
                                    <source src={message?.file} type="video/mp4"/>
                                </video>
                                <img 
                                    src={message?.file}
                                    className={
                                        message?.type === "I" 
                                        ? "message__file" 
                                        : "message__file no_active"
                                    } 
                                />
                            </>
                        : <></>
                    }
                    <p className={message?.content === "" 
                        ? "message__content no_active" 
                        : "message__content"}
                    >
                        {isRecalled ? (<i>Message recalled</i>) : message?.content}
                    </p>
                </div>
            </div>
        </div>
    )
  }