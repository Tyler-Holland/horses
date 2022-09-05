// I don't like things being in the top line

const searchBar = document.getElementById('searchBar');
const corsProxyURL = "https://cors-anywhere.herokuapp.com/";

const searchBtn = document.getElementById("searchBtn");
searchBtn.addEventListener('click', async () => {
    const url = searchBar.value; // The url the user submitted
    const isValidShowURL = /foxvillage\.com\/show\?id=\d+$/.test(url); // Check if it's the correct format of a show url

    if (isValidShowURL) {
        const showID = url.match(/\d+$/)[0]; // Takes the show ID from the url
        let riderList = await getRiderListFromShow(showID); // Fetches a list of riders and their IDs at the show

        riderList = riderList.map(rider => { // Changes riderName from: '<a href='/result?type=rider&showid=9335&id=8'>lastName, firstName</a>'
            return { ...rider, "riderName": trimInput(rider.riderName, "rider") } // to: 'firstName lastName'
        });

        const showData = await getShowData(showID, riderList, url);

        localStorage.setItem(showID, JSON.stringify(showData));
        localStorage.setItem('searchedID', showID);

        // window.location.href = "./results.html";
        console.log(showData);

        addToRiderDB(riderList); // Adds riders and their IDs to localStorage "riderDB"
    } else {
        window.alert("Not a valid URL");
    }
});

async function getRiderListFromShow(showID) {
    const riderList = await fetch(`${corsProxyURL}https://www.foxvillage.com/show/GetRiderData?id=${showID}`)
        .then(response => response.json())
        .then(json => json.riderData);

    return riderList;
}

// async function getResults() { // Gets the results from a specific show and stores them in localStorage using the ID of the show
//     const url = searchBar.value; // The url the user submitted
//     const isValidShowURL = /foxvillage\.com\/show\?id=\d+$/.test(url); // Check if it's the correct format of a show url

//     if (isValidShowURL) {
//         const showID = url.match(/\d+$/)[0]; // Takes the show ID from the url
//         let riderList = await getRiderListFromShow(showID); // Fetches a list of riders and their IDs at the show

//         riderList = riderList.map(rider => { // Changes riderName from: '<a href='/result?type=rider&showid=9335&id=8'>lastName, firstName</a>'
//             return { ...rider, "riderName": trimInput(rider.riderName, "rider") } // to: 'firstName lastName'
//         });

//         const showData = await getShowData(showID, riderList, url);

//         localStorage.setItem(showID, JSON.stringify(showData));
//         localStorage.setItem('searchedID', showID);

//         // window.location.href = "./results.html";
//         console.log(showData);
//     } else {
//         window.alert("Not a valid URL");
//     }
// }

async function getShowData(showID, riderList, url) {
    const loadingBarText = document.getElementById("loadingBarText");
    let showInfo = {};
    let i = 0;

    showInfo["showInfo"] = {
        "url": url,
        "date": await getDate(showID),
        "# of riders": riderList.length
    };

    const ridersAtShow = riderList.map(rider => {
        return [rider.riderID, rider.riderName];
    });

    const riderInfo = ridersAtShow.map(rider => fetch(`${corsProxyURL}https://www.foxvillage.com/show/GetAllRiderData?show=${showID}&id=${rider[0]}`));
    const fetchedInfo = await Promise.all(riderInfo); // this will be a list of Response objects
    const parsedJson = await Promise.all(fetchedInfo.map(resp => resp.json())); // This will be a list of JSON parsed from each response object
    const riderPageData = parsedJson.map(rider => rider.riderPageData);

    showInfo["riders"] = {};
    for (let i = 0; i < ridersAtShow.length; i++) {
        const riderName = ridersAtShow[i][1];
        const riderID = ridersAtShow[i][0];

        showInfo["riders"][riderID] = { "name": riderName, "data": riderPageData[i] };
    }

    const riderKeys = Object.keys(showInfo["riders"]);

    riderKeys.forEach(key => {
        showInfo["riders"][key]["data"].forEach(showRun => {
            showRun.horse = trimInput(showRun.horse, "horse");
            showRun.classText = trimInput(showRun.classText, "number");
            showRun.entryNum = trimInput(showRun.entryNum, "number");
            showRun.day = trimInput(showRun.day, "day");
            showRun.rideTime = new Date(`${showRun.rideTime}`).toLocaleTimeString();
            showRun.test = trimInput(showRun.test, "test");
        })
    })

    loadingBarText.innerText = `Getting rider data: Complete!`;
    return showInfo;
}

function trimInput(input, type) {
    if (type === "day") {
        const dayRegex = /\d{4}-\d{2}-\d{2}/;
        const dayMatch = input.match(dayRegex)[0];

        return dayMatch;
    } else if (type === "test") {
        const regex = /(?:Introductory)|(?:Training)|(?:First)|(?:Second)|(?:Third)|(?:Fourth)|(?:Prix St\. Georges)|(?:Intermediate)|(?:Grand Prix)/;
        const regexMatch = input.match(regex)[0];

        return regexMatch;
    } else {

        const regex = />(.+)</;
        const regexMatch = input.match(regex)[1];

        switch (type) {
            case "rider":
                const splitName = regexMatch.split(',');
                let firstName = splitName[1].charAt(1).toUpperCase() + splitName[1].substring(2);
                if (firstName === "Jeniffer") firstName = "Jennifer";
                const lastName = splitName[0].charAt(0).toUpperCase() + splitName[0].substring(1);
                const tempName = `${firstName} ${lastName}`.trim();
                const finalName = tempName.replace('-', ' ');
                return finalName;
                break;

            case "horse":
            case "number":
                if (regexMatch === "JETSON P" || regexMatch === "JetsonP") return "Jetson P";
                return regexMatch;
                break;
            default:
                console.log("getName() default switch case");
        }
    }
}

async function getDate(showID) {
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    console.log(showID);
    const show = await fetch(`${corsProxyURL}https://www.foxvillage.com/show/GetClassData?id=${showID}`)
        .then(response => response.json())
        .then(json => json.classData[0].date);
    const date = show.match(dateRegex)[0]

    console.log(date);
    return date;
}

function addToRiderDB(riderList) {
    console.log(riderList);
    if (!localStorage.getItem('riderDB')) {
        localStorage.setItem('riderDB', JSON.stringify({}));
    }

    let riderDB = JSON.parse(localStorage.getItem('riderDB'));
    const riderDBkeys = Object.keys(riderDB);
    let ridersWithMoreThanOneID = {};

    riderList.forEach(rider => {
        const riderID = rider.riderID;
        const riderName = rider.riderName;

        riderDBkeys.forEach(key => {
            if (riderDB[key].includes(riderName)) {
                if (ridersWithMoreThanOneID[riderName]) {
                    ridersWithMoreThanOneID[riderName].push(key);
                } else {
                    ridersWithMoreThanOneID[riderName] = [key];
                }
            }
        });

        if (!riderDB[riderID]) {
            riderDB[riderID] = [riderName];
        } else if (!riderDB[riderID].includes(riderName)) {
            riderDB[riderID].push(riderName);
            window.alert("Duplicates detected. Please check console for more information.");            
            console.error(`The following rider(s) share the ID: ${riderID}`);
            console.error(riderDB[riderID]);
        }

    })

    const keysOfRidersWithMoreThanOneID = Object.keys(ridersWithMoreThanOneID);
    let hasDuplicates = false;

    keysOfRidersWithMoreThanOneID.forEach(rider => {
        if (ridersWithMoreThanOneID[rider].length > 1) {
            hasDuplicates = true;
        } else {
            delete ridersWithMoreThanOneID[rider];
        }
    })

    if (hasDuplicates) {
        window.alert("Duplicates detected. Please check console for more information.");
        console.error("The following rider(s) have more than one ID");
        console.error(ridersWithMoreThanOneID);
    }

    localStorage.setItem('riderDB', JSON.stringify(riderDB));
}