$(function () {

	$('#contact-form').validity({
		debug: true,
		ajax: true,
		action: 'mail.php',
		// language: 'en',
		// show_names: false,
		inputMsg: {
			errorBox: {
				className: 'error-box',
				parent: 'auto',
			},
		},
		rules: {
			'captcha': function(val) {
				return {status: true}
			}
		},
		detectIntervention: true,
	});

});

