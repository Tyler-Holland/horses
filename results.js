const tableContainer = document.getElementById('tableContainer');
const dateDiv = document.getElementById('dateDiv');
const resultsDiv = document.getElementById('resultsDiv');
const bestScoresDiv = document.getElementById('bestScoresDiv');
const resultsContainer = document.getElementById('resultsContainer');
const finalResults = document.getElementById('finalResults');

const dbSelectors = { "riderName": "Rider", "riderID": "ID", "horse": "Horse", "statDiv": "STAT/DIV", "test": "Test", "c": "Score" };

export async function showFullResults(showID) {
    tableContainer.innerHTML = '';
    bestScoresDiv.innerHTML = '';
    dateDiv.innerHTML = '';

    const showData = JSON.parse(localStorage.getItem(showID));
    const showDataKeys = Object.keys(showData);
    const dbSelectorsKeys = Object.keys(dbSelectors);
    let color = true;

    const tr = document.createElement('tr');

    dateDiv.innerText = `${showData.showInfo.date}: `;
    resultsDiv.innerText = "Full results";


    dbSelectorsKeys.forEach(key => {
        const th = document.createElement('th');
        th.innerText = dbSelectors[key];
        tr.append(th);
    })
    tableContainer.append(tr);

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
                    tableContainer.append(tr);
                }


            })
        }
    })
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

function showBestScores(scores) {
    tableContainer.innerHTML = '';
    bestScoresDiv.innerHTML = '';
   

    const divisions = Object.keys(scores);
    divisions.forEach(division => {
        const div = document.createElement('div');
        const divisionDiv = document.createElement('div');

        divisionDiv.innerText = division;
        divisionDiv.className = "divisionHeader";
        div.className = "division";
        div.append(divisionDiv);
        console.log(division);

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



            console.log(test);
            const riders = Object.keys(scores[division][test]);
            riders.forEach(rider => {
                const tr = document.createElement('tr');
                const td = document.createElement('td');

                td.innerText = rider;
                tr.append(td);



                console.log(rider);
                const horses = Object.keys(scores[division][test][rider]);
                horses.forEach(horse => {
                    const horseTD = document.createElement('td');
                    const scoreTD = document.createElement('td');

                    scoreTD.innerText = (scores[division][test][rider][horse] * 100).toFixed(3);
                    horseTD.innerText = horse;
                    tr.append(horseTD);
                    tr.append(scoreTD);

                    if (color) {
                        tr.style.background = "#555555";
                    } else {
                        tr.style.background = "#363636";
                    }
                    color = !color;
                    table.append(tr);
                    div.append(table);
                    bestScoresDiv.append(div);
                })
                console.log(horses);
            })
        })
    })
    console.log(scores);
}

const resultsToggle = document.getElementById('resultsToggle');
resultsToggle.addEventListener('click', async () => {
    const showID = localStorage.getItem('searchedID');

    if (resultsToggle.innerText === "Show best scores") {
        tableContainer.style.visibility = 'hidden';
        showBestScores(await getBestScores(showID));
        resultsToggle.innerText = "Show full results";
        resultsDiv.innerText = "Best scores";
        resultsContainer.style.width = `${bestScoresDiv.offsetWidth}px`;
        resultsContainer.style.height = `${bestScoresDiv.offsetHeight}px`;
    } else {
        tableContainer.style.visibility = 'visible';
        showFullResults(showID);
        resultsToggle.innerText = "Show best scores";
        resultsDiv.innerText = "Full results";
        resultsContainer.style.width = `${tableContainer.offsetWidth}px`;
        resultsContainer.style.height = `${tableContainer.offsetHeight}px`;
    }
});



window.addEventListener('DOMContentLoaded', () => {
    const searchedID = localStorage.getItem('searchedID');
    showsListDropdown();
    showFullResults(searchedID);
    setTableWidth();
});

function setTableWidth() {
    resultsContainer.style.width = `${tableContainer.offsetWidth}px`;
    resultsContainer.style.height = `${tableContainer.offsetHeight}px`;
}


document.addEventListener('click', (e) => {
    const id = e.target.id;
    const isInLocalStorage = Object.keys(localStorage).includes(id);

    if (isInLocalStorage) {
        localStorage.setItem('searchedID', id);
        showFullResults(id);
    }
});

function showsListDropdown() {
    const localStore = Object.keys(localStorage)
        .filter(key => {
            return Number.isInteger(Number.parseInt(key));
        })
        .sort((a, b) => a - b);
    const showDropdown = document.getElementById('showDropdown');

    localStore.forEach(key => {
        const isKeyANumber = Number.isInteger(Number.parseInt(key));

        if (isKeyANumber) {
            const date = JSON.parse(localStorage.getItem(key)).showInfo.date;
            const p = document.createElement('p');
            p.innerText = date;
            p.id = key;

            showDropdown.append(p);
        }
    })
}