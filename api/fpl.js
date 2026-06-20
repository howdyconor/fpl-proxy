export default async function handler(req, res) {
  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "No path provided" });

  const url = `https://fantasy.premierleague.com/api/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    if (!response.ok) throw new Error(`FPL API returned ${response.status}`);

    const data = await response.json();

    // Slim down bootstrap-static — strip fields we never use
    if (path.includes("bootstrap-static")) {
      const slim = {
        events: data.events,
        teams: data.teams,
        elements: data.elements.map(p => ({
          id: p.id, web_name: p.web_name, team: p.team,
          element_type: p.element_type, now_cost: p.now_cost,
          total_points: p.total_points, form: p.form,
          selected_by_percent: p.selected_by_percent,
          minutes: p.minutes, transfers_in_event: p.transfers_in_event,
          transfers_out_event: p.transfers_out_event,
          chance_of_playing_next_round: p.chance_of_playing_next_round,
          expected_goals: p.expected_goals, expected_assists: p.expected_assists,
          expected_goal_involvements: p.expected_goal_involvements,
          influence: p.influence, creativity: p.creativity,
          threat: p.threat, ict_index: p.ict_index,
          bps: p.bps, clean_sheets: p.clean_sheets, saves: p.saves,
          goals_scored: p.goals_scored, assists: p.assists,
        }))
      };
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "s-maxage=300");
      return res.status(200).json(slim);
    }

    // Slim down fixtures too
    if (path.includes("fixtures")) {
      const slim = data.map(f => ({
        id: f.id, team_h: f.team_h, team_a: f.team_a,
        team_h_difficulty: f.team_h_difficulty, team_a_difficulty: f.team_a_difficulty,
        finished: f.finished, event: f.event,
      }));
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "s-maxage=300");
      return res.status(200).json(slim);
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=60");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
