import { Dialog } from '@headlessui/react'
import { Team, Tile } from './interfaces';
import { XIcon } from '@heroicons/react/solid';
import { useEffect } from 'react';

function TileModal(props: { tile?: Tile, setCurrentTile: (tile?: Tile) => void, teams?: Array<Team> }) {
  const { tile } = props;

  useEffect(() => {
    if (!tile)
      return;

    window.location.hash = `#${tile?.number}`;
    document.title = "RNG Street Bingo | " + tile?.title;

  }, [tile]);

  function onClose() {
    window.location.hash = "";
    document.title = "RNG Street Bingo";

    props.setCurrentTile(undefined);
  }

  const teamA = props.teams?.[0];
  const teamB = props.teams?.[1];
  const teamC = props.teams?.[2];

  return (
    <Dialog open={!!props.tile} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen h-screen items-center justify-center bg-black/50">
        <Dialog.Panel className="w-full md:w-[600px] relative aspect-square flex flex-col items-center text-center p-20" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/scroll.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat" }}>
          <div className="text-white text-2xl z-10">
            {tile?.title}
          </div>
          <div className="text-white z-10 my-auto w-full whitespace-pre-line">
            {tile?.description}
          </div>
          {tile?.teamACompletedBy &&
            <div className='font-semibold text-lg' style={{ color: teamA?.colour, textShadow: "-1px 1px #ffffff" }}>
              {teamA?.name} has completed this tile thanks to {tile?.teamACompletedBy}
            </div>
          }
          {tile?.teamBCompletedBy &&
            <div className='font-semibold text-lg' style={{ color: teamB?.colour, textShadow: "-1px 1px #ffffff" }}>
              {teamB?.name} has completed this tile thanks to {tile?.teamBCompletedBy}
            </div>
          }
          {tile?.teamCCompletedBy &&
            <div className='font-semibold text-lg' style={{ color: teamC?.colour, textShadow: "-1px 1px #ffffff" }}>
              {teamC?.name} has completed this tile thanks to {tile?.teamCCompletedBy}
            </div>
          }
          <div className='absolute right-16 top-12 flex text-yellow-300 z-10'>
            {tile?.number}
          </div>
          <div className='absolute right-4 top-4 flex text-red-400 rounded-full z-10'>
            <XIcon className="w-6 h-6 cursor-pointer" onClick={onClose} />
          </div>
          <div className="mt-auto h-[200px]">
            {tile?.image &&
              <img src={tile?.image} alt={tile?.title} className="w-full h-full object-cover" />
            }
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default TileModal;
