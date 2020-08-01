  var firebaseConfig = {
    apiKey: "AIzaSyABF-0nWNsskx26LMrTy__KXdWBnJeCwuM",
    authDomain: "covid-care-costs.firebaseapp.com",
    databaseURL: "https://covid-care-costs.firebaseio.com",
    projectId: "covid-care-costs",
    storageBucket: "covid-care-costs.appspot.com",
    messagingSenderId: "682390924044",
    appId: "1:682390924044:web:c8089ae2f218426a95b729"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


var db = firebase.firestore();

function store(collection, data) {
    db.collection(collection).add(data)
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

function getReference(collection, refId) {
  return db.collection(collection).doc(refId)
}

function isEmpty(string) {
  return !string || (0 === string.length);
}

function new_hospital(details) {
    // validate
    if(isEmpty(details.name) || isEmpty(details.area) || isEmpty(details.city))
        return false;

    store("hospitals", details);
}

function new_cost_detail(cost) {
    // validate
    if((isEmpty(cost.initialDeposit) && isEmpty(cost.perDayEstimateWithInsurance) && isEmpty(cost.perDayEstimateWithoutInsurance)) || isEmpty(cost.hospitalId))
        return false;

    hospitalRef = getReference("hospitals", cost.hospitalId);

    var details = {};
    details.hospitalRef = hospitalRef;
    if(!isEmpty(cost.initialDeposit))
        details.initialDeposit = cost.initialDeposit;
    if(!isEmpty(cost.perDayEstimateWithInsurance))
        details.perDayEstimateWithInsurance = cost.perDayEstimateWithInsurance;
    if(!isEmpty(cost.perDayEstimateWithoutInsurance))
        details.perDayEstimateWithoutInsurance = cost.perDayEstimateWithoutInsurance;

    store("cost", details);
}

function getHospitalData(hospitalRef) {
  return db.collection("hospitals").doc(hospitalRef).get().then(function(){
  });
}

function median(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var median = 0, numsLen = numbers.length;
    numbers.sort();

    if (
        numsLen % 2 === 0 // is even
    ) {
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }

    return median;
}


function calculateStat(numberList) {
  return {
    max: Math.max(numberList),
    min: Math.min(numberList),
    mean: numberList.reduce(function(acc, val) {
      return acc + val;
    }, 0) / numberList.length,
    median: median(numberList)
  };
}

function calculateStats(observations) {
    var allStats = [];
    Object.keys(observations).map(function(hospitalRef) {
        // Get Hospital Metadata
        var costList = observations[hospitalRef];

        var initialDepositList = costList.map(function (cost) {
            return cost.initialDeposit;
        });
        var initialDepositStat = calculateStat(initialDepositList);

        var perDayEstimateWithInsuranceList = costList.map(function (cost) {
            return cost.perDayEstimateWithInsurance;
        });
        var perDayEstimateWithInsuranceStat = calculateStat(perDayEstimateWithInsuranceList);

        var perDayEstimateWithoutInsuranceList = costList.map(function (cost) {
            return cost.perDayEstimateWithoutInsurance;
        });
        var perDayEstimateWithoutInsuranceStat = calculateStat(perDayEstimateWithoutInsuranceList);


        allStats.push({
            costEstimates: {
                initialDeposit: initialDepositStat,
                perDayEstimateWithInsurance: perDayEstimateWithInsuranceStat,
                perDayEstimateWithoutInsurance: perDayEstimateWithoutInsuranceStat
            }
        });
    });
    return allStats;
}

function listHospitalStats() {
    return db.collection("cost").get().then(function (querySnapshot) {
        var observationsByHospital = {};
        querySnapshot.forEach(function(costData) {
            var cost = costData.data();
            // Aggregate hospitals
            var hospitalId = cost.hospitalRef.id;

            if(observationsByHospital[hospitalId]) {
                observationsByHospital[hospitalId].push(cost);
            } else {
                observationsByHospital[hospitalId] = [cost];
            }
        });
        // Calculate stats
        return calculateStats(observationsByHospital);
    });
}





function initApp() {
  document.addEventListener('DOMContentLoaded', function() {
    listHospitalStats().then(function(data){
        var statsTableTemplate = document.getElementById('stats-table-template').innerHTML;
        var statsTable = document.querySelector('table#stats-table tbody');

        statsTable.innerHTML = Mustache.render(statsTableTemplate, {});

    });
  });
}

initApp();
