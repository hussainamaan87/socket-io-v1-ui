import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Use the Render URL for the backend
// const socket = io('https://socket-io-v1.onrender.com'); // Update with your Render URL
const socket = io('http://localhost:5000/');
const App = () => {
    const [data, setData] = useState({}); // Data for all cities
    const [cities, setCities] = useState([]); // Array of city names
    const [cityName, setCityName] = useState(''); // Input for new city

    useEffect(() => {
        // Listen for updates from the server
        socket.on('update-data', (newData) => {
            console.log('Received data:', newData);
            setData((prevData) => ({
                ...prevData,
                [newData.cityName]: newData, // Merge new city data into state
            }));
        });

        return () => {
            // Clean up listeners when the component unmounts
            socket.off('update-data');
        };
    }, []);

    const handleCitySubmit = () => {
        if (cityName && !cities.includes(cityName)) {
            setCities((prevCities) => [...prevCities, cityName]); // Add city to the list
            socket.emit('fetch-city-data', cityName); // Request data for the new city
            setCityName(''); // Clear input
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Real-Time Air Quality Data</h1>

            {/* Input field to add a city */}
            <div>
                <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Enter city name"
                    style={{ padding: '10px', fontSize: '16px', width: '200px' }}
                />
                <button
                    onClick={handleCitySubmit}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        marginLeft: '10px',
                        cursor: 'pointer',
                    }}
                >
                    Add City
                </button>
            </div>

            {/* Render data for all subscribed cities */}
            {cities.length > 0 ? (
                cities.map((city) => (
                    <div key={city} style={{ marginBottom: '40px' }}>
                        <h2>{city}</h2>
                        {data[city] ? (
                            <table style={{ margin: '0 auto', borderCollapse: 'collapse', width: '80%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Sensor ID</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Data</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Name</th>
                                        <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data[city].data.cities[0].airComponents.map((component, idx) => (
                                        <tr key={idx}>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{component.senDevId}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{component.sensorData}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{component.sensorName}</td>
                                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{component.sensorUnit || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Loading data for {city}...</p>
                        )}
                    </div>
                ))
            ) : (
                <p>No cities added yet.</p>
            )}
        </div>
    );
};

export default App;
