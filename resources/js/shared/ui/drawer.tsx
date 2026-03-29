import { Fragment, type ReactNode } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@shared/lib';

type DrawerSide = 'left' | 'right';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  children: ReactNode;
  className?: string;
}

const slideFrom: Record<DrawerSide, { enter: string; leave: string }> = {
  left: { enter: '-translate-x-full', leave: '-translate-x-full' },
  right: { enter: 'translate-x-full', leave: 'translate-x-full' },
};

export function Drawer({ open, onClose, side = 'right', children, className }: DrawerProps) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </TransitionChild>

        <div className={cn('fixed inset-0 flex', side === 'left' ? 'justify-start' : 'justify-end')}>
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom={slideFrom[side].enter}
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo={slideFrom[side].leave}
          >
            <DialogPanel className={cn('w-full max-w-sm bg-white shadow-xl', className)}>
              <div className="flex items-center justify-end p-4">
                <button onClick={onClose} aria-label="Закрыть" className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
