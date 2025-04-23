import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Transactions from "../Transactions/Transactions";
import Names from "../Names/Names";

const Split = () => {
	const navigate = useNavigate();
	const { groupId } = useParams();

	const [activeTab, setActiveTab] = useState("names");
	const [groupData, setGroupData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		try {
			const { exp } = jwtDecode(token);
			if (Date.now() >= exp * 1000) {
				localStorage.removeItem("token");
				navigate("/login");
				return;
			}
		} catch (error) {
			console.error("Invalid token", error);
			navigate("/login");
			return;
		}

		const fetchGroupData = async () => {
			try {
				const response = await axios.get(
					`http://localhost:3000/api/groups/${groupId}`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				setGroupData(response.data);
			} catch (err) {
				console.error("Error fetching group data:", err);
				setError("Failed to load group data");
			} finally {
				setLoading(false);
			}
		};

		fetchGroupData();
	}, [navigate, groupId]);

	const handleCalculateResults = async () => {
		try {
			const token = localStorage.getItem("token");
			await axios.post(
				`http://localhost:3000/api/groups/${groupId}/calculate`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			navigate(`/groups/${groupId}/results`);
		} catch (error) {
			console.error("Error calculating results:", error);
			setError(
				"Failed to calculate results. Please ensure all data is entered correctly."
			);
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
				<p className="mt-4 text-gray-600">Loading group data...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<div className="bg-white shadow rounded-lg overflow-hidden">
					{/* Header with group name */}
					<div className="bg-blue-600 px-6 py-4">
						<div className="flex items-center justify-between">
							<h1 className="text-xl font-bold text-white">
								{groupData?.name || "Split Expenses"}
							</h1>
							<button
								onClick={() => navigate("/groups")}
								className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>
					</div>

					{/* Tab navigation */}
					<div className="border-b border-gray-200">
						<nav className="flex -mb-px">
							<button
								onClick={() => setActiveTab("names")}
								className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
									activeTab === "names"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								People
							</button>
							<button
								onClick={() => setActiveTab("transactions")}
								className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex-1 ${
									activeTab === "transactions"
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								Expenses
							</button>
						</nav>
					</div>

					{/* Error message */}
					{error && (
						<div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
							<p>{error}</p>
						</div>
					)}

					{/* Content area */}
					<div className="p-4">
						{activeTab === "names" ? (
							<Names groupId={groupId} />
						) : (
							<Transactions groupId={groupId} />
						)}
					</div>

					{/* Action buttons */}
					<div className="px-6 py-4 bg-gray-50 flex justify-between">
						<button
							onClick={() => navigate(`/groups/${groupId}`)}
							className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							onClick={handleCalculateResults}
							className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
						>
							Calculate Results
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Split;
