"use client"

import { Component } from "react"
import "../css/Projecthomepage.css"
import { callApi } from "../api"

export default class Projecthomepage extends Component {
  state = {
    loggedIn: !!localStorage.getItem("authToken"), // check token
    email: localStorage.getItem("userEmail") || "",
  }

  // ================= AUTH POPUPS =================
  showSignin = () => {
    const popup = document.getElementById("popup")
    const signin = document.getElementById("signinForm")
    const signup = document.getElementById("signupForm")
    document.getElementById("popupHeader").innerHTML = "Login"
    signin.style.display = "block"
    signup.style.display = "none"
    popup.style.display = "block"
  }

  showSignup = () => {
    const popup = document.getElementById("popup")
    const signin = document.getElementById("signinForm")
    const signup = document.getElementById("signupForm")
    document.getElementById("popupHeader").innerHTML = "Signup"
    signin.style.display = "none"
    signup.style.display = "block"
    popup.style.display = "block"
  }

  closeSignin = (event) => {
    if (event.target.id === "popup") {
      document.getElementById("popup").style.display = "none"
    }
  }

  // ================= SIGNUP =================
  userRegistration = () => {
    const fullname = document.getElementById("fullname")
    const email = document.getElementById("email")
    const role = document.getElementById("role")
    const signuppassword = document.getElementById("signuppassword")
    const confirmpassword = document.getElementById("confirmpassword")
    ;[fullname, email, role, signuppassword, confirmpassword].forEach((el) => (el.style.border = ""))

    if (!fullname.value) {
      fullname.style.border = "1px solid red"
      fullname.focus()
      return
    }
    if (!email.value) {
      email.style.border = "1px solid red"
      email.focus()
      return
    }
    if (!role.value) {
      role.style.border = "1px solid red"
      role.focus()
      return
    }
    if (!signuppassword.value) {
      signuppassword.style.border = "1px solid red"
      signuppassword.focus()
      return
    }
    if (!confirmpassword.value) {
      confirmpassword.style.border = "1px solid red"
      confirmpassword.focus()
      return
    }
    if (signuppassword.value !== confirmpassword.value) {
      signuppassword.style.border = confirmpassword.style.border = "1px solid red"
      confirmpassword.focus()
      return
    }

    const data = JSON.stringify({
      fullname: fullname.value,
      email: email.value,
      role: role.value,
      password: signuppassword.value,
    })

    callApi("POST", "http://localhost:8080/users/signup", data, this.getResponse)
  }

  // ================= SIGNIN =================
  signIn = () => {
    const emailEl = document.getElementById("usernameInput")
    const passEl = document.getElementById("passwordInput")
    ;[emailEl, passEl].forEach((el) => (el.style.border = ""))
    if (!emailEl.value) {
      emailEl.style.border = "1px solid red"
      emailEl.focus()
      return
    }
    if (!passEl.value) {
      passEl.style.border = "1px solid red"
      passEl.focus()
      return
    }

    const data = JSON.stringify({
      email: emailEl.value,
      password: passEl.value,
    })

    callApi("POST", "http://localhost:8080/users/signin", data, (res) => {
      if (res && res.length > 20) {
        localStorage.setItem("authToken", res)
        localStorage.setItem("userEmail", emailEl.value)
        this.setState({ loggedIn: true, email: emailEl.value })
      } else {
        alert("Login failed: " + res)
      }
    })
  }

  // ================= SIGNUP RESPONSE =================
  getResponse = (res) => {
    if (res && res.length > 20) {
      localStorage.setItem("authToken", res)
      localStorage.setItem("userEmail", document.getElementById("email").value)
      this.setState({
        loggedIn: true,
        email: document.getElementById("email").value,
      })
    } else {
      const parts = String(res).split("::")
      const code = parts[0]
      const msg = parts.slice(1).join("::") || "Done"
      alert(msg)
      if (code === "200") {
        this.showSignin()
      }
    }
  }

  // ================= LOGOUT =================
  logout = () => {
    localStorage.clear()
    this.setState({ loggedIn: false, email: "" })
  }

  // ================= RENDER =================
  render() {
    // If logged in → show Hello page
    if (this.state.loggedIn) {
      return (
        <div style={{ textAlign: "center", marginTop: "20%" }}>
          <h1>Hello, {this.state.email || "User"} 👋</h1>
          <p>Welcome to the KL Job Portal!</p>
          <button style={{ marginTop: "20px", padding: "10px 20px" }} onClick={this.logout}>
            Logout
          </button>
        </div>
      )
    }

    // Else → show login/signup UI
    return (
      <div className="page-container">
        {/* Popup */}
        <div id="popup" onClick={this.closeSignin}>
          <div className="popupwindow" onClick={(e) => e.stopPropagation()}>
            <div id="popupHeader" className="popupHeader">
              Login
              <span className="close-btn" onClick={() => (document.getElementById("popup").style.display = "none")}>
                ×
              </span>
            </div>

            {/* Signin form */}
            <div id="signinForm" className="Signin" style={{ display: "none" }}>
              <label className="usernameLabel">Username (email):</label>
              <input type="text" id="usernameInput" />
              <label className="passwordLabel">Password:</label>
              <input type="password" id="passwordInput" />
              <div className="forgotPassword">
                <label>Forgot Password?</label>
              </div>
              <button className="signinButton" onClick={this.signIn}>
                Sign In
              </button>
              <div className="div1"></div>
              <div className="div2"></div>
              Don't have an account?
              <div onClick={this.showSignup}>Sign Up</div>
              <label onClick={this.showSignup}>SIGN UP NOW</label>
            </div>

            {/* Signup form */}
            <div id="signupForm" style={{ display: "none" }}>
              <label>Full Name:</label>
              <input type="text" id="fullname" />
              <label>Email:</label>
              <input type="email" id="email" />
              <label>Role:</label>
              <select id="role">
                <option value=""></option>
                <option value="ADMIN">Admin</option>
                <option value="EMPLOYER">Employer</option>
                <option value="JOB_SEEKER">Job Seeker</option>
              </select>
              <label>Password:</label>
              <input type="password" id="signuppassword" />
              <label>Confirm password:</label>
              <input type="password" id="confirmpassword" />
              <button onClick={this.userRegistration}>Register Now</button>

              <div>
                Already have an account? <span onClick={this.showSignin}>SIGN IN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="header">
          <div id="logo1">
            <img id="image1" src="/images/logo.png" alt="Logo" />
          </div>
          <div id="title">
            <h2>KL JOB PORTAL</h2>
          </div>
          <div id="signinBtn" onClick={this.showSignin}>
            <img id="image3" src="/images/user.png" alt="Logo" />
            <h4 id="signin1">Sign In</h4>
          </div>
          <div id="registerBtn" onClick={this.showSignup}>
            <img id="image3" src="/images/user.png" alt="Logo" />
            <h4 id="Register1">Register</h4>
          </div>
        </div>
      </div>
    )
  }
}
