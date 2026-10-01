// CarVibes — ar language pack (base UI + quiz + Advisor merged, single lookup).
import { dict as base } from "../base/ar";
import { dict as quiz } from "../../quiz/i18n/ar";
import advisor from "../advisor/ar";
import type { Dict } from "../dict";

export const pack: Dict = { ...base, ...quiz, ...advisor };

export default pack;
