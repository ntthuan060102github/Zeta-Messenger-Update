import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react"

const AGORA_APP_ID = "1365589bd68843f7a64ebf331a61763a"
const AGORA_APP_CERTIFICATE = "268dc8b2148d432881be191d52a9ce29"
const TOKEN = "0061365589bd68843f7a64ebf331a61763aIAD7ICYbgSMA97+CBG2CG8mygJykZwTMSV+goiGrPz7JmUO+t+gAAAAAEADaJAv9l1jFYgEAAQCYWMVi"

export const config = {mode: "rtc", codec: "vp8", appId: AGORA_APP_ID, token: TOKEN}
export const useClient = createClient(config)
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks()
export const channelName = "a"