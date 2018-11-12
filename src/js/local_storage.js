/**
 * Рекурсивный сбор всех рейсов за сутки
 * @param i {number} инкремент для OFFSET
 * @param key {string} ключ он же событие Прибытия / Отправления
 * @param callback {function} функция, по умолчанию "отрисовка таблицы"
 */
function get_all_flight(i = 0, key = 'departure', callback = 'create_table') {
  let length = 0;
  
  // получаем json из local storage
  let storage = localStorage.getItem(key);
  
  // если local storage пустой, делаем запрос
  if (storage == null) {
    
    // показ прелоадера, пока ожидается ответ от сервера
    $('.preloader').addClass('active');
    
    // event ( отправление / прибытие ) совпадает с ключом к local storage
    let event = key;
    
    $.ajaxSetup({
      headers: {
        'Access-Control-Allow-Origin': 'https://lenavladi.github.io'
      }
    });
    
    
    // получаем рейсы через API Яндекс.Расписания
    $.getJSON(create_url(event, STATION_DEFAULT, i * OFFSET), function (data) {
      if (data.hasOwnProperty('schedule')) {
        
        // актуализируем ключ для последующих запросов
        let key = data.event;
        
        // получаем кол-во рейсов за запрос ( ограничение по API )
        length = data.schedule.length;
        
        // соединяю в единый массив
        STORE = STORE.concat(parse_answer(data));
        
        // если в ответе рейсов меньше чем в OFFSET, то функция завершается
        // если нет, то запрос делается заново рекурсивно
        if (length >= OFFSET) {
          i++;
          get_all_flight(i, key);
        } else {
          let storage_obj = {
            date: new Date().toISOString().slice(0, 10),
            items: STORE
          };
          
          // отправляем json в local storage
          localStorage.setItem(key, JSON.stringify(storage_obj));
          
          // формируем таблицу
          create_table(JSON.stringify(storage_obj));
        }
      }
    })
      .fail(function () {
        // отключение прелоадера в случае ошибки и показ сообщения
        $('.preloader').removeClass('active');
        $('.error').text('Расписание сейчас не доступно. Попробуйте зайти позже.')
      })
      .always(function () {
        // отключение прелоадера в случае успеха
        $('.preloader').removeClass('active');
      });
  } else {
    callback(storage);
  }
}

/**
 * Обновляем данные о задержанных рейсах в local storage
 * @param storage {JSON}
 * @param time {timestamp}
 * @param key {string}
 */
function update_local_storage(storage, time, key) {
  // получаем массив с рейсами
  let arr = JSON.parse(storage).items;
  // получаем дату
  let date = JSON.parse(storage).date;
  
  // если текущая дата совпадает с датой local storage, обновляем данные
  if (NOW_TIME === date) {
    arr.forEach(elem => {
      // сравниваем timastamp каждого рейса с переданным timastamp
      if (elem.timestamp >= time) {
        // подтверждаем актуальность рейса
        elem.available = true;
        // переопределяем задержку рейса
        elem.delay = mt_rand(DELAY_PERSENT);
        // обновляем статус рейса
        if (elem.delay === true) {
          elem.status = 'Рейс задержан';
        } else {
          elem.status = 'Ожидается по расписанию';
        }
      } else {
        // если timastamp рейса меньше текущего переводим рейс в НЕ актуальный
        elem.available = false;
      }
    });
    
    // отправляем json в local storage
    let storage_obj = {
      date: date,
      items: arr
    };
    localStorage.setItem(key, JSON.stringify(storage_obj));
  } else {
    // если текущая дата НЕ совпадает с датой local storage, удаляем данные
    localStorage.removeItem(key);
  }
}

/**
 * Получает все json из local storage для вкладки "Задержанные" рейсы
 * @returns {Object}
 */
function get_all_plane() {
  // получаем все json из local storage
  let storage_departure = localStorage.getItem(STORAGE_KEY_DEPARTURE);
  let storage_arrival = localStorage.getItem(STORAGE_KEY_ARRIVAL);
  
  if (JSON.parse(storage_departure) == null) {
    try {
      throw new TypeError('get_all_plane: localStorage data is null');
    } catch (e) {
      return null;
    }
  }
  
  if (!JSON.parse(storage_arrival) == null) {
    try {
      throw new TypeError('get_all_plane: localStorage data is null');
    } catch (e) {
      return null;
    }
  }
  
  let storage_obj = {
    date: JSON.parse(storage_departure).date,
    items: []
  };
  
  // если рейсы прибытия уже есть в local storage тогда соединяем оба массива в один
  if (storage_arrival) {
    storage_obj.items = JSON.parse(storage_departure).items.concat(JSON.parse(storage_arrival).items);
  } else {
    storage_obj.items = JSON.parse(storage_departure).items;
  }
  
  return storage_obj;
}
