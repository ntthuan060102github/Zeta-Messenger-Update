import { useState, useEffect } from "react"
import { config, useClient, useMicrophoneAndCameraTracks, channelName } from "../../setting"
import { Grid } from "@material-ui/core"
import Videos from "../../components/videos/Videos"
import Controls from "../../components/controls/Controls"
import "./videocall.css"

export default function VideoCall() {
    const [users, setUsers] = useState([])
    const client = useClient()
    const { ready, tracks } = useMicrophoneAndCameraTracks()

    useEffect(() => {
        let init = async (name) => {
            client.on("user-published", async(user, mediaType) => {
                await client.subscribe(user, mediaType)

                if (mediaType === "video") {
                    setUsers(pre => [...pre, user])
                }
                if (mediaType === "audio") {
                    user.audioTrack.play()
                }
            })

            client.on("user-unpublished", (user, mediaType) => {
                if (mediaType === "audio") {
                    if (user.audioTrack) {
                        user.audioTrack.stop()
                    }
                    if (mediaType === "video") {
                        setUsers(pre => pre.filter(u => u.uid !== user.uid))
                    }
                }
            })

            client.on("user-left", user => {
                setUsers(pre => pre.filter(u => u.uid !== user.uid))
            })

            try {
                await client.join(config.appId, name, config.token, null)
            }
            catch (err) {
                console.error(err)
            }

            if (tracks) {
                await client.publish([tracks[0], tracks[1]])
            }
        }
        
        if (ready && tracks) {
            try {
                init(channelName)
            }
            catch (err) {
                console.error(err)
            }
        } 
    }, [channelName, client, ready, tracks])

    return (
        <div className="video-call">
            { ready && tracks && (
                    <Controls 
                        tracks={tracks} 
                        className="controls"
                    />
                )
            }
            { tracks && (
                    <Videos 
                        tracks={tracks} 
                        users={users}
                        className="videos"
                    />
                )
            }
        </div>
    )
}