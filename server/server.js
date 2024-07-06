const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());  // Enable CORS
app.use(express.json());

let windowSize = 10;  // Default window size
const numbers = { p: [], f: [], e: [], r: [] };

// Fetch a number from a third-party API based on the category
const fetchNumber = async (category) => {
    let apiUrl;

    switch (category) {
        case 'p':
            apiUrl = 'http://20.244.56.144/test/prime';  // Replace with actual Prime Number API
            break;
        case 'f':
            apiUrl = 'http://20.244.56.144/test/fibonacci';  // Replace with actual Fibonacci Number API
            break;
        case 'e':
            apiUrl = 'http://20.244.56.144/test/even';  // Replace with actual Even Number API
            break;
        case 'r':
            apiUrl = 'http://20.244.56.144/test/random';  // Replace with actual Random Number API
            break;
        default:
            throw new Error('Invalid category');
    }

    const response = await axios.get(apiUrl);
    return response.data.number;  // Assuming the API returns { number: <number> }
};

// Add a number to the list based on the category
app.post('/numbers/:numberId', async (req, res) => {
    const numberId = req.params.numberId;

    try {
        const number = await fetchNumber(numberId);
        numbers[numberId].push(number);

        if (numbers[numberId].length > windowSize) {
            numbers[numberId].shift();
        }

        const numbersBefore = numbers[numberId].slice(0, -1);
        const numbersAfter = numbers[numberId];
        const average = numbers[numberId].reduce((acc, num) => acc + num, 0) / numbers[numberId].length;

        res.json({
            message: 'Number added successfully',
            numberId,
            number,
            numbersBefore,
            numbersAfter,
            average
        });
    } catch (error) {
        console.error('Error fetching number from API:', error);
        res.status(500).json({ error: 'Failed to fetch number from API' });
    }
});

// Configure the window size
app.post('/configure-window', (req, res) => {
    const { windowSize: newSize } = req.body;

    if (Number.isInteger(newSize) && newSize > 0) {
        windowSize = newSize;
        res.json({ message: 'Window size configured successfully', windowSize });
    } else {
        res.status(400).json({ error: 'Invalid window size' });
    }
});

// Fetch the current window size
app.get('/configure-window', (req, res) => {
    res.json({ windowSize });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// For any request that doesn't match an API route, send back the index.html file from the React build
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start the server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
