// I don't like things being in the top line

const searchBtn = document.getElementById("searchBtn");
searchBtn.addEventListener('click', getResults);

async function getResults() { // Gets the results from a specific show and stores them in localStorage using the ID of the show
    const searchBar = document.getElementById('searchBar');
    const url = searchBar.value;
    const isValidShowURL = /www\.foxvillage\.com\/show\?id=\d+$/.test(url);

    if (isValidShowURL) {
        const showID = url.match(/\d+$/)[0];
        const riderList = await fetch(`https://corsanywhere.herokuapp.com/https://www.foxvillage.com/show/GetRiderData?id=${showID}`)
            .then(response => response.json())
            .then(json => json.riderData);
        const showData = await getShowData(showID, riderList, url);

        localStorage.setItem(`${showID}`, JSON.stringify(showData))
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
        "Date": await getDate(showID),
        "# of riders": riderList.length
    };

    for (const rider of riderList) {
        const id = rider.riderID;
        const riderName = await getRiderName(rider.riderName);
        const riderData = await fetch(`https://corsanywhere.herokuapp.com/https://www.foxvillage.com/show/GetAllRiderData?show=${showID}&id=${id}`)
            .then(response => response.json());

        riderData.riderPageData.unshift(riderName);
        showInfo[rider.riderID] = riderData.riderPageData;
        i++;
        loadingBarText.innerText = `Getting rider data: ${i}/${riderList.length}`;
        loadingBar.style.width = `${(i / riderList.length) * 100}%`
    }
    loadingBarText.innerText = `Getting rider data: Complete!`;
    return showInfo;
}

async function getRiderName(input) {
    const regex = /[A-Za-z][a-z]+, [A-Za-z][a-z]+/; // Input looks like: <a href='/result?type=rider&showid=9334&id=9'>Thurston, Elizabeth</a>
    const rawName = input.match(regex)[0];
    const splitName = rawName.replace(',', '').split(' '); // Remove the comma from the name
    const finalName = `${splitName[1]} ${splitName[0]}`;   // and then set it to firstName lastName

    return finalName;
}

async function getDate(showID) {
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    console.log(showID);
    const show = await fetch(`https://corsanywhere.herokuapp.com/https://www.foxvillage.com/show/GetClassData?id=${showID}`)
        .then(response => response.json())
        .then(json => json.classData[0].date);
    const date = show.match(dateRegex)[0]

    console.log(date);
    return date;
}