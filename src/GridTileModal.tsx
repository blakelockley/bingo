import { useEffect } from "react";
import { XIcon } from "@heroicons/react/solid";
import { AdminTile, BonusDataItem, Tile } from "./interfaces";

interface Props {
  tile: Tile | AdminTile;
  closeModal: () => void;
  bonusDataItem?: BonusDataItem;
}

function GridTileModal(props: Props) {
  const { tile, closeModal, bonusDataItem } = props;
  const completed = !!tile.completed;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape")
        closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60]" >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer" onClick={() => closeModal()} />
      <div className={`flex flex-col gap-2 relative border-2 w-[600px] h-[600px] p-4 overflow-hidden bg-gray-800 ${completed ? "border-green-400" : (tile.region_unlock ? "border-orange-400" : "border-gray-400")}`}>
        <button
          type="button"
          onClick={() => closeModal()}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          title="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>
        <div className="w-full text-white text-4xl">{tile.number}.</div>
        <div className="relative text-center text-white text-4xl w-full">{tile.name}</div>
        <div className="relative text-center text-white text-2xl w-full">{tile.description}</div>
        {bonusDataItem &&
          <div className="relative text-center text-white text-2xl w-full">
            Completed tile progress: <span className={`${completed ? "text-green-400" : "text-yellow-400"}`}>{bonusDataItem.bonus_progress} of {bonusDataItem.bonus_required}</span>
          </div>
        }
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
