const dateDiv = document.getElementById('dateDiv');
const resultsDiv = document.getElementById('resultsDiv');
const bestScoresDiv = document.getElementById('bestScoresDiv');
const resultsContainer = document.getElementById('resultsContainer');
const allShows = document.getElementById('allShows');
const dateContainer = document.getElementById('dateContainer');
const resultsToggle = document.getElementById('resultsToggle');
const finalStandings = document.getElementById('finalStandings');
const statDivIsNo = document.getElementById('statDivIsNo');

const dbSelectors = { "riderName": "Rider", "riderID": "ID", "horse": "Horse", "statDiv": "STAT/DIV", "test": "Test", "c": "Score" };

function showFullResults(showID) {

    showDateAndResultsToggle(true);

    bestScoresDiv.innerHTML = '';
    dateDiv.innerHTML = '';

    const showData = JSON.parse(localStorage.getItem(showID));
    const showDataKeys = Object.keys(showData.riders);
    const dbSelectorsKeys = Object.keys(dbSelectors);

    const table = document.createElement('table');
    table.id = "fullResultsTable";

    const caption = document.createElement('caption');
    caption.innerText = "";
    table.append(caption);

    const tr = document.createElement('tr');

    dateDiv.innerText = `${showData.showInfo.date}: `;
    resultsDiv.innerText = "Full results";


    dbSelectorsKeys.forEach(key => {
        const th = document.createElement('th');
        th.className = dbSelectors[key].toLowerCase();
        th.innerText = dbSelectors[key];
        tr.append(th);
    })
    table.append(tr);

    showDataKeys.forEach(riderID => {
        showData.riders[riderID].data.forEach(round => {
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

                    if (key === "riderName") {
                        keyValue = showData["riders"][riderID].name;
                    }

                    td.innerText = keyValue;
                    tr.append(td);
                })
                table.append(tr);
            }
        })

    })
    bestScoresDiv.append(table);
    setTableWidth();

    resultsToggle.innerText = "Show best scores";
    resultsDiv.innerText = "Full results";
    resultsContainer.style.width = `${bestScoresDiv.offsetWidth}px`;
    resultsContainer.style.height = `${bestScoresDiv.offsetHeight}px`;
}

function getBestScores(showID) {
    const show = JSON.parse(localStorage.getItem(showID));
    const ridersAtShow = Object.keys(show.riders).filter(key => Number.isInteger(Number.parseInt(key)));

    let sorted = { "AA/Open": {} };

    ridersAtShow.forEach(riderID => {
        const name = show.riders[riderID].name;
        show.riders[riderID].data.forEach(round => {
            let division = round.statDiv;
            const test = round.test;
            const horse = round.horse;
            const score = round.c;

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

        })
    })
    return sorted;
}

function showBestScores(show, singleOrMulti) { // show should be ["date as a string", {show data as an object}]
    const date = show[0]; // Date of the show
    const scores = show[1]; // Rider scores from the show

    console.log(show);

    if (singleOrMulti === "single") {
        bestScoresDiv.innerHTML = '';
    } else {
        showDateAndResultsToggle(false);
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
            const table = document.createElement('table');
            const caption = document.createElement('caption');
            table.className = "test";
            caption.innerText = test;
            table.append(caption);

            const tr = document.createElement('tr');
            tr.innerHTML = `<th class="rider">Rider</th>
            <th class="horse">Horse</th>
            <th class="score">Score</th>`;
            table.append(tr);

            const riders = Object.keys(scores[division][test]);
            riders.forEach(rider => {

                const horses = Object.keys(scores[division][test][rider]);
                horses.forEach((horse) => {
                    const tr = document.createElement('tr');
                    const riderTD = document.createElement('td');

                    riderTD.innerText = rider;
                    tr.append(riderTD);

                    const horseTD = document.createElement('td');
                    const scoreTD = document.createElement('td');

                    scoreTD.innerText = (scores[division][test][rider][horse] * 100).toFixed(3);
                    horseTD.innerText = horse;
                    tr.append(horseTD);
                    tr.append(scoreTD);

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

resultsToggle.addEventListener('click', () => {
    const showID = localStorage.getItem('searchedID');

    if (resultsToggle.innerText === "Show best scores") {
        showBestScores([getShowDate(showID), getBestScores(showID)], "single");
        resultsToggle.innerText = "Show full results";
        resultsDiv.innerText = "Best scores";
        resultsContainer.style.width = `${bestScoresDiv.offsetWidth}px`;
        resultsContainer.style.height = `${bestScoresDiv.offsetHeight}px`;
        tableSort();
        sortTablesBy("score");
    } else {
        showFullResults(showID);
        tableSort();
        sortTablesBy("rider");
    }
});

function setTableWidth() {
    resultsContainer.style.width = `${bestScoresDiv.offsetWidth}px`;
    resultsContainer.style.height = `${bestScoresDiv.offsetHeight}px`;
}


document.addEventListener('click', (e) => {
    const showID = e.target.id;
    const isInLocalStorage = Object.keys(localStorage).includes(showID);

    if (isInLocalStorage) {
        const windowKeys = Object.keys(window);
        const regex = /Col\d/;
        windowKeys.forEach(key => {
            if (key.match(regex)) {
                delete window[key];
            }
        })

        localStorage.setItem('searchedID', showID);
        showFullResults(showID);
        tableSort();
        sortTablesBy("rider");
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
function showResultsOfAllShows() {
    const showArray = getAllScores();
    const showArrayKeys = Object.keys(showArray);
    bestScoresDiv.innerHTML = '';

    showArrayKeys.forEach(show => {
        show = [show, showArray[show]];
        showBestScores(show, "multi");
    })

    tableSort();
    sortTablesBy("score");
}

function getAllScores() {
    const showIDsStoredLocally = Object.keys(localStorage)
        .filter(key => {
            return Number.isInteger(Number.parseInt(key));
        })
        .sort((a, b) => a - b);

    let showArray = [];

    showIDsStoredLocally.forEach(showID => {
        const date = getShowDate(showID);
        showArray.push([date, getBestScores(showID)]);
    })

    let listOfShows = {};

    showIDsStoredLocally.forEach(showID => {
        const date = getShowDate(showID);
        listOfShows[date] = getBestScores(showID);
    })

    return listOfShows;
}

function getStatDivsThatAreNo() {
    const showIDsStoredLocally = Object.keys(localStorage)
        .filter(key => {
            return Number.isInteger(Number.parseInt(key));
        })
        .sort((a, b) => a - b);

    let ridersWithStatDivOfNo = {};
    let ridersArray = [];

    showIDsStoredLocally.forEach(showID => {
        const show = JSON.parse(localStorage.getItem(showID));
        const ridersAtShow = Object.keys(show.riders)

        // console.log(show);
        ridersAtShow.forEach(rider => {
            const riderData = show.riders[rider].data;

            riderData.forEach((showRound, idx) => {
                const statDivIsNo = showRound.statDiv === "No";
                console.log(idx);
                if (statDivIsNo) {

                    if (ridersArray.includes())

                    if (!ridersWithStatDivOfNo[showID]) {
                        ridersWithStatDivOfNo[showID] = [rider];

                        const testOutput = `${showID}-${rider}-${idx}`;
                        console.log(testOutput);
                    } else if (ridersWithStatDivOfNo[showID] && !ridersWithStatDivOfNo[showID].includes(rider)) {
                        console.log("test");
                        ridersWithStatDivOfNo[showID].push(rider);
                    }
                }
                // console.log(statDivIsNo);
            })
        })
        // console.log(show);
        // console.log(ridersAtShow);

    })
    console.log(ridersWithStatDivOfNo);



    // let showArray = [];
    // showIDsStoredLocally.forEach(showID => {
    //     const date = getShowDate(showID);
    //     showArray.push([date, getBestScores(showID)]);
    // })

    // let listOfShows = {};

    // showIDsStoredLocally.forEach(showID => {
    //     const date = getShowDate(showID);
    //     listOfShows[date] = getBestScores(showID);
    // })
}
getStatDivsThatAreNo();

statDivIsNo.addEventListener('click', () => {
    showDateAndResultsToggle(false);
    bestScoresDiv.innerHTML = '';

    console.log("hello");
})

function showDateAndResultsToggle(bool) {
    if (bool === true) {
        dateContainer.style.visibility = "visible";
        dateContainer.style.position = "relative";
        resultsToggle.style.visibility = "visible";
        resultsToggle.style.position = "relative";
    } else {
        dateContainer.style.visibility = "hidden";
        dateContainer.style.position = "absolute";
        resultsToggle.style.visibility = "hidden";
        resultsToggle.style.position = "absolute";
    }
}


finalStandings.addEventListener('click', () => {
    const finalResults = calculateFinalResults();

    showDateAndResultsToggle(false);
    showBestScores(finalResults[0], finalResults[1]);
    tableSort(); // Makes tables on the page sortable by their headers
    sortTablesBy("score");
});

function sortTablesBy(header) {
    const columnsToSort = document.querySelectorAll(`.${header}`);
    // window.asc = false;

    if (header === "score") {
        columnsToSort.forEach(column => {
            column.click();
            column.click();
        });
    } else {
        columnsToSort.forEach(column => {
            column.click();
            // column.click();

        });
    }
    // switch (header) {
    //     case "score":
    //         columnsToSort.forEach(column => {
    //             column.click();
    //             column.click();
    //         });
    //         break;

    //     case "rider":
    //         columnsToSort.forEach(column => {
    //             column.click();
    //         });
    //         break;
    //     default:
    //         console.log("tableSortDefault() switch default case");
    // }

}

function calculateFinalResults() {
    const listOfShows = getAllScores();
    const listOfShowsKeys = Object.keys(listOfShows);
    let topTwoScores = {};

    listOfShowsKeys.forEach(showDate => {
        const showData = listOfShows[showDate];
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

    // // do the work...
    // document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
    //     const table = th.closest('table');
    //     Array.from(table.querySelectorAll('tr:nth-child(n+3)'))
    //         .sort(comparer(Array.from(th.parentNode.children).indexOf(th), window.asc = !window.asc))
    //         .forEach(tr => table.appendChild(tr));
    // })));

    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        const table = th.closest('table');
        const array = Array.from(table.querySelectorAll('tr:nth-child(n+3)'));

        const columnHeaders = Array.from(th.parentNode.children);
        const headerLength = columnHeaders.length;
        const clickedHeader = Array.from(th.parentNode.children).indexOf(th);

        for (let i = 0; i < headerLength; i++) {
            if (i !== clickedHeader) {
                if (i === headerLength - 1) {
                    window[`Col${i}`] = true;
                } else {
                    window[`Col${i}`] = false;
                }
            }
        }

        const newArray = array.sort(comparer(clickedHeader,
            window[`Col${clickedHeader}`] = !window[`Col${clickedHeader}`]));
        newArray.forEach(tr => table.appendChild(tr));
    })));
}

window.onload = () => {
    const searchedID = localStorage.getItem('searchedID');
    showsListDropdown();
    showFullResults(searchedID);
    setTableWidth();
    tableSort();
    sortTablesBy("rider");
}