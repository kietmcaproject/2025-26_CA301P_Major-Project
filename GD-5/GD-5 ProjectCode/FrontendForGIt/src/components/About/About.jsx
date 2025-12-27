    import React from "react";
    import { motion } from "framer-motion";
    import {
    FaMap,
    FaCodeBranch,
    FaUsers,
    FaChartLine,
    FaCheckCircle,
    FaLaptopCode,
    FaGlobe,
    FaChartPie,
    } from "react-icons/fa";
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "../navbar/Navbar";
    import Logoarea from "../logoarea/Logoarea";
    import { Link } from "react-router-dom";
    import Footer from "../Footer/Footer";

    export default function About() {
    return (
        <>
        {/* <Logoarea /> */}
        <Navbar />
        <motion.section
            className="bg-gray-900 px-6 md:px-20 py-16 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* Hero Section */}
            <motion.div
            className="mb-12 text-center"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            >
            <h1 className="font-bold text-blue-500 text-4xl">
                Welcome to codHelp
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-gray-300 text-lg">
                A dynamic and interactive platform designed to help learners and
                professionals **visualize structured learning paths** for both
                **tech and non-tech fields**. Our roadmap generator helps you plan
                your journey step-by-step using AI-powered insights.
            </p>
            </motion.div>

            {/* Dashboard Layout - Features */}
            <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 text-center">
            {/* Card 1 */}
            <motion.div
                className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                whileHover={{ scale: 1.05 }}
            >
                <FaMap className="mx-auto mb-4 text-blue-400 text-5xl" />
                <h3 className="font-semibold text-xl">Interactive Roadmaps</h3>
                <p className="mt-2 text-gray-400">
                Generate **dynamic flowchart-based roadmaps** to guide your
                learning process.
                </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
                className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                whileHover={{ scale: 1.05 }}
            >
                <FaCodeBranch className="mx-auto mb-4 text-green-400 text-5xl" />
                <h3 className="font-semibold text-xl">Tech & Non-Tech Fields</h3>
                <p className="mt-2 text-gray-400">
                Explore structured learning paths for **development, business,
                finance, and more**.
                </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
                className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                whileHover={{ scale: 1.05 }}
            >
                <FaUsers className="mx-auto mb-4 text-yellow-400 text-5xl" />
                <h3 className="font-semibold text-xl">Community Driven</h3>
                <p className="mt-2 text-gray-400">
                Share your roadmaps and collaborate with a **growing community**.
                </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
                className="bg-gray-800 shadow-lg hover:shadow-2xl p-6 rounded-lg transition"
                whileHover={{ scale: 1.05 }}
            >
                <FaChartLine className="mx-auto mb-4 text-red-400 text-5xl" />
                <h3 className="font-semibold text-xl">AI-Powered Insights</h3>
                <p className="mt-2 text-gray-400">
                Get personalized **AI-generated roadmap recommendations** based on
                your goals.
                </p>
            </motion.div>
            </div>

            {/* Statistics Section */}
            <motion.div
            className="bg-gray-800 shadow-lg mt-16 p-8 rounded-lg text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            >
            <h2 className="font-semibold text-blue-400 text-3xl">
                Roadmap Builder Stats
            </h2>
            <p className="mt-2 text-gray-400">
                Join a thriving platform designed to guide your learning journey.
            </p>
            <div className="gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-6">
                {/* Stat 1 */}
                <motion.div
                className="bg-gray-900 shadow-lg p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
                >
                <FaCheckCircle className="mx-auto mb-2 text-green-400 text-4xl" />
                <h3 className="font-bold text-xl">1000+</h3>
                <p className="text-gray-400">Curated Roadmaps</p>
                </motion.div>

                {/* Stat 2 */}
                <motion.div
                className="bg-gray-900 shadow-lg p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
                >
                <FaLaptopCode className="mx-auto mb-2 text-blue-400 text-4xl" />
                <h3 className="font-bold text-xl">500+</h3>
                <p className="text-gray-400">Tech Learning Paths</p>
                </motion.div>

                {/* Stat 3 */}
                <motion.div
                className="bg-gray-900 shadow-lg p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
                >
                <FaGlobe className="mx-auto mb-2 text-yellow-400 text-4xl" />
                <h3 className="font-bold text-xl">50+</h3>
                <p className="text-gray-400">Countries Using It</p>
                </motion.div>

                {/* Stat 4 */}
                <motion.div
                className="bg-gray-900 shadow-lg p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
                >
                <FaChartPie className="mx-auto mb-2 text-red-400 text-4xl" />
                <h3 className="font-bold text-xl">90%</h3>
                <p className="text-gray-400">Satisfaction Rate</p>
                </motion.div>
            </div>
            </motion.div>

            {/* Call-to-Action */}
            <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            >
            <h2 className="font-bold text-blue-500 text-3xl">
                Start Building Your Roadmap Today!
            </h2>
            <p className="mt-2 text-gray-400">
                Join thousands of learners and take control of your education
                journey.
            </p>
            <Link to="/">
                <motion.button
                className="bg-blue-500 hover:bg-blue-700 shadow-lg mt-6 px-6 py-3 rounded-full font-bold text-white transition"
                whileHover={{ scale: 1.1 }}
                >
                Get Started Now
                </motion.button>
            </Link>
            </motion.div>
        </motion.section>
        <section>
            <Footer />
        </section>
        </>
    );
    }
