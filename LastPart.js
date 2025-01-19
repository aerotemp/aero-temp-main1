// Import the external CSS file
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'LastPart.css';  // Ensure this file exists in the correct directory
document.head.appendChild(link);

// WebSocket connection to your Python server
const socket = new WebSocket('ws://127.0.0.1:5001');

document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('temperatureChart').getContext('2d');

    let temperatureData = [];  // Stores the temperature values
    let timeData = [];         // Stores the timestamps or X-axis labels
    const maxDataPoints = 10;  // Maximum number of points to display
    let isPaused = false;      // Pause state variable

    const tempChart = new Chart(ctx, {
        type: 'line',  // Line chart for temperature data
        data: {
            labels: timeData,  // X-axis labels (timestamps)
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatureData,  // Y-axis data (temperature values)
                fill: false,
                borderColor: 'rgb(75, 192, 192)',  // Line color
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 500  // Smooth transitions
            },
            scales: {
                x: {
                    type: 'category',  // Treat X-axis as categorical (timestamps)
                    position: 'bottom'
                },
                y: {
                    min: 0,  // Set min temperature to 0 (or adjust as needed)
                    max: 50  // Set max temperature (based on your sensor range)
                }
            }
        }
    });

    // WebSocket event handlers
    socket.onopen = function () {
        console.log('WebSocket connection established');
    };

    socket.onmessage = function (event) {
        if (!isPaused) {
            console.log("Received data:", event.data);

            const temperature = parseFloat(event.data);  // Convert the received string to a float number

            if (!isNaN(temperature)) {
                const timestamp = new Date().toLocaleTimeString();

                temperatureData.push(temperature);
                timeData.push(timestamp);

                if (temperatureData.length > maxDataPoints) {
                    temperatureData.shift();  // Remove the oldest temperature
                    timeData.shift();         // Remove the oldest timestamp
                }

                tempChart.data.labels = timeData;
                tempChart.data.datasets[0].data = temperatureData;
                tempChart.update();

                // Update temperature display with white color and position
                const tempDisplay = document.getElementById('data');
                tempDisplay.innerText = `${temperature}°C`;
                tempDisplay.style.color = "#FFFFFF";
                tempDisplay.style.position = "absolute";
                tempDisplay.style.top = "20px";
                tempDisplay.style.left = "20px";
                tempDisplay.style.fontSize = "2rem";
                tempDisplay.style.fontWeight = "bold";
                tempDisplay.style.zIndex = "999";  // Ensure it stays above other elements
            } else {
                console.warn("Invalid data received:", event.data);
            }
        }
    };

    socket.onerror = function (event) {
        console.error('WebSocket error:', event);
    };

    socket.onclose = function () {
        console.warn('WebSocket connection closed');
        document.getElementById('data').innerText = "Connection lost. Reconnecting...";
        setTimeout(() => {
            location.reload();
        }, 5000);
    };

    // Create and style the pause/resume button dynamically
    const pauseButton = document.createElement('div');
    pauseButton.id = 'pauseButton';
    pauseButton.innerHTML = `<i class="fa fa-pause"></i>`;  // Initial icon is pause

    // Toggle pause/resume on click
    pauseButton.addEventListener('click', function () {
        isPaused = !isPaused;
        pauseButton.innerHTML = isPaused ? `<i class="fa fa-play"></i>` : `<i class="fa fa-pause"></i>`;
        console.log(isPaused ? "Chart updates paused" : "Chart updates resumed");
    });

    // Append button to the body once
    document.body.appendChild(pauseButton);
});
