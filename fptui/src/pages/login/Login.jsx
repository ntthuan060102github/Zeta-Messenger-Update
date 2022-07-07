import axios from "axios"
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./login.css"
import { Link } from "react-router-dom"

export default function Login() {
    const username = useRef()
    const password = useRef()
    const [noti, setNoti] = useState("-")
    const redirect = useNavigate()

    const submit_handler = async (e) => {
        e.preventDefault();

        const payload = { 
            username: username.current.value, 
            password: password.current.value 
        }

        try {
            const res = await axios.post("users/information/login/", payload)
            if (res.status === 202) {
                const token = res.data.data
                localStorage.setItem("access_token", token['access'])
                localStorage.setItem("refresh_token", token['refresh'])
                localStorage.setItem("user_id", token['user_id'])
                window.location.reload()
            }
        }
        catch (err) {
            if (err.response.status === 400) {
                setNoti("Invalid username or password!")
            }
            else if (err.response.status === 500) {
                setNoti("The server is down!")
            }
        }
    }

    return (
        <div className="login">
            <div className="login__wrapper">
            <div className="login__left">
                <h3 className="login__logo">Zeta</h3>
                    <span className="login__description">
                        Connect with friends and the world around you on Zeta.
                    </span>
                </div>
                <div className="login__right">
                    <form action="" className="login__form">
                        <input type="text" 
                            className="login__input" 
                            placeholder="Username"
                            ref={username}
                            required
                        />
                        <input type="password" 
                            className="login__input" 
                            placeholder="Password"
                            ref={password}
                            required
                        />
                        <button className="login__button" onClick={submit_handler}>Log In</button>
                        <span 
                            className={noti === "-" ? "notification disable" : "notification"}
                        >
                            {noti}
                        </span>
                        <span className="login__forgot">Forgot password?</span>
                        <div className="login__line"></div>
                        <Link to="/register" className="login__button login__register-btn">
                            Create new Zeta account
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    )
}