const APIKEY = 'fbc7282e-1882-4145-964e-bc4479a39861'; // ключ к API
const EVENT = 'event='; // GET-параметр к запросу ( прибытие / отправление )
const EVENT_DEFAULT = 'departure'; // значение по-умолчанию для  параметра event
const DATE = 'date='; // GET-параметр к запросу ( дата прибытия / отправления )
const STATION = 'station='; // GET-параметр к запросу ( код аэропорта прибытия / отправления )
const STATION_DEFAULT = 's9600213'; // значение по-умолчанию для  параметра station
const BODY_URL = ['?apikey=' + APIKEY, 'format=json', 'lang=ru_RU', 'transport_types=plane']; // тело GET-запроса
const DELAY_PERSENT = 2; // вероятность задержки рейса
const OFFSET = 100; // ограничение по рейсам за запрос ( API )
const URL = 'https://api.rasp.yandex.net/v3.0/schedule/'; // адрес API
const UPDATE_TIME = 60000;

// создаём ключи для доступа в locale storage
const STORAGE_KEY_DEPARTURE = 'departure';
const STORAGE_KEY_ARRIVAL = 'arrival';
const NOW_TIME = new Date().toISOString().slice(0, 10);

// Массив для хранения всех рейсов за сутки
let STORE = [];

// поиск
let search_input = $('.form__search-input'); // поисковая строка
let search_btn = $('.form__search-submit'); // кнопка "найти"

// табы
const TABS = $('.tabs__tab'); // вкладки Вылет / Прилет / Задержанные

// переменная для setInterval
let set_interval;