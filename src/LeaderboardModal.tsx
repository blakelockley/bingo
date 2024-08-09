import { Dialog } from '@headlessui/react'
import { Team, Tile } from './interfaces';
import { XIcon } from '@heroicons/react/solid';
import { useEffect, useMemo } from 'react';

function LeaderboardModal(props: { teams: Array<Team> | undefined; tiles: Array<Tile>, showLeaderboard: boolean, setShowLeaderboard: (f: boolean) => void }) {
  useEffect(() => {
    if (!props.showLeaderboard)
      return;

    window.location.hash = `#leaderboard`;
    document.title = "RNG Street Bingo | Leaderboard";
  }, [props.showLeaderboard]);

  function onClose() {
    window.location.hash = "";
    document.title = "RNG Street Bingo";

    props.setShowLeaderboard(false);
  }

  const progressMap = useMemo(() => {
    let map = [0, 0, 0];

    for (const tile of props.tiles) {
      if (tile.teamACompletedBy)
        map[0]++;
      if (tile.teamBCompletedBy)
        map[1]++;
      if (tile.teamCCompletedBy)
        map[2]++;
    }
    return map;

  }, [props.tiles]);

  if (!props.teams)
    return null;

  return (
    <Dialog open={props.showLeaderboard} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen h-screen items-center justify-center bg-black/50">
        <Dialog.Panel className="w-full md:w-[600px] relative aspect-square flex flex-col items-center text-center p-20" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/scroll.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat" }}>
          <div className="text-white text-2xl z-10">
            Leaderboard
          </div>
          <div className='flex flex-col my-auto gap-4 w-[400px]'>
            {props.teams.map((team, index) => (
              <div className='flex gap-2 items-center w-full'>
                <img className='w-20 h-full object-cover' src={team.logoUrl} alt={team.name} />
                <div className='flex flex-col w-full'>
                  <div className='flex items-center justify-between w-full'>
                    <div className='font-semibold text-3xl text-left' style={{ color: team.colour, textShadow: "1px 1px #ffffff" }}>{team.name}</div>
                    <div className='font-semibold text-xl text-white'>{progressMap[index]} / {props.tiles.length}</div>
                  </div>
                  <div className='relative w-full h-[30px] border-2 border-white rounded-sm overflow-hidden'>
                    <div className='absolute left-0 top-0 h-full' style={{ width: ((progressMap[index] / props.tiles.length) * 100) + "%", backgroundColor: team.colour }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='absolute right-4 top-4 flex text-red-400 rounded-full z-10'>
            <XIcon className="w-6 h-6 cursor-pointer" onClick={onClose} />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default LeaderboardModal;
