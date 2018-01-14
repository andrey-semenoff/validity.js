$(function () {

	$('#contact-form').validity({
		ajax: true,
		// language: 'en',
		// show_names: false,
		position: 'absolute|top[50%]/right[2px]/transform[translateY(-50%)]',
		tooltip: 'validity-tooltip_left',
		// tooltip: false,
		tooltipPos: 'right[100%]/top[50%]/transform[translateY(-50%)]',
		// inputStyle: false,
		rules: {
			'captcha': function(val) {
				return {status: true}
			}
		},
		detectIntervention: false,
	});

});

