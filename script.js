// basic structure
let start_time;
let timer_interval;
let Timer_Running = false;//to check whether timer is running or not
let tab_switches = 0;
let TASKS = [];//array to store tasks

// storing user preferences
let PREFS = JSON.parse(localStorage.getItem('user_prefs')) || {
    theme: 'light',
    deep: 90,
    avg: 30
};

window.onload = function() { //run the code when page is loaded
    //to open the particular link - synced with underscore IDs
    document.getElementById('btn_dash').onclick = function() { Display_of_page('dash'); };
    document.getElementById('btn_analysis').onclick = function() { Display_of_page('analysis'); };
    document.getElementById('btn_hist').onclick = function() { Display_of_page('hist'); };
    document.getElementById('btn_settings').onclick = function() { document.getElementById('settings_modal').style.display = 'flex'; };
    document.getElementById('close_modal_btn').onclick = close_popup;//close the popup summary

    // display current date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current_date_display').innerText = new Date().toLocaleDateString('en-US', options);
    document.getElementById('dash_target_val').innerText = PREFS.deep + "m";

    // apply saved settings on load
    Apply_Theme(PREFS.theme);

    // save settings logic
    document.getElementById('save_settings').onclick = function() {
        PREFS.deep = parseInt(document.getElementById('set_deep').value);
        PREFS.avg = parseInt(document.getElementById('set_avg').value);
        localStorage.setItem('user_prefs', JSON.stringify(PREFS));
        document.getElementById('dash_target_val').innerText = PREFS.deep + "m";
        document.getElementById('settings_modal').style.display = 'none';
        Show_Toast("Settings Saved");
    };

    // change theme logic
    document.getElementById('theme_btn').onclick = function() {
        PREFS.theme = (PREFS.theme === 'light') ? 'dark' : 'light';
        Apply_Theme(PREFS.theme);
        localStorage.setItem('user_prefs', JSON.stringify(PREFS));
    };

    //tasks to do when start button is clicked
    document.getElementById('start_btn').onclick = function() {
        if (Timer_Running == false) {
            Timer_Running = true; 
            start_time = Date.now();//store current time
            tab_switches = 0;
            timer_interval = setInterval(Update_Time, 1000);//to run the timer
            document.getElementById('tab_status').innerHTML = "Tab Switches: 0/3";
            Show_Toast("Timer Started");
        }
    };
 
    //tasks to do when stop button is clicked
    document.getElementById('stop_btn').onclick = function() {
        //stop the timer and call analyze session function
        if (Timer_Running == true) {
            clearInterval(timer_interval); 
            Timer_Running = false;
            Session_Analysis();
        } else {
            Show_Toast("Timer was not running.");
        }
    };

    //tasks to do when "add task button" is clicked
    document.getElementById('add_task_btn').onclick = function() {
        const task_input = document.getElementById('task_input');
        const val = task_input.value;//get the task
        if(val != "") { //push it if task was not empty
            TASKS.push({ text: val, done: false }); 
            document.getElementById('task_input').value = ''; //clear to store next task
            Checkboxes_update(); //calling to show updated to do list
        }
    };

    //tasks to perform when "clear button" is clicked
    document.getElementById('clear_data').onclick = function() {
        if(confirm("Do you want to clear all data? This action can't be reversed.")) { 
            localStorage.removeItem('focus_history'); 
            History_display(); 
            Update_Streak(); 
            History_Analysis();
            Show_Toast("History Cleared");
        }
    };

    document.getElementById('export_csv').onclick = Export_CSV;
    Update_Streak();
};

// allowing user to change dark and light theme
function Apply_Theme(mode) {
    const is_dark = (mode === 'dark');
    const bg_color = is_dark ? "#020617" : "#f8fafc";
    const card_color = is_dark ? "#1e293b" : "#ffffff";
    const text_color = is_dark ? "#f1f5f9" : "#0f172a";
    const border_style = is_dark ? "1px solid #334155" : "1px solid #e2e8f0";

    document.getElementById('main_body').style.backgroundColor = bg_color;
    document.getElementById('main_body').style.color = text_color;

    const cards = ['card_timer', 'card_s1', 'card_s2', 'card_s3', 'card_chart', 'card_settings', 'card_summary', 'dash_stat_card', 'todo_sidebar_card'];
    cards.forEach(id => {
        let el = document.getElementById(id);
        if(el) {
            el.style.backgroundColor = card_color;
            el.style.color = text_color;
            el.style.border = border_style;
            el.style.borderRadius = "24px"; //curving the edges
        }
    });
}

document.addEventListener('visibilitychange', function() {
    //if browser is hidden but timer is running then increase the tab-switches count
    if (document.hidden && Timer_Running) {
        tab_switches++;
        if (tab_switches == 2) {
            alert("Warning: You have switched tabs again. If you switch tab now, the timer will restart.");
        }
        if (tab_switches >= 3) {
            Show_Toast("TIMER IS RESTARTING");
            start_time = Date.now(); 
            tab_switches = 0;
        }
        document.getElementById('tab_status').innerHTML = "Tab Switches: " + tab_switches + "/3";
    }
});

//updating time in each millisecond
function Update_Time() {
    const d = Date.now() - start_time;
    let h = Math.floor(d / 3600000); 
    let m = Math.floor((d % 3600000) / 60000);
    let s = Math.floor((d % 60000) / 1000);
    
    // if number is less than 10 , write zero first
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    
    document.getElementById('timer_display').innerHTML = h + ":" + m + ":" + s;
}

// classifying session productivity based on time
function Session_Analysis() {
    const mins = Math.floor((Date.now() - start_time) / 60000);
    let done_count = TASKS.filter(t => t.done).length;
    let score = TASKS.length > 0 ? Math.round((done_count / TASKS.length) * 100) : 0;

    let label = "Short Session"; 
    if (mins >= PREFS.deep) label = "Focused (Deep Work)";
    else if (mins >= PREFS.avg) label = "Average Session";

    const s = { 
        date: new Date().toLocaleDateString(), 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        duration: mins, score: score, label: label
    };

    const history = JSON.parse(localStorage.getItem('focus_history')) || [];
    history.unshift(s);
    localStorage.setItem('focus_history', JSON.stringify(history));

    show_popup(s, (done_count === TASKS.length && TASKS.length > 0));
    Update_Streak();
}

function History_Analysis() {
    const history = JSON.parse(localStorage.getItem('focus_history')) || [];
    const daily_totals = {};
    const hour_counts = {}; 
    
    //calculating total hours till now
    for (let i = 0; i < history.length; i++) {
        const date = history[i].date;
        if (!daily_totals[date]) {
            daily_totals[date] = 0;
        }
        daily_totals[date] += history[i].duration;

        //peek hour calculation( when user studied the most)
        if (history[i].time && typeof history[i].time === 'string') {
            let hr_part = history[i].time.split(':')[0];
            let parts = history[i].time.split(' ');
            
            let hr_key;
            if (parts.length > 1) {
                hr_key = hr_part + " " + parts[1]; 
            } else {
                hr_key = hr_part + ":00"; 
            }
            
            hour_counts[hr_key] = (hour_counts[hr_key] || 0) + history[i].duration;
        }
    }

    //finding the hour when a student studied the most
    let peak_hr_raw = "--";
    let max_hr_mins = 0;
    for(const hr in hour_counts) {
        if(hour_counts[hr] > max_hr_mins) {
            max_hr_mins = hour_counts[hr];
            peak_hr_raw = hr;
        }
    }

    //converting peek hour into 1 hour string to display
    let display_peak = "--";
    if (peak_hr_raw !== "--") {
        if (peak_hr_raw.includes(":00")) {
            //24-hour formating
            let start = parseInt(peak_hr_raw.split(':')[0]);
            let end = (start + 1) % 24;
            let start_str = start < 10 ? "0" + start : start;
            let end_str = end < 10 ? "0" + end : end;
            display_peak = start_str + ":00 - " + end_str + ":00";
        } else {
            // 12 hours formating
            let bits = peak_hr_raw.split(' ');
            let start = parseInt(bits[0]);
            let am_pm = bits[1];
            let end = start + 1;
            let end_am_pm = am_pm;

            if (start === 11) {
                end_am_pm = (am_pm === "AM") ? "PM" : "AM";
            }
            if (start === 12) {
                end = 1;
            }

            let start_str = start < 10 ? "0" + start : start;
            let end_str = end < 10 ? "0" + end : end;
            display_peak = start_str + " " + am_pm + " - " + end_str + " " + end_am_pm;
        }
    }
    
    //ypdating peek hour display
    document.getElementById('stat_peak').innerHTML = display_peak;

    //updating today and average hour display
    const today_str = new Date().toLocaleDateString();
    const today_mins = daily_totals[today_str] || 0;

    let total_mins_all_time = 0;
    const day_keys = Object.keys(daily_totals);
    for (let j = 0; j < day_keys.length; j++) {
        total_mins_all_time += daily_totals[day_keys[j]];
    }
    const avg_daily_mins = day_keys.length > 0 ? Math.round(total_mins_all_time / day_keys.length) : 0;

    const format_time = function(m) { 
        return m >= 60 ? (m / 60).toFixed(1) + "h" : m + "m"; 
    };

    document.getElementById('stat_total').innerHTML = format_time(today_mins);
    document.getElementById('stat_avg').innerHTML = format_time(avg_daily_mins);

    //bar graph
    const chart_box = document.getElementById('bar_chart_area');
    chart_box.innerHTML = ""; 

    for (let k = 6; k >= 0; k--) {
        const day_to_check = new Date();
        day_to_check.setDate(day_to_check.getDate() - k);
        const day_name = day_to_check.toLocaleDateString('en-US', { weekday: 'short' });
        const study_time = daily_totals[day_to_check.toLocaleDateString()] || 0;

        const new_bar = document.createElement('div');
        new_bar.className = 'val-bar';
        
        //maximum height of bar is 8 hours
        let bar_height = (study_time / 480) * 100;
        if (bar_height > 100) bar_height = 100; 

        new_bar.style.height = bar_height + "%";
        
        const bar_label = document.createElement('div');
        bar_label.className = 'bar-label';
        bar_label.innerText = day_name;

        const bar_container = document.createElement('div');
        bar_container.className = 'bar_container';
        bar_container.appendChild(new_bar);
        bar_container.appendChild(bar_label);
        chart_box.appendChild(bar_container);
    }
}

// history portion(storing history along with time and task completition success percentage)
function History_display() {
    const log = document.getElementById('history_log');
    const history = JSON.parse(localStorage.getItem('focus_history')) || [];
    log.innerHTML = "";
    
    history.forEach(s => {
        const card = document.createElement('div');
        card.className = "history_flex_item";
        card.innerHTML = `
            <div class="flex_main">
                <strong>${s.date}</strong>
                <small>${s.time}</small>
            </div>
            <div class="flex_stats">
                <span>${s.duration}m</span>
                <strong style="color:#6366f1;">${s.score}%</strong>
            </div>
        `;
        log.appendChild(card);
    });
}

//popup
function Show_Toast(msg) {
    const container = document.getElementById('toast_container');
    const toast = document.createElement('div');
    toast.style = "background: #0f172a; color: white; padding: 12px 20px; border-radius: 8px; margin-top: 10px; font-weight: bold; border-left: 4px solid #6366f1;";
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

//allowing student to download the history in csv form
function Export_CSV() {
    const history = JSON.parse(localStorage.getItem('focus_history')) || [];
    let csv = "Date,Duration,Score,Label\n";
    history.forEach(s => {
        csv += s.date + "," + s.duration + "," + s.score + "," + s.label + "\n";
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "FocusFlow_History.csv";
    a.click();
}

// main page display
function Display_of_page(view) {
    document.getElementById('dashboard_view').style.display = 'none';
    document.getElementById('analysis_view').style.display = 'none';
    document.getElementById('history_view').style.display = 'none';
    
    document.getElementById('btn_dash').className = 'nav-btn';
    document.getElementById('btn_analysis').className = 'nav-btn';
    document.getElementById('btn_hist').className = 'nav-btn';
    document.getElementById('btn_settings').className = 'nav-btn';

    if (view === 'dash') {
        document.getElementById('dashboard_view').style.display = 'block';
        document.getElementById('btn_dash').className = 'nav-btn active';
    } else if (view === 'analysis') {
        document.getElementById('analysis_view').style.display = 'block';
        document.getElementById('btn_analysis').className = 'nav-btn active';
        History_Analysis(); 
    } else {
        document.getElementById('history_view').style.display = 'block';
        document.getElementById('btn_hist').className = 'nav-btn active';
        History_display();
    }
}

// to do list checkboxes
function Checkboxes_update() {
    const list = document.getElementById('session_tasks');
    list.innerHTML = "";
    for (let i = 0; i < TASKS.length; i++) {
        const li = document.createElement('li');
        const task = TASKS[i];
        const strike = task.done ? 'text-decoration: line-through; color: #94a3b8;' : '';
        li.innerHTML = '<input type="checkbox" ' + (task.done ? 'checked' : '') + ' id="check-' + i + '">';
        li.innerHTML += '<span style="font-weight:600; ' + strike + '">' + task.text + '</span>';
        list.appendChild(li);
        
        document.getElementById('check-' + i).onchange = (function(index) {
            return function() {
                TASKS[index].done = this.checked;
                Checkboxes_update();
            };
        })(i);
    }
}

//popup summary after completion or stopping the timer
function show_popup(s, perfect) {
    document.getElementById('modal_overlay').style.display = 'flex';
    setTimeout(function() { 
        document.getElementById('score_fill').style.width = s.score + "%"; 
    }, 50);
    document.getElementById('celeb_header').innerHTML = perfect ? "<h3 style='color: #22c55e;'>CONGRATULATIONS!🏆All Tasks Completed.</h3>" : "";
    document.getElementById('summary_report').innerHTML = "Rank: " + s.label + "<br>Score: " + s.score + "%";
}

//updating streaks based on how consistent the student is.....
function Update_Streak() {
    const h = JSON.parse(localStorage.getItem('focus_history')) || [];
    const unique_dates = [];
    for (let i = 0; i < h.length; i++) {
        if (unique_dates.indexOf(h[i].date) === -1) {
            unique_dates.push(h[i].date);
        }
    }
    document.getElementById('streak_days').innerHTML = unique_dates.length;
}

// closing the popup summary
function close_popup() { 
    document.getElementById('modal_overlay').style.display = 'none'; 
    document.getElementById('timer_display').innerHTML = "00:00:00"; 
    TASKS = []; 
    document.getElementById('task_input').value = '';    
    Checkboxes_update(); 
    Display_of_page('dash'); 
}