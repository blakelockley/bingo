import { Dialog } from '@headlessui/react'
import { XIcon } from '@heroicons/react/solid';
import { useEffect } from 'react';

function FAQModal(props: { faq?: string, showFAQ: boolean, setShowFAQ: (f: boolean) => void }) {
  useEffect(() => {
    if (!props.showFAQ)
      return;

    window.location.hash = `#faq`;
    document.title = "RNG Street Bingo | FAQ";
  }, [props.showFAQ]);

  function onClose() {
    window.location.hash = "";
    document.title = "RNG Street Bingo";

    props.setShowFAQ(false);
  }

  return (
    <Dialog open={props.showFAQ} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 flex w-screen h-screen items-center justify-center bg-black/50">
        <Dialog.Panel className="w-full md:w-[600px] relative aspect-square flex flex-col items-center text-center p-20" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/scroll.png)`, backgroundSize: "contain", backgroundRepeat: "no-repeat" }}>
          <div className="text-white text-2xl z-10 mb-2">
            FAQ
          </div>
          <div className='flex flex-col my-auto w-[400px] h-[400px] whitespace-pre-line overflow-y-auto text-white pr-4 -mr-4 text-left'>
            {props.faq ?? "Loading..."}
          </div>
          <div className='absolute right-4 top-4 flex text-red-400 rounded-full z-10'>
            <XIcon className="w-6 h-6 cursor-pointer" onClick={onClose} />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

export default FAQModal;
