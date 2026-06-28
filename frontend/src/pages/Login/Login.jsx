import { useState } from "react";
import "../../styles/auth.css";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function Login() {

    const [form,setForm]=useState({
        email:"",
        password:"",
    });

    const handleChange=(e)=>{
        setForm({
            ...form,
            [e.target.name]:e.target.value,
        });
    };

    const handleSubmit=(e)=>{
        e.preventDefault();

        const handleSubmit = async (e) => {
            e.preventDefault();

            try {
                const data = await login(form);

                console.log("Login Success:", data);

                localStorage.setItem("token", data.token);

                // We'll replace this with AuthContext in the next step
            } catch (error) {
                console.error(error.response?.data || error.message);
            }
        };
    };

    return(

        <div className="auth-container">
        <div className="auth-card">
            <h1 className="auth-title">CodeMatch</h1>
            <p className="auth-subtitle">
            Sign in to continue
            </p>

            <form onSubmit={handleSubmit}>
            {/* Input components */}
            <Button type="submit">
                Login
            </Button>
            </form>

            <div className="auth-footer">
            Don't have an account? Register
            </div>
        </div>
        </div>

    );

}