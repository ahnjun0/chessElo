// script.js
const K = 32;
const RESET_PASSWORD = '0000';

function getPlayersFromStorage() {
    const players = localStorage.getItem('players');
    return players ? JSON.parse(players) : [];
}

function savePlayersToStorage(players) {
    localStorage.setItem('players', JSON.stringify(players));
}

function getMatchesFromStorage() {
    const matches = localStorage.getItem('matches');
    return matches ? JSON.parse(matches) : [];
}

function saveMatchesToStorage(matches) {
    localStorage.setItem('matches', JSON.stringify(matches));
}

let players = getPlayersFromStorage();
let matches = getMatchesFromStorage();
let previousState = JSON.parse(JSON.stringify(players));

function updatePlayerList() {
    const winnerSelect = document.getElementById('winner');
    const loserSelect = document.getElementById('loser');
    
    winnerSelect.innerHTML = '';
    loserSelect.innerHTML = '';
    
    players.forEach(player => {
        const option1 = document.createElement('option');
        const option2 = document.createElement('option');
        
        option1.value = player.name;
        option1.textContent = player.name;
        option2.value = player.name;
        option2.textContent = player.name;
        
        winnerSelect.appendChild(option1);
        loserSelect.appendChild(option2);
    });
}

function calculateElo(winnerRating, loserRating) {
    const expectedScoreWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedScoreLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
    
    const newWinnerRating = winnerRating + K * (1 - expectedScoreWinner);
    const newLoserRating = loserRating + K * (0 - expectedScoreLoser);
    
    return {
        winner: Math.round(newWinnerRating),
        loser: Math.round(newLoserRating)
    };
}

function updateRatings() {
    const winnerName = document.getElementById('winner').value;
    const loserName = document.getElementById('loser').value;
    const time = document.getElementById('time').value;

    if (!time) {
        alert('Please select a time.');
        return;
    }

    if (winnerName === loserName) {
        alert('Winner and loser cannot be the same person.');
        return;
    }

    previousState = JSON.parse(JSON.stringify(players));

    const winner = players.find(player => player.name === winnerName);
    const loser = players.find(player => player.name === loserName);

    const newRatings = calculateElo(winner.rating, loser.rating);
    winner.rating = newRatings.winner;
    loser.rating = newRatings.loser;

    matches.unshift({ winner: winnerName, loser: loserName, time });
    if (matches.length > 5) {
        matches.pop();
    }

    savePlayersToStorage(players);
    saveMatchesToStorage(matches);
    updateRankingTable();
    updateRecentMatchesTable();
}

function cancelUpdate() {
    players = JSON.parse(JSON.stringify(previousState));
    savePlayersToStorage(players);
    updateRankingTable();
}

function resetStorage() {
	alert('All players, ratings, and match records will be lost.');
    const password = prompt('Enter reset password:');
    if (password === RESET_PASSWORD) {
        localStorage.removeItem('players');
        localStorage.removeItem('matches');
        players = [];
        matches = [];
        savePlayersToStorage(players);
        saveMatchesToStorage(matches);
        updatePlayerList();
        updateRankingTable();
        updateRecentMatchesTable();
		alert('Successful reset.');
    } else {
        alert('Incorrect password.');
    }
}

function addPerson() {
    const personName = document.getElementById('person-name').value.trim();
    if (personName && !players.some(player => player.name === personName)) {
        players.push({ name: personName, rating: 1200 });
        savePlayersToStorage(players);
        updatePlayerList();
        updateRankingTable();
        document.getElementById('person-name').value = '';
    } else {
        alert('Invalid name or name already exists.');
    }
}

function deletePerson() {
    const personName = document.getElementById('person-name').value.trim();
    const index = players.findIndex(player => player.name === personName);
    if (index !== -1) {
        players.splice(index, 1);
        savePlayersToStorage(players);
        updatePlayerList();
        updateRankingTable();
        document.getElementById('person-name').value = '';
    } else {
        alert('Player not found.');
    }
}

function updateRankingTable() {
    players.sort((a, b) => b.rating - a.rating);

    const rankingTable = document.getElementById('ranking-table');
    rankingTable.innerHTML = '';

    players.forEach((player, index) => {
        const row = document.createElement('tr');

        const rankCell = document.createElement('td');
        rankCell.textContent = index + 1;
        row.appendChild(rankCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = player.name;
        row.appendChild(nameCell);

        const ratingCell = document.createElement('td');
        ratingCell.textContent = player.rating;
        row.appendChild(ratingCell);

        rankingTable.appendChild(row);
    });
}

function updateRecentMatchesTable() {
    const recentMatchesTable = document.getElementById('recent-matches-table');
    recentMatchesTable.innerHTML = '';

    matches.forEach(match => {
        const row = document.createElement('tr');

        const timeCell = document.createElement('td');
        timeCell.textContent = new Date(match.time).toLocaleString();
        row.appendChild(timeCell);

        const winnerCell = document.createElement('td');
        winnerCell.textContent = match.winner;
        row.appendChild(winnerCell);

        const loserCell = document.createElement('td');
        loserCell.textContent = match.loser;
        row.appendChild(loserCell);

        recentMatchesTable.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updatePlayerList();
    updateRankingTable();
    updateRecentMatchesTable();
});
