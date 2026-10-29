// data/locations.js — Cascading Administrative Division Reference Data
// States and prominent districts/talukas in India for accurate beneficiary routing.

export const STATES_AND_DISTRICTS = [
  {
    state: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
    stateMr: 'महाराष्ट्र',
    districts: [
      {
        name: 'Pune',
        talukas: ['Haveli', 'Pune City', 'Baramati', 'Shirur', 'Khed', 'Maval', 'Daund', 'Indapur'],
      },
      {
        name: 'Mumbai',
        talukas: ['Mumbai City', 'Mumbai Suburban', 'Andheri', 'Kurla', 'Borivali'],
      },
      {
        name: 'Thane',
        talukas: ['Thane', 'Kalyan', 'Murbad', 'Bhiwandi', 'Shahapur', 'Ulhasnagar', 'Ambarnath'],
      },
      {
        name: 'Nagpur',
        talukas: ['Nagpur City', 'Nagpur Rural', 'Kamptee', 'Hingna', 'Katol', 'Ramtek', 'Umred'],
      },
      {
        name: 'Nashik',
        talukas: ['Nashik', 'Malegaon', 'Sinnar', 'Niphad', 'Dindori', 'Igatpuri'],
      },
      {
        name: 'Chhatrapati Sambhajinagar',
        talukas: ['Aurangabad', 'Paithan', 'Vaijapur', 'Gangapur', 'Kannad', 'Sillod'],
      },
      {
        name: 'Solapur',
        talukas: ['Solapur North', 'Solapur South', 'Barshi', 'Pandharpur', 'Malshiras'],
      },
      {
        name: 'Kolhapur',
        talukas: ['Karvir', 'Hatkanangle', 'Shirol', 'Kagal', 'Radhanagari'],
      },
      {
        name: 'Amravati',
        talukas: ['Amravati', 'Achalpur', 'Chandur Railway', 'Morshi', 'Warud'],
      },
    ],
  },
  {
    state: 'Delhi',
    stateHi: 'दिल्ली',
    stateMr: 'दिल्ली',
    districts: [
      {
        name: 'New Delhi',
        talukas: ['Chanakyapuri', 'Connaught Place', 'Parliament Street', 'Delhi Cantonment'],
      },
      {
        name: 'North Delhi',
        talukas: ['Civil Lines', 'Kotwali', 'Sadar Bazar'],
      },
      {
        name: 'South Delhi',
        talukas: ['Hauz Khas', 'Saket', 'Mehrauli'],
      },
      {
        name: 'East Delhi',
        talukas: ['Preet Vihar', 'Mayur Vihar', 'Gandhi Nagar'],
      },
    ],
  },
  {
    state: 'Uttar Pradesh',
    stateHi: 'उत्तर प्रदेश',
    stateMr: 'उत्तर प्रदेश',
    districts: [
      {
        name: 'Lucknow',
        talukas: ['Lucknow Sadar', 'Bakshi Ka Talab', 'Malihabad', 'Mohanlalganj'],
      },
      {
        name: 'Varanasi',
        talukas: ['Varanasi Sadar', 'Pindra', 'Raja Talab'],
      },
      {
        name: 'Kanpur Nagar',
        talukas: ['Kanpur Sadar', 'Bilhaur', 'Ghatampur'],
      },
      {
        name: 'Agra',
        talukas: ['Agra Sadar', 'Fatehabad', 'Etmadpur', 'Kheragarh', 'Bah'],
      },
      {
        name: 'Prayagraj',
        talukas: ['Sadar', 'Phulpur', 'Koraon', 'Bara', 'Handia', 'Karchhana'],
      },
    ],
  },
  {
    state: 'Bihar',
    stateHi: 'बिहार',
    stateMr: 'बिहार',
    districts: [
      {
        name: 'Patna',
        talukas: ['Patna Sadar', 'Barh', 'Danapur', 'Masaurhi', 'Paliganj', 'Bikram'],
      },
      {
        name: 'Gaya',
        talukas: ['Gaya Sadar', 'Bodhigaya', 'Sherghati', 'Tekari', 'Wazirganj'],
      },
      {
        name: 'Muzaffarpur',
        talukas: ['Musahari', 'Kanti', 'Motipur', 'Paroo', 'Sahebganj'],
      },
    ],
  },
  {
    state: 'Rajasthan',
    stateHi: 'राजस्थान',
    stateMr: 'राजस्थान',
    districts: [
      {
        name: 'Jaipur',
        talukas: ['Jaipur', 'Sanganer', 'Amer', 'Chaksu', 'Kotputli'],
      },
      {
        name: 'Jodhpur',
        talukas: ['Jodhpur', 'Luni', 'Bilara', 'Osian', 'Phalodi'],
      },
      {
        name: 'Udaipur',
        talukas: ['Girwa', 'Badgaon', 'Mavli', 'Vallabhnagar', 'Salumbar'],
      },
    ],
  },
  {
    state: 'Madhya Pradesh',
    stateHi: 'मध्य प्रदेश',
    stateMr: 'मध्य प्रदेश',
    districts: [
      {
        name: 'Bhopal',
        talukas: ['Huzur', 'Berasia', 'Kolar'],
      },
      {
        name: 'Indore',
        talukas: ['Indore', 'Mhow', 'Depalpur', 'Sanwer'],
      },
      {
        name: 'Gwalior',
        talukas: ['Gwalior', 'Dabra', 'Bhitarwar', 'Chinour'],
      },
    ],
  },
  {
    state: 'Karnataka',
    stateHi: 'कर्नाटक',
    stateMr: 'कर्नाटक',
    districts: [
      {
        name: 'Bengaluru Urban',
        talukas: ['Bengaluru North', 'Bengaluru South', 'Bengaluru East', 'Anekal'],
      },
      {
        name: 'Mysuru',
        talukas: ['Mysuru', 'Nanjangud', 'Hunsur', 'T. Narasipura'],
      },
      {
        name: 'Belagavi',
        talukas: ['Belagavi', 'Chikkodi', 'Gokak', 'Bailhongal'],
      },
    ],
  },
  {
    state: 'Tamil Nadu',
    stateHi: 'तमिलनाडु',
    stateMr: 'तमिळनाडू',
    districts: [
      {
        name: 'Chennai',
        talukas: ['Egmore', 'Mylapore', 'Tondiarpet', 'Guindy', 'Velachery'],
      },
      {
        name: 'Coimbatore',
        talukas: ['Coimbatore North', 'Coimbatore South', 'Pollachi', 'Mettupalayam'],
      },
      {
        name: 'Madurai',
        talukas: ['Madurai North', 'Madurai South', 'Melur', 'Thirumangalam'],
      },
    ],
  },
  {
    state: 'Telangana',
    stateHi: 'तेलंगाना',
    stateMr: 'तेलंगणा',
    districts: [
      {
        name: 'Hyderabad',
        talukas: ['Charminar', 'Secunderabad', 'Khairatabad', 'Golconda'],
      },
      {
        name: 'Warangal',
        talukas: ['Warangal', 'Hanamkonda', 'Wardhannapet'],
      },
    ],
  },
  {
    state: 'Punjab',
    stateHi: 'पंजाब',
    stateMr: 'पंजाब',
    districts: [
      {
        name: 'Amritsar',
        talukas: ['Amritsar-I', 'Amritsar-II', 'Ajnala', 'Baba Bakala'],
      },
      {
        name: 'Ludhiana',
        talukas: ['Ludhiana East', 'Ludhiana West', 'Jagraon', 'Khanna', 'Payal'],
      },
      {
        name: 'Jalandhar',
        talukas: ['Jalandhar-I', 'Jalandhar-II', 'Nakodar', 'Phillaur', 'Shahkot'],
      },
    ],
  },
  {
    state: 'West Bengal',
    stateHi: 'पश्चिम बंगाल',
    stateMr: 'पश्चिम बंगाल',
    districts: [
      {
        name: 'Kolkata',
        talukas: ['Kolkata Sadar', 'Alipore', 'Sealdah'],
      },
      {
        name: 'North 24 Parganas',
        talukas: ['Barasat', 'Barrackpore', 'Bidhannagar', 'Basirhat'],
      },
      {
        name: 'Howrah',
        talukas: ['Howrah Sadar', 'Uluberia', 'Bally'],
      },
    ],
  },
];
