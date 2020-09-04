const Tile = require('./tile');

module.exports = [
  {
    label: 'Location of Crime',
    options: [
      'Pub',
      'Bookstore',
      'Restaurant',
      'Hotel',
      'Hospital',
      'Building Site',
    ],
    type: Tile.TYPE_LOCATION,
  },
  {
    label: 'Location of Crime',
    options: [
      'Playground',
      'Classroom',
      'Dormitory',
      'Cafeteria',
      'Elevator',
      'Toilet',
    ],
    type: Tile.TYPE_LOCATION,
  },
  {
    label: 'Location of Crime',
    options: [
      'Vacation Home',
      'Park',
      'Supermarket',
      'School',
      'Woods',
      'Bank',
    ],
    type: Tile.TYPE_LOCATION,
  },
  {
    label: 'Location of Crime',
    options: [
      'Living Room',
      'Bedroom',
      'Storeroom',
      'Bathroom',
      'Kitchen',
      'Balcony',
    ],
    type: Tile.TYPE_LOCATION,
  },
];
