import {initializeApp} from 'firebase/app'
import {
    getFirestore,collection,getDocs,query, where, QuerySnapshot
}from 'firebase/firestore'
const firebaseConfig = {
    apiKey: "AIzaSyCsqXtg8Qia7QcM4v6DYZKk35TSGiCv-v0",
    authDomain: "test-8d5fe.firebaseapp.com",
    projectId: "test-8d5fe",
    storageBucket: "test-8d5fe.appspot.com",
    messagingSenderId: "664884742004",
    appId: "1:664884742004:web:5c1a4d3b6fbbde5d18ce21"
  };

  initializeApp(firebaseConfig)

  const db= getFirestore()

  const colRef=collection(db,'test_data')

  const uniqueStateNames = new Set(); // Using a Set to store unique crop names
  
  const stateDropdown = document.getElementById("stateDropdown");
  const districtDropdown = document.getElementById("districtDropdown");

getDocs(colRef)
    .then((snapshot) => {
        snapshot.docs.forEach((doc) => {
            const cropData = doc.data();
            const stateName = cropData.StateName; // Assuming the name field exists in your crop_production collection

            uniqueStateNames.add(stateName); // Add each crop name to the Set
        });

        // Convert Set to an array and populate the dropdown
        const stateNamesArray = Array.from(uniqueStateNames);
        stateNamesArray.forEach((stateName) => {
            const option = document.createElement('option');
            option.value = stateName;
            option.textContent = stateName;
            stateDropdown.appendChild(option);
        });
    })

    stateDropdown.addEventListener("change",() => {
    const selectedName = stateDropdown.value;
    colRef.where("StateName", "==", selectedName).get().then((QuerySnapshot) => {
        QuerySnapshot.forEach((doc) => {
            const data = doc.data();
            districtDropdown.value=data.District;
        });
        });
       })

    .catch(err => {
        console.log(err.message);
    });