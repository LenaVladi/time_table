/**
 * Очищает тело таблицы, удаляет все элементы
 */
function clear_table() {
    let tbody = $('.table tbody');
    tbody.empty();
}

/**
 * Выводит данные о рейсе в таблицу, изпользуя jquery template
 * @param data {data} or {json} список рейсов
 */
function create_table(data) {
    // очищаем содержимое таблицы перед заполнением
    clear_table();
    
    let arr;
    if (!Array.isArray(data)) {
        arr = JSON.parse(data).items;
    } else {
        arr = data;
    }
    
    arr.forEach(elem => {
        // при загрузке страницы выводим в таблицу только актуальные рейсы прибытия / отправления
        if ( elem.available === true ) {
            if( elem.delay === false ) {
                elem.status = 'Ожидается по расписанию';
                $('#table_row').tmpl(elem).appendTo('.table tbody');
            } else if ( elem.delay === true ) {
                elem.status = 'Рейс задержан';
                $('#table_row').tmpl(elem).appendTo('.table tbody');
            }
        }
    });
}

/**
 * Обновление таблицы
 * @param time {timestamp}
 * @param key {string}
 */
function update_table(time, key) {
    // обновление вкладки "Задержанные"
    if(key === 'delay') {
        // получаем данные о прилетающих и вылетающий рейсах из local storage
        let storage_departure = localStorage.getItem(STORAGE_KEY_DEPARTURE);
        let storage_arrival = localStorage.getItem(STORAGE_KEY_ARRIVAL);
        
        // если json`s существуют - обновляем их
        if (storage_departure) {
            update_local_storage(storage_departure, time, STORAGE_KEY_DEPARTURE);
        }
        if (storage_arrival) {
            update_local_storage(storage_arrival, time, STORAGE_KEY_ARRIVAL);
        }
        
        // перерисовываем таблицу во вкладке "Задержанные"
        show_delay_plane();
    } else {
        // обновление вкладок "Вылет" и "Прилет"
        // получаем json из local storage (вылет или прилет, по ключу)
        let storage = localStorage.getItem(key);
        
        // выполняется только в том случае, если есть данные в local storage
        if (storage) {
            // обновляем local storage
            update_local_storage(storage, time, key);
            
            // показываем табло из local.storage
            get_all_flight(0, key, create_table);
        }
    }
}

/**
 * Поиск всех задержанных рейсов для отдельнуой таблицы
 */
function show_delay_plane() {
    // инициализируем массив для всех найденных задержанных рейсов
    let arr_delay = [];
    // инициализируем переменную для массива из local storage
    // по которому будет производится поиск задержанных рейсов
    let all_plane = get_all_plane();
    
    all_plane.items.forEach(elem => {
        if ( elem.delay === true ) {
            // отправляем задержанные рейсы в массив
            arr_delay.push(elem);
        }
    });
    
    // сортировка массиво по времени прибытия / отправления
    arr_delay.sort(function(a, b) {
        return a.timestamp - b.timestamp;
    });
    
    // генерируем таблицу только из задержанных рейсов
    create_table(arr_delay);
    
}

/**
 * Перерисовывает таблицу с данными и перезапускает setTimeout - обновление страний в реальном времени
 * @param el {DOM element} JQ element
 */
function tabs_handler(el) {
    // проверяем вкладку
    switch (el.data('event')) {
      // если выбрана вкладка "Вылет"
        case 'departure' :
            // очищаем store для нового запроса
            STORE = [];
            
            get_all_flight(0, STORAGE_KEY_DEPARTURE, create_table);
            
            // очищаем запущенный ранее setInterval и перезаписываем его с новыми параметрами
            clearInterval(set_interval);
            set_interval = setInterval(function() {
                update_table(new Date().getTime(),  STORAGE_KEY_DEPARTURE);
            }, UPDATE_TIME);
            break;
      // если выбрана вкладка "Прибытие"
        case 'arrival' :
            // очищаем store для нового запроса
            STORE = [];
            
            get_all_flight(0, STORAGE_KEY_ARRIVAL, create_table);
            clearInterval(set_interval);
            set_interval = setInterval(function() {
                update_table(new Date().getTime(), STORAGE_KEY_ARRIVAL);
            }, UPDATE_TIME);
            break;
      // если выбрана вкладка "Задержанные"
        case 'delay' :
            show_delay_plane();
            clearInterval(set_interval);
            set_interval = setInterval(function() {
                update_table(new Date().getTime(), 'delay');
            }, UPDATE_TIME);
            break;
        default :
            return;
    }
}
