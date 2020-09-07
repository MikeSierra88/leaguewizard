window.onloadCallback = function() {
    // grecaptcha.render('g-recaptcha-container', {
    //     'sitekey' : "6Ld-B7gZAAAAAJet4uF8KxO8kkHIzGey29bfU7qE"
    // });
    if (grecaptcha.getResponse() === "") {
        $('#loginbtn').attr('disabled', true);
        $('#loginForm').off('submit');
        $('#loginForm').on('submit', function(event) {
                event.preventDefault();
                $("#danger-alert-text").text("Please complete the reCAPTCHA!");
                $("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                $("#danger-alert").slideUp(500);
            });
        });
    } else {
        $('#loginbtn').attr('disabled', false);
        $('#loginForm').off('submit');
        $('#loginForm').on('submit', function(event) {
            event.preventDefault();
            $.ajax({
                type: "POST",
                url: "/login",
                data: $('#loginForm').serialize(),
                success: function(result) {
                    window.location = "/dashboard";
                },
                error: function(err) {
                        var errorText;
                        if (err.status == "422") {
                            errorText = "Invalid username or password format";
                        } else {
                            errorText = "Login failed. Please re-enter your username and password, then complete the reCAPTCHA." ;  
                        }
                        $("#danger-alert-text").text(errorText);
                        $("#danger-alert").fadeTo(2000, 500).slideUp(500, function() {
                        $("#danger-alert").slideUp(500);
                    });
                }
            });
        });
    }
    

};