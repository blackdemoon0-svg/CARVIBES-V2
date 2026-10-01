// CarVibes — en language pack (base UI + quiz + Advisor merged, single lookup).
import { dict as base } from "../base/en";
import { dict as quiz } from "../../quiz/i18n/en";
import advisor from "../advisor/en";
import type { Dict } from "../dict";

export const pack: Dict = { ...base, ...quiz, ...advisor };

export default pack;
