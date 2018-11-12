// обработка события клика на кнопку поиска
search_btn.click(function () {
    let search_text = search_input.val();
    
    // показ прелоадера, пока ожидается ответ поиска
    $('.preloader').addClass('active');
    
    // устанавливаем видимость поиска
    setTimeout(function () {
        search_plane_number(search_text);
    }, 500);
});

// обработка клика по вкладкам
TABS.click(function () {
    // меняем класс active при клике
    TABS.removeClass('active');
    $(this).addClass('active');
    
    // очищаем строку поиска
    search_input.val('');
    
    // вызываю обработчик вкладок
    tabs_handler($(this));
});
