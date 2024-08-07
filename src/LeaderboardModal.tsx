import { Dialog } from '@headlessui/react'
import { Tile } from './interfaces';
import { XIcon } from '@heroicons/react/solid';
import { useEffect, useMemo } from 'react';

function LeaderboardModal(props: { tiles: Array<Tile>, showLeaderboard: boolean, setShowLeaderboard: (f: boolean) => void }) {
  useEffect(() => {
    document.title = "RNG Street Bingo | Leaderboard";
  }, []);

  function onClose() {
    document.title = "RNG Street Bingo";

    props.setShowLeaderboard(false);
  }

  const progressMap = useMemo(() => {
    let map = { "A": 0, "B": 0, "C": 0 };

    for (const tile of props.tiles) {
      if (tile.teamACompletedBy)
        map["A"]++;
      if (tile.teamBCompletedBy)
        map["B"]++;
      if (tile.teamCCompletedBy)
        map["C"]++;
    }
    return map;

  }, [props.tiles]);

  return (
    <Dialog open={props.showLeaderboard} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen h-screen items-center justify-center bg-black/50">
        <Dialog.Panel className="w-full md:w-[600px] relative aspect-square flex flex-col items-center text-center p-20" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/scroll.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat" }}>
          <div className="text-white text-2xl z-10">
            Leaderboard
          </div>
          <div className='flex flex-col my-auto w-[400px]'>
            <div className='font-semibold text-[#ff0000] text-2xl text-left'>Team A</div>
            <div className='relative w-full h-[20px] rounded overflow-hidden'>
              <div className='absolute left-0 top-0 bg-[#ff0000] h-full rounded' style={{ width: ((progressMap["A"] / 36) * 100) + "%" }} />
            </div>
            <div className='font-semibold text-[#00ff00] text-2xl text-left'>Team B</div>
            <div className='relative w-full h-[20px] rounded overflow-hidden'>
              <div className='absolute left-0 top-0 bg-[#00ff00] h-full rounded' style={{ width: ((progressMap["B"] / 36) * 100) + "%" }} />
            </div>
            <div className='font-semibold text-[#0000ff] text-2xl text-left'>Team C</div>
            <div className='relative w-full h-[20px] rounded overflow-hidden'>
              <div className='absolute left-0 top-0 bg-[#0000ff] h-full rounded' style={{ width: ((progressMap["C"] / 36) * 100) + "%" }} />
            </div>
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
