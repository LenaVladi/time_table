const APIKEY = 'fbc7282e-1882-4145-964e-bc4479a39861';
const EVENT = 'event=';
const DATE = 'date=';
const STANTION = 'station=';
const BODY_URL = ['?apikey=' + APIKEY, 'format=json', 'lang=ru_RU', 'transport_types=plane'];

//�������� ������ �� ���� script
// const URL = document.getElementsByClassName('ajax')[0].src;
const URL = 'https://api.rasp.yandex.net/v3.0/schedule/';

function create_url(event = 'departure', station = 's9600213') {
  let start_url = BODY_URL;
  let date = new Date();
  
  // ����������� ���� ��� ������� � ��������� � ������
  start_url.push(DATE + date.toISOString().slice(0,10));
  // ����������� ��������� �������, ��� ������� �� ���������
  start_url.push(EVENT + event);
  // ����������� ��������� �����������, ��� ����������� �� ���������
  start_url.push(STANTION + station);
  
  return URL + start_url.join('&');
}

$.getJSON( "../data/from.json", function( data ) {
  var items = [];
  $.each( data, function( key, val ) {
    items.push( "<li id='" + key + "'>" + val + "</li>" );
  });
  
  $( "<ul/>", {
    "class": "my-new-list",
    html: items.join( "" )
  }).appendTo( "body" );
});