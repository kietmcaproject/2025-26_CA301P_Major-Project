import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    FaMap,
    FaCodeBranch,
    FaUsers,
    FaChartLine,
    FaCheckCircle,
    FaLaptopCode,
    FaSignInAlt,
    FaAndroid,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";
import "./Home.css";
import Logoarea from "../logoarea/Logoarea";
import Offlineonline from "../onlineoffline/Offlineonline";
import Navbar from "../navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
    const [showInternetConn, setShowInternetConn] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalContent, setModalContent] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const showinternetconn = () => {
        const timer = setTimeout(() => {
            setShowInternetConn(false);
        }, 10000);
        return () => clearTimeout(timer);
    };

    showinternetconn();

    const handleSearch = () => {
        if (searchTerm) {
            navigate(`/flowchartdisplay?search=${searchTerm}`);
        }
    };

    const handleFeatureClick = (content) => {
        setModalContent(content);
    };

    const DownloadAndroidApk = () => {
        // Use the public path for the APK file
        const apkUrl = "/CodHelp.apk";
        const link = document.createElement("a");
        link.href = apkUrl;
        link.setAttribute("download", "CodHelp.apk");
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const closeModal = () => {
        setModalContent(null);
    };

    const sidebarVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    const featureCardVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration: 0.5 }
        },
        hover: { 
            scale: 1.05,
            transition: { duration: 0.2 }
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white">
            <div className="flex">
                {/* Sidebar Toggle Arrow Button */}
                <button
                    onClick={() => setSidebarOpen((v) => !v)}
                    aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    className="hidden md:flex hiddeninmobilescreen"
                    style={{
                        position: "fixed",
                        top: "24px",
                        left: sidebarOpen ? "260px" : "8px",
                        zIndex: 100,
                        background: "#2563eb",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        transition: "left 0.3s",
                    }}
                >
                    {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
                </button>
                <motion.aside
                    initial={false}
                    animate={sidebarOpen ? { x: 0, width: "16rem" } : { x: -270, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-800 p-2 min-h-screen hidden md:block"
                    style={{
                        position: "relative",
                        zIndex: 40,
                        overflow: "hidden",
                        boxShadow: sidebarOpen ? "2px 0 8px rgba(0,0,0,0.1)" : "none"
                    }}
                >
                    {sidebarOpen && (
                        <>
                            <h2 className="mb-6 font-bold text-blue-400 text-2xl">CodHelp</h2>
                            <motion.ul className="space-y-4">
                                <motion.li
                                    variants={itemVariants}
                                    className="flex items-center gap-3 p-1 w-full rounded hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                                    onClick={() =>
                                        handleFeatureClick({
                                            title: "Interactive Roadmaps",
                                            description: "Generate dynamic flowchart-based roadmaps for guided learning.",
                                        })
                                    }
                                >
                                    <FaMap className="text-blue-400 text-xl" />
                                    <span>Interactive Roadmaps</span>
                                </motion.li>
                                <motion.li
                                    variants={itemVariants}
                                    className="flex items-center gap-3 p-1 w-full rounded hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                                    onClick={() =>
                                        handleFeatureClick({
                                            title: "Tech & Non-Tech Paths",
                                            description: "Explore structured paths for development, business, finance, and more.",
                                        })
                                    }
                                >
                                    <FaCodeBranch className="text-green-400 text-xl" />
                                    <span>Tech & Non-Tech Paths</span>
                                </motion.li>
                                <motion.li
                                    variants={itemVariants}
                                    className="flex items-center gap-3 p-1 w-full rounded hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                                    onClick={() =>
                                        handleFeatureClick({
                                            title: "Community Collaboration",
                                            description: "Collaborate and share custom roadmaps with a growing community.",
                                        })
                                    }
                                >
                                    <FaUsers className="text-yellow-400 text-xl" />
                                    <span>Community Collaboration</span>
                                </motion.li>
                                <motion.li
                                    variants={itemVariants}
                                    className="flex items-center gap-3 p-1 w-full rounded hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                                    onClick={() =>
                                        handleFeatureClick({
                                            title: "AI-Powered Insights",
                                            description: "Get personalized AI-generated roadmap recommendations based on your goals.",
                                        })
                                    }
                                >
                                    <FaChartLine className="text-red-400 text-xl" />
                                    <span>AI-Powered Insights</span>
                                </motion.li>
                                <motion.li
                                    variants={itemVariants}
                                    className="flex items-center gap-3 p-1 w-full rounded hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                                    onClick={() => DownloadAndroidApk()}
                                >
                                    <FaAndroid className="text-green-400 text-xl" />
                                    <span>Download Android APK</span>
                                </motion.li>
                            </motion.ul>
                        </>
                    )}
                </motion.aside>

                <main className="flex-1 p-8">
                    <Logoarea  DownloadAndroidApk={DownloadAndroidApk} />
                    <Navbar DownloadAndroidApk={DownloadAndroidApk}/>

                    {showInternetConn && (
                        <div className="mt-4">
                            <Offlineonline />
                        </div>
                    )}

                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mt-8 text-center"
                    >
                        <h1 className="font-bold text-blue-500 text-4xl">
                            Welcome to CodHelp
                        </h1>
                        <p className="mx-auto mt-2 max-w-2xl text-gray-400 text-lg">
                            Create dynamic, AI-powered learning paths for various domains,
                            guiding you step-by-step toward expertise.
                        </p>
                    </motion.section>

                    <section>
                        <div className="flex justify-center mt-8">
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for a roadmap..."
                                className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 w-full md:w-1/3 text-black"
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-blue-500 ml-2 px-4 py-2 rounded-md text-white"
                            >
                                Search
                            </button>
                        </div>
                    </section>

                    <motion.section
                        initial="hidden"
                        animate="visible"
                        className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-10 cursor-pointer"
                    >
                        <motion.div
                            variants={featureCardVariants}
                            whileHover="hover"
                            className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                        >
                            <FaMap className="mx-auto mb-4 text-blue-400 text-5xl" />
                            <h3 className="font-semibold text-xl">Interactive Roadmaps</h3>
                            <p className="mt-2 text-gray-400">
                                Generate dynamic flowchart-based roadmaps for guided learning.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={featureCardVariants}
                            whileHover="hover"
                            className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                        >
                            <FaCodeBranch className="mx-auto mb-4 text-green-400 text-5xl" />
                            <h3 className="font-semibold text-xl">Tech & Non-Tech Fields</h3>
                            <p className="mt-2 text-gray-400">
                                Explore structured paths for development, business, finance, and
                                more.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={featureCardVariants}
                            whileHover="hover"
                            className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                        >
                            <FaUsers className="mx-auto mb-4 text-yellow-400 text-5xl" />
                            <h3 className="font-semibold text-xl">Community Driven</h3>
                            <p className="mt-2 text-gray-400">
                                Collaborate and share custom roadmaps with a growing community.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={featureCardVariants}
                            whileHover="hover"
                            className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                        >
                            <FaChartLine className="mx-auto mb-4 text-red-400 text-5xl" />
                            <h3 className="font-semibold text-xl">AI-Powered Insights</h3>
                            <p className="mt-2 text-gray-400">
                                Get personalized AI-generated roadmap recommendations based on
                                your goals.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={featureCardVariants}
                            whileHover="hover"
                            className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                        >
                            <FaCheckCircle className="mx-auto mb-4 text-green-400 text-5xl" />
                            <h3 className="font-semibold text-xl">1000+ Roadmaps</h3>
                            <p className="mt-2 text-gray-400">
                                A vast collection of expert-curated learning paths.
                            </p>
                        </motion.div>

                        <motion.div
                            variants={featureCardVariants}
                            whileHover="hover"
                            className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                        >
                            <FaLaptopCode className="mx-auto mb-4 text-blue-400 text-5xl" />
                            <h3 className="font-semibold text-xl">Live Project Learning</h3>
                            <p className="mt-2 text-gray-400">
                                Hands-on projects to apply your learning in real-world
                                scenarios.
                            </p>
                        </motion.div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-12 text-center"
                    >
                        <div className="inline-block bg-gray-800 shadow-lg p-8 rounded-lg">
                            <h2 className="font-bold text-blue-400 text-2xl">
                                Get Started with Roadmap Builder
                            </h2>
                            <p className="mt-2 text-gray-400">
                                check about us and know about Roadmap Builder
                            </p>
                            <Link to="/about">
                                <button className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-700 shadow-lg mx-auto mt-4 px-6 py-3 rounded-full font-bold text-white transition">
                                    <FaSignInAlt className="text-xl" />
                                    <span>About us.</span>
                                </button>
                            </Link>
                        </div>
                    </motion.section>

                    {modalContent && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        >
                            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center relative">
                                <button
                                    onClick={closeModal}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                >
                                    &times;
                                </button>
                                <h3 className="text-blue-400 text-2xl font-bold">{modalContent.title}</h3>
                                <p className="text-gray-400 mt-2">{modalContent.description}</p>
                            </div>
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    );
}

