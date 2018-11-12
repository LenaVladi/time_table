get_all_flight(0, 'departure', create_table);

set_interval = setInterval(function() {
    update_table(new Date().getTime(), STORAGE_KEY_DEPARTURE);
}, UPDATE_TIME);
