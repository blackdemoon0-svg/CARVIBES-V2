// Advisor events use the @vercel/analytics installation already present in
// CarVibes. The module is loaded lazily and no questionnaire answers are sent.
export type AdvisorEvent =
  | "advisor_started"
  | "advisor_question_completed"
  | "advisor_completed"
  | "advisor_result_viewed"
  | "advisor_car_clicked"
  | "advisor_restarted";

type EventProps = Record<string, string | number | boolean>;

const queue: Array<{ event: AdvisorEvent; props: EventProps }> = [];
let scheduled = false;

function flushLater(): void {
  if (scheduled || typeof window === "undefined") return;
  scheduled = true;
  const send = () => {
    void import("@vercel/analytics")
      .then((analytics) => {
        while (queue.length) {
          const item = queue.shift();
          if (!item) break;
          try {
            analytics.track(item.event, item.props);
          } catch {
            // Analytics must never interrupt the Advisor flow.
          }
        }
      })
      .catch(() => {
        queue.length = 0;
      })
      .finally(() => {
        scheduled = false;
      });
  };

  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void) => number;
  };
  if (idleWindow.requestIdleCallback) idleWindow.requestIdleCallback(send);
  else window.setTimeout(send, 900);
}

export function trackAdvisor(event: AdvisorEvent, props: EventProps = {}): void {
  if (queue.length >= 40) queue.shift();
  queue.push({ event, props });
  flushLater();
}
