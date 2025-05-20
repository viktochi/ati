import { Button } from "@/components/ui/button";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
      <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
        <Button size="lg" variant="ghost">
          <Image
            src="/it.svg"
            alt="Igbo"
            height={32}
            width={40}
            className="mr-4 rounded-md"
          />
          Igbo
        </Button>
        <Button size="lg" variant="ghost">
          <Image
            src="/fr.svg"
            alt="Hausa"
            height={32}
            width={40}
            className="mr-4 rounded-md"
          />
          Hausa
        </Button>
        <Button size="lg" variant="ghost">
          <Image
            src="/es.svg"
            alt="Yoruba"
            height={32}
            width={40}
            className="mr-4 rounded-md"
          />
          Yoruba
        </Button>
      </div>
    </footer>
  );
};
