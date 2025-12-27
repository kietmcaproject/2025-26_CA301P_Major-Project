import React, { useEffect, useState } from 'react';

const Offlineonline = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showInternetConn, setShowInternetConn] = useState(true);
    const [username, setUsername] = useState("Fellow Coder's");

    useEffect(() => {
        // Retrieve user name from localStorage if it exists
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser && storedUser.name) {
            setUsername(storedUser.name);
        }
    }, []);

    const shownternetconn = () => {
        const timer = setTimeout(() => {
            setShowInternetConn(false);
        }, 4000);
        return () => clearTimeout(timer);
    };

    const updateOnlineStatus = () => {
        setIsOnline(navigator.onLine);
        shownternetconn();
    };

    useEffect(() => {
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    return (
        <>
            {
                showInternetConn && (
                    <div className={`container-fluid ${isOnline ? 'bg-lime-700' : 'bg-red-700'}`}>
                        <div className="userdetails">
                            <h1 className="text-left font-bold font-sens text-lg text-dark py-1">
                                Welcome: <span className='text-capitalize text-light'> {username}</span>
                            </h1>
                        </div>
                    </div>
                )
            }

        </>
    );
};

export default Offlineonline;

