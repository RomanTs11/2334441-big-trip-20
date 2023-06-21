import { FilterType } from '../const';
import { isEventFuture, isEventPast, isEventPresent } from './events';

const filter = {
  [FilterType.EVERYTHING]: (events) => events.filter((event) => event),
  [FilterType.FUTURE]: (events) => events.filter((event) => isEventFuture(event.dateFrom)),
  [FilterType.PRESENT]: (events) => events.filter((event) => isEventPresent(event.dateFrom, event.dateTo)),
  [FilterType.PAST]: (events) => events.filter((event) => isEventPast(event.dateTo)),
};

export {filter};
