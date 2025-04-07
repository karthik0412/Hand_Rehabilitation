import React, { useState, useEffect } from "react";
import { database, ref, onValue } from "./firebase";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import gloveImage from './glove.png'; // Background glove image

const HIGH_FLEX_THRESHOLD = 650;
const LOW_FLEX_THRESHOLD = 300;

const getHandMovement = (accelerationX, accelerationY, accelerationZ, gyroX, flexValue) => {
  let movements = [];
  if (flexValue >= HIGH_FLEX_THRESHOLD) movements.push("Flexion");
  if (flexValue <= LOW_FLEX_THRESHOLD) movements.push("Extension");
  if (accelerationX > 0.8) movements.push("Ulnar Deviation");
  if (accelerationX < -0.5) movements.push("Radial Deviation");
  if (accelerationY > 0.8) movements.push("Dorsiflexion");
  if (accelerationY < -0.5) movements.push("Palmar Flexion");
  if (accelerationZ > 0.8) movements.push("Supination");
  if (accelerationZ < -0.5) movements.push("Pronation");
  if (gyroX > 0.5) movements.push("External Rotation");
  if (gyroX < -0.5) movements.push("Internal Rotation");
  return movements.length > 0 ? movements.join(", ") : "Neutral Position";
};

const HandRehabDashboard = () => {
  const [sensorData, setSensorData] = useState([]);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const sensorRef = ref(database, "SensorData");
    onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData(prev => [
          ...prev.slice(-30),
          {
            time: new Date().toLocaleTimeString(),
            flexValue: data.FlexSensor.RawValue,
            voltage: data.FlexSensor.Voltage,
            accelerationX: data.MPU6050.Acceleration_X,
            accelerationY: data.MPU6050.Acceleration_Y,
            accelerationZ: data.MPU6050.Acceleration_Z,
            gyroX: data.MPU6050.Gyro_X,
            gyroY: data.MPU6050.Gyro_Y,
            gyroZ: data.MPU6050.Gyro_Z,
            movement: getHandMovement(
              data.MPU6050.Acceleration_X,
              data.MPU6050.Acceleration_Y,
              data.MPU6050.Acceleration_Z,
              data.MPU6050.Gyro_X,
              data.FlexSensor.RawValue
            )
          }
        ]);
      }
    });
  }, []);

  const avg = (key) =>
    (sensorData.reduce((sum, item) => sum + item[key], 0) / sensorData.length || 0).toFixed(2);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", backgroundColor: "#f4f6f9", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Hand Rehabilitation Dashboard</h2>

      {!showSummary ? (
        <>
          {/* Main Dashboard */}
          <h3>Flex Sensor Data</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="flexValue" stroke="#FF5733" name="Raw Value" />
              <Line type="monotone" dataKey="voltage" stroke="#33FF57" name="Voltage" />
            </LineChart>
          </ResponsiveContainer>

          <h3>Acceleration Data</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="accelerationX" stroke="#3383FF" name="Accel X" />
              <Line type="monotone" dataKey="accelerationY" stroke="#FF3383" name="Accel Y" />
              <Line type="monotone" dataKey="accelerationZ" stroke="#33FFF3" name="Accel Z" />
            </LineChart>
          </ResponsiveContainer>

          <h3>Gyroscope Data</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sensorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="gyroX" stroke="#F39C12" name="Gyro X" />
              <Line type="monotone" dataKey="gyroY" stroke="#8E44AD" name="Gyro Y" />
              <Line type="monotone" dataKey="gyroZ" stroke="#27AE60" name="Gyro Z" />
            </LineChart>
          </ResponsiveContainer>

          <h3>Movement Analysis</h3>
          <div style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "5px",
            backgroundColor: "#ffffff",
            textAlign: "center",
            fontSize: "18px"
          }}>
            <strong>Current Movement: </strong>
            {sensorData[sensorData.length - 1]?.movement || "Loading..."}
          </div>

          <button onClick={() => setShowSummary(true)} style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#3f51b5",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}>
            Next Page ➜
          </button>
        </>
      ) : (
        <>
          {/* Summary Page with Background */}
          <div style={{
            backgroundImage: `url(${gloveImage})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "40px"
          }}>
            <div style={{
              maxWidth: "460px",
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(6px)",
              padding: "30px",
              borderRadius: "12px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
              textAlign: "left"
            }}>
              <h3 style={{ textAlign: "center", marginBottom: "20px" }}>Average Sensor Values</h3>
              <ul style={{ listStyle: "none", padding: 0, fontSize: "18px", lineHeight: "1.8" }}>
                <li><strong>Flex Value:</strong> {avg("flexValue")}</li>
                <li><strong>Voltage:</strong> {avg("voltage")} V</li>
                <li><strong>Acceleration X:</strong> {avg("accelerationX")}</li>
                <li><strong>Acceleration Y:</strong> {avg("accelerationY")}</li>
                <li><strong>Acceleration Z:</strong> {avg("accelerationZ")}</li>
                <li><strong>Gyro X:</strong> {avg("gyroX")}</li>
                <li><strong>Gyro Y:</strong> {avg("gyroY")}</li>
                <li><strong>Gyro Z:</strong> {avg("gyroZ")}</li>
              </ul>
            </div>
          </div>

          {/* Medical Movement Summary */}
          <div style={{
            marginTop: "-20px",
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#ffffff",
            maxWidth: "1000px",
            margin: "0 auto",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginBottom: "15px" }}>Medical Movement Summary</h3>
            <div style={{ fontSize: "18px", lineHeight: "1.6" }}>
              <span style={{ color: "#FF5733", fontWeight: "bold" }}>
                {avg("flexValue") > 650 ? "Flexion" : avg("flexValue") < 300 ? "Extension" : "Neutral"}
              </span>{" "}
              |{" "}
              <span style={{ color: "#3383FF", fontWeight: "bold" }}>
                {avg("accelerationX") > 0.8 ? "Ulnar Deviation" : avg("accelerationX") < -0.5 ? "Radial Deviation" : ""}
              </span>{" "}
              |{" "}
              <span style={{ color: "#FF3383", fontWeight: "bold" }}>
                {avg("accelerationY") > 0.8 ? "Dorsiflexion" : avg("accelerationY") < -0.5 ? "Palmar Flexion" : ""}
              </span>{" "}
              |{" "}
              <span style={{ color: "#33FFF3", fontWeight: "bold" }}>
                {avg("accelerationZ") > 0.8 ? "Supination" : avg("accelerationZ") < -0.5 ? "Pronation" : ""}
              </span>{" "}
              |{" "}
              <span style={{ color: "#F39C12", fontWeight: "bold" }}>
                {avg("gyroX") > 0.5 ? "External Rotation" : avg("gyroX") < -0.5 ? "Internal Rotation" : ""}
              </span>
            </div>
          </div>

          {/* Back Button */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button onClick={() => setShowSummary(false)} style={{
              padding: "10px 30px",
              backgroundColor: "#3f51b5",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer"
            }}>
              ← Back to Dashboard
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default HandRehabDashboard;
