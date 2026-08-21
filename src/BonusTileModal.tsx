import { useEffect } from "react";
import { XIcon } from "@heroicons/react/solid";
import { BonusDataItem } from "./interfaces";

interface Props {
  bonusDataItem: BonusDataItem;
  closeModal: () => void;
}

function BonusTileModal(props: Props) {
  const { bonusDataItem, closeModal } = props;

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
      <div className={`flex flex-col gap-2 relative border-2 w-[600px] h-[600px] p-4 overflow-hidden bg-gray-800 border-gray-400`}>
        <button
          type="button"
          onClick={() => closeModal()}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          title="Close"
        >
          <XIcon className="w-6 h-6" />
        </button>
        {/* <div className="w-full text-white text-4xl">{tile.number}.</div> */}
        <div className="relative text-center text-white text-4xl w-full mt-auto">Bonus Tile Hidden</div>
        <div className="relative text-center text-white text-2xl w-full">Unlock all component regions to view this item</div>
        <div className="relative text-center text-white text-4xl my-auto mx-10">
          Your team has unlocked <span className="text-yellow-400">{bonusDataItem.bonus_visibility} of {bonusDataItem.bonus_required}</span> regions to reveal this tile.
        </div>
      </div>
    </div>
  )

}

export default BonusTileModal;
