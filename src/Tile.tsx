import { CheckCircleIcon } from "@heroicons/react/solid";
import { Tile as _Tile } from "./interfaces";

function Tile(props: { tile: _Tile, setCurrentTile: (tile: _Tile) => void }) {

  const { tile } = props;

  return (
    <div className="relative w-full aspect-square flex flex-col items-center justify-center text-center md:hover:scale-150 md:hover:drop-shadow md:hover:z-20 transition-all cursor-pointer md:p-3" onClick={() => props.setCurrentTile(props.tile)} style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/scroll.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat" }}>
      <div className="absolute top-0 left-0 w-full h-full md:p-2 p-8 overflow-hidden">
        {tile.image &&
          <img src={tile.image} alt={tile.title} className="w-full h-full object-cover" />
        }
      </div>
      <div className="text-white z-10" style={{ textShadow: "-1px 1px #000000" }}>
        {tile.title}
      </div>
      <div className='absolute right-3 top-2 flex text-sm text-yellow-300 z-10'>
        {tile.number}
      </div>
      <div className='absolute left-3 flex top-2 gap-1 text-sm z-10 rounded-full'>
        {tile.teamACompletedBy &&
          <CheckCircleIcon className="w-4 h-4 text-[#ff0000] bg-white rounded-full" />
        }
        {tile.teamBCompletedBy &&
          <CheckCircleIcon className="w-4 h-4 text-[#00ff00] bg-white rounded-full" />
        }
        {tile.teamCCompletedBy &&
          <CheckCircleIcon className="w-4 h-4 text-[#0000ff] bg-white rounded-full" />
        }
      </div>
    </div>
  );

}

export default Tile;
