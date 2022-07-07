import { useState } from "react"
import { useClient } from "../../setting"
import { Grid, Button } from "@material-ui/core"

import MicIcon from "@material-ui/icons/Mic"
import MicOffIcon from "@material-ui/icons/MicOff"
import VideocamIcon from "@material-ui/icons/Videocam"
import VideocamOffIcon from "@material-ui/icons/VideocamOff"
import PhoneDisabled from "@material-ui/icons/PhoneDisabled"

export default function Controls (props) {
    const client = useClient()
    const { tracks } = props
    const [trackState, setTrackState] = useState({video: true, audio: true})

    const mute = async (type) => {
        if (type === 'audio') {
            await tracks[0].setEnabled(!trackState.audio)
            setTrackState((ps) => ({...ps, audio: !ps.audio}))
        }
        else if (type === 'video') {
            await tracks[1].setEnabled(!trackState.video)
            setTrackState((ps) => ({...ps, video: !ps.video}))
        }
    }

    const leaveChannel = async () => {
        await client.leave()
        client.removeAllListeners()
        tracks[0].close()
        tracks[1].close()
        window.close()
    }

    return (
        <div className="controls">
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    <Button 
                        variant="contained" 
                        color={trackState.audio ? "default" : "secondary"}
                        onClick={() => mute("audio")}
                    >   
                        {trackState.audio ? <MicIcon/> : <MicOffIcon/>} 
                    </Button>
                </Grid>
                <Grid item>
                    <Button 
                        variant="contained" 
                        color={trackState.video ? "default" : "secondary"}
                        onClick={() => mute("video")}
                    >   
                        {trackState.video ? <VideocamIcon/> : <VideocamOffIcon/>} 
                    </Button>
                </Grid>
                <Grid item>
                    <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={leaveChannel}
                    >   
                        <PhoneDisabled/>
                    </Button>
                </Grid>
            </Grid>
        </div>
    )
}