import { CheckCircleIcon } from "@heroicons/react/solid";
import { Tile as _Tile, Team } from "./interfaces";

function Tile(props: { tile: _Tile, setCurrentTile: (tile: _Tile) => void, teams?: Array<Team>, viewAs?: number }) {

  const { tile } = props;

  const compeltedByList = [tile.teamACompletedBy, tile.teamBCompletedBy, tile.teamCCompletedBy];
  const showOverlay = props.viewAs ? compeltedByList[props.viewAs] : !!tile.teamACompletedBy && !!tile.teamBCompletedBy && !!tile.teamCCompletedBy;

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
      <div className="absolute top-0 left-0 w-full h-full md:p-2 p-8 overflow-hidden z-20">
        {showOverlay &&
          <div className="w-full h-full opacity-50 z-20 rounded-sm" style={{ backgroundColor: props.viewAs !== undefined ? props.teams?.[props.viewAs].colour : "black" }} />
        }
      </div>
      <div className='absolute flex -top-2 gap-1 text-sm z-30 rounded-full'>
        {((props.viewAs === 0 || props.viewAs === undefined) && tile.teamACompletedBy) &&
          <CheckCircleIcon className="w-6 h-6 bg-white rounded-full" style={{ color: props.teams?.[0]?.colour }} />
        }
        {((props.viewAs === 1 || props.viewAs === undefined) && tile.teamBCompletedBy) &&
          <CheckCircleIcon className="w-6 h-6 bg-white rounded-full" style={{ color: props.teams?.[1]?.colour }} />
        }
        {((props.viewAs === 2 || props.viewAs === undefined) && tile.teamCCompletedBy) &&
          <CheckCircleIcon className="w-6 h-6 bg-white rounded-full" style={{ color: props.teams?.[2]?.colour }} />
        }
      </div>
    </div>
  );

}

export default Tile;
