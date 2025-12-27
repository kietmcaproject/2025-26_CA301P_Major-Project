    import React from "react";
    import { FaGlobe, FaHeart } from "react-icons/fa";

    export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-950 py-6 text-white">
        <div className="mx-auto text-center container">
            <p className="mt-3 text-gray-500 text-sm">
            © {currentYear} CodHelp. All rights reserved.
            </p>
        </div>
        </footer>
    );
    }
