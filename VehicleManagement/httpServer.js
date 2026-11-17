import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

// In-memory storage (no database)
const vehicles = [
  { id: 1, vehicleName: 'Hyundai Creta', vehicleNumber: 'HR26AB1234', type: 'SUV', price: 1500000 },
  { id: 2, vehicleName: 'Maruti Swift', vehicleNumber: 'DL8CAF5030', type: 'Hatchback', price: 750000 },
  { id: 3, vehicleName: 'Honda City', vehicleNumber: 'UP14CD9876', type: 'Sedan', price: 1200000 }
];

const REQUIRED_FIELDS = ['id', 'vehicleName', 'vehicleNumber', 'type', 'price'];

const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
};

const sendHtml = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // GET /
  if (method === 'GET' && url === '/') {
    return sendHtml(res, 200, `
      <h1>Welcome to Vehicle Management System</h1>
      <ul>
        <li><a href="/vehicles">Vehicles</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/info">Info</a></li>
      </ul>`);
  }

  // GET /vehicles
  if (method === 'GET' && url === '/vehicles') {
    return sendJson(res, 200, vehicles);
  }

  // GET /about
  if (method === 'GET' && url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('Vehicle Management App - built with the Node.js HTTP module.');
  }

  // GET /info -> static file using fs.readFile()
  if (method === 'GET' && url === '/info') {
    const filePath = path.join(__dirname, 'public', 'info.html');
    return fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 - Internal Server Error: Unable to read info.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  }

  // POST /add-vehicle
  if (method === 'POST' && url === '/add-vehicle') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });

    req.on('end', () => {
      let vehicle;
      try {
        vehicle = JSON.parse(body);
      } catch (error) {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }

      const missing = REQUIRED_FIELDS.filter(
        (field) => vehicle[field] === undefined || vehicle[field] === null || vehicle[field] === ''
      );
      if (missing.length > 0) {
        return sendJson(res, 400, { error: `Missing required fields: ${missing.join(', ')}` });
      }

      const newVehicle = {
        id: vehicle.id,
        vehicleName: vehicle.vehicleName,
        vehicleNumber: vehicle.vehicleNumber,
        type: vehicle.type,
        price: vehicle.price
      };
      vehicles.push(newVehicle);
      return sendJson(res, 201, { message: 'Vehicle added successfully', vehicle: newVehicle });
    });
    return;
  }

  // Anything else -> 404
  sendJson(res, 404, { error: '404 - Route not found' });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});