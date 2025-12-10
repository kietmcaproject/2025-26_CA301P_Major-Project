import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import problems from "../assets/problems.json";

const Editorial = () => {
	const { id } = useParams();
	const [editorial, setEditorial] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const problem = problems.find((p) => p.id === parseInt(id));

	useEffect(() => {
		const fetchEditorial = async () => {
			setLoading(true);
			setError("");
			try {
				const res = await fetch(
					`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/gemini/editorial/${id}`
				);
				const data = await res.json();
				if (res.ok) {
					setEditorial(data.editorial);
				} else {
					setError(data.message || "Failed to fetch editorial");
				}
			} catch (err) {
				setError("Network error");
			}
			setLoading(false);
		};
		fetchEditorial();
	}, [id]);

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
					Editorial: {problem?.title || "Problem"}
				</h2>
				<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
					{loading ? (
						<div className="text-center text-gray-500">Thinking...</div>
					) : error ? (
						<div className="text-center text-red-500">{error}</div>
					) : (
						<pre className="whitespace-pre-wrap text-gray-800 text-base">
							{editorial}
						</pre>
					)}
				</div>
			</div>
		</div>
	);
};

export default Editorial;
