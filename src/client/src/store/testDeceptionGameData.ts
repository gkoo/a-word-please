import * as constants from '../constants';

const isScientist = 1;

export default {
  accuseLog: {},
  accuserId: 'yuriko',
  accusedMethod: 'Sneezing',
  accusationActive: false,
  accusationResult: true,
  suspectId: 'willy',
  causeOfDeathTile: {
    label: 'Cause Of Death',
    options: [
      'Suffocation',
      'Loss of Blood',
      'Illness/Disease',
      'Poisoning',
      'Accident',
    ],
    type: constants.TILE_DECEPTION_CAUSE_OF_DEATH,
    selectedOption: 'Poisoning',
  },
  gameId: constants.GAME_DECEPTION,
  locationTiles: [
    {
      id: 1,
      label: 'Location of Crime',
      options: [
        'Pub',
        'Bookstore',
        'Restaurant',
        'Hotel',
        'Hospital',
        'Building Site',
      ],
      type: constants.TILE_DECEPTION_LOCATION,
    },
    {
      id: 2,
      label: 'Location of Crime',
      options: [
        'Playground',
        'Classroom',
        'Dormitory',
        'Cafeteria',
        'Elevator',
        'Toilet',
      ],
      type: constants.TILE_DECEPTION_LOCATION,
    },
    {
      id: 3,
      label: 'Location of Crime',
      options: [
        'Vacation Home',
        'Park',
        'Supermarket',
        'School',
        'Woods',
        'Bank',
      ],
      type: constants.TILE_DECEPTION_LOCATION,
    },
    {
      id: 4,
      label: 'Location of Crime',
      options: [
        'Living Room',
        'Bedroom',
        'Storeroom',
        'Bathroom',
        'Kitchen',
        'Balcony',
      ],
      type: constants.TILE_DECEPTION_LOCATION,
    },
  ],
  keyEvidence: {
    label: 'Notebook',
  },
  newSceneTile: {
    label: 'Hint on Corpse',
    options: [
      'Head',
      'Chest',
      'Hand',
      'Leg',
      'Partial',
      'All-over',
    ],
    selectedOption: 'Leg',
    type: constants.TILE_DECEPTION_SCENE,
  },
  murderMethod: {
    label: 'Brick'
  },
  //oldSceneTile: {
    //id: 1,
    //label: 'Social Relationship',
    //options: [
      //'Relatives',
      //'Friends',
      //'Colleagues',
      //'Employer/Employee',
      //'Lovers',
      //'Strangers',
    //],
    //selectedOption: 'Lovers',
    //type: constants.TILE_DECEPTION_SCENE,
  //},
  playersReady: {
    'gordon': 1
  },
  players: {
    gordon: {
      id: 'gordon',
      name: 'Gordon',
      color: 'red',
      role: isScientist ? constants.ROLE_SCIENTIST : constants.ROLE_MURDERER,
      methodCards: [
        {
          id: 1,
          label: 'Virus',
          type: 0,
        },
        {
          id: 2,
          label: 'Wine',
          type: 0,
        },
        {
          id: 3,
          label: 'Scissors',
          type: 0,
        },
        {
          id: 4,
          label: 'Arson',
          type: 0,
        }
      ],
      evidenceCards: [
        {
          id: 1,
          label: 'Smile',
          type: 1,
        },
        {
          id: 2,
          label: 'Saliva',
          type: 1,
        },
        {
          id: 3,
          label: 'Fart Smell',
          type: 1,
        },
        {
          id: 4,
          label: 'Voicemail',
          type: 1,
        }
      ],
    },
    yuriko: {
      id: 'yuriko',
      name: 'Yuriko',
      color: 'purple',
      connected: true,
      role: constants.ROLE_ACCOMPLICE,
      methodCards: [
        {
          id: 5,
          label: 'Dumbo',
          type: 0,
        },
        {
          id: 6,
          label: 'Spiders',
          type: 0,
        },
        {
          id: 7,
          label: 'Talking Loud',
          type: 0,
        },
        {
          id: 8,
          label: 'Insults',
          type: 0,
        }
      ],
      evidenceCards: [
        {
          id: 5,
          label: 'Black Powder',
          type: 1,
        },
        {
          id: 6,
          label: 'Lipstick',
          type: 1,
        },
        {
          id: 7,
          label: 'Mustard Stain',
          type: 1,
        },
        {
          id: 8,
          label: 'Oil Spill',
          type: 1,
        }
      ],
    },
    aj: {
      id: 'aj',
      name: 'AJ',
      color: 'pink',
      connected: true,
      role: constants.ROLE_WITNESS,
      methodCards: [
        {
          id: 9,
          label: 'Embarrassment',
          type: 0,
        },
        {
          id: 10,
          label: 'Laughter',
          type: 0,
        },
        {
          id: 11,
          label: 'Happiness',
          type: 0,
        },
        {
          id: 12,
          label: 'Sadness',
          type: 0,
        }
      ],
      evidenceCards: [
        {
          id: 1,
          label: 'Footprint',
          type: 1,
        },
        {
          id: 2,
          label: 'Receipt',
          type: 1,
        },
        {
          id: 3,
          label: 'Facebook Post',
          type: 1,
        },
        {
          id: 4,
          label: 'Fingernail Clipping',
          type: 1,
        }
      ],
    },
    willy: {
      id: 'willy',
      name: 'Willy',
      color: 'red',
      connected: true,
      role: isScientist ? constants.ROLE_MURDERER : constants.ROLE_SCIENTIST,
      methodCards: [
        {
          id: 13,
          label: 'Sneezing',
          type: 0,
        },
        {
          id: 14,
          label: 'Extroversion',
          type: 0,
        },
        {
          id: 15,
          label: 'Swim Stroke',
          type: 0,
        },
        {
          id: 16,
          label: 'Radiation',
          type: 0,
        }
      ],
      evidenceCards: [
        {
          id: 1,
          label: 'Cheeto Dust',
          type: 1,
        },
        {
          id: 2,
          label: 'Essential Oil Residue',
          type: 1,
        },
        {
          id: 3,
          label: 'Hot Lips',
          type: 1,
        },
        {
          id: 4,
          label: 'Dried Boba',
          type: 1,
        }
      ],
    },
    rishi: {
      id: 'rishi',
      name: 'Rishi',
      color: 'orange',
      connected: true,
      role: constants.ROLE_INVESTIGATOR,
      methodCards: [
        {
          id: 9,
          label: 'Embarrassment',
          type: 0,
        },
        {
          id: 10,
          label: 'Laughter',
          type: 0,
        },
        {
          id: 11,
          label: 'Happiness',
          type: 0,
        },
        {
          id: 12,
          label: 'Sadness',
          type: 0,
        }
      ],
      evidenceCards: [
        {
          id: 1,
          label: 'Cheeto Dust',
          type: 1,
        },
        {
          id: 2,
          label: 'Essential Oil Residue',
          type: 1,
        },
        {
          id: 3,
          label: 'Hot Lips',
          type: 1,
        },
        {
          id: 4,
          label: 'Dried Boba',
          type: 1,
        }
      ],
    },
  },
  roundNum: 1,
  sceneTiles: [
    {
      id: 1,
      label: 'Social Relationship',
      options: [
        'Relatives',
        'Friends',
        'Colleagues',
        'Employer/Employee',
        'Lovers',
        'Strangers',
      ],
      selectedOption: 'Lovers',
      type: constants.TILE_DECEPTION_SCENE,
    },
    {
      id: 2,
      label: 'Victim\'s Build',
      options: [
        'Large',
        'Thin',
        'Tall',
        'Short',
        'Disfigured',
        'Fit',
      ],
      selectedOption: 'Fit',
      type: constants.TILE_DECEPTION_SCENE,
    },
    {
      id: 3,
      label: 'Sudden Incident',
      options: [
        'Power Failure',
        'Fire',
        'Conflict',
        'Loss of Valuables',
        'Scream',
        'Nothing',
      ],
      selectedOption: 'Scream',
      type: constants.TILE_DECEPTION_SCENE,
    },
    {
      id: 4,
      label: 'Victim\'s Identity',
      options: [
        'Child',
        'Young Adult',
        'Middle-Aged',
        'Senior',
        'Male',
        'Female',
      ],
      selectedOption: 'Young Adult',
      type: constants.TILE_DECEPTION_SCENE,
    },
  ],
  selectedLocationTile: {
    id: 4,
    label: 'Location of Crime',
    options: [
      'Living Room',
      'Bedroom',
      'Storeroom',
      'Bathroom',
      'Kitchen',
      'Balcony',
    ],
    selectedOption: 'Living Room',
    type: constants.TILE_DECEPTION_LOCATION,
  },
  //state: constants.STATE_DECEPTION_EXPLAIN_RULES,
  //state: constants.STATE_DECEPTION_SHOW_ROLES,
  //state: constants.STATE_DECEPTION_CHOOSE_MEANS_EVIDENCE,
  //state: constants.STATE_DECEPTION_WITNESSING,
  //state: constants.STATE_DECEPTION_SCIENTIST_CAUSE_OF_DEATH,
  //state: constants.STATE_DECEPTION_SCIENTIST_LOCATION,
  state: constants.STATE_DECEPTION_SCIENTIST_SCENE_TILES,
  //state: constants.STATE_DECEPTION_DELIBERATION,
  //state: constants.STATE_DECEPTION_REPLACE_SCENE,
  //state: constants.GAME_STATE_GAME_END,
  totalNumRounds: 3,
  //witnessSuspectId: 'aj',
  //witnessGuessCorrect: false,
};
