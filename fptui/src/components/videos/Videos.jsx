import { AgoraVideoPlayer } from "agora-rtc-react"
import { Grid } from "@material-ui/core"
import { useState, useEffect } from "react"
import "./videos.css"

export default function Video (props) {
    const {users, tracks} = props
    const [gridSpacing, setGridSpacing] = useState(12)

    useEffect(() => {
        setGridSpacing(Math.max(Math.floor(12 / (users.length + 1)), 4))
    }, [users, tracks]) 
    return (
        <div className="video-call">
            <AgoraVideoPlayer 
                videoTrack={tracks[1]} 
                // style={{height: "100%", width: "100%"}}
                className="owner"
            />
            {
                users[0]?.videoTrack && (
                    <AgoraVideoPlayer 
                        videoTrack={users[0]?.videoTrack}
                        key={users[0]?.uid}
                        style={{height: "100%", width: "100%"}}
                        className="your__friend"
                    />
                )
                // users.length > 0 && users.map(u => {
                //     console.log(u)
                //     if (u.videoTrack) {
                //         return (
                //             <AgoraVideoPlayer 
                //                 videoTrack={u.videoTrack}
                //                 key={u.uid}
                //                 style={{height: "100%", width: "100%"}}
                //             />
                //         )
                //     }
                //     else {
                //         return null
                //     }
                // })
            }
        </div>
    )
}