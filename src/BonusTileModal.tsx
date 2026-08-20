import { useEffect } from "react";
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
    <div className="absolute top-0 left-0 w-screen h-screen flex items-center justify-center z-40" >
      <div className="absolute top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-sm cursor-pointer" onClick={() => closeModal()} />
      <div className={`flex flex-col gap-2 relative border-2 w-[600px] h-[600px] p-4 overflow-hidden bg-gray-800 border-gray-400`}>
        {/* <div className="w-full text-white text-4xl">{tile.number}.</div> */}
        <div className="relative text-center text-white text-4xl w-full mt-auto">Bonus Tile Hidden</div>
        <div className="relative text-center text-white text-2xl w-full">Unlock all component regions to view this item</div>
        <div className="relative text-center text-white text-4xl my-auto mx-10">
          Your team has unlocked <span className="text-yellow-400">{bonusDataItem.bonus_visibility}</span> of <span className="text-yellow-400">{bonusDataItem.bonus_required}</span> required regions to reveal this tile.
        </div>
      </div>
    </div>
  )

}

export default BonusTileModal;
