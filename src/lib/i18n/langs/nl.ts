// CarVibes — nl language pack (base UI + quiz + Advisor merged, single lookup).
import { dict as base } from "../base/nl";
import { dict as quiz } from "../../quiz/i18n/nl";
import advisor from "../advisor/nl";
import type { Dict } from "../dict";

export const pack: Dict = { ...base, ...quiz, ...advisor };

export default pack;
