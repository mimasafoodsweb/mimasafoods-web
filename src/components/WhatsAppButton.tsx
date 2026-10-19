import { WhatsAppIcon } from './heritage/ui';

export default function WhatsAppButton({ number, hidden }: { number: string; hidden: boolean }) {
  if (!number || hidden) return null;
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed z-30 right-4 bottom-4 md:right-8 md:bottom-8 w-14 h-14 md:w-[60px] md:h-[60px] rounded-full bg-heritage-whatsapp text-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.22)] hover:scale-105 transition-transform"
    >
      <WhatsAppIcon size={27} />
    </a>
  );
}
