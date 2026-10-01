// CarVibes — de language pack (base UI + quiz + Advisor merged, single lookup).
import { dict as base } from "../base/de";
import { dict as quiz } from "../../quiz/i18n/de";
import advisor from "../advisor/de";
import type { Dict } from "../dict";

export const pack: Dict = { ...base, ...quiz, ...advisor };

export default pack;
