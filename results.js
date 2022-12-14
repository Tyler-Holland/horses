const dateDiv = document.getElementById('dateDiv');
const resultsDiv = document.getElementById('resultsDiv');
const bestScoresDiv = document.getElementById('bestScoresDiv');
const resultsContainer = document.getElementById('resultsContainer');
const allShows = document.getElementById('allShows');
const dateContainer = document.getElementById('dateContainer');
const resultsToggle = document.getElementById('resultsToggle');
const finalStandings = document.getElementById('finalStandings');

const dbSelectors = { "riderName": "Rider", "riderID": "ID", "horse": "Horse", "statDiv": "STAT/DIV", "test": "Test", "c": "Score" };

export async function showFullResults(showID) {

    dateContainer.style.visibility = "visible";
    dateContainer.style.position = "relative";
    resultsToggle.style.visibility = "visible";
    resultsToggle.style.position = "relative";

    bestScoresDiv.innerHTML = '';
    dateDiv.innerHTML = '';

    const showData = JSON.parse(localStorage.getItem(showID));
    const showDataKeys = Object.keys(showData);
    const dbSelectorsKeys = Object.keys(dbSelectors);
    let color = true;

    const table = document.createElement('table');
    const tr = document.createElement('tr');

    dateDiv.innerText = `${showData.showInfo.date}: `;
    resultsDiv.innerText = "Full results";


    dbSelectorsKeys.forEach(key => {
        const th = document.createElement('th');
        th.innerText = dbSelectors[key];
        tr.append(th);
    })
    table.append(tr);

    showDataKeys.forEach(riderID => {
        const parsed = Number.parseInt(riderID);

        if (parsed) {
            showData[riderID].forEach(round => {
                if (typeof round === "object") {
                    const tr = document.createElement('tr');

                    dbSelectorsKeys.forEach(key => {
                        const td = document.createElement('td');
                        let keyValue = round[key];

                        if (key === "c") {
                            keyValue = (keyValue * 100).toFixed(3);
                        }

                        if (key === "riderID") {
                            keyValue = riderID;
                        }

                        td.innerText = keyValue;
                        tr.append(td);
                    })

                    if (color) {
                        tr.style.background = "#242424";
                    } else {
                        tr.style.background = "#2c2c2c";
                    }
                    color = !color;
                    table.append(tr);
                }
            })
        }
    })
    bestScoresDiv.append(table);
    setTableWidth();

    resultsToggle.innerText = "Show best scores";
    resultsDiv.innerText = "Full results";
    resultsContainer.style.width = `${bestScoresDiv.offsetWidth}px`;
    resultsContainer.style.height = `${bestScoresDiv.offsetHeight}px`;
}

async function getBestScores(showID) {
    const show = JSON.parse(localStorage.getItem(showID));
    const ridersAtShow = Object.keys(show).filter(key => Number.isInteger(Number.parseInt(key)));

    let sorted = { "AA/Open": {} };

    ridersAtShow.forEach(rider => {
        show[rider].forEach(round => {
            if (typeof round === 'object') {
                let division = round.statDiv;
                const test = round.test;
                const horse = round.horse;
                const score = round.c;
                const name = round.riderName;

                if (division === "Adult Amateur" | division === "Open") { // Merges the "Adult Amateur" and "Open" divisions into one
                    division = "AA/Open";
                }

                if (!sorted[division]) {
                    sorted[division] = {};
                }

                if (!sorted[division][test]) {
                    sorted[division][test] = {};
                }

                if (!sorted[division][test][name]) {
                    sorted[division][test][name] = {};
                }

                if (!sorted[division][test][name][horse] || score > sorted[division][test][name][horse]) {
                    sorted[division][test][name][horse] = score;
                }
            }
        })
    })
    return sorted;
}

function showBestScores(show, singleOrMulti) { // show should be ["date as a string", {show data as an object}]
    const date = show[0]; // Date of the show
    const scores = show[1]; // Rider scores from the show

    if (singleOrMulti === "single") {
        bestScoresDiv.innerHTML = '';
    } else {
        dateContainer.style.visibility = "hidden";
        dateContainer.style.position = "absolute";
        resultsToggle.style.visibility = "hidden";
        resultsToggle.style.position = "absolute";
    }

    const masterDiv = document.createElement('div');
    const dateDiv = document.createElement('div');

    dateDiv.innerText = `Date: ${date}`;
    dateDiv.className = "date";
    masterDiv.append(dateDiv);

    const showDiv = document.createElement('div');
    showDiv.className = "flex";
    showDiv.id = "showDiv";

    const divisions = Object.keys(scores);
    divisions.forEach(division => {
        const div = document.createElement('div');
        const divisionDiv = document.createElement('div');

        divisionDiv.innerText = division;
        divisionDiv.className = "divisionHeader";
        div.className = "division";
        div.append(divisionDiv);

        const tests = Object.keys(scores[division]);
        tests.forEach(test => {
            let color = true;
            const table = document.createElement('table');
            const caption = document.createElement('caption');
            table.className = "test";
            caption.innerText = test;
            table.append(caption);

            const tr = document.createElement('tr');
            tr.innerHTML = `<th>Rider</th>
            <th>Horse</th>
            <th>Score</th>`;
            tr.style.background = "#363636";
            table.append(tr);

            const riders = Object.keys(scores[division][test]);
            riders.forEach(rider => {

                const horses = Object.keys(scores[division][test][rider]);
                horses.forEach((horse) => {
                    const tr = document.createElement('tr');
                    const td = document.createElement('td');

                    td.innerText = rider;
                    tr.append(td);

                    const horseTD = document.createElement('td');
                    const scoreTD = document.createElement('td');

                    scoreTD.innerText = (scores[division][test][rider][horse] * 100).toFixed(3);
                    horseTD.innerText = horse;
                    tr.append(horseTD);
                    tr.append(scoreTD);

                    if (color) {
                        tr.style.background = "#555555";
                    } else {
                        tr.style.background = "#424242";
                    }
                    color = !color;
                    table.append(tr);
                    div.append(table);
                    showDiv.append(div);
                })

            })

        })
    })
    masterDiv.append(showDiv);
    bestScoresDiv.append(masterDiv);
    setTableWidth();
}

resultsToggle.addEventListener('click', async () => {
    const showID = localStorage.getItem('searchedID');

    if (resultsToggle.innerText === "Show best scores") {
        showBestScores([getShowDate(showID), await getBestScores(showID)], "single");
        resultsToggle.innerText = "Show full results";
        resultsDiv.innerText = "Best scores";
        resultsContainer.style.width = `${bestScoresDiv.offsetWidth}px`;
        resultsContainer.style.height = `${bestScoresDiv.offsetHeight}px`;
    } else {
        showFullResults(showID);
    }
});



window.addEventListener('DOMContentLoaded', () => {
    const searchedID = localStorage.getItem('searchedID');
    showsListDropdown();
    showFullResults(searchedID);
    setTableWidth();
});

function setTableWidth() {
    resultsContainer.style.width = `${bestScoresDiv.offsetWidth}px`;
    resultsContainer.style.height = `${bestScoresDiv.offsetHeight}px`;
}


document.addEventListener('click', (e) => {
    const showID = e.target.id;
    const isInLocalStorage = Object.keys(localStorage).includes(showID);

    if (isInLocalStorage) {
        localStorage.setItem('searchedID', showID);
        showFullResults(showID);
    }
});

function showsListDropdown() {
    const showIDsStoredLocally = Object.keys(localStorage)
        .filter(key => {
            return Number.isInteger(Number.parseInt(key));
        })
        .sort((a, b) => a - b);
    const showDropdown = document.getElementById('showDropdown');

    showIDsStoredLocally.forEach(showID => {
        const isKeyANumber = Number.isInteger(Number.parseInt(showID));

        if (isKeyANumber) {
            const date = getShowDate(showID);
            const p = document.createElement('p');
            p.innerText = date;
            p.id = showID;

            showDropdown.append(p);
        }
    })
}

allShows.addEventListener('click', showResultsOfAllShows);
async function showResultsOfAllShows() {
    const showArray = await getAllScores();
    bestScoresDiv.innerHTML = '';

    showArray.forEach(show => {
        showBestScores(show, "multi");
    })
}

async function getAllScores() {
    const showIDsStoredLocally = Object.keys(localStorage)
        .filter(key => {
            return Number.isInteger(Number.parseInt(key));
        })
        .sort((a, b) => a - b);

    let showArray = [];

    showIDsStoredLocally.forEach(async showID => {
        const date = getShowDate(showID);
        showArray.push([date, await getBestScores(showID)]);
    })

    return showArray;
}


finalStandings.addEventListener('click', async () => {
    const finalResults = await calculateFinalResults();

    const myPromise = new Promise((resolve, reject) => {
        showBestScores(finalResults[0], finalResults[1]);
    });
    // showBestScores(finalResults[0], finalResults[1]);
    // console.log(finalResults[0]);

    myPromise.then(tableSort());
});
async function calculateFinalResults() {
    const listOfShows = await getAllScores();
    let topTwoScores = {};

    listOfShows.forEach(show => {
        const showData = show[1];
        const showKeys = Object.keys(showData);

        showKeys.forEach(division => {
            if (!topTwoScores[division]) {
                topTwoScores[division] = {};
            }
            const divisionKeys = Object.keys(showData[division]);

            divisionKeys.forEach(test => {
                if (!topTwoScores[division][test]) {
                    topTwoScores[division][test] = {};
                }
                const testKeys = Object.keys(showData[division][test]);

                testKeys.forEach(rider => {
                    if (!topTwoScores[division][test][rider]) {
                        topTwoScores[division][test][rider] = {};
                    }
                    const riderKeys = Object.keys(showData[division][test][rider]);

                    riderKeys.forEach(horse => {
                        if (!topTwoScores[division][test][rider][horse]) {
                            topTwoScores[division][test][rider][horse] = [showData[division][test][rider][horse]];
                        } else {
                            const scoreArray = topTwoScores[division][test][rider][horse];
                            const score = showData[division][test][rider][horse];

                            if (scoreArray.length === 2) {
                                if (scoreArray[0] > scoreArray[1]) {
                                    scoreArray.splice(1, 1, score);
                                } else {
                                    scoreArray.splice(0, 1, score);
                                }
                            } else {
                                scoreArray.push(score);
                            }
                        }
                    })
                })
            })
        })
    })


    Object.keys(topTwoScores).forEach(division => {
        const divisionKeys = Object.keys(topTwoScores[division]);

        divisionKeys.forEach(test => {
            const testKeys = Object.keys(topTwoScores[division][test]);

            testKeys.forEach(rider => {
                const riderKeys = Object.keys(topTwoScores[division][test][rider]);

                riderKeys.forEach(horse => {
                    const scores = topTwoScores[division][test][rider][horse];
                    const score1 = Number.parseFloat(scores[0]);
                    const score2 = Number.parseFloat(scores[1]);

                    if (scores.length === 2 && score1 === 0 || scores.length === 2 && score2 === 0) {
                        topTwoScores[division][test][rider][horse] = 0;
                    } else if (scores.length === 2) {
                        topTwoScores[division][test][rider][horse] = (score1 + score2) / 2;
                    } else {
                        topTwoScores[division][test][rider][horse] = Number.parseFloat(scores[0]);
                    }
                })
            })
        })
    })
    const key1 = ["Average of all shows", topTwoScores];
    const key2 = "single";

    return [key1, key2];
    // showBestScores(["Average of all shows", topTwoScores], "single");
}

function getShowDate(showID) {
    return JSON.parse(localStorage.getItem(showID)).showInfo.date;
}


function tableSort() {
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    // do the work...
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        const table = th.closest('table');
        console.log(table);
        Array.from(table.querySelectorAll('tr:nth-child(n+3)'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), window.asc = !window.asc))
            .forEach(tr => table.appendChild(tr));
    })));
}

window.onload = function () {
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;

    const comparer = (idx, asc) => (a, b) => ((v1, v2) =>
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    // do the work...
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        const table = th.closest('table');
        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => table.appendChild(tr));
    })));
}