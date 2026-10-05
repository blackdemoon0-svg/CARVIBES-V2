// CarVibes — fr language pack (base UI + quiz + Advisor + Analyse merged, single lookup).
import { dict as base } from "../base/fr";
import { dict as quiz } from "../../quiz/i18n/fr";
import advisor from "../advisor/fr";
import analyze from "../analyze/fr";
import type { Dict } from "../dict";

export const pack: Dict = { ...base, ...quiz, ...advisor, ...analyze };

export default pack;
