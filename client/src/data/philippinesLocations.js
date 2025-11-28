// Philippines Location Data - Samar Provinces
// Data source: Philippine Statistics Authority (PSA)

export const provinces = [
  { code: 'SAM', name: 'Samar (Western Samar)' },
  { code: 'NSA', name: 'Northern Samar' },
  { code: 'ESA', name: 'Eastern Samar' }
];

export const municipalities = {
  // SAMAR (Western Samar)
  'SAM': [
    { code: 'ALMAGRO', name: 'Almagro' },
    { code: 'BASEY', name: 'Basey' },
    { code: 'CALBAYOG', name: 'Calbayog City' },
    { code: 'CALBIGA', name: 'Calbiga' },
    { code: 'CATBALOGAN', name: 'Catbalogan City' },
    { code: 'DARAM', name: 'Daram' },
    { code: 'GANDARA', name: 'Gandara' },
    { code: 'HINABANGAN', name: 'Hinabangan' },
    { code: 'JIABONG', name: 'Jiabong' },
    { code: 'MARABUT', name: 'Marabut' },
    { code: 'MATUGUINAO', name: 'Matuguinao' },
    { code: 'MOTIONG', name: 'Motiong' },
    { code: 'PAGSANGHAN', name: 'Pagsanghan' },
    { code: 'PARANAS', name: 'Paranas (Wright)' },
    { code: 'PINABACDAO', name: 'Pinabacdao' },
    { code: 'SAN_JORGE', name: 'San Jorge' },
    { code: 'SAN_JOSE_DE_BUAN', name: 'San Jose de Buan' },
    { code: 'SAN_SEBASTIAN', name: 'San Sebastian' },
    { code: 'SANTA_MARGARITA', name: 'Santa Margarita' },
    { code: 'SANTA_RITA', name: 'Santa Rita' },
    { code: 'SANTO_NINO', name: 'Santo Niño' },
    { code: 'TARANGNAN', name: 'Tarangnan' },
    { code: 'TALALORA', name: 'Talalora' },
    { code: 'TARANGAN', name: 'Tarangan' },
    { code: 'VILLAREAL', name: 'Villareal' },
    { code: 'ZUMARRAGA', name: 'Zumarraga' }
  ],
  
  // NORTHERN SAMAR
  'NSA': [
    { code: 'ALLEN', name: 'Allen' },
    { code: 'BIRI', name: 'Biri' },
    { code: 'BOBON', name: 'Bobon' },
    { code: 'CAPUL', name: 'Capul' },
    { code: 'CATARMAN', name: 'Catarman' },
    { code: 'CATUBIG', name: 'Catubig' },
    { code: 'GAMAY', name: 'Gamay' },
    { code: 'LAOANG', name: 'Laoang' },
    { code: 'LAPINIG', name: 'Lapinig' },
    { code: 'LAS_NAVAS', name: 'Las Navas' },
    { code: 'LAVEZARES', name: 'Lavezares' },
    { code: 'LOPE_DE_VEGA', name: 'Lope de Vega' },
    { code: 'MAPANAS', name: 'Mapanas' },
    { code: 'MONDRAGON', name: 'Mondragon' },
    { code: 'PALAPAG', name: 'Palapag' },
    { code: 'PAMBUJAN', name: 'Pambujan' },
    { code: 'ROSARIO', name: 'Rosario' },
    { code: 'SAN_ANTONIO', name: 'San Antonio' },
    { code: 'SAN_ISIDRO', name: 'San Isidro' },
    { code: 'SAN_JOSE', name: 'San Jose' },
    { code: 'SAN_ROQUE', name: 'San Roque' },
    { code: 'SAN_VICENTE', name: 'San Vicente' },
    { code: 'SILVINO_LOBOS', name: 'Silvino Lobos' },
    { code: 'VICTORIA', name: 'Victoria' }
  ],
  
  // EASTERN SAMAR
  'ESA': [
    { code: 'ARTECHE', name: 'Arteche' },
    { code: 'BALANGIGA', name: 'Balangiga' },
    { code: 'BALANGKAYAN', name: 'Balangkayan' },
    { code: 'BORONGAN', name: 'Borongan City' },
    { code: 'CAN_AVID', name: 'Can-avid' },
    { code: 'DOLORES', name: 'Dolores' },
    { code: 'GENERAL_MACARTHUR', name: 'General MacArthur' },
    { code: 'GIPORLOS', name: 'Giporlos' },
    { code: 'GUIUAN', name: 'Guiuan' },
    { code: 'HERNANI', name: 'Hernani' },
    { code: 'JIPAPAD', name: 'Jipapad' },
    { code: 'LAWAAN', name: 'Lawaan' },
    { code: 'LLORENTE', name: 'Llorente' },
    { code: 'MASLOG', name: 'Maslog' },
    { code: 'MAYDOLONG', name: 'Maydolong' },
    { code: 'MERCEDES', name: 'Mercedes' },
    { code: 'ORAS', name: 'Oras' },
    { code: 'QUINAPONDAN', name: 'Quinapondan' },
    { code: 'SALCEDO', name: 'Salcedo' },
    { code: 'SAN_JULIAN', name: 'San Julian' },
    { code: 'SAN_POLICARPO', name: 'San Policarpo' },
    { code: 'SULAT', name: 'Sulat' },
    { code: 'TAFT', name: 'Taft' }
  ]
};

// Barangays for each municipality (sample data for major cities/municipalities)
// You can expand this based on your needs
export const barangays = {
  // CATBALOGAN CITY (Capital of Samar) - Complete list with all 57 barangays
  'CATBALOGAN': [
    'Albalate', 'Bagongon', 'Bangon', 'Basiao', 'Buluan', 'Bunuanan',
    'Cabugawan', 'Cagudalo', 'Cagusipan', 'Cagutian', 'Cagutsan', 
    'Canhawan Guti', 'Canlapwas (Poblacion 15)', 'Cawayan', 'Cinco',
    'Darahuway Daco', 'Darahuway Guti', 'Estaka', 'Guindapunan', 
    'Guinsorongan', 'Ibol', 'Iguid', 'Lagundi', 'Libas', 'Lobo',
    'Manguehay', 'Maulong (Oraa)', 'Mercedes', 'Mombon', 
    'New Mahayag (Anayan)', 'Old Mahayag', 'Palanyogon', 'Pangdan', 'Payao',
    'Poblacion 1 (Barangay 1)', 'Poblacion 2 (Barangay 2)', 
    'Poblacion 3 (Barangay 3)', 'Poblacion 4 (Barangay 4)', 
    'Poblacion 5 (Barangay 5)', 'Poblacion 6 (Barangay 6)', 
    'Poblacion 7 (Barangay 7)', 'Poblacion 8 (Barangay 8)',
    'Poblacion 9 (Barangay 9)', 'Poblacion 10 (Barangay 10: Monsanto Street)',
    'Poblacion 11 (Barangay 11)', 'Poblacion 12 (Barangay 12)',
    'Poblacion 13 (Barangay 13)', 'Muñoz (Poblacion 14)',
    'Pupua', 'Rama', 'San Andres', 'San Pablo', 'San Roque', 
    'San Vicente', 'Silanga (Papaya)', 'Socorro', 'Totoringon'
  ],
  
  // CALBAYOG CITY
  'CALBAYOG': [
    'Aguit-itan', 'Amampacang', 'Awang', 'Bagacay', 'Balud', 'Basud', 
    'Buenavista', 'Cag-Anahaw', 'Caglanipao', 'Cagsalaosao', 'Capoocan', 
    'Danao', 'Dinagan', 'Gadgaran', 'Hamorawon', 'Hibatang', 'Hindang', 
    'Lonoy', 'Malaga', 'Matobato', 'Mancol', 'Nuntanga', 'Obrero', 
    'Oquendo', 'Pagbalican', 'Pagsulhugon', 'Peña', 'Rawis', 'Rizal', 
    'Roxas', 'San Joaquin', 'San Policarpo', 'Tinambacan', 'Tomaligues'
  ],
  
  // CATARMAN (Capital of Northern Samar)
  'CATARMAN': [
    'Acacia', 'Airport Village', 'Baybay', 'Bocsol', 'Calachuchi', 
    'Cal-igang', 'Cawayan', 'Cervantes', 'Dalakit', 'Doña Pulqueria', 
    'Galutan', 'Gebalagnan', 'Gebulwangan', 'Guba', 'Hibabngan', 
    'Huyon-huyon', 'Imelda', 'Jose Abad Santos', 'Kasoy', 'Lag-on', 
    'Lapu-lapu', 'Libtong', 'Libjo', 'McKinley', 'Molave', 'Narra', 
    'New Rizal', 'Paticua', 'Polangi', 'Quezon', 'Talisay', 'Washington'
  ],
  
  // BORONGAN CITY (Capital of Eastern Samar)
  'BORONGAN': [
    'Alang-alang', 'Amantacop', 'Ando', 'Balud', 'Banuyo', 'Bato', 
    'Baybay', 'Benowangan', 'Bugas', 'Cabong', 'Calingatngan', 'Calzada', 
    'Canjaway', 'Canmarating', 'Can-opo', 'Divinubo', 'Don Paulino Navarro', 
    'Guardia', 'Hindang', 'Lalawigan', 'Libuton', 'Locso-on', 'Maybacong', 
    'Maypangdan', 'Punta Maria', 'Purok 1-4', 'Sabang North', 'Sabang South', 
    'San Jose', 'San Pablo', 'Santa Fe', 'Siha', 'Songco', 'Suribao', 
    'Surok', 'Tabunan', 'Talisay', 'Tayud', 'Trinidad'
  ],
  
  // BASEY
  'BASEY': [
    'Amandayehan', 'Bacubac', 'Baloog', 'Basiao', 'Burgos', 'Cambayan', 
    'Can-aponte', 'Cancatac', 'Cogon', 'Guin-on', 'Guintigui-an', 
    'Inapulangan', 'Inuboran', 'Loog', 'Mancol', 'Manlilinab', 'Mongabong', 
    'Old Poblacion', 'Palaypay', 'Panugmonon', 'San Antonio', 'San Fernando', 
    'Serum', 'Suludnon', 'Sulod', 'Tiguib', 'Tingib', 'Villa Aurora', 'Cubay'
  ],
  
  // Add more municipalities as needed...
  // For municipalities without barangay data, we'll provide a default option
};

// Helper function to get municipalities by province code
export const getMunicipalitiesByProvince = (provinceCode) => {
  return municipalities[provinceCode] || [];
};

// Helper function to get barangays by municipality code
export const getBarangaysByMunicipality = (municipalityCode) => {
  return barangays[municipalityCode] || ['Poblacion', 'Zone I', 'Zone II', 'Zone III'];
};

// Helper function to format full address
export const formatFullAddress = (barangay, municipality, province) => {
  return `${barangay}, ${municipality}, ${province}`;
};
