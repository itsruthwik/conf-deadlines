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

  var googleIcon = '<img src="{{site.baseurl}}/static/img/google-calendar.svg" alt="" style="width:16px;height:16px;" />';

  var outlookIcon = '<img src="{{site.baseurl}}/static/img/outlook.svg" alt="" style="width:16px;height:16px;" />';

  var div = document.createElement("div");
  div.className = "add-to-calendar calendar-obj";
  div.id = data.id;
  div.innerHTML =
    '<span class="ind-cal"><a class="cal-btn icon-google" target="_blank" rel="noopener" href="' + googleUrl + '">' + googleIcon + ' Google</a></span>' +
    '<span class="ind-cal"><a class="cal-btn icon-outlook" target="_blank" rel="noopener" href="' + outlookUrl + '">' + outlookIcon + ' Outlook</a></span>';
  return div;
}
