import { Tile } from "./interfaces";

interface Props {
  tile: Tile;
  onClick: (tile: Tile) => void;
}

const ARROW_EMOJI: Record<string, string> = {
  diagonal: "↘️",
  left: "⬅️",
  right: "➡️",
  up: "⬆️",
  down: "⬇️",
};

// Each arrow sits on the edge of the tile it points out from, centered
// along that edge.
const ARROW_POSITION_CLASSES: Record<string, string> = {
  diagonal: "-bottom-4 -right-2",
  left: "top-1/2 -left-6 -translate-y-1/2",
  right: "top-1/2 -right-6 -translate-y-1/2",
  up: "-top-6 left-1/2 -translate-x-1/2",
  down: "-bottom-6 left-1/2 -translate-x-1/2",
};

function GridTile(props: Props) {
  const { tile, onClick } = props;

  const unlockArrow = (() => {
    if (!tile.region_unlock)
      return null;

    if (tile.region_unlock === 1)
      return !tile.completed ? "diagonal" : null;

    if (tile.region_unlock === tile.region - 1)
      return "left"

    if (tile.region_unlock === tile.region + 1)
      return "right"

    if (tile.region_unlock < tile.region)
      return "up"

    if (tile.region_unlock > tile.region)
      return "down"

    return null
  })();

  if (!tile.name)
    return (
      <div className={`w-[88px] h-[88px] p-2`}></div>
    )


  return (
    <div className="relative group" onClick={() => onClick(tile)}>
      <div className={`border w-[88px] h-[88px] p-2 overflow-hidden cursor-pointer bg-gray-800 ${tile.completed ? "border-green-400" : (tile.region_unlock ? "border-orange-400" : "border-gray-400")}`}>
        <img
          src={tile.image}
          alt={tile.name}
          className="absolute top-0 left-0 w-full h-full aspect-auto"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="relative bg-black z-20 w-5 h-5 text-center">{tile.number}.</div>
        <div className="hidden group-hover:block relative w-full text-center bg-black z-20">{tile.name}</div>
      </div>
      {unlockArrow &&
        <div className={`absolute z-10 text-3xl ${ARROW_POSITION_CLASSES[unlockArrow]}`}>
          {ARROW_EMOJI[unlockArrow]}
        </div>
      }
    </div>
  )

}

export default GridTile;
