import React, { useState, useEffect, useMemo } from 'react';
import { database, ref, onValue } from './components/firebase';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Clinical thresholds
const FLEXION_RANGES = {
  NEUTRAL: { min: 0, max: 112, label: "Neutral Posture", color: "#e74c3c" },
  MID_FLEXION: { min: 113, max: 225, label: "Mid-range Flexion", color: "#f39c12" },
  FULL_FLEXION: { min: 226, max: 338, label: "Full Flexion", color: "#27ae60" }
};

const MEDICAL_METRICS = {
  AROM: {
    description: "Active Range of Motion (Patient-initiated movement)",
    calculate: (flexValue) => flexValue > FLEXION_RANGES.NEUTRAL.max
  },
  PROM: {
    description: "Passive Range of Motion (Therapist-assisted movement)",
    calculate: (flexValue) => flexValue > FLEXION_RANGES.MID_FLEXION.min
  },
  GRASP: {
    description: "Grip strength (Force > 2N indicates functional grasp)",
    calculate: (forceValue) => forceValue > 2
  },
  FINE_MOTOR: {
    description: "Precision control (Mid-range flexion with stability)",
    calculate: (flexValue) => 
      flexValue >= FLEXION_RANGES.MID_FLEXION.min && 
      flexValue <= FLEXION_RANGES.MID_FLEXION.max
  }
};

const HandRehabDashboard = () => {
  const [sensorData, setSensorData] = useState([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dataLoading, setDataLoading] = useState(true);

  const fingers = useMemo(() => [
    { id: 'thumb', name: 'Thumb', key: 'flex1', color: '#FF5733' },
    { id: 'index', name: 'Index', key: 'flex2', color: '#33FF57' },
    { id: 'middle', name: 'Middle', key: 'flex3', color: '#3383FF' },
    { id: 'ring', name: 'Ring', key: 'flex4', color: '#FF33A8' },
    { id: 'pinky', name: 'Pinky', key: 'flex5', color: '#8E44AD' }
  ], []);

  const getFlexionStatus = (flexValue) => {
    if (flexValue <= FLEXION_RANGES.NEUTRAL.max) return FLEXION_RANGES.NEUTRAL;
    if (flexValue <= FLEXION_RANGES.MID_FLEXION.max) return FLEXION_RANGES.MID_FLEXION;
    return FLEXION_RANGES.FULL_FLEXION;
  };

  const calculateAverage = (dataKey) => {
    if (!sensorData.length) return 0;
    const values = sensorData.map(item => item[dataKey]).filter(val => val !== null);
    if (!values.length) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return (sum / values.length).toFixed(2);
  };

  const renderChart = (title, dataKey, lines, yDomain) => {
    const averages = lines.map(line => ({
      name: line.name,
      value: calculateAverage(line.key),
      color: line.color
    }));

    return (
      <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginBottom: '15px' }}>{title}</h3>
        
        {/* Average values row */}
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#f8f9fa',
          borderRadius: '5px'
        }}>
          {averages.map(avg => (
            <div key={avg.name} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: avg.color,
                marginRight: '8px',
                borderRadius: '2px'
              }}></div>
              <span style={{ fontSize: '14px' }}>
                <strong>{avg.name}:</strong> {avg.value}
              </span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sensorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} />
            <YAxis domain={yDomain} />
            <Tooltip />
            <Legend />
            {lines.map(line => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={false}
                connectNulls={true}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderMedicalMetrics = (fingerId) => {
    if (!sensorData.length) return <p>No data available</p>;
    
    const latest = sensorData[sensorData.length - 1];
    const flexKey = `flex${fingerId.charAt(0).toUpperCase() + fingerId.slice(1)}`;
    const flexValue = latest[flexKey] || 0;
    const flexionStatus = getFlexionStatus(flexValue);

    return (
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Clinical Assessment</h3>
        
        <div style={{ margin: '15px 0' }}>
          <strong>Flexion Status: </strong>
          <span style={{ 
            color: flexionStatus.color,
            fontWeight: 'bold'
          }}>
            {flexionStatus.label} ({flexValue} units)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px' }}>
            <div style={{ color: latest.forceValue > 2 ? '#27ae60' : '#e74c3c', marginBottom: '5px' }}>
              <strong>Grasp Strength: </strong>
              {latest.forceValue > 2 ? '✅ Adequate' : '❌ Weak'} ({latest.forceValue.toFixed(2)}N)
            </div>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
              {MEDICAL_METRICS.GRASP.description}
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px' }}>
            <div style={{ color: flexValue > FLEXION_RANGES.NEUTRAL.max ? '#27ae60' : '#e74c3c', marginBottom: '5px' }}>
              <strong>AROM: </strong>
              {flexValue > FLEXION_RANGES.NEUTRAL.max ? '✅ Achieved' : '❌ Not Achieved'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
              {MEDICAL_METRICS.AROM.description}
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px' }}>
            <div style={{ color: flexValue > FLEXION_RANGES.MID_FLEXION.min ? '#27ae60' : '#e74c3c', marginBottom: '5px' }}>
              <strong>PROM: </strong>
              {flexValue > FLEXION_RANGES.MID_FLEXION.min ? '✅ Achieved' : '❌ Not Achieved'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
              {MEDICAL_METRICS.PROM.description}
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '5px' }}>
            <div style={{ 
              color: (flexValue >= FLEXION_RANGES.MID_FLEXION.min && 
                     flexValue <= FLEXION_RANGES.MID_FLEXION.max) ? '#27ae60' : '#e74c3c', 
              marginBottom: '5px'
            }}>
              <strong>Fine Motor: </strong>
              {(flexValue >= FLEXION_RANGES.MID_FLEXION.min && 
                flexValue <= FLEXION_RANGES.MID_FLEXION.max) ? '✅ Present' : '❌ Impaired'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
              {MEDICAL_METRICS.FINE_MOTOR.description}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFingerPage = (fingerId) => {
    const finger = fingers.find(f => f.id === fingerId);
    if (!finger) return null;

    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: finger.color }}>
          {finger.name} Finger Rehabilitation
        </h2>

        {renderChart(
          `${finger.name} Finger Flexion`,
          'time',
          [{ key: finger.key, name: 'Flexion Value', color: finger.color }],
          [0, 350]
        )}

        {renderChart(
          'Force Sensor Data',
          'time',
          [{ key: 'forceValue', name: 'Force (N)', color: '#F39C12' }],
          [0, 10]
        )}

        {renderChart(
          'MPU6050 Acceleration Data',
          'time',
          [
            { key: 'accelX', name: 'Accel X', color: '#3383FF' },
            { key: 'accelY', name: 'Accel Y', color: '#FF3383' },
            { key: 'accelZ', name: 'Accel Z', color: '#33FFF3' }
          ],
          [-10, 10]
        )}

        {renderMedicalMetrics(finger.id)}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          <button 
            onClick={() => setCurrentPage('dashboard')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3f51b5',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const sensorRef = ref(database, 'SensorData');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDataLoading(false);
        
        const newData = {
          time: new Date().toLocaleTimeString(),
          // Flex Sensors
          flex1: data.FlexSensor?.Flex1?.RawValue ?? null,
          flex2: data.FlexSensor?.Flex2?.RawValue ?? null,
          flex3: data.FlexSensor?.Flex3?.RawValue ?? null,
          flex4: data.FlexSensor?.Flex4?.RawValue ?? null,
          flex5: data.FlexSensor?.Flex5?.RawValue ?? null,
          // Force Sensor
          forceValue: data.ForceSensor?.RawValue ?? 0,
          // MPU6050 Data
          accelX: data.MPU6050?.Acceleration_X ?? 0,
          accelY: data.MPU6050?.Acceleration_Y ?? 0,
          accelZ: data.MPU6050?.Acceleration_Z ?? 0,
          gyroX: data.MPU6050?.Gyro_X ?? 0,
          gyroY: data.MPU6050?.Gyro_Y ?? 0,
          gyroZ: data.MPU6050?.Gyro_Z ?? 0
        };
        
        setSensorData(prev => [...prev.slice(-30), newData]);
      }
    });
    return () => unsubscribe();
  }, [fingers]);

  if (dataLoading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading sensor data...</div>;
  }

  if (currentPage !== 'dashboard') {
    return renderFingerPage(currentPage);
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Hand Rehabilitation Dashboard</h2>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '10px', 
        justifyContent: 'center',
        marginBottom: '30px'
      }}>
        {fingers.map(finger => (
          <button
            key={finger.id}
            onClick={() => setCurrentPage(finger.id)}
            style={{
              padding: '12px 24px',
              backgroundColor: finger.color,
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {finger.name} Finger
          </button>
        ))}
      </div>

      {renderChart(
        'All Finger Flexion Data',
        'time',
        fingers.map(f => ({
          key: f.key,
          name: f.name,
          color: f.color
        })),
        [0, 350]
      )}

      {renderChart(
        'Force Sensor Data',
        'time',
        [{ key: 'forceValue', name: 'Force (N)', color: '#F39C12' }],
        [0, 10]
      )}

      {renderChart(
        'MPU6050 Acceleration Data',
        'time',
        [
          { key: 'accelX', name: 'Accel X', color: '#3383FF' },
          { key: 'accelY', name: 'Accel Y', color: '#FF3383' },
          { key: 'accelZ', name: 'Accel Z', color: '#33FFF3' }
        ],
        [-10, 10]
      )}
    </div>
  );
};

export default HandRehabDashboard;