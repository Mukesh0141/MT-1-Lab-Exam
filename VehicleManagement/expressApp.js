import express from 'express';

const app = express();
const PORT = 4000;

// Parse incoming JSON bodies into req.body
app.use(express.json());

// In-memory storage (no database)
let vehicles = [
  { id: 1, vehicleName: 'Hyundai Creta', vehicleNumber: 'HR26AB1234', type: 'SUV', price: 1500000 },
  { id: 2, vehicleName: 'Maruti Swift', vehicleNumber: 'DL8CAF5030', type: 'Hatchback', price: 750000 },
  { id: 3, vehicleName: 'Honda City', vehicleNumber: 'UP14CD9876', type: 'Sedan', price: 1200000 }
];

// Returns an error message if invalid, or null if valid
const validateVehicle = (data = {}) => {
  const { vehicleName, vehicleNumber, type, price } = data;
  if (!vehicleName || !vehicleNumber || !type || price === undefined) {
    return 'vehicleName, vehicleNumber, type and price are required';
  }
  if (typeof price !== 'number' || price <= 0) {
    return 'price must be a positive number';
  }
  return null;
};

// GET all vehicles
app.get('/vehicles', (req, res) => {
  res.json(vehicles);
});

// GET vehicle by ID
app.get('/vehicles/:id', (req, res) => {
  const id = Number(req.params.id);
  const vehicle = vehicles.find((v) => v.id === id);

  if (!vehicle) {
    return res.status(404).json({ error: `Vehicle with id ${id} not found` });
  }
  res.json(vehicle);
});

// POST add a new vehicle
app.post('/vehicles', (req, res) => {
  const errorMessage = validateVehicle(req.body);
  if (errorMessage) {
    return res.status(400).json({ error: errorMessage });
  }

  const { id, vehicleName, vehicleNumber, type, price } = req.body;
  const newId = id !== undefined
    ? id
    : (vehicles.length ? Math.max(...vehicles.map((v) => v.id)) + 1 : 1);

  if (vehicles.some((v) => v.id === newId)) {
    return res.status(400).json({ error: `Vehicle with id ${newId} already exists` });
  }

  const vehicle = { id: newId, vehicleName, vehicleNumber, type, price };
  vehicles.push(vehicle);
  res.status(201).json({ message: 'Vehicle added successfully', vehicle });
});

// PUT update a vehicle
app.put('/vehicles/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = vehicles.findIndex((v) => v.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Vehicle with id ${id} not found` });
  }

  const errorMessage = validateVehicle(req.body);
  if (errorMessage) {
    return res.status(400).json({ error: errorMessage });
  }

  const { vehicleName, vehicleNumber, type, price } = req.body;
  vehicles[index] = { id, vehicleName, vehicleNumber, type, price };
  res.json({ message: 'Vehicle updated successfully', vehicle: vehicles[index] });
});

// DELETE a vehicle
app.delete('/vehicles/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = vehicles.findIndex((v) => v.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Vehicle with id ${id} not found` });
  }

  const [deleted] = vehicles.splice(index, 1);
  res.json({ message: 'Vehicle deleted successfully', vehicle: deleted });
});

// Invalid JSON body -> 400 (4 parameters = error handler)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }
  res.status(500).json({ error: 'Internal Server Error' });
});

// Unknown routes -> 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});