import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function testPlayerStatistics() {
    try {
        console.log("Starting test...");

        // 1. Log in as Super Admin
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@tform.com',
            password: 'admin'
        });
        const token = loginRes.data.token;
        console.log("Logged in.", token.substring(0, 15) + "...");

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Create Tournament
        const tourRes = await axios.post(`${API_URL}/tournaments`, {
            name: "Stats Test Cup",
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            category: "Senior"
        }, { headers });
        const tournamentId = tourRes.data.id;
        console.log("Tournament created:", tournamentId);

        // 3. Create Players
        const p1Res = await axios.post(`${API_URL}/players`, {
            name: "Lionel Messi", nickname: "Leo"
        }, { headers });
        const p1Id = p1Res.data.id;

        const p2Res = await axios.post(`${API_URL}/players`, {
            name: "Cristiano Ronaldo", nickname: "CR7"
        }, { headers });
        const p2Id = p2Res.data.id;
        console.log("Players created:", p1Id, p2Id);

        // 4. Create Teams & Assign Players
        const tA_Res = await axios.post(`${API_URL}/teams`, {
            name: "Inter Miami", playerIds: [p1Id], tournamentId
        }, { headers });
        const teamAId = tA_Res.data.id;

        const tB_Res = await axios.post(`${API_URL}/teams`, {
            name: "Al Nassr", playerIds: [p2Id], tournamentId
        }, { headers });
        const teamBId = tB_Res.data.id;
        console.log("Teams created:", teamAId, teamBId);

        // 5. Create Round
        const roundRes = await axios.post(`${API_URL}/tournaments/${tournamentId}/rounds`, {
            name: "Final"
        }, { headers });
        const roundId = roundRes.data.id;

        // 6. Create Match
        const matchRes = await axios.post(`${API_URL}/rounds/${roundId}/matches`, {
            teamAId,
            teamBId,
            date: new Date().toISOString()
        }, { headers });
        const matchId = matchRes.data.id;
        console.log("Match created:", matchId);

        // 7. Add Incidents (Messi 2 goals, CR7 1 yellow)
        await axios.post(`${API_URL}/matches/${matchId}/incidents`, {
            type: "GOAL", playerId: p1Id, minute: 15, teamId: teamAId
        }, { headers });
        await axios.post(`${API_URL}/matches/${matchId}/incidents`, {
            type: "GOAL", playerId: p1Id, minute: 89, teamId: teamAId
        }, { headers });
        await axios.post(`${API_URL}/matches/${matchId}/incidents`, {
            type: "YELLOW_CARD", playerId: p2Id, minute: 45, teamId: teamBId
        }, { headers });
        console.log("Incidents added.");

        // 8. Complete Match
        await axios.put(`${API_URL}/matches/${matchId}`, {
            status: "completed",
            result: { scoreA: 2, scoreB: 0 }
        }, { headers });
        console.log("Match completed!");

        // 9. Verify Players Statistics
        const updatedP1Res = await axios.get(`${API_URL}/players/${p1Id}`);
        console.log("Messi Stats:", updatedP1Res.data.statistics);

        const updatedP2Res = await axios.get(`${API_URL}/players/${p2Id}`);
        console.log("CR7 Stats:", updatedP2Res.data.statistics);

        console.log("Test Finished!");

    } catch (error: any) {
        console.error("Test failed:", error?.response?.data || error.message);
    }
}

testPlayerStatistics();
