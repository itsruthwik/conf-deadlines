// Borrowed from https://github.com/moment/moment-timezone/issues/167
// Adds support for time zones 'UTC-12'..'UTC+12'
function addUtcTimeZones() {
  // Moment.js uses the IANA timezone database, which supports generic time zones like 'Etc/GMT+1'.
  // However, the signs for these time zones are inverted compared to ISO 8601.
  // For more details, see https://github.com/moment/moment-timezone/issues/167
  for (let offset = -12; offset <= 12; offset++) {
    const posixSign = offset <= 0 ? "+" : "-";
    const isoSign = offset >= 0 ? "+" : "-";
    const link = `Etc/GMT${posixSign}${Math.abs(
      offset
    )}|UTC${isoSign}${Math.abs(offset)}`;
    moment.tz.link(link);
  }
}

function update_filtering(data) {
  var page_url = "{{site.baseurl}}";
  store.set("{{site.domain}}-subs", data.subs);
  store.set("{{site.domain}}-showTBA", showTBA);

  $(".ConfItem").hide();
  for (const j in data.all_subs) {
    const s = data.all_subs[j];
    const identifier = "." + s + "-conf";
    if (data.subs.includes(s)) {
      $(identifier).each(function() {
        var confId = $(this).attr('id');
        var deadline = $('#' + confId + ' .deadline-time').text();
        var isTBA = deadline === "TBA" || deadline.trim() === "";
        
        if (isTBA && !showTBA) {
          return; // Skip TBA conferences if showTBA is false
        }
        $(this).show();
      });
    }
  }

  if (subs.length == 0) {
    window.history.pushState("", "", page_url);
  } else {
    window.history.pushState("", "", page_url + "/?sub=" + data.subs.join());
  }
}

function createCalendarFromObject(data) {
  var title = data.title || "";
  var start = data.date;
  var duration = data.duration || 60;
  var end = new Date(start.getTime() + duration * 60000);
  var fmt = function (d) {
    return d.toISOString().replace(/-|:|\.\d+/g, "");
  };

  var googleUrl =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(title) +
    "&dates=" + fmt(start) + "/" + fmt(end) +
    "&details=" + encodeURIComponent(data.description || "") +
    "&location=" + encodeURIComponent(data.address || "");

  var ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "URL:" + document.URL,
    "DTSTART:" + fmt(start),
    "DTEND:" + fmt(end),
    "SUMMARY:" + title,
    "DESCRIPTION:" + (data.description || ""),
    "LOCATION:" + (data.address || ""),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
  var outlookUrl = "data:text/calendar;charset=utf8," + encodeURIComponent(ics);

  var googleIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16" height="16" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

  var outlookIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="#0078D4" d="M7.15 4.33h9.7c.43 0 .8.37.8.8v13.74c0 .43-.37.8-.8.8h-9.7c-.43 0-.8-.37-.8-.8V5.13c0-.43.37-.8.8-.8z"/><path fill="#fff" d="M12 10.5 7.65 14.4v2.06c0 .43.37.8.8.8h7.1c.43 0 .8-.37.8-.8v-2.06L12 10.5z"/><path fill="#fff" d="M8.45 7.5h7.1c.43 0 .8.37.8.8v3.35L12 14.9l-4.35-3.25V8.3c0-.43.37-.8.8-.8z"/></svg>';

  var div = document.createElement("div");
  div.className = "add-to-calendar calendar-obj";
  div.id = data.id;
  div.innerHTML =
    '<img src="{{site.baseurl}}/static/img/calendar.png" alt="">' +
    '<span class="ind-cal"><a class="cal-btn icon-google" target="_blank" rel="noopener" href="' + googleUrl + '">' + googleIcon + ' Google</a></span>' +
    '<span class="ind-cal"><a class="cal-btn icon-outlook" target="_blank" rel="noopener" href="' + outlookUrl + '">' + outlookIcon + ' Outlook</a></span>';
  return div;
}
