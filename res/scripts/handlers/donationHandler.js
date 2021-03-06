$.checkerstorepath = $.inidb.get('settings','checker_storepath');
if ($.checkerstorepath == null || $.checkerstorepath == "" || $.strlen($.checkerstorepath) == 0) {
    $.checkerstorepath = "addons/donationchecker/latestdonation.txt";
}

$.donation_toggle = $.inidb.get('settings','donation_toggle');
if ($.donation_toggle == null || $.donation_toggle == "" || $.strlen($.donation_toggle) == 0) {
    $.donation_toggle = 1;
}

$.on('command', function (event) {
    var sender = event.getSender();
    var command = event.getCommand();
    var args = event.getArgs();
    var argsString = event.getArguments().trim();
    
    if (argsString.isEmpty()) {
        args = [];
    } else {
        args = argsString.split(" ");
    }
    
    if (command.equalsIgnoreCase("donationalert")) {
        if (!$.isAdmin(sender)) { // added this check so people can't spam the usage.
            $.say($.getWhisperString(sender) + $.adminmsg);
            return;
        } 

        var action = args[0];

        if (args.length == 0) { // added usage
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.donationhandler.donationalert-usage"));
            return;
        }
        
        if (action.equalsIgnoreCase("filepath")) {
            if (!$.isAdmin(sender)) {
                $.say($.getWhisperString(sender) + $.adminmsg);
                return;
            }
            
            if (args[1].equalsIgnoreCase('viewfilepath')) {
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.donationhandler.current-file-path", $.checkerstorepath));
                return;
            }
            
            while (args[1].indexOf('\\') != -1 && !args[1].equalsIgnoreCase('viewfilepath') && args[1] != "" && args[1] != null) {
                args[1] = args[1].replace('\\', '/');
            }
            
            $.inidb.set('settings','checker_storepath', args[1]);
            $.checkerstorepath = args[1];
            $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.donationhandler.new-file-path-set"));
            return;
        }

        if (action.equalsIgnoreCase("toggle")) {
            if ($.donation_toggle == 1) {
                $.inidb.set('settings','donation_toggle', 0);
                $.donation_toggle = 0;
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.donationhandler.donation-toggle-off"));
                return;
            } else {
                $.inidb.set('settings','donation_toggle', 1);
                $.donation_toggle = 1;
                $.say($.getWhisperString(sender) + $.lang.get("net.phantombot.donationhandler.donation-toggle-on"));
                return;
            }
        }
    }
});

//Q: why is there a timeout delay here before a timer? seems redundant no?
//A: the timeout sets a delay to start the timer, otherwise the timer won't detect if a module is disabled (because it hasnt loaded in yet)
setTimeout(function(){ 
    if ($.moduleEnabled("./handlers/donationHandler.js")) {
        $.timer.addTimer("./handlers/donationHandler.js", "currdonation", true, function() {
            $var.currDonation = $.readFile($.checkerstorepath);
            if ($var.currDonation.toString() != $.inidb.get("settings", "lastdonation")) {
                if ($var.currDonation.toString() != null || $var.currDonation.toString() != "") {
                    $.inidb.set("settings", "lastdonation", $.readFile($.checkerstorepath));
                    if ($.donation_toggle == 1) {
                        $.say($.username.resolve($.ownerName) + $.lang.get("net.phantombot.donationhandler.new-donation", $.readFile($.checkerstorepath)));
                        return;
                    } else if ($.donation_toggle == 0) {
                        $.say($.username.resolve($.ownerName) + $.lang.get("net.phantombot.donationhandler.new-donation", $.readFile($.checkerstorepath)));
                        return;
                    }
                }
            }
        }, 10 * 1000);
    }
    $.registerChatCommand("./handlers/donationHandler.js", "donationalert", "mod");
}, 10 * 1000);
