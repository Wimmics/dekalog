import $ from 'jquery';
import dt from 'datatables.net-bs5';
import ttl_read from '@graphy/content.ttl.read';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(duration)
import { Control } from './Control';

$(() => {   

    (new Control()).init();
});