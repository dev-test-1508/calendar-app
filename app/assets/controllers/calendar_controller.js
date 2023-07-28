import { Controller } from '@hotwired/stimulus';
import { Modal } from 'bootstrap';
import Calendar from '@toast-ui/calendar';
import Toastify from 'toastify-js';
import moment from 'moment';

export default class extends Controller {
    static targets = [];
    selectedDate = null;
    eventCreationPopup = null;
    allEvents = [];
    selectedEvent = null;
    calendar = new Calendar('#calendar', {
        defaultView: 'month',
        template: {
            task: function(schedule) {
                return '&nbsp;&nbsp;#' + schedule.title;
            },
            taskTitle: function() {
                return '<label>Task</label>';
            },
            allday: function(schedule) {
                return schedule.title;
            },
            alldayTitle: function() {
                return 'All Day';
            },
            time: function(schedule) {
                const { title, color = '', start } = schedule;

                return `<span class="fw-bold" style="color: ${color}">${title} - Booked</span>`;
            }
        },
        month: {
            daynames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            startDayOfWeek: 0,
            narrowWeekend: true
        },
        week: {
            daynames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            startDayOfWeek: 0,
            narrowWeekend: true
        }
    });

    onDateTimeClick() {
        this.calendar.on('selectDateTime', (eventObj) => {
            this.eventCreationPopup = new Modal($('#event-popup'));

            this.selectedDate = eventObj.start;
            this.eventCreationPopup.show();
        });
    }

    onEventClick() {
        this.calendar.on('clickEvent', ({ event }) => {
            const selectedEvent = this.allEvents.find(s => s.id === event.id);

            if (selectedEvent) {
                this.eventCreationPopup = new Modal($('#event-popup'));
                this.selectedEvent = selectedEvent;
                $('#event-popup input').each(function() {
                    let value = selectedEvent[this.name];
                    if (this.name === 'fromTime') {
                        value = moment(selectedEvent.from_time?.date).format("hh:mm a");
                    }

                    if (this.name === 'toTime') {
                        value = moment(selectedEvent.to_time?.date).format("hh:mm a");
                    }

                    if (this.name === 'isAllDay') {
                        value = selectedEvent.is_all_day;
                    }
                    $(this).val(value); 
                    $(this).prop('disabled', true);
                });
                $('#event-popup button[type="submit"]').prop('disabled', true);

                this.eventCreationPopup.show();
            }
        });
    }

    forceResetPopupFormState() {
        if (this.selectedEvent) {
            const formCreationSelector = $('#event-popup-form');
            formCreationSelector.trigger('reset');
            $('#event-popup input').removeAttr('disabled');
            $('#event-popup button[type="submit"]').removeAttr('disabled');
            this.selectedEvent = null;
        }
    }

    convertFormToJSON(form) {
        return $(form)
          .serializeArray()
          .reduce(function (json, { name, value }) {
            json[name] = value;
            return json;
          }, {});
    }

    createEventSchedule() {
        const formCreationSelector = $('#event-popup-form');
        const isEventCreatingSelector = $('#is-creating-event');
        const formCreationSubmitBtnSelector = $('#create-event-submit-btn');

        formCreationSelector.submit(e => {
            e.preventDefault();
            if (!this.validateName() || !this.validateEmail()) {
                return;
            }
            formCreationSubmitBtnSelector.prop("disabled", true);
            isEventCreatingSelector.removeClass('d-none');

            const apiPath = e.currentTarget.action;
            const form = $(e.target);
            const jsonData = this.convertFormToJSON(form);

            jsonData.fromTime = `${moment(this.selectedDate).format('YYYY-MM-DD')} ${moment(jsonData.fromTime, 'hh:mm').format('hh:mm')}`;
            jsonData.toTime = `${moment(this.selectedDate).format('YYYY-MM-DD')} ${moment(jsonData.toTime, 'hh:mm').format('hh:mm')}`;

            try {
                $.post(apiPath, jsonData, res => {
                    if (res.success) {
                        this.setEventSchedules(true);
                        formCreationSelector.trigger('reset');
                    }
                    formCreationSubmitBtnSelector.removeAttr('disabled');
                    Toastify({
                        text: res.message,
                        duration: 3000,
                        close: true,
                        gravity: "bottom",
                        className: res.success ? "bg-success" : "bg-danger",
                        position: "right",
                        stopOnFocus: true
                    }).showToast();
                    isEventCreatingSelector.addClass('d-none');
                    this.eventCreationPopup.hide();
                }, 'json');
            } catch (err) {
                isEventCreatingSelector.addClass('d-none');
                formCreationSubmitBtnSelector.removeAttr('disabled');
            }
        });
    }

    setEventSchedules(rerender = false) {
        $.get(`api/v1/calendars`, res => {
            this.allEvents = res.events;
            this.calendar.createEvents(this.allEvents.map(event => ({
                id: event.id,
                title: event.name,
                body: event.email + event.phone,
                start: event.from_time?.date,
                end: event.to_time?.date,
                color: event.color
            })));

            if (rerender) {
                this.calendar.render();
            }
        });
    }

    setUpTimePicker() {
        const timePickerConfig = {
            timeFormat: 'h:mm p',
            interval: 60,
            minTime: '12:00am',
            maxTime: '11:59pm',
            zindex: 1055,
            change: function(time) {
                // Handle hide isAllDay checkbox
            }
        };
        const pickerClass = ['fromTime', 'toTime'];

        pickerClass.forEach(cls => {
            const timePickerSelector = $(`.${cls}`);
            timePickerSelector.timepicker(timePickerConfig);
        });
    }

    moveCalendarView(value) {
        if (value === -1) {
            this.calendar.prev();
        } else {
            this.calendar.next();
        }
    }

    validateName() {
        const nameValue = $('#event-popup-form input[name="name"]').val();
        if (!nameValue.length) {
            $("#nameValidationMsg").show();
            return false;
        }

        if (nameValue.length > 255) {
            $("#nameValidationMsg").show();
            $("#nameValidationMsg").text("**Length of username must not exceed 255 characters in length");
            return false;
        }

        $("#nameValidationMsg").hide();
        return true;
    }

    validateEmail() {
        const emailValue = $('#event-popup-form input[name="email"]').val();
        const regex = /^([_\-\.0-9a-zA-Z]+)@([_\-\.0-9a-zA-Z]+)\.([a-zA-Z]){2,7}$/;

        if (!emailValue.length) {
            $("#emailValidationMsg").show();
            return false;
        }

        if (emailValue.length && !regex.test(emailValue)) {
            $("#emailValidationMsg").show();
            $("#emailValidationMsg").text("**Invalid email address");
            return false;
        }

        $("#emailValidationMsg").hide();
        return true;
    }

    connect() {
        $("#nameValidationMsg").hide();
        $('#event-popup-form input[name="name"]').keyup(() => {
            this.validateName();
        });
        $("#emailValidationMsg").hide();
        $('#event-popup-form input[name="email"]').keyup(() => {
            this.validateEmail();
        });
        this.setUpTimePicker();
        this.onDateTimeClick();
        this.onEventClick();
        this.createEventSchedule();
        this.setEventSchedules();
    }
}
