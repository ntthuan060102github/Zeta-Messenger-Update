import axios from "axios"
import { useState, useEffect, useRef } from "react"
import Conversation from "../../components/conversation/Conversation"
import Message from "../../components/message/Message"
import Topbar from "../../components/topbar/Topbar"
import "./messenger.css"
import { Send, PermMedia } from "@mui/icons-material"
import VideoCallPopUp from "../../components/videocallpopup/VideoCallPopUp"

export default function Messenger () {
    const [conversations, setConversations] = useState([])
    const [currChat, setCurrChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const scrollEnd = useRef()
    const owner = localStorage.getItem("user_id")
    const chatSocket = useRef()
    const [arrivalMessage, setArrivalMessage] = useState(null)
    const [fileUpload, setFileUpload] = useState(null)
    const [hasCall, setHasCall] = useState(false)
    const [isCaller, setIsCaller] = useState(true)

    useEffect(() => {
        const getMessages = async () => {
            try {
                if (currChat) {
                    const res = await axios.get("users/message/" + currChat?.id)
                    setMessages(res.data.data)
                    console.log(currChat?.id)
                }
            }
            catch (err) {
                console.error(err)
            }
        }
        getMessages()
    }, [currChat])

    useEffect(() => {
        if (currChat) {
            //https://62be-118-69-108-249.ngrok.io
            chatSocket.current = new WebSocket("ws://localhost:8000/ws/chat/" + currChat?.id + '/');
            chatSocket.current.onmessage = async (e) => {
                const data = JSON.parse(e.data)
                if (data['_type'] === "message") {
                    const mess = await axios.get(
                        "users/message/" 
                        + owner 
                        + "?id=" 
                        + data['message_id']
                    )
                    // console.log(mess.data.data[0])
                    if (mess.data.data[0]['sender'].toString() !== owner) {
                        setArrivalMessage(mess.data.data[0])
                    }
                }
                else if(data['_type'] === "call") {
                    setHasCall(true)
                    setIsCaller(data['call_id']['sender'] === localStorage.getItem("user_id"))
                }
                else if (data['_type'] === "call_action") {
                    setHasCall(false)
                    if (data['call_id'] === "accept") {
                        window.open("http://localhost:3000/calling", "_blank")
                    }
                }
            }
        }
    }, [currChat])

    useEffect(() => {
        arrivalMessage 
            && currChat?.members.includes(arrivalMessage['sender'])
            && setMessages(prev => [...prev, arrivalMessage])
    }, [arrivalMessage, currChat])

    const handleEnterKey = (e) => {
        if(e.key === "Enter"){
            handleSendMessage(e)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        // console.log(fileUpload)
        if (newMessage !== "" || fileUpload) {
            const type = fileUpload ? fileUpload.type.split("/")[0][0].toUpperCase() : "T"
            const payload = new FormData()

            payload.append("conversation", currChat.id)
            payload.append("content", newMessage)
            payload.append("sender", owner)
            payload.append("type", type)
            payload.append("file", fileUpload)

            try {
                const postMessage = await axios.post("users/message/", payload)
                if (postMessage.status === 201) {
                    setMessages([...messages, postMessage.data.data[0]])
                    chatSocket.current.send(JSON.stringify({
                        "_type": "message",
                        'message_id': postMessage.data.data[0].id.toString(),
                        'call_id': ""
                    }));
                }
            }
            catch (e) {
                console.log(e)
            }
            setNewMessage("")
            setFileUpload(null)
        }
    }

    useEffect(() => {
        const getConversation = async () => {
            try {
                const conv = await axios.get("users/conversation/" + owner)
                setConversations(conv.data.data)
            }
            catch (err) {
                console.error(err)
            }
        }
        getConversation()
    }, [owner])

    useEffect(() => {
        scrollEnd.current?.scrollIntoView({behavior: "smooth"})
    }, [messages, currChat])

    return (
            <div className="messenger">
                {
                    hasCall 
                    ? <VideoCallPopUp 
                        chatSocket={chatSocket} 
                        setHasCall={setHasCall} 
                        isCaller={isCaller}
                        friend_id={currChat.members.filter(m => m.toString() !== owner.toString())}
                    /> 
                    : <></>
                }
                <div className="chat-menu">
                    <div className="chat-menu__wrap">
                        {conversations.map((conversation, idx) =>( 
                            <div className="conversation" key={idx} onClick={() => setCurrChat(conversation)}>
                                <Conversation 
                                    conversation={conversation}
                                />
                            </div>))
                        }
                    </div>
                </div>

                <div className="chat-box">
                    <div className="chat-box__wrap">
                        {
                            currChat ?
                        <>
                            <Topbar 
                                chatSocket={chatSocket}
                                friend_id={currChat.members.filter(m => m.toString() !== owner.toString())}
                            />
                            <div className="chat-box__top">
                                {messages.map((message, idx) => 
                                    <div key={idx}>
                                        <Message 
                                            message={message} 
                                            own={message?.sender?.toString() === owner} 
                                        />
                                    </div>
                                )}
                                <div ref={scrollEnd}></div>
                            </div>
                            <div className="chat-box__bottom">
                                <label htmlFor="input__file" className="share__option">
                                    <PermMedia className="share__icon"/>
                                    <input 
                                        type="file" 
                                        className="share__option-feature" 
                                        id="input__file"
                                        accept=".png, .jpg, .jpeg"
                                        onChange={e => {
                                            setFileUpload(e.target.files[0])
                                        }}
                                    />
                                </label>
                                <input 
                                    placeholder="Aa" 
                                    className="chat-box__input"
                                    onChange={e => setNewMessage(e.target.value)}
                                    value={newMessage}
                                    onKeyDown={handleEnterKey}
                                />
                                <button 
                                    className="char-box__submit"
                                    onClick={handleSendMessage}
                                >
                                    <Send className="char-box__submit-icon"/>
                                </button>
                            </div>
                        </>
                        : <span className="chat-box__notification">Open a conversation to start a chat.</span>}
                    </div>
                </div>
            </div>
    )
}