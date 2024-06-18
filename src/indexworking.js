import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, query, where
} from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyCsqXtg8Qia7QcM4v6DYZKk35TSGiCv-v0",
    authDomain: "test-8d5fe.firebaseapp.com",
    projectId: "test-8d5fe",
    storageBucket: "test-8d5fe.appspot.com",
    messagingSenderId: "664884742004",
    appId: "1:664884742004:web:5c1a4d3b6fbbde5d18ce21"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Get references to the dropdown elements and table
  const stateDropdown = document.getElementById("stateDropdown");
  const districtDropdown = document.getElementById("districtDropdown");
  const cropDropdown = document.getElementById("cropDropdown");
  const dataTable = document.getElementById("dataTable").getElementsByTagName('tbody')[0];

  if (!stateDropdown || !districtDropdown || !cropDropdown || !dataTable) {
    console.error('Dropdown or table elements not found in the DOM');
    return;
  }

  // Reference to the collection
  const testdataCollection = collection(db, "test_data");

  // Fetch and populate state dropdown
  const stateSet = new Set();
  getDocs(testdataCollection).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const stateName = data.StateName;

      if (!stateSet.has(stateName)) {
        stateSet.add(stateName);

        // Create and append state option
        const stateOption = document.createElement("option");
        stateOption.value = stateName;
        stateOption.textContent = stateName;
        stateDropdown.appendChild(stateOption);
      }
    });
  }).catch(err => {
    console.error('Error fetching documents:', err.message);
  });

  // Handle state dropdown change
  stateDropdown.addEventListener("change", () => {
    const selectedState = stateDropdown.value;
    const q = query(testdataCollection, where("StateName", "==", selectedState));

    getDocs(q).then((querySnapshot) => {
      // Clear existing options in district and crop dropdowns
      districtDropdown.innerHTML = '';
      cropDropdown.innerHTML = '';
      dataTable.innerHTML = '';

      const districtSet = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Document data:', data);
        const district = data.District;

        if (!districtSet.has(district)) {
          districtSet.add(district);

          // Create and append new district options
          const districtOption = document.createElement("option");
          districtOption.value = district;
          districtOption.textContent = district;
          districtDropdown.appendChild(districtOption);
        }
      });
    }).catch(err => {
      console.error('Error fetching documents:', err.message);
    });
  });

  // Handle district dropdown change
  districtDropdown.addEventListener("change", () => {
    const selectedState = stateDropdown.value;
    const selectedDistrict = districtDropdown.value;
    const q = query(testdataCollection,
      where("StateName", "==", selectedState),
      where("District", "==", selectedDistrict)
    );

    getDocs(q).then((querySnapshot) => {
      // Clear existing options in crop dropdown
      cropDropdown.innerHTML = '';
      dataTable.innerHTML = '';

      const cropSet = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const crop = data.Crop;

        if (!cropSet.has(crop)) {
          cropSet.add(crop);

          // Create and append new crop options
          const cropOption = document.createElement("option");
          cropOption.value = crop;
          cropOption.textContent = crop;
          cropDropdown.appendChild(cropOption);
        }
      });
    }).catch(err => {
      console.error('Error fetching documents:', err.message);
    });
  });

  // Handle crop dropdown change and render chart
  cropDropdown.addEventListener("change", () => {
    const selectedState = stateDropdown.value;
    const selectedDistrict = districtDropdown.value;
    const selectedCrop = cropDropdown.value;
    const q = query(testdataCollection,
      where("StateName", "==", selectedState),
      where("District", "==", selectedDistrict),
      where("Crop", "==", selectedCrop)
    );

    getDocs(q).then((querySnapshot) => {
      // Clear existing rows in the table
      dataTable.innerHTML = '';

      // Prepare data for the chart
      const productionData = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const year = data.Year;
        const production = data.Production;

        if (year && production) {
          if (!productionData[year]) {
            productionData[year] = 0;
          }
          productionData[year] += production;
        }

        // Create a new row
        const row = document.createElement("tr");

        // Add cells to the row
        const stateCell = document.createElement("td");
        stateCell.textContent = data.StateName;
        row.appendChild(stateCell);

        const districtCell = document.createElement("td");
        districtCell.textContent = data.District;
        row.appendChild(districtCell);

        const cropCell = document.createElement("td");
        cropCell.textContent = data.Crop;
        row.appendChild(cropCell);

        const npkCell = document.createElement("td");
        npkCell.textContent = data["NPK ratio"];
        row.appendChild(npkCell);

        const harvestCell = document.createElement("td");
        harvestCell.textContent = data.Harvest;
        row.appendChild(harvestCell);

        const rainfallCell = document.createElement("td");
        rainfallCell.textContent = data.Rainfall;
        row.appendChild(rainfallCell);

        const irrigationCell = document.createElement("td");
        irrigationCell.textContent = data.Irrigation;
        row.appendChild(irrigationCell);

        const soilReqCell = document.createElement("td");
        soilReqCell.textContent = data["Soil Requirements"];
        row.appendChild(soilReqCell);

        const soilPhCell = document.createElement("td");
        soilPhCell.textContent = data["Soil pH"];
        row.appendChild(soilPhCell);

        const costCell = document.createElement("td");
        costCell.textContent = data["Cost of cultivation"];
        row.appendChild(costCell);

        // Append the row to the table
        dataTable.appendChild(row);
      });

      // Prepare data for Chart.js
      const years = Object.keys(productionData).sort();
      const productions = years.map(year => productionData[year]);

      // Render chart
      const ctx = document.getElementById('productionChart').getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: years,
          datasets: [{
            label: `Production for ${selectedCrop} in ${selectedDistrict}, ${selectedState}`,
            data: productions,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }).catch(err => {
      console.error('Error fetching documents:', err.message);
    });
  });
});
