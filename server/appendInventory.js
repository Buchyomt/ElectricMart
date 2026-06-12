const fs = require('fs');
const path = require('path');

const inventoryPath = path.join(__dirname, '../src/data/inventory.json');
const data = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
let nextId = Math.max(...data.map(i => i.id)) + 1;

const newItems = [
  {
    name: "Solar Floodlight",
    brand: "Generic",
    price: 8000,
    rating: 4.5,
    reviews: 12,
    image: "Solar floodlight.jpeg",
    spec: "Solar Powered",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    category: "Outdoor Lighting"
  },
  {
    name: "18Watts Liper/Crystal Bulkhead Fitting",
    brand: "Liper",
    price: 10000,
    rating: 4.8,
    reviews: 15,
    image: "18watts liper-crystal bulkhead fitting.jpeg",
    spec: "18 Watts",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    category: "Lighting"
  },
  {
    name: "Extension Cord",
    brand: "Generic",
    price: 3500,
    rating: 4.6,
    reviews: 50,
    image: "Extension cord .jpeg",
    spec: "Multi-socket",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    category: "Electrical Accessories"
  },
  {
    name: "COB Light",
    brand: "Generic",
    price: 1500,
    rating: 4.7,
    reviews: 100,
    image: "COB light.jpeg",
    spec: "High Brightness",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    category: "Lighting"
  },
  {
    name: "3 in 1 Iron Pendant",
    brand: "Generic",
    price: 58000,
    rating: 4.9,
    reviews: 10,
    image: "3 in 1 iron pendant.jpeg",
    spec: "Iron Build",
    deliveryTime: "1-3 days",
    isBulkPricing: true,
    category: "Lighting"
  },
  {
    name: "Monkey Light",
    brand: "Generic",
    price: 65000,
    rating: 4.8,
    reviews: 5,
    image: "Monkey light.jpeg",
    spec: "Resin Design",
    deliveryTime: "1-3 days",
    isBulkPricing: false,
    category: "Lighting"
  }
];

newItems.forEach(item => {
  item.id = nextId++;
  data.push(item);
});

fs.writeFileSync(inventoryPath, JSON.stringify(data, null, 2));
console.log('Successfully appended 6 items to inventory.json');
