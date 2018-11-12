/**
 * Формируем URL для запроса к API
 * @param event {string}
 * @param station {string}
 * @param offset {number}
 * @returns {string}
 */
function create_url(event = EVENT_DEFAULT, station = STATION_DEFAULT, offset = 0) {
    let start_url = [];
    let date = new Date();
    
    // форматируем дату для запроса и добавляем в масиив
    start_url.push(DATE + date.toISOString().slice(0, 10));
    // подставляем выбранную станцию, или станицю по умолчанию
    start_url.push(EVENT + event);
    // подставляем выбранное направление, или направление по умолчанию
    start_url.push(STATION + station);
    // подставляем смещение от первого рейса в сутки
    start_url.push('offset=' + offset);
    
    // объединяем массивы для URL
    start_url = BODY_URL.concat(start_url);
    
    return URL + start_url.join('&');
}

/**
 * Определение вероятности задержки рейса
 * @param persent {number} вероятность задержки, число
 * @returns {boolean}
 */
function mt_rand(persent) {
    // число от 1 до 100
    let res = Math.round(Math.random() * 100);
    
    if (res <= persent) {
        return true;
    } else {
        return false;
    }
}

/**
 * Форматировние json оз ответа API, и вывод данных в таблицу
 * @param data {Object}
 * @returns {Array} отформатированный массив с необходимыми полями
 */
function parse_answer(data) {
    // текущее время
    let now_time = new Date().getTime();
    // результирующий массив
    let arr = [];
    // время прибытия / отправления рейса
    let obj_time;
    
    // форматируем результирующий массив
    data.schedule.forEach(e => {
        // инициализируем объект для одного рейса
        let obj = {};
        
        if (!e.arrival) {
            // при отправлении
            obj.time = e.departure.slice(11, 16); // локализированное время отправления
            obj.date = e.departure.slice(0, 10); // локализированное дата отправления
            obj.timestamp = new Date(e.departure).getTime();
            if (obj.timestamp >= now_time) {
                obj.available = true; // установление флага актуальности рейса на текущий момент
                obj.delay = mt_rand(DELAY_PERSENT); // устанавливается вероятность задержки, так как эти данные из API не приходят
                if (obj.delay === true) {
                    obj.status = 'Рейс задержан'; // устанавливаю статус
                } else {
                    obj.status = 'Ожидается по расписанию'; // устанавливаю статус
                }
            } else {
                obj.status = 'Отправлен по расписанию';
                obj.available = false;
                obj.delay = false;
            }
        } else {
            // при прибытии
            obj.time = e.arrival.slice(11, 16);
            obj.date = e.arrival.slice(0, 10);
            obj.timestamp = new Date(e.arrival).getTime();
            if (obj.timestamp >= now_time) {
                obj.available = true;
                obj.delay = mt_rand(DELAY_PERSENT);
                if (obj.delay === true) {
                    obj.status = 'Рейс задержан'; // устанавливаю статус
                } else {
                    obj.status = 'Ожидается по расписанию'; // устанавливаю статус
                }
            } else {
                obj.status = 'Прибыл по расписанию';
                obj.available = false;
                obj.delay = false;
            }
        }
        
        obj.from_to = e.thread.title; // получаю направление рейса
        obj.number = e.thread.number; // номер рейса
        obj.company = e.thread.carrier.title; // авиакомпания
        obj.terminal = e.terminal ? e.terminal : ' - '; // терминал
        obj.patform = e.platform; // платформа, если нет терминала
        obj.model = e.thread.vehicle; // модель самолёта
        obj.port = e.thread.carrier.codes.icao; // код аэропорта ICATO
        obj.shedule = e.days; // общее расписание рейса в дни / числа месяца
        
        arr.push(obj); // заполняем массив
    });
    
    return arr;
}

/**
 * Поиск по номеру рейса
 * @param val {string}
 */
function search_plane_number(val) {
    // убираем лишние пробелы из начала и конца строки
    val = val.trim();
    
    // проверяем не пустая ли строка поиска
    if (val !== '') {
        // получаем все рейсы из local storage
        let all_plane = get_all_plane();
        
        // инициализируем массив для рзультатов поиска
        let find_plans = [];
        
        // если all_plane не пустой
        if (all_plane) {
            all_plane.items.forEach(elem => {
                // ищем совпадения
                if (elem.number.indexOf(val) !== -1) {
                    find_plans.push(elem);
                }
            });
            
            // останавливаем set_interval чтобы он не перерисовывал таблицу, пока мы находимся в режиме поиска
            clearInterval(set_interval);
            
            // если есть результаты поиска
            if (find_plans.length > 0) {
                // перерисовываем таблицу
                create_table(find_plans);
            } else {
                // если результатов нет, очищаем таблицу и выводим результат
                clear_table();
                $('.error').text('По вашему запросу ничего не найдено');
            }
        }
    } else {
        // очищаем содержимое таблицы, так как в поисковой строке пусто
        clear_table();
        $('.error').text('Пожалуйста введите номер хоть какого-нибудь рейса');
    }
    
    // отключение прелоадера
    $('.preloader').removeClass('active');
}