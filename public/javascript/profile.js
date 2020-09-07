'use strict';
$(document).ready(function(){
    var $pwRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,64}$/;
    
    $('#oldPassword').on('keyup', function() {
        console.log("Check");
        if ( $('#oldPassword').val().match($pwRegex) ) {
            $('#oldPassword').removeClass('is-invalid');
            $('#oldPassword').addClass('is-valid');
        } else {
            $('#oldPassword').removeClass('is-valid');
            $('#oldPassword').addClass('is-invalid');
        }
    });
    
    $('#newPassword').on('keyup', function() {
        if ( $('#newPassword').val().match($pwRegex) ) {
            $('#newPassword').removeClass('is-invalid');
            $('#newPassword').addClass('is-valid');
        } else {
            $('#newPassword').removeClass('is-valid');
            $('#newPassword').addClass('is-invalid');
        }
    });
    
    $('#confirmNewPassword').on('keyup', function() {
        // console.log('Conf PW value: ' +  $('#confirmNewPassword').val())
        if ( $('#confirmNewPassword').val().length != 0 && $('#newPassword').val().length != 0
         &&  $('#confirmNewPassword').val() == $('#newPassword').val() ) {
            $('#confirmNewPassword').removeClass('is-invalid');
            $('#confirmNewPassword').addClass('is-valid');
        } else {
            $('#confirmNewPassword').removeClass('is-valid');
            $('#confirmNewPassword').addClass('is-invalid');
        }
        
    });
    
    $('#oldPassword, #newPassword, #confirmNewPassword').keyup(function() {
        var isValid = true;
        $('#oldPassword, #newPassword, #confirmNewPassword').each(function() {
           if  (this.classList.contains('is-invalid') || this.value.length < 8) {
              isValid = false;
           }
        });
        $('#changePasswordSubmitButton').attr('disabled', !isValid);
    });
    
    $('#changePasswordForm').on('submit', function(event) {
        if ( !($('#changePasswordForm')[0].checkValidity()) ) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            $('#changePasswordSubmitButton').attr('disabled', false);
            $('#changePasswordForm').addClass('was-validated');
        }
        
        
    });
    
    $('#inviteEmailForm').submit(function(event) {
       
       // prevent default submit
       event.preventDefault();
       // Execute AJAX POST
       ajaxPostInvite();
        
    });
    function ajaxPostInvite() {
        // FORM DATA
        var formData = {
            inviteEmail: $('#inviteEmail').val()
        }
        
        // AJAX POST
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/send-invite",
            data: JSON.stringify(formData),
            dataType: "json",
            success: function(result) {
                $('#inviteEmailFeedback').text('Invitation Email Sent');
                $('#inviteEmailFeedback').fadeIn('fast')
                setTimeout(function() {
                    $('#inviteEmailFeedback').fadeOut('slow')
                }, 3000);
            },
            error: function(err) {
                console.log(err);
            }
        });
        
        resetInviteForm();
    }
    
    function resetInviteForm() {
        $('#inviteEmail').val('');
    }
});