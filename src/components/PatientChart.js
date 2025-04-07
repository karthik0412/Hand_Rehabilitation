import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
} from "chart.js";

// Register necessary chart components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const PatientChart = ({ patientID }) => {
    const chartData = {
        labels: ["01-Jul", "02-Jul", "03-Jul"],
        datasets: [
            {
                label: "Flex Sensor (°)",
                data: [45, 50, 55],
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                borderWidth: 3,
                tension: 0.4, // Smooth curve
                pointRadius: 5,
                pointBackgroundColor: "#4CAF50"
            },
            {
                label: "Force Sensor (N)",
                data: [10, 12, 15],
                borderColor: "#FF5733",
                backgroundColor: "rgba(255, 87, 51, 0.2)",
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: "#FF5733"
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
                labels: {
                    font: { size: 14 },
                    color: "#333"
                }
            },
            tooltip: {
                backgroundColor: "#fff",
                titleColor: "#333",
                bodyColor: "#555",
                borderColor: "#ddd",
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "#333", font: { size: 12 } }
            },
            y: {
                grid: { color: "rgba(200, 200, 200, 0.3)" },
                ticks: { color: "#333", font: { size: 12 } }
            }
        }
    };

    return (
        <div style={{ padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
            <h2 style={{ textAlign: "center", color: "#333", marginBottom: "10px" }}>📊 Patient Sensor Data</h2>
            <div style={{ height: "300px" }}>
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default PatientChart;

