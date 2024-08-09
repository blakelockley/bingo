import { Tile as _Tile, Team } from './interfaces';
import { useEffect, useState } from 'react';
import TileModal from './TileModal';
import Tile from './Tile';
import { ChartBarIcon } from '@heroicons/react/solid';
import LeaderboardModal from './LeaderboardModal';
import FAQModal from './FAQModal';

const SPREADSHEET_ID = "1PvCyLxRjOE03WjubusMhiYOYaG11zvAtcr2uu_MedNU";

export function App() {
  const [currentTile, setCurrentTile] = useState<_Tile>();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const [faq, setFaq] = useState<string>();
  const [teams, setTeams] = useState<Array<Team>>();

  const [accessToken, setAccessToken] = useState<string>();
  const [tileData, setTileData] = useState<Array<_Tile>>();

  useEffect(() => {
    if (accessToken)
      return;

    fetch(`https://auth-server-jnq7q2q6jq-ts.a.run.app`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => setAccessToken(data["token"]))
      .catch(error => console.error(error));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken)
      return;

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Tiles!A1:Z100`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
      .then(response => response.json())
      .then(data => {
        const values = data.values;
        if (!values)
          return;

        // const headers = values[0];
        const rows = values.slice(1);

        const tileData = rows.map((row: Array<string>) => {
          const tile: _Tile = {
            number: parseInt(row[0]),
            title: row[1],
            description: row[2],
            image: row[3],
            teamACompletedBy: row[4],
            teamBCompletedBy: row[5],
            teamCCompletedBy: row[6],
          };

          return tile;
        });

        setTileData(tileData);

        if (window.location.hash) {
          const hash = window.location.hash.substring(1);
          if (hash === "leaderboard")
            setShowLeaderboard(true);
          else if (hash === "faq")
            setShowFAQ(true);
          else {
            const tileNumber = parseInt(hash);
            const tile = tileData.find((tile: _Tile) => tile.number === tileNumber);
            if (tile)
              setCurrentTile(tile);
          }
        }
      })
      .catch(error => console.error(error));
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken)
      return;

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/FAQ!A1`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
      .then(response => response.json())
      .then(data => {
        const values = data.values;
        if (!values)
          return;

        setFaq(values[0][0]);
      })
      .catch(error => console.error(error));
  }, [accessToken]);


  useEffect(() => {
    if (!accessToken)
      return;

    fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Teams!A1:C10`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )
      .then(response => response.json())
      .then(data => {
        const values = data.values;
        if (!values)
          return;

        const rows = values.slice(1);

        const teamsData = rows.map((row: Array<string>) => {
          return {
            name: row[0],
            colour: row[1],
            logoUrl: row[2],
          };
        });

        setTeams(teamsData);
      })
      .catch(error => console.error(error));
  }, [accessToken]);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center overflow-y-auto pt-4" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/background.png)` }}>
      <TileModal tile={currentTile} setCurrentTile={setCurrentTile} teams={teams} />
      <LeaderboardModal showLeaderboard={showLeaderboard} setShowLeaderboard={setShowLeaderboard} teams={teams} tiles={tileData ?? []} />
      <FAQModal showFAQ={showFAQ} setShowFAQ={setShowFAQ} faq={faq} />
      <div className='text-3xl md:text-5xl text-yellow-400 text-center' style={{ textShadow: "-2px 2px #000000" }}>The Formidable Foursome</div>
      <div className='text-xl md:text-3xl text-yellow-400 text-center -mb-2' style={{ textShadow: "-2px 2px #000000" }}>Presents</div>
      <div className='text-5xl md:text-7xl text-yellow-400 text-center' style={{ textShadow: "-2px 2px #000000" }}>RNG Street Bingo</div>
      {!tileData &&
        <div className="relative w-1/4 my-auto aspect-square flex flex-col items-center justify-center text-centertransition-all cursor-pointer p-3" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/scroll.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat" }}>
          <div className='text-white animate-pulse text-4xl'>
            Loading Tiles...
          </div>
        </div>
      }
      {tileData &&
        <div className='relative flex flex-col md:h-3/4 md:aspect-square md:grid md:grid-cols-6 md:grid-rows-6 m-auto gap-1'>
          <div className='absolute flex flex-col items-center flex-shrink-0 gap-2 -right-14 top-0'>
            <div className='w-12 h-12 hover:scale-110 cursor-pointer p-1 flex items-center justify-center text-white' style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/scroll.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat" }} onClick={() => setShowLeaderboard((f) => !f)}>
              <ChartBarIcon className='w-8' />
            </div>
            <div className='w-12 h-12 hover:scale-110 cursor-pointer p-1 flex items-center justify-center text-white' style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/scroll.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat" }} onClick={() => setShowFAQ((f) => !f)}>
              FAQ
            </div>
          </div>
          {tileData?.map((tile) => <Tile key={tile.number} tile={tile} setCurrentTile={setCurrentTile} teams={teams} />)}
        </div>
      }
    </div>
  );
}

export default App;
