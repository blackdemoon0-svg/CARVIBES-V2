// CarVibes — zh language pack (base UI + quiz + Advisor merged, single lookup).
import { dict as base } from "../base/zh";
import { dict as quiz } from "../../quiz/i18n/zh";
import advisor from "../advisor/zh";
import type { Dict } from "../dict";

export const pack: Dict = { ...base, ...quiz, ...advisor };

export default pack;
