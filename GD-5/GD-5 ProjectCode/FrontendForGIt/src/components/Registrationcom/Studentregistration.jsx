import React, { useState } from 'react';
import axios from 'axios';
import studentillustrator from '../../assets/studentundraw.svg';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Logoarea from '../logoarea/Logoarea';
import Navbar from '../navbar/Navbar';
import Footer from '../Footer/Footer';
import './Registrationcss/Registration.css'


const StudentRegistration = () => {
    const sendUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [submissionError, setSubmissionError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [studentData, setStudentData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    });


    const handleStudentChange = (e) => {
        setStudentData({ ...studentData, [e.target.name]: e.target.value });
    };

    const validateStudentForm = () => {
        const newErrors = {};
        if (!studentData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!studentData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!studentData.email.includes('@')) newErrors.email = 'Valid email is required';
        if (!studentData.phone.match(/^\d{10}$/)) newErrors.phone = 'Phone number must be 10 digits';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        if (validateStudentForm()) {
            setLoading(true);
            try {
                // console.log('Sending data:', JSON.stringify(studentData, null, 2));
                const response = await axios.post(`${sendUrl}/api/users/registerstudent`, studentData, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                toast.success('registered successfully!', { autoClose: 3000 });
                console.log('registration success:', response.data);

                setTimeout(() => navigate('/login'), 4000);

            } catch (error) {
                console.error('registration error:', error);
                if (error.response) {
                    console.error('Response error data:', error.response.data);
                    setSubmissionError(error.response.data.error || 'Unable to register. Please try again later.');
                } else if (error.request) {
                    console.error('No response received:', error.request);
                    setSubmissionError('Network error. Please check your connection and try again.');
                } else {
                    console.error('Error setting up the request:', error.message);
                    setSubmissionError('An unexpected error occurred. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
        <section>
                <Logoarea />
            </section>
            <section>
                <Navbar />
            </section>
        <section>
            <ToastContainer />
            <div className="d-flex justify-between gap-4 bg-dark my-8 py-2 rounded-3xl col-11 container-fluid imageareaforteacher">
                <div className="d-flex flex-col justify-center items-center gap-2 rounded-xl container-fluid imageareacontrol">
                    <img src={studentillustrator} className='imagesizecontroller img-fluid' alt="Student illustration" width={200} />
                    <div className="font-serif font-bold text-white text-2xl text-center text-capitalize">
                        Registration
                    </div>
                </div>
                <div className="bg-gray-900 py-4 rounded-xl text-white text-justify textareacontrol">
                    <div className="container-fluid">
                        <h1 className='my-4 font-bold text-gray-100 text-4xl text-center text-capitalize'>
                            User Registration
                        </h1>
                    </div>
                    <div className="container-fluid">
                        <div className="w-100">
                            <p className='my-5 text-md text-white text-capitalize'>
                                Join CodHelp Roadmap Builder as a student and enhance your coding skills! Register now to gain access to resources, connect with mentors, and grow as a developer. Embark on your coding journey today!
                            </p>
                            {submissionError && <p className="my-3 text-danger">{submissionError}</p>}
                            <form onSubmit={handleStudentSubmit}>
                                <div className="d-flex flex-col gap-2 mb-3 formresponsive">
                                    <label htmlFor="studentFirstName" className="form-label text-left">FirstName</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="studentFirstName"
                                        name="firstName"
                                        value={studentData.firstName}
                                        onChange={handleStudentChange}
                                    />
                                    {errors.firstName && <p className="text-danger">{errors.firstName}</p>}

                                    <label htmlFor="studentLastName" className="form-label text-left">LastName</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="studentLastName"
                                        name="lastName"
                                        value={studentData.lastName}
                                        onChange={handleStudentChange}
                                    />
                                    {errors.lastName && <p className="text-danger">{errors.lastName}</p>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="exampleInputEmail2" className="form-label">Email address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="exampleInputEmail2"
                                        name="email"
                                        value={studentData.email}
                                        onChange={handleStudentChange}
                                    />
                                    {errors.email && <p className="text-danger">{errors.email}</p>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="exampleInputPassword3" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="exampleInputPassword3"
                                        name="password"
                                        value={studentData.password}
                                        onChange={handleStudentChange}
                                    />
                                    {errors.password && <p className="text-danger">{errors.password}</p>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="exampleInputPhone2" className="form-label">Phone number</label>
                                    <input
                                        type="phone"
                                        className="form-control"
                                        id="exampleInputPhone2"
                                        name="phone"
                                        value={studentData.phone}
                                        onChange={handleStudentChange}
                                    />
                                    {errors.phone && <p className="text-danger">{errors.phone}</p>}
                                </div>

                                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <footer>
            <Footer/>
        </footer>
        </>
    );
};

export default StudentRegistration;
