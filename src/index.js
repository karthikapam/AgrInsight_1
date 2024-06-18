import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, query, where
} from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBG0ldfkZtKrSRQTRe1ygJ3kSHa4IaAXo8",
    authDomain: "agriinsightnew.firebaseapp.com",
    projectId: "agriinsightnew",
    storageBucket: "agriinsightnew.appspot.com",
    messagingSenderId: "1083798883854",
    appId: "1:1083798883854:web:e02c8b22d2e9503d6b765f",
    measurementId: "G-0T80K60KN1"
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
  const testdataCollection = collection(db, "crop_production(andhra&telangana");

  // Chart instance
  let chart = null;

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
      const addedRows = new Set();
      querySnapshot.forEach((doc) => {
        const data = doc.data();
       console.log('Document data:', data); // Log the document data for debugging
        const year = data.Year;
        const production = data.Production;
        

        if (year && production) {
          if (!productionData[year]) {
            productionData[year] = 0;
          }
          productionData[year] += production;
        }
        const uniqueKey = `${data.StateName}-${data.District}-${data.Crop}-${data.Season}-${data["NPK ratio"]}-${data.Harvest}-${data.Rainfall}-${data.Irrigation}-${data["Soil Requirements"]}-${data["Soil pH"]}-${data["Cost of cultivation"]}`;

        // Check if this row already exists
        if (!addedRows.has(uniqueKey)) {
          addedRows.add(uniqueKey);
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

        const seasonCell = document.createElement("td");
        seasonCell.textContent = data.Season || 'N/A';
        row.appendChild(seasonCell);

        const npkCell = document.createElement("td");
        npkCell.textContent = data["NPK ratio"] || 'N/A';
        row.appendChild(npkCell);

        const harvestCell = document.createElement("td");
        harvestCell.textContent = data.Harvest || 'N/A';
        row.appendChild(harvestCell);

        const rainfallCell = document.createElement("td");
        rainfallCell.textContent = data.Rainfall || 'N/A';
        row.appendChild(rainfallCell);

        const irrigationCell = document.createElement("td");
        irrigationCell.textContent = data.Irrigation || 'N/A';
        row.appendChild(irrigationCell);

        const soilReqCell = document.createElement("td");
        soilReqCell.textContent = data["Soil Requirements"] || 'N/A';
        row.appendChild(soilReqCell);

        const soilPhCell = document.createElement("td");
        soilPhCell.textContent = data["Soil pH"] || 'N/A';
        row.appendChild(soilPhCell);

        const costCell = document.createElement("td");
        costCell.textContent = data["Cost of cultivation"] || 'N/A';
        row.appendChild(costCell);

        // Append the row to the table
        dataTable.appendChild(row);
        }
      });

      
      // Prepare data for Chart.js
      const years = Object.keys(productionData).sort();
      const productions = years.map(year => productionData[year]);

      // Destroy existing chart instance if it exists
      if (chart) {
        chart.destroy();
      }

      // Render chart
      const ctx = document.getElementById('productionChart').getContext('2d');
      chart = new Chart(ctx, {
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
        },
        responsive: false,
        maintainAspectRatio:true
        }
      });
    }).catch(err => {
      console.error('Error fetching documents:', err.message);
    });
  });
});
