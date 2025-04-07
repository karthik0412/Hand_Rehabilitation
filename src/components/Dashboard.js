import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientTable from "./PatientTable";
import PatientChart from "./PatientChart";

const Dashboard = () => {
    const navigate = useNavigate();
    const [patientID, setPatientID] = useState("patient_001");

    return (
        <div className="dashboard-container">
            <h1>🏥 Doctor Dashboard</h1>
            <button onClick={() => navigate("/")}>Logout</button>

            <label>Select Patient:</label>
            <select onChange={(e) => setPatientID(e.target.value)}>
                <option value="patient_001">Patient 1</option>
                <option value="patient_002">Patient 2</option>
            </select>

            <PatientTable patientID={patientID} />
            <PatientChart patientID={patientID} />
        </div>
    );
};

export default Dashboard;
