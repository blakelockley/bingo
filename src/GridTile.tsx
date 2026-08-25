import { AdminTile, Tile } from "./interfaces";

interface Props {
  tile: Tile | AdminTile;
  onClick: (tile: Tile | AdminTile) => void;
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

// team number -> circle colour, for the admin view.
const TEAM_COLOURS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-green-500",
  3: "bg-blue-500",
  4: "bg-yellow-500",
};

function GridTile(props: Props) {
  const { tile, onClick } = props;

  const completed = !!tile.completed;
  const teams = completedTeams(tile as AdminTile);

  function completedTeams(tile: AdminTile): number[] {
    if (tile.completed !== undefined)
      return [];

    return [
      tile.completed_1 && 1,
      tile.completed_2 && 2,
      tile.completed_3 && 3,
      tile.completed_4 && 4,
    ].filter((team): team is number => Boolean(team));
  }

  const unlockArrow = (() => {
    if (!tile.region_unlock)
      return null;

    if (tile.region_unlock === 1)
      return !completed ? "diagonal" : null;

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
      <div className={`border w-[88px] h-[88px] p-2 overflow-hidden cursor-pointer ${completed ? "border-green-400 bg-green-800/50" : ((tile.region_unlock ? "border-orange-400" : "border-gray-400") + " bg-gray-800")} ${!!tile.bonus_requirements ? "border-dashed" : "border-solid"}`}>
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

        {teams.length > 0 && (
          <div className="absolute bottom-1 right-1 z-30 flex gap-0.5">
            {teams.map((team) => (
              <div
                key={team}
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${TEAM_COLOURS[team]}`}
              >
                {team}
              </div>
            ))}
          </div>
        )}
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
