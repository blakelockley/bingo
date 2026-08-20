import { Tile } from "./interfaces";

interface Props {
  tile: Tile;
  closeModal: () => void;
}

function GridTileModal(props: Props) {
  const { tile, closeModal } = props;

  return (
    <div className="absolute top-0 left-0 w-screen h-screen flex items-center justify-center z-40" >
      <div className="absolute top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-sm cursor-pointer" onClick={() => closeModal()} />
      <div className={`flex flex-col gap-2 relative border-2 w-[600px] h-[600px] p-4 overflow-hidden bg-gray-800 ${tile.completed ? "border-green-400" : (tile.region_unlock ? "border-orange-400" : "border-gray-400")}`}>
        <div className="w-full text-white text-4xl">{tile.number}.</div>
        <div className="relative text-center text-white text-4xl w-full">{tile.name}</div>
        <div className="relative text-center text-white text-2xl w-full">{tile.description}</div>
        <img
          src={tile.image}
          alt={tile.name}
          className="h-64 m-auto"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    </div>
  )

}

export default GridTileModal;
