import React, { useState } from 'react';
import './Logincss/Login.css';
import Logoarea from '../logoarea/Logoarea';
import Navbar from '../navbar/Navbar';
import loginimagesvg from '../../assets/loginsvg.svg';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../Footer/Footer';


const Loginpage = () => {
    const sendUrl = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.email || !formData.password) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${sendUrl}/api/users/logindetail`, formData);

            if (response.status === 200) {
                const { name, email } = response.data;

                // Save user data to local storage
                localStorage.setItem('user', JSON.stringify({ name, email }));
                toast.success("Login successful");
                setInterval(() => {
                    window.location.href = '/';
                }, 3000);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "An error occurred. Please try again.");
            setInterval(() => {
            }, 4000);
            console.error("Error posting login data:", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <ToastContainer />
            <section>
                <Logoarea />
            </section>
            <section>
                <Navbar />
            </section>
            <section>
                <div className="d-flex justify-center text-black container-fluid">
                    <div className="my-10 container">
                        <h1 className="my-4 font-serif font-bold text-light text-2xl text-center text-capitalize text-wrap">
                            CodHelp log-in
                        </h1>
                        <div className="d-flex gap-3 py-4 rounded-3xl col-10 container-fluid formloginmobileview outerloginpagebox">
                            <img src={loginimagesvg} className="w-80 img-fluid" alt="login" />
                            <div className="w-100 innerloginpage">
                                <form onSubmit={handleSubmit}>
                            <p className='font-bold text-light text-center text-capitalize'>
                                <span className='text-gray-900'>hello!</span> please log in to your account
                            </p>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3 form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="rememberMe"
                                            name="rememberMe"
                                            checked={formData.rememberMe}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label" htmlFor="rememberMe">Remember me!</label>
                                    </div>
                                    <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                                        {loading ? 'Loading...' : 'Submit'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <footer>
                    <Footer/>
                </footer>
            </section>
        </>
    );
}

export default Loginpage;
