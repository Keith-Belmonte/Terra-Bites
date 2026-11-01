import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { BotMessageSquareIcon } from "lucide-react";

/** Floating shortcut to the assistant, sits above the bottom nav. */
export default function AssistantFab() {
  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.3 }}
      className="fixed right-4 bottom-22 z-30 md:right-8 md:bottom-8"
    >
      <Link
        to="/assistant"
        aria-label="Ask Siesta, the AI farming assistant"
        className="flex h-14 cursor-pointer items-center gap-2 rounded-full bg-primary pr-5 pl-4 font-bold text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background transition-transform hover:scale-105 active:scale-95"
      >
        <BotMessageSquareIcon className="size-6" />
        Ask Siesta
      </Link>
    </motion.div>
  );
}
