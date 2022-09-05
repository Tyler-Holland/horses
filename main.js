// I don't like things being in the top line


const corsProxyURL = "https://cors-anywhere.herokuapp.com/";

const searchBtn = document.getElementById("searchBtn");
searchBtn.addEventListener('click', getResults);

async function getResults() { // Gets the results from a specific show and stores them in localStorage using the ID of the show
    const searchBar = document.getElementById('searchBar');
    const url = searchBar.value;
    const isValidShowURL = /foxvillage\.com\/show\?id=\d+$/.test(url);

    if (isValidShowURL) {
        const showID = url.match(/\d+$/)[0];
        const riderList = await fetch(`${corsProxyURL}https://www.foxvillage.com/show/GetRiderData?id=${showID}`)
            .then(response => response.json())
            .then(json => json.riderData);

        const showData = await getShowData(showID, riderList, url);

        localStorage.setItem(showID, JSON.stringify(showData));
        localStorage.setItem('searchedID', showID);

        window.location.href = "./results.html";
        console.log(showData);
    } else {
        window.alert("Not a valid URL");
    }
}

async function getShowData(showID, riderList, url) {
    const loadingBar = document.getElementById("loadingBar");
    const loadingBarText = document.getElementById("loadingBarText");
    let showInfo = {};
    let i = 0;

    showInfo["showInfo"] = {
        "url": url,
        "date": await getDate(showID),
        "# of riders": riderList.length
    };


    for (const rider of riderList) {
        const id = rider.riderID;
        const riderData = await fetch(`${corsProxyURL}https://www.foxvillage.com/show/GetAllRiderData?show=${showID}&id=${id}`)
            .then(response => response.json())
            .then(json => json.riderPageData);
        let riderName = await trimInput(rider.riderName, "rider");

        await riderData.forEach(async (entry) => {
            const p0 = trimInput(rider.riderName, "rider");
            const p1 = trimInput(entry.horse, "horse");
            const p2 = trimInput(entry.classText, "number");
            const p3 = trimInput(entry.entryNum, "number");
            const p4 = trimInput(entry.day, "day");
            const p5 = new Date(`${entry.rideTime}`).toLocaleTimeString();
            const p6 = trimInput(entry.test, "test");

            const promises = await Promise.all([p0, p1, p2, p3, p4, p5, p6]);

            entry.riderName = promises[0];
            entry.horse = promises[1];
            entry.classText = promises[2];
            entry.entryNum = promises[3];
            entry.day = promises[4];
            entry.rideTime = promises[5];
            entry.test = promises[6];           
        })

        console.log(riderName);
        riderData.unshift(riderName);
        showInfo[id] = await riderData;
        i++;
        loadingBarText.innerText = `Getting rider data: ${i}/${riderList.length}`;
        loadingBar.style.width = `${(i / riderList.length) * 100}%`
    }
    loadingBarText.innerText = `Getting rider data: Complete!`;
    return showInfo;
}

async function trimInput(input, type) {
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
            case "day":

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

function addToRiderDB() {
    const showIDs = [9259, 9281, 9334, 9335];
    let names = JSON.parse(localStorage.getItem('riderDB'));

    if (names) {
    showIDs.forEach(id => {
        const showData = JSON.parse(localStorage.getItem(id));
        const showDataKeys = Object.keys(showData);

        showDataKeys.forEach(key => {
            if (!Number.parseFloat(key)) return;
            
            const rider = showData[key][0];

            if (!names[key]) {
                names[key] = rider;
                console.log(rider);
            } 
        })

    })
    }


    localStorage.setItem('riderDB', JSON.stringify(names));
    console.log(names);
}
addToRiderDB();