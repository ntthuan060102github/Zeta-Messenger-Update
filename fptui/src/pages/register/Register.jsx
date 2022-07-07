import './register.css'
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Link } from "react-router-dom"

export default function Register() {
    const first_name = useRef()
    const last_name = useRef()
    const username = useRef()
    const email = useRef()
    const password = useRef()
    const r_password = useRef()
    const [noti, setNoti] = useState("-")
    const redirect = useNavigate()

    const submit = async (e) => {
        e.preventDefault()

        if (password.current.value !== r_password.current.value 
            || first_name.current.value === ""
            || last_name.current.value === ""
            || username.current.value === ""
            || email.current.value === ""
            || password.current.value === "") {
            setNoti("Invalid registration information!")
        }
        else {
            const payload = {
                first_name: first_name.current.value,
                last_name: last_name.current.value,
                username: username.current.value,
                email: email.current.value,
                password: password.current.value
            }
            
            try {
                const res = await axios.post("users/information/register/", payload)
                if (res.status === 201) {
                    setNoti("Register success!")
                    
                    setTimeout(() => redirect("/login"), 1000)
                }
            }
            catch (err) {
                console.log(err)
                if (err.response.status === 400) {
                    setNoti("Invalid credentials or username already exists!")
                }
                else if (err.response.status === 500) {
                    setNoti("The server is down!")
                }
            }
        }
    }

    return (
        <div className="register">
            <div className="register__wrapper">
                <div className="register__left">
                    <h3 className="register__logo">Zeta</h3>
                    <span className="register__description">
                        Connect with friends and the world around you on Zeta.
                    </span>
                </div>
                <div className="register__right">
                    <form action="" className="register__form">
                        <input type="text" 
                            className="register__input" 
                            placeholder="First name"
                            ref={first_name}
                        />
                        <input 
                            type="text" 
                            className="register__input" 
                            placeholder="Last name"
                            ref={last_name}
                        />
                        <input 
                            type="text" 
                            className="register__input" 
                            placeholder="Username"
                            ref={username}
                        />
                        <input 
                            type="text" 
                            className="register__input" 
                            placeholder="Email"
                            ref={email}
                        />
                        <input 
                            type="password" 
                            className="register__input" 
                            placeholder="Password"
                            ref={password}
                        />
                        <input 
                            type="password" 
                            className="register__input" 
                            placeholder="Password again"
                            ref={r_password}
                        />
                        <button className="register__button" onClick={submit}>Sign Up</button>
                        <span className={noti === "-" ? "notification disable" : "notification"}>
                            {noti}
                        </span>
                        <div className="register__line"></div>
                        <Link to="/login" className="register__button register__register-btn">Log into account</Link>
                    </form>
                </div>
            </div>
        </div>
    )
}