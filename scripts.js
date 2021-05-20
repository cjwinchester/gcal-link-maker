function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

function datesAreValid(start, end) {
  if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end)) {
    return false;
  };

  if (start > end) {
    return false;
  };

  return true;
}

function timeIsValid(time) {

}

let base_gcal_url = 'https://calendar.google.com/calendar/render?';

let input_tz = document.getElementById('timezone');

let user_tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (user_tz) {
  input_tz.value = user_tz;
};

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

let timedeets_divs = document.getElementsByClassName('timedeets');

function showHideTimeDivs() {
  for (let i=0; i<timedeets_divs.length; i++) {
    timedeets_divs[i].classList.toggle('hide');
  }
}

for (let i=0; i<duration_radio.length; i++) {
  let input = duration_radio[i];
  input.addEventListener('change', showHideTimeDivs);
}

let radio_allday = document.getElementById('allday');
let input_startdate = document.getElementById('start-date');
let input_enddate = document.getElementById('end-date');
let input_starttime = document.getElementById('start-time');
let input_endtime = document.getElementById('end-time');
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

  let start = new Date(input_startdate.value);
  let end = new Date(input_enddate.value);

  if (datesAreValid(start, end)) {
    let start_fmt = start.toISOString().split('T')[0].replace(/-/g, '');
    let end_fmt = end.toISOString().split('T')[0].replace(/-/g, '');
          
    if (start_fmt === end_fmt) {
      end.setDate(start.getDate() + 1);
      end_fmt = end.toISOString().split('T')[0].replace(/-/g, '');
    }

    let allday_checked = allday.checked ? true : false;

    if (allday_checked) {
      data['dates'] = start_fmt + '/' + end_fmt;
    } else {
      let start_time = input_starttime.value.replace(':', '');
      let end_time = input_endtime.value.replace(':', '');

      if (start_time && end_time) {
        start_time = start_time + '00';
        end_time = end_time + '00';

        let datetime_str = `${start_fmt}T${start_time}/${end_fmt}T${end_time}`;
        data['dates'] = datetime_str;
        data['ctz'] = input_tz.value;
      } else {
        errors.push('Something is wrong with your start or end times.');
      }
    }
  } else {
    errors.push('Something is wrong with your start or end dates.');
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
    copyToClipboard(url);
    results_div.innerHTML = `<p><a href="${url}" target="_blank">${url}</a></p><p class="small" id="copy-alert">Copied to clipboard</p>`;

    setTimeout(function() {
      document.getElementById('copy-alert').style.display = 'none';
    }, 3000);

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