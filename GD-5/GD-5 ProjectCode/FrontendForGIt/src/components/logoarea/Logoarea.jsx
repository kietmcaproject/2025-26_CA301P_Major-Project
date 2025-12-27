    import React from "react";
    import logoforapp from "../../assets/hellologo5.gif";
    import "./Logo.css";

    const Logoarea = () => {
    return (
        <>
        <div className="d-flex flex-wrap justify-between items-center bg-gray-600 p-2 rounded-lg HelloCodersLogo">
            <div className="leftcontainer d-flex flex-wrap items-center gap-2">
            <img src={logoforapp} className="img-fluid rounded-full" style={{mixBlendMode:"multiply"}} alt="Roadmap Builder"  />
            <h1 className="font-sens font-bold text-yellow-400 text-ligth text-lg text-center text-capitalize text-wrap">
                codHelp Roadmap Builder
            </h1>
            </div>
            <div className="rightcontainer">
            <p className="mr-2 text-light text-md">
                Built by{" "}
                <span className="font-semibold text-yellow-400">
                CodHelp Team
                </span>
                <details className="">
                <summary>Members</summary>
                <ul className="right-8 z-50 absolute bg-gray-800 shadow-lg mt-2 p-2 rounded-md w-58">
                    <li className="font-semibold text-gray-400">😊 Vikas Singh</li>
                    <li className="font-semibold text-gray-400">🤦‍♀️ Vanshika Tyagi</li>
                    <li className="font-semibold text-gray-400">
                        😒 Tripti Rajput
                    </li>
                    <li className="font-semibold text-gray-400">🤪 Tushar Kumar</li>
                </ul>
                </details>
            </p>
            </div>
        </div>
        </>
    );
    };

    export default Logoarea;
