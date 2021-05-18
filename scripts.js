function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function datesAreValid(start, end) {
  if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end)) {
    return false;
  };

  if (start > end) {
    return false;
  };

  return true;
}

let base_gcal_url = 'https://calendar.google.com/calendar/render?';

let input_tz = document.getElementById('timezone');
/*
let user_tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (user_tz) {
  input_tz.value = user_tz;
}; */

let data = {
  'action': 'TEMPLATE',
  'dates': '',
  'ctz': '',
  'text': '',
  'details': '',
  'location': '',
  'add': ''
};

let duration_radio = document.querySelectorAll('input[name="duration"]');

let results_div_allday = document.getElementById('allday-results');
let results_div_specifictimes = document.getElementById('specifictimes-results');

function showHideTimeDivs() {
  results_div_allday.classList.toggle('hide');
  results_div_specifictimes.classList.toggle('hide');
}

for (let i=0; i<duration_radio.length; i++) {
  let input = duration_radio[i];
  input.addEventListener('change', showHideTimeDivs);
}

let radio_allday = document.getElementById('allday');
let input_startdate = document.getElementById('start-date-input');
let input_enddate = document.getElementById('end-date-input');
let input_startdatetime = document.getElementById('start-datetime-input');
let input_enddatetime = document.getElementById('end-datetime-input');
let input_name = document.getElementById('name-input');
let input_descrip = document.getElementById('description-input');
let input_location = document.getElementById('location-input');
let input_emails = document.getElementById('emails-input');
let submit_button = document.getElementById('make-link');

submit_button.addEventListener('click', parseData);

let error_div = document.getElementById('error');
let results_div = document.getElementById('results');

function parseData() {
  error_div.innerHTML = '';
  results_div.innerHTML = '';

  let errors = [];

  let allday_checked = allday.checked ? true : false;
  if (allday_checked) {
    let start = new Date(input_startdate.value);
    let end = new Date(input_enddate.value);
    
    if (datesAreValid(start, end)) {
      let start_fmt = start.toISOString().split('T')[0].replace(/-/g, '');
      let end_fmt = end.toISOString().split('T')[0].replace(/-/g, '');
      
      if (start_fmt === end_fmt) {
        end.setDate(start.getDate() + 1);
        end_fmt = end.toISOString().split('T')[0].replace(/-/g, '');
      }
      
      data['dates'] = start_fmt + '/' + end_fmt;
    } else {
      errors.push('Something is wrong with your start or end dates.');
    }
  } else {
    let start_dt = new Date(input_startdatetime.value);
    let end_dt = new Date(input_enddatetime.value);
    
    if (datesAreValid(start_dt, end_dt)) {
      let start = input_startdatetime.value.replace(/-/g, '').replace(/:/g, '') + '00';
      let end = input_enddatetime.value.replace(/-/g, '').replace(/:/g, '') + '00';
      data['dates'] = start + '/' + end;
      if (input_tz.value) {
        data['ctz'] = input_tz.value;
      }
    } else {
      errors.push('Something is wrong with your start or end datetimes.');
    }
  };


  if (!input_name.value) {
    errors.push('You need a title for your event.')
  } else {
    data['text'] = input_name.value;
  }

  if (input_descrip.value) {
    data['details'] = input_descrip.value.split(/\n/).join(' ');
  }

  if (input_location.value) {
    data['location'] = input_location.value;
  }

  if (input_emails.value) {
    let emails = input_emails.value.split(/\n/);
    let valid_emails = emails.filter(x => isValidEmail(x));

    if (valid_emails.length > 0) {
      let email_diff = emails.length - valid_emails.length;
      if (email_diff > 0) {
        let plural = 'addresses';
        if (email_diff === 1) {
          plural = 'address';
        }
        errors.push(`${email_diff} invalid email ${plural}.`)
      } else {
        data['add'] = valid_emails.join(',');
      }
    } else {
      errors.push('None of the email addresses are valid.')
    }
  }

  if (errors.length > 0) {
    let error_html = errors.map(x => `<li>${x}</li>`).join('');
    error_div.innerHTML = `<h3>Errors</h3><ul>${error_html}</ul>`;
  } else {
    let url = buildUrl();
    results_div.innerHTML = `<p><a href="${url}" target="_blank">${url}</a></p>`;
  }

}

function buildUrl() {
  let params = [];
  for (key in data) {
    if (!data[key]) { continue; };
    params.push(
      key + '=' + data[key].replace(/ /g, '+').replace('&', 'and')
    );
  }
  return base_gcal_url + params.join('&');
}