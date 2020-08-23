'use strict';
$(document).ready(function(){
    var $pwRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,64}$/;
    
    $('#password').on('keyup', function() {
        if ( $('#password').val().match($pwRegex) ) {
            $('#password').removeClass('is-invalid');
            $('#password').addClass('is-valid');
        } else {
            $('#password').removeClass('is-valid');
            $('#password').addClass('is-invalid');
        }
    });
    
    $('#confirmPassword').on('keyup', function() {
        // console.log('Conf PW value: ' +  $('#confirmNewPassword').val())
        if ( $('#confirmPassword').val().length != 0 && $('#password').val().length != 0
         &&  $('#confirmPassword').val() == $('#password').val() ) {
            $('#confirmPassword').removeClass('is-invalid');
            $('#confirmPassword').addClass('is-valid');
        } else {
            $('#confirmPassword').removeClass('is-valid');
            $('#confirmPassword').addClass('is-invalid');
        }
    });
    
    $('#playername').on('keyup', function() {
       if ($('#playername').val().length < 3) {
           $('#playername').addClass('is-invalid');
           $('#playername').removeClass('is-valid');
       } else {
           $('#playername').addClass('is-valid');
           $('#playername').removeClass('is-invalid');
       }
    });
    
    $('#password, #confirmPassword, #playername').keyup(function() {
        var isValid = true;
        $('#password, #confirmPassword').each(function() {
           if  (this.classList.contains('is-invalid') || this.value.length < 8) {
              isValid = false;
           }
        });
        if ( $('#playername').val().length < 3 ) {
            isValid = false;
        }
        $('#registerButton').attr('disabled', !isValid);
    });
    
    $('#registerForm').on('submit', function(event) {
        if ( !($('#changePasswordForm')[0].checkValidity()) ) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            $('#registerButton').attr('disabled', false);
            $('#changePasswordForm').addClass('was-validated');
        }
    });
    
});